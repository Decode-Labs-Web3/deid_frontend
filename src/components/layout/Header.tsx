"use client";

import { WalletValidator } from "./WalletValidator";

export const Header = () => {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 fixed top-0 left-52 right-0 z-40">
      <div className="flex items-center">
        {/* You can add breadcrumbs or page title here if needed */}
      </div>

      <div className="mr-2">
        <WalletValidator />
      </div>
    </header>
  );
};
