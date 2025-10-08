"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePageTransition } from "@/hooks/use-page-transition";

const Login = () => {
  const { isVisible, navigateWithTransition } = usePageTransition({
    transitionDuration: 600,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div
        className={`flex flex-col items-center max-w-4xl transition-all duration-600 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center mb-12">
          <div className="flex items-center mr-8">
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

        <Button
          onClick={() => navigateWithTransition("/create-account")}
          className="bg-[#CA4A87] hover:bg-[#b13e74] text-foreground font-bold text-xl px-12 py-6 rounded-full transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-105"
        >
          LOGIN BY DECODE PORTAL
        </Button>
      </div>
    </div>
  );
};

export default Login;
