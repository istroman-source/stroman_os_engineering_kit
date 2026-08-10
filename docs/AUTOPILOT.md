# Repository Autopilot

`./autopilot` runs engineering milestones through implementation,
verification, pull request creation, fresh CI, independent review, bounded remediation,
and guarded merge. The repository owns Git and GitHub lifecycle actions; coding agents
only edit or review code. Herdr and interactive terminal panes are not part of the
critical path.

The default adapters run Codex non-interactively for implementation and Claude Code
non-interactively for independent review. They use the existing local sign-ins and never
embed credentials. Every generated implementation and remediation prompt includes the
permanent Prompt Evolution Rule and the reusable safeguards learned from prior reviews.

## Prerequisites

Install repository dependencies, then authenticate the three local CLIs:

```bash
codex --version
claude --version
gh auth status
```

Use `CODEX_BIN` or `CLAUDE_BIN` only when either executable is not on the normal command
path. The adapters disable session persistence, require structured output, and have a
two-hour timeout configured by `agentTimeoutSeconds`. Autopilot tests exercise both
adapters against provider-shaped fake executables; repeat a no-edit smoke test with the
real installed CLIs whenever their versions or flags change.

## Start the guarded continuous rollout

Start from a clean, synchronized `main`:

```bash
./autopilot --dry-run
./autopilot
```

The activated first rollout selects the roadmap's declared next incomplete dependency,
runs the complete lifecycle, and stops after Prompt 017. The stop is enforced by
`continuousStopAfterMilestone`; continuous configuration is invalid unless auto-merge is
also enabled and a three-digit stop milestone is present. `--dry-run` performs only the
first selection without looping or mutating Git. An explicit `--milestone NNN` remains a
single run unless paired with `--continuous`; already completed milestones are rejected.

The owner approved Prompt 017 as the first post-alpha hardening milestone. This reconciles
the prior stop condition without authorizing Prompt 018 or later work. Changing or removing
the configured stop remains a product-direction approval gate. Runtime startup requires
the configured stop to match the exact approved stop declaration in the roadmap and requires
that milestone to exist under the configured prompt directories.

Useful recovery and inspection commands are:

```bash
./autopilot status
./autopilot resume
./autopilot verify
./autopilot review
./autopilot review --result /path/to/review-result.json
./autopilot merge
./autopilot abort
```

## Exact lifecycle

The implementation adapter receives a generated prompt by file path and may edit and test
the current milestone branch. It may not commit, push, create a PR, merge, or switch
branches. Autopilot then runs the canonical verification commands, enforces protected-path
and migration policy, commits, pushes, and creates the PR.

CI is polled against the exact expected PR head and every job named in `requiredCiChecks`.
An incomplete, empty, or stale check set cannot pass.
After CI succeeds, Autopilot creates a disposable detached worktree pinned to that head
and runs the Claude adapter with read-only tools. The structured result must repeat the
same 40-character `reviewedCommit`; both that value and the live PR head must match before
the result is accepted. The worktree is removed after review.

BLOCKING and IMPORTANT findings enter at most two remediation passes. Each pass runs
Codex with a focused prompt, then repeats local verification, commit, push, exact-head CI,
and independent exact-commit review. OPTIONAL findings are recorded but are never
implemented automatically. An approved result with no objective findings enters the
merge gate.

Every agent and GitHub call has a bounded timeout. On Unix, timeout escalation signals the
entire subprocess group so spawned tool processes cannot continue mutating a checkout
after their parent exits. Structured BLOCKED responses are preserved as the recorded
failure message, and remediation exceptions persist their failure and approval gates
before the lock is released.

The first continuous rollout has `autoMerge` enabled under an explicit owner approval and
an explicit Prompt 017 stop. Auto-merge rechecks local verification, exact-head CI, independent
approval, zero objective findings, GitHub mergeability, no human approval gate, and the
atomic `--match-head-commit` condition. Enable `autoMerge` only after one real milestone
has completed this lifecycle end to end unless the owner explicitly approves the bounded
first rollout, as here. The merge uses a merge commit. The remote
feature branch is retained for recovery; only the local branch is cleaned after `main` is
synchronized.

## State, review format, and recovery

A lock covers the entire continuous session, including the gap between milestones, and
prevents concurrent runs. State is written atomically to
`.autopilot/state/current.json`; detailed redacted logs and generated prompts live under
`.autopilot/`. All are gitignored. `status` is read-only, and `abort` marks the run without
resetting, cleaning, or discarding user files.

When no review adapter is configured, provide the exact reviewer output manually:

```json
{
  "reviewedCommit": "0123456789abcdef0123456789abcdef01234567",
  "verdict": "APPROVED",
  "findings": [
    {
      "severity": "OPTIONAL",
      "summary": "A concise observation",
      "file": "src/example.ts",
      "line": 12
    }
  ]
}
```

`APPROVED` is valid only when no BLOCKING or IMPORTANT finding exists;
`CHANGES_REQUIRED` requires at least one such finding. Invalid or stale structured output
is rejected.

Human approval remains mandatory for destructive migrations, irreversible deletion,
product direction, security-sensitive architecture, paid services, roadmap ambiguity,
and subjective findings. Autopilot never force-pushes, bypasses hooks, deletes `main`, or
relabels a real failure as transient. If a tree is dirty or a branch collides, inspect the
recorded state rather than deleting work blindly.
