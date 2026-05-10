import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { KassaId } from "@/data/market";

export type Registration = {
  id: string;
  spotKassaId: KassaId;
  spotNumber: number;
  plate: string;
  owner: string;
  phone: string;
  enteredAt: number;
  exitedAt?: number;
  paid: boolean;
};

export type RegistrationInput = {
  spotKassaId: KassaId;
  spotNumber: number;
  plate: string;
  owner: string;
  phone: string;
};

type StoreState = {
  registrations: Registration[];
  hasHydrated: boolean;
};

type StoreActions = {
  register: (input: RegistrationInput) => Registration;
  checkout: (id: string) => void;
  setHasHydrated: (value: boolean) => void;
};

export type Store = StoreState & StoreActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      registrations: [],
      hasHydrated: false,
      register: (input) => {
        const reg: Registration = {
          id: crypto.randomUUID(),
          spotKassaId: input.spotKassaId,
          spotNumber: input.spotNumber,
          plate: input.plate.trim().toUpperCase(),
          owner: input.owner.trim(),
          phone: input.phone.trim(),
          enteredAt: Date.now(),
          paid: false,
        };
        set({ registrations: [...get().registrations, reg] });
        return reg;
      },
      checkout: (id) => {
        const now = Date.now();
        set({
          registrations: get().registrations.map((r) =>
            r.id === id && r.exitedAt === undefined
              ? { ...r, exitedAt: now, paid: true }
              : r
          ),
        });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "car-market-admin/v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ registrations: state.registrations }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function getActiveBySpot(
  registrations: Registration[],
  kassaId: KassaId,
  spotNumber: number
): Registration | undefined {
  return registrations.find(
    (r) =>
      r.spotKassaId === kassaId &&
      r.spotNumber === spotNumber &&
      r.exitedAt === undefined
  );
}

export function getActive(registrations: Registration[]): Registration[] {
  return registrations.filter((r) => r.exitedAt === undefined);
}

export function getHistory(registrations: Registration[]): Registration[] {
  return registrations.filter((r) => r.exitedAt !== undefined);
}
