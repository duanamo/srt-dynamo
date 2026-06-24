# Team Coding Style Guide

> Adapted from the original C# / Blazor team guide for **TypeScript + SvelteKit + Supabase** projects.
> This guide covers the conventions tooling can't enforce — naming, structure, error handling, layout, and the reasoning behind each.

## Meta: How to Read This Document

This document encodes experience, not theory. If you do not understand why a guideline exists, ask.

Every rule here exists in response to real problems encountered in production systems. If the reason doesn't resonate, it likely prevents a problem you haven't yet had to deal with. Preserve good practices even when they feel unnecessary — do not remove the fence from the well because nobody fell down it.

The alternative to following this document is acquiring, firsthand, a decade of painful software experience that will eventually teach you why this document exists.

## Normative Keywords

- **MUST** — exists to prevent future problems
- **SHOULD** — exists to create future ease
- **CONSIDER** — a factor to weigh, not prescriptive

Consistency is generally better than cleverness — but it is not an absolute virtue. If breaking convention materially improves clarity or maintainability, do so deliberately.

## The Prime Directive

This style guide exists to make code easier to work with.

- **MUST** prioritize maintainability over dogma
- **SHOULD** value consistency
- **MUST** apply judgment when conventions conflict with clarity

A style guide is the beginning of wisdom, not the end.

---

## Language and Platform

- **MUST** use TypeScript in strict mode for all application code
- **MUST** write UI text, comments, and JSDoc in English
- **SHOULD** prefer ESM (`import`/`export`) — never CommonJS in app code

## Dependencies and Runtime

- **MUST** install with `npm ci` — it installs exactly what `package-lock.json` specifies and fails loudly if the lockfile is out of sync. Use `npm install <pkg>` only to add or change a dependency, and commit `package.json` and `package-lock.json` together.
- **MUST** commit `package-lock.json` — it is the source of truth for reproducible installs across dev, CI, and prod.
- **MUST** run the Node version pinned in `.nvmrc` (mirrored in `package.json` `engines` and the Docker base image). Use a version manager (`nvm`, `fnm`, `asdf`, or `mise`) so local dev matches CI and production.
- **SHOULD** track the current Node **Active LTS** line. Adopt each new Active LTS within its first 6–12 months and never let the pinned line reach security end-of-life. Avoid odd-numbered majors (never LTS) and brand-new "Current" majors in production.

## English, Punctuation, and Tone

### Periods

- **MUST** omit a trailing period for single-sentence items (UI labels, single-line comments, single-line JSDoc descriptions)
- **MUST** fully punctuate multi-sentence items, including the final sentence

### Professional Communication

Code and comments are **professional communication**.

- **MUST NOT** editorialize in comments
- **MUST NOT** comment on other developers
- Humor, if used, **MUST** be rare and in service of clarity
- Write nothing you would not want reviewed by HR

Technical rationale explaining _why_ something exists is encouraged. Comments explaining _what_ the code does are usually a smell — rename the identifier instead.

### JSDoc

- **SHOULD** use JSDoc on exported public APIs (functions, types, components)
- **SHOULD** use JSDoc on library and infrastructure code in `$lib/server/` and `$lib/utils/`
- **SHOULD NOT** allow perfectionism to block progress

Documentation is lines we must maintain. Prefer naming that removes the need for documentation.

---

## Code Structure and Control Flow

### Braces and Blocks

- **MUST** use braces for all `if`, `else`, `for`, `while` blocks, even single-line

```ts
// Never:
if (condition) doThing();

// Always:
if (condition) {
	doThing();
}
```

This form prevents easily-avoided errors when a second statement is later added to the branch.

### `if` Statements

- **SHOULD** prefer early returns / guard clauses
- **SHOULD** prefer shallow nesting
- **SHOULD** prefer positive conditions

Use negative conditions only when they reduce nesting (e.g., guard clauses at the top of a function).

### Boolean Usage

