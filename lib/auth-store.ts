import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Mock authentication for the prototype — no backend. Demo credentials are
 * checked client-side; the session is persisted to localStorage.
 */
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin";

type AuthState = {
  user: string | null;
  hasHydrated: boolean;
};

type AuthActions = {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

export type AuthStore = AuthState & AuthActions;

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      login: (username, password) => {
        const u = username.trim();
        if (u.toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD) {
          set({ user: u });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "car-market-admin/auth/v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
