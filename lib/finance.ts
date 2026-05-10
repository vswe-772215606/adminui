import { startOfDay, startOfWeek, startOfMonth } from "date-fns";
import {
  getKassa,
  getGroupForSpot,
  type GroupId,
  type KassaId,
} from "@/data/market";
import { calculateBill, chargedHours } from "@/lib/pricing";
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
  now: number
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
    bill: calculateBill(group.id, registration.enteredAt, refTime),
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
