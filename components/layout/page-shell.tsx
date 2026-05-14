"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Shared page template — every page composes these so layout,
 * spacing, headers and controls stay consistent and responsive.
 * ------------------------------------------------------------------ */

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  icon,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
  /** Right-aligned controls (filters, buttons). */
  actions?: ReactNode;
  /** Extra content rendered alongside actions. */
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="mt-0.5 truncate font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>
      </div>
      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-3">
          {children}
          {actions}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */

const statTone = {
  default: "text-foreground",
  primary: "text-primary",
  free: "text-success",
  occupied: "text-warning",
} as const;

export function Stat({
  label,
  value,
  tone = "default",
  size = "md",
  align = "right",
}: {
  label: string;
  value: ReactNode;
  tone?: keyof typeof statTone;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div
        className={cn(
          "uppercase tracking-wider text-muted-foreground",
          size === "lg" ? "text-[11px]" : "text-[10px]"
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "font-semibold tabular-nums tracking-tight",
          size === "sm" && "text-base",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl sm:text-3xl",
          statTone[tone]
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function StatGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">{children}</div>
  );
}

/* ------------------------------------------------------------------ */

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {icon && <div className="text-muted-foreground/60 [&_svg]:size-6">{icon}</div>}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-medium uppercase tracking-tight text-foreground/80">
        {children}
      </h2>
      {action}
    </div>
  );
}
