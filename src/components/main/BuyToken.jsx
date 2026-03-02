import React, { useEffect, useState, useRef } from "react";
import { useAccount, useReadContract, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, isAddress } from "viem";
import { erc20Abi } from "viem"; // Built-in ERC20 ABI from viem
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import copySoundFile from "../../assets/img/sound/sound.mp3";

// ==========================================
// EVM CONSTANTS & CONFIGURATION
// ==========================================
// Replace these with your actual EVM Contract Addresses
const CONTRACT_ADDRESS = "7gWKE7LyxPuZr6eXbpc8idGVADYkk4Ypiohobb97z38J"; 
const USDT_CONTRACT_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const PROJECT_TOKEN_ADDRESS = "Ans12FY6qVF5RX4kgafcmv6J6i2g5NL2qk4T2BUFCv23";
const VAULT_ADDRESS = CONTRACT_ADDRESS; // Usually, the sale contract holds the tokens

const DEFAULT_REFERRAL = "C7jx5k9yrNbsfz8dQbX2GEtM2ZiSpg5dqAcL385HFirS";
const TOKEN_PRICE_USDT = 0.001;
const USDT_DECIMALS = 6; // Standard USDT decimals on EVM
const TOKEN_DECIMALS = 6; 
const REFERRAL_PERCENT = 5;

