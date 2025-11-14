/**
 * @title Client-Side Score Fetching Utility
 * @description Fetch user score data from ScoreFacet contract and IPFS (browser/client-side)
 */

import { ethers } from "ethers";
import SCORE_FACET_ABI from "@/contracts/score/ScoreFacet.sol/ScoreFacet.json";
import { UserScoreData, GlobalSnapshot } from "@/types/score.types";

const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

const IPFS_GATEWAY_URL =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || "https://ipfs.de-id.xyz/ipfs";

const RPC_URL =
  process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

/**
 * Normalize IPFS CID (remove ipfs:// prefix if present)
 */
function normalizeCID(cid: string): string {
  if (cid.startsWith("ipfs://")) {
    return cid.replace("ipfs://", "");
  }
  return cid;
}

/**
 * Fetch IPFS data from gateway
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
 * Get latest snapshot from ScoreFacet contract
 */
async function getLatestSnapshot(): Promise<{
  cid: string;
  root: string;
  id: bigint;
  timestamp: bigint;
}> {
  try {
    console.log("🔍 Fetching latest snapshot from ScoreFacet...");

    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Connect to ScoreFacet via proxy
    const contract = new ethers.Contract(
      PROXY_ADDRESS,
      SCORE_FACET_ABI.abi,
      provider
    );

    const [cid, root, id, timestamp] = await contract.getLatestSnapshot();

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
 * Fetch user score data from on-chain ScoreFacet and IPFS
 * @param userAddress - The user's wallet address
 * @returns User score data or null if not found
 */
export async function fetchUserScoreData(
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

    // Get latest snapshot from contract
    const snapshotMeta = await getLatestSnapshot();

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
    console.log(`   Total Score: ${userData.totalScore}`);
    console.log(`   Rank: ${userData.rank}`);

    return userData;
  } catch (error: any) {
    console.error(`❌ Error fetching user score: ${error.message}`);
    throw error;
  }
}
