import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    const backendUrl = process.env.DEID_AUTH_BACKEND || "http://localhost:8000";
    const apiUrl = `${backendUrl}/api/v1/task/list?page=${page}&page_size=${pageSize}`;

    console.log("🔍 Fetching tasks from:", apiUrl);

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