- **MUST NOT** compare booleans to boolean literals (`if (x === true)` — just `if (x)`)
- **SHOULD** avoid leading `!` in complex expressions
- **SHOULD** encapsulate negation in named predicates when meaningful (`isExpired` beats `!isValid`)

### Non-null Assertion `!` — The "Trust Me, Bro" Operator

The non-null assertion operator (`value!`) suppresses TypeScript's nullability checking at compile time but provides **zero** runtime protection. If your assumption is wrong, you get a `Cannot read property of undefined` crash at runtime.

- **MUST** only use `!` when the invariant is real and documented
- **SHOULD** prefer narrowing (`if (value) { ... }`), optional chaining (`value?.x`), nullish coalescing (`value ?? fallback`), or assertion functions
- **CONSIDER** that every `!` in the codebase is a future bug-report waiting to happen

Valid use case: framework-injected values that are guaranteed non-null by the framework contract but TypeScript can't see (e.g., page params on a route that requires them).

### `any` and Type Suppressions

- **MUST NOT** use `any` casually — it disables type checking, including in callers
- **SHOULD** prefer `unknown` and narrow it
- **MUST** understand a TS error before suppressing with `@ts-ignore` / `@ts-expect-error`
- **SHOULD** prefer `@ts-expect-error` over `@ts-ignore` (it tells you when the suppression is no longer needed)

### Warnings and Suppressions

- **MUST** understand a warning before suppressing it
- **MUST NOT** suppress warnings casually
- **SHOULD NOT** commit code that adds new warnings

Warnings are a finite attention budget. Letting them accumulate teaches the team to ignore the signal.

### Unused Code

- **MUST** remove unused imports
- **MUST** remove unused parameters (or prefix `_` if required by a callback signature)
- **MUST** remove or justify unused exports

---

## Layout and Whitespace

There's no automated formatter, so apply these by hand. They're as much about _intent_ as mechanics.

- **MUST** end files with a single trailing newline
- **MUST NOT** use more than one consecutive blank line
- **CONSIDER** blank lines before `if`, `try`, and `return` to visually group logic
- **CONSIDER** blank lines between top-level declarations

