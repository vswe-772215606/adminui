"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/use-now";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  computeFinance,
  inPeriod,
  totalsOf,
  groupBy,
  type Period,
  type RegistrationFinance,
} from "@/lib/finance";
import { hourlyRateUzs } from "@/lib/pricing";
import {
  getAllKassas,
  market,
  type GroupId,
} from "@/data/market";
import { toneClasses } from "@/lib/tones";
import { formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const periods: { id: Period; label: string }[] = [
  { id: "today", label: t.today },
  { id: "week", label: t.thisWeek },
  { id: "month", label: t.thisMonth },
  { id: "all", label: t.allTime },
];

export function ReportsView() {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);

  const now = useNow(60_000);

  const [period, setPeriod] = useState<Period>("today");

  const fins = useMemo<RegistrationFinance[]>(() => {
    if (!hasHydrated) return [];
    return registrations
      .map((r) => computeFinance(r, now))
      .filter((f): f is RegistrationFinance => f !== null);
  }, [registrations, hasHydrated, now]);

  const periodFins = useMemo(
    () => fins.filter((f) => inPeriod(f, period, now)),
    [fins, period, now]
  );

  const totals = useMemo(() => totalsOf(periodFins), [periodFins]);

  const byKassa = useMemo(() => groupBy(periodFins, (f) => f.kassaId), [periodFins]);
  const byGroup = useMemo(() => groupBy(periodFins, (f) => f.groupId), [periodFins]);

  const kassas = getAllKassas();
  const allGroups = market.sectors.flatMap((s) =>
    s.kassas.flatMap((k) => k.groups)
  );

  return (
    <div className="px-8 py-6 max-w-[1400px]">
      <header className="flex items-end justify-between gap-6 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {t.reports}
          </div>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.financeReport}
          </h1>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={cn(
                "rounded-[5px] px-3 py-1 text-xs font-medium transition-colors",
                period === p.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat
          label={t.totalRevenue}
          value={formatUzs(totals.totalRevenue)}
          unit={t.uzs}
          accent="primary"
        />
        <BigStat
          label={t.paidRevenue}
          value={formatUzs(totals.paidRevenue)}
          unit={t.uzs}
          hint={`${totals.paidCount} ${t.carsUnit}`}
          accent="paid"
        />
        <BigStat
          label={t.pendingRevenue}
          value={formatUzs(totals.pendingRevenue)}
          unit={t.uzs}
          hint={`${totals.activeCount} ${t.carsUnit}`}
          accent="pending"
        />
        <BigStat
          label={t.averageBill}
          value={formatUzs(totals.averageBill)}
          unit={t.uzs}
          hint={`${totals.carCount} ${t.carsUnit}, ${totals.totalHours} ${t.hour}`}
        />
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium tracking-tight text-zinc-700 dark:text-zinc-300 uppercase">
              {t.byKassa}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kassas.map((k) => {
              const kFins = byKassa[k.id] ?? [];
              const kTotals = totalsOf(kFins);
              const max = totals.totalRevenue || 1;
              const pct = (kTotals.totalRevenue / max) * 100;
              return (
                <div key={k.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {k.name}
                    </span>
                    <span className="text-zinc-500 tabular-nums text-xs">
                      {kTotals.carCount} {t.carsUnit}
                    </span>
                    <span className="ml-auto font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatUzs(kTotals.totalRevenue)} {t.uzs}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-zinc-700 dark:bg-zinc-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totals.carCount === 0 && <EmptyHint />}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium tracking-tight text-zinc-700 dark:text-zinc-300 uppercase">
              {t.byGroup}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allGroups.map((g) => {
              const gFins = byGroup[g.id as GroupId] ?? [];
              const gTotals = totalsOf(gFins);
              const max = totals.totalRevenue || 1;
              const pct = (gTotals.totalRevenue / max) * 100;
              const c = toneClasses[g.tone];
              return (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-baseline gap-3 text-sm">
                    <span className={cn("h-2 w-2 rounded-full self-center shrink-0", c.dot)} />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {g.name}
                    </span>
                    <span className="text-zinc-500 tabular-nums text-xs">
                      {gTotals.carCount} {t.carsUnit}
                    </span>
                    <span className="text-zinc-400 tabular-nums text-xs">
                      {formatUzs(hourlyRateUzs[g.id])}/{t.hour}
                    </span>
                    <span className="ml-auto font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatUzs(gTotals.totalRevenue)} {t.uzs}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={cn("h-full", c.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totals.carCount === 0 && <EmptyHint />}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium tracking-tight text-zinc-700 dark:text-zinc-300 uppercase mb-3">
          {periods.find((p) => p.id === period)?.label} — {t.spots}
        </h2>
        {periodFins.length === 0 ? (
          <EmptyHint />
        ) : (
          <RegistrationsTable fins={periodFins} />
        )}
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  unit,
  hint,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: "primary" | "paid" | "pending";
}) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardContent className="p-5">
        <div className="text-[11px] uppercase tracking-wider text-zinc-500">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-heading text-2xl font-semibold tabular-nums tracking-tight",
              accent === "paid"
                ? "text-emerald-700 dark:text-emerald-400"
                : accent === "pending"
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-zinc-900 dark:text-zinc-50"
            )}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs text-zinc-500 tracking-tight">{unit}</span>
          )}
        </div>
        {hint && (
          <div className="mt-1 text-xs text-zinc-500 tabular-nums">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
      —
    </div>
  );
}

function RegistrationsTable({ fins }: { fins: RegistrationFinance[] }) {
  const sorted = [...fins].sort(
    (a, b) => b.registration.enteredAt - a.registration.enteredAt
  );
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900/40">
          <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-2 font-medium">{t.plate}</th>
            <th className="px-3 py-2 font-medium">
              {t.kassa} / {t.spot}
            </th>
            <th className="px-3 py-2 font-medium">{t.group}</th>
            <th className="px-3 py-2 font-medium text-right">{t.hour}</th>
            <th className="px-3 py-2 font-medium text-right">{t.payment}</th>
            <th className="px-3 py-2 font-medium text-right">{t.active}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sorted.map((f) => {
            const r = f.registration;
            const kassaName = (r.spotKassaId === "kassa-1" ? "1-КАССА" : "2-КАССА");
            return (
              <tr key={r.id}>
                <td className="px-3 py-2">
                  <span className="font-mono uppercase tabular-nums tracking-wide text-zinc-900 dark:text-zinc-50">
                    {r.plate}
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {kassaName} · {r.spotNumber}
                </td>
                <td className="px-3 py-2">
                  <GroupChip groupId={f.groupId} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                  {f.hours}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-zinc-900 dark:text-zinc-50">
                  {formatUzs(f.bill)} {t.uzs}
                </td>
                <td className="px-3 py-2 text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal text-[11px]",
                      f.paid
                        ? "border-emerald-200 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-300"
                        : "border-amber-200 text-amber-700 dark:border-amber-900/50 dark:text-amber-300"
                    )}
                  >
                    {f.paid ? t.payment : t.active}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GroupChip({ groupId }: { groupId: GroupId }) {
  const group = market.sectors
    .flatMap((s) => s.kassas)
    .flatMap((k) => k.groups)
    .find((g) => g.id === groupId);
  if (!group) return null;
  const c = toneClasses[group.tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      <span className="text-zinc-700 dark:text-zinc-300">{group.name}</span>
    </span>
  );
}
