"use client";

import React, { useState, useEffect } from "react";
import { Trophy, AlertCircle } from "lucide-react";
import Image from "next/image";
import { UserBadge } from "@/utils/badge.utils";

interface VerifyBadgeCardProps {
  badge: UserBadge;
  onImageError?: () => void;
}

export const VerifyBadgeCard = ({
  badge,
  onImageError,
}: VerifyBadgeCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  console.log(
    `🎨 Rendering VerifyBadgeCard for badge ${badge.tokenId}:`,
    badge
  );

  // Get network and validation type from attributes
  const networkAttr = badge.metadata.attributes.find(
    (attr) => attr.trait_type.toLowerCase() === "network"
  );
  const validationTypeAttr = badge.metadata.attributes.find(
    (attr) =>
      attr.trait_type.toLowerCase() === "validation_type" ||
      attr.trait_type.toLowerCase() === "validationtype"
  );

  const network = networkAttr?.value || "Unknown";
  const validationType = validationTypeAttr?.value || "Unknown";

  console.log(
    `🏷️ Badge ${badge.tokenId} network: ${network}, validation type: ${validationType}`
  );

  const handleImageError = () => {
    console.warn(
      `⚠️ Image failed to load for badge ${badge.tokenId}, using fallback`
    );
    setImageError(true);
    setImageLoading(false);
    onImageError?.();
  };

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully for badge ${badge.tokenId}`);
    setImageLoading(false);
  };

  // Auto-hide loading spinner after 3 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoading) {
        console.log(
          `⏰ Auto-hiding loading spinner for badge ${badge.tokenId} after timeout`
        );
        setImageLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [imageLoading, badge.tokenId]);

  // Simply use the badge.imageUrl directly - it's already tested by badge.utils.ts
  const getImageUrl = () => {
    if (imageError) return "/nft-404.png";
    return badge.imageUrl;
  };

  return (
    <div
      className="bg-card border rounded-lg p-3 hover:shadow-lg transition-all"
      data-badge-id={badge.tokenId}
    >
      {/* Badge Image */}
      <div className="relative aspect-square mb-3">
        {imageError ? (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
        ) : (
          <>
            <Image
              src={getImageUrl()}
              alt={badge.metadata.name}
              width={200}
              height={200}
              className="w-full h-full object-cover rounded-lg"
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={false}
              unoptimized={true}
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Badge Info */}
      <div className="space-y-2">
        {/* Token ID at the top */}
        <div className="text-center">
          <span className="text-[10px] font-semibold text-foreground">
            {badge.metadata.name} #{badge.tokenId}
          </span>
        </div>

        {/* All Attributes */}
        {badge.metadata.attributes.length > 0 && (
          <div className="text-xs font-medium text-muted-foreground">
            {badge.metadata.attributes.map((attr) => (
              <span key={attr.trait_type || attr.value} className="mr-1">
                #{attr.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface EmptyBadgeStateProps {
  message?: string;
}

export const EmptyBadgeState = ({
  message = "Complete tasks in the Origin Tasks section to earn your first DEiD badges!",
}: EmptyBadgeStateProps) => {
  console.log("🎯 Rendering empty badge state");

  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Trophy className="w-8 h-8 text-muted-foreground" />
      </div>
      <h4 className="text-lg font-semibold mb-2">No Badges Yet</h4>
      <p className="text-muted-foreground text-sm max-w-md">{message}</p>
    </div>
  );
};
