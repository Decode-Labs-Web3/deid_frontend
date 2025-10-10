"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "viem";
import { defineChain } from "viem";
import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";

// Define Monad Testnet chain
const monadTestnet = defineChain({
  id: 41434, // Monad Testnet chain ID
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL ||
          "https://testnet-rpc.monad.xyz",
      ],
    },
    public: {
      http: [
        "https://testnet-rpc.monad.xyz",
        "https://monad-testnet.rpc.thirdweb.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet-explorer.monad.xyz",
    },
  },
  testnet: true,
});

// Configure chains for your app - moved inside component to prevent multiple initialization
let config: ReturnType<typeof getDefaultConfig> | null = null;
let queryClient: QueryClient | null = null;

function getConfig() {
  if (!config) {
    config = getDefaultConfig({
      appName: "DEiD Frontend",
      projectId:
        process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id",
      chains: [
        monadTestnet,
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        sepolia,
      ],
      transports: {
        [monadTestnet.id]: http(
          process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL ||
            "https://testnet-rpc.monad.xyz"
        ),
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
        [sepolia.id]: http(),
      },
      // Set Monad Testnet as the default chain
      ssr: true,
    });
  }
  return config;
}

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient();
  }
  return queryClient;
}

// Component to automatically switch to Monad Testnet when wallet connects
function AutoSwitchToMonad() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId !== monadTestnet.id) {
      console.log("🔄 Auto-switching to Monad Testnet...");
      try {
        switchChain({ chainId: monadTestnet.id });
      } catch (error) {
        console.warn("Failed to auto-switch to Monad Testnet:", error);
      }
    }
  }, [isConnected, chainId, switchChain]);

  return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wagmiConfig = getConfig();
  const queryClientInstance = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClientInstance}>
        <RainbowKitProvider>
          <AutoSwitchToMonad />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
