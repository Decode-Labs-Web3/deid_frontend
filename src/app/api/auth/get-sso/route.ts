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
    const backendUrl = `${process.env.NEXT_PUBLIC_DEID_AUTH_BACKEND}/api/v1/decode/sso-validate`;

    // Server-to-server call to backend
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Frontend-Internal-Request": "true",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
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

    // Extract the session cookie from backend response
    // This is a SERVER-SIDE fetch, so we need to manually extract and forward the cookie
    // Note: headers.get() returns the first value, but there might be multiple Set-Cookie headers
    const setCookieHeaders = backendRes.headers.getSetCookie?.() || [];
    const setCookieHeader = backendRes.headers.get("set-cookie") || "";

    let sessionCookieValue = "";
    let deidSessionCookieHeader = "";

    // Find the deid_session_id cookie
    if (setCookieHeaders.length > 0) {
      // Use getSetCookie() if available (Node.js 18+)
      deidSessionCookieHeader =
        setCookieHeaders.find((cookie) =>
          cookie.startsWith("deid_session_id=")
        ) || "";
    } else if (setCookieHeader) {
      // Fallback: parse single Set-Cookie header
      if (setCookieHeader.includes("deid_session_id=")) {
        deidSessionCookieHeader = setCookieHeader;
      }
    }

    if (deidSessionCookieHeader) {
      // Extract just the cookie value (before first semicolon)
      const cookieMatch = deidSessionCookieHeader.match(
        /deid_session_id=([^;]+)/
      );
      if (cookieMatch) {
        sessionCookieValue = cookieMatch[1];
        console.log("✅ Extracted session cookie from backend response");
      }
    }

    if (!sessionCookieValue) {
      console.error("❌ No session cookie found in backend response");
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "No session cookie received from backend",
        },
        { status: 401 }
      );
    }

    // Verify session by calling profile endpoint
    // For server-side requests, we must manually include the cookie in the Cookie header
    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_DEID_AUTH_BACKEND}/api/v1/decode/my-profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `deid_session_id=${sessionCookieValue}`, // Manually include cookie for server-side request
        },
        credentials: "include",
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

    // Clean up SSO state cookie
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

    // Delete the temporary ssoState cookie (this is on frontend domain)
    res.cookies.delete("ssoState");

    // IMPORTANT: Forward the Set-Cookie header from backend to browser
    // The backend set a cookie for api.de-id.xyz, but since this is a server-side fetch,
    // the browser never saw the Set-Cookie header. We need to forward it.
    if (deidSessionCookieHeader) {
      // Forward the Set-Cookie header to the browser
      // The browser will store it for api.de-id.xyz domain (as specified in the Domain attribute)
      res.headers.append("Set-Cookie", deidSessionCookieHeader);
      console.log("✅ Forwarded Set-Cookie header to browser");
    } else {
      console.warn("⚠️ No deid_session_id cookie header to forward");
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
