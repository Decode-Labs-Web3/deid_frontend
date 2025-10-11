"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StreakTracker } from "./StreakTracker";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-52">
        <Header />
        <StreakTracker />
        <main className="pt-4">{children}</main>
      </div>
    </div>
  );
};
