"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createStorage, noopStorage } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "viem";
import { defineChain } from "viem";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";

// Define custom Sepolia chain using existing env variables
const customSepolia = defineChain({
  id: 11155111, // Ethereum Sepolia chain ID
  name: "Ethereum Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
          "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      ],
    },
    public: {
      http: [
        "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        "https://rpc.sepolia.org",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  testnet: true,
});

// Configure chains for your app - moved inside component to prevent multiple initialization
let config: ReturnType<typeof getDefaultConfig> | null = null;
let queryClient: QueryClient | null = null;

function getConfig() {
  if (!config) {
    // Create safe storage that works with SSR
    const storage = createStorage({
      storage:
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
    });

    config = getDefaultConfig({
      appName: "DEiD Frontend",
      projectId:
        process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id",
      chains: [customSepolia, mainnet, polygon, optimism, arbitrum, base],
      transports: {
        [customSepolia.id]: http(
          process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
            "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
        ),
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
      },
      // Use noopStorage on server, localStorage on client
      storage: createStorage({
        storage:
          typeof window !== "undefined" ? window.localStorage : noopStorage,
      }),
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

// Component to automatically switch to Sepolia when wallet connects
function AutoSwitchToSepolia() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId !== customSepolia.id) {
      console.log("🔄 Auto-switching to Sepolia...");
      try {
        switchChain({ chainId: customSepolia.id });
      } catch (error) {
        console.warn("Failed to auto-switch to Sepolia:", error);
      }
    }
  }, [isConnected, chainId, switchChain]);

  return null;
}

// Client-side only wrapper for RainbowKit to prevent SSR issues
function ClientOnlyRainbowKit({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <RainbowKitProvider>
      <AutoSwitchToSepolia />
      {children}
    </RainbowKitProvider>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wagmiConfig = getConfig();
  const queryClientInstance = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClientInstance}>
        <ClientOnlyRainbowKit>{children}</ClientOnlyRainbowKit>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