// ==========================================
// MOCK ABI (Aapko apne contract ka asli ABI yahan lagana hoga)
// ==========================================
const SALE_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "usdtAmount", "type": "uint256" },
      { "internalType": "address", "name": "sponsor", "type": "address" }
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBuyerTokensSold",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalReferralTokensSold",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// ==========================================
// UTILS
// ==========================================
function formatAmount(rawValue, decimals) {
  if (!rawValue) return "0";
  const parsed = Number(formatUnits(BigInt(rawValue), decimals));
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function BuyToken() {
  // Replacing useWallet() with RainbowKit/Wagmi useAccount()
  const { address, isConnected } = useAccount();
  const walletKey = address; // EVM address

  const buttonRef = useRef(null);
  const audioRef = useRef(null);

  const [copyText, setCopyText] = useState("Copy");
  const [showToast, setShowToast] = useState("");
  const [usdtAmountInput, setUsdtAmountInput] = useState("1");
  const [referralAddressInput, setReferralAddressInput] = useState(DEFAULT_REFERRAL);
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    buyerUsdtRaw: "0",
    vaultTokenRaw: "0",
    totalBuyerTokensSoldRaw: "0",
    totalReferralTokensSoldRaw: "0",
  });

  // Calculations
  const usdtToPay = Number(usdtAmountInput || "0");
  const usdtAmountRaw = parseUnits(usdtAmountInput || "0", USDT_DECIMALS); // Native BigInt parsing
  
  const totalTokenEstimate = Number.isFinite(usdtToPay) ? usdtToPay / TOKEN_PRICE_USDT : 0;
  const referralTokenEstimate = Number.isFinite(totalTokenEstimate) ? (totalTokenEstimate * REFERRAL_PERCENT) / 100 : 0;
  const buyerTokenEstimate = Number.isFinite(totalTokenEstimate) ? totalTokenEstimate - referralTokenEstimate : 0;
  const tokenPerUsdt = 1 / TOKEN_PRICE_USDT;
  
  const referralLink = walletKey && typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(walletKey)}#buyToken`
    : "";

  const totalTokensSoldRaw = (
    BigInt(status.totalBuyerTokensSoldRaw || "0") +
    BigInt(status.totalReferralTokensSoldRaw || "0")
  ).toString();

  // Wagmi Hooks for Reading Blockchain Data (Replaces Connection / getAccountInfo)
  const { writeContractAsync } = useWriteContract();

  const { data: usdtBalanceData, refetch: refetchUsdt } = useBalance({
    address: walletKey,
    token: USDT_CONTRACT_ADDRESS,
    query: { enabled: !!walletKey },
  });

  const { data: vaultBalanceData, refetch: refetchVault } = useBalance({
    address: VAULT_ADDRESS,
    token: PROJECT_TOKEN_ADDRESS,
  });

  const { data: totalBuyerSoldData, refetch: refetchTotalBuyer } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SALE_CONTRACT_ABI,
    functionName: "totalBuyerTokensSold",
  });

  const { data: totalReferralSoldData, refetch: refetchTotalReferral } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SALE_CONTRACT_ABI,
    functionName: "totalReferralTokensSold",
  });

  const triggerButtonConfetti = () => {
    if (!buttonRef.current) return;
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
      colors: ["#cddc39", "#d704d0", "#7711f4", "#78f40b", "#f40b3a", "#f4c20b"],
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  };

  const handleContractCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      if (audioRef.current) audioRef.current.play();

      setCopyText("Copied");
      setShowToast("show");
      setTimeout(() => {
        setCopyText("Copy");
        setShowToast("");
      }, 2000);
    } catch {
      toast.error("Failed to copy contract address");
    }
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

      // Parallel fetching using Wagmi refetch methods
      const [usdtRes, vaultRes, buyerSoldRes, refSoldRes] = await Promise.all([
        isConnected ? refetchUsdt() : Promise.resolve({ data: null }),
        refetchVault(),
        refetchTotalBuyer(),
        refetchTotalReferral(),
      ]);

      const buyerUsdtRaw = usdtRes.data?.value?.toString() || "0";
      const vaultTokenRaw = vaultRes.data?.value?.toString() || "0";
      const totalBuyerTokensSoldRaw = buyerSoldRes.data?.toString() || "0";
      const totalReferralTokensSoldRaw = refSoldRes.data?.toString() || "0";

      if (!isConnected) {
        setStatus({
          loading: false,
          error: "Connect wallet to see buyer balance",
          buyerUsdtRaw: "0",
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
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch on-chain status. Check network connection.",
      }));
    }
  };

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletKey, isConnected]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const referralFromLink = params.get("ref") || params.get("referral") || params.get("r");

    if (!referralFromLink) return;

    try {
      const formattedRef = referralFromLink.trim();
      // Validate EVM address instead of Solana public key
      if (!isAddress(formattedRef)) return;

      setReferralAddressInput(formattedRef);
      setIsReferralLocked(true);
    } catch {
      // ignore invalid referral
    }
  }, []);

  useEffect(() => {
    if (!isReferralLocked && isConnected && referralAddressInput === DEFAULT_REFERRAL) {
      setReferralAddressInput(walletKey);
    }
  }, [walletKey, isConnected, referralAddressInput, isReferralLocked]);

  const buyTokens = async () => {
    let loadingToast;
    try {
      if (!isConnected) {
        toast.error("Please connect wallet first");
        return;
      }

      const formattedReferral = referralAddressInput.trim();
      if (!isAddress(formattedReferral)) {
        throw new Error("Enter a valid EVM referral wallet address");
      }

      if (!Number.isFinite(usdtToPay) || usdtToPay <= 0) {
        throw new Error("Enter a valid USDT amount greater than 0");
      }

      if (usdtAmountRaw <= 0n) {
        throw new Error("USDT payable is too small.");
      }

      loadingToast = toast.loading("Confirming USDT Approval...");

      // EVM requires an Allowance (Approve) transaction first for ERC20 tokens
      const approveTxHash = await writeContractAsync({
        address: USDT_CONTRACT_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, usdtAmountRaw],
      });

      toast.loading(`Approval submitted, waiting for confirmation...`, { id: loadingToast });
      
      // Note: In production, you might want to wait for the receipt here.
      // await waitForTransactionReceipt({ hash: approveTxHash });

      toast.loading("Processing Buy Transaction...", { id: loadingToast });

      // Call the Buy function on your Sale Contract
      const buyTxHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SALE_CONTRACT_ABI,
        functionName: 'buy',
        args: [usdtAmountRaw, formattedReferral],
      });

      if (loadingToast) toast.dismiss(loadingToast);

      refreshStatus();
      toast.success(
        <div>
          <b>Buy Successful 🎉</b>
          <br />
          Tx: {buyTxHash.slice(0, 8)}...{buyTxHash.slice(-8)}
        </div>
      );
      triggerButtonConfetti();
      
    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);
      
      const detailed = error?.shortMessage || error?.message || "Transaction Failed";
      toast.error(detailed);
      console.error("BUY ERROR:", error);
    }
  };

  return (
    <>
      <section id="buyToken" className="benefit pt-100">
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
                  Buy LOL tokens easily on the network using your connected wallet.
                </p>
              </div>

              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Token Contract Address</h3>
                <p className="mb-3">
                  Always use official program and mint addresses to avoid fake token scams.
                </p>
                <div className="token_copy_board">
                  <span className="code">
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

              <div className="col-md-12 mb-4 benefit-picss">
                <div className=" w-100">
                  <h3 className="card-title text-start"> Account Overview</h3>

                  <div className="status-item">
                    <div className="label">Your USDT Balance</div>
                    <div className="value">
                      {formatAmount(status.buyerUsdtRaw, USDT_DECIMALS)} USDT
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="label">Vault LOL Balance</div>
                    <div className="value text-aura">
                      {formatAmount(status.vaultTokenRaw, TOKEN_DECIMALS)} LOL
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="label">Total Tokens Sold</div>
                    <div className="value text-gas">
                      {formatAmount(totalTokensSoldRaw, TOKEN_DECIMALS)} LOL
                    </div>
                  </div>

                  {status.error && (
                    <div className="error-text">{status.error}</div>
                  )}

                  <button
                    className="refresh-btn-pro"
                    onClick={refreshStatus}
                    disabled={status.loading}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    {status.loading ? "Refreshing..." : "Refresh Status"}
                  </button>
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
                    <div className="buy-row">
                      <span>Listing Price</span>
                      <span className="text-gold">1 Token = 0.002 USDT</span>
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