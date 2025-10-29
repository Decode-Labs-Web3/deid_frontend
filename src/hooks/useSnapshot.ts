/**
 * @title useSnapshot Hook
 * @description React hook for fetching snapshot data
 */

import { useState, useEffect, useCallback } from "react";
import { GlobalSnapshot, SnapshotMetadata } from "@/types/score.types";
import { getLatestSnapshot, getSnapshot } from "@/utils/score.contract";

interface UseSnapshotReturn {
  snapshot: GlobalSnapshot | null;
  metadata: SnapshotMetadata | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch snapshot data from IPFS
 * @param snapshotId - Optional snapshot ID (fetches latest if not provided)
 * @returns Snapshot data, loading state, and refresh function
 */
export function useSnapshot(snapshotId?: number): UseSnapshotReturn {
  const [snapshot, setSnapshot] = useState<GlobalSnapshot | null>(null);
  const [metadata, setMetadata] = useState<SnapshotMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(
        snapshotId
          ? `📊 Fetching snapshot ${snapshotId}`
          : "📊 Fetching latest snapshot"
      );

      // Get snapshot metadata from contract
      const meta = snapshotId
        ? await getSnapshot(snapshotId)
        : await getLatestSnapshot();

      setMetadata(meta);

      // Fetch full snapshot data from IPFS
      const response = await fetch(`/api/score/fetch?cid=${meta.cid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch snapshot from IPFS");
      }

      setSnapshot(data);
      console.log(
        `✅ Snapshot fetched: ${data.users.length} users, ID: ${data.id}`
      );
    } catch (err: any) {
      console.error("❌ Error fetching snapshot:", err);
      setError(err.message);
      setSnapshot(null);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  }, [snapshotId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  return {
    snapshot,
    metadata,
    loading,
    error,
    refresh: fetchSnapshot,
  };
}
