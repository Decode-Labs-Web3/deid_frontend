"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SocialAccountItem } from "@/components/cards/SocialAccountItem";
import {
  VerifyBadgeCard,
  EmptyBadgeState,
} from "@/components/cards/VerifyBadgeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Loader2,
  AlertCircle,
  ArrowLeft,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import {
  OnChainProfileData,
  checkOnChainProfile,
  resolveUsernameToAddress,
} from "@/utils/onchain.utils";
import {
  fetchAllUserBadges,
  getIPFSGateways,
  type UserBadge,
} from "@/utils/badge.utils";
import { toastSuccess } from "@/utils/toast.utils";

const UserProfile = () => {
  const params = useParams();
  const router = useRouter();
  const identifier = params.identifier as string;

  const [profileData, setProfileData] = useState<OnChainProfileData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/deid_logo.png");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [onChainAccounts, setOnChainAccounts] = useState<
    { platform: string; accountId: string }[]
  >([]);

  // Detect if identifier is wallet address or username
  const isWalletAddress = (id: string) => /^0x[a-fA-F0-9]{40}$/.test(id);

  // Fetch on-chain social accounts
  const fetchOnChainAccounts = useCallback(
    async (walletAddress: string) => {
      try {
        console.log("  🔗 Starting social accounts fetch...");
        console.log("    Wallet:", walletAddress);
        console.log("    Profile data available:", !!profileData);
        console.log(
          "    Social accounts in profile:",
          profileData?.socialAccounts?.length || 0
        );

        // This would need to be implemented similar to the identity page
        // For now, we'll use the social accounts from the profile data
        if (profileData?.socialAccounts) {
          const accounts = profileData.socialAccounts.map((account) => ({
            platform: account.platform.toLowerCase(),
            accountId: account.accountId,
          }));
          console.log(`  ✅ Mapped ${accounts.length} social account(s):`);
          accounts.forEach((acc, i) => {
            console.log(`    ${i + 1}. ${acc.platform}: ${acc.accountId}`);
          });
          setOnChainAccounts(accounts);
        } else {
          console.log("  ℹ️ No social accounts found in profile data");
          setOnChainAccounts([]);
        }
      } catch (error) {
        console.error("  ❌ Error fetching on-chain accounts:", error);
        setOnChainAccounts([]);
      }
    },
    [profileData]
  );

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

  // Fetch avatar from IPFS when profile metadata is available
  useEffect(() => {
    const fetchAvatarFromIPFS = async () => {
      const avatarHash = profileData?.profile_metadata?.avatar_ipfs_hash;
      if (!avatarHash) return;

      try {
        setAvatarLoading(true);
        console.log("🌐 Fetching avatar from IPFS hash:", avatarHash);

        // Try multiple IPFS gateways with fallback
        const gateways = getIPFSGateways();
        const gatewayUrls = gateways.map(
          (gateway) => `${gateway}/${avatarHash}`
        );

        for (const gatewayUrl of gatewayUrls) {
          try {
            const response = await fetch(gatewayUrl, {
              method: "HEAD",
              signal: AbortSignal.timeout(5000),
            });

            if (response.ok) {
              setAvatarUrl(gatewayUrl);
              console.log("✅ Avatar loaded from IPFS:", gatewayUrl);
              return;
            }
          } catch (error) {
            console.warn(
              `⚠️ Failed to fetch avatar from ${gatewayUrl}:`,
              error
            );
            continue;
          }
        }

        console.log("❌ Avatar not found on any IPFS gateway, using default");
      } catch (error) {
        console.error("❌ Error fetching avatar from IPFS:", error);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchAvatarFromIPFS();
  }, [profileData?.profile_metadata?.avatar_ipfs_hash]);

  // Fetch user badges
  const fetchUserBadges = async (walletAddress: string) => {
    setBadgesLoading(true);
    setBadgesError(null);
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
      setBadgesError("Failed to load badges");
    } finally {
      setBadgesLoading(false);
    }
  };

  // Get wallet addresses from profile data
  const walletAddresses =
    profileData?.profile_metadata?.wallets?.map((wallet) => wallet.address) ||
    [];
  const primaryWalletAddress =
    profileData?.profile_metadata?.primary_wallet?.address;

  // Helper to check if the avatarUrl is an external URL (e.g., IPFS)
  const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

  // Helper to format date
  // Formats the timestamp into a human-readable difference: "x days/months/years ago"
  const formatDate = (timestamp: number) => {
    const eventDate = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - eventDate.getTime();

    const msInDay = 24 * 60 * 60 * 1000;
    const msInMonth = msInDay * 30.44; // Average month (30.44 days)
    const msInYear = msInDay * 365.25; // Average year (365.25 days)

    if (diffMs < msInDay) {
      return "Today";
    } else if (diffMs < msInDay * 2) {
      return "Yesterday";
    } else if (diffMs < msInMonth) {
      const days = Math.floor(diffMs / msInDay);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (diffMs < msInYear) {
      const months = Math.floor(diffMs / msInMonth);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffMs / msInYear);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  };

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
    walletCount: walletAddresses.length,
    badgeCount: userBadges.length,
    socialAccountCount: onChainAccounts.length,
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-8">
        {/* Back Button */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              DEiD Profile
            </h2>

            {/* Profile Header */}
            <div className="flex items-start gap-6">
              <div className="relative w-28 h-28">
                {/* Gradient frame */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#CA4A87] via-[#b13e74] to-[#a0335f] p-0.5">
                  <div className="w-full h-full rounded-2xl bg-background overflow-hidden">
                    {isExternalUrl(avatarUrl) ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                {avatarLoading && (
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-background/50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-1">
                  {profileData.profile_metadata?.display_name || "Unknown User"}
                </h3>
                <p className="text-muted-foreground">
                  @{profileData.profile_metadata?.username || "unknown"}{" "}
                  <span
                    className="text-sm ml-1 font-bold"
                    style={{
                      color: "#ff72e1",
                      textShadow:
                        "0 0 1px #ff72e1, 0 0 1px #ffb6f9, 0 0 1px #e75480",
                    }}
                  >
                    .deid
                  </span>
                </p>
                {profileData.profile_metadata?.bio && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {profileData.profile_metadata.bio}
                  </p>
                )}

                {/* Profile Stats */}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined {formatDate(profileData.profile.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Addresses */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Wallet Addresses</h4>
              {walletAddresses.length > 0 ? (
                walletAddresses.map((address, i) => {
                  const isPrimary = address === primaryWalletAddress;
                  return (
                    <div
                      key={i}
                      className={`bg-card border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-primary transition-colors ${
                        isPrimary
                          ? "border-yellow-500 bg-yellow-50/10"
                          : "border-border"
                      }`}
                    >
                      <Fingerprint
                        className={`w-5 h-5 ${
                          isPrimary ? "text-yellow-500" : "text-primary"
                        }`}
                      />
                      <span className="font-mono text-sm flex-1 truncate">
                        <span className="hidden sm:inline">{address}</span>
                        <span className="sm:hidden">
                          {address.slice(0, 5)}...{address.slice(-4)}
                        </span>
                      </span>
                      {isPrimary && (
                        <Badge variant="secondary" className="text-xs">
                          PRIMARY
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                          toastSuccess("Address copied to clipboard");
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No wallet addresses found
                  </span>
                </div>
              )}
            </div>

            {/* DEiD Badges */}
            <div>
              <h4 className="text-lg font-semibold mb-4">DEiD Badges</h4>

              {badgesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Loading badges...
                  </span>
                </div>
              )}

              {badgesError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {badgesError}
                  </span>
                </div>
              )}

              {!badgesLoading && !badgesError && (
                <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {userBadges.length > 0 ? (
                    userBadges.map((badge) => (
                      <VerifyBadgeCard
                        key={badge.tokenId}
                        badge={badge}
                        onImageError={() => {
                          console.warn(
                            `🖼️ Image error for badge ${badge.tokenId}`
                          );
                        }}
                      />
                    ))
                  ) : (
                    <EmptyBadgeState />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Social Accounts */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              Social Accounts
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {onChainAccounts.length > 0 ? (
                onChainAccounts.map((account, index) => (
                  <SocialAccountItem
                    key={`${account.platform}-${account.accountId}-${index}`}
                    platform={account.platform}
                    username={account.accountId}
                    account_id={account.accountId}
                    created_at={new Date().toISOString()}
                    onValidate={() => {}} // No validation for view-only mode
                    isValidating={false}
                    isOnChain={true}
                    isReadOnly={true} // Add this prop to make it read-only
                  />
                ))
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    No social accounts linked
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This user hasn&apos;t linked any social accounts yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
