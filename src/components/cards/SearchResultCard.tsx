"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User } from "lucide-react";

interface SearchResultCardProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  avatarIpfsHash?: string;
  hasOnChainProfile: boolean;
  walletAddress?: string;
  onClick?: () => void;
}

export const SearchResultCard = ({
  username,
  displayName,
  avatarUrl,
  avatarIpfsHash,
  hasOnChainProfile,
  walletAddress,
  onClick,
}: SearchResultCardProps) => {
  const [currentAvatarUrl, setCurrentAvatarUrl] =
    useState<string>("/deid_logo.png");
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    const fetchAvatar = async () => {
      // Priority: avatarUrl > avatarIpfsHash > default
      if (avatarUrl) {
        setCurrentAvatarUrl(avatarUrl);
        return;
      }

      if (avatarIpfsHash) {
        try {
          setAvatarLoading(true);
          console.log("🌐 Fetching avatar from IPFS hash:", avatarIpfsHash);

          // Try multiple IPFS gateways with fallback
          const gateways = [
            `${
              process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ||
              "http://34.143.255.129:8080/ipfs"
            }/${avatarIpfsHash}`,
            `https://ipfs.io/ipfs/${avatarIpfsHash}`,
            `https://gateway.pinata.cloud/ipfs/${avatarIpfsHash}`,
            `https://cloudflare-ipfs.com/ipfs/${avatarIpfsHash}`,
          ];

          for (const gatewayUrl of gateways) {
            try {
              const response = await fetch(gatewayUrl, {
                method: "HEAD",
                signal: AbortSignal.timeout(3000),
              });

              if (response.ok) {
                setCurrentAvatarUrl(gatewayUrl);
                console.log("✅ Avatar loaded from IPFS:", gatewayUrl);
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
      }
    };

    fetchAvatar();
  }, [avatarUrl, avatarIpfsHash]);

  // Helper to check if the avatarUrl is an external URL (e.g., IPFS)
  const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

  // Helper to format wallet address (first 6 and last 4 characters)
  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Only clickable if has on-chain profile AND onClick is provided
  const isClickable = hasOnChainProfile && onClick;

  return (
    <Card
      className={`group transition-all duration-200 border-border ${
        isClickable
          ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
          : "cursor-not-allowed opacity-60 bg-muted/30"
      }`}
      onClick={isClickable ? onClick : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 flex-shrink-0">
            {/* Gradient frame */}
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#CA4A87] via-[#b13e74] to-[#a0335f] p-0.5">
              <div className="w-full h-full rounded-xl bg-background overflow-hidden">
                {isExternalUrl(currentAvatarUrl) ? (
                  // Use <img> for external URLs (e.g., IPFS) to avoid next/image config issues
                  <img
                    src={currentAvatarUrl}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  // Use next/image for local/static images
                  <Image
                    src={currentAvatarUrl}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 w-full h-full rounded-xl bg-background/50 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {displayName || username}
              </h3>
              {!hasOnChainProfile && (
                <Badge
                  variant="destructive"
                  className="text-xs px-2 py-0.5 flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  No DEiD On-Chain Profile
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm truncate">
              @{username}
              {hasOnChainProfile && (
                <span
                  className="text-xs ml-1 font-bold"
                  style={{
                    color: "#ff72e1",
                    textShadow:
                      "0 0 1px #ff72e1, 0 0 1px #ffb6f9, 0 0 1px #e75480",
                  }}
                >
                  .deid
                </span>
              )}
            </p>

            {walletAddress && (
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {formatWalletAddress(walletAddress)}
              </p>
            )}

            {!isClickable && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Profile not available
              </p>
            )}
          </div>

          {/* Status Icon */}
          <div className="flex-shrink-0">
            {hasOnChainProfile ? (
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
