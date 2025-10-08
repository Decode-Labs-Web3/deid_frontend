"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Loading = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
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
