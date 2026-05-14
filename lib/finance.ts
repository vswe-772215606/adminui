import { startOfDay, startOfWeek, startOfMonth, subDays, format } from "date-fns";
import {
  getKassa,
  getGroupForSpot,
  type GroupId,
  type KassaId,
} from "@/data/market";
import { calculateBill, chargedHours, hourlyRateUzs, type Rates } from "@/lib/pricing";
import type { Registration } from "@/lib/store";

export type Period = "today" | "week" | "month" | "all";

export function periodStart(period: Period, now: number): number {
  const d = new Date(now);
  switch (period) {
    case "today":
      return startOfDay(d).getTime();
    case "week":
      return startOfWeek(d, { weekStartsOn: 1 }).getTime();
    case "month":
      return startOfMonth(d).getTime();
    case "all":
      return 0;
  }
}

export type RegistrationFinance = {
  registration: Registration;
  groupId: GroupId;
  kassaId: KassaId;
  hours: number;
  bill: number;
  paid: boolean;
  refTime: number;
};

export function computeFinance(
  registration: Registration,
  now: number,
  rates: Rates = hourlyRateUzs
): RegistrationFinance | null {
  const kassa = getKassa(registration.spotKassaId);
  if (!kassa) return null;
  const group = getGroupForSpot(kassa, registration.spotNumber);
  if (!group) return null;
  const refTime = registration.exitedAt ?? now;
  return {
    registration,
    groupId: group.id,
    kassaId: kassa.id,
    hours: chargedHours(registration.enteredAt, refTime),
    bill: calculateBill(group.id, registration.enteredAt, refTime, rates),
    paid: registration.paid,
    refTime,
  };
}

export function inPeriod(
  fin: RegistrationFinance,
  period: Period,
  now: number
): boolean {
  if (period === "all") return true;
  const start = periodStart(period, now);
  // A registration belongs to a period if it ENTERED within that period.
  return fin.registration.enteredAt >= start;
}

export type Totals = {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  carCount: number;
  paidCount: number;
  activeCount: number;
  totalHours: number;
  averageBill: number;
};

export function totalsOf(fins: RegistrationFinance[]): Totals {
  let totalRevenue = 0;
  let paidRevenue = 0;
  let pendingRevenue = 0;
  let paidCount = 0;
  let activeCount = 0;
  let totalHours = 0;
  for (const f of fins) {
    totalRevenue += f.bill;
    totalHours += f.hours;
    if (f.paid) {
      paidRevenue += f.bill;
      paidCount++;
    } else {
      pendingRevenue += f.bill;
      activeCount++;
    }
  }
  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    carCount: fins.length,
    paidCount,
    activeCount,
    totalHours,
    averageBill: fins.length > 0 ? Math.round(totalRevenue / fins.length) : 0,
  };
}

/* ---- Time-bucketed series for trend / peak-hour charts ---- */

export type DayBucket = {
  start: number;
  label: string;
  paid: number;
  pending: number;
  total: number;
  count: number;
};

/**
 * Revenue split into the last `days` calendar days (oldest → newest),
 * bucketed by entry day — consistent with `inPeriod`.
 */
export function dailyBuckets(
  fins: RegistrationFinance[],
  days: number,
  now: number
): DayBucket[] {
  const today = startOfDay(now).getTime();
  const buckets: DayBucket[] = [];
  const indexByStart = new Map<number, number>();
  for (let i = days - 1; i >= 0; i--) {
    const start = subDays(today, i).getTime();
    indexByStart.set(start, buckets.length);
    buckets.push({
      start,
      label: format(start, "dd.MM"),
      paid: 0,
      pending: 0,
      total: 0,
      count: 0,
    });
  }
  for (const f of fins) {
    const dayStart = startOfDay(f.registration.enteredAt).getTime();
    const idx = indexByStart.get(dayStart);
    if (idx === undefined) continue;
    const b = buckets[idx];
    b.total += f.bill;
    b.count += 1;
    if (f.paid) b.paid += f.bill;
    else b.pending += f.bill;
  }
  return buckets;
}

export type HourBucket = { hour: number; count: number; revenue: number };

/** Entries grouped by hour-of-day (0–23) — drives the peak-hours chart. */
export function hourlyBuckets(fins: RegistrationFinance[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
    revenue: 0,
  }));
  for (const f of fins) {
    const h = new Date(f.registration.enteredAt).getHours();
    buckets[h].count += 1;
    buckets[h].revenue += f.bill;
  }
  return buckets;
}

export function groupBy<K extends string>(
  fins: RegistrationFinance[],
  key: (f: RegistrationFinance) => K
): Record<K, RegistrationFinance[]> {
  const acc = {} as Record<K, RegistrationFinance[]>;
  for (const f of fins) {
    const k = key(f);
    if (!acc[k]) acc[k] = [];
    acc[k].push(f);
  }
  return acc;
}
