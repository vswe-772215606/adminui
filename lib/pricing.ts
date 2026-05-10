import type { GroupId } from "@/data/market";

export const hourlyRateUzs: Record<GroupId, number> = {
  biznes: 10000,
  lacetti: 7000,
  cobalt: 7000,
  nexia3: 5000,
  spark: 5000,
  matiz: 5000,
};

export function calculateBill(
  groupId: GroupId,
  enteredAt: number,
  exitedAt: number
): number {
  const elapsedMs = Math.max(0, exitedAt - enteredAt);
  const hours = Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60)));
  return hours * hourlyRateUzs[groupId];
}

export function chargedHours(enteredAt: number, exitedAt: number): number {
  const elapsedMs = Math.max(0, exitedAt - enteredAt);
  return Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60)));
}
