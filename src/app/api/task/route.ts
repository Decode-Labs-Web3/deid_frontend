import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    // Extract filter parameters (can be multiple)
    const networks = searchParams.getAll("network");
    const types = searchParams.getAll("type");

    // Build backend API URL with filters
    const backendUrl =
      process.env.NEXT_PUBLIC_DEID_AUTH_BACKEND || "http://localhost:8000";
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("page_size", pageSize);

    // Add network filters (supports multiple)
    networks.forEach((network) => {
      params.append("network", network);
    });

    // Add type filters (supports multiple)
    types.forEach((type) => {
      params.append("type", type);
    });

    const apiUrl = `${backendUrl}/api/v1/task/list?${params.toString()}`;

    console.log("🔍 Fetching tasks from:", apiUrl);
    if (networks.length > 0) {
      console.log("📍 Network filters:", networks.join(", "));
    }
    if (types.length > 0) {
      console.log("🏷️  Type filters:", types.join(", "));
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error("❌ Backend API error:", response.statusText);
      return NextResponse.json(
        {
          success: false,
          error: `Backend API error: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.data?.length || 0} tasks`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}
