import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import {
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import idl from '../../idl/referral_token.json'
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';

// =========================
// CONSTANTS
// =========================

const PROGRAM_ID = new PublicKey("wQwUHwJYmJoY1Xc6csP2KsFGNvLLCNDtxYx1oa1UEqK");

const PROJECT_MINT = new PublicKey(
  "6E8xCUFyJK1ErNPSM7MeUFvpy625KcdGN42PBmKRef89",
);

const USDT_MINT = new PublicKey("A53WggT1EnBBY59Qtb2iT8JW5d7iWK5iCWede9t3RSh1");

const ADMIN_USDT = new PublicKey(
  "6GcaoF94FCY7ei6NHenMrT4hKU8orHJDyDcVSFdYaDT4",
);

const DEFAULT_REFERRAL = "BoA81LeZ5iTGBspJKVZ42cgGb85oUEo382xoca2XNH95";

const TOKEN_PRICE_USDT = 0.001;
const USDT_DECIMALS = 6;
const REFERRAL_PERCENT = 5;

const [CONFIG] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
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

const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed",
);

// =========================
// COMPONENT
// =========================

export default function BuyToken() {

  const wallet = useWallet();
  const [tokenAmountInput, setTokenAmountInput] = useState("100");
  const [referralAddressInput, setReferralAddressInput] =
    useState(DEFAULT_REFERRAL);
  const buttonRef = useRef(null);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    buyerUsdtRaw: "-",
    vaultTokenRaw: "-",
  });

  const tokenAmount = Number(tokenAmountInput || "0");
  const usdtToPay = Number.isFinite(tokenAmount)
    ? tokenAmount * TOKEN_PRICE_USDT
    : 0;

  const usdtAmountRaw = BigInt(
    Math.max(0, Math.round(usdtToPay * 10 ** USDT_DECIMALS)),
  );

  const referralTokenEstimate = Number.isFinite(tokenAmount)
    ? (tokenAmount * REFERRAL_PERCENT) / 100
    : 0;

  const refreshStatus = async () => {
    try {
      setStatus((s) => ({ ...s, loading: true, error: "" }));

      if (!wallet.publicKey) {
        setStatus({
          loading: false,
          error: "Connect wallet to see buyer USDT balance",
          buyerUsdtRaw: "-",
          vaultTokenRaw: "-",
        });
        return;
      }

      const buyerUsdt = await getAssociatedTokenAddress(
        USDT_MINT,
        wallet.publicKey,
      );

      const buyerUsdtInfo = await connection.getAccountInfo(buyerUsdt);
      const vaultInfo = await connection.getAccountInfo(VAULT_TOKEN);

      const buyerUsdtRaw = buyerUsdtInfo
        ? (await connection.getTokenAccountBalance(buyerUsdt)).value.amount
        : "0";

      const vaultTokenRaw = vaultInfo
        ? (await connection.getTokenAccountBalance(VAULT_TOKEN)).value.amount
        : "0";

      setStatus({
        loading: false,
        error: "",
        buyerUsdtRaw,
        vaultTokenRaw,
      });
    } catch (e) {
      setStatus({
        loading: false,
        error: e?.message || "Failed to fetch status",
        buyerUsdtRaw: "-",
        vaultTokenRaw: "-",
      });
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [wallet.publicKey?.toBase58()]);


  const triggerButtonConfetti = () => {
    if (buttonRef.current) {
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
        colors: ['#cddc39', '#d704d0', '#7711f4', '#78f40b', '#f40b3a', '#f4c20b'],
        zIndex: 9999,
        disableForReducedMotion: true
      });
    }
  };

  const buyTokens = async () => {
    let loadingToast;
    try {
      if (!wallet.publicKey) {
        toast.error("Please connect wallet first");
        return;
      }

      loadingToast = toast.loading("Processing transaction...");

      console.log("Buyer:", wallet.publicKey.toBase58());

      const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });

      const program = new anchor.Program(idl, provider);

      // =========================
      // PDAs (IMPORTANT)
      // =========================

      console.log("CONFIG:", CONFIG.toBase58());
      console.log("VAULT AUTH:", VAULT_AUTHORITY.toBase58());

      // =========================
      // TOKEN ACCOUNTS
      // =========================

      let referralWallet;
      try {
        referralWallet = new PublicKey(referralAddressInput.trim());
      } catch {
        throw new Error("Enter a valid referral wallet address");
      }

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

      const vaultToken = VAULT_TOKEN;

      console.log("buyerUsdt:", buyerUsdt.toBase58());
      console.log("buyerToken:", buyerToken.toBase58());
      console.log("referralWallet:", referralWallet.toBase58());
      console.log("sponsorToken:", sponsorToken.toBase58());
      console.log("vaultToken:", vaultToken.toBase58());

      const tx = new Transaction();
      const ataEnsuredInTx = new Set();

      // =========================
      // CREATE ATA IF MISSING
      // =========================

      const ensureAta = async (ata, owner, mint) => {
        const ataKey = ata.toBase58();
        if (ataEnsuredInTx.has(ataKey)) {
          return;
        }

        const info = await connection.getAccountInfo(ata);
        if (!info) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              ata,
              owner,
              mint,
            ),
          );
        }

        ataEnsuredInTx.add(ataKey);
      };

      await ensureAta(buyerUsdt, wallet.publicKey, USDT_MINT);
      await ensureAta(buyerToken, wallet.publicKey, PROJECT_MINT);
      await ensureAta(sponsorToken, referralWallet, PROJECT_MINT);

      // =========================
      // BUY AMOUNT
      // =========================
      if (!Number.isFinite(tokenAmount) || tokenAmount <= 0) {
        throw new Error("Enter a valid token amount greater than 0");
      }

      if (usdtAmountRaw <= 0n) {
        throw new Error("USDT payable is too small. Increase token amount.");
      }

      const usdtAmount = new anchor.BN(usdtAmountRaw.toString());

      const [buyerUsdtBal, vaultTokenBal] = await Promise.all([
        connection.getTokenAccountBalance(buyerUsdt),
        connection.getTokenAccountBalance(vaultToken),
      ]);

      const buyerUsdtRaw = BigInt(buyerUsdtBal.value.amount);
      const vaultTokenRaw = BigInt(vaultTokenBal.value.amount);
      const neededRaw = BigInt(usdtAmount.toString());

      console.log("BUY PRECHECK", {
        tokenAmount,
        usdtToPay,
        buyerUsdtRaw: buyerUsdtRaw.toString(),
        vaultTokenRaw: vaultTokenRaw.toString(),
        neededRaw: neededRaw.toString(),
      });

      if (buyerUsdtRaw < neededRaw) {
        throw new Error(
          `Insufficient buyer USDT. Need ${neededRaw}, have ${buyerUsdtRaw}`,
        );
      }

      if (vaultTokenRaw < neededRaw) {
        throw new Error(
          `Vault has insufficient project tokens. Need ${neededRaw}, have ${vaultTokenRaw}. Fund vault ATA ${vaultToken.toBase58()} first.`,
        );
      }

      // =========================
      // BUILD INSTRUCTION
      // =========================

      const ix = await program.methods
        .buy(usdtAmount)
        .accounts({
          buyer: wallet.publicKey,
          config: CONFIG,
          sponsor: referralWallet,
          buyerUsdt,
          adminUsdt: ADMIN_USDT,
          buyerToken,
          sponsorToken,
          vaultToken,
          vaultAuthority: VAULT_AUTHORITY,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction();

      tx.add(ix);

      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (
        await connection.getLatestBlockhash("confirmed")
      ).blockhash;

      // =========================
      // SEND TX
      // =========================

      const sig = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      await refreshStatus();

      toast.dismiss(loadingToast);
      // alert("BUY SUCCESS\n" + sig);
      toast.success(
        <div>
          <b>Buy Successful 🎉</b>
          <br />
          Tx: {sig.slice(0, 8)}...{sig.slice(-8)}
        </div>
      );
      triggerButtonConfetti();
    } catch (err) {
      console.error("BUY ERROR:", err);
      toast.error(err?.message || "Transaction Failed ");
      toast.dismiss(loadingToast);
    }
  };

  return (

    <>
      <section id="buy-token" className="benefit pb-110">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title text-center mb-70">
                <h2 className="title">Buy Token</h2>
              </div>
            </div>
          </div>

          <div className="row">
            {/* LEFT SIDE */}
            <div className="col-lg-6">
              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Buy LOL Token</h3>
                <p>
                  Buy LOL tokens easily on the Solana network — fast, secure,
                  and low fees. Connect your wallet, choose how much you want to
                  buy or sell, and swap in seconds.
                </p>
              </div>

              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Top Exchangers</h3>
                <p>
                  We are preparing to list our token after pre -launch on a
                  top-tier exchange to ensure higher liquidity, better
                  accessibility, and a secure trading experience for our growing
                  community.
                </p>
              </div>

              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Contract Address</h3>
                <p>Always make sure to use the official contract address when buying, selling, or listing the token. Copying the correct address helps avoid scams and fake tokens.</p>
              </div>
            </div>

            {/* RIGHT SIDE CARD */}
            <div className="col-lg-6 mb-4">
              <div className="buy-section">
                <div className="buy-container">
                  <div className="toggle-container">
                    <button className="toggle-btn active">
                      Buy Token
                    </button>
                  </div>
                  <div className="buy-card">
                    <div className="buy-row">
                      <span>Token Price</span>
                      <span>1 Token = {TOKEN_PRICE_USDT} USDT</span>
                    </div>

                    <div className="buy-input-group">
                      <label>Token Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={tokenAmountInput}
                        onChange={(e) => setTokenAmountInput(e.target.value)}
                      />
                    </div>

                    <div className="buy-row">
                      <span>USDT to Pay</span>
                      <span>{usdtToPay.toFixed(6)} USDT</span>
                    </div>

                    <div className="buy-row">
                      <span>Referral %</span>
                      <span>{REFERRAL_PERCENT}%</span>
                    </div>

                    <div className="buy-row">
                      <span>Estimated Referral Tokens</span>
                      <span className="text-gas">{referralTokenEstimate.toFixed(6)}</span>
                    </div>

                    <div className="buy-input-group">
                      <label>Referral Wallet Address</label>
                      <input
                        type="text"
                        value={referralAddressInput}
                        onChange={(e) => setReferralAddressInput(e.target.value)}
                      />
                    </div>

                    <button className="buy-btn" ref={buttonRef}  onClick={buyTokens}>
                      BUY TOKENS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8 m-auto ">
              <div className="status-card">
                <div><b>Config PDA:</b> <span>{CONFIG.toBase58()}</span></div>
                <div><b>Vault Authority:</b> <span>{VAULT_AUTHORITY.toBase58()}</span></div>
                <div><b>Vault Token ATA:</b> <span>{VAULT_TOKEN.toBase58()}</span></div>
                <div><b>Buyer USDT (raw):</b> <span>{status.buyerUsdtRaw}</span></div>
                <div><b>Vault Project Token (raw):</b> <span className="text-aura">{status.vaultTokenRaw}</span></div>

                {status.error && (
                  <div className="error-text">{status.error}</div>
                )}

                <div className="text-start mt-4">
                  <button
                    className="refresh-btn-pro"
                    onClick={refreshStatus}
                    disabled={status.loading}
                  >
                    <i class="fas fa-sync-alt me-2"></i>
                    {status.loading ? "Refreshing..." : " Refresh Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>

  );
}
