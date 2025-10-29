/**
 * @title Snapshot History API
 * @description Get historical snapshot metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { getSnapshotCount, getSnapshot } from "@/utils/score.contract";
import { HistoricalSnapshot } from "@/types/score.types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log(
      `📜 Fetching snapshot history (limit: ${limit}, offset: ${offset})`
    );

    // Get total snapshot count
    const totalCount = await getSnapshotCount();

    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        snapshots: [],
        total: 0,
        limit,
        offset,
      });
    }

    // Calculate which snapshots to fetch (newest first)
    const startId = Math.max(1, totalCount - offset);
    const endId = Math.max(1, startId - limit + 1);

    // Fetch snapshot metadata
    const snapshots: HistoricalSnapshot[] = [];

    for (let id = startId; id >= endId; id--) {
      try {
        const snapshot = await getSnapshot(id);
        snapshots.push({
          id: snapshot.id,
          cid: snapshot.cid,
          root: snapshot.root,
          timestamp: snapshot.timestamp,
          userCount: 0, // Would need to fetch from IPFS to get actual count
          topScore: 0, // Would need to fetch from IPFS
        });
      } catch (error) {
        console.warn(`⚠️ Failed to fetch snapshot ${id}:`, error);
      }
    }

    console.log(`✅ Fetched ${snapshots.length} snapshots`);

    return NextResponse.json({
      success: true,
      snapshots,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("❌ Snapshot history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch snapshot history",
      },
      { status: 500 }
    );
  }
}
