import type { GroupTone } from "@/data/market";

export const toneClasses: Record<
  GroupTone,
  {
    dot: string;
    label: string;
    bar: string;
    softBg: string;
    softBorder: string;
    text: string;
  }
> = {
  amber: {
    dot: "bg-amber-400",
    label: "text-amber-900 dark:text-amber-200",
    bar: "bg-amber-300 dark:bg-amber-500",
    softBg: "bg-amber-50/60 dark:bg-amber-950/20",
    softBorder: "border-amber-200/70 dark:border-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  blue: {
    dot: "bg-blue-400",
    label: "text-blue-900 dark:text-blue-200",
    bar: "bg-blue-300 dark:bg-blue-500",
    softBg: "bg-blue-50/60 dark:bg-blue-950/20",
    softBorder: "border-blue-200/70 dark:border-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  rose: {
    dot: "bg-rose-400",
    label: "text-rose-900 dark:text-rose-200",
    bar: "bg-rose-300 dark:bg-rose-500",
    softBg: "bg-rose-50/60 dark:bg-rose-950/20",
    softBorder: "border-rose-200/70 dark:border-rose-900/40",
    text: "text-rose-700 dark:text-rose-300",
  },
  sky: {
    dot: "bg-sky-400",
    label: "text-sky-900 dark:text-sky-200",
    bar: "bg-sky-300 dark:bg-sky-500",
    softBg: "bg-sky-50/60 dark:bg-sky-950/20",
    softBorder: "border-sky-200/70 dark:border-sky-900/40",
    text: "text-sky-700 dark:text-sky-300",
  },
  emerald: {
    dot: "bg-emerald-400",
    label: "text-emerald-900 dark:text-emerald-200",
    bar: "bg-emerald-300 dark:bg-emerald-500",
    softBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    softBorder: "border-emerald-200/70 dark:border-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  violet: {
    dot: "bg-violet-400",
    label: "text-violet-900 dark:text-violet-200",
    bar: "bg-violet-300 dark:bg-violet-500",
    softBg: "bg-violet-50/60 dark:bg-violet-950/20",
    softBorder: "border-violet-200/70 dark:border-violet-900/40",
    text: "text-violet-700 dark:text-violet-300",
  },
};
