"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePageTransition } from "@/hooks/use-page-transition";
import { getSessionId } from "@/utils/session.utils";

// Component that uses useSearchParams - must be wrapped in Suspense
const LoginContent = ({
  onError,
}: {
  onError: (error: string | null) => void;
}) => {
  const searchParams = useSearchParams();

  // Check for error from SSO callback
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      onError(decodeURIComponent(errorParam));
    }
  }, [searchParams, onError]);

  return null;
};

const Login = () => {
  const { isVisible } = usePageTransition({
    transitionDuration: 600,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const sessionId = getSessionId();
    console.log("Login page - Session ID:", sessionId);
    console.log("Login page - All cookies:", document.cookie);
    if (sessionId) {
      console.log("Login page - Redirecting to profile");
      router.push("/profile");
    } else {
      console.log("Login page - No session found, staying on login page");
    }
  }, [router]);

  const handleSSOLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiResponse = await fetch("/api/auth/create-sso", {
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
        headers: { Accept: "application/json" },
      });

      const response = await apiResponse.json();

      console.log("SSO Login Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Cannot start SSO");
      }

      // Redirect to Decode SSO
      window.location.href = response.data;
    } catch (error) {
      console.error("SSO Login Error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Suspense fallback={null}>
        <LoginContent onError={setError} />
      </Suspense>
      <div
        className={`flex flex-col items-center max-w-4xl transition-all duration-600 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center mb-8">
          <div className="flex items-center mb-21">
            <Image
              src="/deid_logo_noname.png"
              alt="DEiD Logo"
              width={300}
              height={300}
              className="transition-transform duration-600 ease-in-out"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-left leading-tight">
            YOUR ON-CHAIN
            <br />
            DECENTRALIZED
            <br />
            IDENTITY
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSSOLogin}
          disabled={loading}
          className="bg-[#CA4A87] hover:bg-[#b13e74] text-foreground font-bold text-xl px-12 py-6 rounded-full transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Redirecting to Decode...</span>
            </div>
          ) : (
            "LOGIN BY DECODE PORTAL"
          )}
        </Button>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Secure authentication powered by{" "}
            <span className="text-primary font-medium">Decode</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
