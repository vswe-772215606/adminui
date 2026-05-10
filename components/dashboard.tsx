"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNow } from "@/lib/use-now";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllKassas, getGroupForSpot } from "@/data/market";
import { useStore, getActive } from "@/lib/store";
import { formatTimeShort, formatUzs } from "@/lib/format";
import { calculateBill, hourlyRateUzs } from "@/lib/pricing";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/lib/tones";

export function Dashboard() {
  const kassas = getAllKassas();
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);

  const now = useNow(60_000);

  const active = useMemo(
    () => (hasHydrated ? getActive(registrations) : []),
    [registrations, hasHydrated]
  );

  const totals = useMemo(() => {
    const total = kassas.reduce((s, k) => s + k.totalSpots, 0);
    const occupied = active.length;
    return { total, occupied, free: total - occupied };
  }, [kassas, active]);

  const recent = useMemo(
    () =>
      [...active].sort((a, b) => b.enteredAt - a.enteredAt).slice(0, 10),
    [active]
  );

  return (
    <div className="px-8 py-6 max-w-[1400px]">
      <header className="flex items-end justify-between gap-6 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {t.dashboard}
          </div>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.marketName}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Stat label={t.total} value={totals.total} />
          <Stat label={t.free} value={totals.free} tone="free" />
          <Stat label={t.occupied} value={totals.occupied} tone="occupied" />
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {kassas.map((k) => {
          const occupied = active.filter((r) => r.spotKassaId === k.id).length;
          const free = k.totalSpots - occupied;
          const pct = (occupied / k.totalSpots) * 100;
          return (
            <Link key={k.id} href={`/kassa/${k.id}`} className="group">
              <Card className="border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                      {t.kassa}
                    </div>
                    <CardTitle className="mt-1 font-heading text-xl font-semibold tracking-tight">
                      {k.name}
                    </CardTitle>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors"
                    strokeWidth={1.5}
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-6">
                    <Stat label={t.total} value={k.totalSpots} compact />
                    <Stat label={t.free} value={free} tone="free" compact />
                    <Stat label={t.occupied} value={occupied} tone="occupied" compact />
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-amber-400 dark:bg-amber-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {k.groups.map((g) => {
                      const c = toneClasses[g.tone];
                      return (
                        <Badge
                          key={g.id}
                          variant="outline"
                          className="gap-1.5 border-zinc-200 dark:border-zinc-800 font-normal text-zinc-600 dark:text-zinc-400 text-[11px]"
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
                          {g.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium tracking-tight text-zinc-700 dark:text-zinc-300 mb-3">
          {t.recentRegistrations}
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
            {t.noActiveCars}
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {recent.map((r) => {
              const kassa = kassas.find((k) => k.id === r.spotKassaId)!;
              const group = getGroupForSpot(kassa, r.spotNumber)!;
              const bill = calculateBill(group.id, r.enteredAt, now);
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-4 px-4 py-2.5 text-sm"
                >
                  <span className="w-12 text-[11px] tabular-nums text-zinc-500">
                    {formatTimeShort(r.enteredAt)}
                  </span>
                  <span className="font-mono uppercase tabular-nums tracking-wide text-zinc-900 dark:text-zinc-50">
                    {r.plate}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 truncate">
                    {r.owner}
                  </span>
                  <span className="ml-auto flex items-center gap-2 text-[11px] text-zinc-500">
                    <Badge
                      variant="outline"
                      className="border-zinc-200 dark:border-zinc-800 font-normal tabular-nums"
                    >
                      {kassa.name} · {r.spotNumber}
                    </Badge>
                    <span className="hidden sm:inline tabular-nums">
                      {formatUzs(bill)} {t.uzs}
                    </span>
                    <span className="hidden md:inline text-zinc-400 tabular-nums">
                      ({formatUzs(hourlyRateUzs[group.id])}/{t.hour})
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  compact,
}: {
  label: string;
  value: number;
  tone?: "free" | "occupied";
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "text-right"}>
      <div
        className={cn(
          "uppercase tracking-wider text-zinc-500",
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "tabular-nums font-semibold tracking-tight",
          compact ? "text-base" : "text-xl",
          tone === "free"
            ? "text-emerald-700 dark:text-emerald-400"
            : tone === "occupied"
              ? "text-amber-700 dark:text-amber-400"
              : "text-blue-900 dark:text-blue-300"
        )}
      >
        {value}
      </div>
    </div>
  );
}
