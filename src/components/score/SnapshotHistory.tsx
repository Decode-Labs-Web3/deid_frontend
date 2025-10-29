/**
 * @title Snapshot History Component
 * @description Display historical score snapshots
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoricalSnapshot } from "@/types/score.types";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface SnapshotHistoryProps {
  limit?: number;
  onSnapshotClick?: (snapshotId: number) => void;
}

export function SnapshotHistory({
  limit = 5,
  onSnapshotClick,
}: SnapshotHistoryProps) {
  const [snapshots, setSnapshots] = useState<HistoricalSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchSnapshots = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/score/history?limit=${limit}&offset=${offset}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch history");
      }

      setSnapshots(data.snapshots);
      setTotal(data.total);
    } catch (err: any) {
      console.error("❌ Error fetching snapshot history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [offset, limit]);

  const handlePrevious = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snapshot History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg border"
            >
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || snapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snapshot History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || "No snapshots available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Snapshot History
          </CardTitle>
          <Badge variant="secondary">{total} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSnapshotClick?.(snapshot.id)}
          >
            {/* Snapshot Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>

            {/* Snapshot Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium">Snapshot #{snapshot.id}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(snapshot.timestamp)}
              </div>
            </div>

            {/* Time Ago */}
            <Badge variant="outline" className="text-xs">
              {getTimeAgo(snapshot.timestamp)}
            </Badge>
          </div>
        ))}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {offset + 1} - {Math.min(offset + limit, total)} of {total}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={offset + limit >= total}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
