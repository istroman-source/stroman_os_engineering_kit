# Location Library release ledger

## Objective

Deliver an owner-scoped Location Library, reliable free Mac reconstruction worker, and real-room storyboard workflow without paid reconstruction providers.

## Baseline

- Base: `origin/main` at `c8283073786f4638a8647cf6f53adc43fc002680`.
- Worktree: `feat/location-library-release`.
- Preserved outside this worktree: the canonical checkout's untracked `prisma/migrations/20260810120403_ctrl_c/` migration.

## Completed

- Created the clean release worktree from exact `origin/main`.
- Replaced the production reconstruction adapter with an outbound Mac-worker
  lease protocol. The app keeps source photos durable, grants short signed
  leases, verifies transferred bytes, and accepts a signed GLB result back into
  planning. The provider cannot silently fall back to KIRI.
- Focused regression evidence: TypeScript clean; 19 reconstruction provider,
  application, and local-worker tests passed, including signed-request replay
  protection and local-worker restart recovery.

## Current slice

Add the owner-scoped Location Library model and APIs. Prepared locations will
exist before projects, preserve original GLB/photo evidence, and expose only
ready assets for project grounding.

## Evidence

- Existing production failure: source photos persisted successfully but a temporary tunnel expiry returned a 503 before reconstruction submission.
- Existing worker and project-scoped reconstruction implementation is the compatibility baseline.
- The lease protocol removes the app-to-Mac inbound connection entirely.

## Next action

Model prepared locations independently of projects, then attach selected ready
locations to a project without copying evidence or exposing scan plumbing.

## Active blocker

None.
