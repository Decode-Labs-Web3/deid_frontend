"use client";

import { UserBadge } from "@/utils/badge.utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Award } from "lucide-react";
import { useState } from "react";

interface BadgeGridProps {
  badges: UserBadge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (tokenId: number) => {
    setImageErrors((prev) => new Set(prev).add(tokenId));
  };

  if (badges.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Badges</h3>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No badges earned yet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">
        Badges <span className="text-muted-foreground">({badges.length})</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const hasError = imageErrors.has(badge.tokenId);
          const imageUrl = hasError
            ? "/nft-404.png"
            : badge.imageUrl || "/nft-404.png";

          return (
            <Card
              key={badge.tokenId}
              className="border-border hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
            >
              <div className="relative aspect-square">
                {!hasError && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#CA4A87]/20 to-[#b13e74]/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                )}
                {imageUrl.startsWith("http") ? (
                  <img
                    src={imageUrl}
                    alt={badge.metadata.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={() => handleImageError(badge.tokenId)}
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={badge.metadata.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={() => handleImageError(badge.tokenId)}
                  />
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-1 truncate">
                  {badge.metadata.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {badge.metadata.description}
                </p>
                {badge.metadata.attributes &&
                  badge.metadata.attributes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {badge.metadata.attributes
                        .slice(0, 2)
                        .map((attr, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                          >
                            {attr.trait_type}: {attr.value}
                          </span>
                        ))}
                      {badge.metadata.attributes.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{badge.metadata.attributes.length - 2}
                        </span>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
