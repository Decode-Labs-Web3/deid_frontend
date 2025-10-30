/**
 * @title Update Count API
 * @description Track how many times each user triggered score updates
 */

import { NextRequest, NextResponse } from "next/server";

// In-memory store (should be replaced with database)
const updateCounts = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address parameter required" },
        { status: 400 }
      );
    }

    const count = updateCounts.get(address.toLowerCase()) || 0;

    return NextResponse.json({
      success: true,
      address,
      count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get update count",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, increment = 1 } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address required" },
        { status: 400 }
      );
    }

    const currentCount = updateCounts.get(address.toLowerCase()) || 0;
    const newCount = currentCount + increment;
    updateCounts.set(address.toLowerCase(), newCount);

    return NextResponse.json({
      success: true,
      address,
      count: newCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update count",
      },
      { status: 500 }
    );
  }
}
