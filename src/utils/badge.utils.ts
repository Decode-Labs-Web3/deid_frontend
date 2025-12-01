import { ethers } from "ethers";
import DEID_BADGE_ABI from "@/contracts/verification/BadgeSystem.sol/BadgeSystem.json";

// Contract configuration
const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

// Badge interfaces
export interface BadgeAttribute {
  trait_type: string;
  value: string;
}

export interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  attributes: BadgeAttribute[];
}

export interface UserBadge {
  tokenId: number;
  metadata: BadgeMetadata;
  imageUrl: string;
}

/**
 * Get badge rarity color classes based on rarity level
 */
export const getBadgeRarityColor = (rarity: string): string => {
  console.log(`🎨 Getting rarity color for: ${rarity}`);

  switch (rarity.toLowerCase()) {
    case "legendary":
      return "border-yellow-500 bg-yellow-500/10";
    case "epic":
      return "border-purple-500 bg-purple-500/10";
    case "rare":
      return "border-blue-500 bg-blue-500/10";
    case "uncommon":
      return "border-green-500 bg-green-500/10";
    case "common":
    default:
      return "border-gray-500 bg-gray-500/10";
  }
};

/**
 * Get rarity badge styling classes
 */
export const getRarityBadgeClasses = (rarity: string): string => {
  console.log(`🏷️ Getting rarity badge classes for: ${rarity}`);

  switch (rarity.toLowerCase()) {
    case "legendary":
      return "bg-yellow-500/20 text-yellow-600";
    case "epic":
      return "bg-purple-500/20 text-purple-600";
    case "rare":
      return "bg-blue-500/20 text-blue-600";
    case "uncommon":
      return "bg-green-500/20 text-green-600";
    case "common":
    default:
      return "bg-gray-500/20 text-gray-600";
  }
};

/**
 * Get list of IPFS gateways to try (in order of preference)
 */
export const getIPFSGateways = (): string[] => {
  const gateways = [
    // Primary gateway (custom)
    process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ||
      "http://34.143.255.129:8080/ipfs",
    // Public gateways (reliable and fast)
    "https://ipfs.io/ipfs",
    "https://gateway.pinata.cloud/ipfs",
    "https://cloudflare-ipfs.com/ipfs",
    "https://dweb.link/ipfs",
    // Additional fallbacks
    "https://ipfs.fleek.co/ipfs",
    "https://nftstorage.link/ipfs",
  ];

  console.log(`🌐 Available IPFS gateways: ${gateways.length}`);
  return gateways;
};

/**
 * Convert IPFS URL to HTTP gateway URL (returns primary gateway URL)
 */
export const convertIPFSUrlToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl) {
    console.warn("⚠️ Empty IPFS URL provided");
    return "";
  }

  console.log(`🔗 Converting IPFS URL: ${ipfsUrl}`);

  // Remove ipfs:// prefix if present
  const cleanHash = ipfsUrl.replace(/^ipfs:\/\//, "");

  // Use primary gateway
  const gateways = getIPFSGateways();
  const primaryGateway = gateways[0];
  const httpUrl = `${primaryGateway}/${cleanHash}`;

  console.log(`✅ Converted to HTTP URL: ${httpUrl}`);
  return httpUrl;
};

/**
 * Fetch metadata from IPFS with multiple gateway fallback
 * Never throws errors - returns null if all gateways fail
 */
