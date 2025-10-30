/**
 * @title Score Recomputation API
 * @description User-triggered global score recalculation with IPFS upload and signing
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import DEID_PROFILE_ABI from "@/contracts/core/DEiDProfile.sol/DEiDProfile.json";
// import BADGE_SYSTEM_ABI from "@/contracts/verification/BadgeSystem.sol/BadgeSystem.json";
import { uploadAndPin } from "@/lib/ipfs/client";
import { calculateMerkleRoot } from "@/lib/score/merkle";
import { signSnapshotMessage } from "@/lib/score/signer";
import { calculateUserScore } from "@/lib/score/calculator";
import { fetchAllUserBadges } from "@/utils/badge.utils";
import {
  GlobalSnapshot,
  UserScoreData,
  RecomputeResponse,
} from "@/types/score.types";
// import { fetchProfileMetadataFromIPFS } from "@/utils/ipfs.utils";

const PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";

const RPC_URL =
  process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

const VALIDATOR_PRIVATE_KEY = process.env.VALIDATOR_PRIVATE_KEY;

// In-memory store for update counts (should be replaced with database)
const updateCounts = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Score recomputation request received");

    // Parse request body
    const { triggerAddress } = await request.json();

    if (!triggerAddress || !ethers.isAddress(triggerAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid trigger address" },
        { status: 400 }
      );
    }

    if (!VALIDATOR_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: "Validator private key not configured" },
        { status: 500 }
      );
    }

    console.log(`👤 Triggered by: ${triggerAddress}`);

    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Connect to contracts
    const profileContract = new ethers.Contract(
      PROXY_ADDRESS,
      DEID_PROFILE_ABI.abi,
      provider
    );

    // const badgeContract = new ethers.Contract(
    //   PROXY_ADDRESS,
    //   BADGE_SYSTEM_ABI.abi,
    //   provider
    // );

    // Step 1: Fetch all user profiles
    console.log("📋 Fetching all user profiles...");
    const [addresses, usernames, metadataURIs] =
      await profileContract.getAllProfiles();
    console.log(`✅ Found ${addresses.length} users`);
    console.log(
      `   Preview users:`,
      addresses.slice(0, 5).map((a: string, i: number) => ({
        address: a,
        username: usernames[i],
        metadataURI: metadataURIs[i],
      }))
    );

    if (addresses.length === 0) {
      return NextResponse.json(
        { success: false, error: "No users found" },
        { status: 404 }
      );
    }

    // Step 2: Calculate scores for each user
    console.log("🧮 Calculating scores for all users...");
    const usersData: UserScoreData[] = [];

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const username = usernames[i];

      try {
        console.log(
          `  Processing user ${i + 1}/${addresses.length}: ${address}`
        );

        // Fetch badges
        const badges = await fetchAllUserBadges(address);
        console.log(`    🏆 Badges: ${badges.length}`);

        // Fetch social accounts
        let socialAccounts = [];
        try {
          const [platforms, accountIds] =
            await profileContract.getSocialAccounts(address);
          socialAccounts = platforms.map((platform: string, idx: number) => ({
            platform,
            accountId: accountIds[idx],
          }));
          console.log(`    🔗 Social accounts: ${socialAccounts.length}`);
        } catch {
          console.warn(`  ⚠️ No social accounts for ${address}`);
        }

        // Fetch ETH balance
        const balanceWei = await provider.getBalance(address);
        const ethBalance = ethers.formatEther(balanceWei);
        console.log(`    💰 ETH balance: ${ethBalance}`);

        // Get streak days (mock for now - should integrate with StreakTracker)
        const streakDays = 0; // TODO: Integrate with StreakTracker contract

        // Get update count
        const currentCount = updateCounts.get(address.toLowerCase()) || 0;
        const updateCount =
          address.toLowerCase() === triggerAddress.toLowerCase()
            ? currentCount + 1
            : currentCount;

        // Calculate score
        const { breakdown, total, activity } = await calculateUserScore(
          address,
          {
            badges,
            socialAccounts,
            streakDays,
            ethBalance,
            // Placeholder; the calculator computes real activity internally
            chainActivity: {
              txCount: 0,
              firstTx: null,
              lastTx: null,
              contractInteractions: 0,
              gasSpent: "0",
            },
            updateCount,
          },
          provider
        );

        console.log(`    📈 Breakdown:`, breakdown);
        console.log(
          `    🧭 Activity: tx=${activity.txCount}, contracts=${activity.contractInteractions}`
        );

        usersData.push({
          address,
          username: username || undefined,
          totalScore: total,
          breakdown,
          rank: 0, // Will be assigned after sorting
          badges,
          socialAccounts,
          ethBalance,
          walletActivity: activity,
          streakDays,
          updateCount,
          lastUpdated: Math.floor(Date.now() / 1000),
        });

        console.log(`  ✅ Score: ${total} (${address.slice(0, 8)}...)`);
      } catch (error) {
        console.error(`  ❌ Error processing user ${address}:`, error);
        console.error(
          `     Username: ${username} | MetadataURI: ${metadataURIs[i]}`
        );
        // Continue with other users
      }
    }

    // Step 3: Sort by score and assign ranks
    if (usersData.length === 0) {
      console.warn("⚠️ No user scores computed. Aborting snapshot upload.");
      return NextResponse.json(
        { success: false, error: "No user scores computed (usersData empty)" },
        { status: 500 }
      );
    }
    usersData.sort((a, b) => b.totalScore - a.totalScore);
    usersData.forEach((user, index) => {
      user.rank = index + 1;
    });

    console.log(`🏆 Top 3 users:`);
    usersData.slice(0, 3).forEach((user) => {
      console.log(
        `  ${user.rank}. ${user.username || user.address.slice(0, 8)} - ${
          user.totalScore
        } pts`
      );
    });

    // Step 4: Update count for trigger address
    updateCounts.set(
      triggerAddress.toLowerCase(),
      (updateCounts.get(triggerAddress.toLowerCase()) || 0) + 1
    );

    // Step 5: Generate global snapshot
    const timestamp = Math.floor(Date.now() / 1000);
    const snapshotId = timestamp; // Use timestamp as snapshot ID

    const snapshot: GlobalSnapshot = {
      id: snapshotId,
      timestamp,
      merkleRoot: "", // Will be calculated next
      users: usersData,
      metadata: {
        totalUsers: usersData.length,
        averageScore:
          usersData.length > 0
            ? usersData.reduce((sum, u) => sum + u.totalScore, 0) /
              usersData.length
            : 0,
        topScore: usersData[0]?.totalScore || 0,
        totalBadges: usersData.reduce((sum, u) => sum + u.badges.length, 0),
      },
    };

    // Step 6: Calculate Merkle root
    console.log("🌳 Calculating Merkle root...");
    const merkleRoot = calculateMerkleRoot(usersData);
    snapshot.merkleRoot = merkleRoot;

    // Step 7: Upload to IPFS
    console.log("📤 Uploading snapshot to IPFS...");
    const cid = await uploadAndPin(snapshot);
    console.log(`✅ Uploaded to IPFS: ${cid}`);

    // Step 8: Sign snapshot
    console.log("🔐 Signing snapshot...");
    const signature = await signSnapshotMessage(
      VALIDATOR_PRIVATE_KEY,
      snapshotId,
      merkleRoot,
      cid,
      timestamp
    );

    // Step 9: Find trigger user's score
    const triggerUserScore = usersData.find(
      (u) => u.address.toLowerCase() === triggerAddress.toLowerCase()
    );

    const response: RecomputeResponse = {
      success: true,
      cid,
      root: merkleRoot,
      snapshotId,
      timestamp,
      signature,
      userCount: usersData.length,
      triggerBonus: true,
      userScore: triggerUserScore,
    };

    console.log("✅ Score recomputation complete");
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Score recomputation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to recompute scores",
      },
      { status: 500 }
    );
  }
}
