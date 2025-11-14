/**
 * @file Fetch User Score Data
 * @description Script to fetch a specific user's score data from on-chain ScoreFacet and IPFS
 * @author Decode Labs
 * @version 1.0.0
 *
 * @usage
 * USER_ADDRESS=0x... npx hardhat run scripts/fetchUserScore.ts --network sepolia
 *
 * Environment Variables:
 * - USER_ADDRESS: The user address to fetch score data for (required)
 * - PROXY_ADDRESS: The deployed DEiD proxy contract address (optional, defaults to 0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF)
 */

import { ethers } from "hardhat";
import { ScoreFacet } from "../typechain-types/contracts/score/ScoreFacet";

/**
 * IPFS Gateway URL
 */
const IPFS_GATEWAY_URL = "https://ipfs.de-id.xyz/ipfs";

/**
 * Deployed Proxy Contract Address
 */
const PROXY_ADDRESS =
  process.env.PROXY_ADDRESS || "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

/**
 * User data structure from IPFS snapshot
 */
interface UserScoreData {
  address: string;
  username: string;
  totalScore: number;
  breakdown: {
    badgeScore: number;
    socialScore: number;
    streakScore: number;
    chainScore: number;
    contributionScore: number;
  };
  rank: number;
  badges: Array<{
    tokenId: number;
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes?: Array<{
        trait_type: string;
        value: string | number;
      }>;
    };
    imageUrl?: string;
  }>;
  socialAccounts: Array<{
    platform: string;
    accountId: string;
  }>;
  ethBalance: string;
  walletActivity: {
    txCount: number;
    firstTx: number | null;
    lastTx: number | null;
    contractInteractions: number;
    gasSpent: string;
  };
  streakDays: number;
  updateCount: number;
  lastUpdated: number;
}

/**
 * Global snapshot structure from IPFS
 */
interface GlobalSnapshot {
  id: number;
  timestamp: number;
  merkleRoot: string;
  users: UserScoreData[];
  metadata: {
    totalUsers: number;
    averageScore: number;
    topScore: number;
    totalBadges: number;
  };
}

/**
 * Normalize IPFS CID (remove ipfs:// prefix if present)
 * @param cid The IPFS CID
 * @returns Normalized CID
 */
function normalizeCID(cid: string): string {
  if (cid.startsWith("ipfs://")) {
    return cid.replace("ipfs://", "");
  }
  return cid;
}

/**
 * Fetch IPFS data from gateway
 * @param cid The IPFS CID
 * @returns The JSON data or null if fetch fails
 */
async function fetchIPFSData(cid: string): Promise<any> {
  try {
    const normalizedCID = normalizeCID(cid);
    const url = `${IPFS_GATEWAY_URL}/${normalizedCID}`;
    console.log(`📡 Fetching IPFS data from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`❌ Error fetching IPFS data: ${error.message}`);
    throw error;
  }
}

/**
 * Get latest snapshot from ScoreFacet
 * @param scoreFacet The ScoreFacet contract instance
 * @returns Snapshot metadata (cid, root, id, timestamp)
 */
async function getLatestSnapshot(scoreFacet: ScoreFacet): Promise<{
  cid: string;
  root: string;
  id: bigint;
  timestamp: bigint;
}> {
  try {
    console.log("🔍 Fetching latest snapshot from ScoreFacet...");
    const [cid, root, id, timestamp] = await scoreFacet.getLatestSnapshot();

    if (!cid || cid.length === 0) {
      throw new Error(
        "No snapshot found. The ScoreFacet may not be initialized yet."
      );
    }

    console.log(`✅ Latest snapshot found:`);
    console.log(`   Snapshot ID: ${id}`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   CID: ${cid}`);
    console.log(`   Merkle Root: ${root}`);

    return {
      cid,
      root: root.toString(),
      id,
      timestamp,
    };
  } catch (error: any) {
    console.error(`❌ Error fetching snapshot: ${error.message}`);
    throw error;
  }
}

/**
 * Find user in snapshot by address
 * @param snapshot The global snapshot data
 * @param userAddress The user address to find
 * @returns User data or null if not found
 */
