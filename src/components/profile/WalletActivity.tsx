"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChainActivity } from "@/types/score.types";
import { Activity, FileText, Zap, Wallet } from "lucide-react";

interface WalletActivityProps {
  walletActivity: ChainActivity;
  ethBalance: string;
}

export function WalletActivity({
  walletActivity,
  ethBalance,
}: WalletActivityProps) {
  const formatETH = (value: string) => {
    try {
      const num = parseFloat(value);
      if (num >= 1) {
        return num.toFixed(4);
      }
      return num.toFixed(6);
    } catch {
      return "0.000000";
    }
  };

  const formatGasSpent = (value: string) => {
    try {
      const num = parseFloat(value);
      if (num === 0) return "0";
      if (num < 0.001) {
        return "< 0.001";
      }
      return num.toFixed(4);
    } catch {
      return "0";
    }
  };

  const stats = [
    {
      label: "ETH Balance",
      value: `${formatETH(ethBalance)} ETH`,
      icon: Wallet,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Transactions",
      value: walletActivity.txCount.toLocaleString(),
      icon: Activity,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "Contract Interactions",
      value: walletActivity.contractInteractions.toLocaleString(),
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Gas Spent",
      value: `${formatGasSpent(walletActivity.gasSpent)} ETH`,
      icon: Zap,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="p-2 rounded-lg bg-background">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1 truncate">
                    {stat.label}
                  </div>
                  <div className="text-sm font-semibold truncate">
                    {stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
