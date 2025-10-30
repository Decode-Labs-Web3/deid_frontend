/**
 * @title useScoreUpdate Hook
 * @description Hook for triggering score updates
 */

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useScoreContract } from "@/contracts/useScoreContract";
import { canUpdate, getTimeUntilNextUpdate } from "@/utils/score.contract";
import { RecomputeResponse } from "@/types/score.types";

interface UseScoreUpdateReturn {
  updateScore: () => Promise<{ success: boolean; txHash?: string }>;
  loading: boolean;
  error: string | null;
  success: boolean;
  canUpdate: boolean;
  timeUntilNext: number;
  checkCooldown: () => Promise<void>;
}

/**
 * Hook to handle score update flow
 * @returns Mutation function, loading state, and cooldown info
 */
export function useScoreUpdate(): UseScoreUpdateReturn {
  const { address } = useAccount();
  const scoreContract = useScoreContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [canUpdateState, setCanUpdateState] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState(0);

  // Check cooldown status
  const checkCooldown = useCallback(async () => {
    try {
      const allowed = await canUpdate();
      setCanUpdateState(allowed);

      if (!allowed) {
        const remaining = await getTimeUntilNextUpdate();
        setTimeUntilNext(remaining);
      } else {
        setTimeUntilNext(0);
      }
    } catch (err) {
      console.warn("Failed to check cooldown:", err);
    }
  }, []);

  // Main update function
  const updateScore = useCallback(async () => {
    if (!address) {
      setError("Wallet not connected");
      return { success: false };
    }

    if (!scoreContract) {
      setError("Contract not initialized");
      return { success: false };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check cooldown
      await checkCooldown();
      if (!canUpdateState) {
        throw new Error(
          `Please wait ${Math.ceil(
            timeUntilNext / 60
          )} minutes before next update`
        );
      }

      console.log("🔄 Starting score update process...");

      // Step 1: Call recompute API
      console.log("  1️⃣ Calculating scores...");
      const response = await fetch("/api/score/recompute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ triggerAddress: address }),
      });

      const data: RecomputeResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          "Failed to recompute scores: " +
            (data as unknown as { error: string }).error
        );
      }

      console.log("  ✅ Scores calculated and snapshot uploaded to IPFS");
      console.log(`     CID: ${data.cid}`);
      console.log(`     Snapshot ID: ${data.snapshotId}`);

      // Step 2: Get contract instance with signer
      console.log("  2️⃣ Submitting to blockchain...");
      const contractInstance = await scoreContract.getInstance();

      // Step 3: Submit transaction
      const tx = await contractInstance.updateSnapshot(
        data.cid,
        data.root,
        data.snapshotId,
        data.timestamp,
        data.signature
      );

      console.log(`  ⏳ Transaction submitted: ${tx.hash}`);
      console.log("     Waiting for confirmation...");

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log(`  ✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`     Gas used: ${receipt.gasUsed.toString()}`);

      setSuccess(true);
      await checkCooldown(); // Update cooldown status

      return { success: true, txHash: tx.hash };
    } catch (err: unknown) {
      console.error("❌ Score update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update score");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [address, scoreContract, canUpdateState, timeUntilNext, checkCooldown]);

  return {
    updateScore,
    loading,
    error,
    success,
    canUpdate: canUpdateState,
    timeUntilNext,
    checkCooldown,
  };
}
