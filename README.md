# Status Report Tracker

A frontend-only web app for tracking internal status reports across three entities — **Users**,
**Projects**, and **Status Reports** — with full CRUD, a dashboard, report filtering, validation, and
referential integrity. There is no backend: all data lives in the browser's `localStorage` and is
seeded with sample data on first load.

## Engineering audit

> **Snapshot:** this audit scores the **one-shot implementation** (commit `6711bb3`) — after the upfront
> plan + ADRs but before the lifecycle's review polish (extra tests, this README rewrite, CHANGELOG, doc
> comments). Scored at that point for a fair one-shot comparison; the final lifecycle state scores higher.

Standardized 9-category engineering-quality audit (codebase-audit rubric). Full report:
[`.assessment/report.md`](.assessment/report.md).

**Overall: 86 / 100 — _strong_foundation_** · confidence: medium

| Category (weight)                   | Score |
| ----------------------------------- | :---: |
| 01 Architectural coherence (15)     |  5/5  |
| 02 Implementation quality (15)      |  5/5  |
| 03 Operational readiness (15)       |  4/5  |
| 04 Type safety & contracts (10)     |  4/5  |
| 05 Test strategy (10)               |  3/5  |
| 06 Scalability & extensibility (10) |  4/5  |
| 07 Security & failure handling (10) |  4/5  |
| 08 Engineering discipline (10)      |  5/5  |
| 09 Technical debt & risk (5)        |  4/5  |

**Strengths:** pure/reactive architectural split (side-effect-free `operations.ts` isolated from the
`$state`/localStorage shell, so domain rules are unit-testable in node); an unusually complete
engineering-discipline trail for an MVP (committed Plan Artifact + recorded plan-auditor verdict, two
cross-linked ADRs, conventional issue-referenced commits, husky + lint-staged + Dependabot); clean deploy
path and secret hygiene.

**Risks:** tests not wired into CI; README/code drift (expected at this pre-polish snapshot — fixed later
in the lifecycle); no observability surface (frontend-only).

Verification at audit time: `check` ✓ · `lint` ✓ · `test` ✓ (33 tests).

This started from Dynamo's internal-webapp template; the template's Supabase auth shell and SSR wiring
were removed for this MVP (it needs no auth, backend, or database). The deployment infra under `infra/`
ships with the template and is unused by this app.

## Tech Stack

- **SvelteKit** with **Svelte 5** (runes mode — `$state` / `$derived` / `$effect`)
- **TypeScript** (strict)
- **Tailwind CSS 4** (CSS-first config) with dark mode and Dynamo branding
- **shadcn-svelte** UI components in `$lib/components/ui/`
- **Vitest** for unit tests
- **adapter-node** for the build

No backend, auth, or database. The app renders client-side (`ssr = false`); persistence is `localStorage`.

## Install

Requires Node ≥ 24.

```bash
npm install
```

No environment variables or secrets are required — the app is frontend-only.

## Run

```bash
npm run dev      # start the dev server (http://localhost:5173)
```

On first load the app seeds a sample dataset. Use **Reset to seed data** / **Clear all data** on the
dashboard to manage the local data; clearing the browser's `srt:data` localStorage key also resets it.

## Build

```bash
npm run build    # production build (adapter-node, output in build/)
npm run preview  # preview the production build
```

## Test

```bash
npm run test     # run the Vitest suite
npm run check    # type-check with svelte-check
npm run lint     # prettier --check + eslint
```

## Layout

```
src/
  routes/
    +layout.ts              # ssr = false (client-only app)
    (app)/
      +layout.svelte        # app shell (sidebar + topbar) + flash messages
      dashboard/+page.svelte
      users/    (+page, new, [id], [id]/edit)
      projects/ (+page, new, [id], [id]/edit)
      reports/  (+page, new, [id], [id]/edit)
  lib/
    types.ts                # domain types + persistence contract
    validation.ts           # field-level validators
    flash.svelte.ts         # transient success/error messages
    data/
      operations.ts         # pure CRUD + referential-integrity rules + dashboard stats
      seed.ts               # sample dataset (cross-referenced, clock-injected)
      store.svelte.ts       # reactive $state store; localStorage hydrate/persist
    components/             # StatusBadge, KpiCard, EmptyState, DeleteButton, forms/
    config/navigation.ts    # sidebar navigation
```

## How it works

- **Persistence** — the whole dataset is one JSON blob under the `srt:data` localStorage key, seeded on
  first load (see `decisions/001-srt-localstorage-schema.md`).
- **Referential integrity** — a user or project still referenced by a report (or, for a user, still
  owning a project) cannot be deleted; the app explains what to remove first (see
  `decisions/002-srt-referential-integrity.md`).
- **Architecture** — domain rules live in plain TypeScript (`lib/data/operations.ts`, `lib/data/seed.ts`)
  so they're unit-testable without a DOM; `store.svelte.ts` is a thin reactive wrapper that persists.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Production build             |
| `npm run preview` | Preview the production build |
| `npm run check`   | Type-check with svelte-check |
| `npm run test`    | Run the Vitest suite         |
| `npm run lint`    | Prettier check + ESLint      |
| `npm run format`  | Format with Prettier         |
