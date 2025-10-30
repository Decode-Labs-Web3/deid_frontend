/**
 * @title Score System Type Definitions
 * @description Comprehensive type definitions for the DEiD score calculation system
 */

import { UserBadge } from "@/utils/badge.utils";
import { SocialAccount } from "@/utils/onchain.utils";

/**
 * Chain activity metrics for a user
 */
export interface ChainActivity {
  txCount: number;
  firstTx: number | null; // timestamp
  lastTx: number | null; // timestamp
  contractInteractions: number;
  gasSpent: string; // in ETH as string to avoid precision issues
}

/**
 * Score breakdown by category
 */
export interface ScoreBreakdown {
  badgeScore: number;
  socialScore: number;
  streakScore: number;
  chainScore: number;
  contributionScore: number;
}

/**
 * Individual user's score data
 */
export interface UserScoreData {
  address: string;
  username?: string;
  totalScore: number;
  breakdown: ScoreBreakdown;
  rank: number;
  badges: UserBadge[];
  socialAccounts: SocialAccount[];
  ethBalance: string; // in ETH as string
  walletActivity: ChainActivity;
  streakDays: number;
  updateCount: number;
  lastUpdated: number; // timestamp
}

/**
 * Metadata for a snapshot
 */
export interface SnapshotMetadata {
  cid: string;
  root: string; // merkle root
  id: number;
  timestamp: number;
  userCount: number;
}

/**
 * Global snapshot containing all users
 */
export interface GlobalSnapshot {
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
 * Score calculation factors
 */
export interface ScoreFactors {
  badges: UserBadge[];
  socialAccounts: SocialAccount[];
  streakDays: number;
  ethBalance: string;
  chainActivity: ChainActivity;
  updateCount: number;
}

/**
 * API response for score recomputation
 */
export interface RecomputeResponse {
  success: boolean;
  cid: string;
  root: string;
  snapshotId: number;
  timestamp: number;
  signature: string;
  userCount: number;
  triggerBonus: boolean;
  userScore?: UserScoreData;
}

/**
 * Snapshot signature data
 */
export interface SnapshotSignature {
  snapshotId: number;
  root: string;
  cid: string;
  timestamp: number;
  signature: string;
}

/**
 * Score update request
 */
export interface ScoreUpdateRequest {
  triggerAddress: string;
}

/**
 * Historical snapshot info
 */
export interface HistoricalSnapshot {
  id: number;
  cid: string;
  root: string;
  timestamp: number;
  userCount: number;
  topScore: number;
}
