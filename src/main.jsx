import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/custom.css";
import "./assets/css/default.css";
import "./assets/css/responsive.css";
import "./index.css";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

const wallets = [new PhantomWalletAdapter()];
const DEFAULT_RPC_ENDPOINTS = [
  "https://go.getblock.us/0c7ba136b3f241e5a599f4b120616970",
];
const EXTRA_RPC_ENDPOINTS = (
  import.meta.env.VITE_SOLANA_RPC_URLS ||
  import.meta.env.VITE_SOLANA_RPC_URL ||
  ""
)
  .split(",")
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);
const RPC_ENDPOINTS = [...EXTRA_RPC_ENDPOINTS, ...DEFAULT_RPC_ENDPOINTS]
  .filter((endpoint, index, endpoints) => endpoints.indexOf(endpoint) === index)
  .filter(Boolean);
const RPC_ENDPOINT = RPC_ENDPOINTS[0];

ReactDOM.createRoot(document.getElementById("root")).render(
  <ConnectionProvider endpoint={RPC_ENDPOINT}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>,
);