See [Formatting](#formatting) for indentation, line width, and quote style.

---

## Naming and Types

- **SHOULD** avoid overly-terse names — assume the reader has no context
- **SHOULD** assume context rather than repeating it (a method on `User` doesn't need `userName`, just `name`)

### Strong Domain Types

- **SHOULD** use strong domain types over bag-of-primitives
- Domain logic **SHOULD** live in the domain and its types, not in components

Avoid "primitive obsession":

```ts
// Weak: easy to accidentally pass arguments in the wrong order
function transfer(from: string, to: string, amount: number) {}

// Strong: types prevent the mistake at compile time
type AccountId = string & { readonly __brand: 'AccountId' };
type Money = { amount: number; currency: 'USD' | 'EUR' };
function transfer(from: AccountId, to: AccountId, amount: Money) {}
```

### Supabase Types — Critical

- **MUST NOT** add custom types to `src/lib/database.types.ts` (it's regenerated by `npm run gen:types` and your edits will be lost)
- **MUST** put custom type aliases, branded types, and composed types in `src/lib/types.ts`
- Components import from `$lib/types`, not `$lib/database.types`

See `CLAUDE.md` for examples.

### DTOs vs Domain Objects

- **MUST NOT** bind external input (HTTP body, query params, form data) directly to domain objects — validate at the boundary
- **MUST** use DTOs (or validated input shapes) at all boundaries
- **SHOULD** use a runtime validator (Zod, Valibot, etc.) at every server-action / API endpoint entry point — TypeScript types are erased at runtime

---

## Collections

- **SHOULD** prefer `readonly T[]` (or `ReadonlyArray<T>`) for parameters and return types when mutation isn't intended
- **SHOULD** accept the most general type ("accept general, return specific")
- **MUST NOT** mutate function arguments

**Caveat:** TypeScript's `readonly` is a compile-time view, not a runtime guarantee. A `readonly T[]` is still a regular array at runtime — `Object.freeze` it if you need real immutability.

---

## Object Design and Immutability

- **SHOULD** prefer `readonly` properties unless mutation is essential to the type's purpose
- **SHOULD** prefer factory functions or `Object.freeze` for value objects
- **MUST** explicitly declare access modifiers (`public`, `private`, `protected`) on class members — don't rely on the default

### `private` keyword vs `#field`

- For TypeScript-only consumers, `private` is fine and idiomatic
- For libraries published to JS consumers, or anything where true runtime encapsulation matters, **prefer ECMAScript `#field`** — `private` is only enforced at compile time and is erased at runtime
- Don't mix the two in the same class

### Constructors

Constructors return one valid instance or throw. They **MUST NOT** perform side effects (network, DB, file I/O) — use a factory function for that.

---

## Error Handling and Failure

There are two valid patterns in TypeScript. Pick one per layer and stick with it.

### Default: Throw + try/catch (idiomatic JavaScript)

- **MUST** throw `Error` (or a subclass), never raw strings or objects
- **SHOULD** define typed error classes for domain failures (`class TripNotFoundError extends Error`)
- **MUST** let unexpected errors propagate to the framework boundary — don't swallow

### SvelteKit-specific: `fail()` and `error()` for boundaries

- In form actions, **MUST** use SvelteKit's `fail(status, data)` for validation/business failures so the client gets a typed result
- In load functions, **MUST** use SvelteKit's `error(status, message)` for HTTP-shaped failures
- **MUST NOT** throw raw errors out of form actions for expected validation failures

### Optional: `Result<T, E>` types

If a module has rich, branching failure modes and you want to enforce handling at compile time, `Result<T, E>` (e.g., via [`neverthrow`](https://github.com/supermacro/neverthrow)) is a valid choice. **Pick per module, not per project** — mixing throws and Results randomly across a codebase is worse than either alone.

---

## Time

- **MUST** store all trusted times in **UTC**
- **MUST** convert to local time only at the UI edge
- **MUST NOT** rely on `new Date()` for "business now" — inject a clock or pass timestamps explicitly, so logic is testable
- **SHOULD** use `@internationalized/date` (already a dependency) for date math at the UI layer

Database `timestamptz` columns are UTC by definition. Naked `timestamp` (without timezone) columns are a footgun — avoid them.

---

## UI and Layering

- **SHOULD** push complexity away from the UI
- UI **orchestrates**; the domain **decides**
- `+page.svelte` components are page-level orchestrators — they compose child components with props, they do not contain business logic
- Component should not directly query Supabase; load data in `+page.server.ts` and pass it via props
- See the "When to Extract" table in `CLAUDE.md`

## UI Language and Labels

- **SHOULD** use Title Case for buttons, page titles, and navigation items
- **MUST NOT** end button labels or form labels with periods
- Labels **MUST** describe outcomes, not mechanisms (`Save Changes` beats `Submit Form`)

### Tooltips — Use Sparingly

Tooltips are an accessibility liability:

- They don't work on touch devices (no hover state)
- Screen readers handle them inconsistently
- Their content is often inaccessible to users who need it most

Rules:

- **MUST** give every button a clear accessible name (visible label, or `aria-label` for icon-only buttons)
- **MUST NOT** put essential information in a tooltip
- **MUST NOT** duplicate the button's accessible name in its tooltip
- **CONSIDER** tooltips only for non-essential supplementary hints (e.g., "Last updated 2 minutes ago" on a refresh icon that already has `aria-label="Refresh"`)

Icon-only buttons **MUST** have an `aria-label`. The tooltip, if present, is a bonus for sighted desktop users.

### Dialogs

When using `<Dialog>` from shadcn-svelte:

- **MUST** have a visible close affordance (X button or "Cancel" button)
- **MUST** validate input before allowing submission
- **MUST** be dismissable via Escape key (shadcn-svelte handles this by default — don't disable it)
- **SHOULD** trap focus inside the dialog while open (shadcn-svelte handles this by default)

---

## Database Conventions

We use **PostgreSQL via Supabase**. Conventions follow Postgres idiom, not C# / SQL Server.

### Naming

- **MUST** use `snake_case` for table and column names (Postgres folds unquoted identifiers to lowercase; PascalCase would force quoted identifiers everywhere)
- **SHOULD** use plural nouns for entity tables (`trips`, `users`) — matches Supabase and most Postgres conventions
- **MUST** name foreign keys `<referenced_table_singular>_id` (e.g., `trip_id`, not `trips_id`)
- **MUST** name boolean columns as predicates (`is_active`, `has_synced`, not `active_flag`)

### Schema Baseline

Every table **SHOULD** include:

- `id uuid primary key default gen_random_uuid()` — use UUIDs unless you have a strong reason otherwise
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` (with a trigger to keep it fresh)

**Optional, per-table decision:**

- `created_by uuid references auth.users(id)` — when audit trail matters
- `deleted_at timestamptz` — only when soft delete is genuinely needed (see below)
- Concurrency token — only when concurrent edit conflicts are a real risk

### Soft Delete — Be Skeptical

Blanket soft-delete-everywhere is a known anti-pattern in modern Postgres development. It leaks into every query (you must filter `deleted_at IS NULL` everywhere or risk showing zombie rows), breaks unique constraints, complicates foreign keys, and tempts dangerous "restore" paths.

- **MUST NOT** add `deleted_at` to a table by default
- **CONSIDER** soft delete only when business requirements explicitly demand restorability (e.g., user-facing trash, regulatory hold)
- For audit purposes, Postgres has better tools: WAL, logical replication, dedicated audit tables, point-in-time-recovery
- For "I might want to undo this in the UI", consider an Undo affordance that re-creates instead

### Migrations

See `CLAUDE.md` — schema changes go through `supabase/migrations/`, **never the dashboard**.

### SQL

- **MUST NOT** put business logic in SQL (constraints and joins are fine; conditional business rules are not)
- Exceptions only for processes genuinely impractical outside the database (e.g., bulk transformations, RLS policies — which by definition live in SQL)

### Row-Level Security

- Every table accessible to the client **MUST** have RLS policies — there is no "trusted client" in a Supabase + JWT model
- **MUST** test RLS by running queries as an anonymous and authenticated user before merging

---

## Design Principles

- **SHOULD** make the special case the general case (if you find yourself adding an `if (isPro)` check in a third place, model the subscription tier as a first-class concept instead)
- **SHOULD** build a state machine if it looks like a state machine — explicit states + transitions beat scattered boolean flags
- **MUST NOT** derive and store the same value (`total` derived from `line_items` should be computed, not stored — or if stored for performance, must be authoritatively kept in sync via trigger/job)
- **MUST** store all inputs necessary for audit and reproducibility — you can always recompute derived values, but you can't recover lost inputs

---

## SvelteKit / Svelte 5 Specifics

### Runes Mode

- **MUST** use Svelte 5 runes: `$props()`, `$state()`, `$derived()`, `$derived.by()`, `$effect()`
- **MUST NOT** use Svelte 4 lifecycle functions (`onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate`) — `$effect()` covers all of these
- **SHOULD** prefer `$derived` over `$effect` for computed values — `$effect` should only be used for genuine side effects (DOM measurement, third-party library sync, etc.)

### Environment Variables

- **MUST** use `$env/dynamic/public` and `$env/dynamic/private` — never `$env/static/*`
- Static env vars are embedded at build time and unavailable in Docker containers where env vars are injected at runtime

### Auth

- The auth guard lives in `(app)/+layout.ts` and redirects to `/login` if no session
- **MUST NOT** call `getSession()` from client code — it causes an invalidation loop. Use `data.session` passed from the server layout.

---

## Formatting

There's no automated formatter, so keep the house style consistent by hand:

- **MUST** indent with tabs
- **MUST** use single quotes and omit trailing commas
- **MUST** keep lines within ~100 characters

If something is awkward to format, the cause is almost always upstream (line too long, expression too dense) — refactor instead of cramming.
