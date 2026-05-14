"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  Inbox,
  Wallet,
} from "lucide-react";
import { useNow } from "@/lib/use-now";
import {
  PageShell,
  PageHeader,
  Stat,
  StatGroup,
  SectionTitle,
  EmptyState,
} from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarsChart } from "@/components/charts/bars-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { getAllKassas, getGroupForSpot } from "@/data/market";
import { useStore, getActive } from "@/lib/store";
import { useRates } from "@/lib/settings-store";
import {
  computeFinance,
  inPeriod,
  totalsOf,
  dailyBuckets,
  type RegistrationFinance,
} from "@/lib/finance";
import { formatTimeShort, formatUzs } from "@/lib/format";
import { calculateBill } from "@/lib/pricing";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toneClasses, stateColor } from "@/lib/tones";

export function Dashboard() {
  const kassas = getAllKassas();
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const rates = useRates();
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
    () => [...active].sort((a, b) => b.enteredAt - a.enteredAt).slice(0, 10),
    [active]
  );

  const finance = useMemo(() => {
    const fins = hasHydrated
      ? registrations
          .map((r) => computeFinance(r, now, rates))
          .filter((f): f is RegistrationFinance => f !== null)
      : [];
    return {
      today: totalsOf(fins.filter((f) => inPeriod(f, "today", now))),
      week: dailyBuckets(fins, 7, now),
    };
  }, [registrations, hasHydrated, now, rates]);

  const todayTotals = finance.today;
  const week = finance.week;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t.dashboard}
        title={t.marketName}
        icon={<LayoutGrid />}
        actions={
          <StatGroup>
            <Stat label={t.total} value={totals.total} size="md" />
            <Stat label={t.free} value={totals.free} tone="free" size="md" />
            <Stat
              label={t.occupied}
              value={totals.occupied}
              tone="occupied"
              size="md"
            />
          </StatGroup>
        }
      />

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {kassas.map((k) => {
          const occupied = active.filter((r) => r.spotKassaId === k.id).length;
          const free = k.totalSpots - occupied;
          const pct = k.totalSpots ? (occupied / k.totalSpots) * 100 : 0;
          return (
            <Link key={k.id} href={`/kassa/${k.id}`} className="group">
              <Card className="transition-colors hover:ring-foreground/20">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.kassa}
                    </div>
                    <CardTitle className="mt-0.5 text-lg">{k.name}</CardTitle>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-6">
                    <Stat
                      label={t.total}
                      value={k.totalSpots}
                      size="sm"
                      align="left"
                    />
                    <Stat
                      label={t.free}
                      value={free}
                      tone="free"
                      size="sm"
                      align="left"
                    />
                    <Stat
                      label={t.occupied}
                      value={occupied}
                      tone="occupied"
                      size="sm"
                      align="left"
                    />
                    <div className="ml-auto text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.occupancy}
                      </div>
                      <div className="text-base font-semibold tabular-nums text-foreground">
                        {Math.round(pct)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
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
                          className="gap-1.5 font-normal text-muted-foreground"
                        >
                          <span
                            className={cn("size-1.5 rounded-full", c.dot)}
                          />
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

      <section className="mt-8">
        <SectionTitle
          action={
            <Link
              href="/reports"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {t.viewDetails}
              <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <span className="flex items-center gap-2">
            <Wallet className="size-4 text-muted-foreground" />
            {t.financeReport} · {t.today}
          </span>
        </SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <FinanceStat
            label={t.totalRevenue}
            value={formatUzs(todayTotals.totalRevenue)}
            accent="primary"
            series={week.map((b) => b.total)}
          />
          <FinanceStat
            label={t.paidRevenue}
            value={formatUzs(todayTotals.paidRevenue)}
            hint={`${todayTotals.paidCount} ${t.carsUnit}`}
            accent="paid"
            series={week.map((b) => b.paid)}
          />
          <FinanceStat
            label={t.pendingRevenue}
            value={formatUzs(todayTotals.pendingRevenue)}
            hint={`${todayTotals.activeCount} ${t.carsUnit}`}
            accent="pending"
            series={week.map((b) => b.pending)}
          />
          <FinanceStat
            label={t.carsServed}
            value={String(todayTotals.carCount)}
            hint={`${todayTotals.totalHours} ${t.hour}`}
            series={week.map((b) => b.count)}
          />
        </div>

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm uppercase tracking-tight text-foreground/80">
              {t.revenueTrend}
              <span className="ml-1.5 font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">
                {t.last7Days}
              </span>
            </CardTitle>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <LegendDot color={stateColor.success} label={t.paidRevenue} />
              <LegendDot color={stateColor.warning} label={t.pendingRevenue} />
            </div>
          </CardHeader>
          <CardContent>
            <BarsChart
              height={150}
              bars={week.map((b, i) => ({
                label: b.label,
                highlight: i === week.length - 1,
                segments: [
                  { key: "paid", value: b.paid, color: stateColor.success },
                  {
                    key: "pending",
                    value: b.pending,
                    color: stateColor.warning,
                  },
                ],
              }))}
              formatTotal={(total) => `${formatUzs(total)} ${t.uzs}`}
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>{t.recentRegistrations}</SectionTitle>
        {recent.length === 0 ? (
          <EmptyState icon={<Inbox />}>{t.noActiveCars}</EmptyState>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
            {recent.map((r) => {
              const kassa = kassas.find((k) => k.id === r.spotKassaId)!;
              const group = getGroupForSpot(kassa, r.spotNumber)!;
              const bill = calculateBill(group.id, r.enteredAt, now, rates);
              return (
                <li key={r.id}>
                  <Link
                    href={`/cars/${r.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60 sm:gap-4"
                  >
                    <span className="w-10 shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatTimeShort(r.enteredAt)}
                    </span>
                    <span className="w-24 shrink-0 font-mono uppercase tabular-nums tracking-wide text-foreground">
                      {r.plate}
                    </span>
                    <span className="hidden truncate text-muted-foreground sm:block">
                      {r.owner}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-normal tabular-nums text-muted-foreground"
                      >
                        {kassa.name} · {r.spotNumber}
                      </Badge>
                      <span className="w-20 text-right text-xs tabular-nums text-foreground">
                        {formatUzs(bill)} {t.uzs}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PageShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function FinanceStat({
  label,
  value,
  hint,
  accent,
  series,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "primary" | "paid" | "pending";
  /** 7-day series for this metric, oldest → newest. */
  series?: number[];
}) {
  const accentText =
    accent === "primary"
      ? "text-primary"
      : accent === "paid"
        ? "text-success"
        : accent === "pending"
          ? "text-warning"
          : "text-muted-foreground";

  const curr = series?.at(-1) ?? 0;
  const prev = series?.at(-2) ?? 0;
  const diff = curr - prev;
  const pct = prev > 0 ? Math.round((diff / prev) * 100) : null;
  const showDelta = prev > 0 && diff !== 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          {series && series.length > 1 && (
            <Sparkline values={series} className={cn("shrink-0", accentText)} />
          )}
        </div>
        <div
          className={cn(
            "mt-1.5 font-heading text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
            accent ? accentText : "text-foreground"
          )}
        >
          {value}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {showDelta && (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium tabular-nums",
                diff >= 0 ? "text-success" : "text-danger"
              )}
            >
              {diff >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {pct !== null ? `${Math.abs(pct)}%` : ""}
            </span>
          )}
          {showDelta && (
            <span className="text-muted-foreground">{t.vsYesterday}</span>
          )}
          {hint && (
            <span className="ml-auto tabular-nums text-muted-foreground">
              {hint}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
