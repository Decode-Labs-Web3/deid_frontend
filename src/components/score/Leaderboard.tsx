/**
 * @title Leaderboard Component
 * @description Display top users by score
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Trophy, Medal, Award } from "lucide-react";
import { convertIPFSUrlToHttp } from "@/utils/ipfs.utils";

interface LeaderboardProps {
  limit?: number;
  currentUserAddress?: string;
}

export function Leaderboard({
  limit = 10,
  currentUserAddress,
}: LeaderboardProps) {
  const { snapshot, loading, error } = useSnapshot();
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  // Load avatar URLs
  useEffect(() => {
    if (snapshot) {
      const topUsers = snapshot.users.slice(0, limit);
      topUsers.forEach((user) => {
        if (user.badges && user.badges.length > 0) {
          // Use first badge image as avatar fallback
          const firstBadge = user.badges[0];
          if (firstBadge.metadata?.image) {
            setAvatarUrls((prev) => ({
              ...prev,
              [user.address]: convertIPFSUrlToHttp(firstBadge.metadata.image),
            }));
          }
        }
      });
    }
  }, [snapshot, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 2:
        return "bg-gray-400/10 text-gray-400 border-gray-400/20";
      case 3:
        return "bg-orange-600/10 text-orange-600 border-orange-600/20";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || "No data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const topUsers = snapshot.users.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <Badge variant="secondary">
            {snapshot.metadata.totalUsers} users
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topUsers.map((user) => {
          const isCurrentUser =
            currentUserAddress &&
            user.address.toLowerCase() === currentUserAddress.toLowerCase();

          return (
            <div
              key={user.address}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-10">
                {getRankIcon(user.rank) || (
                  <Badge
                    variant="outline"
                    className={getRankBadgeColor(user.rank)}
                  >
                    {user.rank}
                  </Badge>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarUrls[user.address]}
                  alt={user.username || user.address}
                />
                <AvatarFallback>
                  {user.username
                    ? user.username.slice(0, 2).toUpperCase()
                    : user.address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {user.username ||
                    `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.badges.length} badges • {user.socialAccounts.length}{" "}
                  socials
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold">{user.totalScore}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
