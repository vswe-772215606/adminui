"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings,
  Palette,
  Coins,
  Building2,
  Save,
  RotateCcw,
  TimerReset,
} from "lucide-react";
import {
  PageShell,
  PageHeader,
  SegmentedControl,
} from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/lib/settings-store";
import { hourlyRateUzs } from "@/lib/pricing";
import { getAllKassas, market, type GroupId } from "@/data/market";
import { toneClasses } from "@/lib/tones";
import { formatUzs } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const allGroups = market.sectors
  .flatMap((s) => s.kassas)
  .flatMap((k) => k.groups);

export function SettingsView() {
  const rates = useSettings((s) => s.rates);
  const setRate = useSettings((s) => s.setRate);
  const resetRates = useSettings((s) => s.resetRates);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t.settings}
        title={t.settingsSubtitle}
        icon={<Settings />}
      />

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AppearanceCard />
        <SpotSettingsCard />
        <MarketInfoCard />
        <RatesCard
          rates={rates}
          onSave={(next) => {
            (Object.keys(next) as GroupId[]).forEach((g) => setRate(g, next[g]));
            toast.success(t.saved);
          }}
          onReset={() => {
            resetRates();
            toast.success(t.ratesReset);
          }}
        />
      </div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes: only know the resolved theme after mount (avoids SSR mismatch).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight text-foreground/80">
          <Palette className="size-4 text-muted-foreground" />
          {t.appearance}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{t.theme}</span>
          {mounted ? (
            <SegmentedControl
              value={(theme as "light" | "dark" | "system") ?? "system"}
              onChange={setTheme}
              options={[
                { value: "light", label: t.themeLight },
                { value: "dark", label: t.themeDark },
                { value: "system", label: t.themeSystem },
              ]}
            />
          ) : (
            <div className="h-8 w-44 rounded-lg bg-muted" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function SpotSettingsCard() {
  const overdueHours = useSettings((s) => s.overdueHours);
  const setOverdueHours = useSettings((s) => s.setOverdueHours);
  const [draft, setDraft] = useState(String(overdueHours));

  function commit() {
    const clamped = Math.min(72, Math.max(1, Math.round(Number(draft) || 1)));
    setOverdueHours(clamped);
    setDraft(String(clamped));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight text-foreground/80">
          <TimerReset className="size-4 text-muted-foreground" />
          {t.spotSettings}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm text-foreground">{t.overdueThreshold}</div>
            <p className="text-xs text-muted-foreground">{t.overdueHint}</p>
          </div>
          <div className="relative shrink-0">
            <Input
              inputMode="numeric"
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value.replace(/[^\d]/g, ""))
              }
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="w-24 pr-12 tabular-nums"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {t.hour}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function MarketInfoCard() {
  const kassas = getAllKassas();
  const totalSpots = kassas.reduce((s, k) => s + k.totalSpots, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight text-foreground/80">
          <Building2 className="size-4 text-muted-foreground" />
          {t.marketInfo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <InfoRow label={t.kassas}>
          <span className="tabular-nums">{kassas.length}</span>
        </InfoRow>
        <InfoRow label={t.spots}>
          <span className="tabular-nums">{totalSpots}</span>
        </InfoRow>
        <InfoRow label={t.groups}>
          <span className="tabular-nums">{allGroups.length}</span>
        </InfoRow>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allGroups.map((g) => {
            const c = toneClasses[g.tone];
            return (
              <Badge
                key={g.id}
                variant="outline"
                className="gap-1.5 font-normal text-muted-foreground"
              >
                <span className={cn("size-1.5 rounded-full", c.dot)} />
                {g.name}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RatesCard({
  rates,
  onSave,
  onReset,
}: {
  rates: Record<GroupId, number>;
  onSave: (next: Record<GroupId, number>) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<Record<GroupId, string>>(() =>
    mapValues(rates)
  );

  const dirty = (Object.keys(draft) as GroupId[]).some(
    (g) => Number(draft[g]) !== rates[g]
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight text-foreground/80">
          <Coins className="size-4 text-muted-foreground" />
          {t.rates}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t.ratesHint}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {allGroups.map((g) => {
            const c = toneClasses[g.tone];
            const isDefault = Number(draft[g.id]) === hourlyRateUzs[g.id];
            return (
              <div key={g.id} className="space-y-1.5">
                <Label
                  htmlFor={`rate-${g.id}`}
                  className="justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", c.dot)} />
                    {g.name}
                  </span>
                  {!isDefault && (
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {formatUzs(hourlyRateUzs[g.id])}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id={`rate-${g.id}`}
                    inputMode="numeric"
                    value={draft[g.id]}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [g.id]: e.target.value.replace(/[^\d]/g, ""),
                      }))
                    }
                    className="pr-12 tabular-nums"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {t.uzs}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onReset();
              setDraft(mapValues(hourlyRateUzs));
            }}
          >
            <RotateCcw />
            {t.resetDefaults}
          </Button>
          <Button
            size="sm"
            disabled={!dirty}
            onClick={() => {
              const next = {} as Record<GroupId, number>;
              (Object.keys(draft) as GroupId[]).forEach((g) => {
                next[g] = Number(draft[g]) || 0;
              });
              onSave(next);
            }}
          >
            <Save />
            {t.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function mapValues(rates: Record<GroupId, number>): Record<GroupId, string> {
  const out = {} as Record<GroupId, string>;
  (Object.keys(rates) as GroupId[]).forEach((g) => {
    out[g] = String(rates[g]);
  });
  return out;
}
