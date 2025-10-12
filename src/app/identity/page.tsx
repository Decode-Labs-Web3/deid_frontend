"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BadgeCard } from "@/components/cards/BadgeCard";
import { X, Fingerprint } from "lucide-react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { OnChainProfileData, checkOnChainProfile } from "@/utils/onchain.utils";

const Identity = () => {
  const [onChainData, setOnChainData] = useState<OnChainProfileData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/deid_logo.png");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { address: connectedAddress, isConnected } = useAccount();

  // Fetch on-chain profile data
  useEffect(() => {
    const fetchIdentityData = async () => {
      try {
        console.log("🚀 Starting identity data fetch from IPFS...");
        setLoading(true);
        setError(null);

        // Check if wallet is connected
        if (!isConnected || !connectedAddress) {
          console.log("❌ No wallet connected");
          setError("Please connect your wallet to view your identity");
          return;
        }

        console.log("🔗 Connected wallet address:", connectedAddress);

        // Fetch on-chain profile data directly using IPFS utils
        console.log("🔍 Fetching on-chain profile directly from IPFS...");
        const onChainProfile = await checkOnChainProfile(connectedAddress);

        if (!onChainProfile) {
          throw new Error("No on-chain profile found for this wallet address");
        }
        console.log(
          "📊 Raw IPFS data fetched via ipfs.utils.ts:",
          JSON.stringify(onChainProfile, null, 2)
        );
        console.log(
          "📊 Profile metadata from IPFS utils:",
          onChainProfile.profile_metadata
        );
        console.log(
          "📊 Social accounts from IPFS utils:",
          onChainProfile.socialAccounts
        );
        console.log(
          "📊 Wallets from IPFS utils:",
          onChainProfile.profile_metadata?.wallets
        );
        console.log(
          "📊 Primary wallet from IPFS utils:",
          onChainProfile.profile_metadata?.primary_wallet
        );

        setOnChainData(onChainProfile);
        console.log("✅ Identity data fetch completed successfully");
      } catch (error) {
        console.error("❌ Identity fetch error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load identity"
        );
      } finally {
        console.log("🏁 Identity fetch process completed");
        setLoading(false);
      }
    };

    // Only fetch if wallet is connected
    if (isConnected && connectedAddress) {
      console.log("🎯 Identity component mounted, starting data fetch...");
      fetchIdentityData();
    } else {
      setLoading(false);
    }
  }, [isConnected, connectedAddress]);

  // Fetch avatar from IPFS when profile metadata is available
  useEffect(() => {
    const fetchAvatarFromIPFS = async () => {
      const avatarHash = onChainData?.profile_metadata?.avatar_ipfs_hash;
      if (!avatarHash) return;

      try {
        setAvatarLoading(true);
        console.log("🌐 Fetching avatar from IPFS hash:", avatarHash);

        // Try multiple IPFS gateways with fallback (same as ProfileCard)
        const gateways = [
          `http://35.247.142.76:8080/ipfs/${avatarHash}`,
          `https://ipfs.io/ipfs/${avatarHash}`,
          `https://gateway.pinata.cloud/ipfs/${avatarHash}`,
          `https://cloudflare-ipfs.com/ipfs/${avatarHash}`,
        ];

        for (const gatewayUrl of gateways) {
          try {
            const response = await fetch(gatewayUrl, {
              method: "HEAD", // Just check if the resource exists
              signal: AbortSignal.timeout(5000),
            });

            if (response.ok) {
              setAvatarUrl(gatewayUrl);
              console.log(
                "✅ Avatar loaded successfully from IPFS:",
                gatewayUrl
              );
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
  }, [onChainData?.profile_metadata?.avatar_ipfs_hash]);

  // Get wallet addresses from IPFS data
  const walletAddresses =
    onChainData?.profile_metadata?.wallets?.map((wallet) => wallet.address) ||
    [];
  const primaryWalletAddress =
    onChainData?.profile_metadata?.primary_wallet?.address;

  // Get social accounts from IPFS data
  const socialAccounts =
    onChainData?.socialAccounts?.map((account) => ({
      id: account.accountId,
      username: account.platform,
      followers: 0, // Not available in current data structure
      age: "Unknown", // Not available in current data structure
    })) || [];

  const badges = Array(9).fill({
    title: "Golden Bitcoin Holder",
    description: "Hold >1 BTC",
  });

  // Helper to check if the avatarUrl is an external URL (e.g., IPFS)
  const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading identity...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Fetching data from IPFS using ipfs.utils.ts
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    const isWalletError = error.includes("connect your wallet");

    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">
              Error loading identity
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              {isWalletError ? (
                <p className="text-sm text-muted-foreground">
                  Please connect your wallet using the button in the top right
                  corner
                </p>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Decode Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              Decode Information
            </h2>

            <div className="flex items-start gap-6">
              <div className="relative">
                {isExternalUrl(avatarUrl) ? (
                  // Use <img> for external URLs (e.g., IPFS) to avoid next/image config issues
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="w-28 h-28 rounded-2xl object-cover"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  // Use next/image for local/static images
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="w-28 h-28 rounded-2xl object-cover"
                  />
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 w-28 h-28 rounded-2xl bg-background/50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-1">
                  {onChainData?.profile_metadata?.display_name ||
                    "Unknown User"}
                </h3>
                <p className="text-muted-foreground">
                  @{onChainData?.profile_metadata?.username || "unknown"}
                </p>
                {onChainData?.profile_metadata?.bio && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {onChainData.profile_metadata.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
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
                      <span className="font-mono text-sm">{address}</span>
                      {isPrimary && (
                        <span className="ml-auto text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold">
                          PRIMARY
                        </span>
                      )}
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

            <div>
              <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">
                Badges
              </h3>
              <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {badges.map((badge, i) => (
                  <BadgeCard
                    key={i}
                    title={badge.title}
                    description={badge.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Social Accounts */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              Social Accounts
            </h2>

            <div className="space-y-3 max-h-[900px] overflow-y-auto pr-2">
              {socialAccounts.length > 0 ? (
                socialAccounts.map((account, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors group"
                  >
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        platform: {account.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        account id: {account.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        followers: {account.followers}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        account age: {account.age}
                      </p>
                    </div>
                    <div className="bg-foreground text-background rounded-lg w-16 h-16 flex items-center justify-center group-hover:bg-destructive transition-colors cursor-pointer">
                      <X className="w-8 h-8" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    No social accounts found
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

export default Identity;
