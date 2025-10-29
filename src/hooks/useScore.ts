/**
 * @title useScore Hook
 * @description React hook for fetching and caching user score data
 */

import { useState, useEffect, useCallback } from "react";
import { UserScoreData } from "@/types/score.types";

interface UseScoreReturn {
  score: UserScoreData | null;
  rank: number | null;
  breakdown: UserScoreData["breakdown"] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and cache user's current score
 * @param address - User's wallet address
 * @returns Score data, loading state, and refresh function
 */
export function useScore(address: string | undefined): UseScoreReturn {
  const [score, setScore] = useState<UserScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!address) {
      setScore(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`📊 Fetching score for ${address}`);

      const response = await fetch(`/api/score/user?address=${address}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch score");
      }

      setScore(data.userScore);
      console.log(
        `✅ Score fetched: ${data.userScore.totalScore} (Rank: ${data.userScore.rank})`
      );
    } catch (err: any) {
      console.error("❌ Error fetching score:", err);
      setError(err.message);
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    rank: score?.rank || null,
    breakdown: score?.breakdown || null,
    loading,
    error,
    refresh: fetchScore,
  };
}
