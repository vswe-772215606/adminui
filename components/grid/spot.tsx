"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Registration } from "@/lib/store";
import { formatTimeShort } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { t } from "@/lib/i18n";

type SpotProps = {
  number: number;
  registration?: Registration;
  highlighted?: boolean;
  onClick?: (number: number, registration?: Registration) => void;
};

function compactDuration(ms: number): string {
  if (ms <= 0) return "0м";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}м`;
  if (h < 10) return `${h}с ${m}м`;
  return `${h}с`;
}

export const Spot = forwardRef<HTMLButtonElement, SpotProps>(function Spot(
  { number, registration, highlighted, onClick },
  ref
) {
  const occupied = !!registration;
  const now = useNow(60_000);
  const elapsedMs = registration && now > 0 ? now - registration.enteredAt : 0;
  const duration = registration ? compactDuration(elapsedMs) : null;
  const title = registration
    ? `${t.spot} ${number} — ${registration.plate} · ${registration.owner} · ${formatTimeShort(registration.enteredAt)} · ${duration}`
    : `${t.spot} ${number} — ${t.free}`;

  return (
    <button
      ref={ref}
      type="button"
      title={title}
      onClick={() => onClick?.(number, registration)}
      data-spot={number}
      aria-label={title}
      className={cn(
        "group/spot relative flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-xs font-mono tabular-nums transition-all sm:h-14",
        "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        occupied
          ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm hover:border-amber-400 hover:bg-amber-200 dark:border-amber-800/60 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
          : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-foreground hover:shadow-sm",
        highlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {occupied && (
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
      )}
      <span
        className={cn(
          "font-semibold leading-none",
          occupied ? "text-sm" : "text-[13px]"
        )}
      >
        {number}
      </span>
      {occupied && duration && (
        <span className="text-[10px] font-medium leading-none text-amber-700/90 dark:text-amber-200/80">
          {duration}
        </span>
      )}
    </button>
  );
});
