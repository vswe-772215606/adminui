# Авто бозор — Бошқарув

Standalone admin UI prototype for a car market with two cashier zones
(1-КАССА, 2-КАССА). Faithful visual layout of the physical lot, register and
check out cars, see active/historical registrations. All state in
`localStorage`, no backend.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
shadcn/ui · Zustand (with `persist`) · date-fns · lucide-react.

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

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
  page.tsx                  # Dashboard
  kassa/[id]/page.tsx       # Spot grid for a single kassa
  cars/page.tsx             # Active / History tabs
components/
  layout/sidebar.tsx
  grid/                     # spot-grid, spot, group-band
  dialogs/                  # register-car, spot-detail, checkout
  dashboard.tsx, cars-view.tsx, hydration.tsx
  ui/                       # shadcn components
data/
  market.ts                 # Sectors, kassas, groups, band/row pattern
lib/
  store.ts                  # Zustand store with localStorage persist
  pricing.ts                # Hourly rates per group, calculateBill
  i18n.ts                   # Uzbek (Cyrillic) string constants
  format.ts                 # UZS / time / duration formatters
  utils.ts                  # cn()
```

## Adjusting the data

- **Pricing** — edit `lib/pricing.ts` (`hourlyRateUzs` map).
- **Lacetti row layout** — `data/market.ts` currently encodes Lacetti as
  `76 + 76 + 77` (last band's tail row = 7) as a reasonable interpretation
  of the documented "6 or 7 final-row" pattern. Replace the `lacetti` band
  entries with the exact ranges from the source PDF when available.
- **Adding/removing groups or kassas** — edit `data/market.ts`. Group
  boundaries should align with band boundaries for the cleanest visual.

## State persistence

`localStorage` key: `car-market-admin/v1`. To wipe the data during testing:
DevTools → Application → Local Storage → delete the key.
