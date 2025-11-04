/**
 * @title Leaderboard Page
 * @description Full leaderboard with filtering and search
 */

"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Leaderboard } from "@/components/score/Leaderboard";
import { RefreshScoreButton } from "@/components/score/RefreshScoreButton";
import { SnapshotHistory } from "@/components/score/SnapshotHistory";
import { useSnapshot } from "@/hooks/useSnapshot";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, TrendingUp, Clock } from "lucide-react";

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { snapshot, loading, refresh } = useSnapshot();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(25);

  // Define a util for floor-ing score fields in the snapshot metadata
  const getFlooredMetadata = (metadata: any) => {
    if (!metadata) return {};
    return {
      ...metadata,
      topScore: Math.floor(metadata.topScore),
      averageScore: Math.floor(metadata.averageScore),
      // add others as necessary for future expansion
    };
  };

  const flooredMetadata = snapshot ? getFlooredMetadata(snapshot.metadata) : {};

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Top DEiD users ranked by score
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshScoreButton onSuccess={refresh} />
          </div>
        </div>

        {/* Stats Overview */}
        {snapshot && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {flooredMetadata.totalUsers ?? snapshot.metadata.totalUsers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {flooredMetadata.topScore}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {flooredMetadata.averageScore}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {flooredMetadata.totalBadges ?? snapshot.metadata.totalBadges}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="top100" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="top10">Top 10</TabsTrigger>
            <TabsTrigger value="top100">Top 100</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="top10" className="space-y-6">
            <Leaderboard limit={10} currentUserAddress={address} floorScores />
          </TabsContent>

          <TabsContent value="top100" className="space-y-6">
            <Leaderboard limit={100} currentUserAddress={address} floorScores />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <SnapshotHistory limit={10} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
