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

// Contract configuration
const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0x446cec444D5553641D3d10611Db65192dbcA2826";

// Import the actual ABI from the contract JSON files
import DEID_PROFILE_ABI from "@/contract-abi/core/DEiDProfile.sol/DEiDProfile.json";

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
      console.log("✅ Using connected primary wallet:", userWallet);

      // Fetch calldata from backend
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
      console.log("🔐 Profile creation data fetched from backend:", response);
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
      console.log("🌐 Connecting to Monad Testnet...");

      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      // Check wallet client chain
      console.log("🔗 Wallet Client Chain:", {
        id: walletClient.chain?.id,
        name: walletClient.chain?.name,
        expectedId: 41434,
      });

      // Check if wallet client is on the correct chain
      if (walletClient.chain?.id !== 41434) {
        console.error("❌ Wallet client is not on Monad Testnet!");
        console.error("   Current chain ID:", walletClient.chain?.id);
        console.error("   Expected chain ID: 41434");
        throw new Error("Please switch to Monad Testnet in your wallet");
      }

      // Create ethers provider from wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Debug network and account info
      const network = await provider.getNetwork();
      const nonce = await provider.getTransactionCount(userWallet);
      const balance = await provider.getBalance(userWallet);
      const blockNumber = await provider.getBlockNumber();

      console.log("🌐 Network Info:", {
        chainId: network.chainId.toString(),
        name: network.name,
        expectedChainId: "41434",
        blockNumber: blockNumber,
      });

      console.log("👤 Account Info:", {
        address: userWallet,
        nonce: nonce,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
      });

      // Check if we're on the correct network
      if (network.chainId.toString() !== "41434") {
        throw new Error(
          `Wrong network! Expected Monad Testnet (41434), but connected to ${network.name} (${network.chainId})`
        );
      }

      // Check if we have sufficient balance
      if (balance < ethers.parseEther("0.01")) {
        throw new Error(
          "Insufficient balance for gas fees. Please get MON tokens from the faucet."
        );
      }

      // Additional debugging for network issues
      console.log("🔍 Network Debug Info:", {
        rpcUrl:
          process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL ||
          "https://testnet-rpc.monad.xyz",
        blockNumber: blockNumber,
        networkName: network.name,
        chainId: network.chainId.toString(),
        isCorrectNetwork: network.chainId.toString() === "41434",
      });
      const contract = new ethers.Contract(
        PROXY_ADDRESS,
        DEID_PROFILE_ABI.abi,
        signer
      );

      console.log("✅ Connected to contract at:", PROXY_ADDRESS);

      // Check if contract is deployed
      try {
        const code = await provider.getCode(PROXY_ADDRESS);
        if (code === "0x") {
          throw new Error("Contract not deployed at the specified address");
        }
        console.log("✅ Contract is deployed, code length:", code.length);
      } catch (error) {
        console.error("❌ Contract deployment check failed:", error);
        throw new Error("Contract deployment verification failed");
      }

      // Create profile
      console.log("✍️ Creating profile...");
      console.log("   Username:", createData.params.username);
      console.log("   Metadata URI:", createData.ipfs_hash);
      console.log(
        "   Signature:",
        createData.validator.signature.substring(0, 20) + "..."
      );

      const signature = createData.validator.signature.startsWith("0x")
        ? createData.validator.signature
        : `0x${createData.validator.signature}`;

      // Simulate the contract call using ethers.js
      console.log("🧪 Simulating contract call with ethers.js...");
      try {
        const simulationResult = await contract.createProfile.staticCall(
          createData.params.username,
          createData.params.metadataURI,
          signature
        );
        console.log("✅ Contract simulation successful:", simulationResult);
      } catch (simulationError) {
        console.error("❌ Contract simulation failed:", simulationError);
        console.error("   This indicates the transaction will fail!");
        console.error("   Possible causes:");
        console.error("   1. Invalid signature");
        console.error("   2. Username already taken");
        console.error("   3. Contract validation failed");
        console.error("   4. Insufficient permissions");
        throw new Error(
          `Contract simulation failed: ${
            simulationError instanceof Error
              ? simulationError.message
              : String(simulationError)
          }`
        );
      }

      // Get current nonce
      const currentNonce = await provider.getTransactionCount(
        userWallet,
        "pending"
      );
      console.log("📊 Transaction nonce:", currentNonce);

      // Estimate gas for the transaction
      let gasEstimate;
      try {
        console.log("⛽ Attempting gas estimation...");
        gasEstimate = await contract.createProfile.estimateGas(
          createData.params.username,
          createData.params.metadataURI,
          signature
        );
        console.log("⛽ Gas estimate successful:", gasEstimate.toString());

        // Ensure minimum gas limit
        if (gasEstimate < BigInt(300000)) {
          console.log(
            "⚠️ Gas estimate too low, using minimum:",
            gasEstimate.toString()
          );
          gasEstimate = BigInt(300000);
        }
      } catch (error) {
        console.log("⚠️ Gas estimation failed:", error);
        console.log("   Using conservative default gas limit...");
        gasEstimate = BigInt(500000);
      }

      const finalGasLimit = gasEstimate + BigInt(100000);
      console.log("🚀 Sending transaction with parameters:", {
        username: createData.params.username,
        metadataURI: createData.params.metadataURI,
        signature: signature.substring(0, 20) + "...",
        nonce: currentNonce,
        gasEstimate: gasEstimate.toString(),
        finalGasLimit: finalGasLimit.toString(),
        maxFeePerGas: "20 gwei",
        maxPriorityFeePerGas: "1 gwei",
      });

      // Execute tx
      const tx = await contract.createProfile(
        createData.params.username,
        createData.params.metadataURI,
        signature,
        {
          nonce: currentNonce,
          gasLimit: finalGasLimit,
          maxFeePerGas: ethers.parseUnits("20", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"),
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
        console.log("✅ Profile verified:");
        console.log("   Username:", newProfile.username);
        console.log("   Metadata URI:", newProfile.metadataURI);
        console.log(
          "   Created At:",
          new Date(Number(newProfile.createdAt) * 1000).toISOString()
        );

        setStatus("success");

        // Navigate to profile page after a short delay
        setTimeout(() => {
          navigateWithTransition("/profile");
        }, 2000);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      setStatus("error");
      setErrorMessage("Error creating profile");
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
