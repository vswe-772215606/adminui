"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useStore, type Registration } from "@/lib/store";
import { getKassa, getGroupForSpot } from "@/data/market";
import { calculateBill, chargedHours, hourlyRateUzs } from "@/lib/pricing";
import { formatTime, formatDuration, formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";

type Props = {
  registration: Registration | null;
  onClose: () => void;
  onConfirmed: () => void;
};

export function CheckoutDialog({ registration, onClose, onConfirmed }: Props) {
  const checkout = useStore((s) => s.checkout);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!registration) return;
    const interval = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(interval);
  }, [registration]);

  if (!registration) {
    return (
      <Dialog open={false} onOpenChange={(v) => !v && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const kassa = getKassa(registration.spotKassaId)!;
  const group = getGroupForSpot(kassa, registration.spotNumber)!;
  const bill = calculateBill(group.id, registration.enteredAt, now);
  const hours = chargedHours(registration.enteredAt, now);

  function handleConfirm() {
    checkout(registration!.id);
    toast.success(t.checkedOut);
    onConfirmed();
  }

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.confirmCheckout}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="font-normal">
              {kassa.name}
            </Badge>
            <Badge variant="outline" className="font-normal tabular-nums">
              {t.spot} {registration.spotNumber}
            </Badge>
            <Badge variant="outline" className="font-normal font-mono uppercase">
              {registration.plate}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <Row label={t.owner}>{registration.owner}</Row>
          <Row label={t.entryTime}>
            <span className="tabular-nums">
              {formatTime(registration.enteredAt)}
            </span>
          </Row>
          <Row label={t.exitTime}>
            <span className="tabular-nums">{formatTime(now)}</span>
          </Row>
          <Row label={t.duration}>
            <span className="tabular-nums">
              {formatDuration(registration.enteredAt, now)}
            </span>
          </Row>
          <Row label={t.rate}>
            <span className="tabular-nums">
              {formatUzs(hourlyRateUzs[group.id])} {t.uzs}/{t.hour}
            </span>
          </Row>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <span className="text-zinc-700 dark:text-zinc-200">
              {t.payment} ({hours} {t.hour})
            </span>
            <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatUzs(bill)} {t.uzs}
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleConfirm}>{t.checkOut}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
