/**
 * @title Cron Score Update API
 * @description Automated daily score snapshot generation
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import DEID_PROFILE_ABI from "@/contracts/core/DEiDProfile.sol/DEiDProfile.json";
import BADGE_SYSTEM_ABI from "@/contracts/verification/BadgeSystem.sol/BadgeSystem.json";
import SCORE_FACET_ABI from "@/contracts/score/ScoreFacet.sol/ScoreFacet.json";
import { uploadAndPin } from "@/lib/ipfs/client";
import { calculateMerkleRoot } from "@/lib/score/merkle";
import { signSnapshotMessage } from "@/lib/score/signer";
import { calculateUserScore } from "@/lib/score/calculator";
import { fetchAllUserBadges } from "@/utils/badge.utils";
import { GlobalSnapshot, UserScoreData } from "@/types/score.types";

const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

const RPC_URL =
  process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

const VALIDATOR_PRIVATE_KEY = process.env.VALIDATOR_PRIVATE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("⏰ Automated score update started");

    if (!VALIDATOR_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: "Validator private key not configured" },
        { status: 500 }
      );
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(VALIDATOR_PRIVATE_KEY, provider);

    // Connect to contracts
    const profileContract = new ethers.Contract(
      PROXY_ADDRESS,
      DEID_PROFILE_ABI.abi,
      provider
    );

    const badgeContract = new ethers.Contract(
      PROXY_ADDRESS,
      BADGE_SYSTEM_ABI.abi,
      provider
    );

    const scoreContract = new ethers.Contract(
      PROXY_ADDRESS,
      SCORE_FACET_ABI.abi,
      wallet
    );

    // Fetch all users and calculate scores (same logic as recompute)
    console.log("📋 Fetching all user profiles...");
    const [addresses, usernames, metadataURIs] =
      await profileContract.getAllProfiles();
    console.log(`✅ Found ${addresses.length} users`);

    const usersData: UserScoreData[] = [];

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const username = usernames[i];

      try {
        const badges = await fetchAllUserBadges(address);

        let socialAccounts = [];
        try {
          const [platforms, accountIds] =
            await profileContract.getSocialAccounts(address);
          socialAccounts = platforms.map((platform: string, idx: number) => ({
            platform,
            accountId: accountIds[idx],
          }));
        } catch (e) {
          // No social accounts
        }

        const balanceWei = await provider.getBalance(address);
        const ethBalance = ethers.formatEther(balanceWei);
        const streakDays = 0; // TODO: Integrate with StreakTracker

        const { breakdown, total, activity } = await calculateUserScore(
          address,
          {
            badges,
            socialAccounts,
            streakDays,
            ethBalance,
            chainActivity: activity,
            updateCount: 0, // No bonus for automated updates
          },
          provider
        );

        usersData.push({
          address,
          username: username || undefined,
          totalScore: total,
          breakdown,
          rank: 0,
          badges,
          socialAccounts,
          ethBalance,
          walletActivity: activity,
          streakDays,
          updateCount: 0,
          lastUpdated: Math.floor(Date.now() / 1000),
        });
      } catch (error) {
        console.error(`❌ Error processing user ${address}:`, error);
      }
    }

    // Sort and assign ranks
    usersData.sort((a, b) => b.totalScore - a.totalScore);
    usersData.forEach((user, index) => {
      user.rank = index + 1;
    });

    // Generate snapshot
    const timestamp = Math.floor(Date.now() / 1000);
    const snapshotId = timestamp;

    const snapshot: GlobalSnapshot = {
      id: snapshotId,
      timestamp,
      merkleRoot: "",
      users: usersData,
      metadata: {
        totalUsers: usersData.length,
        averageScore:
          usersData.reduce((sum, u) => sum + u.totalScore, 0) /
          usersData.length,
        topScore: usersData[0]?.totalScore || 0,
        totalBadges: usersData.reduce((sum, u) => sum + u.badges.length, 0),
      },
    };

    const merkleRoot = calculateMerkleRoot(usersData);
    snapshot.merkleRoot = merkleRoot;

    // Upload to IPFS
    console.log("📤 Uploading to IPFS...");
    const cid = await uploadAndPin(snapshot);

    // Sign snapshot
    const signature = await signSnapshotMessage(
      VALIDATOR_PRIVATE_KEY,
      snapshotId,
      merkleRoot,
      cid,
      timestamp
    );

    // Submit transaction to contract
    console.log("📝 Submitting to blockchain...");
    const tx = await scoreContract.updateSnapshot(
      cid,
      merkleRoot,
      snapshotId,
      timestamp,
      signature
    );

    await tx.wait();
    console.log(`✅ Transaction confirmed: ${tx.hash}`);

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      snapshotId,
      cid,
      userCount: usersData.length,
    });
  } catch (error: any) {
    console.error("❌ Automated score update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update scores",
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual triggering (with auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
