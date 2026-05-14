"use client";

import { useMemo } from "react";
import {
  computeBands,
  getGroupForSpot,
  type Kassa,
  type GroupId,
} from "@/data/market";
import { Spot } from "./spot";
import { GroupLabel } from "./group-band";
import { type Registration, useStore } from "@/lib/store";
import { useSettings } from "@/lib/settings-store";
import { useNow } from "@/lib/use-now";
import { toneClasses } from "@/lib/tones";
import { cn } from "@/lib/utils";

type SpotGridProps = {
  kassa: Kassa;
  highlightedSpot?: number | null;
  onSpotClick?: (
    spotNumber: number,
    registration?: Registration,
    anchor?: HTMLElement
  ) => void;
};

export function SpotGrid({
  kassa,
  highlightedSpot,
  onSpotClick,
}: SpotGridProps) {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const overdueHours = useSettings((s) => s.overdueHours);
  // One shared clock for the whole grid — Spot is memoised so only
  // occupied tiles re-render on each tick.
  const now = useNow(60_000);

  const bands = useMemo(() => computeBands(kassa), [kassa]);
  const labelFlags = useMemo(
    () => bands.map((b, i) => i === 0 || bands[i - 1].groupId !== b.groupId),
    [bands]
  );

  // Index active registrations by spot number once, instead of an O(n)
  // scan per tile.
  const activeBySpot = useMemo(() => {
    const map = new Map<number, Registration>();
    if (hasHydrated) {
      for (const r of registrations) {
        if (r.spotKassaId === kassa.id && r.exitedAt === undefined) {
          map.set(r.spotNumber, r);
        }
      }
    }
    return map;
  }, [registrations, hasHydrated, kassa.id]);

  return (
    <div className="space-y-5">
      {bands.map((band, idx) => {
        const showGroupLabel = labelFlags[idx];
        const group = kassa.groups.find((g) => g.id === band.groupId);
        const tone = group ? toneClasses[group.tone] : null;
        return (
          <div key={band.bandIndex} className="space-y-2">
            {showGroupLabel && group && (
              <GroupLabel
                name={group.name}
                spotRange={group.spotRange}
                tone={group.tone}
              />
            )}
            <div
              className={cn(
                "space-y-2 rounded-xl border p-3 sm:p-4",
                tone?.softBg,
                tone?.softBorder
              )}
            >
              {band.rows.map((row) => (
                <div
                  key={row.rowIndex}
                  className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] sm:gap-2"
                >
                  {row.cells
                    .flatMap((cell) => cell.spots)
                    .map((spotNumber) => (
                      <Spot
                        key={spotNumber}
                        number={spotNumber}
                        registration={activeBySpot.get(spotNumber)}
                        now={now}
                        overdueHours={overdueHours}
                        highlighted={highlightedSpot === spotNumber}
                        onClick={onSpotClick}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function spotGroupId(kassa: Kassa, spotNumber: number): GroupId | null {
  const group = getGroupForSpot(kassa, spotNumber);
  return group?.id ?? null;
}
