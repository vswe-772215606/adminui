"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2 } from "lucide-react";
import { getKassa, type KassaId } from "@/data/market";
import { SpotGrid } from "@/components/grid/spot-grid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PageShell,
  PageHeader,
  Stat,
  StatGroup,
} from "@/components/layout/page-shell";
import { useStore, getActive, type Registration } from "@/lib/store";
import { t } from "@/lib/i18n";
import { RegisterCarDialog } from "@/components/dialogs/register-car";
import { toneClasses } from "@/lib/tones";
import { cn } from "@/lib/utils";

type Props = { kassaId: KassaId };

export function KassaView({ kassaId }: Props) {
  const kassa = getKassa(kassaId)!;
  const router = useRouter();
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

  function handleSearch(value: string) {
    setSearch(value);
    const n = parseInt(value, 10);
    if (Number.isFinite(n) && n >= 1 && n <= kassa.totalSpots) {
      setHighlightedSpot(n);
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`button[data-spot="${n}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setHighlightedSpot(null);
    }
  }

  function handleSpotClick(spotNumber: number, registration?: Registration) {
    if (registration) {
      router.push(`/cars/${registration.id}`);
    } else {
      setRegisterSpot(spotNumber);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow={t.kassa}
        title={kassa.name}
        icon={<Building2 />}
        actions={
          <StatGroup>
            <Stat label={t.total} value={kassa.totalSpots} size="md" />
            <Stat label={t.free} value={free} tone="free" size="md" />
            <Stat label={t.occupied} value={occupied} tone="occupied" size="md" />
          </StatGroup>
        }
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {kassa.groups.map((g) => {
            const c = toneClasses[g.tone];
            return (
              <Badge
                key={g.id}
                variant="outline"
                className="gap-2 font-normal"
              >
                <span className={cn("size-2 rounded-full", c.dot)} />
                <span className="text-foreground">{g.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {g.spotRange[0]}–{g.spotRange[1]}
                </span>
              </Badge>
            );
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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

      <div ref={gridRef} className="mt-5">
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
    </PageShell>
  );
}
