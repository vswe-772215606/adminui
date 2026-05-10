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
  if (h < 10) return `${h}ч ${m}м`;
  return `${h}ч`;
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
      className={cn(
        "group/spot relative flex h-9 min-w-0 items-center justify-center rounded-[6px] border text-[11px] font-medium font-mono tabular-nums transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:z-10",
        occupied
          ? "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-600/60 dark:bg-amber-900/40 dark:text-amber-100"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-200",
        highlighted && "ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-zinc-900"
      )}
    >
      <span className={cn("transition-opacity", occupied && "group-hover/spot:opacity-0")}>
        {number}
      </span>
      {occupied && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold opacity-0 transition-opacity group-hover/spot:opacity-100">
          {duration}
        </span>
      )}
      {occupied && (
        <span className="pointer-events-none absolute right-1 top-0.5 h-1 w-1 rounded-full bg-amber-500 group-hover/spot:hidden" />
      )}
    </button>
  );
});
