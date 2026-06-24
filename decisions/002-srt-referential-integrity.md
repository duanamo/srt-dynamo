# ADR-002: Referential-integrity rule for deletions

**Status:** Implemented
**Date:** 2026-06-24
**Issue:** #9

## Context

The data model has three reference edges between entities:

- `StatusReport.projectId → Project`
- `StatusReport.authorId → User`
- `Project.ownerId → User`

Issue #9 requires that deleting a User or Project **referenced by an existing report** be blocked,
with a clear message. But the issue's wording ("referenced by a report") names only the first two
edges. The third — a Project's owner — is a real reference too: deleting a user who owns a project
would leave `Project.ownerId` dangling, which the same issue forbids ("verify referenced owner /
project / author ids exist"). The rule needs an explicit, consistent definition because the store,
the deletion UI, the seed data, and the tests all depend on it.

## Options Considered

- **Block deletion when any reference exists (no cascade).** Safe, predictable, demonstrable; the user resolves references first.
- **Cascade delete** (delete a user → delete their reports / projects). Powerful but destroys data silently; a wrong click loses status history. Rejected for an internal tool.
- **Null the references** (set `ownerId`/`authorId` to null). Contradicts the "referenced ids must exist" requirement and the non-null entity shape. Rejected.
- **Block only on report references** (ignore the owner edge). Matches the issue's literal wording but leaves orphaned `Project.ownerId`. Rejected as internally inconsistent.

## Decision

**Block, do not cascade.** A delete is refused while any other record references the target:

- A **User** cannot be deleted while they are the **author of any report** _or_ the **owner of any project**.
- A **Project** cannot be deleted while it is **referenced by any report** (`projectId`).

The guard functions return a result object, not an exception:

```ts
{ ok: false, reason: "Can't delete Maria Santos — she owns 1 project and authored 2 reports. Reassign or delete those first." }
```

`reason` names what blocks the delete (counts and/or names) so the UI can show the user exactly why.
`{ ok: true }` means the delete proceeds.

## Rationale / Consequences

- Blocking is the safe default for an internal status-tracking tool: history is never silently destroyed, and the failure is explained rather than swallowed.
- Covering the `Project.ownerId → User` edge keeps the dataset internally consistent — there can never be a project whose owner doesn't exist — satisfying the issue's id-existence requirement uniformly.
- **Consequence — to delete a referenced entity the user must first remove or reassign the referencing records** (delete the reports, or reassign the project's owner / a report's project/author). This is surfaced in the UI message.
- **Demonstrability (seed contract):** the seed guarantees, for each rule, at least one entity that **is** referenced (delete blocked) and at least one that is **not** (delete allowed) — e.g. one user authors/owns nothing and is freely deletable, while another owns a project and/or authored a report and is blocked. See [ADR-001](001-srt-localstorage-schema.md) for the storage shape these references live in.
