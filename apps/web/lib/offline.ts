"use client";

import { useEffect, useState } from "react";

/**
 * Offline-first helpers.
 *
 * - Harvest outbox: when a beekeeper submits a batch with no network, the
 *   payload lands in localStorage with a UUID idempotency key and flushes
 *   automatically when connectivity returns (or on next app open).
 * - useOnline(): tiny hook for UI banners.
 *
 * localStorage (not IndexedDB) is deliberate: payloads are small JSON,
 * synchronous reads keep the submit path simple, and the storage survives
 * across sessions on every browser we target.
 */

const OUTBOX_KEY = "hc-harvest-outbox-v1";
const VERIFY_CACHE_KEY = "hc-verify-cache-v1";

export type OutboxItem = {
  id: string; // UUID — server dedupes on this
  payload: unknown;
  queuedAt: number;
};

function readOutbox(): OutboxItem[] {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

export function queueHarvest(payload: unknown): OutboxItem {
  const item: OutboxItem = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `hc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    payload,
    queuedAt: Date.now(),
  };
  const box = readOutbox();
  box.push(item);
  writeOutbox(box);
  return item;
}

export function outboxCount(): number {
  return readOutbox().length;
}

/**
 * Flush the outbox. `post` receives each queued payload and must include the
 * outbox item id (server dedupes on it). Returns number successfully sent.
 */
export async function flushOutbox(
  post: (payload: unknown, idempotencyKey: string) => Promise<unknown>
): Promise<number> {
  const box = readOutbox();
  if (box.length === 0) return 0;
  const remaining: OutboxItem[] = [];
  let sent = 0;
  for (const item of box) {
    try {
      await post(item.payload, item.id);
      sent++;
    } catch {
      remaining.push(item); // keep for next attempt (network still down / server error)
    }
  }
  writeOutbox(remaining);
  return sent;
}

/** Verify-verdict cache: batchId → last successful verify API response. */
export function cacheVerdict(batchId: string, data: unknown) {
  try {
    const cache = JSON.parse(localStorage.getItem(VERIFY_CACHE_KEY) || "{}");
    cache[batchId] = { data, at: Date.now() };
    // Cap at 50 entries (FIFO) to bound storage.
    const keys = Object.keys(cache);
    if (keys.length > 50) {
      keys
        .sort((a, b) => cache[a].at - cache[b].at)
        .slice(0, keys.length - 50)
        .forEach((k) => delete cache[k]);
    }
    localStorage.setItem(VERIFY_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getCachedVerdict(batchId: string): { data: any; at: number } | null {
  try {
    const cache = JSON.parse(localStorage.getItem(VERIFY_CACHE_KEY) || "{}");
    return cache[batchId] || null;
  } catch {
    return null;
  }
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}
