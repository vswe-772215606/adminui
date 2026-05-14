"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Car,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { getAllKassas } from "@/data/market";
import { useAuth } from "@/lib/auth-store";
import { useUi } from "@/lib/ui-store";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function useNavItems(): NavItem[] {
  const kassas = getAllKassas();
  const iconProps = { className: "size-4 shrink-0", strokeWidth: 1.75 } as const;
  return [
    { href: "/", label: t.dashboard, icon: <LayoutGrid {...iconProps} /> },
    ...kassas.map((k) => ({
      href: `/kassa/${k.id}`,
      label: k.name,
      icon: <Building2 {...iconProps} />,
    })),
    { href: "/cars", label: t.cars, icon: <Car {...iconProps} /> },
    { href: "/reports", label: t.reports, icon: <BarChart3 {...iconProps} /> },
    { href: "/settings", label: t.settings, icon: <Settings {...iconProps} /> },
  ];
}

function isItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Shared sidebar content — used by the desktop rail and the mobile drawer. */
export function SidebarBody({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = useNavItems();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-sidebar-border py-3.5",
          collapsed ? "justify-center px-2" : "px-3"
        )}
      >
        {!collapsed && (
          <div className="min-w-0 flex-1 pl-1.5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.marketName}
            </div>
            <div className="truncate font-heading text-sm font-semibold tracking-tight text-foreground">
              {t.marketCity}
            </div>
          </div>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label={collapsed ? t.expandSidebar : t.collapseSidebar}
            title={collapsed ? t.expandSidebar : t.collapseSidebar}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isItemActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    collapsed
                      ? "justify-center p-2.5"
                      : "gap-2.5 px-2.5 py-2",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.logout}
            title={`${user ?? ""} — ${t.logout}`}
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            className="mx-auto flex"
          >
            <LogOut />
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {t.username}
              </div>
              <div className="truncate text-sm font-medium text-foreground">
                {user ?? "—"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t.logout}
              title={t.logout}
              onClick={() => {
                onNavigate?.();
                logout();
              }}
            >
              <LogOut />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Static desktop sidebar rail — collapsible. */
export function Sidebar() {
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const toggleSidebar = useUi((s) => s.toggleSidebar);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:block",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <SidebarBody collapsed={collapsed} onToggle={toggleSidebar} />
    </aside>
  );
}
