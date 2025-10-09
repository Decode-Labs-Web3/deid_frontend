// On-chain profile utilities
import { ethers } from "ethers";

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

// Contract configuration
const PROXY_ADDRESS = "0x446cec444D5553641D3d10611Db65192dbcA2826";

// ABI for the DEiDProfile contract
const DEID_PROFILE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getProfile",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "string",
            name: "metadataURI",
            type: "string",
          },
          {
            internalType: "address[]",
            name: "wallets",
            type: "address[]",
          },
          {
            internalType: "string[]",
            name: "socialAccounts",
            type: "string[]",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdated",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct DEiDProfileLibrary.Profile",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getSocialAccounts",
    outputs: [
      {
        internalType: "string[]",
        name: "platforms",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "accountIds",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getValidators",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "validator",
        type: "address",
      },
    ],
    name: "isValidator",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "resolveAddress",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "resolveUsername",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

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
    console.log("🌐 Connecting to Monad Testnet...");
    const rpcUrl = process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL;
    console.log("🔗 RPC URL:", rpcUrl);

    if (!rpcUrl) {
      console.error(
        "❌ NEXT_PUBLIC_MONAD_TESTNET_RPC_URL environment variable is not set!"
      );
      return null;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      PROXY_ADDRESS,
      DEID_PROFILE_ABI,
      provider
    );

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

    // Step 2: Fetch profile metadata from backend
    console.log("🌐 Fetching profile metadata from backend...");
    let profile_metadata: ProfileMetadata | null = null;
    const ipfsHash = profile.metadataURI.replace(/^ipfs:\/\//, "");

    try {
      const backendUrl =
        process.env.DEID_AUTH_BACKEND || "http://localhost:8000";
      const backendApiUrl = `${backendUrl}/api/v1/decode/profile-metadata/${ipfsHash}`;

      const backendResponse = await fetch(backendApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (backendResponse.ok) {
        const responseData = await backendResponse.json();
        if (responseData.success && responseData.data) {
          profile_metadata = responseData.data;
          console.log(
            "✅ Profile metadata fetched from backend:",
            profile_metadata
          );
        } else {
          console.error("❌ Backend response indicates failure:", responseData);
        }
      } else {
        console.error("❌ Backend request failed:", backendResponse.status);
      }
    } catch (error) {
      console.error("❌ Error fetching profile metadata from backend:", error);
    }

    // Fetch additional data
    console.log("🔗 Fetching social accounts...");
    const [platforms, accountIds] = await contract.getSocialAccounts(
      walletAddress
    );

    console.log("👥 Checking validator status...");
    const isValidator = await contract.isValidator(walletAddress);

    console.log("📋 Fetching validators list...");
    const validators = await contract.getValidators();

    console.log("🔍 Resolving address to username...");
    const resolvedUsername = await contract.resolveAddress(walletAddress);

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
// RPC URL: https://testnet-rpc.monad.xyz (Monad Testnet)
// Network: Monad Testnet
