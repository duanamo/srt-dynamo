<!-- dynamo-standards v0.1.0 -->
<!-- This file is managed by /dynamo-upgrade. Edits will be overwritten. -->

# Dynamo Standards

This file is the org-wide standards header that gets loaded into every Claude Code session in a Dynamo repo (via the
`@CLAUDE-DYNAMO.md` import that `/dynamo-init` injects into your personal `<repo>/CLAUDE.md`). It also installs at
`~/.claude/dynamo/CLAUDE.md`.

If you are reading this, the repository you are in follows the Dynamo development conventions documented under
`~/.claude/dynamo/references/`.

---

## Dynamo standards — version check (mandatory, every session)

At session start, before answering the user's first substantive message:

1. Parse the version comment at the top of `CLAUDE-DYNAMO.md` (the file you are reading via `@import` is the
   project-side copy; its first line is `<!-- dynamo-standards vX.Y.Z -->`).
2. Read `~/.claude/dynamo/VERSION` — the developer's currently installed version.
3. Compare the two:
    - If they match → do nothing, do not announce.
    - If the repo's declared version is newer → surface a single line:
      `⚠ This repo declares Dynamo standards vX.Y.Z. You have vA.B.C installed. Run /dynamo-upgrade to sync.`
    - If the repo's declared version is older → surface a single line:
      `⚠ This repo's CLAUDE-DYNAMO.md is at vX.Y.Z; your installed standards are vA.B.C. Run /dynamo-upgrade and accept the repo-refresh prompt.`

Notify once per session. Do not block. Do not auto-update.

---

## Conventions

These reference files live under `~/.claude/dynamo/references/`. The ones below are **imported into every session** via
this file — the conventions that apply to everyday work:

@~/.claude/dynamo/references/coding-standards.md
@~/.claude/dynamo/references/git-commit-conventions.md
@~/.claude/dynamo/references/branching-conventions.md
@~/.claude/dynamo/references/code-review-conventions.md
@~/.claude/dynamo/references/development-lifecycle-conventions.md
@~/.claude/dynamo/references/github-usage-conventions.md
@~/.claude/dynamo/references/in-code-comments-conventions.md
@~/.claude/dynamo/references/markdown-conventions.md
@~/.claude/dynamo/references/changelog-conventions.md
@~/.claude/dynamo/references/known-issue-conventions.md
@~/.claude/dynamo/references/documentation-conventions.md
@~/.claude/dynamo/references/repository-structure-conventions.md
@~/.claude/dynamo/references/versioning-conventions.md
@~/.claude/dynamo/references/secrets-conventions.md
@~/.claude/dynamo/references/security-review-conventions.md
@~/.claude/dynamo/references/ui-ux-conventions.md

### Load on demand (not auto-imported)

These specialist references are read when relevant rather than loaded into every session — read the file when the task
calls for it:

- `~/.claude/dynamo/references/agent-configuration-conventions.md` — when authoring or tuning an agent (frontmatter:
  model, effort, isolation, turns).
- `~/.claude/dynamo/references/skill-authoring-conventions.md` — when authoring an agent, command, or skill (the
  markdown-with-XML-tags body structure).
- `~/.claude/dynamo/references/design-review-conventions.md` — when auditing the design system (the `designer` agent
  loads this itself).
- `~/.claude/dynamo/references/formatting-conventions.md` — when setting up or touching a repo's Prettier / ESLint /
  lint-staged / husky config (the per-stack templates `/dynamo-init` installs from `config/`, and the husky-chaining
  hook model).

## Standard stack

Dynamo's **default stack binding** (see `decisions/` for the ADRs behind each choice). Agents reason in stack
*concepts* — frontend / backend / database / auth / cloud / deployment / secrets / observability / test-command — and a
repo's `.dynamo.json` `stack` block fills the specifics; the stack below is the default binding, not a global
assumption:

