"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function Hydration() {
  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);
  return null;
}
