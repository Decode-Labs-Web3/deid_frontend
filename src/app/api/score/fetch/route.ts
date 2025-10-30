/**
 * @title Snapshot Fetch API
 * @description Fetch snapshot data from IPFS
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchFromIPFS } from "@/lib/ipfs/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get("cid");

    if (!cid) {
      return NextResponse.json(
        { success: false, error: "CID parameter required" },
        { status: 400 }
      );
    }

    console.log(`📥 Fetching snapshot from IPFS: ${cid}`);

    // Fetch from IPFS
    const data = await fetchFromIPFS(cid);

    console.log(`✅ Snapshot fetched successfully`);

    // Set caching headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error: any) {
    console.error("❌ Snapshot fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch snapshot",
      },
      { status: 500 }
    );
  }
}
