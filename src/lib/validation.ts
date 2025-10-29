/**
 * @title Validation Utilities
 * @description Input validation for score system
 */

import { ethers } from "ethers";

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns True if valid
 */
export function validateAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate IPFS CID format
 * @param cid - CID to validate
 * @returns True if valid format
 */
export function validateCID(cid: string): boolean {
  // Basic CID validation - should start with Qm and be 46 chars (CIDv0)
  // or start with b and be longer (CIDv1)
  if (!cid) return false;

  // CIDv0: Qm followed by 44 base58 characters
  if (cid.startsWith("Qm") && cid.length === 46) {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid);
  }

  // CIDv1: starts with 'b' and uses base32
  if (cid.startsWith("b") && cid.length > 46) {
    return /^b[a-z2-7]{50,}$/.test(cid);
  }

  return false;
}

/**
 * Validate signature format
 * @param signature - Signature to validate
 * @returns True if valid format
 */
export function validateSignature(signature: string): boolean {
  // Should be 0x followed by 130 hex characters (65 bytes)
  return /^0x[0-9a-fA-F]{130}$/.test(signature);
}

/**
 * Validate timestamp (must be reasonable - not too far in past or future)
 * @param timestamp - Unix timestamp in seconds
 * @returns True if valid
 */
export function validateTimestamp(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - 365 * 24 * 60 * 60;
  const oneYearFromNow = now + 365 * 24 * 60 * 60;

  return timestamp >= oneYearAgo && timestamp <= oneYearFromNow;
}

/**
 * Validate snapshot ID (must be positive)
 * @param id - Snapshot ID
 * @returns True if valid
 */
export function validateSnapshotId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

/**
 * Validate merkle root format
 * @param root - Merkle root to validate
 * @returns True if valid format
 */
export function validateMerkleRoot(root: string): boolean {
  // Should be 0x followed by 64 hex characters (32 bytes)
  return /^0x[0-9a-fA-F]{64}$/.test(root);
}

/**
 * Sanitize user input string
 * @param input - Input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  // Remove any HTML/script tags
  const cleaned = input.replace(/<[^>]*>/g, "");
  // Trim to max length
  return cleaned.slice(0, maxLength).trim();
}

/**
 * Validate API request data
 * @param data - Request data
 * @param requiredFields - Required field names
 * @returns Validation result
 */
export function validateRequestData(
  data: any,
  requiredFields: string[]
): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request data" };
  }

  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  return { valid: true };
}

/**
 * Rate limit checker (simple implementation)
 */
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const requests = rateLimitStore.get(identifier) || [];

  // Filter out old requests
  const recentRequests = requests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);

  return { allowed: true, remaining: maxRequests - recentRequests.length };
}
