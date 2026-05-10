"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Car, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { getAllKassas } from "@/data/market";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function Sidebar() {
  const pathname = usePathname();
  const kassas = getAllKassas();

  const items: NavItem[] = [
    {
      href: "/",
      label: t.dashboard,
      icon: <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />,
    },
    ...kassas.map((k) => ({
      href: `/kassa/${k.id}`,
      label: k.name,
      icon: <Building2 className="h-4 w-4" strokeWidth={1.5} />,
    })),
    {
      href: "/cars",
      label: t.cars,
      icon: <Car className="h-4 w-4" strokeWidth={1.5} />,
    },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {t.sector}
          </div>
          <div className="mt-1 text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.marketName}
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
