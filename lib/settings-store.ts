import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GroupId } from "@/data/market";
import { hourlyRateUzs, type Rates } from "@/lib/pricing";

/** Default hours after which a parked car is flagged as overdue. */
export const DEFAULT_OVERDUE_HOURS = 6;

type SettingsState = {
  rates: Rates;
  overdueHours: number;
  hasHydrated: boolean;
};

type SettingsActions = {
  setRate: (group: GroupId, value: number) => void;
  resetRates: () => void;
  setOverdueHours: (value: number) => void;
  setHasHydrated: (value: boolean) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      rates: { ...hourlyRateUzs },
      overdueHours: DEFAULT_OVERDUE_HOURS,
      hasHydrated: false,
      setRate: (group, value) =>
        set((s) => ({
          rates: { ...s.rates, [group]: Math.max(0, Math.round(value || 0)) },
        })),
      resetRates: () => set({ rates: { ...hourlyRateUzs } }),
      setOverdueHours: (value) =>
        set({ overdueHours: Math.min(72, Math.max(1, Math.round(value || 1))) }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "car-market-admin/settings/v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ rates: s.rates, overdueHours: s.overdueHours }),
      skipHydration: true,
      // Guard against a persisted map missing a newer group / field.
      merge: (persisted, current) => {
        const p = persisted as Partial<SettingsState> | undefined;
        return {
          ...current,
          rates: { ...current.rates, ...(p?.rates ?? {}) },
          overdueHours: p?.overdueHours ?? current.overdueHours,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Live hourly rates — falls back to defaults until hydrated. */
export function useRates(): Rates {
  return useSettings((s) => s.rates);
}
