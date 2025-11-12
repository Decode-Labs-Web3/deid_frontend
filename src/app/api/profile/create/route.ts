import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_DEID_AUTH_BACKEND || "http://localhost:8000";
    const backendApiUrl = `${backendUrl}/api/v1/decode/profile/create?wallet=${walletAddress}`;

    console.log(
      "🔐 Fetching profile creation calldata from backend:",
      backendApiUrl
    );

    const backendResponse = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      credentials: "include",
    });

    if (!backendResponse.ok) {
      console.error("❌ Backend request failed:", backendResponse.status);
      return NextResponse.json(
        { error: "Failed to fetch profile creation data" },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();

    if (responseData.success && responseData.data) {
      console.log("✅ Profile creation calldata fetched successfully");
      return NextResponse.json(responseData);
    } else {
      console.error("❌ Backend response indicates failure:", responseData);
      return NextResponse.json(
        { error: "Profile creation data not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("❌ Profile creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
