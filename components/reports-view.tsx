"use client";

import { useMemo, useState } from "react";
import { BarChart3, Inbox } from "lucide-react";
import { useNow } from "@/lib/use-now";
import {
  PageShell,
  PageHeader,
  SegmentedControl,
  SectionTitle,
  EmptyState,
} from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useRates } from "@/lib/settings-store";
import {
  computeFinance,
  inPeriod,
  totalsOf,
  groupBy,
  dailyBuckets,
  hourlyBuckets,
  type Period,
  type RegistrationFinance,
} from "@/lib/finance";
import { getAllKassas, market, type GroupId } from "@/data/market";
import { toneClasses, toneColor, stateColor } from "@/lib/tones";
import { formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Donut } from "@/components/charts/donut";
import { BarsChart } from "@/components/charts/bars-chart";

const periods: { value: Period; label: string }[] = [
  { value: "today", label: t.today },
  { value: "week", label: t.thisWeek },
  { value: "month", label: t.thisMonth },
  { value: "all", label: t.allTime },
];

const allGroups = market.sectors
  .flatMap((s) => s.kassas)
  .flatMap((k) => k.groups);

export function ReportsView() {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const rates = useRates();
  const now = useNow(60_000);

  const [period, setPeriod] = useState<Period>("today");

  const fins = useMemo<RegistrationFinance[]>(() => {
    if (!hasHydrated) return [];
    return registrations
      .map((r) => computeFinance(r, now, rates))
      .filter((f): f is RegistrationFinance => f !== null);
  }, [registrations, hasHydrated, now, rates]);

  const periodFins = useMemo(
    () => fins.filter((f) => inPeriod(f, period, now)),
    [fins, period, now]
  );

  const totals = useMemo(() => totalsOf(periodFins), [periodFins]);
  const byKassa = useMemo(
    () => groupBy(periodFins, (f) => f.kassaId),
    [periodFins]
  );
  const byGroup = useMemo(
    () => groupBy(periodFins, (f) => f.groupId),
    [periodFins]
  );

  const week = useMemo(() => dailyBuckets(fins, 7, now), [fins, now]);
  const hours = useMemo(() => hourlyBuckets(periodFins), [periodFins]);

  const kassas = getAllKassas();

  return (
    <PageShell>
      <PageHeader
        eyebrow={t.reports}
        title={t.financeReport}
        icon={<BarChart3 />}
        actions={
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            options={periods}
          />
        }
      />

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          hint={`${totals.carCount} ${t.carsUnit} · ${totals.totalHours} ${t.hour}`}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title={t.paymentStatus}>
          <Donut
            segments={[
              {
                key: "paid",
                label: t.paidRevenue,
                value: totals.paidRevenue,
                color: stateColor.success,
              },
              {
                key: "pending",
                label: t.pendingRevenue,
                value: totals.pendingRevenue,
                color: stateColor.warning,
              },
            ]}
            centerTop={formatUzs(totals.totalRevenue)}
            centerBottom={t.uzs}
          />
          <ul className="w-full space-y-1.5">
            <Legend
              label={t.paidRevenue}
              value={totals.paidRevenue}
              hint={`${totals.paidCount} ${t.carsUnit}`}
              color={stateColor.success}
            />
            <Legend
              label={t.pendingRevenue}
              value={totals.pendingRevenue}
              hint={`${totals.activeCount} ${t.carsUnit}`}
              color={stateColor.warning}
            />
          </ul>
        </ChartCard>

        <ChartCard title={t.byKassa}>
          <Donut
            segments={kassas.map((k, i) => {
              const kTotals = totalsOf(byKassa[k.id] ?? []);
              return {
                key: k.id,
                label: k.name,
                value: kTotals.totalRevenue,
                color: i === 0 ? toneColor.blue : toneColor.sky,
              };
            })}
            centerTop={`${totals.carCount}`}
            centerBottom={t.carsUnit}
          />
          <ul className="w-full space-y-1.5">
            {kassas.map((k, i) => {
              const kTotals = totalsOf(byKassa[k.id] ?? []);
              return (
                <Legend
                  key={k.id}
                  label={k.name}
                  value={kTotals.totalRevenue}
                  hint={`${kTotals.carCount} ${t.carsUnit}`}
                  color={i === 0 ? toneColor.blue : toneColor.sky}
                />
              );
            })}
          </ul>
        </ChartCard>

        <ChartCard title={t.byGroup}>
          <Donut
            segments={allGroups.map((g) => {
              const gTotals = totalsOf(byGroup[g.id as GroupId] ?? []);
              return {
                key: g.id,
                label: g.name,
                value: gTotals.totalRevenue,
                color: toneColor[g.tone],
              };
            })}
            centerTop={formatUzs(totals.totalRevenue)}
            centerBottom={t.uzs}
          />
          <ul className="w-full space-y-1">
            {allGroups.map((g) => {
              const gTotals = totalsOf(byGroup[g.id as GroupId] ?? []);
              return (
                <Legend
                  key={g.id}
                  label={g.name}
                  value={gTotals.totalRevenue}
                  hint={`${gTotals.carCount} ${t.carsUnit}`}
                  color={toneColor[g.tone]}
                />
              );
            })}
          </ul>
        </ChartCard>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm uppercase tracking-tight text-foreground/80">
              {t.revenueTrend}
              <span className="ml-1.5 font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">
                {t.last7Days}
              </span>
            </CardTitle>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <ChartLegend color={stateColor.success} label={t.paidRevenue} />
              <ChartLegend
                color={stateColor.warning}
                label={t.pendingRevenue}
              />
            </div>
          </CardHeader>
          <CardContent>
            <BarsChart
              height={160}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-tight text-foreground/80">
              {t.peakHours}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t.entriesByHour}</p>
          </CardHeader>
          <CardContent>
            <BarsChart
              height={160}
              bars={hours.map((h) => ({
                label: h.hour % 3 === 0 ? String(h.hour).padStart(2, "0") : "",
                segments: [
                  { key: "count", value: h.count, color: "var(--primary)" },
                ],
              }))}
              formatTotal={(total) => `${total} ${t.carsUnit}`}
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>
          {periods.find((p) => p.value === period)?.label} — {t.carsServed}
        </SectionTitle>
        {periodFins.length === 0 ? (
          <EmptyState icon={<Inbox />}>{t.noHistory}</EmptyState>
        ) : (
          <RegistrationsTable fins={periodFins} />
        )}
      </section>
    </PageShell>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-tight text-foreground/80">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {children}
      </CardContent>
    </Card>
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
    <Card>
      <CardContent className="p-5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-heading text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
              accent === "pending"
                ? "text-warning"
                : accent === "paid"
                  ? "text-success"
                  : accent === "primary"
                    ? "text-primary"
                    : "text-foreground"
            )}
          >
            {value}
          </span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {hint && (
          <div className="mt-1 text-xs tabular-nums text-muted-foreground">
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Legend({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: number;
  hint?: string;
  color: string;
}) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium text-foreground">{label}</span>
      {hint && <span className="truncate text-muted-foreground">{hint}</span>}
      <span className="ml-auto font-medium tabular-nums text-foreground">
        {formatUzs(value)}
      </span>
    </li>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
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

function RegistrationsTable({ fins }: { fins: RegistrationFinance[] }) {
  const sorted = [...fins].sort(
    (a, b) => b.registration.enteredAt - a.registration.enteredAt
  );
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5 font-medium">{t.plate}</th>
            <th className="px-3 py-2.5 font-medium">
              {t.kassa} / {t.spot}
            </th>
            <th className="px-3 py-2.5 font-medium">{t.group}</th>
            <th className="px-3 py-2.5 text-right font-medium">{t.hour}</th>
            <th className="px-3 py-2.5 text-right font-medium">{t.payment}</th>
            <th className="px-3 py-2.5 text-right font-medium">{t.status}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((f) => {
            const r = f.registration;
            const group = allGroups.find((g) => g.id === f.groupId);
            const kassaName = r.spotKassaId === "kassa-1" ? "1-КАССА" : "2-КАССА";
            return (
              <tr key={r.id}>
                <td className="px-3 py-2.5">
                  <span className="font-mono uppercase tabular-nums tracking-wide text-foreground">
                    {r.plate}
                  </span>
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {kassaName} · {r.spotNumber}
                </td>
                <td className="px-3 py-2.5">
                  {group && (
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          toneClasses[group.tone].dot
                        )}
                      />
                      {group.name}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                  {f.hours}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                  {formatUzs(f.bill)} {t.uzs}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal",
                      f.paid
                        ? "border-success/40 text-success"
                        : "border-warning/40 text-warning"
                    )}
                  >
                    {f.paid ? t.paid : t.active}
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
