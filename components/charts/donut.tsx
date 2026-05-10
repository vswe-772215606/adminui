"use client";

import { cn } from "@/lib/utils";

export type DonutSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type DonutProps = {
  segments: DonutSegment[];
  total?: number;
  centerTop?: string;
  centerBottom?: string;
  size?: number;
  className?: string;
};

const SIZE = 160;
const STROKE = 22;
const RADIUS = SIZE / 2 - STROKE / 2;
const C = 2 * Math.PI * RADIUS;

export function Donut({
  segments,
  total,
  centerTop,
  centerBottom,
  size = SIZE,
  className,
}: DonutProps) {
  const sum = segments.reduce((a, b) => a + b.value, 0);
  const denom = total ?? sum;
  let offset = 0;
  const visible = segments.filter((s) => s.value > 0);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}
         style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`-${SIZE / 2} -${SIZE / 2} ${SIZE} ${SIZE}`}
        className="-rotate-90"
      >
        <circle
          r={RADIUS}
          fill="none"
          className="stroke-zinc-100 dark:stroke-zinc-800"
          strokeWidth={STROKE}
        />
        {denom > 0 &&
          visible.map((s) => {
            const len = (s.value / denom) * C;
            const dasharray = `${len} ${C - len}`;
            const dashoffset = -offset;
            offset += len;
            return (
              <circle
                key={s.key}
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {centerTop && (
          <span className="font-heading text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {centerTop}
          </span>
        )}
        {centerBottom && (
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            {centerBottom}
          </span>
        )}
      </div>
    </div>
  );
}
