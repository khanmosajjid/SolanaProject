import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import {
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import idl from "./idl/referral_token.json";

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

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// =========================
// APP
// =========================

export default function App() {
  const wallet = useWallet();
  const [tokenAmountInput, setTokenAmountInput] = useState("100");
  const [referralAddressInput, setReferralAddressInput] =
    useState(DEFAULT_REFERRAL);
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

      const vaultToken = VAULT_TOKEN;

      const buyerUsdtInfo = await connection.getAccountInfo(buyerUsdt);
      const vaultInfo = await connection.getAccountInfo(vaultToken);

      const buyerUsdtRaw = buyerUsdtInfo
        ? (await connection.getTokenAccountBalance(buyerUsdt)).value.amount
        : "0";

      const vaultTokenRaw = vaultInfo
        ? (await connection.getTokenAccountBalance(vaultToken)).value.amount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.publicKey?.toBase58()]);

  const buyTokens = async () => {
    try {
      if (!wallet.publicKey) {
        alert("Connect wallet first");
        return;
      }

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

      alert("BUY SUCCESS\n" + sig);
      console.log("TX:", sig);
    } catch (err) {
      console.error("BUY ERROR:", err);
      alert(err?.message || "ERROR — check console");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Referral Token Buy</h2>
      <WalletMultiButton />
      <br />
      <br />
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          maxWidth: 720,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <b>Token price:</b> 1 token = {TOKEN_PRICE_USDT} USDT
        </div>
        <label>
          <b>Token amount to buy:</b>
        </label>
        <input
          type="number"
          min="0"
          step="any"
          value={tokenAmountInput}
          onChange={(e) => setTokenAmountInput(e.target.value)}
          style={{ marginLeft: 8, width: 180 }}
        />
        <div style={{ marginTop: 8 }}>
          <b>USDT to pay:</b> {usdtToPay.toFixed(6)} USDT
        </div>
        <div style={{ marginTop: 8 }}>
          <b>Referral percent:</b> {REFERRAL_PERCENT}%
        </div>
        <div style={{ marginTop: 8 }}>
          <b>Estimated referral tokens:</b> {referralTokenEstimate.toFixed(6)}
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            <b>Referral wallet address:</b>
          </label>
          <input
            type="text"
            value={referralAddressInput}
            onChange={(e) => setReferralAddressInput(e.target.value)}
            style={{ marginLeft: 8, width: 520 }}
          />
        </div>
      </div>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          maxWidth: 720,
        }}
      >
        <div>
          <b>Config PDA:</b> {CONFIG.toBase58()}
        </div>
        <div>
          <b>Vault authority:</b> {VAULT_AUTHORITY.toBase58()}
        </div>
        <div>
          <b>Vault token ATA:</b> {VAULT_TOKEN.toBase58()}
        </div>
        <div>
          <b>Buyer USDT (raw):</b> {status.buyerUsdtRaw}
        </div>
        <div>
          <b>Vault project token (raw):</b> {status.vaultTokenRaw}
        </div>
        {status.error ? (
          <div style={{ color: "crimson" }}>{status.error}</div>
        ) : null}
        <button
          onClick={refreshStatus}
          disabled={status.loading}
          style={{ marginTop: 8 }}
        >
          {status.loading ? "Refreshing..." : "Refresh status"}
        </button>
      </div>
      <button onClick={buyTokens}>BUY TOKENS</button>
    </div>
  );
}
