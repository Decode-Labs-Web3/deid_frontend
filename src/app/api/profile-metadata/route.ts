import { NextRequest, NextResponse } from "next/server";
import { checkOnChainProfile } from "@/utils/onchain.utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
        },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching on-chain profile for wallet:", walletAddress);

    // Use the existing checkOnChainProfile function which handles:
    // 1. Smart contract calls to get profile data
    // 2. IPFS fetching with multiple gateway fallbacks
    // 3. Data parsing and formatting
    const onChainProfile = await checkOnChainProfile(walletAddress);

    if (!onChainProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "No on-chain profile found for this wallet address",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: onChainProfile,
    });
  } catch (error) {
    console.error("❌ Error fetching on-chain profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch on-chain profile",
      },
      { status: 500 }
    );
  }
}
