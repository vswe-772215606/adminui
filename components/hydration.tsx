"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useSettings } from "@/lib/settings-store";
import { useAuth } from "@/lib/auth-store";
import { useUi } from "@/lib/ui-store";

/**
 * Rehydrates every persisted store on the client. All stores use
 * `skipHydration` so SSR and the first client render agree.
 */
export function Hydration() {
  useEffect(() => {
    void useStore.persist.rehydrate();
    void useSettings.persist.rehydrate();
    void useAuth.persist.rehydrate();
    void useUi.persist.rehydrate();
  }, []);
  return null;
}
