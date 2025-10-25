"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
const router = useRouter()
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
try {
setLoading(true);
const apiResponse = await fetch("/api/auth/create-sso", {
cache: "no-cache",
signal: AbortSignal.timeout(10000),
headers: { Accept: "application/json" },
});
const response = await apiResponse.json();

      console.log("This is login", response)
      if (!response.success) throw new Error(response.message || "Cannot start SSO");
      router.push(response.data)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

};

return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
<div className="max-w-md w-full">
{/_ Logo/Brand Area _/}
<div className="text-center mb-12">
<div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-6 shadow-2xl">
<div className="w-8 h-8 bg-black rounded-lg"></div>
</div>
<h1 className="text-4xl font-bold text-white mb-2">Dehive</h1>
<p className="text-gray-400 text-lg">Welcome back</p>
</div>

        {/* Login Card */}
        <div className="bg-black/40 backdrop-blur-lg border-[var(--border-color)] rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Sign In
              </h2>
              <p className="text-gray-400">Continue with your account</p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full bg-white hover:bg-gray-100 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Continue with SSO</span>
                  </>
                )}
              </div>
            </button>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Secure authentication powered by{" "}
                <span className="text-white font-medium">Decode</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-white hover:text-gray-300 underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-white hover:text-gray-300 underline underline-offset-2"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>

);
}

/src/app/sso
@page.tsx

"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toastError } from "@/utils/toast.utils";

export default function Authorize() {
const searchParams = useSearchParams();
const router = useRouter();
const ssoToken = searchParams.get("sso_token");
const state = searchParams.get("state");

const handleAuthorize = useCallback(async () => {
try {
const apiResponse = await fetch("/api/auth/get-sso", {
method: "POST",
headers: {
"Content-Type": "application/json",
"X-Frontend-Internal-Request": "true",
},
credentials: "include",
body: JSON.stringify({ ssoToken, state }),
cache: "no-cache",
signal: AbortSignal.timeout(10000),
});
const response = await apiResponse.json();
if (!apiResponse.ok) {
console.error(response.message);
toastError(response.message);
return;
}

      console.log(apiResponse)
      router.push("/dashboard")
    } catch (err) {
      console.error(err);
      toastError("SSO server error");
      return;
    }

}, [ssoToken, state]);

useEffect(() => {
handleAuthorize();
}, [handleAuthorize]);

return (

<div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
<h1>Authorize</h1>
<p>SSO token {ssoToken}</p>
<p>State: {state}</p>
<p>Waiting for authorize ...</p>
<button onClick={handleAuthorize}>Authorize</button>
</div>
);
}

/api/auth/create-sso
/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
try {
// console.log("hello this is sso")
const decodeBase = process.env.DECODE_BASE_URL;
if (!decodeBase) {
const statusCode = 500;
const message = "Missing DECODE_BASE_URL";
return NextResponse.json(
{ success: false, statusCode, message },
{ status: statusCode }
);
}

    const appId = process.env.DEHIVE_APP_ID ?? "dehive";

    const origin = req.nextUrl.origin;
    const redirectUri = `${origin}/sso`;

    const state = randomBytes(16).toString("base64url");

    const ssoUrl = new URL(`${decodeBase}/sso`);
    ssoUrl.searchParams.set("app", appId);
    ssoUrl.searchParams.set("redirect_uri", redirectUri);
    ssoUrl.searchParams.set("state", state);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Login URL created",
        data: ssoUrl,
      },
      { status: 200 }
    );

    res.cookies.delete("ssoState")

    res.cookies.set("ssoState", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });

    return res;

} catch (error: unknown) {
return NextResponse.json(
{
success: false,
statusCode: 500,
message: "Failed to create SSO URL",
},
{ status: 500 }
);
}
}

/api/auth/get-sso
/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRequestId, apiPathName} from "@/utils/index.utils"

function isoToMaxAgeSeconds(expiresAtISO: string): number {
const now = Date.now();
const expMs = Date.parse(expiresAtISO);
return Math.max(0, Math.floor((expMs - now) / 1000));
}

export async function POST(req: Request) {
const requestId = generateRequestId()
const pathname = apiPathName(req)
// const denied = guardInternal(req)
// if(denied) return denied

try {
// const cookieStore = await cookies();
// const ssoState = cookieStore.get("ssoState")?.value;

    const ssoState = (await cookies()).get("ssoState")?.value;

    if(!ssoState) {
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

    if(ssoState !== state) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "SSO State mismatch",
        },
        { status: 401 }
      );
    }

    // console.log("this is ssoToken and state from sso", ssoToken, state);

    const requestBody = {
      sso_token: ssoToken,
    };

    const backendRes = await fetch(
      `${process.env.DEHIVE_AUTH}/auth/session/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message || "SSO failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();
    console.log(response)

    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "SSO token created",
      },
      { status: 200 }
    );

    res.cookies.delete("ssoState")
    res.cookies.delete("accessExp")
    res.cookies.delete("sessionId")
    const accessExpISO = response.data.expires_at as string;
    const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
    const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);

    res.cookies.set("accessExp", String(accessExpSec),{
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: accessMaxAge,
    })

    res.cookies.set("sessionId", response.data.session_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

    return res;

} catch (error) {
console.error("/api/auth/sso handler error:", error);
return NextResponse.json(
{
success: false,
statusCode: 500,
message: "Server create SSO fail",
},
{ status: 500 }
);
} finally {
console.info(`${pathname}: ${requestId}`);
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

insomnia call for sso login
http://0.0.0.0:8000/api/v1/decode/sso-validate
{
"sso_token":"877540"
}
{
"success": true,
"statusCode": 200,
"message": "SSO token validated successfully",
"data": null,
"requestId": null
}
if success it auto store deid_session_id in cookie
