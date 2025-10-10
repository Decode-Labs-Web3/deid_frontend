// On-chain profile utilities
import { ethers } from "ethers";
import DEID_PROFILE_ABI from "@/contract-abi/core/DEiDProfile.sol/DEiDProfile.json";
import DEID_PROXY_ABI from "@/contract-abi/core/DEiDProxy.sol/DEiDProxy.json";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}

export interface OnChainProfile {
  username: string;
  metadataURI: string;
  wallets: string[];
  socialAccounts: string[];
  createdAt: number;
  lastUpdated: number;
  isActive: boolean;
}

export interface SocialAccount {
  platform: string;
  accountId: string;
}

export interface Wallet {
  id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ProfileMetadata {
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  primary_wallet: Wallet;
  wallets: Wallet[];
  decode_user_id: string;
}

export interface OnChainProfileData {
  profile: OnChainProfile;
  socialAccounts: SocialAccount[];
  isValidator: boolean;
  validators: string[];
  resolvedUsername: string;
  profile_metadata: ProfileMetadata | null;
}

// Contract configuration - using environment variable or fallback
const PROXY_ADDRESS =
  process.env.PROXY_ADDRESS || "0x76050bee51946D027B5548d97C6166e08e5a2B1C";

// Using imported ABI from contract JSON files

export const checkOnChainProfile = async (
  walletAddress: string
): Promise<OnChainProfileData | null> => {
  try {
    console.log("🔗 Checking on-chain profile for address:", walletAddress);

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      console.log("❌ Not in browser environment, skipping on-chain check");
      return null;
    }

    // Connect to the network
    console.log("🌐 Connecting to Ethereum Sepolia...");
    const rpcUrl =
      process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
      "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
    console.log("🔗 RPC URL:", rpcUrl);

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Connect to contract using the same pattern as the create-account page
    // Try both ABIs to see which one works with the proxy
    let contract;

    try {
      // First try with DEiDProfile ABI
      console.log("🔧 Trying DEiDProfile ABI...");
      const DEiDProfileFactory = new ethers.ContractFactory(
        DEID_PROFILE_ABI.abi,
        DEID_PROFILE_ABI.bytecode,
        provider
      );
      contract = DEiDProfileFactory.attach(PROXY_ADDRESS) as ethers.Contract;

      // Test if this ABI works
      await contract.getProfile(walletAddress);
      console.log("✅ DEiDProfile ABI works with proxy");
    } catch {
      console.log("⚠️ DEiDProfile ABI failed, trying DEiDProxy ABI...");

      // Try with DEiDProxy ABI
      const DEiDProxyFactory = new ethers.ContractFactory(
        DEID_PROXY_ABI.abi,
        DEID_PROXY_ABI.bytecode,
        provider
      );
      contract = DEiDProxyFactory.attach(PROXY_ADDRESS) as ethers.Contract;
      console.log("✅ Using DEiDProxy ABI");
    }

    console.log("✅ Connected to contract at:", PROXY_ADDRESS);

    // Check if profile exists
    console.log("📋 Fetching profile data...");
    const profile = await contract.getProfile(walletAddress);

    console.log("📊 Raw profile data:", profile);

    if (profile.username === "") {
      console.log("❌ No on-chain profile found for address:", walletAddress);
      return null;
    }

    console.log("✅ Profile found:", profile.username);

    // Step 2: Fetch profile metadata directly from IPFS
    console.log("🌐 Fetching profile metadata directly from IPFS...");
    let profile_metadata: ProfileMetadata | null = null;

    if (profile.metadataURI && profile.metadataURI !== "") {
      try {
        const ipfsHash = profile.metadataURI.replace(/^ipfs:\/\//, "");
        const ipfsUrl = `http://35.247.142.76:8080/ipfs/${ipfsHash}`;

        console.log("🔗 Fetching from IPFS:", ipfsUrl);
        const ipfsResponse = await fetch(ipfsUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (ipfsResponse.ok) {
          profile_metadata = await ipfsResponse.json();
          console.log(
            "✅ Profile metadata fetched from IPFS:",
            profile_metadata
          );
        } else {
          console.error("❌ IPFS request failed:", ipfsResponse.status);
        }
      } catch (error) {
        console.error("❌ Error fetching profile metadata from IPFS:", error);
      }
    } else {
      console.log("ℹ️ No metadataURI found, skipping metadata fetch");
    }

    // Fetch additional data (with error handling)
    let platforms = [];
    let accountIds = [];
    let isValidator = false;
    let validators = [];
    let resolvedUsername = "";

    try {
      console.log("🔗 Fetching social accounts...");
      [platforms, accountIds] = await contract.getSocialAccounts(walletAddress);
    } catch (error) {
      console.log(
        "⚠️ getSocialAccounts method not available or failed:",
        error
      );
    }

    try {
      console.log("👥 Checking validator status...");
      isValidator = await contract.isValidator(walletAddress);
    } catch (error) {
      console.log("⚠️ isValidator method not available or failed:", error);
    }

    try {
      console.log("📋 Fetching validators list...");
      validators = await contract.getValidators();
    } catch (error) {
      console.log("⚠️ getValidators method not available or failed:", error);
    }

    try {
      console.log("🔍 Resolving address to username...");
      resolvedUsername = await contract.resolveAddress(walletAddress);
    } catch (error) {
      console.log("⚠️ resolveAddress method not available or failed:", error);
    }

    // Format social accounts
    const socialAccounts: SocialAccount[] = platforms.map(
      (platform: string, index: number) => ({
        platform,
        accountId: accountIds[index],
      })
    );

    const profileData: OnChainProfileData = {
      profile: {
        username: profile.username,
        metadataURI: profile.metadataURI,
        wallets: profile.wallets,
        socialAccounts: profile.socialAccounts,
        createdAt: Number(profile.createdAt),
        lastUpdated: Number(profile.lastUpdated),
        isActive: profile.isActive,
      },
      socialAccounts,
      isValidator,
      validators,
      resolvedUsername,
      profile_metadata,
    };

    console.log("✅ Complete on-chain profile data:", profileData);
    return profileData;
  } catch (error) {
    console.error("❌ Error checking on-chain profile:", error);
    return null;
  }
};

// Contract configuration
// Contract Address: 0x446cec444D5553641D3d10611Db65192dbcA2826
// RPC URL: https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161 (Ethereum Sepolia)
// Network: Ethereum Sepolia
