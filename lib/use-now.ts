"use client";

import { useCallback, useSyncExternalStore } from "react";

type Bucket = {
  value: number;
  subs: Set<() => void>;
  id: ReturnType<typeof setInterval> | null;
};
const buckets = new Map<number, Bucket>();

function getBucket(intervalMs: number): Bucket {
  let b = buckets.get(intervalMs);
  if (!b) {
    b = { value: 0, subs: new Set(), id: null };
    buckets.set(intervalMs, b);
  }
  return b;
}

export function useNow(intervalMs = 60_000): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const b = getBucket(intervalMs);
      b.subs.add(onChange);
      if (b.id === null) {
        b.value = Date.now();
        b.id = setInterval(() => {
          b.value = Date.now();
          b.subs.forEach((fn) => fn());
        }, intervalMs);
      }
      // Initial sync from 0 → current time
      if (b.value === 0) b.value = Date.now();
      onChange();
      return () => {
        b.subs.delete(onChange);
        if (b.subs.size === 0 && b.id !== null) {
          clearInterval(b.id);
          b.id = null;
          b.value = 0;
        }
      };
    },
    [intervalMs]
  );
  const getSnapshot = useCallback(
    () => getBucket(intervalMs).value,
    [intervalMs]
  );
  const getServerSnapshot = useCallback(() => 0, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
