# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This project uses **Next.js 16.2.6 with React 19** — a version with breaking changes from older Next.js. Per `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` before writing routing, server-component, or config code. Do not assume training-data conventions hold.

## Commands

```
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (eslint-config-next)
```

There is no test suite.

## What this is

An admin panel for a car market / parking lot ("Авто бозор"). The entire UI is in **Uzbek Cyrillic** — all user-facing strings live in `lib/i18n.ts` as the `t` object; never hardcode display text, add a key there.

Routes (App Router, `app/`): `/login`, `/` dashboard, `/cars` list, `/cars/[id]` car detail, `/kassa/[id]` spot grid, `/reports` finance, `/settings`.

The app digitises a previously-manual workflow: register a car onto a spot → it shows as active with a live-ticking bill → check it out (collects payment) → it moves to history and feeds reports.

## Architecture

**App shell & auth.** `app/layout.tsx` wraps everything in `ThemeProvider` (next-themes) + `<AppFrame>`. `AppFrame` (`components/layout/app-frame.tsx`) gates every route behind mock auth (`lib/auth-store.ts`, demo creds `admin`/`admin`) — unauthenticated users are redirected to `/login`, which renders chrome-free. It also owns the responsive sidebar: a static rail on `lg+`, a `Sheet` drawer on mobile (both render `SidebarBody` from `sidebar.tsx`).

**Consistent page template.** Every page composes primitives from `components/layout/page-shell.tsx` — `PageShell` (max-width + responsive padding), `PageHeader` (icon + eyebrow + title + actions), `Stat`/`StatGroup`, `SegmentedControl`, `EmptyState`, `SectionTitle`. Don't hand-roll page headers or filter button groups; extend these.

**Three persisted zustand stores**, all with `skipHydration` + rehydrated together by `<Hydration />`: `store.ts` (registrations), `settings-store.ts` (editable per-group `rates` + `useRates()` hook), `auth-store.ts` (session). `pricing.ts`/`finance.ts` take an optional `rates` arg defaulting to `hourlyRateUzs`; components pass `useRates()` so edited rates flow through bills everywhere.

**Static topology vs. dynamic state.** The physical market layout is hardcoded in `data/market.ts`: a `Market` → `Sector` → `Kassa` → `Band` → `Row` → cells tree. Spot numbers are not stored — they are *derived* by `computeBands(kassa)`, which walks bands/rows/cells assigning sequential numbers. Anything needing a spot's number, group, or position must go through `computeBands`, `getGroupForSpot`, `getKassa`, etc. Two kassas exist (`kassa-1`, `kassa-2`); groups (`biznes`, `lacetti`, ...) own contiguous `spotRange`s.

**Registrations live in Zustand** (`lib/store.ts`), persisted to `localStorage` under key `car-market-admin/v1`. A `Registration` ties a plate to a `spotKassaId` + `spotNumber`; `exitedAt === undefined` means active. Selector helpers (`getActiveBySpot`, `getActive`, `getHistory`) are exported alongside the store — use them rather than filtering inline.

**Hydration is manual.** The store sets `skipHydration: true`. The `<Hydration />` component (mounted in `app/layout.tsx`) calls `useStore.persist.rehydrate()` in an effect, and `hasHydrated` flips true via `onRehydrateStorage`. Components that read `registrations` must gate on `hasHydrated` to avoid SSR/client mismatch.

**Pricing is fully derived, never stored.** `lib/pricing.ts` computes bills from group + entry/exit timestamps (hourly rates per group, min 1 hour, `Math.ceil`). `lib/finance.ts` builds on it: `computeFinance` turns a `Registration` into a `RegistrationFinance` (resolving group/kassa), and `totalsOf` / `groupBy` / `inPeriod` aggregate for the reports page. For active cars, "now" is used as the exit time.

**Live timers without hydration mismatch.** `lib/use-now.ts` (`useNow`) is a `useSyncExternalStore` hook with per-interval shared `setInterval` buckets. Its `getServerSnapshot` returns `0`, so SSR and first client render agree — callers treat `0` as "not yet known". `components/live-duration.tsx` (`LiveDuration`) wraps it for ticking elapsed counters. Convention: grid tiles tick coarse (60s), lists 30s, the car-detail hero and checkout dialog tick every second (`useNow(1000)`).

**Styling.** Tailwind v4 (`@tailwindcss/postcss`, config in `app/globals.css`). shadcn-style primitives in `components/ui/`.

Colour is fully token-driven — **never write raw palette classes (`amber-500`, `emerald-600`) or `dark:` colour variants in feature code.** Every colour is a CSS variable in `app/globals.css` with light + dark values, registered in `@theme inline`:
- *Semantic states* — `success` (free/paid), `warning` (occupied/pending), `danger` (overdue). Use as Tailwind tokens with opacity modifiers: `bg-warning/10 text-warning border-warning/30`. For charts/SVG/inline styles use `stateColor` from `lib/tones.ts` (CSS-var refs).
- *Categorical group tones* — one `--tone-*` per car group. `lib/tones.ts` exposes `toneClasses` (uniform literal class bundles — Tailwind needs literals) and `toneColor` (var refs for charts). Adding a tone = add the CSS vars + `@theme` mapping + a `toneClasses`/`toneColor` entry, all following the existing pattern.

Radius scale: `rounded-xl` cards/dialogs/sheets/popovers, `rounded-lg` buttons/inputs/tiles/segmented, `rounded-md` small inner bits, `rounded-full` dots/pills — all derive from `--radius`.

**State libraries:** `zustand` for app state, `next-themes` for dark mode, `sonner` for toasts (`<Toaster />` in layout), `base-ui` + `lucide-react` for primitives/icons.
