"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-52 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Fetching user data and checking on-chain profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isWalletError = error.includes("primary wallet address");

    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-52 flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-52">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ProfileCard
                username={
                  onChainData?.profile_metadata?.username ??
                  profileData?.username
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
            <h2 className="text-2xl font-bold mb-6">NFT Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NFTCard />
              <NFTCard />
              <NFTCard />
              <NFTCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
