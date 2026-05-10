"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { getKassa, type KassaId } from "@/data/market";
import { SpotGrid } from "@/components/grid/spot-grid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, getActive, type Registration } from "@/lib/store";
import { t } from "@/lib/i18n";
import { RegisterCarDialog } from "@/components/dialogs/register-car";
import { SpotDetailDialog } from "@/components/dialogs/spot-detail";
import { toneClasses } from "@/lib/tones";

type Props = { kassaId: KassaId };

export function KassaView({ kassaId }: Props) {
  const kassa = getKassa(kassaId)!;
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);

  const activeForKassa = useMemo(
    () =>
      hasHydrated
        ? getActive(registrations).filter((r) => r.spotKassaId === kassaId)
        : [],
    [registrations, kassaId, hasHydrated]
  );

  const occupied = activeForKassa.length;
  const free = kassa.totalSpots - occupied;

  const [search, setSearch] = useState("");
  const [highlightedSpot, setHighlightedSpot] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [registerSpot, setRegisterSpot] = useState<number | null>(null);
  const [detailRegistration, setDetailRegistration] =
    useState<Registration | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    const n = parseInt(value, 10);
    if (Number.isFinite(n) && n >= 1 && n <= kassa.totalSpots) {
      setHighlightedSpot(n);
      const el = gridRef.current?.querySelector<HTMLButtonElement>(
        `button[data-spot="${n}"]`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setHighlightedSpot(null);
    }
  }

  function handleSpotClick(spotNumber: number, registration?: Registration) {
    if (registration) {
      setDetailRegistration(registration);
    } else {
      setRegisterSpot(spotNumber);
    }
  }

  return (
    <div className="px-8 py-6 max-w-[1400px]">
      <header className="flex items-end justify-between gap-6 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {t.kassa}
          </div>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {kassa.name}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Stat label={t.total} value={kassa.totalSpots} />
          <Stat label={t.free} value={free} tone="free" />
          <Stat label={t.occupied} value={occupied} tone="occupied" />
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {kassa.groups.map((g) => {
            const c = toneClasses[g.tone];
            return (
              <Badge
                key={g.id}
                variant="outline"
                className="gap-2 border-zinc-200 dark:border-zinc-800 font-normal"
              >
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-zinc-700 dark:text-zinc-300">{g.name}</span>
                <span className="text-zinc-500 tabular-nums">
                  {g.spotRange[0]}–{g.spotRange[1]}
                </span>
              </Badge>
            );
          })}
        </div>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            strokeWidth={1.5}
          />
          <Input
            type="text"
            inputMode="numeric"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t.searchSpotPlaceholder}
            className="w-40 pl-8 tabular-nums"
          />
        </div>
      </div>

      <div ref={gridRef} className="mt-6">
        <SpotGrid
          kassa={kassa}
          highlightedSpot={highlightedSpot}
          onSpotClick={handleSpotClick}
        />
      </div>

      <RegisterCarDialog
        kassaId={kassaId}
        spotNumber={registerSpot}
        onClose={() => setRegisterSpot(null)}
      />
      <SpotDetailDialog
        registration={detailRegistration}
        onClose={() => setDetailRegistration(null)}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "free" | "occupied";
}) {
  return (
    <div className="text-right">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className={
          "text-xl font-semibold tabular-nums tracking-tight " +
          (tone === "free"
            ? "text-emerald-700 dark:text-emerald-400"
            : tone === "occupied"
              ? "text-amber-700 dark:text-amber-400"
              : "text-blue-900 dark:text-blue-300")
        }
      >
        {value}
      </div>
    </div>
  );
}
