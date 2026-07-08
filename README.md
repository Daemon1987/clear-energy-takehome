# Clear Energy — 3-App Take-Home

Three Expo (React Native) apps — **Customer**, **Driver**, **Admin Mobile** — sharing one
package (`@clear-energy/shared`) for types, the API client, design tokens, and the
`<OrderCard />` component. One screen per app, four states each
(loading / empty / error / success).

```
clear-energy-takehome/
├── apps/
│   ├── customer/        # "Today's Orders"    (GET /orders?customerId=c-001)
│   ├── driver/          # "Today's Trip"      (GET /trips?driverId=d-101)
│   └── admin-mobile/    # "Pending Actions"   (GET /pending-actions?adminId=a-201)
├── packages/
│   └── shared/
│       ├── src/types/       # API types, single source of truth (derived from openapi.yaml)
│       ├── src/api/         # createApiClient — typed fetch wrapper + tests
│       ├── src/components/  # OrderCard, Chip, Loading/Empty/Error views, theme tokens
│       ├── src/adapters/    # Order/TripStop/PendingAction → OrderCardProps mappers
│       └── src/utils/       # formatPaise (Indian grouping) + tests
├── mock-api.json
└── README.md
```

## Setup

```bash
npm install                 # once, at the repo root (npm workspaces)
npm run api                 # terminal 1 — json-server on :4000
npm run customer            # terminal 2 — Expo dev server (also: driver / admin)
npm test                    # vitest — 11 tests in packages/shared
```

Android emulator reaches the mock API via `10.0.2.2:4000` automatically
(`apps/*/src/config.ts`). Physical device: `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000`.
If Expo flags version mismatches on first run, `npx expo install --fix` inside the app.

## Tech choices, justified

- **npm workspaces, no Turborepo/Nx.** Three apps + one package with no build step and
  no task graph worth caching — a monorepo tool would be tooling for its own sake at this
  size. Metro is monorepo-aware via each app's `metro.config.js` (workspace `watchFolders`
  + hoisted `nodeModulesPaths`), so editing `packages/shared` hot-reloads all three apps.
  I'd reach for Turborepo when CI needs caching or a shared package gains a build step.
- **Shared package is consumed as TypeScript source** (`main: src/index.ts`). Metro
  compiles it per-app; no dist/ to keep in sync, and a field added to `Order` propagates
  to all three apps on save.
- **Fetch wrapper over axios.** No dependency needed for four requirements: typed errors
  (`ApiError` with `kind: network | http | abort | parse` + `userMessage` copy), abort on
  unmount (React Query's per-query `AbortSignal` is passed through), request timeout, and
  an `Idempotency-Key` header wired on every non-GET so Phase 2/3 writes are retry-safe
  by default. Retries live in React Query, configured to skip 4xx.
- **One `<OrderCard />`, three contexts.** The card's props are deliberately
  context-free (title / subtitle / meta / amount / statusChip / accessoryChip + `leading`
  and `footer` slots). Per-context mapping lives in shared **adapters**
  (`orderToCard`, `tripStopToCard`, `pendingActionToCard`), so customer/driver/admin
  concerns never leak into the component, and any new context is a new adapter, not a
  card fork. Driver's stop-sequence bubble goes in via the `leading` slot.
- **React Query** for server state (per the brief's preference): caching, retry policy,
  pull-to-refresh via `refetch`, abort-on-unmount for free. No extra local-state library —
  nothing here needs one.
- **`formatPaise` is hand-rolled** rather than `Intl.NumberFormat('en-IN')` because
  Hermes' Intl coverage varies across Expo versions; the manual version is deterministic
  on every device and unit-tested (`₹1,23,456` grouping, paise decimals, negatives, NaN).

## Ambiguities → defaults chosen (per §11)

- `GET /trips` returns a flat stop array in `mock-api.json` (no trip wrapper) — typed it
  as `TripStop[]` to match the actual mock rather than inventing a `Trip` envelope.
- Hardcoded IDs (`c-001`, `d-101`, `a-201`) sent as an `X-User-Id` header, per the
  "assume hardcoded userId in headers" scope note.
- Sorting: driver stops by `seq`; admin queue by SLA-breach risk (breached → high → med
  → low, then oldest first), matching the spec's "sorted by SLA-breach risk".

## What I cut (and would add with more time)

- **Cut:** auth, writes, pagination UI, Detox/E2E, iOS pixel polish, Hindi — all
  explicitly out of scope.
- **Next:** generate types from `openapi.yaml` (openapi-typescript) instead of
  hand-deriving; a shared `useApiQuery` hook to collapse the per-screen React Query
  boilerplate; component tests for OrderCard via RN Testing Library; ESLint + CI running
  typecheck/test per workspace; order-detail navigation (types are ready for it).

## AI usage (per §6)

- **Tool:** Claude (Anthropic), via the Claude desktop app, as pair-programmer.
- **Scope:** scaffolding all workspaces; first drafts of `packages/shared` (types, API
  client, OrderCard, adapters, formatPaise + tests) and the three screens; this README's
  structure.
- **Accepted vs edited:** architecture decisions (adapters over a `variant` prop,
  fetch over axios, npm workspaces over Turborepo) were reviewed and kept; I verified the
  test suite (11 passing) and API behavior against `mock-api.json` before accepting.
- **Discarded:** an Intl-based money formatter (Hermes portability concern).
- Commits carry `AI-Tool` / `AI-Scope` trailers where >30% of lines were AI-generated.

## Actual hours

~X.X hours total (fill in honestly: setup + review + fixes).
