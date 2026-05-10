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
import {
  getActiveBySpot,
  type Registration,
  useStore,
} from "@/lib/store";
import { toneClasses } from "@/lib/tones";
import { cn } from "@/lib/utils";

type SpotGridProps = {
  kassa: Kassa;
  highlightedSpot?: number | null;
  onSpotClick?: (spotNumber: number, registration?: Registration) => void;
};

export function SpotGrid({ kassa, highlightedSpot, onSpotClick }: SpotGridProps) {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const bands = useMemo(() => computeBands(kassa), [kassa]);
  const labelFlags = useMemo(
    () => bands.map((b, i) => i === 0 || bands[i - 1].groupId !== b.groupId),
    [bands]
  );

  return (
    <div className="overflow-x-auto pb-2">
      <div className="space-y-5 w-max">
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
                  "rounded-md border p-3 space-y-1.5",
                  tone?.softBg,
                  tone?.softBorder
                )}
              >
                {band.rows.map((row) => (
                  <div
                    key={row.rowIndex}
                    className="flex items-center gap-3"
                  >
                    {row.cells.map((cell, ci) => (
                      <div
                        key={ci}
                        className="flex flex-nowrap gap-1"
                      >
                        {cell.spots.map((spotNumber) => {
                          const registration = hasHydrated
                            ? getActiveBySpot(registrations, kassa.id, spotNumber)
                            : undefined;
                          return (
                            <Spot
                              key={spotNumber}
                              number={spotNumber}
                              registration={registration}
                              highlighted={highlightedSpot === spotNumber}
                              onClick={onSpotClick}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function spotGroupId(kassa: Kassa, spotNumber: number): GroupId | null {
  const group = getGroupForSpot(kassa, spotNumber);
  return group?.id ?? null;
}
