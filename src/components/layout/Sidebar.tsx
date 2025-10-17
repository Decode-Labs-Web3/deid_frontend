"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Fingerprint,
  Target,
  Store,
  Vote,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { logout } from "@/utils/session.utils";

const navigationItems = [
  { name: "Profile", path: "/profile", icon: User },
  { name: "Identity", path: "/identity", icon: Fingerprint },
  { name: "Origin Task", path: "/origin-task", icon: Target },
  { name: "Marketplace", path: "/task-marketplace", icon: Store },
  { name: "Trust Vote", path: "/trust-vote", icon: Vote },
  { name: "Settings", path: "/setting", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-55 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <Image src="/deid_logo_noname.png" alt="DEiD" width={40} height={40} />
        <span className="text-2xl font-bold tracking-tight">DEiD</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 border-l-4 border-primary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <Fingerprint className="w-13 h-13 text-primary" />
          <div className="flex flex-col flex-1">
            <span className="text-xs text-muted-foreground">
              By Decode Labs
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-all hover:shadow-[0_0_8px_2px_rgba(202,74,135,0.5)]"
            title="Logout"
          >
            <LogOut className="w-5 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};
