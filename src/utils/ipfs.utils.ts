// IPFS utilities for fetching profile metadata
//
// Environment Variables:
// - NEXT_PUBLIC_IPFS_GATEWAY_URL: Primary IPFS gateway URL (default: http://35.247.142.76:8080/ipfs)
//
import { ProfileMetadata } from "./onchain.utils";

export interface IPFSFetchOptions {
  timeout?: number;
  retries?: number;
}

/**
 * Fetch profile metadata from IPFS using multiple gateway fallbacks
 * @param ipfsHash - The IPFS hash (with or without ipfs:// prefix)
 * @param options - Fetch options including timeout and retries
 * @returns Promise<ProfileMetadata | null>
 */
export const fetchProfileMetadataFromIPFS = async (
  ipfsHash: string,
  options: IPFSFetchOptions = {}
): Promise<ProfileMetadata | null> => {
  const { timeout = 10000, retries = 3 } = options;

  try {
    // Clean the IPFS hash (remove ipfs:// prefix if present)
    const cleanHash = ipfsHash.replace(/^ipfs:\/\//, "");
    console.log("🔗 Fetching profile metadata from IPFS hash:", cleanHash);

    // Try multiple IPFS gateways with fallback
    const gateways = [
      // Primary gateway from environment or fallback
      `${
        process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ||
        "http://35.247.142.76:8080/ipfs"
      }/${cleanHash}`,
      // Public gateways as fallbacks
      `https://ipfs.io/ipfs/${cleanHash}`,
      `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
      `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
      `https://dweb.link/ipfs/${cleanHash}`,
    ];

    for (let attempt = 0; attempt < retries; attempt++) {
      for (const gatewayUrl of gateways) {
        try {
          console.log(`🌐 Attempt ${attempt + 1}: Fetching from ${gatewayUrl}`);

          const response = await fetch(gatewayUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(timeout),
          });

          if (response.ok) {
            const metadata = await response.json();
            console.log("✅ Profile metadata fetched from IPFS:", metadata);
            return parseProfileMetadata(metadata);
          } else {
            console.warn(
              `⚠️ Gateway ${gatewayUrl} returned status: ${response.status}`
            );
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch from ${gatewayUrl}:`, error);
          continue;
        }
      }

      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }

    console.error("❌ All IPFS gateways failed after retries");
    return null;
  } catch (error) {
    console.error("❌ Error fetching profile metadata from IPFS:", error);
    return null;
  }
};

/**
 * Parse metadata dictionary into ProfileMetadata format
 * @param metadataDict - Raw metadata from IPFS
 * @returns ProfileMetadata
 */
const parseProfileMetadata = (
  metadataDict: Record<string, unknown>
): ProfileMetadata => {
  try {
    // Handle nested data structure if present
    const data = metadataDict.data || metadataDict;
    console.log("📊 Raw metadata data:", JSON.stringify(data, null, 2));

    // Parse primary wallet with field name mapping
    const primaryWalletData = data.primary_wallet || {};
    const primaryWallet = parseWalletData(primaryWalletData);

    // Parse wallets list
    const walletsData = data.wallets || [];
    const wallets = walletsData.map((walletData: any) =>
      parseWalletData(walletData)
    );

    return {
      username: data.username || "",
      display_name: data.display_name || "",
      bio: data.bio || "",
      avatar_ipfs_hash: data.avatar_ipfs_hash || "",
      primary_wallet: primaryWallet,
      wallets: wallets,
      decode_user_id: data.decode_user_id || "",
    };
  } catch (error) {
    console.error("❌ Error parsing metadata:", error);
    throw new Error(`Invalid metadata format: ${error}`);
  }
};

/**
 * Parse wallet data with field name mapping for compatibility
 * @param walletData - Raw wallet data from IPFS
 * @returns Parsed wallet data
 */
const parseWalletData = (walletData: any) => {
  // Map field names to match expected format
  const walletId = walletData.id || walletData._id || "";
  const createdAt =
    walletData.created_at || walletData.createdAt || new Date().toISOString();
  const updatedAt =
    walletData.updated_at || walletData.updatedAt || new Date().toISOString();
  const version = walletData.version || walletData.__v || 0;

  return {
    _id: walletId,
    address: walletData.address || "",
    user_id: walletData.user_id || "",
    name_service: walletData.name_service || null,
    is_primary: walletData.is_primary || true,
    created_at: createdAt,
    updated_at: updatedAt,
    version: version,
  };
};

/**
 * Fetch avatar image from IPFS
 * @param ipfsHash - The IPFS hash for the avatar image
 * @returns Promise<string | null> - The image URL or null if failed
 */
export const fetchAvatarFromIPFS = async (
  ipfsHash: string
): Promise<string | null> => {
  if (!ipfsHash) return null;

  try {
    const cleanHash = ipfsHash.replace(/^ipfs:\/\//, "");
    const gateways = [
      `${
        process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ||
        "http://35.247.142.76:8080/ipfs"
      }/${cleanHash}`,
      `https://ipfs.io/ipfs/${cleanHash}`,
      `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
      `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
    ];

    for (const gatewayUrl of gateways) {
      try {
        const response = await fetch(gatewayUrl, {
          method: "HEAD", // Just check if the resource exists
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return gatewayUrl;
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching avatar from IPFS:", error);
    return null;
  }
};
