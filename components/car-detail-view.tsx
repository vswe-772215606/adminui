"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Clock,
  Coins,
  LogOut,
  MapPin,
  Phone,
  User,
  CalendarClock,
  CalendarCheck,
  Gauge,
  CircleSlash,
} from "lucide-react";
import {
  PageShell,
  PageHeader,
  EmptyState,
} from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveDuration } from "@/components/live-duration";
import { CheckoutDialog } from "@/components/dialogs/checkout";
import { useStore } from "@/lib/store";
import { useRates } from "@/lib/settings-store";
import { useNow } from "@/lib/use-now";
import { getKassa, getGroupForSpot } from "@/data/market";
import { calculateBill, chargedHours } from "@/lib/pricing";
import { formatTime, formatDuration, formatUzs } from "@/lib/format";
import { toneClasses } from "@/lib/tones";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function CarDetailView({ registrationId }: { registrationId: string }) {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const rates = useRates();
  const now = useNow(1000);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const registration = useMemo(
    () => registrations.find((r) => r.id === registrationId) ?? null,
    [registrations, registrationId]
  );

  if (!hasHydrated) {
    return (
      <PageShell>
        <PageHeader eyebrow={t.carDetail} title={t.cars} icon={<Car />} />
      </PageShell>
    );
  }

  if (!registration) {
    return (
      <PageShell>
        <PageHeader eyebrow={t.carDetail} title={t.carNotFound} icon={<Car />} />
        <div className="mt-6">
          <EmptyState icon={<CircleSlash />}>
            {t.carNotFound}
            <Button variant="outline" size="sm" render={<Link href="/cars" />}>
              <ArrowLeft />
              {t.cars}
            </Button>
          </EmptyState>
        </div>
      </PageShell>
    );
  }

  const kassa = getKassa(registration.spotKassaId)!;
  const group = getGroupForSpot(kassa, registration.spotNumber)!;
  const tone = toneClasses[group.tone];
  const isActive = registration.exitedAt === undefined;
  const refEnd = registration.exitedAt ?? now;
  const bill = calculateBill(group.id, registration.enteredAt, refEnd, rates);
  const hours = chargedHours(registration.enteredAt, refEnd || registration.enteredAt);

  return (
    <PageShell>
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/cars" />}
        className="mb-3 -ml-2 text-muted-foreground"
      >
        <ArrowLeft />
        {t.cars}
      </Button>

      <PageHeader
        eyebrow={t.carDetail}
        title={registration.plate}
        icon={<Car />}
        actions={
          <>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 font-medium",
                isActive
                  ? "border-amber-300 text-amber-700 dark:border-amber-900/50 dark:text-amber-300"
                  : "border-emerald-300 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-300"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isActive ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
              {isActive ? t.active : t.paid}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/kassa/${kassa.id}`} />}
            >
              <MapPin />
              {t.openInGrid}
            </Button>
            {isActive && (
              <Button size="sm" onClick={() => setCheckoutOpen(true)}>
                <LogOut />
                {t.checkOut}
              </Button>
            )}
          </>
        }
      />

      {/* Hero: real-time elapsed + live bill */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 p-5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              {isActive ? t.elapsed : t.duration}
            </div>
            <div className="font-heading text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
              {isActive ? (
                <LiveDuration from={registration.enteredAt} />
              ) : (
                formatDuration(registration.enteredAt, registration.exitedAt!)
              )}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {hours} {t.hour}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 p-5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Coins className="size-3.5" />
              {isActive ? t.liveBill : t.payment}
            </div>
            <div className="font-heading text-3xl font-semibold tabular-nums tracking-tight text-primary sm:text-4xl">
              {formatUzs(bill)}{" "}
              <span className="text-base font-medium text-muted-foreground">
                {t.uzs}
              </span>
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {formatUzs(rates[group.id])} {t.uzs}/{t.hour}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 gap-x-8 gap-y-0 p-2 sm:grid-cols-2">
          <DetailRow icon={<User />} label={t.owner}>
            {registration.owner}
          </DetailRow>
          <DetailRow icon={<Phone />} label={t.phone}>
            {registration.phone ? (
              <a
                href={`tel:${registration.phone}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {registration.phone}
              </a>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow icon={<MapPin />} label={`${t.kassa} / ${t.spot}`}>
            <span className="tabular-nums">
              {kassa.name} · {registration.spotNumber}
            </span>
          </DetailRow>
          <DetailRow icon={<Gauge />} label={t.group}>
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", tone.dot)} />
              {group.name}
            </span>
          </DetailRow>
          <DetailRow icon={<CalendarClock />} label={t.entryTime}>
            <span className="tabular-nums">
              {formatTime(registration.enteredAt)}
            </span>
          </DetailRow>
          <DetailRow icon={<CalendarCheck />} label={t.exitTime}>
            <span className="tabular-nums">
              {registration.exitedAt ? formatTime(registration.exitedAt) : "—"}
            </span>
          </DetailRow>
        </CardContent>
      </Card>

      <CheckoutDialog
        registration={isActive && checkoutOpen ? registration : null}
        onClose={() => setCheckoutOpen(false)}
        onConfirmed={() => setCheckoutOpen(false)}
      />
    </PageShell>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 px-3 py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground/70">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}