- **Frontend:** SvelteKit (Svelte 5 runes) + Tailwind CSS 4 + shadcn-svelte.
- **Backend:** Supabase (PostgreSQL, Row-Level Security, real-time). Auth via Microsoft Entra ID (Azure OAuth).
- **Data / AI:** Python (LangChain, the Anthropic / OpenAI SDKs, FastAPI where a service is needed).
- **Email:** AWS SES, from `noreply+<app>@dynamo.works`, region `us-east-2`. See `process/sops/aws-ses-email-sop.md`.
- **Brand:** primary `#fe4e51`. See the design system at `~/.claude/dynamo/design-system/`.
- **Version control (opinionated, not a binding):** git, hosted on GitHub (org `Dynamo-Technologies`). The branch model,
  commit taxonomy, and git hooks assume this. See ADR-004.
- **Work tracking (default binding):** GitHub Issues + Projects in the `Dynamo-Technologies` org. Distinct from version
  control above — this is the ticketing layer, and it *binds*: Linear, Jira, Azure DevOps, generic MCP, or manual plug in
  via `.dynamo.json` `workTracking` (MCP is how Claude Code logs/reads tickets).

## Standard agents

| Agent            | Invocation      | Purpose                                                                                                                                                                                                                                |
|------------------|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **reviewer**     | `@reviewer`     | Convention-based code review (Sonnet, high effort). Checks the diff against Dynamo conventions.                                                                                                                                        |
| **security**     | `@security`     | Adversarial security review (Opus, max effort). Threat-model-driven — hunts exploitable vulnerabilities, not convention violations. See `security-review-conventions.md`.                                                              |
| **doc-writer**   | `@doc-writer`   | Documentation updater (Sonnet, high effort). Writes targeted doc changes based on the branch diff.                                                                                                                                     |
| **doc-auditor**  | `@doc-auditor`  | Documentation auditor (Opus, xhigh effort). Full codebase scan — produces a gap report for doc-writer to act on. Read-only.                                                                                                            |
| **designer**     | `@designer`     | Design system maintainer (Sonnet, high effort). Updates tokens, components, and rules on a designer's request. Audits the design system for inconsistencies. Read-write on design-system files only.                                   |
| **plan-auditor** | `@plan-auditor` | Adversarial plan auditor (Opus, max effort). Pressure-tests a Plan Artifact *before* implementation — assumptions, edge cases, scope creep, untested risk. Read-only; emits findings + a Recommendation. Dispatched by `/dynamo-plan`. |

Agents use the GitHub `gh` CLI for issue context — never a hardcoded API key. Their model pins, effort levels, and
runtime limits follow `agent-configuration-conventions.md`. Their file structure follows
`skill-authoring-conventions.md`.

## Standard slash commands

- `/dynamo-check-version` — print installed vs. remote vs. repo-declared standards versions.
- `/dynamo-doctor` — check your install + repo health (version, import marker, hooks, gh auth, symlinks, freshness).
- `/dynamo-upgrade` — pull the latest standards and re-sync.
- `/dynamo-branch [id]` — create a Change Branch from a Work Item (branch name from the `workTracking` binding; GitHub
  `issue/NNN-<slug>` by default), against the integration branch.
- `/dynamo-plan [id]` — start the Plan & Audit phases: scaffold a Plan Artifact, run the `plan-auditor`, surface its
  Recommendation, and point to the next phases. Tool-neutral (resolves the Work Item via the binding, or prompts
  manually).
- `/dynamo-init` — bootstrap the current repo (idempotent; also `/dynamo-init --uninstall`).
- `/dynamo-merge` — open a squash-merge PR targeting the correct integration branch, with the binding's close syntax (
  `Closes #NNN` by default).
- `/dynamo-set-branching` — switch between trunk and main-only branching modes.
- `/dynamo-code-review` — launch the reviewer against the current branch.
- `/dynamo-security-review` — launch the security reviewer (warns before starting).
- `/dynamo-update-documentation` — launch the doc-writer to sync docs with new code.
- `/dynamo-full-documentation-review` — launch the doc-auditor for a full doc audit.
- `/dynamo-design` — build or review branded UI against the Dynamo Design System.
- `/dynamo-design-review` — launch the designer in audit mode for a full design system review.
- `/dynamo-design-update` — invoke the designer to apply a targeted design system change.

