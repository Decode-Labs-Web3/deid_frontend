"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StreakTracker } from "@/components/layout/StreakTracker";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { StatCard } from "@/components/cards/StatCard";
import { TrustWheel } from "@/components/charts/TrustWheel";
import { MetricCard } from "@/components/cards/MetricCard";
import { NFTCard } from "@/components/cards/NFTCard";
import { checkOnChainProfile, OnChainProfileData } from "@/utils/onchain.utils";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

interface PrimaryWallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProfileData {
  _id: string;
  email: string | null;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
  primary_wallet: PrimaryWallet;
  wallets: unknown;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: unknown[];
  // Score properties (these might come from a different API or be calculated)
  taskScore?: number;
  socialScore?: number;
  chainScore?: number;
  trustScore?: number;
  __v: number;
}

interface NFTData {
  token_address: string;
  token_id: string;
  name: string;
  description?: string;
  image?: string;
  contract_type: string;
  symbol?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [onChainData, setOnChainData] = useState<OnChainProfileData | null>(
    null
  );
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [nftChain, setNftChain] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [nftLoading, setNftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();

  // Function to fetch NFTs
  const fetchNFTs = async (walletAddress: string) => {
    try {
      setNftLoading(true);
      console.log("🖼️ Fetching NFTs for wallet:", walletAddress);

      const response = await fetch(`/api/nft?wallet=${walletAddress}`);
      console.log("🔍 NFT response:", response);

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const nftResponse = await response.json();

      if (nftResponse.success) {
        setNftData(nftResponse.data);
        setNftChain(nftResponse.chain || "");
        console.log(
          `✅ Fetched ${nftResponse.data.length} NFTs from ${
            nftResponse.chain || "unknown chain"
          }`
        );
      } else {
        console.log("⚠️ No NFTs found or error:", nftResponse.error);
        setNftData([]);
        setNftChain("");
      }
    } catch (error) {
      console.error("❌ Error fetching NFTs:", error);
      setNftData([]);
    } finally {
      setNftLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("🚀 Starting profile data fetch from IPFS...");
        setLoading(true);
        setError(null);

        // Check if wallet is connected
        if (!isConnected || !connectedAddress) {
          console.log("❌ No wallet connected");
          setError("Please connect your wallet to view your profile");
          return;
        }

        console.log("🔗 Connected wallet address:", connectedAddress);

        // Fetch on-chain profile data directly from IPFS
        console.log("🔍 Fetching on-chain profile from IPFS...");
        const onChainProfile = await checkOnChainProfile(connectedAddress);

        if (!onChainProfile) {
          console.log(
            "❌ No on-chain profile found, redirecting to create-account"
          );
          sessionStorage.setItem("primaryWalletAddress", connectedAddress);
          console.log("Primary wallet address stored:", connectedAddress);
          router.push("/create-account");
          return;
        }

        console.log("✅ On-chain profile found:", onChainProfile);
        setOnChainData(onChainProfile);

        // Create profile data from on-chain data for compatibility
        if (onChainProfile.profile_metadata) {
          const metadata = onChainProfile.profile_metadata;
          const profileDataFromIPFS: ProfileData = {
            _id: metadata.decode_user_id || "",
            email: null,
            username: metadata.username,
            display_name: metadata.display_name,
            bio: metadata.bio,
            avatar_ipfs_hash: metadata.avatar_ipfs_hash,
            role: "user",
            last_login: new Date().toISOString(),
            is_active: true,
            primary_wallet: {
              _id: metadata.primary_wallet.id || "",
              address: metadata.primary_wallet.address,
              user_id: metadata.primary_wallet.user_id,
              name_service: metadata.primary_wallet.name_service,
              is_primary: metadata.primary_wallet.is_primary,
              createdAt: metadata.primary_wallet.created_at,
              updatedAt: metadata.primary_wallet.updated_at,
              __v: metadata.primary_wallet.version,
            },
            wallets: metadata.wallets.map((wallet) => ({
              _id: wallet.id || "",
              address: wallet.address,
              user_id: wallet.user_id,
              name_service: wallet.name_service,
              is_primary: wallet.is_primary,
              createdAt: wallet.created_at,
              updatedAt: wallet.updated_at,
              __v: wallet.version,
            })),
            following_number: 0,
            followers_number: 0,
            is_following: false,
            is_follower: false,
            is_blocked: false,
            is_blocked_by: false,
            mutual_followers_number: 0,
            mutual_followers_list: [],
            taskScore: 0,
            socialScore: 0,
            chainScore: 0,
            trustScore: 0,
            __v: 0,
          };
          setProfileData(profileDataFromIPFS);
        }

        // Fetch NFTs for the connected wallet
        await fetchNFTs(connectedAddress);

        console.log("✅ Profile data fetch completed successfully");
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
      } finally {
        console.log("🏁 Profile fetch process completed");
        setLoading(false);
      }
    };

    // Only fetch if wallet is connected
    if (isConnected && connectedAddress) {
      console.log("🎯 Profile component mounted, starting data fetch...");
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [router, isConnected, connectedAddress]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Fetching user data and checking on-chain profile
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
              Error loading profile
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
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <StreakTracker />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ProfileCard
              username={
                onChainData?.profile_metadata?.username ?? profileData?.username
              }
              display_name={
                onChainData?.profile_metadata?.display_name ??
                profileData?.display_name
              }
              bio={onChainData?.profile_metadata?.bio ?? profileData?.bio}
              avatar_ipfs_hash={
                onChainData?.profile_metadata?.avatar_ipfs_hash ??
                profileData?.avatar_ipfs_hash
              }
              primary_wallet_address={profileData?.primary_wallet?.address}
            />
            <div className="bg-card border border-border rounded-xl p-6 grid grid-cols-3 gap-6">
              <StatCard
                title="Task Score"
                value={profileData?.taskScore || 0}
                total={213}
              />
              <StatCard
                title="Social Score"
                value={profileData?.socialScore || 0}
                total={112}
              />
              <StatCard
                title="Chain Score"
                value={profileData?.chainScore || 0}
                total={240}
              />
            </div>
          </div>

          <TrustWheel />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Trust Score"
            value={profileData?.trustScore || 0}
            change={12}
            status="Above average"
            color="#4F46E5"
          />
          <MetricCard
            title="Weekly Task"
            value={62}
            change={4}
            status="Slightly above average"
            color="#06B6D4"
          />
          <MetricCard
            title="Trust Voted"
            value={31}
            change={-12}
            status="Below average"
            color="#EF4444"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">NFT Collections</h2>
            {nftData.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span>
                  {nftData.length} NFT{nftData.length !== 1 ? "s" : ""}
                </span>
                {nftChain && (
                  <span className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                    {nftChain.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          {nftLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading NFTs...</p>
              </div>
            </div>
          ) : nftData.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nftData.map((nft) => (
                <NFTCard
                  key={`${nft.token_address}-${nft.token_id}`}
                  token_address={nft.token_address}
                  token_id={nft.token_id}
                  name={nft.name}
                  description={nft.description}
                  image={nft.image}
                  contract_type={nft.contract_type}
                  symbol={nft.symbol}
                  attributes={nft.attributes}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">No NFTs found</p>
                <p className="text-sm text-muted-foreground">
                  This wallet doesn&apos;t have any NFTs on Sepolia network
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
