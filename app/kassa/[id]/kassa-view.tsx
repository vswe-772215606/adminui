"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Eye, LogOut } from "lucide-react";
import {
  getKassa,
  getGroupForSpot,
  type KassaId,
} from "@/data/market";
import { SpotGrid } from "@/components/grid/spot-grid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  PageShell,
  PageHeader,
  Stat,
  StatGroup,
} from "@/components/layout/page-shell";
import { LiveDuration } from "@/components/live-duration";
import { RegisterCarDialog } from "@/components/dialogs/register-car";
import { CheckoutDialog } from "@/components/dialogs/checkout";
import { useStore, getActive, type Registration } from "@/lib/store";
import { useRates } from "@/lib/settings-store";
import { useNow } from "@/lib/use-now";
import { calculateBill } from "@/lib/pricing";
import { formatTime, formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";
import { toneClasses } from "@/lib/tones";
import { cn } from "@/lib/utils";

type Props = { kassaId: KassaId };

type Peek = { registration: Registration; anchor: HTMLElement };

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
  const [peek, setPeek] = useState<Peek | null>(null);
  const [checkoutReg, setCheckoutReg] = useState<Registration | null>(null);

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

  function handleSpotClick(
    spotNumber: number,
    registration?: Registration,
    anchor?: HTMLElement
  ) {
    if (registration && anchor) {
      setPeek({ registration, anchor });
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
            <Stat
              label={t.occupied}
              value={occupied}
              tone="occupied"
              size="md"
            />
          </StatGroup>
        }
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {kassa.groups.map((g) => {
              const c = toneClasses[g.tone];
              return (
                <Badge key={g.id} variant="outline" className="gap-2 font-normal">
                  <span className={cn("size-2 rounded-full", c.dot)} />
                  <span className="text-foreground">{g.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {g.spotRange[0]}–{g.spotRange[1]}
                  </span>
                </Badge>
              );
            })}
          </div>
          <StatusLegend />
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

      {/* Quick-peek popover for an occupied spot */}
      <Popover
        open={peek !== null}
        onOpenChange={(open) => {
          if (!open) setPeek(null);
        }}
      >
        <PopoverContent anchor={peek?.anchor} side="top" className="w-60">
          {peek && (
            <SpotPeek
              registration={peek.registration}
              onDetails={() => {
                const id = peek.registration.id;
                setPeek(null);
                router.push(`/cars/${id}`);
              }}
              onCheckout={() => {
                const r = peek.registration;
                setPeek(null);
                setCheckoutReg(r);
              }}
            />
          )}
        </PopoverContent>
      </Popover>

      <RegisterCarDialog
        kassaId={kassaId}
        spotNumber={registerSpot}
        onClose={() => setRegisterSpot(null)}
      />
      <CheckoutDialog
        registration={checkoutReg}
        onClose={() => setCheckoutReg(null)}
        onConfirmed={() => setCheckoutReg(null)}
      />
    </PageShell>
  );
}

function StatusLegend() {
  const items = [
    { label: t.free, className: "border-border bg-card" },
    {
      label: t.occupied,
      className: "border-amber-300 bg-amber-200 dark:border-amber-800 dark:bg-amber-900/60",
    },
    {
      label: t.overdue,
      className: "border-rose-300 bg-rose-200 dark:border-rose-800 dark:bg-rose-900/60",
    },
  ];
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => (
        <span
          key={it.label}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span className={cn("size-3 rounded border", it.className)} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function SpotPeek({
  registration,
  onDetails,
  onCheckout,
}: {
  registration: Registration;
  onDetails: () => void;
  onCheckout: () => void;
}) {
  const rates = useRates();
  const now = useNow(1000);
  const kassa = getKassa(registration.spotKassaId)!;
  const group = getGroupForSpot(kassa, registration.spotNumber)!;
  const tone = toneClasses[group.tone];
  const ref = now > 0 ? now : registration.enteredAt;
  const bill = calculateBill(group.id, registration.enteredAt, ref, rates);

  return (
    <div className="w-60 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold uppercase tabular-nums text-foreground">
          {registration.plate}
        </span>
        <Badge variant="outline" className="gap-1.5 font-normal">
          <span className={cn("size-1.5 rounded-full", tone.dot)} />
          {group.name}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs">
        <PeekRow label={t.owner}>{registration.owner}</PeekRow>
        <PeekRow label={`${t.kassa} / ${t.spot}`}>
          <span className="tabular-nums">
            {kassa.name} · {registration.spotNumber}
          </span>
        </PeekRow>
        <PeekRow label={t.entryTime}>
          <span className="tabular-nums">
            {formatTime(registration.enteredAt)}
          </span>
        </PeekRow>
        <PeekRow label={t.elapsed}>
          <LiveDuration
            from={registration.enteredAt}
            className="font-medium text-foreground"
          />
        </PeekRow>
        <PeekRow label={t.currentBill}>
          <span className="font-semibold tabular-nums text-foreground">
            {formatUzs(bill)} {t.uzs}
          </span>
        </PeekRow>
      </div>

      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onDetails}
        >
          <Eye />
          {t.viewDetails}
        </Button>
        <Button size="sm" className="flex-1" onClick={onCheckout}>
          <LogOut />
          {t.checkOut}
        </Button>
      </div>
    </div>
  );
}

function PeekRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}
