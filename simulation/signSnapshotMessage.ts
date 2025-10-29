import { ethers } from "hardhat";

/**
 * @title Sign Snapshot Message Utility
 * @dev Utility functions for signing and verifying snapshot update messages
 *
 * OVERVIEW:
 * =========
 * This utility provides functions for creating, signing, and verifying
 * snapshot update messages for the ScoreFacet contract.
 *
 * MESSAGE FORMAT:
 * ==============
 * The message hash is created using:
 * keccak256(abi.encodePacked(snapshotId, root, keccak256(bytes(cid)), timestamp))
 *
 * This ensures that:
 * - Each snapshot update is unique
 * - The signature is bound to specific snapshot data
 * - Replay attacks are prevented
 *
 * @author Decode Labs
 */

/**
 * @dev Create a snapshot message hash for signature verification
 * @param snapshotId The snapshot ID
 * @param root The Merkle root
 * @param cid The IPFS CID
 * @param timestamp The timestamp
 * @return The message hash
 */
export function createSnapshotMessageHash(
  snapshotId: number,
  root: string,
  cid: string,
  timestamp: number
): string {
  // Create the message hash using the exact same format as the contract
  // Contract uses: keccak256(abi.encodePacked(snapshotId, root, keccak256(bytes(cid)), timestamp))
  const cidHash = ethers.keccak256(ethers.toUtf8Bytes(cid));
  const messageHash = ethers.solidityPackedKeccak256(
    ["uint64", "bytes32", "bytes32", "uint64"],
    [snapshotId, root, cidHash, timestamp]
  );

  return messageHash;
}

/**
 * @dev Sign a snapshot message with a validator
 * @param validator The validator signer
 * @param snapshotId The snapshot ID
 * @param root The Merkle root
 * @param cid The IPFS CID
 * @param timestamp The timestamp
 * @return The signature
 */
export async function signSnapshotMessage(
  validator: any,
  snapshotId: number,
  root: string,
  cid: string,
  timestamp: number
): Promise<string> {
  // Create the message hash
  const messageHash = createSnapshotMessageHash(
    snapshotId,
    root,
    cid,
    timestamp
  );

  // Sign the message hash
  const signature = await validator.signMessage(ethers.getBytes(messageHash));

  return signature;
}

/**
 * @dev Verify a snapshot signature
 * @param signature The signature to verify
 * @param snapshotId The snapshot ID
 * @param root The Merkle root
 * @param cid The IPFS CID
 * @param timestamp The timestamp
 * @param expectedSigner The expected signer address
 * @return True if signature is valid
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
    // Create the message hash
    const messageHash = createSnapshotMessageHash(
      snapshotId,
      root,
      cid,
      timestamp
    );

    // Recover the signer
    const recoveredSigner = ethers.verifyMessage(
      ethers.getBytes(messageHash),
      signature
    );

    // Check if the recovered signer matches the expected signer
    return recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * @dev Display signature result with details
 * @param signature The signature
 * @param snapshotId The snapshot ID
 * @param root The Merkle root
 * @param cid The IPFS CID
 * @param timestamp The timestamp
 * @param signer The signer address
 */
export function displaySignatureResult(
  signature: string,
  snapshotId: number,
  root: string,
  cid: string,
  timestamp: number,
  signer: string
): void {
  console.log("\n🔐 Snapshot Signature Result:");
  console.log("================================");
  console.log(`📊 Snapshot ID: ${snapshotId}`);
  console.log(`🌳 Merkle Root: ${root}`);
  console.log(`📁 IPFS CID: ${cid}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`👤 Signer: ${signer}`);
  console.log(`✍️  Signature: ${signature}`);
  console.log("================================");
}

/**
 * @dev Example usage of the snapshot signing functions
 */
export async function exampleUsage() {
  console.log("📝 Snapshot Signing Example");
  console.log("===========================");

  // Get signers
  const [owner, validator, user] = await ethers.getSigners();

  // Example snapshot data
  const snapshotId = 1;
  const root =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const cid = "QmExampleCID1234567890abcdef";
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    // Sign the snapshot message
    const signature = await signSnapshotMessage(
      validator,
      snapshotId,
      root,
      cid,
      timestamp
    );

    // Display the result
    displaySignatureResult(
      signature,
      snapshotId,
      root,
      cid,
      timestamp,
      validator.address
    );

    // Verify the signature
    const isValid = verifySnapshotSignature(
      signature,
      snapshotId,
      root,
      cid,
      timestamp,
      validator.address
    );

    console.log(`\n✅ Signature Valid: ${isValid}`);
  } catch (error) {
    console.error("❌ Error in example:", error);
  }
}

// Export all functions
export {
  createSnapshotMessageHash,
  signSnapshotMessage,
  verifySnapshotSignature,
  displaySignatureResult,
};
