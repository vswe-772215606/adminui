import { CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/lib/tones";
import type { GroupTone } from "@/data/market";

type GroupLabelProps = {
  name: string;
  spotRange: [number, number];
  tone: GroupTone;
  className?: string;
};

export function GroupLabel({
  name,
  spotRange,
  tone,
  className,
}: GroupLabelProps) {
  const c = toneClasses[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-b border-border px-1 pb-2 pt-1",
        className
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md",
          c.chip
        )}
      >
        <CarFront className={cn("size-3.5", c.label)} strokeWidth={1.75} />
      </span>
      <span
        className={cn(
          "font-heading text-[13px] font-semibold uppercase tracking-[0.08em]",
          c.label
        )}
      >
        {name}
      </span>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {spotRange[0]}–{spotRange[1]}
      </span>
    </div>
  );
}
