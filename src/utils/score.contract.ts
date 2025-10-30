/**
 * @title Score Contract Utilities
 * @description Read-only utilities for interacting with ScoreFacet contract
 */

import { ethers } from "ethers";
import SCORE_FACET_ABI from "@/contracts/score/ScoreFacet.sol/ScoreFacet.json";
import { SnapshotMetadata } from "@/types/score.types";

const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

const RPC_URL =
  process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

/**
 * Get a read-only contract instance
 */
function getContract(): ethers.Contract {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(PROXY_ADDRESS, SCORE_FACET_ABI.abi, provider);
}

/**
 * Get the latest snapshot metadata from contract
 * @returns Latest snapshot metadata
 */
export async function getLatestSnapshot(): Promise<SnapshotMetadata> {
  try {
    const contract = getContract();
    const [cid, root, id, timestamp] = await contract.getLatestSnapshot();

    console.log("📊 Latest snapshot from contract:", {
      cid,
      root,
      id: Number(id),
      timestamp: Number(timestamp),
    });

    return {
      cid,
      root,
      id: Number(id),
      timestamp: Number(timestamp),
      userCount: 0, // Will be filled from IPFS data
    };
  } catch (error) {
    console.error("❌ Error fetching latest snapshot:", error);
    throw error;
  }
}

/**
 * Get a specific snapshot by ID
 * @param id - Snapshot ID
 * @returns Snapshot metadata
 */
export async function getSnapshot(id: number): Promise<SnapshotMetadata> {
  try {
    const contract = getContract();
    const [cid, root, snapshotId, timestamp] = await contract.getSnapshot(id);

    return {
      cid,
      root,
      id: Number(snapshotId),
      timestamp: Number(timestamp),
      userCount: 0,
    };
  } catch (error) {
    console.error(`❌ Error fetching snapshot ${id}:`, error);
    throw error;
  }
}

/**
 * Get total number of snapshots
 * @returns Snapshot count
 */
export async function getSnapshotCount(): Promise<number> {
  try {
    const contract = getContract();
    const count = await contract.getSnapshotCount();
    return Number(count);
  } catch (error) {
    console.error("❌ Error fetching snapshot count:", error);
    throw error;
  }
}

/**
 * Check if a snapshot exists
 * @param id - Snapshot ID
 * @returns True if snapshot exists
 */
export async function snapshotExists(id: number): Promise<boolean> {
  try {
    const contract = getContract();
    return await contract.snapshotExists(id);
  } catch (error) {
    console.error(`❌ Error checking if snapshot ${id} exists:`, error);
    return false;
  }
}

/**
 * Get timestamp of last snapshot update
 * @returns Timestamp
 */
export async function getLastUpdate(): Promise<number> {
  try {
    const contract = getContract();
    const timestamp = await contract.getLastUpdate();
    return Number(timestamp);
  } catch (error) {
    console.error("❌ Error fetching last update:", error);
    throw error;
  }
}

/**
 * Get cooldown period (seconds between updates)
 * @returns Cooldown in seconds
 */
export async function getCooldown(): Promise<number> {
  try {
    const contract = getContract();
    const cooldown = await contract.getCooldown();
    return Number(cooldown);
  } catch (error) {
    console.error("❌ Error fetching cooldown:", error);
    throw error;
  }
}

/**
 * Check if cooldown period has passed
 * @returns True if update is allowed
 */
export async function canUpdate(): Promise<boolean> {
  try {
    const lastUpdate = await getLastUpdate();
    const cooldown = await getCooldown();
    const now = Math.floor(Date.now() / 1000);

    const nextAllowedUpdate = lastUpdate + cooldown;
    return now >= nextAllowedUpdate;
  } catch (error) {
    console.error("❌ Error checking cooldown:", error);
    return false;
  }
}

/**
 * Get time remaining until next update is allowed
 * @returns Seconds remaining, or 0 if update is allowed
 */
export async function getTimeUntilNextUpdate(): Promise<number> {
  try {
    const lastUpdate = await getLastUpdate();
    const cooldown = await getCooldown();
    const now = Math.floor(Date.now() / 1000);

    const nextAllowedUpdate = lastUpdate + cooldown;
    const remaining = Math.max(0, nextAllowedUpdate - now);

    return remaining;
  } catch (error) {
    console.error("❌ Error calculating time until next update:", error);
    return 0;
  }
}
