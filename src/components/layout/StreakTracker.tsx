"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Target } from "lucide-react";
import STREAK_TRACKER_ABI from "@/contracts/social/StreakTracker.sol/StreakTracker.json";

const STREAK_TRACKER_ADDRESS = process.env.NEXT_PUBLIC_STREAK_TRACKER_ADDRESS;

interface UserStreak {
  lastCheckInDay: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  firstCheckInDay: number;
}

interface StreakInfo {
  streak: UserStreak;
  currentDay: number;
  daysSinceLastCheckIn: number;
  canCheckInToday: boolean;
}

export const StreakTracker = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch streak information from contract
  const fetchStreakInfo = useCallback(async () => {
    if (!connectedAddress || !walletClient) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔍 Fetching streak info for:", connectedAddress);

      // Convert walletClient to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        STREAK_TRACKER_ADDRESS,
        STREAK_TRACKER_ABI.abi,
        signer
      );

      const streakData = await contract.getUserStreakInfo(connectedAddress);

      const streakInfo: StreakInfo = {
        streak: {
          lastCheckInDay: Number(streakData.streak.lastCheckInDay),
          currentStreak: Number(streakData.streak.currentStreak),
          longestStreak: Number(streakData.streak.longestStreak),
          totalCheckIns: Number(streakData.streak.totalCheckIns),
          firstCheckInDay: Number(streakData.streak.firstCheckInDay),
        },
        currentDay: Number(streakData.currentDay),
        daysSinceLastCheckIn: Number(streakData.daysSinceLastCheckIn),
        canCheckInToday: streakData.canCheckInToday,
      };

      console.log("✅ Streak info fetched:", streakInfo);
      setStreakInfo(streakInfo);
    } catch (error) {
      console.error("❌ Error fetching streak info:", error);
      setError("Failed to fetch streak information");
    } finally {
      setIsLoading(false);
    }
  }, [connectedAddress, walletClient]);

  // Handle check-in
  const handleCheckIn = async () => {
    if (!connectedAddress || !walletClient || !streakInfo?.canCheckInToday)
      return;

    try {
      setIsCheckingIn(true);
      setError(null);

      console.log("🎯 Attempting check-in...");

      // Convert walletClient to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        STREAK_TRACKER_ADDRESS,
        STREAK_TRACKER_ABI.abi,
        signer
      );

      const tx = await contract.checkIn();
      console.log("📝 Check-in transaction sent:", tx.hash);

      await tx.wait();
      console.log("✅ Check-in transaction confirmed");

      // Refresh streak info after successful check-in
      await fetchStreakInfo();
    } catch (error) {
      console.error("❌ Error during check-in:", error);
      setError("Failed to check in. Please try again.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Fetch streak info when wallet connects
  useEffect(() => {
    console.log("🔍 StreakTracker useEffect:", {
      isConnected,
      connectedAddress,
      walletClient: !!walletClient,
    });
    if (isConnected && connectedAddress && walletClient) {
      console.log("🚀 StreakTracker: Starting to fetch streak info");
      fetchStreakInfo();
    } else {
      console.log("⚠️ StreakTracker: Not fetching - missing requirements");
      setStreakInfo(null);
    }
  }, [isConnected, connectedAddress, walletClient, fetchStreakInfo]);

  // Don't show if wallet is not connected
  if (!isConnected || !connectedAddress) {
    console.log("🔍 StreakTracker: Wallet not connected", {
      isConnected,
      connectedAddress,
    });
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-orange-400/20 via-pink-400/20 via-purple-500/20 to-blue-600/20 border border-border rounded-xl p-4 mx-6 mb-4 mt-2">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-3"></div>
          <span className="text-sm text-muted-foreground">
            Loading streak data...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mx-6 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-destructive">{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchStreakInfo}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No streak data
  if (!streakInfo) {
    console.log("🔍 StreakTracker: No streak data available");
    return (
      <div className="bg-gradient-to-r from-orange-400/20 via-pink-400/20 via-purple-500/20 to-blue-600/20 border border-border rounded-xl p-4 mx-6 mb-4 mt-2">
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            No streak data available
          </span>
        </div>
      </div>
    );
  }

  const { streak, canCheckInToday } = streakInfo;
  const progressPercentage = Math.min((streak.currentStreak / 1000) * 100, 100);
  const longestStreakPercentage = Math.min(
    (streak.longestStreak / 1000) * 100,
    100
  );

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-r from-orange-400/20 via-pink-400/20 via-purple-500/20 to-blue-600/20 border border-border rounded-xl p-4 mx-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Daily Check-in Streak</h3>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{streak.totalCheckIns}</span>
          </div>

          {streak.longestStreak > streak.currentStreak && (
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">Best:</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {streak.longestStreak}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Current Streak</span>
          <span className="text-sm font-bold">{streak.currentStreak} days</span>
        </div>

        <div className="relative h-3 bg-background/50 rounded-full overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 via-purple-500 to-blue-600 opacity-20"></div>

          {/* Current streak progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 via-pink-400 via-purple-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>

          {/* Longest streak marker (if different from current) */}
          {streak.longestStreak > streak.currentStreak && (
            <div
              className="absolute top-0 h-full w-1 bg-yellow-400 shadow-lg"
              style={{ left: `${longestStreakPercentage}%` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-background"></div>
            </div>
          )}
        </div>

        {/* Longest streak indicator */}
        {streak.longestStreak > streak.currentStreak && (
          <div className="flex items-center justify-end mt-1">
            <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Longest: {streak.longestStreak}
            </span>
          </div>
        )}
      </div>

      {/* Check-in Button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {canCheckInToday ? (
            <span className="text-green-600 dark:text-green-400">
              Ready to check in!
            </span>
          ) : (
            <span>Already checked in today</span>
          )}
        </div>

        <Button
          onClick={handleCheckIn}
          disabled={!canCheckInToday || isCheckingIn}
          size="sm"
          className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white border-0"
        >
          {isCheckingIn ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Checking in...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Check In
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
