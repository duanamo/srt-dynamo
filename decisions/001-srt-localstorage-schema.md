# ADR-001: Client persistence schema for the Status Report Tracker

**Status:** Implemented
**Date:** 2026-06-24
**Issue:** #9

## Context

The Status Report Tracker is a frontend-only MVP (issue #9): no backend, no database, no auth. All
three entities — Users, Projects, Status Reports — must persist on the client and survive reloads.
The storage shape is a contract: the reactive store, the seed builder, and the unit tests all depend
on it, so it is decided here rather than buried in the store implementation.

## Options Considered

| Option                                                          | Pros                                                                    | Cons                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **One namespaced `localStorage` key holding the whole dataset** | Atomic read/write; trivial reset/clear; one parse; easy to reason about | Whole blob rewritten on each change (fine at MVP scale)                             |
| One `localStorage` key per entity (`srt:users`, …)              | Smaller writes                                                          | Three reads/writes to keep consistent; cross-entity invariants split across keys    |
| IndexedDB                                                       | Scales to large data; async                                             | Async API and tooling overhead unjustified for a few hundred rows; over-engineering |

## Decision

Persist the entire dataset under a **single `localStorage` key, `srt:data`**, as a versioned envelope:

```json
{ "version": 1, "users": [], "projects": [], "reports": [] }
```

- **Ids:** `crypto.randomUUID()` at creation time — no `uuid` dependency (Node ≥ 24 and browsers provide it).
- **Timestamps:** `StatusReport.createdAt` / `updatedAt` are ISO 8601 strings; both set on create, `updatedAt` bumped on every edit.
- **Seed on empty:** on first client load, if `srt:data` is absent or unparseable, the store hydrates from `buildSeed(now)` and writes it back. `now` is injected (per `STYLEGUIDE.md:245`), not read internally.
- **Write strategy:** the whole envelope is serialized and written after each mutation (create/update/delete/reset/clear).
- **SSR safety:** the app sets `export const ssr = false`, and every `localStorage` access is additionally guarded by the `browser` flag from `$app/environment`; on the server the store starts empty and hydrates on the client.
- **Reset / clear:** `resetToSeed()` overwrites `srt:data` with a fresh seed; `clearAll()` empties all three arrays (and the key).

## Rationale / Consequences

- A single key makes reads/writes atomic and reset/clear one-liners — the simplest thing that satisfies the requirement without a service/repository layer the issue explicitly forbids.
- The `version` field is a cheap forward-compatibility hook: a future shape change can detect `version !== 1` and migrate or re-seed rather than crash on stale data.
- **Consequence — referential invariants are not enforced by the store shape itself.** Every `report.projectId` / `report.authorId` / `project.ownerId` must point at an existing id; that is enforced by validation on write and by the deletion rule in [ADR-002](002-srt-referential-integrity.md), not by the JSON structure.
- **Consequence — no cross-tab/cross-device sync.** Two tabs can race on the last write; acceptable for a single-user internal MVP and out of scope.
- **Consequence — `localStorage` is ~5 MB and synchronous.** Ample for this data volume; the synchronous full-blob write is negligible at MVP scale.
