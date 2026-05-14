"use client";

import { forwardRef, memo } from "react";
import { cn } from "@/lib/utils";
import type { Registration } from "@/lib/store";
import { formatTimeShort } from "@/lib/format";
import { t } from "@/lib/i18n";

type SpotProps = {
  number: number;
  registration?: Registration;
  /** Shared clock from SpotGrid (0 until the client clock is known). */
  now: number;
  /** Hours after which an occupied spot counts as overdue. */
  overdueHours: number;
  highlighted?: boolean;
  onClick?: (
    number: number,
    registration?: Registration,
    anchor?: HTMLElement
  ) => void;
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

const SpotInner = forwardRef<HTMLButtonElement, SpotProps>(function Spot(
  { number, registration, now, overdueHours, highlighted, onClick },
  ref
) {
  const occupied = !!registration;
  const elapsedMs = registration && now > 0 ? now - registration.enteredAt : 0;
  const overdue = occupied && elapsedMs >= overdueHours * 3_600_000;
  const duration = registration ? compactDuration(elapsedMs) : null;
  const title = registration
    ? `${t.spot} ${number} — ${registration.plate} · ${registration.owner} · ${formatTimeShort(registration.enteredAt)} · ${duration}${
        overdue ? ` · ${t.overdue}` : ""
      }`
    : `${t.spot} ${number} — ${t.free}`;

  return (
    <button
      ref={ref}
      type="button"
      title={title}
      aria-label={title}
      data-spot={number}
      onClick={(e) => onClick?.(number, registration, e.currentTarget)}
      className={cn(
        "group/spot relative flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-xs font-mono tabular-nums transition-all sm:h-14",
        "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        overdue
          ? "border-danger/30 bg-danger/10 text-danger shadow-sm hover:border-danger/45 hover:bg-danger/20"
          : occupied
            ? "border-warning/35 bg-warning/12 text-warning shadow-sm hover:border-warning/50 hover:bg-warning/20"
            : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-foreground hover:shadow-sm",
        highlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {occupied && (
        <span
          className={cn(
            "absolute right-1.5 top-1.5 size-1.5 rounded-full",
            overdue ? "animate-pulse bg-danger" : "bg-warning"
          )}
        />
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
        <span
          className={cn(
            "text-[10px] font-medium leading-none",
            overdue ? "text-danger/80" : "text-warning/80"
          )}
        >
          {duration}
        </span>
      )}
    </button>
  );
});

export const Spot = memo(SpotInner);
