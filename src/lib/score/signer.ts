/**
 * @title Snapshot Signature Utility
 * @description Validator signature utility matching simulation pattern
 *
 * IMPORTANT: This matches exactly the signature format from simulation/signSnapshotMessage.ts
 */

import { ethers } from "ethers";

/**
 * Create snapshot message hash for signature verification
 * This MUST match the contract's signature verification logic:
 * keccak256(abi.encodePacked(snapshotId, root, keccak256(bytes(cid)), timestamp))
 *
 * @param snapshotId - The snapshot ID (uint64)
 * @param root - The Merkle root (bytes32)
 * @param cid - The IPFS CID (string)
 * @param timestamp - The timestamp (uint64)
 * @returns Message hash to be signed
 */
export function createSnapshotMessageHash(
  snapshotId: number,
  root: string,
  cid: string,
  timestamp: number
): string {
  // Step 1: Hash the CID string
  const cidHash = ethers.keccak256(ethers.toUtf8Bytes(cid));

  // Step 2: Pack and hash: snapshotId + root + cidHash + timestamp
  // Using solidityPackedKeccak256 to match Solidity's abi.encodePacked
  const messageHash = ethers.solidityPackedKeccak256(
    ["uint64", "bytes32", "bytes32", "uint64"],
    [snapshotId, root, cidHash, timestamp]
  );

  return messageHash;
}

/**
 * Sign a snapshot message with validator private key
 * @param privateKey - Validator's private key (must start with 0x)
 * @param snapshotId - The snapshot ID
 * @param root - The Merkle root
 * @param cid - The IPFS CID
 * @param timestamp - The timestamp
 * @returns Signature string
 */
export async function signSnapshotMessage(
  privateKey: string,
  snapshotId: number,
  root: string,
  cid: string,
  timestamp: number
): Promise<string> {
  // Create wallet from private key
  const wallet = new ethers.Wallet(privateKey);

  // Create message hash
  const messageHash = createSnapshotMessageHash(
    snapshotId,
    root,
    cid,
    timestamp
  );

  // Sign the message hash
  // This adds the Ethereum Signed Message prefix automatically
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));

  console.log("🔐 Snapshot signature created:");
  console.log(`   Signer: ${wallet.address}`);
  console.log(`   Snapshot ID: ${snapshotId}`);
  console.log(`   Merkle Root: ${root}`);
  console.log(`   CID: ${cid}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   Message Hash: ${messageHash}`);
  console.log(`   Signature: ${signature}`);

  return signature;
}

/**
 * Verify a snapshot signature (for testing/debugging)
 * @param signature - The signature to verify
 * @param snapshotId - The snapshot ID
 * @param root - The Merkle root
 * @param cid - The IPFS CID
 * @param timestamp - The timestamp
 * @param expectedSigner - Expected signer address
 * @returns True if signature is valid
 */
export function verifySnapshotSignature(
  signature: string,
  snapshotId: number,
  root: string,
  cid: string,
  timestamp: number,
  expectedSigner: string
): boolean {
  try {
    // Create message hash
    const messageHash = createSnapshotMessageHash(
      snapshotId,
      root,
      cid,
      timestamp
    );

    // Recover signer from signature
    const recoveredSigner = ethers.verifyMessage(
      ethers.getBytes(messageHash),
      signature
    );

    const isValid =
      recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();

    console.log("🔍 Signature verification:");
    console.log(`   Expected: ${expectedSigner}`);
    console.log(`   Recovered: ${recoveredSigner}`);
    console.log(`   Valid: ${isValid}`);

    return isValid;
  } catch (error) {
    console.error("❌ Signature verification error:", error);
    return false;
  }
}
