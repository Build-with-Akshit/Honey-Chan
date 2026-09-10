"use client";

import { useState, useEffect, useCallback } from "react";

interface BlockchainStatus {
  reachable: boolean;
  mode: "on-chain" | "db-only";
  contractAddress: string;
  network: string;
  chainId: number;
  loading: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export function useBlockchainStatus(pollInterval = 30_000) {
  const [status, setStatus] = useState<BlockchainStatus>({
    reachable: false,
    mode: "db-only",
    contractAddress: "",
    network: "",
    chainId: 0,
    loading: true,
    lastChecked: null,
    error: null,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/blockchain/status");
      const data = await res.json();
      setStatus({
        reachable: data.reachable,
        mode: data.mode,
        contractAddress: data.contractAddress,
        network: data.network,
        chainId: data.chainId,
        loading: false,
        lastChecked: new Date(),
        error: data.error || null,
      });
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        reachable: false,
        mode: "db-only",
        loading: false,
        lastChecked: new Date(),
        error: "Failed to check blockchain status",
      }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval]);

  return { ...status, refresh: fetchStatus };
}
