import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("📤 IPFS Upload API: Received upload request");

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ No file provided");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("📁 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error("❌ File too large:", file.size);
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Create FormData for IPFS upload
    const ipfsFormData = new FormData();
    ipfsFormData.append("file", file);

    // Get IPFS gateway URL from environment or use default
    const ipfsGateway =
      process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL_POST ||
      "http://35.247.142.76:5001/api/v0/add";

    console.log("🌐 Uploading to IPFS gateway:", ipfsGateway);

    // Upload to IPFS
    const ipfsResponse = await fetch(ipfsGateway, {
      method: "POST",
      body: ipfsFormData,
    });

    if (!ipfsResponse.ok) {
      const errorText = await ipfsResponse.text();
      console.error("❌ IPFS upload failed:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `IPFS upload failed: ${ipfsResponse.statusText}`,
        },
        { status: ipfsResponse.status }
      );
    }

    const ipfsData = await ipfsResponse.json();
    console.log("✅ IPFS upload successful:", ipfsData);

    // Return the IPFS hash
    return NextResponse.json({
      success: true,
      hash: ipfsData.Hash,
      name: ipfsData.Name,
      size: ipfsData.Size,
    });
  } catch (error) {
    console.error("❌ IPFS upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
