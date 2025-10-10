"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function SSOCallback() {
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
        // Redirect to login with error
        router.push("/login?error=" + encodeURIComponent(response.message));
        return;
      }

      console.log("SSO Success:", response);

      router.push("/profile");
    } catch (err) {
      console.error("SSO Error:", err);
      router.push("/login?error=" + encodeURIComponent("SSO server error"));
      return;
    }
  }, [ssoToken, state, router]);

  useEffect(() => {
    if (ssoToken && state) {
      handleAuthorize();
    } else {
      router.push(
        "/login?error=" + encodeURIComponent("Missing SSO parameters")
      );
    }
  }, [ssoToken, state, handleAuthorize, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/deid_logo.png"
          alt="DEiD Logo"
          width={200}
          height={200}
          className="animate-pulse"
        />
        <h1 className="text-3xl font-bold">Authorizing...</h1>
        <p className="text-muted-foreground">
          Please wait while we verify your identity
        </p>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