function findUserInSnapshot(
  snapshot: GlobalSnapshot,
  userAddress: string
): UserScoreData | null {
  const normalizedAddress = userAddress.toLowerCase();
  const user = snapshot.users.find(
    (u) => u.address.toLowerCase() === normalizedAddress
  );
  return user || null;
}

/**
 * Fetch user score data
 * @param userAddress The user address to fetch data for
 * @returns User score data or null if not found
 */
export async function fetchUserScore(
  userAddress: string
): Promise<UserScoreData | null> {
  try {
    // Validate address
    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid address: ${userAddress}`);
    }

    console.log(`\n🔍 Fetching score data for user: ${userAddress}`);
    console.log(`📋 Proxy Address: ${PROXY_ADDRESS}`);
    console.log();

    // Connect to ScoreFacet via proxy
    const ScoreFacetFactory = await ethers.getContractFactory("ScoreFacet");
    const scoreFacet = ScoreFacetFactory.attach(PROXY_ADDRESS) as ScoreFacet;

    // Check if ScoreFacet is initialized
    const isInitialized = await scoreFacet.isInitialized();
    if (!isInitialized) {
      throw new Error("ScoreFacet is not initialized");
    }

    // Get latest snapshot
    const snapshotMeta = await getLatestSnapshot(scoreFacet);

    // Fetch IPFS data
    console.log("\n📥 Fetching snapshot data from IPFS...");
    const snapshotData = await fetchIPFSData(snapshotMeta.cid);

    // Validate snapshot structure
    if (!snapshotData) {
      throw new Error("Failed to fetch snapshot data from IPFS");
    }

    if (!snapshotData.users || !Array.isArray(snapshotData.users)) {
      throw new Error("Invalid snapshot structure: missing users array");
    }

    if (snapshotData.users.length === 0) {
      throw new Error("Snapshot contains no users");
    }

    console.log(`✅ Snapshot loaded: ${snapshotData.users.length} users found`);

    // Find user in snapshot
    console.log(`\n🔎 Searching for user in snapshot...`);
    const userData = findUserInSnapshot(
      snapshotData as GlobalSnapshot,
      userAddress
    );

    if (!userData) {
      console.log(`⚠️  User not found in snapshot`);
      return null;
    }

    console.log(`✅ User found in snapshot`);
    return userData;
  } catch (error: any) {
    console.error(`❌ Error fetching user score: ${error.message}`);
    throw error;
  }
}

/**
 * Main function for CLI usage
 */
async function main() {
  // Get user address from environment variable or command line
  // Hardhat doesn't support -- for arguments, so we use env var or process.argv
  let userAddress = process.env.USER_ADDRESS;

  // If not in env, try to get from process.argv (after hardhat's arguments)
  if (!userAddress) {
    // Hardhat passes arguments differently, try to find address in argv
    const args = process.argv.slice(2);
    // Filter out hardhat-specific arguments
    const addressArg = args.find(
      (arg) =>
        arg.startsWith("0x") && arg.length === 42 && ethers.isAddress(arg)
    );
    if (addressArg) {
      userAddress = addressArg;
    }
  }

  if (!userAddress) {
    console.error("❌ Error: User address is required");
    console.error("Usage:");
    console.error(
      "  USER_ADDRESS=0x... npx hardhat run scripts/fetchUserScore.ts --network sepolia"
    );
    console.error(
      "  Or: npx hardhat run scripts/fetchUserScore.ts --network sepolia 0x..."
    );
    process.exit(1);
  }

  try {
    const userData = await fetchUserScore(userAddress);

    if (!userData) {
      console.log("\n❌ User not found in the latest snapshot");
      process.exit(1);
    }

    // Output as JSON (to stdout for piping/API use)
    // Use stderr for status messages so JSON output can be piped cleanly
    console.error("\n✅ Successfully fetched user score data");
    console.log(JSON.stringify(userData, null, 2));
  } catch (error: any) {
    console.error(`\n❌ Failed to fetch user score: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
