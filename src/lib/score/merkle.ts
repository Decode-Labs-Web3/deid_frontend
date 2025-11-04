/**
 * @title Merkle Tree Utility
 * @description Simple Merkle root calculation for score snapshots
 */

import { ethers } from "ethers";
import { UserScoreData } from "@/types/score.types";

/**
 * Create a hash for a single user's data (Merkle leaf)
 * @param user - User score data
 * @returns Keccak256 hash of user data
 */
export function createUserHash(user: UserScoreData): string {
  // Hash user data: address + totalScore + rank + timestamp
  // Ensure all values are integers (totalScore may be a float)
  const totalScoreInt = Math.round(user.totalScore);
  const rankInt = Number(user.rank);
  const timestampInt = Number(user.lastUpdated);

  const hash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256"],
    [user.address, totalScoreInt, rankInt, timestampInt]
  );
  return hash;
}

/**
 * Build Merkle tree and calculate root
 * @param hashes - Array of leaf hashes
 * @returns Merkle root hash
 */
function buildMerkleTree(hashes: string[]): string {
  if (hashes.length === 0) {
    return ethers.keccak256(ethers.toUtf8Bytes("EMPTY_TREE"));
  }

  if (hashes.length === 1) {
    return hashes[0];
  }

  const nextLevel: string[] = [];

  // Process pairs of hashes
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = i + 1 < hashes.length ? hashes[i + 1] : hashes[i]; // Duplicate if odd

    // Sort hashes to ensure consistency
    const [sortedLeft, sortedRight] =
      left < right ? [left, right] : [right, left];

    // Hash the pair
    const combined = ethers.solidityPackedKeccak256(
      ["bytes32", "bytes32"],
      [sortedLeft, sortedRight]
    );
    nextLevel.push(combined);
  }

  // Recursively build tree
  return buildMerkleTree(nextLevel);
}

/**
 * Calculate Merkle root for all users in snapshot
 * @param users - Array of user score data
 * @returns Merkle root hash
 */
export function calculateMerkleRoot(users: UserScoreData[]): string {
  if (users.length === 0) {
    return ethers.keccak256(ethers.toUtf8Bytes("EMPTY_SNAPSHOT"));
  }

  // Create leaf hash for each user
  const leafHashes = users.map((user) => createUserHash(user));

  console.log(`🌳 Calculating Merkle root for ${users.length} users`);
  console.log(`   First leaf: ${leafHashes[0]}`);

  // Build Merkle tree and get root
  const root = buildMerkleTree(leafHashes);

  console.log(`   Merkle root: ${root}`);

  return root;
}

/**
 * Verify a user is included in a snapshot (simplified - no proof generation)
 * @param user - User to verify
 * @param root - Expected Merkle root
 * @param allUsers - All users in snapshot
 * @returns True if user is included
 */
export function verifyUserInSnapshot(
  user: UserScoreData,
  root: string,
  allUsers: UserScoreData[]
): boolean {
  // Recalculate root and compare
  const calculatedRoot = calculateMerkleRoot(allUsers);
  return calculatedRoot === root;
}
