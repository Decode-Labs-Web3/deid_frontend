"use client";

import { useState } from "react";
import { Trophy, CheckCircle, ExternalLink, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
}

export const TaskCard = ({
  task_title,
  task_description,
  validation_type,
  blockchain_network,
  token_contract_address,
  minimum_balance,
  badge_details,
  tx_hash,
}: TaskCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getValidationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      erc20_balance_check: "ERC20 Balance",
      erc721_owner: "NFT Ownership",
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
          className="w-full bg-[#CA4A87]/10 text-[#CA4A87] hover:bg-[#CA4A87] hover:text-white transition-colors text-xs h-8"
        >
          <CheckCircle className="w-3 h-3 mr-1.5" />
          Verify Task
        </Button>
      </div>
    </div>
  );
};
