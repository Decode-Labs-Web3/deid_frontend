import Image from "next/image";
import { useState } from "react";
import { convertIPFSUrlToHttp } from "@/utils/ipfs.utils";

interface NFTCardProps {
  token_address: string;
  token_id: string;
  name: string;
  description?: string;
  image?: string;
  contract_type: string;
  symbol?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export const NFTCard = ({
  token_address,
  token_id,
  name,
  image,
  contract_type,
  symbol,
  attributes = [],
}: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Convert IPFS URL to HTTP URL for Next.js Image component
  const getDisplayImage = () => {
    if (!image || imageError) return "/nft-404.png";

    // Check if it's an IPFS URL
    if (image.startsWith("ipfs://")) {
      return convertIPFSUrlToHttp(image);
    }

    // Return as-is if it's already an HTTP URL
    return image;
  };

  const displayImage = getDisplayImage();
  const displayName = name || `NFT #${token_id}`;
  const shortAddress = `${token_address.slice(0, 6)}...${token_address.slice(
    -4
  )}`;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all cursor-pointer group">
      <div className="relative aspect-square">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={displayImage}
          alt={displayName}
          width={200}
          height={200}
          className={`w-full aspect-square object-cover group-hover:scale-105 transition-transform ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>

      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm truncate" title={displayName}>
            {displayName}
          </h3>
          {symbol && <p className="text-xs text-muted-foreground">{symbol}</p>}
        </div>

        <div className="space-y-1">
          <p
            className="text-xs text-muted-foreground truncate"
            title={shortAddress}
          >
            {shortAddress}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {contract_type}
          </p>
        </div>

        {attributes.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              {attributes.length} trait{attributes.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-1">
              {attributes.slice(0, 2).map((attr, index) => (
                <span
                  key={index}
                  className="text-xs bg-muted px-2 py-1 rounded"
                  title={`${attr.trait_type}: ${attr.value}`}
                >
                  {attr.trait_type}
                </span>
              ))}
              {attributes.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{attributes.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
