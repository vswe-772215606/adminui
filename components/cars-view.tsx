"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/use-now";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useStore,
  getActive,
  getHistory,
  type Registration,
} from "@/lib/store";
import {
  formatTime,
  formatDuration,
  formatUzs,
} from "@/lib/format";
import { calculateBill } from "@/lib/pricing";
import {
  getAllKassas,
  getGroupForSpot,
  getKassa,
  type KassaId,
} from "@/data/market";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SpotDetailDialog } from "@/components/dialogs/spot-detail";

type KassaFilter = "all" | KassaId;

export function CarsView() {
  const registrations = useStore((s) => s.registrations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const kassas = getAllKassas();

  const [filter, setFilter] = useState<KassaFilter>("all");
  const [selected, setSelected] = useState<Registration | null>(null);
  const now = useNow(30_000);

  const active = useMemo(
    () => (hasHydrated ? getActive(registrations) : []),
    [registrations, hasHydrated]
  );
  const history = useMemo(
    () => (hasHydrated ? getHistory(registrations) : []),
    [registrations, hasHydrated]
  );

  function applyFilter(list: Registration[]) {
    const filtered =
      filter === "all" ? list : list.filter((r) => r.spotKassaId === filter);
    return [...filtered].sort((a, b) => b.enteredAt - a.enteredAt);
  }

  return (
    <div className="px-8 py-6 max-w-[1400px]">
      <header className="flex items-end justify-between gap-6 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {t.cars}
          </div>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.marketName}
          </h1>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {t.allKassas}
          </FilterButton>
          {kassas.map((k) => (
            <FilterButton
              key={k.id}
              active={filter === k.id}
              onClick={() => setFilter(k.id)}
            >
              {k.name}
            </FilterButton>
          ))}
        </div>
      </header>

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">
            {t.active}
            <Badge variant="outline" className="ml-2 font-normal tabular-nums">
              {applyFilter(active).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            {t.history}
            <Badge variant="outline" className="ml-2 font-normal tabular-nums">
              {applyFilter(history).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <RegistrationTable
            rows={applyFilter(active)}
            kind="active"
            now={now}
            onRowClick={setSelected}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <RegistrationTable
            rows={applyFilter(history)}
            kind="history"
            now={now}
            onRowClick={setSelected}
          />
        </TabsContent>
      </Tabs>

      <SpotDetailDialog
        registration={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      )}
    >
      {children}
    </button>
  );
}

type TableProps = {
  rows: Registration[];
  kind: "active" | "history";
  now: number;
  onRowClick: (r: Registration) => void;
};

function RegistrationTable({ rows, kind, now, onRowClick }: TableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 px-4 py-12 text-center text-sm text-zinc-500">
        {kind === "active" ? t.noActiveCars : t.noHistory}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900/40">
          <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <Th>{t.plate}</Th>
            <Th>{t.owner}</Th>
            <Th>{t.phone}</Th>
            <Th>{t.kassa} / {t.spot}</Th>
            <Th>{t.entryTime}</Th>
            {kind === "history" && <Th>{t.exitTime}</Th>}
            <Th>{t.duration}</Th>
            <Th align="right">{kind === "active" ? t.currentBill : t.payment}</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((r) => {
            const kassa = getKassa(r.spotKassaId)!;
            const group = getGroupForSpot(kassa, r.spotNumber)!;
            const referenceEnd = r.exitedAt ?? now;
            const bill = calculateBill(group.id, r.enteredAt, referenceEnd);
            return (
              <tr
                key={r.id}
                onClick={() => onRowClick(r)}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 cursor-pointer"
              >
                <Td>
                  <span className="font-mono uppercase tabular-nums tracking-wide text-zinc-900 dark:text-zinc-50">
                    {r.plate}
                  </span>
                </Td>
                <Td>{r.owner}</Td>
                <Td className="text-zinc-500">{r.phone || "—"}</Td>
                <Td>
                  <span className="tabular-nums">
                    {kassa.name} · {r.spotNumber}
                  </span>
                </Td>
                <Td>
                  <span className="tabular-nums">{formatTime(r.enteredAt)}</span>
                </Td>
                {kind === "history" && (
                  <Td>
                    <span className="tabular-nums">
                      {r.exitedAt ? formatTime(r.exitedAt) : "—"}
                    </span>
                  </Td>
                )}
                <Td>
                  <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatDuration(r.enteredAt, referenceEnd)}
                  </span>
                </Td>
                <Td align="right">
                  <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-50">
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
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 font-medium",
        align === "right" ? "text-right" : ""
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
        "px-3 py-2 align-middle",
        align === "right" ? "text-right" : "",
        className
      )}
    >
      {children}
    </td>
  );
}
