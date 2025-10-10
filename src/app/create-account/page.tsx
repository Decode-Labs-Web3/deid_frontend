"use client";

import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  Users,
} from "lucide-react";
import { usePageTransition } from "@/hooks/use-page-transition";
import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import {
  switchToOtherAccount,
  getPrimaryWalletAddress,
} from "@/utils/session.utils";

// Contract configuration - using environment variable or fallback
const PROXY_ADDRESS =
  process.env.PROXY_ADDRESS || "0x76050bee51946D027B5548d97C6166e08e5a2B1C";

// Import the actual ABI from the contract JSON files
import DEID_PROFILE_ABI from "@/contract-abi/core/DEiDProfile.sol/DEiDProfile.json";
import DEID_PROXY_ABI from "@/contract-abi/core/DEiDProxy.sol/DEiDProxy.json";

interface CreateProfileData {
  method: string;
  params: {
    wallet: string;
    username: string;
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

const CreateAccount = () => {
  const { isVisible, navigateWithTransition } = usePageTransition({
    transitionDuration: 700,
  });

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "wallet-check" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPrimaryWallet, setIsPrimaryWallet] = useState<boolean | null>(null);
  const hasDisconnectedOnMount = useRef(false);

  // Check if connected wallet is primary using session storage
  const checkPrimaryWallet = async (walletAddress: string) => {
    try {
      setIsCheckingWallet(true);
      setStatus("wallet-check");
      setErrorMessage("");

      console.log("🔍 Checking if wallet is primary:", walletAddress);

      // Get primary wallet address from session storage
      const primaryWalletAddress = getPrimaryWalletAddress();
      console.log(
        "🔑 Primary wallet from session storage:",
        primaryWalletAddress
      );

      if (!primaryWalletAddress) {
        console.log("❌ No primary wallet address found in session storage");
        setIsPrimaryWallet(false);
        setStatus("error");
        setErrorMessage(
          "No primary wallet found. Please log in again to set your primary wallet."
        );
        return false;
      }

      // Compare addresses (case-insensitive)
      const isPrimary =
        walletAddress.toLowerCase() === primaryWalletAddress.toLowerCase();

      if (isPrimary) {
        console.log("✅ Wallet is primary, proceeding to create profile");
        setIsPrimaryWallet(true);
        setStatus("idle");
        return true;
      } else {
        console.log("❌ Wallet is not primary");
        setIsPrimaryWallet(false);
        setStatus("error");
        setErrorMessage(
          "Please connect your primary wallet to create a DEiD profile. This wallet is not your registered primary wallet."
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking wallet:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to verify wallet"
      );
      setIsPrimaryWallet(false);
      return false;
    } finally {
      setIsCheckingWallet(false);
    }
  };

  // Handle wallet connection change
  const handleWalletConnection = useCallback(async () => {
    if (isConnected && address) {
      const isPrimary = await checkPrimaryWallet(address);
      if (!isPrimary) {
        // Disconnect if not primary
        disconnect();
      }
    } else {
      setIsPrimaryWallet(null);
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isConnected, address, disconnect]);

  // Disconnect all wallets when component mounts (only once)
  useEffect(() => {
    if (!hasDisconnectedOnMount.current) {
      console.log(
        "🔌 Create Account page loaded - disconnecting all wallets..."
      );
      if (isConnected) {
        console.log("🔌 Disconnecting connected wallet...");
        disconnect();
      }

      // Clear any stored wallet data from session storage
      console.log("🧹 Cleared wallet data from session storage");
      hasDisconnectedOnMount.current = true;
    }
  }, [isConnected, disconnect]);

  // Check wallet when address changes
  useEffect(() => {
    handleWalletConnection();
  }, [handleWalletConnection]);

  const handleCreateProfile = async () => {
    try {
      setIsCreating(true);
      setStatus("idle");
      setErrorMessage("");

      // Check if wallet is connected and is primary
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      if (!isPrimaryWallet) {
        throw new Error("Please connect your primary wallet");
      }

      const userWallet = address;
      console.log("👤 User Wallet:", userWallet);
      console.log("🔗 Contract:", PROXY_ADDRESS);

      // Fetch profile creation data from backend
      console.log("📡 Fetching profile creation data...");
      const backendUrl =
        process.env.DEID_AUTH_BACKEND || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/v1/sync/create-profile`, {
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
        throw new Error("Failed to fetch profile creation data");
      }

      const responseData = await response.json();

      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid response from backend");
      }

      const createData: CreateProfileData = responseData.data;
      console.log("✅ Profile creation data received:", createData);

      // Connect to the network
      console.log("🌐 Connecting to Ethereum Sepolia...");

      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

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

      // Connect to contract using the same pattern as the working script
      // Try both ABIs to see which one works with the proxy
      let contract;

      try {
        // First try with DEiDProfile ABI
        console.log("🔧 Trying DEiDProfile ABI...");
        const DEiDProfileFactory = new ethers.ContractFactory(
          DEID_PROFILE_ABI.abi,
          DEID_PROFILE_ABI.bytecode,
          signer
        );
        contract = DEiDProfileFactory.attach(PROXY_ADDRESS) as ethers.Contract;

        // Test if this ABI works
        await contract.getProfile(userWallet);
        console.log("✅ DEiDProfile ABI works with proxy");
      } catch {
        console.log("⚠️ DEiDProfile ABI failed, trying DEiDProxy ABI...");

        // Try with DEiDProxy ABI
        const DEiDProxyFactory = new ethers.ContractFactory(
          DEID_PROXY_ABI.abi,
          DEID_PROXY_ABI.bytecode,
          signer
        );
        contract = DEiDProxyFactory.attach(PROXY_ADDRESS) as ethers.Contract;
        console.log("✅ Using DEiDProxy ABI");
      }

      console.log("✅ Connected to contract");

      // Check if contract is deployed at the proxy address
      console.log("🔍 Checking contract deployment at:", PROXY_ADDRESS);
      try {
        const code = await provider.getCode(PROXY_ADDRESS);
        if (code === "0x") {
          console.error("❌ Contract not deployed at proxy address");
          console.error("   Address:", PROXY_ADDRESS);
          console.error("   Network: Ethereum Sepolia");
          console.error(
            "   This address might be deployed on a different network"
          );
          throw new Error(
            `Contract not deployed at ${PROXY_ADDRESS} on Ethereum Sepolia. ` +
              `Please check if the contract is deployed on this network or update the contract address.`
          );
        }
        console.log("✅ Contract is deployed, code length:", code.length);
      } catch (error) {
        console.error("❌ Contract deployment check failed:", error);
        throw new Error(
          `Contract deployment verification failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Test basic contract functionality first
      console.log("🧪 Testing basic contract functionality...");

      try {
        // Test the most basic method first
        const testProfile = await contract.getProfile(userWallet);
        console.log("✅ Basic contract interaction works");
        console.log("📊 Test profile result:", testProfile);
      } catch (error) {
        console.log("❌ Basic contract interaction failed:", error);
        throw new Error("Contract is not responding properly");
      }

      // Check current state (skip if methods don't exist)
      let validators = [];
      let isValidator = false;

      try {
        validators = await contract.getValidators();
        console.log("📊 Validators:", validators.length);
      } catch (error) {
        console.log("⚠️ getValidators method not available or failed:", error);
      }

      try {
        isValidator = await contract.isValidator(userWallet);
        console.log("📊 Is Validator:", isValidator);
      } catch (error) {
        console.log("⚠️ isValidator method not available or failed:", error);
      }

      // Check existing profile
      try {
        const existingProfile = await contract.getProfile(userWallet);
        if (existingProfile.username !== "") {
          console.log("   Existing Profile:", existingProfile.username);
          console.log(
            "💡 User already has a profile. Use updateProfile instead."
          );
          throw new Error(
            "User already has a profile. Use updateProfile instead."
          );
        }
      } catch {
        console.log("   No existing profile");
      }

      // Prepare profile data
      const username = createData.params.username;
      const metadataURI = createData.params.metadataURI;
      const signature = createData.validator.signature.startsWith("0x")
        ? createData.validator.signature
        : `0x${createData.validator.signature}`;

      console.log("\n📝 Profile Data:");
      console.log("   Username:", username);
      console.log("   Metadata URI:", metadataURI);
      console.log("   Signature:", signature);

      // Create profile
      console.log("\n✍️  Creating profile...");

      const tx = await contract.createProfile(
        username,
        metadataURI,
        signature,
        {
          gasLimit: 500000,
          maxFeePerGas: ethers.parseUnits("100", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
        }
      );

      console.log("   Transaction Hash:", tx.hash);
      console.log("   Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log("✅ Profile created successfully!");
        console.log("   Block Number:", receipt.blockNumber);
        console.log("   Gas Used:", receipt.gasUsed.toString());

        // Verify profile
        const newProfile = await contract.getProfile(userWallet);
        console.log("\n✅ Profile verified:");
        console.log("   Username:", newProfile.username);
        console.log("   Metadata URI:", newProfile.metadataURI);
        console.log(
          "   Created At:",
          new Date(Number(newProfile.createdAt) * 1000).toISOString()
        );

        // Test username resolution
        const resolvedAddress = await contract.resolveUsername(username);
        console.log("   Username resolves to:", resolvedAddress);
        console.log(
          "   Matches user wallet:",
          resolvedAddress.toLowerCase() === userWallet.toLowerCase()
        );

        console.log(
          "\n🔗 Explorer Link:",
          `https://sepolia.etherscan.io/tx/${tx.hash}`
        );

        console.log("\n🎉 SUCCESS! Profile created and verified!");

        setStatus("success");

        // Navigate to profile page after a short delay
        setTimeout(() => {
          navigateWithTransition("/profile");
        }, 2000);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Error:", errorMessage);

      if (errorMessage.includes("Username already taken")) {
        setErrorMessage("Username is already taken. Try a different username.");
      } else if (errorMessage.includes("already has a profile")) {
        setErrorMessage(
          "User already has a profile. Use updateProfile instead."
        );
      } else if (errorMessage.includes("not a validator")) {
        setErrorMessage(
          "User is not a validator. Only validators can create profiles."
        );
      } else if (errorMessage.includes("Contract not deployed")) {
        setErrorMessage(
          "Contract not deployed on this network. Please check the contract address or deploy the contract to Ethereum Sepolia."
        );
      } else {
        setErrorMessage(errorMessage || "Error creating profile");
      }

      setStatus("error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div
        className={`flex flex-col items-center gap-12 max-w-4xl text-center transition-all duration-700 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="space-y-6">
          <p className="text-xl md:text-2xl font-semibold leading-relaxed">
            DEID TRANSFORMS YOUR DECODE DATA INTO A VERIFIABLE ON-CHAIN
            IDENTITY.
          </p>
          <p className="text-xl md:text-2xl font-semibold leading-relaxed">
            CONNECT YOUR DECODE PRIMARY WALLET TO MINT YOUR FIRST DECENTRALIZED
            IDENTITY
          </p>
        </div>

        {/* Wallet Connection Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Step 1: Connect Your Primary Wallet
            </h3>
            <p className="text-muted-foreground mb-4">
              Connect your primary wallet to create your DEiD profile
            </p>
            <ConnectButton />

            {/* Switch Account Button */}
            <div className="mt-4">
              <Button
                onClick={switchToOtherAccount}
                variant="outline"
                className="text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-muted-foreground/40 transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                Switch Account
              </Button>
            </div>
          </div>

          {isCheckingWallet && (
            <div className="flex items-center gap-3 text-blue-600 text-lg font-semibold">
              <Loader2 className="w-6 h-6 animate-spin" />
              Verifying wallet...
            </div>
          )}

          {status === "wallet-check" && (
            <div className="flex items-center gap-3 text-blue-600 text-lg font-semibold">
              <Wallet className="w-6 h-6" />
              Checking if wallet is primary...
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-3 text-green-600 text-lg font-semibold">
              <CheckCircle className="w-6 h-6" />
              Profile created successfully! Redirecting...
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 text-red-600 text-lg font-semibold">
              <AlertCircle className="w-6 h-6" />
              {errorMessage}
            </div>
          )}

          {/* Step 2: Create Profile Button */}
          {isConnected && isPrimaryWallet && (
            <div className="flex flex-col items-center justify-center text-center w-full">
              <h3 className="text-lg font-semibold mb-2">
                Step 2: Create Your Profile
              </h3>
              <p className="text-muted-foreground mb-4">
                Your primary wallet is verified. Ready to mint your DEiD
                profile!
              </p>
              <Button
                onClick={handleCreateProfile}
                disabled={isCreating || status === "success"}
                className="bg-[#CA4A87] hover:bg-[#b13e74] text-foreground font-bold text-xl px-12 py-6 rounded-full transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Fingerprint className="w-6 h-6" />
                )}
                {isCreating ? "CREATING PROFILE..." : "MINT ON-CHAIN PROFILE"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
