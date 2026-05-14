"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { CarFront, Check, X, CreditCard, Hash, User, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, getActiveBySpot } from "@/lib/store";
import { useRates } from "@/lib/settings-store";
import { getKassa, getGroupForSpot, type KassaId } from "@/data/market";
import { formatUzs } from "@/lib/format";
import { toneClasses } from "@/lib/tones";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  kassaId: KassaId;
  spotNumber: number | null;
  onClose: () => void;
};

export function RegisterCarDialog({ kassaId, spotNumber, onClose }: Props) {
  const open = spotNumber !== null;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="gap-0">
        {open && spotNumber !== null && (
          <RegisterForm
            kassaId={kassaId}
            spotNumber={spotNumber}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type Fields = "plate" | "owner" | "phone";

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
  const tone = toneClasses[group.tone];
  const register = useStore((s) => s.register);
  const registrations = useStore((s) => s.registrations);
  const rates = useRates();

  const [values, setValues] = useState<Record<Fields, string>>({
    plate: "",
    owner: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Fields, boolean>>>({});

  const plateRef = useRef<HTMLInputElement>(null);
  const ownerRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  function update(field: Fields, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: false }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<Fields, boolean>> = {
      plate: !values.plate.trim(),
      owner: !values.owner.trim(),
      phone: !values.phone.trim(),
    };
    setErrors(nextErrors);
    if (nextErrors.plate) {
      plateRef.current?.focus();
      return;
    }
    if (nextErrors.owner) {
      ownerRef.current?.focus();
      return;
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }
    if (getActiveBySpot(registrations, kassaId, spotNumber)) {
      toast.error(t.spotOccupied);
      return;
    }
    register({
      spotKassaId: kassaId,
      spotNumber,
      plate: values.plate,
      owner: values.owner,
      phone: values.phone,
    });
    toast.success(t.registered);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
      <SheetHeader className="gap-2 border-b border-border pr-12">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CarFront className="size-4.5" />
          </div>
          <div className="min-w-0">
            <SheetTitle>{t.registerCar}</SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="outline" className="font-normal">
                {kassa.name}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 font-normal tabular-nums"
              >
                <Hash className="size-3" />
                {spotNumber}
              </Badge>
              <Badge variant="outline" className="gap-1.5 font-normal">
                <span className={cn("size-1.5 rounded-full", tone.dot)} />
                {group.name}
              </Badge>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field
          id="plate"
          label={t.plate}
          icon={<CreditCard />}
          required
          error={errors.plate}
        >
          <Input
            id="plate"
            ref={plateRef}
            autoFocus
            value={values.plate}
            onChange={(e) => update("plate", e.target.value.toUpperCase())}
            placeholder={t.plateHint}
            className="uppercase tabular-nums"
            aria-invalid={errors.plate}
          />
        </Field>

        <Field
          id="owner"
          label={t.owner}
          icon={<User />}
          required
          error={errors.owner}
        >
          <Input
            id="owner"
            ref={ownerRef}
            value={values.owner}
            onChange={(e) => update("owner", e.target.value)}
            autoComplete="name"
            aria-invalid={errors.owner}
          />
        </Field>

        <Field
          id="phone"
          label={t.phone}
          icon={<Phone />}
          required
          error={errors.phone}
          hint={t.phoneHint}
        >
          <Input
            id="phone"
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+998"
            aria-invalid={errors.phone}
          />
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
          <span className="text-muted-foreground">{t.rate}</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatUzs(rates[group.id])} {t.uzs}/{t.hour}
          </span>
        </div>
      </div>

      <SheetFooter className="flex-row justify-end border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          <X />
          {t.cancel}
        </Button>
        <Button type="submit">
          <Check />
          {t.save}
        </Button>
      </SheetFooter>
    </form>
  );
}

function Field({
  id,
  label,
  icon,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs [&_svg]:size-3.5">
        <span className="text-muted-foreground">{icon}</span>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{t.required}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
