# Plan: 9 Status Report Tracker MVP (frontend-only)

## Work Item

- **Id:** #9 — resolved via the GitHub `gh` binding (`gh issue view 9`).
- **Title:** Status Report Tracker MVP (frontend-only)
- **URL:** https://github.com/duanamo/srt-dynamo/issues/9
- **Type:** Feature (`enhancement`). Posture: full lifecycle (non-trivial).

## Goal

A frontend-only SvelteKit MVP for tracking internal status reports across three entities — **Users**,
**Projects**, **Status Reports** — with full CRUD, a dashboard, report filtering, validation, and
referential integrity. All data lives in `localStorage` under one key (`srt:data`); there is no
backend, auth, or database.

## Non-goals

- No authentication, backend service, or real database (the scaffold's Supabase/auth shell is disabled, not configured).
- No multi-user sync, no server persistence, no migrations.
- No state-management library, no new UI kit, no new test framework.
- No over-engineered service/repository/factory layers.

## Current State

The repo is a scaffolded SvelteKit (Svelte 5 runes) + TS template with a Supabase auth shell that the
MVP must bypass:

- `src/hooks.server.ts` — **throws at startup** when `PUBLIC_SUPABASE_*` env vars are missing, and builds a Supabase server client + `safeGetSession()`.
- `src/routes/+layout.server.ts` / `+layout.ts` — load the session and build a Supabase client from env.
- `src/routes/(app)/+layout.ts` + `+layout.server.ts` — redirect to `/login` when there is no session (guards the whole `(app)` group).
- `src/routes/login/`, `src/routes/auth/callback/` — Microsoft SSO routes.
- `src/routes/(app)/dashboard/+page.svelte` — placeholder dashboard.

The `(app)` group already provides the app shell (`Sidebar` + `TopBar` + layout); navigation is data-driven from `src/lib/config/navigation.ts`.

## Reuse & Prior Art

Checked the codebase first — this MVP builds on substantial existing scaffolding rather than starting fresh:

- **UI primitives — reuse, do not build.** `$lib/components/ui/` already vendors shadcn-svelte: `button`, `card` (+ header/content/title/footer), `dialog`, `table`, `select`, `input`, `label`, `textarea`, `badge`, `tabs`, `dropdown-menu`, `separator`, `tooltip`, `sheet`, `command`, `input-group`. Forms reuse `input`/`label`/`textarea`/`select`/`button`; tables reuse `table`; the dashboard reuses `card`; status pills reuse `badge`; delete confirms reuse `dialog`.
- **App shell — reuse.** `src/routes/(app)/+layout.svelte` (`Sidebar` + `TopBar`) is the chrome. New sections mount under `(app)/` and inherit it. Nav items are added to `navigationConfig` (`src/lib/config/navigation.ts`, `NavItem`/`NavSection` shape) — no new nav system.
- **`cn()`** (`src/lib/utils.ts`) — class composition helper; reuse for all conditional classes.
- **Types home — follow convention.** CLAUDE.md designates `$lib/types.ts` as the hand-written types module. There is no `$lib/types.ts` yet (only the Supabase-generated `database.types.ts`, which is irrelevant here), so the domain types live in a new `$lib/types.ts`.
- **Test setup — reuse.** Vitest is configured in `vite.config.ts` (`src/**/*.{test,spec}.{js,ts}`). `src/lib/utils.test.ts` is the model: it tests _behavior_, not "does it render." Domain logic goes in pure TS modules so tests need no component renderer or jsdom.
- **Styling/design system — reuse.** Tailwind 4 tokens in `src/app.css`, brand primary `#fe4e51`, semantic colors, badge variants, Lucide icons (`@lucide/svelte`).

Would be duplicated if written fresh and therefore avoided: a UI component kit, the layout shell, the nav system, a test harness, a class-merge helper.

## Proposed Approach

### Disable the auth/SSR shell (bypass, don't configure Supabase)

The Supabase shell is load-bearing across ~8 files; the teardown must be complete and atomic or `npm run check` (an acceptance criterion) and the boot path break. **This removal is deliberate and issue-driven** (issue #9 mandates frontend-only, no auth) — not an accidental security regression, despite CLAUDE.md treating the `(app)` guard as mandatory.

- Set `export const ssr = false;` in `src/routes/+layout.ts` (client-only app — correct for a localStorage-backed MVP) and drop the Supabase client creation from it (no more `{ supabase, session }` in page data).
- Delete the Supabase/auth wiring that blocks a no-env boot: `src/hooks.server.ts` (throws at startup on missing env), `src/routes/+layout.server.ts`, `src/routes/(app)/+layout.server.ts`, and the now-unreachable `src/routes/login/` and `src/routes/auth/` routes (they call `supabase.auth.*` and would fail `check` once `supabase` leaves page data).
- Remove the session guard from `src/routes/(app)/+layout.ts` (no auth → no redirect).
- **Rework `src/lib/components/layout/TopBar.svelte`** — it currently calls `$page.data.supabase.auth.signOut()` (`handleLogout`) and derives the avatar initials from `$page.data.session.user`. Both reference page data that no longer exists. Remove the logout button and the session-derived avatar (no auth → nothing to sign out of); keep the theme toggle and mobile menu.
- Simplify `src/app.d.ts` to drop the now-unused Supabase `App.Locals`/`PageData`.
- **Supabase deps:** leave `@supabase/ssr`, `@supabase/supabase-js`, and `src/lib/database.types.ts` installed but fully unwired — every importing file is deleted or rewritten, so no residual import remains (verified by `check`/`lint`). Removing the deps from `package.json` is out of scope (avoids churn) and they are simply unused.

### Data model — `$lib/types.ts`

`User`, `Project`, `StatusReport` exactly per the issue, plus the enum unions (`Role`, `ProjectStatus`, `OverallStatus`) and the persisted `AppData` shape (`{ version, users, projects, reports }`).

### Persistence + domain logic

- **Pure domain ops — `$lib/data/operations.ts`:** functions over a plain `AppData` object — `createUser/updateUser/deleteUser`, same for projects and reports, plus the referential-integrity guards. No reactivity, no `localStorage` → fully unit-testable in node without jsdom. `updatedAt` bumped on every report edit; `createdAt`/`updatedAt` set on create.
- **Referential integrity — `$lib/data/operations.ts`:** `canDeleteUser(data, id)` blocks when the user authors any report **or** owns any project; `canDeleteProject(data, id)` blocks when any report references it. Returns `{ ok, reason }` with a human message. (Contract → ADR.)
- **Seed — `$lib/data/seed.ts`:** `buildSeed(now: Date)` creates 5 users (covering all roles, incl. one owning/authoring nothing → deletable), 4 projects (one per status), ~8 reports across the current and previous calendar month, all three overall statuses, with cross-refs by real generated id. Periods are derived from the injected `now` (not an internal `new Date()`) so seed output is deterministic in tests and "Reports this period" is non-zero in the app. Ids via `crypto.randomUUID()`.
- **Clock injection (per `STYLEGUIDE.md:245` — never `new Date()` for "business now"):** a pure `periodOf(date: Date): "YYYY-MM"` and a pure `dashboardStats(data, now: Date)` live in `$lib/data/operations.ts`. The dashboard component and the seeder pass `new Date()` only at the UI/init boundary; the testable logic receives the instant explicitly, so tests freeze time.
- **Reactive store — `$lib/data/store.svelte.ts`:** a singleton `$state<AppData>` that, on the client (`browser` guard), hydrates from `localStorage['srt:data']` or seeds when empty, exposes the ops as methods that mutate state then persist, and provides `resetToSeed()` / `clearAll()`. Persistence is a single `save()` after each mutation (no `$effect.root` needed). Belt-and-suspenders: `ssr=false` **and** `browser` guard. This pure-core/reactive-shell split keeps domain logic in plain `$lib/data/` modules (not `$lib/server/`, since there is no server data) so tests import the rules without dragging in `localStorage` or a DOM.

### Validation — `$lib/validation.ts`

Pure `validateUser/validateProject/validateReport(input, data)` returning a `{ field: message }` map: required fields, email-format regex, enum membership, and referenced owner/project/author ids must exist in `data`. Forms block submit while errors exist and show messages inline.

### Routes (file-based, under `(app)/`)

Per entity (`users`, `projects`, `reports`): `+page.svelte` (list), `new/+page.svelte` (create), `[id]/+page.svelte` (detail), `[id]/edit/+page.svelte` (edit). Create/edit reuse one shared form component per entity (`$lib/components/forms/{User,Project,Report}Form.svelte`) so pages stay thin (orchestrator pattern, <150 lines). The reports list hosts the filter controls (project, author, period, overall status) driven by `$state` + `$derived`. Dashboard at `(app)/dashboard` replaces the placeholder.

### Dashboard

KPI cards (a small `$lib/components/KpiCard.svelte` wrapping `card`) for: total projects, active projects, reports this period, and Green/Yellow/Red counts — all `$derived` from `dashboardStats(store.data, new Date())`. "Reports this period" counts reports whose **`reportingPeriod`** (the report's subject month) equals the current `YYYY-MM` — explicitly not `createdAt`.

### UI/UX approach (designed against the Dynamo Design System)

Reuses the existing system rather than introducing new visuals:

- **Layout:** sidebar nav (add Users/Projects/Status Reports to `navigationConfig`); list → detail → edit flow; primary action (e.g. "New user") top-right of each list.
- **Color/state:** status shown via `badge`, never color alone — text label + semantic color (project status and Green/Yellow/Red overall status map to success/warning/error/neutral tints). Brand primary reserved for the single primary action + focus ring.
- **Copy:** sentence case, direct, no emoji (per ui-ux-conventions).
- **Feedback:** inline success/error banners after create/edit/delete; a referential-integrity block shows a clear inline message explaining why (which reports/projects reference the record). Helpful empty states with a primary "create" call to action.
- **Forms:** every control has a `<label>`; required fields marked; errors shown per field; native focus rings preserved (no `outline:none`).
- **Icons:** Lucide only.

## Files / Areas Affected

- **New:** `$lib/types.ts`; `$lib/data/{operations,seed,store.svelte}.ts`; `$lib/validation.ts`; `$lib/components/KpiCard.svelte`; `$lib/components/forms/{User,Project,Report}Form.svelte`; routes `(app)/{users,projects,reports}/...` (list/new/[id]/[id]/edit); tests `$lib/data/operations.test.ts`, `$lib/validation.test.ts`, `$lib/data/seed.test.ts`.
- **Edited:** `src/routes/+layout.ts` (ssr=false, drop Supabase); `src/routes/(app)/+layout.ts` (drop guard); `src/routes/(app)/dashboard/+page.svelte` (real dashboard); `src/lib/components/layout/TopBar.svelte` (remove logout + session avatar); `src/lib/config/navigation.ts` (add sections); `src/app.d.ts` (simplify); `CHANGELOG.md`.
- **Deleted:** `src/hooks.server.ts`; `src/routes/+layout.server.ts`; `src/routes/(app)/+layout.server.ts`; `src/routes/login/`; `src/routes/auth/`.

## Risks and Edge Cases

- **SSR/localStorage:** universal `load`/store import could evaluate server-side; mitigated by `ssr=false` + `browser` guard. Store starts empty server-side, hydrates on client.
- **Deleting the auth shell:** must remove every reference together (hooks → layout.server → app.d.ts) or type-check/boot breaks. Verified by `npm run check`.
- **Referential integrity scope:** "referenced by a report" is extended to also block deleting a user who owns a project (otherwise a project is orphaned). Documented as an ADR so the contract is explicit; seed makes both blocked and allowed cases demonstrable.
- **Reporting period boundaries:** "this period" is the system month, matched against the report's `reportingPeriod` (subject month), not `createdAt`. Per `STYLEGUIDE.md:245`, the reference instant is injected into `dashboardStats`/`periodOf`/`buildSeed` rather than read via `new Date()` internally, so the seed is deterministic and the dashboard count is testable with frozen time.
- **`crypto.randomUUID`:** available in browser and node ≥24 (repo `engines.node >=24`) — safe in app and tests; no `uuid` dependency.
- **Empty/duplicate state:** empty stores render empty states; clearing data must not crash derived dashboard counts.

## Verification Plan

- `repoCommands.verify` → `npm run check && npm run lint && npm run test`.
- Unit tests (Vitest, Node env — no jsdom) for: CRUD create/update/delete + `updatedAt` bump; validation (required, email, enum, referenced-id existence) returning a field→message map; referential-integrity deletion rule (blocked **and** allowed, for both the report-reference and project-owner edges); seed shape (role coverage, one project per status, periods, the demonstrable RI cases); `dashboardStats(data, now)` with a frozen `now` (proves "reports this period" counts by `reportingPeriod`).
- Manual smoke: dashboard counts non-zero on first load; filter reports; blocked vs allowed delete; reset/clear controls.

## Decision Check

Two contract-shaping choices warrant ADRs (Decide phase, Gate):

1. **Client persistence schema** — the `srt:data` localStorage envelope (`version` + entity arrays), the single-key strategy, id generation, and seed-on-empty behavior. Other code depends on this shape.
2. **Referential-integrity rule** — what counts as a blocking reference (report.authorId, report.projectId, project.ownerId), the block-don't-cascade decision, and the user-facing message contract.

These may be one ADR (the client data-model contract) or two. Leaning toward two small ADRs for clarity.

## Audit

<!-- dynamo-plan-audit:begin -->

**Risk tier:** normal (Audit = Checkpoint — no auth/DB/secrets/prod-infra in the end state). `plan-auditor` run 1, 2026-06-24.

**Verdict context:** The auditor's headline Blocker ("the Plan Artifact does not exist") was a false negative — subagents read committed HEAD, and the plan was still uncommitted in the working tree. The plan now ships committed on the Change Branch. Its substantive findings were grounded in the real scaffold and all are addressed below.

| #   | Sev      | Finding                                                                               | Disposition                                                                                                                                                                                              |
| --- | -------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Blocker  | Plan file not on disk (HEAD)                                                          | False negative (uncommitted). Plan committed on the Change Branch; visible to review.                                                                                                                    |
| 2   | Major    | Auth-shell removal is load-bearing across ~8 files; naive disable breaks boot/`check` | **Adopted.** Teardown set enumerated incl. the two I'd missed — `TopBar.svelte` (`signOut` + session avatar) and `app.d.ts` types. Login/auth routes deleted; deps left unwired.                         |
| 3   | Major    | SSR/`crypto`/`localStorage` mechanism must be named                                   | **Adopted.** `ssr=false` (root) + `browser` guard on all storage access; seed only client-side. node≥24 ⇒ `crypto.randomUUID` safe in app + tests.                                                       |
| 4   | Major    | Referential integrity has a 3rd edge (`Project.ownerId → User`)                       | **Already in plan; reaffirmed.** Block user deletion when author of a report **or** owner of a project; block project deletion when referenced by a report. Seed proves both blocked + allowed for each. |
| 5   | Major    | Test split insufficient; "current month" fights testability (`STYLEGUIDE.md:245`)     | **Adopted.** Pure rules over plain arrays (no `localStorage` import); clock injected into `dashboardStats`/`periodOf`/`buildSeed`.                                                                       |
| 6   | Minor    | Enumerate full route tree + nav additions                                             | Done — see Files / Areas Affected (4 routes × 3 entities + dashboard).                                                                                                                                   |
| 7   | Minor    | `/login`, `/auth/callback` become dead/broken under `check`                           | Both deleted in the teardown set.                                                                                                                                                                        |
| 8   | Minor    | `$lib/server/` convention vs. "no service layers"                                     | Resolved — pure `$lib/data/` modules (no server data ⇒ not `$lib/server/`); rationale stated.                                                                                                            |
| Q1  | Question | Remove Supabase deps or just unwire?                                                  | **Unwire** — leave deps installed but with zero residual imports; out of scope to delete.                                                                                                                |
| Q2  | Question | Validation: error map or throw?                                                       | **Field→message map** (drives the inline error UX).                                                                                                                                                      |
| Q3  | Question | "This period" by `reportingPeriod` or `createdAt`?                                    | **`reportingPeriod`** (subject month).                                                                                                                                                                   |

**Recommendation (run 1):** _Re-audit required_ — caused solely by the uncommitted file. After committing the revised plan, a confirmation re-audit is run; its verdict is appended below.

<!-- dynamo-plan-audit:end -->

## Next Steps

<!-- dynamo-plan-next:begin -->

1. **Decide (Gate):** write two ADRs under `decisions/` — (a) the `srt:data` client persistence schema, (b) the referential-integrity rule — plus the `decisions/README.md` index.
2. **Implement:** on the Change Branch `issue/9-status-report-tracker-mvp` (cut from `dev` via `/dynamo-branch 9`). Conventional commits (`feat:`/`chore:`/`docs:`/`test:`).
3. **Verify (Gate):** `npm run check && npm run lint && npm run test` (`repoCommands.verify`) — iterate to green.
4. **Review (Gate):** `/dynamo-code-review`; address blockers. (Security review not needed — no auth/DB/secrets in the end state.)
5. **Ship (Gate):** `/dynamo-merge` → squash PR, base `dev`, body `Closes #9`; update `CHANGELOG.md`.
<!-- dynamo-plan-next:end -->
