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

export interface OnChainProfileData {
  profile: OnChainProfile;
  socialAccounts: SocialAccount[];
  isValidator: boolean;
  validators: string[];
  resolvedUsername: string;
}

// Contract configuration
const PROXY_ADDRESS = "0x446cec444D5553641D3d10611Db65192dbcA2826";
const RPC_URL = process.env.MONAD_TESTNET_RPC_URL; // Monad Testnet RPC

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
    const provider = new ethers.JsonRpcProvider(RPC_URL);
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
    };

    console.log("✅ On-chain profile data:", profileData);
    return profileData;
  } catch (error) {
    console.error("❌ Error checking on-chain profile:", error);
    return null;
  }
};

// Contract configuration
// Contract Address: 0x446cec444D5553641D3d10611Db65192dbcA2826
// RPC URL: https://rpc.monad.xyz (Monad Testnet)
// Network: Monad Testnet
