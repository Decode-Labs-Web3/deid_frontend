"use client";

import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { usePageTransition } from "@/hooks/use-page-transition";

const CreateAccount = () => {
  const { isVisible, navigateWithTransition } = usePageTransition({
    transitionDuration: 700,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div
        className={`flex flex-col items-center gap-12 max-w-4xl text-center transition-all duration-700 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="space-y-6">
          <p className="text-xl md:text-2xl font-semibold leading-relaxed">
            DEID TRANSFORMS YOUR DECODE DATA INTO A VERIFIABLE ON-CHAIN
            IDENTITY.
          </p>
          <p className="text-xl md:text-2xl font-semibold leading-relaxed">
            CONNECT YOUR DECODE PRIMARY WALLET TO MINT YOUR FIRST DECENTRALIZED
            IDENTITY
          </p>
        </div>

        <Button
          onClick={() => navigateWithTransition("/profile")}
          className="bg-[#CA4A87] hover:bg-[#b13e74] text-foreground font-bold text-xl px-12 py-6 rounded-full transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-105 flex items-center gap-3"
        >
          <Fingerprint className="w-6 h-6" />
          MINT ON-CHAIN PROFILE
        </Button>
      </div>
    </div>
  );
};

export default CreateAccount;
