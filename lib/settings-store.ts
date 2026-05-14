import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GroupId } from "@/data/market";
import { hourlyRateUzs, type Rates } from "@/lib/pricing";

type SettingsState = {
  rates: Rates;
  hasHydrated: boolean;
};

type SettingsActions = {
  setRate: (group: GroupId, value: number) => void;
  resetRates: () => void;
  setHasHydrated: (value: boolean) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      rates: { ...hourlyRateUzs },
      hasHydrated: false,
      setRate: (group, value) =>
        set((s) => ({
          rates: { ...s.rates, [group]: Math.max(0, Math.round(value || 0)) },
        })),
      resetRates: () => set({ rates: { ...hourlyRateUzs } }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "car-market-admin/settings/v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ rates: s.rates }),
      skipHydration: true,
      // Guard against a persisted map missing a newer group.
      merge: (persisted, current) => ({
        ...current,
        rates: {
          ...current.rates,
          ...((persisted as Partial<SettingsState>)?.rates ?? {}),
        },
      }),
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
