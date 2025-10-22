"use client";

import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  Users,
  Eye,
  EyeOff,
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
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xd92A5f52a91C90d6f68Dc041E839035aE83346ac";

// Import the actual ABI from the contract JSON files
import DEID_PROFILE_ABI from "@/contracts/core/DEiDProfile.sol/DEiDProfile.json";
import DEID_PROXY_ABI from "@/contracts/core/DEiDProxy.sol/DEiDProxy.json";

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
  const [primaryWalletHint, setPrimaryWalletHint] = useState<string>("");
  const hasDisconnectedOnMount = useRef(false);

  // Helper function to format wallet address (first 6 and last 6 characters)
  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Check if connected wallet is primary using session storage
  const checkPrimaryWallet = useCallback(async (walletAddress: string) => {
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
        setPrimaryWalletHint("");
        setStatus("error");
        setErrorMessage(
          "No primary wallet found. Please log in again to set your primary wallet."
        );
        return false;
      }

      // Set the primary wallet hint for display
      const formattedAddress = formatWalletAddress(primaryWalletAddress);
      console.log(
        "🔍 Setting primary wallet hint in checkPrimaryWallet:",
        formattedAddress
      );
      setPrimaryWalletHint(formattedAddress);

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
  }, []);

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
      setPrimaryWalletHint("");
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isConnected, address, disconnect, checkPrimaryWallet]);

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

  // Load primary wallet hint on component mount
  useEffect(() => {
    const primaryWalletAddress = getPrimaryWalletAddress();
    console.log(
      "🔍 Primary wallet address from sessionStorage:",
      primaryWalletAddress
    );
    if (primaryWalletAddress) {
      const formattedAddress = formatWalletAddress(primaryWalletAddress);
      console.log("✅ Setting primary wallet hint:", formattedAddress);
      setPrimaryWalletHint(formattedAddress);
    } else {
      console.log("❌ No primary wallet address found in sessionStorage");
    }
  }, []);

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
        contract = DEiDProfileFactory.attach(
          PROXY_ADDRESS as string
        ) as ethers.Contract;

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
        contract = DEiDProxyFactory.attach(
          PROXY_ADDRESS as string
        ) as ethers.Contract;
        console.log("✅ Using DEiDProxy ABI");
      }

      console.log("✅ Connected to contract");

      // Check if contract is deployed at the proxy address
      console.log("🔍 Checking contract deployment at:", PROXY_ADDRESS);
      try {
        const code = await provider.getCode(PROXY_ADDRESS as string);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl transition-all duration-700 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Create Your DEiD Profile
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Transform your Decode data into a verifiable on-chain identity
            </p>
          </div>

          {/* Wallet Connection Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Step 1: Connect Wallet
              </h2>
              <p className="text-muted-foreground mb-6">
                Connect your primary wallet to create your DEiD profile
              </p>

              <div className="flex justify-center">
                <div className="[&>div>button]:bg-gradient-to-r [&>div>button]:from-pink-500 [&>div>button]:to-red-600 [&>div>button]:hover:from-pink-600 [&>div>button]:hover:to-red-700 [&>div>button]:text-white [&>div>button]:border-0">
                  <ConnectButton />
                </div>
              </div>

              {/* Switch Account Button */}
              <div className="mt-4">
                <Button
                  onClick={switchToOtherAccount}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Switch Account
                </Button>
              </div>

              {/* Toggle Wallet Hint Button */}
              <div className="mt-2">
                <Button
                  onClick={() => {
                    if (primaryWalletHint) {
                      setPrimaryWalletHint("");
                    } else {
                      const primaryWalletAddress = getPrimaryWalletAddress();
                      if (primaryWalletAddress) {
                        setPrimaryWalletHint(
                          formatWalletAddress(primaryWalletAddress)
                        );
                      } else {
                        // Try to fetch from backend if not in sessionStorage
                        fetch(
                          `${
                            process.env.DEID_AUTH_BACKEND ||
                            "http://localhost:8000"
                          }/api/v1/decode/my-profile`,
                          {
                            method: "GET",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                          }
                        )
                          .then((response) => response.json())
                          .then((data) => {
                            if (
                              data.success &&
                              data.data.primary_wallet?.address
                            ) {
                              const address = data.data.primary_wallet.address;
                              sessionStorage.setItem(
                                "primaryWalletAddress",
                                address
                              );
                              setPrimaryWalletHint(
                                formatWalletAddress(address)
                              );
                            }
                          })
                          .catch((error) =>
                            console.error(
                              "Error fetching primary wallet:",
                              error
                            )
                          );
                      }
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {primaryWalletHint ? (
                    <Eye className="w-4 h-4 mr-2" />
                  ) : (
                    <EyeOff className="w-4 h-4 mr-2" />
                  )}
                  {primaryWalletHint
                    ? `${primaryWalletHint}`
                    : "Your Primary Address"}
                </Button>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-4">
              {isCheckingWallet && (
                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    Verifying wallet...
                  </span>
                </div>
              )}

              {status === "wallet-check" && (
                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    Checking if wallet is primary...
                  </span>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    Profile created successfully! Redirecting...
                  </span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 dark:text-red-200 font-medium">
                    {errorMessage}
                  </span>
                </div>
              )}
            </div>

            {/* Create Profile Section */}
            {isConnected && isPrimaryWallet && (
              <div className="pt-6 border-t border-border">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Step 2: Create Profile
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Your primary wallet is verified. Ready to mint your DEiD
                    profile!
                  </p>

                  <Button
                    onClick={handleCreateProfile}
                    disabled={isCreating || status === "success"}
                    size="lg"
                    className="bg-gradient-to-r from-[#CA4A87] to-[#b13e74] hover:from-[#b13e74] hover:to-[#a0335f] text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full max-w-sm mx-auto"
                  >
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Fingerprint className="w-5 h-5" />
                    )}
                    {isCreating
                      ? "Creating Profile..."
                      : "Mint On-Chain Profile"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
