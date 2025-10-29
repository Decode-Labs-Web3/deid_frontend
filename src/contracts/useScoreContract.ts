/**
 * @title ScoreFacet Contract Hook
 * @description React hook for interacting with ScoreFacet smart contract
 */

import { useMemo } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import SCORE_FACET_ABI from "@/contracts/score/ScoreFacet.sol/ScoreFacet.json";

const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

/**
 * Hook to get ScoreFacet contract instance with signer
 * Requires wallet connection
 */
export function useScoreContract() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const contract = useMemo(() => {
    if (!isConnected || !walletClient) {
      console.log("⚠️ Wallet not connected, returning null contract");
      return null;
    }

    try {
      // Get provider from window.ethereum
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get signer
        const getSigner = async () => {
          return await provider.getSigner();
        };

        // Return contract factory function
        return {
          getInstance: async () => {
            const signer = await getSigner();
            return new ethers.Contract(
              PROXY_ADDRESS,
              SCORE_FACET_ABI.abi,
              signer
            );
          },
          address: PROXY_ADDRESS,
          abi: SCORE_FACET_ABI.abi,
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Error creating contract instance:", error);
      return null;
    }
  }, [isConnected, walletClient, address]);

  return contract;
}

/**
 * Hook to get read-only ScoreFacet contract instance
 * Does not require wallet connection
 */
export function useScoreContractRead() {
  const contract = useMemo(() => {
    try {
      const rpcUrl =
        process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
        "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

      const provider = new ethers.JsonRpcProvider(rpcUrl);

      return new ethers.Contract(PROXY_ADDRESS, SCORE_FACET_ABI.abi, provider);
    } catch (error) {
      console.error("❌ Error creating read-only contract:", error);
      return null;
    }
  }, []);

  return contract;
}
