"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, getActiveBySpot } from "@/lib/store";
import { getKassa, getGroupForSpot, type KassaId } from "@/data/market";
import { hourlyRateUzs } from "@/lib/pricing";
import { formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";

type Props = {
  kassaId: KassaId;
  spotNumber: number | null;
  onClose: () => void;
};

export function RegisterCarDialog({ kassaId, spotNumber, onClose }: Props) {
  const open = spotNumber !== null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        {open && spotNumber !== null && (
          <RegisterForm
            kassaId={kassaId}
            spotNumber={spotNumber}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RegisterForm({
  kassaId,
  spotNumber,
  onClose,
}: {
  kassaId: KassaId;
  spotNumber: number;
  onClose: () => void;
}) {
  const kassa = getKassa(kassaId)!;
  const group = getGroupForSpot(kassa, spotNumber)!;
  const register = useStore((s) => s.register);
  const registrations = useStore((s) => s.registrations);

  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plate.trim() || !owner.trim() || !phone.trim()) {
      toast.error(t.required);
      return;
    }
    if (getActiveBySpot(registrations, kassaId, spotNumber)) {
      toast.error(t.spotOccupied);
      return;
    }
    register({ spotKassaId: kassaId, spotNumber, plate, owner, phone });
    toast.success(t.registered);
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t.registerCar}</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="outline" className="font-normal">
            {kassa.name}
          </Badge>
          <Badge variant="outline" className="font-normal tabular-nums">
            {t.spot} {spotNumber}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {group.name}
          </Badge>
          <span className="text-xs text-zinc-500 tabular-nums">
            {formatUzs(hourlyRateUzs[group.id])} {t.uzs}/{t.hour}
          </span>
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="plate">{t.plate}</Label>
          <Input
            id="plate"
            autoFocus
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="01 A 123 BC"
            className="tabular-nums uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="owner">{t.owner}</Label>
          <Input
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t.phone}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 ..."
          />
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button type="submit">{t.save}</Button>
        </DialogFooter>
      </form>
    </>
  );
}
