# CLAUDE.md

<!-- dynamo-standards:begin -->
@CLAUDE-DYNAMO.md
<!-- dynamo-standards:end -->

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Team coding conventions live in [`STYLEGUIDE.md`](./STYLEGUIDE.md).** Read it before non-trivial changes — it covers naming, error handling, DB conventions, accessibility, and the rationale behind rules that aren't captured by TypeScript.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
npm run preview      # Preview production build
npm run gen:types    # Regenerate Supabase types (update project ID in package.json first)
```

### Database Migrations

Schema changes go through migration files — **never modify the Supabase dashboard directly**.

```bash
# One-time setup: link your Supabase project
npx supabase link --project-ref <project-id>  # project-id = subdomain from PUBLIC_SUPABASE_URL

# 1. Create a new migration file
npx supabase migration new <descriptive_name>

# 2. Write your SQL in the generated file at supabase/migrations/<timestamp>_<name>.sql

# 3. Apply to dev database
npx supabase db push

# 4. Regenerate TypeScript types
npm run gen:types

# 5. Commit migration file + updated types together
```

Migrations are **not** applied automatically on deploy — the production deploy
workflow builds and ships the app image only. Apply schema changes deliberately
against prod with `npx supabase db push` (linked to the prod project) as a
separate, reviewed step, so a code merge never silently mutates the database.

**Row-Level Security is mandatory on every table** — auth says who is signed in,
RLS says which rows they may touch. Enable RLS in the same migration that creates
a table, with explicit policies. See `supabase/migrations/README.md` for the
convention and a copy-paste example.

## Tech Stack

- **SvelteKit** with **Svelte 5** (runes mode — use `$props()`, `$state()`, `$derived()`, `$derived.by()`, `$effect()`). **Do NOT use Svelte 4 lifecycle functions** (`onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate`) — use `$effect()` instead.
- **TypeScript** (strict)
- **Tailwind CSS 4** with class-based dark mode and CSS variable theming (CSS-first config in `src/app.css`, no `tailwind.config.js`)
- **shadcn-svelte** (Vega preset) — UI components in `$lib/components/ui/`
- **Supabase** — database, auth (EntraID/Azure OAuth), row-level security
- **Lucide Svelte** for icons
- **clsx + tailwind-merge** via `cn()` helper (`$lib/utils.ts`)

## Code Architecture Guidelines

### File Organization

```
Components  → HOW things look (markup + styling)
Utils       → HOW to transform data (pure functions, no side effects)
Services    → WHERE data comes from (API calls, database queries)
Config      → WHAT the constants are (navigation items, feature flags)
```

- `$lib/components/ui/` — shadcn-svelte components (button, badge, card, table, dialog, etc.)
- `$lib/components/` — Svelte components, organized by feature (`layout/`, `dashboard/`, `charts/`)
- `$lib/utils/` — Pure utility functions (formatting, math, transformations)
- `$lib/server/` — Server-only code (API clients, database queries)
- `$lib/config/` — Static configuration (navigation, constants)

### Component Rules

- **Max ~150 lines per component.** If a component exceeds this, extract child components or move logic to utilities.
- **One responsibility per component.** If you can't describe what it does in one sentence, split it.
- **Orchestrator pattern:** Page-level components compose smaller components with props. They should not contain chart rendering logic, complex calculations, or long markup blocks.
- **Props over internal state:** Components should receive data via props and be reusable. Avoid components that fetch their own data unless they are page-level (`+page.svelte`).
- **Follow existing patterns:** Before creating a new component, check sibling components in the same directory for established patterns. Apply extraction rules upfront — don't embed logic and refactor later.

### When to Extract

| Signal                               | Extract to                        | Example                                 |
| ------------------------------------ | --------------------------------- | --------------------------------------- |
| Reused in 2+ places                  | Shared component                  | `BarChart`, `KPICard`                   |
| Data transformation > 5 lines        | Utility function in `$lib/utils/` | `formatCurrency()`, `calculateYTicks()` |
| External API call                    | Service in `$lib/server/`         | Supabase queries, API clients           |
| Component > ~150 lines               | Child components                  | Extract chart/form/table sections       |
| Business logic not tied to rendering | Utility or service                | "Is this ticket overdue?"               |

### Common Conventions

These patterns are established across Dynamo projects — use them as a starting point:

- **Charts:** Each chart type gets its own component in `$lib/components/charts/` (e.g., `BarChart.svelte`, `TimeSeriesChart.svelte`). Wrap charts in a `ChartCard` component for consistent headers.
- **Data tables:** Sortable, searchable, paginated tables go in `$lib/components/dashboard/` or a feature directory. Use `$state` for page/sort/search and `$derived` for filtered/paged results.
- **KPI cards:** Reusable `KPICard` component with `title`, `value`, `icon`, `trend` props.
- **Server data fetching:** API clients and data transforms in `$lib/server/`. Page-level `+page.server.ts` calls services, components receive data via props.
- **Utility functions:** Pure functions in `$lib/utils/` — formatting, math, transformations. Keep them small and testable.

### Code Style

- Prefer small, composable functions over large monolithic ones
- Keep derived/computed logic short — extract complex derivations into named functions
- Avoid inline SVG generation in components — extract to a chart component with props
- Use TypeScript interfaces for all component props and service return types

## Infrastructure

- **Hosting:** AWS EC2 instance, Docker, Caddy reverse proxy (auto-SSL)
- **Adapter:** `@sveltejs/adapter-node` (builds to Node.js server)
- **CI/CD:** GitHub Actions — `dev` branch deploys dev, `main` deploys prod
- **Container registry:** GitHub Container Registry (ghcr.io)
- **Environments:** Dev and Prod on same EC2 instance via Docker Compose

## Critical Patterns

### Supabase Types

`$lib/database.types.ts` is auto-generated by `npm run gen:types` — **never add custom types to this file** (they'll be overwritten). Instead, put custom type aliases and composed types in `$lib/types.ts`, which imports from `database.types.ts`:

```typescript
// $lib/types.ts — hand-written, stable across regenerations
import type { Tables, Enums } from './database.types';
export type Trip = Tables<'trips'>;
export type TripStatus = Enums<'trip_status'>;
export type TripWithRelations = Trip & { trip_destinations: TripDestination[] /* ... */ };
```

Components import from `$lib/types`, not `$lib/database.types`.

### Environment Variables

Always use `$env/dynamic/public` and `$env/dynamic/private` — NEVER `$env/static/*`. Static env vars are embedded at build time and are not available in Docker containers where env vars are provided at runtime.

EC2 env files (`.env.dev`, `.env.prod`) are written automatically from GitHub Secrets during deployment. Never edit them on the server directly — changes will be overwritten on the next deploy. To add a new env var: add it to `.env.example`, create `DEV_` and `PROD_` prefixed secrets in GitHub, and update the deploy workflow to include it.

**Local development — secrets come from 1Password, not a hand-written `.env`.** This repo ships a committed `.env.tpl` whose values are `op://Innovation/<item>/<FIELD>` references (no real secrets). To run locally:

```bash
# one-time: install + sign in
brew install 1password-cli && op signin
# run with secrets injected at runtime (nothing written to disk):
op run --env-file=.env.tpl -- npm run dev
# or materialize a gitignored .env if a tool needs a real file:
op inject -i .env.tpl -o .env
```

Each app has a 1Password **item named after the repo** in the **Innovation** vault (account `dynamotechnologies.1password.com`); field labels match the env-var names exactly. Non-secret local constants (e.g. `ORIGIN`) stay as plain literals in `.env.tpl`, not references. When scaffolding a new app from this template, create a new Innovation item and update the `<item>` segment in `.env.tpl`. **Never put the literal `op://` token in `.env.tpl` _comments_** — `op` scans the whole file and will try to parse it as a (broken) reference.

### Auth

- `hooks.server.ts` creates the Supabase server client and `safeGetSession()` helper
- `safeGetSession()` skips the `/auth/callback` path to preserve the PKCE code verifier
- `+layout.ts` uses `data.session` from the server layout — do NOT call `getSession()` on the client (causes invalidation loop)
- Auth guard lives in `(app)/+layout.ts` — redirects to `/login` if no session

### Styling

- **Tailwind CSS 4** — CSS-first config in `src/app.css` (no `tailwind.config.js`)
- Dynamo brand primary color: `#fe4e51` (red), defined as `oklch(0.637 0.237 25.331)` in CSS variables
- Dark mode via `.dark` class on `<html>`, toggled in TopBar. Uses warm gray tones (hue 90).
- `@theme` block in `app.css` defines color tokens, radii, fonts
- `:root` and `.dark` blocks define semantic CSS variables in oklch
- Use `cn()` from `$lib/utils.ts` for composing Tailwind classes
- Global cursor: pointer is set for all buttons, links, selects in `app.css`
- **shadcn-svelte** components in `$lib/components/ui/` — use these instead of hand-writing styled elements. If a shadcn-svelte component exists for a UI element but isn't installed yet, install it with `npx shadcn-svelte@latest add <component>` rather than hand-writing the markup.

## Backend Architecture

- **SvelteKit** handles all UI, SSR, auth, form actions, and API endpoints — this is the only backend
- Do not introduce additional backend services or frameworks without being asked
- If long-running background processes are needed, FastAPI is the planned approach (not yet built)

## Route Structure

- `/` redirects to `/dashboard`
- `/login` — Microsoft SSO login
- `/(app)/` — protected route group (auth guard redirects to `/login` if unauthenticated)
- All app pages live under `/(app)/`
