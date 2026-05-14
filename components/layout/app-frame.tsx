"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Sidebar, SidebarBody } from "./sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

/**
 * Application shell: gates every route behind mock auth and renders the
 * responsive sidebar (static rail on desktop, drawer on mobile).
 */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hasHydrated = useAuth((s) => s.hasHydrated);
  const [navOpen, setNavOpen] = useState(false);

  const isLogin = pathname === "/login";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user && !isLogin) router.replace("/login");
    if (user && isLogin) router.replace("/");
  }, [hasHydrated, user, isLogin, router]);

  // The login route renders without app chrome.
  if (isLogin) return <>{children}</>;

  // Avoid a flash of protected content before auth is known / redirect lands.
  if (!hasHydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Mobile drawer */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">{t.menu}</SheetTitle>
          <SidebarBody onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t.menu}
            onClick={() => setNavOpen(true)}
          >
            <Menu />
          </Button>
          <div className="min-w-0">
            <div className="font-heading text-sm font-semibold tracking-tight text-foreground">
              {t.marketName}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
