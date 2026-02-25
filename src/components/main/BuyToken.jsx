import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import copySoundFile from "../../assets/img/sound/sound.mp3";

import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import idl from "../../idl/referral_token.json";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { FaRegCopy } from "react-icons/fa";

const PROGRAM_ID = new PublicKey(idl.address);
const PROJECT_MINT = new PublicKey(
  "7gWKE7LyxPuZr6eXbpc8idGVADYkk4Ypiohobb97z38J",
);
const USDT_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const FIXED_RECEIVER_USDT_ATA = new PublicKey(
  "Ans12FY6qVF5RX4kgafcmv6J6i2g5NL2qk4T2BUFCv23",
);

const CONTRACT_ADDRESS = "7gWKE7LyxPuZr6eXbpc8idGVADYkk4Ypiohobb97z38J";
const DEFAULT_REFERRAL = "BoA81LeZ5iTGBspJKVZ42cgGb85oUEo382xoca2XNH95";
const TOKEN_PRICE_USDT = 0.001;
const USDT_DECIMALS = 6;
const TOKEN_DECIMALS = 6;
const REFERRAL_PERCENT = 5;
const PRICE_USDT_MICRO_PER_TOKEN = 1000n;


const [CONFIG] = PublicKey.findProgramAddressSync(
  [Buffer.from("config_v2")],
  PROGRAM_ID,
);

const [VAULT_AUTHORITY] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault")],
  PROGRAM_ID,
);

const VAULT_TOKEN = getAssociatedTokenAddressSync(
  PROJECT_MINT,
  VAULT_AUTHORITY,
  true,
);

const DEFAULT_RPC_ENDPOINTS = [
  "https://go.getblock.us/0c7ba136b3f241e5a599f4b120616970",
];

const configuredRpcEndpoints = (
  import.meta.env.VITE_SOLANA_RPC_URLS ||
  import.meta.env.VITE_SOLANA_RPC_URL ||
  ""
)
  .split(",")
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);

const RPC_ENDPOINTS = [...configuredRpcEndpoints, ...DEFAULT_RPC_ENDPOINTS]
  .filter((endpoint, index, endpoints) => endpoints.indexOf(endpoint) === index)
  .filter(Boolean);

const rpcConnections = RPC_ENDPOINTS.map(
  (endpoint) => new Connection(endpoint, "confirmed"),
);

function isForbiddenRpcError(error) {
  const message = (error?.message || "").toLowerCase();
  return (
    message.includes("403") ||
    message.includes("forbidden") ||
    message.includes("api key is not allowed")
  );
}

function isRetryableRpcError(error) {
  const message = (error?.message || "").toLowerCase();
  return (
    isForbiddenRpcError(error) ||
    message.includes("429") ||
    message.includes("503") ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("timeout")
  );
}

async function withRpcFallback(operation) {
  let lastError;
  let lastEndpoint = "";

  for (const rpcConnection of rpcConnections) {
    try {
      lastEndpoint = rpcConnection.rpcEndpoint;
      return await operation(rpcConnection);
    } catch (error) {
      lastError = error;
      if (!isRetryableRpcError(error)) {
        throw error;
      }
    }
  }

  if (!lastError) {
    throw new Error("No RPC endpoint configured");
  }

  throw new Error(
    `RPC failed on ${lastEndpoint}: ${lastError.message || String(lastError)}`,
  );
}

