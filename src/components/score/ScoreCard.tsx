/**
 * @title Score Card
 * @description Display user's score breakdown
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserScoreData } from "@/types/score.types";
import {
  Trophy,
  Award,
  Users,
  Flame,
  Activity,
  TrendingUp,
} from "lucide-react";

interface ScoreCardProps {
  scoreData: UserScoreData;
  showDetails?: boolean;
}

export function ScoreCard({ scoreData, showDetails = true }: ScoreCardProps) {
  const { totalScore, breakdown, rank } = scoreData;

  const scoreCategories = [
    {
      name: "Badge Score",
      value: breakdown.badgeScore,
      icon: Award,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      name: "Social Score",
      value: breakdown.socialScore,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "Streak Score",
      value: breakdown.streakScore,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      name: "Chain Score",
      value: breakdown.chainScore,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      name: "Contribution",
      value: breakdown.contributionScore,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const maxScore = Math.max(totalScore * 1.2, 1000); // Dynamic max for progress bars

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            DEiD Score
          </CardTitle>
          <Badge variant="secondary" className="text-lg font-bold">
            Rank #{rank}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Score */}
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            {totalScore}
          </div>
          <div className="text-sm text-muted-foreground">Total Score</div>
        </div>

        {/* Score Breakdown */}
        {showDetails && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Score Breakdown</div>
            {scoreCategories.map((category) => {
              const Icon = category.icon;
              const percentage = (category.value / maxScore) * 100;

              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${category.bgColor}`}>
                        <Icon className={`h-4 w-4 ${category.color}`} />
                      </div>
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{category.value}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated:{" "}
          {new Date(scoreData.lastUpdated * 1000).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