## Standard skills

Where an agent is an isolated worker and a command is a thin trigger, a **skill** loads into the current session to
orchestrate a multi-step task — it can fan out to agents, ask you questions, and apply changes itself. Skills install
under `~/.claude/skills/` with the `dynamo-` prefix and are invoked like a command (or auto-loaded when the work
matches).

- `/dynamo-sweep` — context-adaptive code audit. Dispatches five read-only finder agents (`sweep-dead-code`,
  `sweep-antipatterns`, `sweep-abstractions`, `sweep-docs`, `sweep-tests`), triages and verifies their findings, then
  applies and commits the fixes. Runs a full sweep, an incremental pass over recent changes (
  `/dynamo-sweep since=<ref>`), or a single category. Prefers a substrate-backed variant (e.g. `lode-sweep`) when one is
  registered.
- `dynamo-plan-flow` — the orchestration behind `/dynamo-plan` (Plan & Audit phases). Auto-loads when you're planning a
  Work Item or asking to audit a plan before coding.

## Development lifecycle

Dynamo's development lifecycle is **opinionated about version control (git + GitHub) and tool-neutral about work
tracking** — **Track → Plan → Audit → Decide → Implement → Verify → Review → Ship**, expressed in concepts (**Work Item ·
Plan Artifact · Plan Audit · Decision Record · Change Branch · Verification Evidence · Review Finding · Ship Artifact**).
Version control is git on GitHub (assumed, not a binding — see ADR-004); the *work-tracking* provider behind the Work
Item is what *binds* (GitHub Issues by default; Linear/Jira/Azure DevOps/MCP/manual), along with the stack, in
`.dynamo.json`. The work tracker is a binding, never the model. Each phase
carries a posture — **Gate** (required) / **Checkpoint** (recommended, justify a skip) / **Guidance** (optional) —
parallel to the hook `strict | warn | off` spectrum. The lifecycle is **guidance, not impediment**: nothing blocks a
tool in-session; postures are enforced socially at the PR checklist + Definition of Done, and guided by `/dynamo-plan`.
The only net-new capability is the pre-implementation **Plan Audit** (`plan-auditor`). Full rules:
`development-lifecycle-conventions.md` (auto-imported); rationale + per-provider bindings:
`process/development-lifecycle-guide.md`.

## Default working posture (every session)

In a Dynamo repo the lifecycle is the **default way of working**, not something that waits for a command. Before
non-trivial work, *initiate* it — propose the step, take the local part, and don't improvise around it:

1. **Track first.** Make sure a Work Item exists for the work. If none does, offer to create one before coding rather
   than starting ad-hoc — and capture its id.
2. **Work on a Change Branch.** If you're on `main` or the integration branch, cut a Change Branch first
   (`/dynamo-branch <id>`).
3. **Plan real features.** For a feature or non-trivial change, write the Plan Artifact (`/dynamo-plan <id>`) — with the
   Reuse & Prior Art check, and the design approach for user-facing work — before implementing.
4. **Surface decisions.** When a choice imposes a contract on other code (a wire format, a schema, a cross-component
   invariant), propose a Decision Record (ADR) instead of burying it in the diff.
5. **Verify and review before shipping**, then merge via `/dynamo-merge`.

**It's a posture you initiate, not a gate you enforce:**

- **Trivial work is exempt** — a typo, a formatting fix, a one-line obvious change, an emergency hotfix: just do it (the
  plan-exception path). Don't manufacture a ticket or plan to satisfy ceremony.
- **Scale the rigor to the risk.** The Plan Audit and a security review are for *significant or high-risk* changes
  (auth, data model, secrets, infra, cross-service contracts) — not every chore. Don't over-audit a small change.