function formatAmount(rawValue, decimals) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return "-";
  }
  return (parsed / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

function readU64LeAsString(accountData, offset) {
  if (!accountData || accountData.length < offset + 8) {
    return "0";
  }

  const view = new DataView(
    accountData.buffer,
    accountData.byteOffset,
    accountData.byteLength,
  );
  return view.getBigUint64(offset, true).toString();
}

export default function BuyToken() {
  const wallet = useWallet();
  const buttonRef = useRef(null);
  const audioRef = useRef(null);

  const [copyText, setCopyText] = useState("Copy");
 const [showToast, setShowToast] = useState("");
  const [usdtAmountInput, setUsdtAmountInput] = useState("1");
  const [referralAddressInput, setReferralAddressInput] =
    useState(DEFAULT_REFERRAL);
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    buyerUsdtRaw: "0",
    vaultTokenRaw: "0",
    totalBuyerTokensSoldRaw: "0",
    totalReferralTokensSoldRaw: "0",
  });

  const walletKey = wallet.publicKey?.toBase58();
  const usdtToPay = Number(usdtAmountInput || "0");
  const usdtAmountRaw = BigInt(
    Math.max(0, Math.round(usdtToPay * 10 ** USDT_DECIMALS)),
  );
  const totalTokenEstimate = Number.isFinite(usdtToPay)
    ? usdtToPay / TOKEN_PRICE_USDT
    : 0;
  const referralTokenEstimate = Number.isFinite(totalTokenEstimate)
    ? (totalTokenEstimate * REFERRAL_PERCENT) / 100
    : 0;
  const buyerTokenEstimate = Number.isFinite(totalTokenEstimate)
    ? totalTokenEstimate - referralTokenEstimate
    : 0;
  const tokenPerUsdt = 1 / TOKEN_PRICE_USDT;
  const referralLink =
    walletKey && typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(walletKey)}`
      : "";
  const totalTokensSoldRaw = (
    BigInt(status.totalBuyerTokensSoldRaw || "0") +
    BigInt(status.totalReferralTokensSoldRaw || "0")
  ).toString();

  const triggerButtonConfetti = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      origin: { x, y },
      particleCount: 150,
      spread: 80,
      startVelocity: 30,
      gravity: 0.8,
      scalar: 0.8,
      colors: [
        "#cddc39",
        "#d704d0",
        "#7711f4",
        "#78f40b",
        "#f40b3a",
        "#f4c20b",
      ],
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  };

  const copyReferralLink = async () => {
    if (!referralLink) {
      toast.error("Connect wallet to generate referral link");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied");
    } catch {
      toast.error("Failed to copy referral link");
    }
  };

  const refreshStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: "" }));

      const {
        buyerUsdtRaw,
        vaultTokenRaw,
        totalBuyerTokensSoldRaw,
        totalReferralTokensSoldRaw,
      } = await withRpcFallback(async (activeConnection) => {
        let totalBuyerTokensSoldRaw = "0";
        let totalReferralTokensSoldRaw = "0";
        try {
          const configInfo = await activeConnection.getAccountInfo(
            CONFIG,
            "confirmed",
          );
          totalBuyerTokensSoldRaw = readU64LeAsString(configInfo?.data, 146);
          totalReferralTokensSoldRaw = readU64LeAsString(configInfo?.data, 154);
        } catch {
          totalBuyerTokensSoldRaw = "0";
          totalReferralTokensSoldRaw = "0";
        }

        let vaultTokenRaw = "0";
        try {
          vaultTokenRaw = (
            await activeConnection.getTokenAccountBalance(VAULT_TOKEN)
          ).value.amount;
        } catch {
          vaultTokenRaw = "0";
        }

        if (!wallet.publicKey) {
          return {
            buyerUsdtRaw: "0",
            vaultTokenRaw,
            totalBuyerTokensSoldRaw,
            totalReferralTokensSoldRaw,
          };
        }

        const buyerUsdt = await getAssociatedTokenAddress(
          USDT_MINT,
          wallet.publicKey,
        );

        let buyerUsdtRaw = "0";
        try {
          buyerUsdtRaw = (
            await activeConnection.getTokenAccountBalance(buyerUsdt)
          ).value.amount;
        } catch {
          buyerUsdtRaw = "0";
        }

        return {
          buyerUsdtRaw,
          vaultTokenRaw,
          totalBuyerTokensSoldRaw,
          totalReferralTokensSoldRaw,
        };
      });

      if (!wallet.publicKey) {
        setStatus({
          loading: false,
          error: "Connect wallet to see buyer balance",
          buyerUsdtRaw,
          vaultTokenRaw,
          totalBuyerTokensSoldRaw,
          totalReferralTokensSoldRaw,
        });
        return;
      }

      setStatus({
        loading: false,
        error: "",
        buyerUsdtRaw,
        vaultTokenRaw,
        totalBuyerTokensSoldRaw,
        totalReferralTokensSoldRaw,
      });
    } catch (error) {
      const message = error?.message || "Failed to fetch status";
      const rpcError =
        message.includes("403") || message.toLowerCase().includes("forbidden");
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: rpcError
          ? `RPC endpoints blocked (${RPC_ENDPOINTS.join(", ")}). Set VITE_SOLANA_RPC_URL in frontend/.env to a working mainnet RPC.`
          : message,
      }));
    }
  };

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const referralFromLink =
      params.get("ref") || params.get("referral") || params.get("r");

    if (!referralFromLink) {
      return;
    }

    try {
      const referralPk = new PublicKey(referralFromLink.trim());
      if (!PublicKey.isOnCurve(referralPk.toBuffer())) {
        return;
      }

      setReferralAddressInput(referralPk.toBase58());
      setIsReferralLocked(true);
    } catch {
      // ignore invalid referral in URL
    }
  }, []);

  useEffect(() => {
    if (
      !isReferralLocked &&
      wallet.publicKey &&
      referralAddressInput === DEFAULT_REFERRAL
    ) {
      setReferralAddressInput(wallet.publicKey.toBase58());
    }
  }, [wallet.publicKey, referralAddressInput, isReferralLocked]);

  const buyTokens = async () => {
    let loadingToast;
    try {
      if (!wallet.publicKey) {
        toast.error("Please connect wallet first");
        return;
      }

      loadingToast = toast.loading("Processing transaction...");

      let referralWallet;
      try {
        referralWallet = new PublicKey(referralAddressInput.trim());
      } catch {
        throw new Error("Enter a valid referral wallet address");
      }

      const referralAccountInfo = await rpcConnections[0].getAccountInfo(
        referralWallet,
        "confirmed",
      );
      if (
        referralAccountInfo &&
        !referralAccountInfo.owner.equals(SystemProgram.programId)
      ) {
        throw new Error(
          "Referral must be a wallet address, not a token/account address",
        );
      }

      if (!PublicKey.isOnCurve(referralWallet.toBuffer())) {
        throw new Error(
          "Referral address must be a normal wallet address (not PDA)",
        );
      }

      if (!Number.isFinite(usdtToPay) || usdtToPay <= 0) {
        throw new Error("Enter a valid USDT amount greater than 0");
      }

      if (usdtAmountRaw <= 0n) {
        throw new Error("USDT payable is too small. Increase token amount.");
      }
      const adminUsdt = FIXED_RECEIVER_USDT_ATA;

      const buyerUsdt = await getAssociatedTokenAddress(
        USDT_MINT,
        wallet.publicKey,
      );
      const buyerToken = await getAssociatedTokenAddress(
        PROJECT_MINT,
        wallet.publicKey,
      );
      const sponsorToken = await getAssociatedTokenAddress(
        PROJECT_MINT,
        referralWallet,
      );

      if (!wallet.signTransaction) {
        throw new Error("Wallet does not support signing transactions");
      }

      const { sig } = await withRpcFallback(async (activeConnection) => {
        const provider = new anchor.AnchorProvider(activeConnection, wallet, {
          commitment: "confirmed",
        });
        const program = new anchor.Program(idl, provider);

        const tx = new Transaction();

        const [buyerTokenInfo, sponsorTokenInfo] =
          await activeConnection.getMultipleAccountsInfo([
            buyerToken,
            sponsorToken,
          ]);

        const sameSponsorAsBuyer = buyerToken.equals(sponsorToken);

        if (!buyerTokenInfo) {
          tx.add(
            createAssociatedTokenAccountIdempotentInstruction(
              wallet.publicKey,
              buyerToken,
              wallet.publicKey,
              PROJECT_MINT,
            ),
          );
        }

        if (!sameSponsorAsBuyer && !sponsorTokenInfo) {
          tx.add(
            createAssociatedTokenAccountIdempotentInstruction(
              wallet.publicKey,
              sponsorToken,
              referralWallet,
              PROJECT_MINT,
            ),
          );
        }

        const ix = await program.methods
          .buy(new anchor.BN(usdtAmountRaw.toString()))
          .accountsStrict({
            buyer: wallet.publicKey,
            config: CONFIG,
            sponsor: referralWallet,
            buyerUsdt,
            adminUsdt,
            buyerToken,
            sponsorToken,
            vaultToken: VAULT_TOKEN,
            vaultAuthority: VAULT_AUTHORITY,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        tx.add(ix);
        tx.feePayer = wallet.publicKey;

        const latestBlockhash =
          await activeConnection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = latestBlockhash.blockhash;

        const signedTx = await wallet.signTransaction(tx);

        const sig = await activeConnection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          },
        );

        await activeConnection.confirmTransaction(
          {
            signature: sig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed",
        );

        return { sig };
      });

      if (loadingToast) {
        toast.dismiss(loadingToast);
        loadingToast = undefined;
      }

      refreshStatus();
      toast.success(
        <div>
          <b>Buy Successful 🎉</b>
          <br />
          Tx: {sig.slice(0, 8)}...{sig.slice(-8)}
        </div>,
      );
      triggerButtonConfetti();
    } catch (error) {
      toast.dismiss(loadingToast);
      const nestedError = error?.error || error?.cause;
      const nestedLogs =
        nestedError?.logs || nestedError?.transactionLogs || [];
      const directLogs = error?.logs || error?.transactionLogs || [];
      const detailed =
        nestedError?.message ||
        error?.transactionMessage ||
        error?.message ||
        (nestedLogs.length > 0 ? nestedLogs[nestedLogs.length - 1] : "") ||
        (directLogs.length > 0 ? directLogs[directLogs.length - 1] : "") ||
        "Transaction Failed";
      toast.error(detailed);
      console.error("BUY ERROR:", error);
      if (nestedLogs.length > 0) {
        console.error("BUY ERROR LOGS:", nestedLogs);
      } else if (directLogs.length > 0) {
        console.error("BUY ERROR LOGS:", directLogs);
      }
    } finally {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
    }
  };

  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin + "/ref/";

  const handleCopy = async () => {
    try {

      const fullUrl = baseUrl + referralAddressInput;

      await navigator.clipboard.writeText(fullUrl);
      // await navigator.clipboard.writeText(referralAddressInput);

      // window.open(referralAddressInput, "_blank");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Referral link copied!");
    } catch (err) {
      toast.error("Copy failed")
      console.error("Copy failed", err);
    }
  };


  const handleContractCopy = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);

    // Play sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    setCopyText("Copied");
    setShowToast("show");

    setTimeout(() => {
      setCopyText("Copy");
      setShowToast("");
    }, 2000);
  };
  return (
    <>
      <section id="buy-token" className="benefit pt-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title text-center mb-70">
                <h2 className="title">Buy Token</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Buy LOL Token</h3>
                <p>
                  Buy LOL tokens easily on Solana mainnet using your connected
                  wallet.
                </p>
              </div>

              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Contract Address</h3>
                <p className="mb-3">
                  Always use official program and mint addresses to avoid fake
                  token scams.
                </p>
                 <div className="token_copy_board">
               

                <span className="code">
                   {/* Contract Address: */}
                  <mark className="text-con">{CONTRACT_ADDRESS}</mark>
                </span>

                <audio ref={audioRef}>
                  <source src={copySoundFile} type="audio/mpeg" />
                </audio>

                <button
                  className="copy_btn"
                  type="button"
                  onClick={handleContractCopy}
                >
                  {copyText}
                </button>
              </div>
              </div>
          
              <div className="col-md-12 mb-4 benefit-picss ">
                <div className="status-card w-100">
                  <div>
                    <b>Your USDT Balance:</b>{" "}
                    <span>
                      {formatAmount(status.buyerUsdtRaw, USDT_DECIMALS)} USDT
                    </span>
                  </div>
                  <div>
                    <b>Vault LOL Balance:</b>{" "}
                    <span className="text-aura">
                      {formatAmount(status.vaultTokenRaw, TOKEN_DECIMALS)} LOL
                    </span>
                  </div>
                  <div>
                    <b>Total Tokens Sold (Buyer + Referral):</b>{" "}
                    <span className="text-gas">
                      {formatAmount(totalTokensSoldRaw, TOKEN_DECIMALS)} LOL
                    </span>
                  </div>

                  {status.error && (
                    <div className="error-text">{status.error}</div>
                  )}

                  <div className="text-start mt-4">
                    <button
                      className="refresh-btn-pro"
                      onClick={refreshStatus}
                      disabled={status.loading}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      {status.loading ? "Refreshing..." : " Refresh Status"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="buy-section">
                <div className="buy-container">
                  <div className="toggle-container">
                    <button className="toggle-btn active">Buy Token</button>
                  </div>
                  <div className="buy-card">
                    <div className="buy-row">
                      <span>Token Price</span>
                      <span>1 Token = {TOKEN_PRICE_USDT} USDT</span>
                    </div>

                    <div className="buy-row">
                      <span>Conversion</span>
                      <span>1 USDT = {tokenPerUsdt.toFixed(2)} LOL</span>
                    </div>

                    <div className="buy-input-group">
                      <label>USDT Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={usdtAmountInput}
                        onChange={(e) => setUsdtAmountInput(e.target.value)}
                      />
                    </div>

                    <div className="buy-row">
                      <span>USDT to Pay</span>
                      <span>{usdtToPay.toFixed(6)} USDT</span>
                    </div>

                    <div className="buy-row">
                      <span>You Receive (Total LOL)</span>
                      <span>{totalTokenEstimate.toFixed(6)} LOL</span>
                    </div>

                    <div className="buy-row">
                      <span>Referral %</span>
                      <span>{REFERRAL_PERCENT}%</span>
                    </div>

                    <div className="buy-row">
                      <span>Estimated Buyer Tokens</span>
                      <span className="text-gas">
                        {buyerTokenEstimate.toFixed(6)}
                      </span>
                    </div>

                    <div className="buy-row">
                      <span>Estimated Referral Tokens</span>
                      <span className="text-gas">
                        {referralTokenEstimate.toFixed(6)}
                      </span>
                    </div>

                    <div className="buy-row">
                      <span>Total Tokens (Buyer + Referral)</span>
                      <span className="text-gas">
                        {totalTokenEstimate.toFixed(6)}
                      </span>
                    </div>

                    <div className="buy-input-group w-100">
                      <label>Referral Wallet Address</label>
                      <input
                        type="text"
                        value={referralAddressInput}
                        disabled={isReferralLocked}
                        onChange={(e) =>
                          setReferralAddressInput(e.target.value)
                        }
                      />
                    </div>

                    {isReferralLocked && (
                      <div className="buy-row">
                        <span>Referral Source</span>
                        <span>Locked from referral link</span>
                      </div>
                    )}

                    <div className="buy-input-group">
                      <label>Your Referral Link</label>
                      <input type="text" value={referralLink} readOnly />
                    </div>

                    <div className="text-start mb-3">
                      <button
                        className="refresh-btn-pro"
                        onClick={copyReferralLink}
                      >
                        <i className="fas fa-copy me-2"></i>
                        Copy Referral Link
                      </button>
                    </div>

                    <button
                      className="buy-btn"
                      ref={buttonRef}
                      onClick={buyTokens}
                    >
                      BUY TOKENS
                    </button>
                  </div>
                </div>
              </div>
            </div>

          
          </div>
        </div>
      </section>

        <div id="toast" className={`custom-toast ${showToast}`}>
          Copied to clipboard!
        </div>
    </>
  );
}
