import { Link, useLocation } from "react-router-dom";
import { User, Fingerprint, Target, Store, Vote, Settings } from "lucide-react";
import deidLogo from "@/assets/deid-logo.png";

const navigationItems = [
  { name: "Profile", path: "/dashboard", icon: User },
  { name: "Identity", path: "/identity", icon: Fingerprint },
  { name: "Origin Task", path: "#", icon: Target },
  { name: "Marketplace", path: "#", icon: Store },
  { name: "Trust Vote", path: "#", icon: Vote },
  { name: "Settings", path: "#", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <img src={deidLogo} alt="DEiD" className="w-10 h-10" />
        <span className="text-2xl font-bold tracking-tight">DEiD</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 border-l-4 border-primary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Fingerprint className="w-8 h-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Son Nguyen</span>
            <span className="text-xs text-muted-foreground">@PasonDev</span>
          </div>
        </div>
      </div>
    </div>
  );
};
