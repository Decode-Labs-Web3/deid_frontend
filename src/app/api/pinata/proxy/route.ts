import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ipfsHash = searchParams.get("hash");
    const type = searchParams.get("type"); // "metadata" or "avatar"

    if (!ipfsHash) {
      return NextResponse.json(
        { error: "IPFS hash is required" },
        { status: 400 }
      );
    }

    const pinataAccessToken = process.env.NEXT_PUBLIC_PINATA_ACCESS_TOKEN;
    const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

    if (!pinataAccessToken || !pinataApiSecret) {
      return NextResponse.json(
        { error: "Pinata credentials not configured" },
        { status: 500 }
      );
    }

    let pinataUrl: string;
    let headers: Record<string, string> = {};

    if (type === "metadata") {
      // For metadata, first check if pin exists, then fetch content
      pinataUrl = `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`;
      headers = {
        pinata_api_key: pinataAccessToken,
        pinata_secret_api_key: pinataApiSecret,
        "Content-Type": "application/json",
      };

      console.log("🔐 Checking pin existence via Pinata API");
      const pinCheckResponse = await fetch(pinataUrl, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!pinCheckResponse.ok) {
        console.error("❌ Pin check failed:", pinCheckResponse.status);
        return NextResponse.json(
          { error: "Failed to check pin existence" },
          { status: pinCheckResponse.status }
        );
      }

      const pinData = await pinCheckResponse.json();
      if (!pinData.rows || pinData.rows.length === 0) {
        return NextResponse.json({ error: "Pin not found" }, { status: 404 });
      }

      // Now fetch the actual content
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      console.log("📡 Fetching content from gateway:", gatewayUrl);

      const contentResponse = await fetch(gatewayUrl, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!contentResponse.ok) {
        console.error("❌ Content fetch failed:", contentResponse.status);
        return NextResponse.json(
          { error: "Failed to fetch content" },
          { status: contentResponse.status }
        );
      }

      const content = await contentResponse.json();
      return NextResponse.json(content);
    } else if (type === "avatar") {
      // For avatar, check if pin exists and return the gateway URL
      pinataUrl = `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`;
      headers = {
        pinata_api_key: pinataAccessToken,
        pinata_secret_api_key: pinataApiSecret,
        "Content-Type": "application/json",
      };

      console.log("🔐 Checking avatar pin existence via Pinata API");
      const pinCheckResponse = await fetch(pinataUrl, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!pinCheckResponse.ok) {
        console.error("❌ Avatar pin check failed:", pinCheckResponse.status);
        return NextResponse.json(
          { error: "Failed to check avatar pin" },
          { status: pinCheckResponse.status }
        );
      }

      const pinData = await pinCheckResponse.json();
      if (!pinData.rows || pinData.rows.length === 0) {
        return NextResponse.json(
          { error: "Avatar pin not found" },
          { status: 404 }
        );
      }

      // Return the gateway URL for the avatar
      const avatarUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      return NextResponse.json({ avatar_url: avatarUrl });
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Pinata proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
