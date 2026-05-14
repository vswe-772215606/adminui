"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Inbox } from "lucide-react";
import {
  PageShell,
  PageHeader,
  SegmentedControl,
  EmptyState,
} from "@/components/layout/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LiveDuration } from "@/components/live-duration";
import {
  useStore,
  getActive,
  getHistory,
  type Registration,
} from "@/lib/store";
import { useRates } from "@/lib/settings-store";
import { useNow } from "@/lib/use-now";
import { formatTime, formatDuration, formatUzs } from "@/lib/format";
import { calculateBill } from "@/lib/pricing";
import { getAllKassas, getGroupForSpot, getKassa, type KassaId } from "@/data/market";
import { toneClasses } from "@/lib/tones";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type KassaFilter = "all" | KassaId;

export function CarsView() {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const kassas = getAllKassas();

  const [filter, setFilter] = useState<KassaFilter>("all");

  const active = useMemo(
    () => (hasHydrated ? getActive(registrations) : []),
    [registrations, hasHydrated]
  );
  const history = useMemo(
    () => (hasHydrated ? getHistory(registrations) : []),
    [registrations, hasHydrated]
  );

  const applyFilter = (list: Registration[]) =>
    (filter === "all" ? list : list.filter((r) => r.spotKassaId === filter)).sort(
      (a, b) => b.enteredAt - a.enteredAt
    );

  const activeRows = applyFilter(active);
  const historyRows = applyFilter(history);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t.cars}
        title={t.cars}
        icon={<Car />}
        actions={
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: t.allKassas },
              ...kassas.map((k) => ({ value: k.id, label: k.name })),
            ]}
          />
        }
      />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">
            {t.active}
            <Badge
              variant="outline"
              className="ml-1.5 font-normal tabular-nums"
            >
              {activeRows.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            {t.history}
            <Badge
              variant="outline"
              className="ml-1.5 font-normal tabular-nums"
            >
              {historyRows.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <RegistrationTable rows={activeRows} kind="active" />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <RegistrationTable rows={historyRows} kind="history" />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function RegistrationTable({
  rows,
  kind,
}: {
  rows: Registration[];
  kind: "active" | "history";
}) {
  const router = useRouter();
  const rates = useRates();
  const now = useNow(30_000);

  if (rows.length === 0) {
    return (
      <EmptyState icon={<Inbox />}>
        {kind === "active" ? t.noActiveCars : t.noHistory}
      </EmptyState>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <Th>{t.plate}</Th>
            <Th>{t.owner}</Th>
            <Th className="hidden md:table-cell">{t.phone}</Th>
            <Th>
              {t.kassa} / {t.spot}
            </Th>
            <Th className="hidden sm:table-cell">{t.entryTime}</Th>
            {kind === "history" && (
              <Th className="hidden lg:table-cell">{t.exitTime}</Th>
            )}
            <Th>{t.duration}</Th>
            <Th align="right">
              {kind === "active" ? t.currentBill : t.payment}
            </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const kassa = getKassa(r.spotKassaId)!;
            const group = getGroupForSpot(kassa, r.spotNumber)!;
            const tone = toneClasses[group.tone];
            const refEnd = r.exitedAt ?? now;
            const bill = calculateBill(group.id, r.enteredAt, refEnd, rates);
            return (
              <tr
                key={r.id}
                onClick={() => router.push(`/cars/${r.id}`)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <Td>
                  <span className="font-mono uppercase tabular-nums tracking-wide text-foreground">
                    {r.plate}
                  </span>
                </Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        tone.dot
                      )}
                    />
                    {r.owner}
                  </span>
                </Td>
                <Td className="hidden text-muted-foreground md:table-cell">
                  {r.phone || "—"}
                </Td>
                <Td>
                  <span className="tabular-nums">
                    {kassa.name} · {r.spotNumber}
                  </span>
                </Td>
                <Td className="hidden tabular-nums sm:table-cell">
                  {formatTime(r.enteredAt)}
                </Td>
                {kind === "history" && (
                  <Td className="hidden tabular-nums lg:table-cell">
                    {r.exitedAt ? formatTime(r.exitedAt) : "—"}
                  </Td>
                )}
                <Td>
                  {kind === "active" ? (
                    <LiveDuration
                      from={r.enteredAt}
                      className="text-muted-foreground"
                    />
                  ) : (
                    <span className="tabular-nums text-muted-foreground">
                      {formatDuration(r.enteredAt, r.exitedAt!)}
                    </span>
                  )}
                </Td>
                <Td align="right">
                  <span className="font-medium tabular-nums text-foreground">
                    {formatUzs(bill)} {t.uzs}
                  </span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align,
  className,
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 font-medium",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  className,
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 align-middle",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}
