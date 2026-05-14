"use client";

import { useNow } from "@/lib/use-now";
import { toast } from "sonner";
import { LogOut, X, Hash, Clock } from "lucide-react";
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
import { useRates } from "@/lib/settings-store";
import { getKassa, getGroupForSpot } from "@/data/market";
import { calculateBill, chargedHours } from "@/lib/pricing";
import { formatTime, formatClock, formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";

type Props = {
  registration: Registration | null;
  onClose: () => void;
  onConfirmed: () => void;
};

export function CheckoutDialog({ registration, onClose, onConfirmed }: Props) {
  const checkout = useStore((s) => s.checkout);
  const rates = useRates();
  // 1s tick — the elapsed clock and bill update in real time.
  const now = useNow(1000);

  if (!registration) {
    return (
      <Dialog open={false} onOpenChange={(v) => !v && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const kassa = getKassa(registration.spotKassaId)!;
  const group = getGroupForSpot(kassa, registration.spotNumber)!;
  const ref = now > 0 ? now : registration.enteredAt;
  const bill = calculateBill(group.id, registration.enteredAt, ref, rates);
  const hours = chargedHours(registration.enteredAt, ref);

  function handleConfirm() {
    checkout(registration!.id);
    toast.success(t.checkedOut);
    onConfirmed();
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LogOut className="size-4.5" />
            </div>
            <div className="min-w-0">
              <DialogTitle>{t.confirmCheckout}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge variant="outline" className="font-normal">
                  {kassa.name}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1 font-normal tabular-nums"
                >
                  <Hash className="size-3" />
                  {registration.spotNumber}
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono font-normal uppercase"
                >
                  {registration.plate}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Real-time elapsed + bill */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              {t.elapsed}
            </div>
            <div
              className="mt-1 font-heading text-xl font-semibold tabular-nums tracking-tight text-foreground"
              suppressHydrationWarning
            >
              {now > 0 ? formatClock(now - registration.enteredAt) : "—"}
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="text-[11px] uppercase tracking-wider text-primary/80">
              {t.payment} · {hours} {t.hour}
            </div>
            <div className="mt-1 font-heading text-xl font-semibold tabular-nums tracking-tight text-primary">
              {formatUzs(bill)}{" "}
              <span className="text-sm font-medium">{t.uzs}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 text-sm">
          <Row label={t.owner}>{registration.owner}</Row>
          <Row label={t.entryTime}>
            <span className="tabular-nums">
              {formatTime(registration.enteredAt)}
            </span>
          </Row>
          <Row label={t.exitTime}>
            <span className="tabular-nums" suppressHydrationWarning>
              {now > 0 ? formatTime(now) : "—"}
            </span>
          </Row>
          <Row label={t.rate}>
            <span className="tabular-nums">
              {formatUzs(rates[group.id])} {t.uzs}/{t.hour}
            </span>
          </Row>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X />
            {t.cancel}
          </Button>
          <Button onClick={handleConfirm}>
            <LogOut />
            {t.checkOut}
          </Button>
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
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}
