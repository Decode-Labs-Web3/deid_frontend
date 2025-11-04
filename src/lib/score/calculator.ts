/**
 * @title Score Calculator
 * @description Multi-factor score calculation utility for DEiD system
 */

import { ethers } from "ethers";
import { UserBadge } from "@/utils/badge.utils";
import { SocialAccount } from "@/utils/onchain.utils";
import {
  ScoreFactors,
  ChainActivity,
  ScoreBreakdown,
} from "@/types/score.types";

/**
 * Calculate score from badges by parsing IPFS metadata attributes
 * @param badges - Array of user's badges
 * @returns Badge score
 */
export function calculateBadgeScore(badges: UserBadge[]): number {
  let totalScore = 0;

  for (const badge of badges) {
    // Check if badge has attributes with points
    if (badge.metadata?.attributes) {
      const pointsAttribute = badge.metadata.attributes.find(
        (attr: any) =>
          attr.trait_type?.toLowerCase() === "points" ||
          attr.trait_type?.toLowerCase() === "score" ||
          attr.trait_type?.toLowerCase() === "value"
      );

      if (pointsAttribute && typeof pointsAttribute.value === "number") {
        totalScore += pointsAttribute.value;
      } else if (pointsAttribute && typeof pointsAttribute.value === "string") {
        const parsed = parseInt(pointsAttribute.value, 10);
        if (!isNaN(parsed)) {
          totalScore += parsed;
        }
      }
    }

    // Fallback: if no points attribute, count each badge as 10 points
    if (!badge.metadata?.attributes || badge.metadata.attributes.length === 0) {
      totalScore += 10;
    }
  }

  return totalScore;
}

/**
 * Calculate score from social accounts
 * @param socialAccounts - Array of linked social accounts
 * @returns Social score (5 points per account)
 */
export function calculateSocialScore(socialAccounts: SocialAccount[]): number {
  return socialAccounts.length * 5;
}

/**
 * Calculate score from streak days
 * @param streakDays - Number of consecutive days
 * @returns Streak score (1 point per day)
 */
export function calculateStreakScore(streakDays: number): number {
  return streakDays * 1;
}

/**
 * Calculate score from on-chain activity
 * @param address - User's wallet address
 * @param provider - Ethers provider
 * @returns Chain activity data and score
 */
export async function calculateChainScore(
  address: string,
  provider: ethers.JsonRpcProvider
): Promise<{ activity: ChainActivity; score: number }> {
  try {
    // Fetch ETH balance
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    const ethScore = calculateEthScore(balanceEth);

    // Calculate transaction score
    // Fetch transaction count
    const txCount = await provider.getTransactionCount(address);
    const txScore = Math.min(txCount * 0.01, 50); // Cap at 50 points, 0.01 points per tx

    // Estimate contract interactions (transactions to contract addresses)
    // For now, we'll use a simplified approach
    const contractInteractions = Math.floor(txCount * 0.3); // Estimate 30% are contract interactions
    const contractScore = contractInteractions * 0.01; // 0.01 points per contract interaction

    const activity: ChainActivity = {
      txCount,
      firstTx: null, // Would need to scan history for exact values
      lastTx: null,
      contractInteractions,
      gasSpent: "0", // Would need historical data
    };

    const totalChainScore = ethScore + txScore + contractScore;

    return { activity, score: totalChainScore };
  } catch (error) {
    console.warn(`Failed to calculate chain score for ${address}:`, error);
    return {
      activity: {
        txCount: 0,
        firstTx: null,
        lastTx: null,
        contractInteractions: 0,
        gasSpent: "0",
      },
      score: 0,
    };
  }
}

/**
 * Calculate contribution score based on update count
 * @param updateCount - Number of times user triggered score updates
 * @returns Contribution score (1 point per update)
 */
export function calculateContributionScore(updateCount: number): number {
  return updateCount * 1;
}

/**
 * Calculate ETH score with diminishing returns as described
 * @param balanceEthStr - ETH balance as string
 * @returns ETH score
 */
export function calculateEthScore(balanceEthStr: string): number {
  const balance = parseFloat(balanceEthStr);
  let score = 0;
  let remaining = balance;

  const tiers = [
    { limit: 1, points: 10 }, // first 1 ETH
    { limit: 9, points: 5 }, // next 9 (2nd to 10th)
    { limit: 90, points: 2.5 }, // next 90 (11th to 100th)
    { limit: 900, points: 1 }, // next 900 (101st to 1000th)
    // ... add more if needed
  ];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, tier.limit);
    score += take * tier.points;
    remaining -= take;
  }

  // If more than 1000 ETH, recursive diminishing (0.5 per ETH, etc.)
  if (remaining > 0) {
    score += remaining * 0.5;
  }

  return Math.floor(score);
}
/**
 * Calculate total score from all factors
 * @param factors - All score factors
 * @param chainScore - Pre-calculated chain score
 * @returns Score breakdown and total
 */
export function calculateTotalScore(
  factors: ScoreFactors,
  chainScore: number
): { breakdown: ScoreBreakdown; total: number } {
  const badgeScore = calculateBadgeScore(factors.badges);
  const socialScore = calculateSocialScore(factors.socialAccounts);
  const streakScore = calculateStreakScore(factors.streakDays);
  const contributionScore = calculateContributionScore(factors.updateCount);

  const breakdown: ScoreBreakdown = {
    badgeScore,
    socialScore,
    streakScore,
    chainScore,
    contributionScore,
  };

  const total =
    badgeScore + socialScore + streakScore + chainScore + contributionScore;

  return { breakdown, total };
}

/**
 * Calculate complete score for a user
 * @param factors - All score factors
 * @param provider - Ethers provider for chain queries
 * @returns Complete score breakdown and total
 */
export async function calculateUserScore(
  address: string,
  factors: ScoreFactors,
  provider: ethers.JsonRpcProvider
): Promise<{
  breakdown: ScoreBreakdown;
  total: number;
  activity: ChainActivity;
}> {
  const { activity, score: chainScore } = await calculateChainScore(
    address,
    provider
  );

  const { breakdown, total } = calculateTotalScore(factors, chainScore);

  return { breakdown, total, activity };
}