- **Confirm outward-facing steps** — creating a ticket, pushing, opening a PR — before doing them. Local steps (a
  branch, a plan draft) you may take and report.
- **Never block.** If the developer says "skip it / just do it," proceed. The lifecycle guides; it does not gate
  in-session.

The point: recognize the *type* of work and reach for the lifecycle by default — so non-trivial work is tracked,
planned, and decided-on instead of improvised — without the developer having to remember to ask.

**Delegate on purpose, not always.** Reach for a subagent only for isolated, parallel, or specialized review (`reviewer`,
`security`, `designer`, the `/dynamo-sweep` finders, `plan-auditor`); do ordinary work inline, and never spawn one
reflexively. Adversarial review (`plan-auditor`, `security`) biases to **signal over volume** — a clean plan or diff is a
short report and a success, not a prompt to manufacture findings. See `skill-authoring-conventions.md`.

## Git conventions (summary)

Version control is **git, hosted on GitHub** — opinionated, not a binding (ADR-004). On top of that, the rules split into
two layers: **branching topology and commit grammar** (universal — they assume git + GitHub) and **branch naming + close
syntax** (binding-derived, from `workTracking` in `.dynamo.json`).

- **Trunk model** (default, universal): `main` is the release/deploy branch; the integration branch (`dev` by default —
  set `integrationBranch` in `.dynamo.json`) is where feature work merges. A `main-only` mode is also available via
  `/dynamo-set-branching`.
- **Branch names** come from `workTracking.branchPattern`. The default GitHub binding is `issue/NNN-<slug>` (`NNN` =
  GitHub issue number); a Linear binding might use `work/ENG-88-<slug>`. The non-Work-Item prefixes (`hotfix/`,
  `chore/`, `docs/`, `spike/`, `ci/`, `release/x.y.z`) are universal.
- **Commit subjects** (universal): `feat:`, `fix:`, `chore:`, `docs:`, `test:` — no scopes. `Co-Authored-By:` trailers
  are allowed.
- **Merging:** squash-merge into the integration branch; the PR body carries the binding's `workTracking.closeSyntax` (
  default GitHub: `Closes #NNN`). Bindings without a closing keyword reference the Work Item without auto-closing.
- **Hooks** (pre-commit secret scan, commit-msg, pre-push) are **strict by default but configurable per-repo** via
  `.dynamo.json` (`enforcement`: `strict` | `warn` | `off`; per-hook overrides under `hooks`). The pre-push hook
  currently validates against the GitHub-default branch grammar — non-GitHub providers should set `hooks.prePush=warn`
  until `branchValidation.allowedPatterns` ships. The secret scan stays hard unless you explicitly set
  `hooks.secretScan`. `DYNAMO_HOOK_SKIP=1` is an emergency-only bypass.

See `git-commit-conventions.md` and `branching-conventions.md` for the full rules.

## Work tracking — default GitHub binding

The default Dynamo work-tracking binding is GitHub Issues + Projects:

- **Work Item:** GitHub Issue `#NNN`. Tooling via `gh` CLI — uses your existing GitHub auth (`gh auth status`); there is
  no separate API key.
- **Change Branch:** `issue/NNN-<slug>`.
- **Ship Artifact close syntax:** `Closes #NNN` in the PR body — GitHub auto-links and auto-closes the issue on
  squash-merge.

Other bindings (Linear, Jira, Azure DevOps, generic MCP, manual) satisfy the same lifecycle through their own
`workTracking` block in `.dynamo.json`. MCP-bound providers use an `mcp` sub-block; manual mode prompts for Work Item
fields. The lifecycle vocabulary (Work Item, Plan Artifact, Plan Audit, Decision Record, Change Branch, Verification
Evidence, Review Finding, Ship Artifact) is universal — providers are bindings, never the model. See
`github-usage-conventions.md` for the default binding's specifics and `process/development-lifecycle-guide.md` for
per-provider bindings.
