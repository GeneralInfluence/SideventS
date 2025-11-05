"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base, polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import UnicornAutoConnect from "../components/UnicornAutoConnect";
import { unicornConnector } from "../connectors/unicornConnector";

const config = createConfig({
  chains: [base, polygon],
  connectors: [
    injected({ target: "metaMask" }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
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

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
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
