import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UiState = {
  sidebarCollapsed: boolean;
  hasHydrated: boolean;
};

type UiActions = {
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
};

export type UiStore = UiState & UiActions;

export const useUi = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      hasHydrated: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "car-market-admin/ui/v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
