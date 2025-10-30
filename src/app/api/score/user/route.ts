/**
 * @title User Score API
 * @description Get individual user's score from latest snapshot
 */

import { NextRequest, NextResponse } from "next/server";
import { getLatestSnapshot } from "@/utils/score.contract";
import { fetchFromIPFS } from "@/lib/ipfs/client";
import { GlobalSnapshot } from "@/types/score.types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address parameter required" },
        { status: 400 }
      );
    }

    console.log(`👤 Fetching score for user: ${address}`);

    // Get latest snapshot from contract
    const snapshot = await getLatestSnapshot();
    console.log(`📊 Latest snapshot: ${snapshot.id}`);

    // Fetch snapshot data from IPFS
    const snapshotData: GlobalSnapshot = await fetchFromIPFS(snapshot.cid);

    // Find user in snapshot
    const userScore = snapshotData.users.find(
      (u) => u.address.toLowerCase() === address.toLowerCase()
    );

    if (!userScore) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found in latest snapshot",
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ User score: ${userScore.totalScore} (Rank: ${userScore.rank})`
    );

    return NextResponse.json({
      success: true,
      userScore,
      snapshotId: snapshot.id,
      timestamp: snapshot.timestamp,
    });
  } catch (error: any) {
    console.error("❌ User score fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user score",
      },
      { status: 500 }
    );
  }
}
