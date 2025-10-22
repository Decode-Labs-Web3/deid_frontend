"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SocialAccountItem } from "@/components/cards/SocialAccountItem";
import { X, Fingerprint } from "lucide-react";
import Image from "next/image";
import { useAccount, useWalletClient } from "wagmi";
import { OnChainProfileData, checkOnChainProfile } from "@/utils/onchain.utils";
import { getPrimaryWalletAddress } from "@/utils/session.utils";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import DEID_PROFILE_ABI from "@/contracts/core/DEiDProfile.sol/DEiDProfile.json";
import DEID_PROXY_ABI from "@/contracts/core/DEiDProxy.sol/DEiDProxy.json";
import { IPFSLoadingAnimation, IPFSErrorAnimation } from "@/components/common";
import { toastInfo, toastError, toastSuccess } from "@/utils/toast.utils";
import {
  VerifyBadgeCard,
  EmptyBadgeState,
} from "@/components/cards/VerifyBadgeCard";
import {
  fetchAllUserBadges,
  getIPFSGateways,
  type UserBadge,
} from "@/utils/badge.utils";

// Contract configuration - using environment variable or fallback
const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfC336f4521eC2d95827d5c630A04587BFf4a160d";

interface UpdateProfileData {
  method: string;
  params: {
    metadataURI: string;
  };
  calldata: string;
  metadata: {
    username: string;
    display_name: string;
    bio: string;
    avatar_ipfs_hash: string;
    primary_wallet: {
      id: string;
      address: string;
      user_id: string;
      name_service: string | null;
      is_primary: boolean;
      created_at: string;
      updated_at: string;
      version: number;
    };
    wallets: unknown[];
    decode_user_id: string;
  };
  ipfs_hash: string;
  validator: {
    signature: string;
    signer: string;
    payload: string;
    message_hash: string;
    type: string;
  };
}

interface VerifiedSocialAccount {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  account_id: string;
  email: string | null;
  display_name: string;
  avatar_url: string;
  signature: string;
  verification_hash: string;
  status: string;
  tx_hash: string | null;
  block_number: number | null;
  created_at: string;
  updated_at: string;
}

