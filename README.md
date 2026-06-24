# Status Report Tracker

A frontend-only web app for tracking internal status reports across three entities — **Users**,
**Projects**, and **Status Reports** — with full CRUD, a dashboard, report filtering, validation, and
referential integrity. There is no backend: all data lives in the browser's `localStorage` and is
seeded with sample data on first load.

## Engineering audit

> **One-shot vs full lifecycle — both score 86.** The table below is the **one-shot implementation**
> (commit `6711bb3`: post-plan/ADRs, pre-review-polish). The **final lifecycle product** (merged PR,
> commit `0c1e4f6` — README rewrite, CHANGELOG, +tests, doc comments) independently scores the **same 86**
> ([`.assessment/report-final.md`](.assessment/report-final.md)): the polish landed in categories already
> at the ceiling (engineering discipline 5/5, implementation 5/5) or capped by CI (test strategy 3/5 —
> tests still aren't wired into CI), so it improved the product without moving the score. The standards'
> discipline + architecture gains were banked at _plan_ time, which is why the pre-polish snapshot already
> scored 86.

Standardized 9-category engineering-quality audit (codebase-audit rubric v1.0.0).

**Methodology & evidence:**

- [`.assessment/report.md`](.assessment/report.md) — full report, **one-shot** snapshot (`6711bb3`)
- [`.assessment/report-final.md`](.assessment/report-final.md) — full report, **full-lifecycle** product (`0c1e4f6`)
- [`.assessment/METHODOLOGY.md`](.assessment/METHODOLOGY.md) — how scoring works (categories, weights, caps, evidence rules)
- [`.assessment/rubric.yml`](.assessment/rubric.yml) — canonical rubric (weights, score caps, bands)
- [`.assessment/categories/`](.assessment/categories) — per-category scores with cited `file:line` evidence
- [`.assessment/report.json`](.assessment/report.json) — machine-readable output

**Overall: 86 / 100 — _strong_foundation_** · confidence: medium · build time: **57m 24s**

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

## How the three arms compared

Same spec, three build approaches, scored on the same codebase-audit 9-category rubric (one-shot states;
this dynamo arm at its pre-polish commit `6711bb3`). Build time = the agent's wall-clock for the whole session.

| Arm                                                | Build time  | Overall | Band                   |
| -------------------------------------------------- | :---------: | :-----: | ---------------------- |
| greenfield — empty repo, agent picks stack (React) |   15m 29s   |   62    | functional w/ weakness |
| template — house template, no org standards        |   20m 17s   |   68    | functional w/ weakness |
| **dynamo** — template + standards + full lifecycle | **57m 24s** | **86**  | strong foundation      |

| Category (weight)                   | greenfield | template | dynamo |
| ----------------------------------- | :--------: | :------: | :----: |
| 01 Architectural coherence (15)     |     4      |    4     |   5    |
| 02 Implementation quality (15)      |     4      |    4     |   5    |
| 03 Operational readiness (15)       |     2      |    3     |   4    |
| 04 Type safety & contracts (10)     |     3      |    4     |   4    |
| 05 Test strategy (10)               |     3      |    3     |   3    |
| 06 Scalability & extensibility (10) |     3      |    3     |   4    |
| 07 Security & failure handling (10) |     3      |    3     |   4    |
| 08 Engineering discipline (10)      |     2      |    3     |   5    |
| 09 Technical debt & risk (5)        |     4      |    3     |   4    |

**Takeaway:** the house template adds +6 over greenfield (infrastructure + type discipline); the org
standards + lifecycle add +18 more — concentrated in engineering discipline (plan, ADRs, conventional
commits) and architectural coherence — but at ~3.7× the build time. Test strategy scored 3 for all three
(none wired tests into CI). This arm's 57m covers the full lifecycle; its 86 is the one-shot snapshot score.

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
