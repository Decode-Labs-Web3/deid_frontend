"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBreakdown as ScoreBreakdownType } from "@/types/score.types";
import { TrendingUp, Award, Users, Zap, Target } from "lucide-react";

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
}

const scoreItems = [
  {
    key: "badgeScore" as const,
    label: "Badge Score",
    icon: Award,
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-400/10 to-orange-500/10",
  },
  {
    key: "socialScore" as const,
    label: "Social Score",
    icon: Users,
    gradient: "from-blue-400 to-cyan-500",
    bgGradient: "from-blue-400/10 to-cyan-500/10",
  },
  {
    key: "streakScore" as const,
    label: "Streak Score",
    icon: Zap,
    gradient: "from-purple-400 to-pink-500",
    bgGradient: "from-purple-400/10 to-pink-500/10",
  },
  {
    key: "chainScore" as const,
    label: "Chain Score",
    icon: TrendingUp,
    gradient: "from-green-400 to-emerald-500",
    bgGradient: "from-green-400/10 to-emerald-500/10",
  },
  {
    key: "contributionScore" as const,
    label: "Contribution",
    icon: Target,
    gradient: "from-[#CA4A87] to-[#b13e74]",
    bgGradient: "from-[#CA4A87]/10 to-[#b13e74]/10",
  },
];

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Score Breakdown</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {scoreItems.map((item) => {
          const Icon = item.icon;
          const value = breakdown[item.key];
          const maxValue = 200; // Approximate max for visualization
          const percentage = Math.min((value / maxValue) * 100, 100);

          return (
            <Card
              key={item.key}
              className="border-border hover:border-primary/50 transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${item.bgGradient}`}
                  >
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{value.toFixed(1)}</div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.gradient} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
