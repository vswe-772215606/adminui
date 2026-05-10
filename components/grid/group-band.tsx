import { cn } from "@/lib/utils";

type GroupLabelProps = {
  name: string;
  spotRange: [number, number];
  className?: string;
};

export function GroupLabel({ name, spotRange, className }: GroupLabelProps) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-3 px-1 pb-1.5 pt-1 border-b border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
        {name}
      </span>
      <span className="text-[11px] tabular-nums text-zinc-500">
        {spotRange[0]}–{spotRange[1]}
      </span>
    </div>
  );
}
