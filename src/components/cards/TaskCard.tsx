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
  minimum_balance,
  badge_details,
  tx_hash,
}: TaskCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-[#CA4A87] transition-all group cursor-pointer">
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
            <Trophy className="w-16 h-16 text-[#CA4A87]" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white rounded-full text-xs font-semibold shadow-lg">
            Active
          </span>
        </div>

        {/* On-Chain Indicator */}
        {tx_hash && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              On-Chain
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold group-hover:text-[#CA4A87] transition-colors line-clamp-1">
          {task_title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task_description}
        </p>

        {/* Task Info */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-[#CA4A87]/10 text-[#CA4A87] rounded-full font-medium">
            {getValidationTypeLabel(validation_type)}
          </span>
          <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full font-medium">
            {getNetworkLabel(blockchain_network)}
          </span>
        </div>

        {/* Minimum Balance */}
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Min. Balance:{" "}
            <span className="font-semibold text-foreground">
              {minimum_balance}
            </span>
          </span>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[#CA4A87] hover:underline font-medium"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="pt-3 border-t border-border space-y-2 text-xs">
            <div>
              <p className="font-semibold mb-1">
                Badge: {badge_details.badge_name}
              </p>
              <p className="text-muted-foreground">
                {badge_details.badge_description}
              </p>
            </div>

            {badge_details.attributes.length > 0 && (
              <div>
                <p className="font-semibold mb-1">Attributes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {badge_details.attributes.map((attr, index) => (
                    <div key={index} className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground text-[10px]">
                        {attr.trait_type}
                      </p>
                      <p className="font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tx_hash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          className="w-full bg-[#CA4A87]/10 text-[#CA4A87] hover:bg-[#CA4A87] hover:text-white transition-colors text-md"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Verify Task
        </Button>
      </div>
    </div>
  );
};
