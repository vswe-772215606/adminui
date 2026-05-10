"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Registration } from "@/lib/store";
import { formatTimeShort } from "@/lib/format";
import { t } from "@/lib/i18n";

type SpotProps = {
  number: number;
  registration?: Registration;
  highlighted?: boolean;
  onClick?: (number: number, registration?: Registration) => void;
};

export const Spot = forwardRef<HTMLButtonElement, SpotProps>(function Spot(
  { number, registration, highlighted, onClick },
  ref
) {
  const occupied = !!registration;
  const title = occupied
    ? `${t.spot} ${number} — ${registration!.plate} · ${registration!.owner} · ${formatTimeShort(registration!.enteredAt)}`
    : `${t.spot} ${number} — ${t.free}`;

  return (
    <button
      ref={ref}
      type="button"
      title={title}
      onClick={() => onClick?.(number, registration)}
      data-spot={number}
      className={cn(
        "h-7 w-9 rounded-[5px] border text-[11px] font-medium font-mono tabular-nums transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:z-10",
        occupied
          ? "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200 shadow-[inset_0_-2px_0_rgba(180,83,9,0.15)] dark:border-amber-600/60 dark:bg-amber-900/40 dark:text-amber-100"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200",
        highlighted && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-900"
      )}
    >
      {number}
    </button>
  );
});
