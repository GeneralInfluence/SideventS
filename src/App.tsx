import { useState, useEffect } from "react";
import PageRoute from "./components/PageRoute";
import { useUniversalWallet } from "./hooks/useUniversalWallet";
// src/examples/basic/src/App.jsx
// Clean example app for @unicorn.eth/autoconnect v1.2.0+

import { WagmiProvider, createConfig, http } from "wagmi";
import { base, polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Import from source code
import { unicornConnector } from "./connectors/unicornConnector.js";
import UnicornAutoConnect from "./components/UnicornAutoConnect";

// Import our components
import HeaderLayout from './components/HeaderLayout';

// Wagmi config with all wallet types
const config = createConfig({
  chains: [base, polygon],
  connectors: [
    injected({ target: "metaMask" }),
    walletConnect({
      projectId:
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
    }),
    unicornConnector({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  factoryAddress: process.env.NEXT_PUBLIC_THIRDWEB_FACTORY_ADDRESS,
      defaultChain: base.id,
    }),
  ],
  transports: {
    [base.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient();

function TestApp() {
  const wallet = useUniversalWallet();
  const [isUnicornConnected, setIsUnicornConnected] = useState(false);

  useEffect(() => {
    setIsUnicornConnected(Boolean(wallet?.isUnicorn && wallet?.unicornWallet));
  }, [wallet?.isUnicorn, wallet?.unicornWallet]);

  return (
    <>
      {/* Existing UI */}
      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "20px",
          fontFamily: "sans-serif",
        }}
      >
        <HeaderLayout>
          <PageRoute />
        </HeaderLayout>
      </div>
    </>
  );
}

// Main App with Providers
export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TestApp />

          {/* Autoconnect component for background connection */}
          <UnicornAutoConnect
            clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
            factoryAddress={process.env.NEXT_PUBLIC_THIRDWEB_FACTORY_ADDRESS}
            defaultChain="base"
            debug={true}
            onConnect={(wallet: unknown) =>
              console.log("✅ Unicorn autoconnected!", wallet)
            }
            onError={(error: unknown) =>
              console.error("❌ Autoconnect failed:", error)
            }
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
