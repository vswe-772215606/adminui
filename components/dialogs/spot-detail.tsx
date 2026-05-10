"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Registration } from "@/lib/store";
import { getKassa, getGroupForSpot } from "@/data/market";
import { formatTime, formatDuration, formatUzs } from "@/lib/format";
import { calculateBill, hourlyRateUzs } from "@/lib/pricing";
import { t } from "@/lib/i18n";
import { CheckoutDialog } from "./checkout";

type Props = {
  registration: Registration | null;
  onClose: () => void;
};

export function SpotDetailDialog({ registration, onClose }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!registration || registration.exitedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [registration]);

  const open = registration !== null;

  if (!registration) {
    return (
      <Dialog open={false} onOpenChange={(v) => !v && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const kassa = getKassa(registration.spotKassaId)!;
  const group = getGroupForSpot(kassa, registration.spotNumber)!;
  const isActive = registration.exitedAt === undefined;
  const referenceEnd = registration.exitedAt ?? now;
  const bill = calculateBill(group.id, registration.enteredAt, referenceEnd);

  return (
    <>
      <Dialog open={open && !checkoutOpen} onOpenChange={(v) => !v && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.spotDetail}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className="font-normal">
                {kassa.name}
              </Badge>
              <Badge variant="outline" className="font-normal tabular-nums">
                {t.spot} {registration.spotNumber}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {group.name}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <Row label={t.plate}>
              <span className="font-mono tabular-nums uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
                {registration.plate}
              </span>
            </Row>
            <Row label={t.owner}>{registration.owner}</Row>
            <Row label={t.phone}>{registration.phone || "—"}</Row>
            <Row label={t.entryTime}>
              <span className="tabular-nums">
                {formatTime(registration.enteredAt)}
              </span>
            </Row>
            {registration.exitedAt && (
              <Row label={t.exitTime}>
                <span className="tabular-nums">
                  {formatTime(registration.exitedAt)}
                </span>
              </Row>
            )}
            <Row label={t.duration}>
              <span className="tabular-nums">
                {formatDuration(registration.enteredAt, referenceEnd)}
              </span>
            </Row>
            <Row label={t.rate}>
              <span className="tabular-nums">
                {formatUzs(hourlyRateUzs[group.id])} {t.uzs}/{t.hour}
              </span>
            </Row>
            <Row label={isActive ? t.currentBill : t.payment}>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatUzs(bill)} {t.uzs}
              </span>
            </Row>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            {isActive && (
              <Button onClick={() => setCheckoutOpen(true)}>{t.checkOut}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        registration={isActive && checkoutOpen ? registration : null}
        onClose={() => {
          setCheckoutOpen(false);
        }}
        onConfirmed={() => {
          setCheckoutOpen(false);
          onClose();
        }}
      />
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-2 last:border-b-0 last:pb-0 dark:border-zinc-800/60">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-900 dark:text-zinc-100 text-right">
        {children}
      </span>
    </div>
  );
}
