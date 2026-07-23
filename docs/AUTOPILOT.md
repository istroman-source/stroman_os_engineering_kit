# Repository Autopilot

`./autopilot` is the repository-owned engineering lifecycle coordinator. Its TypeScript
core uses injected command adapters, a persistent state machine, atomic state writes, and
a thin POSIX launcher. It never embeds tokens or provider credentials.

## Setup and usage

Install repository dependencies and authenticate GitHub CLI, then start from clean
`main`:

```bash
./autopilot
./autopilot --milestone 014
./autopilot --dry-run
./autopilot status
./autopilot resume
./autopilot verify
./autopilot review
./autopilot review --result /path/to/review-result.json
./autopilot abort
```

`--continuous` records continuous intent; progression still obeys every approval and
merge gate. Configuration lives in `autopilot.config.json`. Commands are argument arrays,
not shell strings. Set implementation and review agent commands only to trusted local
executables that accept a generated prompt-file path. When either command is `null`,
Autopilot writes the exact prompt under `.autopilot/runs/` and stops at the corresponding
actionable phase.

Manual review results use JSON: `{"verdict":"APPROVED","findings":[]}`. Each finding
contains `severity`, `summary`, and `resolved`. BLOCKING and IMPORTANT findings enter the
bounded remediation loop; OPTIONAL findings are recorded but never implemented
automatically.

## Lifecycle and recovery

Preflight verifies tools, GitHub authentication/repository access, clean `main`, and
synchronization. Selection reads prompt files and completion records without skipping an
unfinished prerequisite. A lock prevents concurrent runs. State is written atomically to
`.autopilot/state/current.json`; detailed redacted logs live under `.autopilot/logs/`.
Both are gitignored. `status` is read-only, `resume` reports the exact interrupted phase,
and `abort` marks the run without resetting, cleaning, or discarding user files.

Verification fails fast using the configured canonical commands. Merge is forbidden
until local verification and CI pass, independent review is approved, all BLOCKING and
IMPORTANT findings are resolved, GitHub reports the PR mergeable, and no human gate is
pending. Set `autoMerge` to `false` to require an explicit merge action (the default).

Human approval is mandatory for destructive migrations, irreversible deletion, product
direction, security-sensitive architecture, paid services, roadmap ambiguity, and
subjective review findings. Autopilot never force-pushes, bypasses hooks, deletes `main`,
or retries a real failure as if it were transient.

## Configuration and troubleshooting

Edit `verificationCommands` to change the gate and keep each executable plus arguments as
an array. `ciTimeoutSeconds` bounds CI monitoring; `remediationLoopLimit` prevents endless
review loops. Protected paths and approval policies are version controlled. Secrets stay
in the environment or GitHub, never this file.

If preflight refuses a dirty tree, preserve or commit that work yourself. If a branch
collision is reported, inspect `status` and use `resume`; do not delete a branch blindly.
If an agent is unavailable, run the emitted prompt through an independent Codex task and
resume only after its stated work is complete.
