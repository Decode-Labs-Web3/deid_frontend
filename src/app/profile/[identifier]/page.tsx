"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustWheel } from "@/components/charts/TrustWheel";
import { Loader2, AlertCircle, ArrowLeft, User } from "lucide-react";
import {
  OnChainProfileData,
  checkOnChainProfile,
  resolveUsernameToAddress,
} from "@/utils/onchain.utils";
import { ethers } from "ethers";
import DEID_PROFILE_ABI from "@/contracts/core/DEiDProfile.sol/DEiDProfile.json";
import { fetchAllUserBadges, type UserBadge } from "@/utils/badge.utils";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { Leaderboard } from "@/components/score/Leaderboard";
import { ScoreCard } from "@/components/score/ScoreCard";
import { useScore } from "@/hooks/useScore";

// Contract configuration - using environment variable or fallback
const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

const UserProfile = () => {
  const params = useParams();
  const router = useRouter();
  const identifier = params.identifier as string;

  const [profileData, setProfileData] = useState<OnChainProfileData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [onChainAccounts, setOnChainAccounts] = useState<
    { platform: string; accountId: string }[]
  >([]);

  // Detect if identifier is wallet address or username
  const isWalletAddress = (id: string) => /^0x[a-fA-F0-9]{40}$/.test(id);

  // Fetch on-chain social accounts
  const fetchOnChainAccounts = useCallback(async (walletAddress: string) => {
    try {
      console.log("🔗 Fetching on-chain social accounts for:", walletAddress);

      // Create read-only provider
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_TESTNET_RPC_URL
      );

      // Use proxy address with DEiDProfile ABI (Diamond pattern)
      const contract = new ethers.Contract(
        PROXY_ADDRESS as string,
        DEID_PROFILE_ABI.abi,
        provider
      );

      // Call getSocialAccounts - returns (string[] platforms, string[] accountIds)
      const [platforms, accountIds] = await contract.getSocialAccounts(
        walletAddress
      );

      console.log("✅ On-chain accounts:", { platforms, accountIds });

      // Map the results
      const onChainAccountsList = platforms.map(
        (platform: string, index: number) => ({
          platform: platform.toLowerCase(),
          accountId: accountIds[index],
        })
      );

      setOnChainAccounts(onChainAccountsList);
      return onChainAccountsList;
    } catch (error) {
      console.error("❌ Error fetching on-chain accounts:", error);
      setOnChainAccounts([]);
      return [];
    }
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("\n🎯 ==== PROFILE PAGE: Starting data fetch ====");
        console.log("📝 Identifier:", identifier);
        console.log("🔍 Is wallet address:", isWalletAddress(identifier));

        setLoading(true);
        setError(null);

        let walletAddress: string;

        if (isWalletAddress(identifier)) {
          // Direct wallet address
          walletAddress = identifier;
          console.log("✅ Using wallet address directly:", walletAddress);
        } else {
          // Username - resolve to wallet address first
          console.log("👤 Resolving username to wallet address...");
          console.log("  Username:", identifier);

          const resolvedAddress = await resolveUsernameToAddress(identifier);
          console.log("  Resolved address:", resolvedAddress);

          if (!resolvedAddress) {
            console.error("❌ Username not found on-chain:", identifier);
            throw new Error(`Username "${identifier}" not found on-chain`);
          }

          walletAddress = resolvedAddress;
          console.log(
            "✅ Successfully resolved username to address:",
            walletAddress
          );
        }

        // Fetch on-chain profile data
        console.log("\n📋 Fetching on-chain profile data...");
        console.log("  Wallet address:", walletAddress);

        const onChainProfile = await checkOnChainProfile(walletAddress);
        console.log(
          "  Profile data received:",
          onChainProfile ? "✅ Yes" : "❌ No"
        );

        if (!onChainProfile) {
          console.error("❌ No on-chain profile found");
          throw new Error("No on-chain profile found for this address");
        }

        console.log("✅ Profile data structure:", {
          username: onChainProfile.profile?.username,
          hasMetadata: !!onChainProfile.profile_metadata,
          socialAccountsCount: onChainProfile.socialAccounts?.length || 0,
        });

        setProfileData(onChainProfile);
        console.log("✅ Profile data set in state");

        // Fetch user badges
        console.log("\n🏆 Fetching user badges...");
        fetchUserBadges(walletAddress);

        // Fetch on-chain social accounts
        console.log("\n🔗 Fetching on-chain social accounts...");
        await fetchOnChainAccounts(walletAddress);

        console.log("✅ ==== PROFILE PAGE: Data fetch complete ====\n");
      } catch (error) {
        console.error("\n❌ ==== PROFILE PAGE: Error loading profile ====");
        console.error("Error details:", error);
        console.error(
          "Error message:",
          error instanceof Error ? error.message : String(error)
        );
        console.error("====================================\n");

        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
      } finally {
        setLoading(false);
        console.log("🏁 Profile fetch process completed");
      }
    };

    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  // Fetch user badges
  const fetchUserBadges = async (walletAddress: string) => {
    console.log("  🏆 Starting badge fetch...");
    console.log("    Wallet:", walletAddress);

    try {
      const badges = await fetchAllUserBadges(walletAddress);
      console.log(`  ✅ Badges loaded: ${badges.length} badge(s)`);
      if (badges.length > 0) {
        console.log("    First badge:", badges[0]);
      }
      setUserBadges(badges);
    } catch (error) {
      console.error("  ❌ Error fetching badges:", error);
      setError("Failed to load badges");
    } finally {
      // setBadgesLoading(false); // This line is removed
    }
  };

  // walletAddress from profile_metadata.primary_wallet.address (if available)
  const walletAddress = profileData?.profile_metadata?.primary_wallet?.address;
  const { score } = useScore(walletAddress);

  if (loading) {
    console.log("🔄 Rendering loading state...");
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    console.log("❌ Rendering error state:", error);
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-8">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!profileData) {
    console.log("⚠️ Rendering no profile data state");
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Profile Data</h2>
              <p className="text-muted-foreground">
                Unable to load profile information
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  console.log("✅ Rendering profile page with data:", {
    username: profileData.profile?.username,
    displayName: profileData.profile_metadata?.display_name,
    badgeCount: userBadges.length,
    socialAccountCount: onChainAccounts.length,
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Top row: 2 columns, responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ProfileCard
            username={profileData?.profile_metadata?.username}
            display_name={profileData?.profile_metadata?.display_name}
            bio={profileData?.profile_metadata?.bio}
            avatar_ipfs_hash={profileData?.profile_metadata?.avatar_ipfs_hash}
            primary_wallet_address={walletAddress}
            socialAccounts={onChainAccounts}
          />
          <TrustWheel address={walletAddress} />
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
