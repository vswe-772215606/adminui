"use client";

import { useNow } from "@/lib/use-now";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Real-time elapsed-time counter. Ticks every second from `from` until
 * `to` (defaults to live "now"). SSR-safe: renders a placeholder until
 * the client clock is known.
 */
export function LiveDuration({
  from,
  to,
  className,
}: {
  from: number;
  to?: number;
  className?: string;
}) {
  const now = useNow(1000);
  const end = to ?? now;
  const ready = to !== undefined || now > 0;
  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {ready ? formatClock(end - from) : "—"}
    </span>
  );
}
