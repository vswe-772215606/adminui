import type { GroupId } from "@/data/market";

export type Rates = Record<GroupId, number>;

/** Default hourly rates (UZS). Editable at runtime via the settings store. */
export const hourlyRateUzs: Rates = {
  biznes: 10000,
  lacetti: 7000,
  cobalt: 7000,
  nexia3: 5000,
  spark: 5000,
  matiz: 5000,
};

export function chargedHours(enteredAt: number, exitedAt: number): number {
  const elapsedMs = Math.max(0, exitedAt - enteredAt);
  return Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60)));
}

export function calculateBill(
  groupId: GroupId,
  enteredAt: number,
  exitedAt: number,
  rates: Rates = hourlyRateUzs
): number {
  return chargedHours(enteredAt, exitedAt) * rates[groupId];
}
