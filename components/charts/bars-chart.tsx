"use client";

import { cn } from "@/lib/utils";

export type ChartBar = {
  /** x-axis label (kept short). */
  label: string;
  /** stacked segments, bottom → top. */
  segments: { key: string; value: number; color: string }[];
  /** optional emphasised column (e.g. "today"). */
  highlight?: boolean;
};

/**
 * Lightweight stacked bar chart built from CSS — responsive, no SVG.
 * Each bar's height is scaled to the largest bar total.
 */
export function BarsChart({
  bars,
  height = 150,
  className,
  formatTotal,
}: {
  bars: ChartBar[];
  height?: number;
  className?: string;
  /** tooltip content shown above a bar on hover. */
  formatTotal?: (total: number, bar: ChartBar) => string;
}) {
  const totals = bars.map((b) =>
    b.segments.reduce((s, x) => s + x.value, 0)
  );
  const max = Math.max(...totals, 1);

  return (
    <div className={cn("flex w-full items-end gap-1", className)}>
      {bars.map((b, i) => {
        const total = totals[i];
        return (
          <div
            key={b.label + i}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <div
              className="relative flex w-full flex-col justify-end"
              style={{ height }}
            >
              {formatTotal && (
                <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {formatTotal(total, b)}
                </div>
              )}
              <div
                className={cn(
                  "flex w-full flex-col-reverse overflow-hidden rounded-md bg-muted/60 transition-all",
                  b.highlight && "ring-2 ring-primary/40"
                )}
                style={{
                  height: total > 0 ? `${(total / max) * 100}%` : 3,
                }}
              >
                {total > 0 &&
                  b.segments.map((s) => (
                    <div
                      key={s.key}
                      style={{
                        height: `${(s.value / total) * 100}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  ))}
              </div>
            </div>
            <span
              className={cn(
                "w-full truncate text-center text-[10px] tabular-nums",
                b.highlight
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
