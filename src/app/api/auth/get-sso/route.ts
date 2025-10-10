import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const ssoState = (await cookies()).get("ssoState")?.value;

    if (!ssoState) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "SSO State is expired",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ssoToken, state } = body;

    if (ssoState !== state) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "SSO State mismatch",
        },
        { status: 401 }
      );
    }

    const requestBody = {
      sso_token: ssoToken,
    };

    // Send SSO token to your backend for validation and session creation
    const backendUrl = `${process.env.DEID_AUTH_BACKEND}/api/v1/decode/sso-validate`;

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Frontend-Internal-Request": "true",
      },
      body: JSON.stringify(requestBody),
      credentials: "include", // Important: Include cookies in the request
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message || "SSO validation failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    await backendRes.json();

    // Extract the session cookie from the backend response
    const setCookieHeader = backendRes.headers.get("set-cookie");
    let sessionCookie = "";

    if (setCookieHeader) {
      // Extract just the cookie value and name
      const cookieMatch = setCookieHeader.match(/deid_session_id=([^;]+)/);
      if (cookieMatch) {
        sessionCookie = `deid_session_id=${cookieMatch[1]}`;
      }
    }

    // If SSO validation is successful, verify session by calling profile endpoint
    const profileRes = await fetch(
      `${process.env.DEID_AUTH_BACKEND}/api/v1/decode/my-profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(sessionCookie && { Cookie: sessionCookie }), // Manually set the cookie
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!profileRes.ok) {
      return NextResponse.json(
        {
          success: false,
          statusCode: profileRes.status || 401,
          message: "Session verification failed",
        },
        { status: profileRes.status || 401 }
      );
    }

    // Get profile data to extract primary wallet address
    const profileData = await profileRes.json();
    const primaryWalletAddress = profileData?.data?.primary_wallet?.address;

    // Clean up SSO state cookie and set session cookie
    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "SSO authentication successful",
        data: {
          primaryWalletAddress: primaryWalletAddress || null,
        },
      },
      { status: 200 }
    );

    res.cookies.delete("ssoState");

    // Set the session cookie if we have it
    if (sessionCookie) {
      const cookieMatch = sessionCookie.match(/deid_session_id=([^;]+)/);
      if (cookieMatch) {
        res.cookies.set("deid_session_id", cookieMatch[1], {
          httpOnly: false, // Allow client-side access for session management
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });
      }
    }

    return res;
  } catch (error) {
    console.error("/api/auth/get-sso handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server create SSO fail",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
