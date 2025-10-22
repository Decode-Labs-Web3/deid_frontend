import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Await params for Next.js 15+
    const { taskId } = await params;

    const backendUrl = process.env.DEID_AUTH_BACKEND || "http://localhost:8888";
    const apiUrl = `${backendUrl}/api/v1/task/${taskId}/validate`;

    console.log("🔍 Validating task:", taskId);

    // Get cookies from request and forward them to backend
    const cookies = request.headers.get("cookie") || "";

    // Backend gets wallet from session cookie (no body needed)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies, // Forward cookies from client
      },
      credentials: "include",
    });

    // Handle 401 Unauthorized - pass through to frontend for handling
    if (response.status === 401) {
      console.error("❌ 401 Unauthorized - Session expired");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          shouldLogout: true, // Signal to frontend to logout
        },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Backend validation error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.message || `Validation failed: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Task validated successfully:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error validating task:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to validate task",
      },
      { status: 500 }
    );
  }
}
