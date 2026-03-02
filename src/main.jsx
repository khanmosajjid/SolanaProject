import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// CSS Imports
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/custom.css";
import "./assets/css/default.css";
import "./assets/css/responsive.css";
import "./index.css";

// React Router
import { BrowserRouter } from "react-router-dom";

// RainbowKit & Wagmi Imports
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID

// Wagmi Config Setup
const config = getDefaultConfig({
  appName: "LootLaugh",
  projectId: PROJECT_ID,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false, 
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
