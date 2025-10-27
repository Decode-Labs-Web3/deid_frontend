"use client";

import Image from "next/image";

export const SearchAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Main Animation Container */}
      <div className="relative w-80 h-32 flex items-center justify-center">
        {/* DEiD Logo */}
        <div className="absolute left-0 w-16 h-16 animate-pulse">
          <Image
            src="/deid_logo_noname.png"
            alt="DEiD Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Decode Logo */}
        <div className="absolute right-0 w-16 h-16 animate-pulse">
          <Image
            src="/decode.png"
            alt="Decode Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Connecting Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Pulsing Connection Line */}
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#CA4A87] to-transparent animate-pulse"></div>

          {/* Floating Search Icons */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-3 h-3 bg-[#CA4A87] rounded-full animate-bounce"></div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div
              className="w-3 h-3 bg-[#b13e74] rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>

        {/* Blockchain Network Effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-72 h-72 border border-[#CA4A87]/20 rounded-full animate-spin"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute w-64 h-64 border border-[#b13e74]/20 rounded-full animate-spin"
            style={{ animationDuration: "6s", animationDirection: "reverse" }}
          ></div>
          <div
            className="absolute w-56 h-56 border border-[#a0335f]/20 rounded-full animate-spin"
            style={{ animationDuration: "4s" }}
          ></div>
        </div>
      </div>

      {/* Search Text */}
      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#CA4A87] to-[#b13e74] bg-clip-text text-transparent">
          Searching Blockchain & Decode Ecosystem
        </h3>
        <p className="text-muted-foreground text-sm">
          Connecting DEiD profiles across the decentralized network...
        </p>
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-[#CA4A87] rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-[#b13e74] rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-[#a0335f] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
};
