"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSessionId } from "@/utils/session.utils";

const Loading = () => {
  const router = useRouter();

  useEffect(() => {
    const sessionId = getSessionId();
    console.log("Root page - Session ID:", sessionId);
    console.log("Root page - All cookies:", document.cookie);

    const timer = setTimeout(() => {
      if (sessionId) {
        console.log("Root page - Redirecting to profile");
        // User has session, redirect to profile
        router.push("/profile");
      } else {
        console.log("Root page - Redirecting to login");
        // No session, redirect to login
        router.push("/login");
      }
    }, 1500);

    return () => clearTimeout(timer);
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
