/**
 * @title Score Card
 * @description Display user's score breakdown (compact)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserScoreData } from "@/types/score.types";
import {
  Award,
  Users,
  Flame,
  Activity,
  TrendingUp,
  Info,
  Trophy,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ScoreCardProps {
  scoreData: UserScoreData;
  showDetails?: boolean;
}

function ScoreExplanation() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 mt-2 text-xs leading-relaxed max-w-sm">
      <div className="flex items-center gap-2 font-semibold mb-2">
        <Info className="w-4 h-4 text-blue-500" />
        How is your DEiD Score calculated?
      </div>
      <ul className="list-disc ml-4 mt-2 space-y-1">
        <li>
          <b>Badge Score</b>: Each badge (POAP, SBT, NFT) can grant points if
          its metadata contains a <code>points</code>, <code>score</code>, or{" "}
          <code>value</code> attribute. Badges with no score attribute are worth{" "}
          <b>10 points</b> by default.
        </li>
        <li>
          <b>Social Score</b>: <b>5 points</b> for each verified social account
          you link (Twitter, Discord, etc)
        </li>
        <li>
          <b>Streak Score</b>: <b>1 point</b> for every day you maintain a
          check-in streak
        </li>
        <li>
          <b>Chain Score</b>: Based on your ETH balance, total transactions (2
          points each, capped at 500), and contract activity (estimated 3 points
          per contract interaction, ~30% of txns)
        </li>
        <li>
          <b>Contribution</b>: <b>1 point</b> each time you trigger a snapshot
          update (refresh score on-chain)
        </li>
        <li>
          <b>Total Score</b> = Sum of all above scores
        </li>
      </ul>
      <div className="mt-2 text-[11px] text-muted-foreground">
        For nerds: see <code>lib/score/calculator.ts</code> for the actual
        logic.
      </div>
    </div>
  );
}

export function ScoreCard({ scoreData, showDetails = true }: ScoreCardProps) {
  const { breakdown, rank, lastUpdated } = scoreData;

  // Icons/components for the mini-cards
  const IconBadge = Award;
  const IconSocial = Users;
  const IconStreak = Flame;
  const IconContribution = TrendingUp;
  const IconChain = Activity;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            DEiD Score Breakdown
            <HoverCard openDelay={150} closeDelay={100}>
              <HoverCardTrigger asChild>
                <span className="ml-2 text-xs text-blue-600 hover:underline cursor-help inline-flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> How is it calculated?
                </span>
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                sideOffset={8}
                className="p-0 border-none bg-transparent shadow-none"
              >
                <ScoreExplanation />
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <Badge variant="secondary" className="text-lg font-bold">
            Rank #{rank}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Compact Breakdown Layout */}
        <div className="flex flex-col gap-3">
          {/* Top row: Badge | Social | Streak */}
          <div className="flex flex-row items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-purple-500/10 rounded-lg px-3 py-1 min-w-[85px] justify-center">
              <IconBadge className="h-4 w-4 text-purple-500" />
              <span className="font-semibold text-purple-700 text-sm">
                Badge:
              </span>
              <span className="font-bold text-sm">{breakdown.badgeScore}</span>
            </div>
            <span className="mx-2 text-muted-foreground font-bold">|</span>
            <div className="flex items-center gap-1 bg-blue-500/10 rounded-lg px-3 py-1 min-w-[95px] justify-center">
              <IconSocial className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-blue-700 text-sm">
                Social:
              </span>
              <span className="font-bold text-sm">{breakdown.socialScore}</span>
            </div>
            <span className="mx-2 text-muted-foreground font-bold">|</span>
            <div className="flex items-center gap-1 bg-orange-500/10 rounded-lg px-3 py-1 min-w-[90px] justify-center">
              <IconStreak className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-orange-700 text-sm">
                Streak:
              </span>
              <span className="font-bold text-sm">{breakdown.streakScore}</span>
            </div>
          </div>
          {/* Bottom row: Contribution | Chain */}
          <div className="flex flex-row items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1 bg-yellow-500/10 rounded-lg px-3 py-1 min-w-[120px] justify-center">
              <IconContribution className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold text-yellow-700 text-sm">
                Contribution
              </span>
              <span className="font-bold text-sm ml-1">
                {breakdown.contributionScore}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-green-500/10 rounded-lg px-3 py-1 min-w-[105px] justify-center">
              <IconChain className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-green-700 text-sm">
                Chain
              </span>
              <span className="font-bold text-sm ml-1">
                {breakdown.chainScore}
              </span>
            </div>
          </div>
        </div>
        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center mt-3">
          Last updated: {new Date(lastUpdated * 1000).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
