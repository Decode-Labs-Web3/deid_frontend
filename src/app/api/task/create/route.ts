import { NextRequest, NextResponse } from "next/server";

interface TaskAttribute {
  trait_type: string;
  value: string | number;
}

interface BadgeDetails {
  badge_name: string;
  badge_description: string;
  badge_image: string;
  attributes: TaskAttribute[];
}

interface CreateTaskPayload {
  task_title: string;
  task_description: string;
  validation_type: string;
  blockchain_network: string;
  token_contract_address: string;
  minimum_balance: number;
  badge_details: BadgeDetails;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Task Creation API: Received create request");

    // Parse request body
    const payload: CreateTaskPayload = await request.json();

    // Validate required fields
    const requiredFields = [
      "task_title",
      "task_description",
      "validation_type",
      "blockchain_network",
      "token_contract_address",
      "minimum_balance",
      "badge_details",
    ];

    for (const field of requiredFields) {
      if (!payload[field as keyof CreateTaskPayload]) {
        console.error(`❌ Missing required field: ${field}`);
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate badge details
    const { badge_details } = payload;
    if (
      !badge_details.badge_name ||
      !badge_details.badge_description ||
      !badge_details.badge_image
    ) {
      console.error("❌ Incomplete badge details");
      return NextResponse.json(
        {
          success: false,
          message: "Incomplete badge details",
        },
        { status: 400 }
      );
    }

    console.log("✅ Payload validated:", {
      task_title: payload.task_title,
      validation_type: payload.validation_type,
      blockchain_network: payload.blockchain_network,
      badge_name: badge_details.badge_name,
    });

    // Get backend URL from environment
    const backendUrl = process.env.DEID_AUTH_BACKEND || "http://0.0.0.0:8000";
    const apiUrl = `${backendUrl}/api/v1/task/create`;

    console.log("🌐 Sending task to backend:", apiUrl);

    // Forward request to backend
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies from the original request
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // Get response data
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend error:", data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to create task",
          error: data.error,
        },
        { status: response.status }
      );
    }

    console.log("✅ Task created successfully:", data.data?.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Task creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
