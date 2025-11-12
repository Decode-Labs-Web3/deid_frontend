"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSessionId } from "@/utils/session.utils";

const Loading = () => {
  const router = useRouter();

  useEffect(() => {
    const testSessionAndRedirect = async () => {
      const sessionId = getSessionId();
      console.log("🔍 Root page - Session ID from cookie:", sessionId);
      console.log("🍪 Root page - All cookies:", document.cookie);

      // Test if backend can authenticate with the session cookie
      try {
        console.log("🧪 Testing session cookie by calling backend...");
        const backendUrl =
          process.env.NEXT_PUBLIC_DEID_AUTH_BACKEND || "http://localhost:8000";

        const response = await fetch(`${backendUrl}/api/v1/decode/my-profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // This sends cookies automatically
        });

        console.log("📡 Backend response status:", response.status);

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            console.log(
              "✅ Session cookie is WORKING! Backend authenticated successfully"
            );
            console.log("👤 User data:", data.data);

            // Store user role if available
            if (data.data?.role) {
              sessionStorage.setItem("userRole", data.data.role);
              console.log("💾 User role stored:", data.data.role);
            }

            console.log("➡️  Redirecting to /profile");

            // Wait a moment to show the logo, then redirect
            setTimeout(() => {
              router.push("/profile");
            }, 1000);
          } else {
            console.log("❌ Backend returned success=false");
            console.log("➡️  Redirecting to /login");
            setTimeout(() => {
              router.push("/login");
            }, 1000);
          }
        } else {
          console.log(
            "❌ Session cookie FAILED. Response:",
            response.statusText
          );
          console.log("➡️  Redirecting to /login");
          setTimeout(() => {
            router.push("/login");
          }, 1000);
        }
      } catch (error) {
        console.error("❌ Error testing session cookie:", error);
        console.log("➡️  Redirecting to /login due to error");
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    };

    testSessionAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <Image
          src="/deid_logo.png"
          alt="DEiD Logo"
          width={300}
          height={300}
          className="animate-pulse"
        />
      </div>
    </div>
  );
};

export default Loading;