const Identity = () => {
  const router = useRouter();
  const [onChainData, setOnChainData] = useState<OnChainProfileData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/deid_logo.png");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [syncMessage, setSyncMessage] = useState("");
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [verifiedAccounts, setVerifiedAccounts] = useState<
    VerifiedSocialAccount[]
  >([]);
  const [onChainAccounts, setOnChainAccounts] = useState<
    { platform: string; accountId: string }[]
  >([]);
  const [validatingAccount, setValidatingAccount] = useState<string | null>(
    null
  );
  const [refreshingAccounts, setRefreshingAccounts] = useState(false);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Fetch identity data (backend first, then on-chain using primary wallet)
  useEffect(() => {
    const fetchIdentityData = async () => {
      try {
        console.log("🚀 Starting identity data fetch...");
        setLoading(true);
        setError(null);

        // Step 1: Fetch user data from backend first
        console.log("📡 Fetching user data from backend...");
        const backendUrl =
          process.env.DEID_AUTH_BACKEND || "http://localhost:8888";
        const backendResponse = await fetch(
          `${backendUrl}/api/v1/decode/my-profile`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!backendResponse.ok) {
          throw new Error(`Backend API error: ${backendResponse.statusText}`);
        }

        const backendData = await backendResponse.json();

        if (!backendData.success || !backendData.data) {
          throw new Error("Failed to fetch user data from backend");
        }

        const userProfile = backendData.data;
        console.log("✅ Backend user data fetched:", userProfile);

        // Step 2: Store primary wallet address and user role in sessionStorage
        if (userProfile.primary_wallet?.address) {
          sessionStorage.setItem(
            "primaryWalletAddress",
            userProfile.primary_wallet.address
          );
          console.log(
            "💾 Primary wallet stored:",
            userProfile.primary_wallet.address
          );
        }

        // Store user role if available
        if (userProfile.role) {
          sessionStorage.setItem("userRole", userProfile.role);
          console.log("💾 User role stored:", userProfile.role);
        }

        // Step 3: Get primary wallet address (from sessionStorage or backend)
        const primaryWalletAddress =
          getPrimaryWalletAddress() || userProfile.primary_wallet?.address;

        if (!primaryWalletAddress) {
          throw new Error("No primary wallet address found");
        }

        console.log("🔗 Using primary wallet address:", primaryWalletAddress);

        // Step 4: Fetch on-chain profile data using primary wallet
        console.log("🔍 Fetching on-chain profile from IPFS...");
        const onChainProfile = await checkOnChainProfile(primaryWalletAddress);

        if (!onChainProfile) {
          console.log(
            "❌ No on-chain profile found, redirecting to create-account"
          );
          router.push("/create-account");
          return;
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

    // Fetch identity data on component mount
    console.log("🎯 Identity component mounted, starting data fetch...");
    fetchIdentityData();
  }, [router]);

  // Fetch avatar from IPFS when profile metadata is available
  useEffect(() => {
    const fetchAvatarFromIPFS = async () => {
      const avatarHash = onChainData?.profile_metadata?.avatar_ipfs_hash;
      if (!avatarHash) return;

      try {
        setAvatarLoading(true);
        console.log("🌐 Fetching avatar from IPFS hash:", avatarHash);

        // Try multiple IPFS gateways with fallback using centralized utility
        const gateways = getIPFSGateways();
        const gatewayUrls = gateways.map(
          (gateway) => `${gateway}/${avatarHash}`
        );

        for (const gatewayUrl of gatewayUrls) {
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

  // Fetch verified social accounts on component mount
  // Fetch verified accounts, on-chain accounts, and user badges on mount
  useEffect(() => {
    fetchVerifiedAccounts();

    if (connectedAddress) {
      fetchOnChainAccounts(connectedAddress);
      fetchUserBadges(connectedAddress);
    }
  }, [connectedAddress]);

  // Detect when user returns to tab after OAuth verification
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;

    const debouncedRefresh = () => {
      // Clear any existing timeout
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      // Set a new timeout to refresh after a short delay
      refreshTimeout = setTimeout(() => {
        console.log("🔄 Tab became active, refreshing verified accounts...");
        fetchVerifiedAccounts(true); // Show refreshing indicator
      }, 500); // 500ms delay to avoid excessive API calls
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        debouncedRefresh();
      }
    };

    const handleWindowFocus = () => {
      debouncedRefresh();
    };

    // Add event listeners for tab visibility and window focus
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Cleanup event listeners and timeout on component unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []);

  // Sync on-chain profile function
  const handleSyncProfile = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus("idle");
      setSyncMessage("");

      // Check if wallet is connected
      if (!isConnected || !connectedAddress || !walletClient) {
        throw new Error("Please connect your wallet first");
      }

      // Check if connected wallet is the primary wallet
      const primaryWalletAddress = getPrimaryWalletAddress();
      if (!primaryWalletAddress) {
        throw new Error("No primary wallet found. Please refresh the page.");
      }

      if (
        connectedAddress.toLowerCase() !== primaryWalletAddress.toLowerCase()
      ) {
        throw new Error(
          `Please connect your primary wallet (${primaryWalletAddress.slice(
            0,
            6
          )}...${primaryWalletAddress.slice(-6)}) to sync your profile`
        );
      }

      console.log("🔄 Starting profile sync...");
      console.log("👤 User Wallet:", connectedAddress);
      console.log("🔗 Contract:", PROXY_ADDRESS);
      console.log("✅ Connected to primary wallet:", primaryWalletAddress);

      // Fetch update profile data from backend
      console.log("📡 Fetching update profile data...");
      const backendUrl =
        process.env.DEID_AUTH_BACKEND || "http://localhost:8888";
      const response = await fetch(`${backendUrl}/api/v1/sync/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch update profile data");
      }

      const responseData = await response.json();

      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid response from backend");
      }

      const updateData: UpdateProfileData = responseData.data;
      console.log("✅ Update profile data received:", updateData);

      // Check if wallet client is on the correct chain
      if (walletClient.chain?.id !== 11155111) {
        console.error("❌ Wallet client is not on Ethereum Sepolia!");
        console.error("   Current chain ID:", walletClient.chain?.id);
        console.error("   Expected chain ID: 11155111");
        throw new Error("Please switch to Ethereum Sepolia in your wallet");
      }

      // Create ethers provider from wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Connect to contract using the same pattern as create profile
      let contract;

      try {
        // First try with DEiDProfile ABI
        console.log("🔧 Trying DEiDProfile ABI...");
        const DEiDProfileFactory = new ethers.ContractFactory(
          DEID_PROFILE_ABI.abi,
          DEID_PROFILE_ABI.bytecode,
          signer
        );
        contract = DEiDProfileFactory.attach(
          PROXY_ADDRESS as string
        ) as ethers.Contract;

        // Test if this ABI works
        await contract.getProfile(connectedAddress);
        console.log("✅ DEiDProfile ABI works with proxy");
      } catch {
        console.log("⚠️ DEiDProfile ABI failed, trying DEiDProxy ABI...");

        // Try with DEiDProxy ABI
        const DEiDProxyFactory = new ethers.ContractFactory(
          DEID_PROXY_ABI.abi,
          DEID_PROXY_ABI.bytecode,
          signer
        );
        contract = DEiDProxyFactory.attach(
          PROXY_ADDRESS as string
        ) as ethers.Contract;
        console.log("✅ Using DEiDProxy ABI");
      }

      console.log("✅ Connected to contract");

      // Prepare update data
      const metadataURI = updateData.params.metadataURI;
      const signature = updateData.validator.signature.startsWith("0x")
        ? updateData.validator.signature
        : `0x${updateData.validator.signature}`;

      console.log("\n📝 Update Data:");
      console.log("   Metadata URI:", metadataURI);
      console.log("   Signature:", signature);

      // Update profile
      console.log("\n✍️  Updating profile...");

      const tx = await contract.updateProfile(metadataURI, signature, {
        gasLimit: 500000,
        maxFeePerGas: ethers.parseUnits("100", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
      });

      console.log("   Transaction Hash:", tx.hash);
      console.log("   Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log("✅ Profile updated successfully!");
        console.log("   Block Number:", receipt.blockNumber);
        console.log("   Gas Used:", receipt.gasUsed.toString());

        // Verify profile
        const updatedProfile = await contract.getProfile(connectedAddress);
        console.log("\n✅ Profile verified:");
        console.log("   Username:", updatedProfile.username);
        console.log("   Metadata URI:", updatedProfile.metadataURI);
        console.log(
          "   Last Updated:",
          new Date(Number(updatedProfile.lastUpdated) * 1000).toISOString()
        );

        console.log(
          "\n🔗 Explorer Link:",
          `https://sepolia.etherscan.io/tx/${tx.hash}`
        );

        console.log("\n🎉 SUCCESS! Profile updated and verified!");

        setSyncStatus("success");
        setSyncMessage("Profile synced successfully! Refreshing data...");

        // Refresh the profile data after a short delay
        setTimeout(async () => {
          try {
            const refreshedProfile = await checkOnChainProfile(
              connectedAddress
            );
            if (refreshedProfile) {
              setOnChainData(refreshedProfile);
              console.log("✅ Profile data refreshed");
            }
          } catch (error) {
            console.error("❌ Error refreshing profile data:", error);
          }
        }, 2000);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Sync Error:", errorMessage);

      setSyncStatus("error");
      setSyncMessage(errorMessage || "Error syncing profile");
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch on-chain social accounts
  const fetchOnChainAccounts = async (walletAddress: string) => {
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
  };

  // Fetch user badges using utility function
  const fetchUserBadges = async (walletAddress: string) => {
    setBadgesLoading(true);
    setBadgesError(null);
    console.log("🏆 Starting badge fetch process for wallet:", walletAddress);

    const badges = await fetchAllUserBadges(walletAddress);
    console.log("✅ Badge fetch completed, setting badges:", badges);

    setUserBadges(badges);
    setBadgesLoading(false);
  };

  // Fetch verified social accounts
  const fetchVerifiedAccounts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshingAccounts(true);
      }
      console.log("🔍 Fetching verified social accounts...");
      const backendUrl =
        process.env.DEID_AUTH_BACKEND || "http://localhost:8888";

      const response = await fetch(
        `${backendUrl}/api/v1/social/links?status=verified`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch verified accounts: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success && data.data) {
        setVerifiedAccounts(data.data);
        console.log("✅ Verified accounts fetched:", data.data);
      } else {
        console.log("No verified accounts found");
        setVerifiedAccounts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching verified accounts:", error);
      setVerifiedAccounts([]);
    } finally {
      if (showRefreshing) {
        setRefreshingAccounts(false);
      }
    }
  };

  // Social platform connection handlers
  const handleSocialConnect = async (platform: string) => {
    try {
      setConnectingPlatform(platform);

      const backendUrl =
        process.env.DEID_AUTH_BACKEND || "http://localhost:8888";

      if (platform === "discord") {
        // Get Discord OAuth URL
        const response = await fetch(
          `${backendUrl}/api/v1/social/discord/oauth-url?deid_session_id=${encodeURIComponent(
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("deid_session_id="))
              ?.split("=")[1] || ""
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to get ${platform} OAuth URL`);
        }

        const data = await response.json();

        if (data.success && data.oauth_url) {
          // Open OAuth URL in new tab
          window.open(data.oauth_url, "_blank", "noopener,noreferrer");
          console.log(`✅ ${platform} OAuth URL opened:`, data.oauth_url);
        } else {
          throw new Error(`Invalid response for ${platform} OAuth`);
        }
      } else if (platform === "github") {
        // Get GitHub OAuth URL
        const response = await fetch(
          `${backendUrl}/api/v1/social/github/oauth-url?deid_session_id=${encodeURIComponent(
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("deid_session_id="))
              ?.split("=")[1] || ""
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to get ${platform} OAuth URL`);
        }

        const data = await response.json();

        if (data.success && data.oauth_url) {
          // Open OAuth URL in new tab
          window.open(data.oauth_url, "_blank", "noopener,noreferrer");
          console.log(`✅ ${platform} OAuth URL opened:`, data.oauth_url);
        } else {
          throw new Error(`Invalid response for ${platform} OAuth`);
        }
      } else if (platform === "google") {
        // Get Google OAuth URL
        const response = await fetch(
          `${backendUrl}/api/v1/social/google/oauth-url?deid_session_id=${encodeURIComponent(
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("deid_session_id="))
              ?.split("=")[1] || ""
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to get ${platform} OAuth URL`);
        }

        const data = await response.json();

        if (data.success && data.oauth_url) {
          // Open OAuth URL in new tab
          window.open(data.oauth_url, "_blank", "noopener,noreferrer");
          console.log(`✅ ${platform} OAuth URL opened:`, data.oauth_url);
        } else {
          throw new Error(`Invalid response for ${platform} OAuth`);
        }
      } else if (platform === "facebook") {
        // Get Facebook OAuth URL
        const response = await fetch(
          `${backendUrl}/api/v1/social/facebook/oauth-url?deid_session_id=${encodeURIComponent(
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("deid_session_id="))
              ?.split("=")[1] || ""
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to get ${platform} OAuth URL`);
        }

        const data = await response.json();

        if (data.success && data.oauth_url) {
          // Open OAuth URL in new tab
          window.open(data.oauth_url, "_blank", "noopener,noreferrer");
          console.log(`✅ ${platform} OAuth URL opened:`, data.oauth_url);
        } else {
          throw new Error(`Invalid response for ${platform} OAuth`);
        }
      } else {
        // Placeholder for other platforms
        console.log(`🚧 ${platform} connection not implemented yet`);
        toastInfo(
          `${platform} connection will be implemented soon!`,
          "Coming Soon"
        );
      }
    } catch (error) {
      console.error(`❌ Error connecting ${platform}:`, error);
      toastError(`Failed to connect ${platform}. Please try again.`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  // Handle account validation - Push social account to blockchain
  const handleValidateAccount = async (accountId: string) => {
    try {
      setValidatingAccount(accountId);
      console.log(`🔍 Validating account on-chain: ${accountId}`);

      // Find the account details from verified accounts
      const account = verifiedAccounts.find((acc) => acc.id === accountId);
      if (!account) {
        toastError("Account not found");
        return;
      }

      // Check if already on-chain
      if (account.tx_hash) {
        toastInfo(
          `Account ${account.username} is already verified on-chain`,
          "Already Verified"
        );
        return;
      }

      if (!walletClient) {
        toastError("Please connect your wallet first");
        return;
      }

      if (!connectedAddress) {
        toastError("No connected wallet address");
        return;
      }

      account.signature = account.signature.startsWith("0x")
        ? account.signature
        : `0x${account.signature}`;

      console.log("📝 Account details:", {
        platform: account.platform,
        accountId: account.account_id,
        signature: account.signature,
      });

      // Initialize contract through proxy
      const provider = new ethers.BrowserProvider(
        walletClient as unknown as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();

      // Use proxy address with DEiDProfile ABI (Diamond pattern)
      const contract = new ethers.Contract(
        PROXY_ADDRESS as string,
        DEID_PROFILE_ABI.abi,
        signer
      );

      console.log("📡 Calling linkSocialAccount on contract...");

      // Call linkSocialAccount function
      const tx = await contract.linkSocialAccount(
        account.platform,
        account.account_id,
        account.signature
      );

      console.log("⏳ Transaction sent:", tx.hash);
      toastSuccess(
        `Transaction submitted! Hash: ${tx.hash.substring(0, 10)}...`
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      toastSuccess(
        `Social account ${account.username} successfully verified on-chain!`,
        "On-Chain Verified"
      );

      // Refresh verified accounts and on-chain accounts
      await fetchVerifiedAccounts(false);
      if (connectedAddress) {
        await fetchOnChainAccounts(connectedAddress);
      }

      // Optionally, update the backend with tx_hash
      try {
        const backendUrl =
          process.env.DEID_AUTH_BACKEND || "http://localhost:8888";
        await fetch(`${backendUrl}/api/v1/social/links/${account.id}/tx-hash`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tx_hash: receipt.hash,
            block_number: receipt.blockNumber,
          }),
        });
        console.log("✅ Backend updated with tx_hash");
      } catch (backendError) {
        console.warn("⚠️ Failed to update backend with tx_hash:", backendError);
      }
    } catch (error) {
      console.error(`❌ Error validating account ${accountId}:`, error);

      // Better error messages
      const err = error as { code?: string; message?: string };
      if (err.code === "ACTION_REJECTED") {
        toastError("Transaction was rejected by user");
      } else if (err.message?.includes("already linked")) {
        toastInfo("This social account is already linked on-chain");
      } else if (err.message) {
        toastError(`Failed: ${err.message.substring(0, 100)}`);
      } else {
        toastError("Failed to validate account. Please try again.");
      }
    } finally {
      setValidatingAccount(null);
    }
  };

  // Get wallet addresses from IPFS data
  const walletAddresses =
    onChainData?.profile_metadata?.wallets?.map((wallet) => wallet.address) ||
    [];
  const primaryWalletAddress =
    onChainData?.profile_metadata?.primary_wallet?.address;

  // Note: socialAccounts from IPFS data is no longer used
  // We now fetch verified accounts directly from backend API

  if (loading) {
    return (
      <AppLayout>
        <IPFSLoadingAnimation />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <IPFSErrorAnimation
          errorMessage={error}
          onRetry={() => window.location.reload()}
        />
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
              Decentralized Identity
            </h2>

            <div className="flex items-start gap-6">
              <div className="relative w-28 h-28">
                {/* Gradient frame */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#CA4A87] via-[#b13e74] to-[#a0335f] p-0.5">
                  <div className="w-full h-full rounded-2xl bg-background overflow-hidden">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {avatarLoading && (
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-background/50 flex items-center justify-center">
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
                  @{onChainData?.profile_metadata?.username || "unknown"}{" "}
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

            <div className="space-y-4">
              {/* Sync Button */}
              <Button
                onClick={handleSyncProfile}
                disabled={(() => {
                  const primaryWallet = getPrimaryWalletAddress();
                  const isNotPrimaryWallet = Boolean(
                    isConnected &&
                      connectedAddress &&
                      primaryWallet &&
                      connectedAddress.toLowerCase() !==
                        primaryWallet.toLowerCase()
                  );

                  return (
                    isSyncing ||
                    !isConnected ||
                    !onChainData ||
                    isNotPrimaryWallet
                  );
                })()}
                className="w-full bg-gradient-to-r from-[#CA4A87] to-[#b13e74] hover:from-[#b13e74] hover:to-[#a0335f] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing Profile...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync On-Chain Profile
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {syncStatus === "success" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    {syncMessage}
                  </span>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 dark:text-red-200 text-xs break-words">
                    {syncMessage.length > 250
                      ? syncMessage.slice(0, 170) + "…"
                      : syncMessage}
                  </span>
                </div>
              )}

              {!isConnected && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Please connect your wallet to sync your profile
                  </span>
                </div>
              )}

              {isConnected &&
                connectedAddress &&
                getPrimaryWalletAddress() &&
                connectedAddress.toLowerCase() !==
                  getPrimaryWalletAddress()?.toLowerCase() && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-800 dark:text-orange-200 font-medium">
                      Please connect your primary wallet (
                      {getPrimaryWalletAddress()?.slice(0, 6)}...
                      {getPrimaryWalletAddress()?.slice(-6)}) to sync your
                      profile
                    </span>
                  </div>
                )}

              {isConnected && !onChainData && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    No on-chain profile found. Create a profile first.
                  </span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground mb-4 text-sm">
              Update your on-chain profile with the latest data from Decode
            </p>

            <div>
              <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">
                DEiD Badges
              </h3>

              {/* Badge Loading State */}
              {badgesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#CA4A87]" />
                  <span className="ml-2 text-muted-foreground">
                    Loading badges...
                  </span>
                </div>
              )}

              {/* Badge Error State */}
              {badgesError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {badgesError}
                  </span>
                </div>
              )}

              {/* Badges Grid */}
              {!badgesLoading && !badgesError && (
                <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

            {/* Sync On-Chain Profile Section */}
          </div>

          {/* Social Accounts */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              Social Accounts
            </h2>

            {/* Social Platform Icons */}
            <div className="w-full bg-card border border-border rounded-xl p-4">
              <div className="text-center mb-4">
                <p className="text-md text-muted-foreground">
                  <span className="font-semibold">
                    Choose Connected Platform
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => handleSocialConnect("discord")}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-[#5865F2]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  disabled={connectingPlatform !== null}
                  title="Connect Discord"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative">
                    <span
                      className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #F43F5E 0%, #F472B6 50%, #fff 100%)",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className="relative z-10">
                      {connectingPlatform === "discord" ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white animate-spin" />
                      ) : (
                        <Image
                          src="/discord-icon.png"
                          alt="Discord"
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                        />
                      )}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleSocialConnect("twitter")}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-[#1DA1F2]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  disabled={connectingPlatform !== null}
                  title="Connect Twitter"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative">
                    <span
                      className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #F43F5E 0%, #F472B6 50%, #fff 100%)",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className="relative z-10">
                      {connectingPlatform === "twitter" ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white animate-spin" />
                      ) : (
                        <Image
                          src="/x-icon.png"
                          alt="Twitter"
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                        />
                      )}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleSocialConnect("github")}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-[#333]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  disabled={connectingPlatform !== null}
                  title="Connect GitHub"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative">
                    <span
                      className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #F43F5E 0%, #F472B6 50%, #fff 100%)",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className="relative z-10">
                      {connectingPlatform === "github" ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white animate-spin" />
                      ) : (
                        <Image
                          src="/github-icon.png"
                          alt="GitHub"
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                        />
                      )}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleSocialConnect("google")}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-[#4285F4]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  disabled={connectingPlatform !== null}
                  title="Connect Google"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative">
                    <span
                      className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #F43F5E 0%, #F472B6 50%, #fff 100%)",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className="relative z-10">
                      {connectingPlatform === "google" ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white animate-spin" />
                      ) : (
                        <Image
                          src="/google_logo.png"
                          alt="Google"
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                        />
                      )}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleSocialConnect("facebook")}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-[#1877F2]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  disabled={connectingPlatform !== null}
                  title="Connect Facebook"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative">
                    <span
                      className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #F43F5E 0%, #F472B6 50%, #fff 100%)",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className="relative z-10">
                      {connectingPlatform === "facebook" ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white animate-spin" />
                      ) : (
                        <Image
                          src="/facebook-icon.png"
                          alt="Facebook"
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                        />
                      )}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleSocialConnect("telegram")}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-[#0088cc]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  disabled={connectingPlatform !== null}
                  title="Connect Telegram"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative">
                    <span
                      className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #F43F5E 0%, #F472B6 50%, #fff 100%)",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className="relative z-10">
                      {connectingPlatform === "telegram" ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white animate-spin" />
                      ) : (
                        <Image
                          src="/telegram-logo.png"
                          alt="Telegram"
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                        />
                      )}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Verified Social Accounts */}
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {refreshingAccounts}

              {verifiedAccounts.length > 0 ? (
                verifiedAccounts.map((account) => {
                  // Check if this account is on-chain
                  const isOnChain = onChainAccounts.some(
                    (onChain) =>
                      onChain.platform.toLowerCase() ===
                        account.platform.toLowerCase() &&
                      onChain.accountId === account.account_id
                  );

                  return (
                    <SocialAccountItem
                      key={account.id}
                      platform={account.platform}
                      username={account.username}
                      account_id={account.account_id}
                      created_at={account.created_at}
                      onValidate={() => handleValidateAccount(account.id)}
                      isValidating={validatingAccount === account.id}
                      isOnChain={isOnChain}
                    />
                  );
                })
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <X className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    No verified social accounts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Connect and verify your social accounts above to see them
                    here
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
