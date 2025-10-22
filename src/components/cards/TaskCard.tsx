"use client";

import { useState } from "react";
import {
  Trophy,
  CheckCircle,
  ExternalLink,
  Coins,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAccount, useWalletClient } from "wagmi";
import { toastError, toastSuccess } from "@/utils/toast.utils";
import { handleUnauthorized } from "@/utils/backend.utils";
import { ethers } from "ethers";
import DEID_BADGE_ABI from "@/contracts/verification/BadgeSystem.sol/BadgeSystem.json";
import DEID_PROXY_ABI from "@/contracts/core/DEiDProxy.sol/DEiDProxy.json";

interface TaskAttribute {
  trait_type: string;
  value: string | number;
}

interface BadgeDetails {
  badge_name: string;
  badge_description: string;
  badge_image: string;
  attributes: TaskAttribute[];
}

interface TaskCardProps {
  id: string;
  task_title: string;
  task_description: string;
  validation_type: string;
  blockchain_network: string;
  token_contract_address: string;
  minimum_balance: number;
  badge_details: BadgeDetails;
  tx_hash?: string;
  block_number?: number;
  created_at: string;
  onVerificationSuccess?: () => void;
}

export const TaskCard = ({
  id,
  task_title,
  task_description,
  validation_type,
  blockchain_network,
  token_contract_address,
  minimum_balance,
  badge_details,
  tx_hash,
  onVerificationSuccess,
}: TaskCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "validating" | "minting" | "success" | "error"
  >("idle");

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Get the Proxy contract address (BadgeSystem is accessed through proxy)
  const PROXY_ADDRESS =
    process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
    "0xd92A5f52a91C90d6f68Dc041E839035aE83346ac";

  const getValidationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      erc20_balance_check: "ERC20 Balance",
      erc721_balance_check: "ERC721 Balance",
    };
    return types[type] || type;
  };

  const getNetworkLabel = (network: string) => {
    const networks: Record<string, string> = {
      ethereum: "Ethereum",
      bsc: "BNB Smart Chain",
      base: "Base",
      sepolia: "Sepolia",
    };
    return networks[network] || network;
  };

  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io";
  const badgeImageUrl = badge_details.badge_image.startsWith("Qm")
    ? `${ipfsGateway}/ipfs/${badge_details.badge_image}`
    : badge_details.badge_image;

  const handleVerifyTask = async () => {
    if (!isConnected || !address) {
      toastError("Please connect your wallet first");
      return;
    }

    if (!PROXY_ADDRESS) {
      toastError("Proxy contract address not configured");
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationStatus("validating");

      // Step 1: Validate task with backend (uses session for wallet address)
      console.log("🔍 Step 1: Validating task with backend...");
      console.log("📍 User wallet:", address);
      const validationResponse = await fetch(`/api/task/${id}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();

        // Handle 401 Unauthorized - logout user
        if (validationResponse.status === 401 || errorData.shouldLogout) {
          console.log("🔒 Session expired - logging out");
          handleUnauthorized();
          return; // Stop execution
        }

        throw new Error(errorData.error || "Task validation failed");
      }

      const validationData = await validationResponse.json();

      if (!validationData.success || !validationData.data) {
        throw new Error(validationData.message || "Validation failed");
      }

      const { signature, task_id } = validationData.data;

      if (!signature) {
        throw new Error("No signature received from validation");
      }

      console.log("✅ Task validated successfully");
      console.log("📝 Signature:", signature);
      console.log("📋 Task ID from backend:", task_id);
      console.log("📋 Task ID type:", typeof task_id);
      console.log("📋 Task ID length:", task_id?.length);

      // Step 2: Add 0x prefix to signature if not present
      const formattedSignature = signature.startsWith("0x")
        ? signature
        : `0x${signature}`;

      console.log("🔗 Formatted signature:", formattedSignature);

      // Step 3: Call mintBadge on BadgeSystem contract through proxy
      setVerificationStatus("minting");
      console.log("⛓️  Step 2: Minting badge on-chain through proxy...");
      console.log("📋 Task ID:", task_id);
      console.log("🏭 Proxy Contract:", PROXY_ADDRESS);

      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      // Check if wallet client is on the correct chain (Sepolia)
      if (walletClient.chain?.id !== 11155111) {
        console.error("❌ Wallet client is not on Ethereum Sepolia!");
        console.error("   Current chain ID:", walletClient.chain?.id);
        console.error("   Expected chain ID: 11155111");
        throw new Error("Please switch to Ethereum Sepolia in your wallet");
      }

      // Create ethers provider from wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const DEiDBadgeFactory = new ethers.ContractFactory(
        DEID_BADGE_ABI.abi,
        DEID_BADGE_ABI.bytecode,
        signer
      );
      const contract = DEiDBadgeFactory.attach(
        PROXY_ADDRESS as string
      ) as ethers.Contract;
      console.log("✅ Connected to DEiDBadge contract");

      try {
        const code = await provider.getCode(PROXY_ADDRESS as string);
        if (code === "0x") {
          console.error("❌ Contract not deployed at proxy address");
          console.error("   Address:", PROXY_ADDRESS);
          console.error("   Network: Ethereum Sepolia");
          console.error(
            "   This address might be deployed on a different network"
          );
          throw new Error("Contract not deployed at proxy address");
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

      // Check badge existence
      const badgeExists = await contract.badgeExists(task_id);
      if (!badgeExists) {
        console.log("❌ Badge does not exist");
        toastError("Badge does not exist");
        return;
      }
      console.log("✅ Badge exists");

      const tx = await contract.mintBadge(task_id, formattedSignature, {
        gasLimit: 500000,
        maxFeePerGas: ethers.parseUnits("100", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
      });
      console.log("⏳ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log("✅ Badge minted successfully!");
        console.log("   Block Number:", receipt.blockNumber);
        console.log("   Gas Used:", receipt.gasUsed.toString());
        console.log(
          "🔗 Explorer Link:",
          `https://sepolia.etherscan.io/tx/${tx.hash}`
        );
        setVerificationStatus("success");
        toastSuccess(
          "Badge Minted Successfully! 🎉",
          "Your badge has been minted on-chain"
        );
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      setVerificationStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Verification failed";
      toastError(errorMessage);
    } finally {
      setIsVerifying(false);
      // Reset status after a delay
      setTimeout(() => {
        setVerificationStatus("idle");
      }, 3000);
    }
  };

  const getButtonText = () => {
    switch (verificationStatus) {
      case "validating":
        return "Validating...";
      case "minting":
        return "Minting Badge...";
      case "success":
        return "Badge Minted! ✓";
      case "error":
        return "Try Again";
      default:
        return "Verify Task";
    }
  };

  const isButtonDisabled =
    isVerifying || verificationStatus === "success" || !isConnected;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-[#CA4A87] transition-all group">
      {/* Badge Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {!imageError ? (
          <Image
            src={badgeImageUrl}
            alt={task_title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#CA4A87]/20 to-[#b13e74]/20">
            <Trophy className="w-12 h-12 text-[#CA4A87]" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-green-500/90 backdrop-blur-sm text-white rounded-full text-[10px] font-semibold shadow-lg">
            Active
          </span>
        </div>

        {/* On-Chain Indicator */}
        {tx_hash && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-blue-500/90 backdrop-blur-sm text-white rounded-full text-[10px] font-semibold shadow-lg flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" />
              On-Chain
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="text-sm font-bold group-hover:text-[#CA4A87] transition-colors line-clamp-1">
          {task_title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task_description}
        </p>

        {/* Task Info */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="px-1.5 py-0.5 bg-[#CA4A87]/10 text-[#CA4A87] rounded-full font-medium">
            {getValidationTypeLabel(validation_type)}
          </span>
          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-medium">
            {getNetworkLabel(blockchain_network)}
          </span>
        </div>

        {/* Minimum Balance */}
        <div className="flex items-center gap-1.5 text-xs">
          <Coins className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            Min:{" "}
            <span className="font-semibold text-foreground">
              {minimum_balance}
            </span>
          </span>
        </div>

        {/* Explorer Link */}
        {token_contract_address && (
          <a
            href={
              blockchain_network.toLowerCase() === "ethereum"
                ? `https://etherscan.io/address/${token_contract_address}`
                : blockchain_network.toLowerCase() === "bsc"
                ? `https://bscscan.com/address/${token_contract_address}`
                : blockchain_network.toLowerCase() === "base"
                ? `https://basescan.org/address/${token_contract_address}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            Blockchain Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          onClick={handleVerifyTask}
          disabled={isButtonDisabled}
          className={`w-full text-xs h-8 transition-colors ${
            verificationStatus === "success"
              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
              : verificationStatus === "error"
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : "bg-[#CA4A87]/10 text-[#CA4A87] hover:bg-[#CA4A87] hover:text-white"
          } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isVerifying ? (
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
          ) : verificationStatus === "success" ? (
            <CheckCircle className="w-3 h-3 mr-1.5" />
          ) : (
            <CheckCircle className="w-3 h-3 mr-1.5" />
          )}
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};
