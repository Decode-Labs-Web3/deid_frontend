"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StreakTracker } from "@/components/layout/StreakTracker";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { StatCard } from "@/components/cards/StatCard";
import { TrustWheel } from "@/components/charts/TrustWheel";
import { MetricCard } from "@/components/cards/MetricCard";
import { NFTCard } from "@/components/cards/NFTCard";
import { getSessionId, logout } from "@/utils/session.utils";
import { checkOnChainProfile, OnChainProfileData } from "@/utils/onchain.utils";
import { useRouter } from "next/navigation";

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

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProfileData;
  requestId: string | null;
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
        console.log("🚀 Starting profile data fetch...");
        setLoading(true);
        setError(null);

        const sessionId = getSessionId();
        console.log("🔑 Session ID:", sessionId);

        if (!sessionId) {
          console.log("❌ No session found");
          throw new Error("No session found");
        }

        // Use the same backend URL as the API route, but make it accessible to client
        const backendUrl =
          process.env.DEID_AUTH_BACKEND || "http://localhost:8000";
        const apiUrl = `${backendUrl}/api/v1/decode/my-profile`;

        console.log("🌐 Backend URL:", backendUrl);
        console.log("📡 API URL:", apiUrl);
        console.log("🔑 Session ID:", sessionId);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `deid_session_id=${sessionId}`,
          },
          credentials: "include",
        });

        console.log("📡 HTTP Response Status:", response.status);
        console.log("📡 HTTP Response OK:", response.ok);
        console.log(
          "📡 Response Headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Session invalid, logout user
            logout();
            return;
          }
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const apiResponse: ApiResponse = await response.json();
        console.log("📊 API Response:", apiResponse);

        if (!apiResponse.success) {
          throw new Error(apiResponse.message || "Failed to fetch profile");
        }

        const userData = apiResponse.data;
        setProfileData(userData);

        // Check on-chain profile using the primary wallet address
        const walletAddress = userData.primary_wallet?.address;

        if (walletAddress) {
          console.log("🔍 Checking on-chain profile...");
          const onChainProfile = await checkOnChainProfile(walletAddress);

          if (!onChainProfile) {
            console.log(
              "❌ No on-chain profile found, redirecting to create-account"
            );
            sessionStorage.setItem("primaryWalletAddress", walletAddress);
            console.log("Primary wallet address stored:", walletAddress);
            router.push("/create-account");
            return;
          }

          console.log("✅ On-chain profile found:", onChainProfile);
          setOnChainData(onChainProfile);
        } else {
          console.log(
            "❌ No primary wallet address found, please set your primary wallet address in Decode Portal"
          );
          setError(
            "No primary wallet address found. Please set your primary wallet address in Decode Portal."
          );
          return;
        }

        // Fetch NFTs for the primary wallet
        if (walletAddress) {
          await fetchNFTs(walletAddress);
        }

        console.log("✅ Profile data fetch completed successfully");
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );

        // If it's a session error, logout the user
        if (error instanceof Error && error.message.includes("session")) {
          console.log("🔓 Session error detected, logging out user");
          logout();
        }
      } finally {
        console.log("🏁 Profile fetch process completed");
        setLoading(false);
      }
    };

    console.log("🎯 Profile component mounted, starting data fetch...");
    fetchProfileData();
  }, [router]);

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
    const isWalletError = error.includes("primary wallet address");

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
                <button
                  onClick={() =>
                    window.open(
                      "https://app.decodenetwork.app/dashboard/wallets",
                      "_blank"
                    )
                  }
                  className="px-6 py-2 bg-[#CA4A87] text-white rounded-md hover:bg-[#b13e74] transition-colors"
                >
                  Go to Decode Wallets
                </button>
              ) : null}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
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
