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
        "flex items-center gap-3 px-1 pb-2 pt-1 border-b border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      <span className={cn("h-3 w-1.5 rounded-sm", c.bar)} />
      <span
        className={cn(
          "font-heading text-[13px] font-semibold uppercase tracking-[0.08em]",
          c.label
        )}
      >
        {name}
      </span>
      <span className="text-[11px] tabular-nums text-zinc-500">
        {spotRange[0]}–{spotRange[1]}
      </span>
    </div>
  );
}
