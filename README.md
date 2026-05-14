# Авто бозор — Бошқарув

Standalone admin UI for the Kokand car market with two cashier zones
(1-КАССА, 2-КАССА). Faithful visual layout of the physical lot: register
and check out cars, track active/historical registrations, view finance
reports. Digitises a previously fully-manual workflow. All state in
`localStorage`, no backend.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
shadcn/ui · Zustand (with `persist`) · next-themes · date-fns · lucide-react.

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. Sign in with the demo credentials
`admin` / `admin`.

## Build

```bash
pnpm build
pnpm start
```

## Deploy to Vercel

1. Push this repo to GitHub:
   ```bash
   git push -u origin main
   ```
2. On <https://vercel.com>, "Add new project" → import the repo.
3. Framework preset: **Next.js** (auto-detected). Defaults work.
4. Click **Deploy**.

No environment variables are required — all data is hardcoded.

## Structure

```
app/
  login/page.tsx            # Auth screen (mock)
  page.tsx                  # Dashboard
  kassa/[id]/page.tsx       # Spot grid for a single kassa
  cars/page.tsx             # Active / History tabs
  cars/[id]/page.tsx        # Car detail + real-time timer
  reports/page.tsx          # Finance reports
  settings/page.tsx         # Editable rates + appearance
components/
  layout/                   # app-frame, sidebar, page-shell (template primitives)
  auth/login-view.tsx
  grid/                     # spot-grid, spot, group-band
  dialogs/                  # register-car, checkout
  charts/donut.tsx
  dashboard.tsx, cars-view.tsx, car-detail-view.tsx,
  reports-view.tsx, settings-view.tsx, live-duration.tsx, hydration.tsx
  ui/                       # shadcn components
data/
  market.ts                 # Sectors, kassas, groups, band/row pattern
lib/
  store.ts                  # Registrations — Zustand + localStorage persist
  settings-store.ts         # Editable per-group rates + useRates()
  auth-store.ts             # Mock session
  pricing.ts                # Default hourly rates, calculateBill
  finance.ts                # Period aggregation for reports
  use-now.ts                # Shared-interval live clock hook
  i18n.ts                   # Uzbek (Cyrillic) string constants
  format.ts                 # UZS / time / duration / clock formatters
  tones.ts, utils.ts
```

## Adjusting the data

- **Pricing** — default rates live in `lib/pricing.ts` (`hourlyRateUzs`);
  they are editable at runtime on the Settings page (persisted per browser).
- **Adding/removing groups or kassas** — edit `data/market.ts`. Group
  boundaries should align with band boundaries for the cleanest visual.

## State persistence

`localStorage` keys: `car-market-admin/v1` (registrations),
`car-market-admin/settings/v1` (rates), `car-market-admin/auth/v1` (session).
To wipe data during testing: DevTools → Application → Local Storage.