export const fetchIPFSMetadata = async (
  ipfsHash: string
): Promise<BadgeMetadata | null> => {
  console.log(`📡 Fetching IPFS metadata for hash: ${ipfsHash}`);

  const gateways = getIPFSGateways();

  for (let i = 0; i < gateways.length; i++) {
    const gateway = gateways[i];
    const metadataUrl = `${gateway}/${ipfsHash}`;

    try {
      console.log(`🌐 Trying gateway ${i + 1}/${gateways.length}: ${gateway}`);

      const response = await fetch(metadataUrl, {
        method: "GET",
        signal: AbortSignal.timeout(8000), // 8 second timeout per gateway
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Gateway ${i + 1} failed: ${response.status} ${
            response.statusText
          }`
        );
        continue;
      }

      const metadata: BadgeMetadata = await response.json();
      console.log(
        `✅ Metadata fetched successfully from gateway ${i + 1}:`,
        metadata
      );
      return metadata;
    } catch (error) {
      console.warn(`⚠️ Gateway ${i + 1} error:`, error);
      continue; // Try next gateway without storing error
    }
  }

  console.warn(
    `⚠️ All ${gateways.length} gateways failed for metadata hash: ${ipfsHash} - returning null`
  );
  return null;
};

/**
 * Fetch image URL from IPFS with multiple gateway fallback
 * Returns the first working gateway URL for the image
 * Never throws errors - returns null if all gateways fail
 */
export const fetchIPFSImageUrl = async (
  ipfsHash: string
): Promise<string | null> => {
  console.log(`🖼️ Finding working gateway for image hash: ${ipfsHash}`);

  const gateways = getIPFSGateways();

  for (let i = 0; i < gateways.length; i++) {
    const gateway = gateways[i];
    const imageUrl = `${gateway}/${ipfsHash}`;

    try {
      console.log(
        `🖼️ Testing image gateway ${i + 1}/${gateways.length}: ${gateway}`
      );

      // Test if the image exists by making a HEAD request
      const response = await fetch(imageUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(4000), // 4 second timeout for image check
      });

      if (response.ok) {
        console.log(`✅ Image gateway ${i + 1} is working: ${imageUrl}`);
        return imageUrl;
      } else {
        console.warn(
          `⚠️ Image gateway ${i + 1} failed: ${response.status} ${
            response.statusText
          }`
        );
        continue;
      }
    } catch (error) {
      console.warn(`⚠️ Image gateway ${i + 1} error:`, error);
      continue; // Try next gateway without storing error
    }
  }

  console.warn(
    `⚠️ All ${gateways.length} image gateways failed for hash: ${ipfsHash} - returning null`
  );
  return null;
};

/**
 * Get user's badge token IDs from BadgeSystem contract
 */
export const getUserBadgeTokenIds = async (
  walletAddress: string
): Promise<number[]> => {
  try {
    console.log(`🏆 Fetching badge token IDs for wallet: ${walletAddress}`);

    // Create read-only provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_TESTNET_RPC_URL
    );
    console.log(
      `🔗 Connected to RPC: ${process.env.NEXT_PUBLIC_TESTNET_RPC_URL}`
    );

    // Connect to BadgeSystem contract through proxy
    const badgeSystem = new ethers.Contract(
      PROXY_ADDRESS as string,
      DEID_BADGE_ABI.abi,
      provider
    );
    console.log(`📋 Connected to BadgeSystem contract at: ${PROXY_ADDRESS}`);

    // Get user's badge token IDs
    const tokenIds = await badgeSystem.getUserBadges(walletAddress);
    console.log(`📋 Raw token IDs from contract:`, tokenIds);

    // Convert to numbers
    const numericTokenIds = tokenIds.map((id: bigint) => Number(id));
    console.log(`🔢 Converted token IDs:`, numericTokenIds);

    return numericTokenIds;
  } catch (error) {
    console.warn(`⚠️ Error fetching user badge token IDs:`, error);
    // Return empty array instead of throwing error
    return [];
  }
};

/**
 * Get token URI (IPFS hash) for a specific badge token ID
 */
export const getBadgeTokenURI = async (
  tokenId: number
): Promise<string | null> => {
  try {
    console.log(`🔍 Getting token URI for badge ID: ${tokenId}`);

    // Create read-only provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_TESTNET_RPC_URL
    );

    // Connect to BadgeSystem contract through proxy
    const badgeSystem = new ethers.Contract(
      PROXY_ADDRESS as string,
      DEID_BADGE_ABI.abi,
      provider
    );

    // Get tokenURI (IPFS hash)
    const tokenURI = await badgeSystem.tokenURI(tokenId);
    console.log(`📄 Token URI for ${tokenId}:`, tokenURI);

    return tokenURI;
  } catch (error) {
    console.warn(`⚠️ Error getting token URI for badge ${tokenId}:`, error);
    return null;
  }
};

/**
 * Fetch complete badge data (metadata + image) for a single badge
 */
export const fetchBadgeData = async (
  tokenId: number
): Promise<UserBadge | null> => {
  try {
    console.log(`🎯 Fetching complete badge data for token ID: ${tokenId}`);

    // Get token URI
    const tokenURI = await getBadgeTokenURI(tokenId);
    if (!tokenURI) {
      console.warn(`⚠️ No token URI found for badge ${tokenId}`);
      return null;
    }

    // Extract IPFS hash from tokenURI (format: "ipfs://QmHash...")
    const ipfsHash = tokenURI.replace("ipfs://", "");
    console.log(`🔗 Extracted IPFS hash: ${ipfsHash}`);

    // Fetch metadata from IPFS
    const metadata = await fetchIPFSMetadata(ipfsHash);
    if (!metadata) {
      console.warn(`⚠️ No metadata found for badge ${tokenId}`);
      return null;
    }

    // Get badge image URL from IPFS with multi-gateway fallback
    const imageHash = metadata.image.replace("ipfs://", "");
    let imageUrl = await fetchIPFSImageUrl(imageHash);

    if (!imageUrl) {
      console.warn(
        `⚠️ No working gateway found for badge image ${tokenId}, using fallback`
      );
      // Fallback to primary gateway URL even if we can't verify it works
      imageUrl = convertIPFSUrlToHttp(`ipfs://${imageHash}`);
      console.log(`🔄 Using fallback image URL: ${imageUrl}`);
    } else {
      console.log(`🖼️ Badge image URL: ${imageUrl}`);
    }

    const badgeData: UserBadge = {
      tokenId,
      metadata,
      imageUrl,
    };

    console.log(`✅ Badge data assembled for ${tokenId}:`, badgeData);
    return badgeData;
  } catch (error) {
    console.warn(`⚠️ Error fetching badge data for ${tokenId}:`, error);
    return null;
  }
};

/**
 * Fetch all user badges with complete metadata
 */
export const fetchAllUserBadges = async (
  walletAddress: string
): Promise<UserBadge[]> => {
  try {
    console.log(`🚀 Starting to fetch all badges for wallet: ${walletAddress}`);

    // Get user's badge token IDs
    const tokenIds = await getUserBadgeTokenIds(walletAddress);
    console.log(`📋 Found ${tokenIds.length} badge token IDs:`, tokenIds);

    if (tokenIds.length === 0) {
      console.log(`❌ No badges found for user`);
      return [];
    }

    // Fetch metadata for each badge
    const badges: UserBadge[] = [];

    for (const tokenId of tokenIds) {
      console.log(
        `🔄 Processing badge ${tokenId} (${badges.length + 1}/${
          tokenIds.length
        })`
      );

      const badgeData = await fetchBadgeData(tokenId);
      if (badgeData) {
        badges.push(badgeData);
        console.log(`✅ Successfully processed badge ${tokenId}`);
      } else {
        console.warn(`⚠️ Failed to process badge ${tokenId}, skipping`);
      }
    }

    console.log(
      `🎉 Successfully loaded ${badges.length} out of ${tokenIds.length} badges`
    );
    return badges;
  } catch (error) {
    console.warn(`⚠️ Error fetching all user badges:`, error);
    // Return empty array instead of throwing error
    return [];
  }
};
