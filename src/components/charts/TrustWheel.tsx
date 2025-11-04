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

  // Extract relevant scores, with fallbacks
  const trustScore = score?.totalScore || 0;
  const badgeScore = score?.breakdown?.badgeScore ?? 0; // Badge score is Task Score
  const streakDays = score?.streakDays ?? 0; // Show new streakDays if present, else fallback to 0
  const chainScore = score?.breakdown?.chainScore ?? 0;
  const lastUpdated = score?.lastUpdated
    ? new Date(score.lastUpdated * 1000)
    : null;
  const contributionScore = score?.breakdown?.contributionScore ?? 0;
  const socialScore = score?.breakdown?.socialScore ?? 0;

  // Circle progress visual (out of 1000)
  const CIRCLE_CIRCUM = 2 * Math.PI * 40;
  const percent = trustScore > 0 ? trustScore / 1000 : 0;
  const strokeDashoffset = CIRCLE_CIRCUM * (1 - percent);

  // Loading state
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center min-h-[400px] shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-sm text-muted-foreground font-medium">
            Loading score...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-400/90 via-pink-400/90 via-purple-500/90 to-blue-600/90 rounded-2xl p-8 relative overflow-hidden shadow-xl border border-white/20">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjMiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

      {/* Top stats bar */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/95 backdrop-blur-sm text-orange-600 font-bold rounded-full px-4 py-1.5 text-sm shadow-md">
            Task Badge {badgeScore}
          </div>
          <div className="bg-white/80 backdrop-blur-sm text-blue-800 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
            Streak: {streakDays}d
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm text-purple-700 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
          Social {socialScore}
        </div>
      </div>

      {/* Main score circle */}
      <div className="flex items-center justify-center mb-6 relative z-10">
        <div className="relative w-56 h-56">
          <svg
            className="w-full h-full transform -rotate-90 drop-shadow-lg rounded-full"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="10"
              className="drop-shadow-sm"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="10"
              strokeDasharray={CIRCLE_CIRCUM}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="drop-shadow-lg transition-all duration-700 ease-out"
              style={{
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))",
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-medium mb-2 text-white/90 drop-shadow-md">
              Trust Score
            </span>
            <span className="text-6xl font-bold text-white drop-shadow-lg">
              {Math.floor(trustScore)}
            </span>
            <div className="mt-2 text-xs text-white/80 font-medium">/ 1000</div>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="text-xs text-white/80 font-medium">
          Last updated{" "}
          <span className="text-white/95 font-semibold">
            {lastUpdated
              ? lastUpdated.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "never"}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
            <span className="text-gray-700">On-chain</span>
            <span className="text-green-700 font-bold">{chainScore}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
            <span className="text-gray-700">Contribution</span>
            <span className="text-blue-700 font-bold">{contributionScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
