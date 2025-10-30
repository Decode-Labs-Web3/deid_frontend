import { useScore } from "@/hooks/useScore";
import { getPrimaryWalletAddress } from "@/utils/session.utils";
import React from "react";

interface TrustWheelProps {
  address?: string;
}

export const TrustWheel: React.FC<TrustWheelProps> = ({ address }) => {
  // Prefer passed prop; fallback to session
  const fallbackAddress =
    typeof window !== "undefined" ? getPrimaryWalletAddress() : undefined;
  const effectiveAddress = address ?? fallbackAddress ?? undefined;

  const { score, loading } = useScore(effectiveAddress);

  // Visualizations
  const trustScore = score?.totalScore || 0;
  // Additional breakdowns can be surfaced later if needed
  const socialScore = score?.breakdown?.socialScore ?? 0;
  const streakScore = score?.breakdown?.streakScore ?? 0;
  const chainScore = score?.breakdown?.chainScore ?? 0;
  const lastUpdated = score?.lastUpdated
    ? new Date(score.lastUpdated * 1000)
    : null;
  const contributionScore = score?.breakdown?.contributionScore ?? 0;

  // Circle progress visual (out of 1000)
  const CIRCLE_CIRCUM = 2 * Math.PI * 40;
  const percent = trustScore > 0 ? trustScore / 1000 : 0;
  const strokeDashoffset = CIRCLE_CIRCUM * (1 - percent);

  // Loading and error state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="font-semibold animate-pulse">Loading score...</span>
      </div>
    );
  }
  // If there's an error (e.g., user not found in snapshot), render zeros gracefully

  return (
    <div className="bg-gradient-to-br from-orange-400/80 via-pink-400/80 via-purple-500/80 to-blue-600/80 rounded-2xl p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-medium opacity-90">
          Task Point {streakScore}
        </span>
        <span className="text-sm font-medium opacity-90">
          Social Score {socialScore}
        </span>
      </div>
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeDasharray={CIRCLE_CIRCUM}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.7s" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-medium mb-1">Trust Score</span>
            <span className="text-5xl font-bold">{trustScore}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-75">
          Last updated{" "}
          {lastUpdated ? lastUpdated.toLocaleDateString() : "never"}
        </span>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="mr-8">On-chain {chainScore}</span>
          <div className="flex items-center gap-2">
            <span>Contribution Score</span>
            <span>{contributionScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
