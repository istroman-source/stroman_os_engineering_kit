# Stroman OS V1 release evidence

This record separates automated proof, local native-runtime proof, and the final deployed checks.
It contains no credential values or private source images.

## Candidate scope

- Audit baseline: `d023cb474448144cf963ec9891025cad57e3eba4`
- Functional implementation verified through: `4c8e9c0777485e74e9373a9de1249835c51c994c`
- Final exact review SHA: recorded in the pull request after this evidence is committed
- Reconstruction services used: local Apple Object Capture only; no KIRI, RunPod, or paid call

## Automated evidence

| Gate | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed with two pre-existing test-only unused-parameter warnings |
| Prettier | Passed |
| OpenAPI 3.1 | Passed, 98 paths |
| Unit/UI/worker suite | Passed, 716 tests |
| Real-PostgreSQL integration | Passed, 92 tests |
| Real-PostgreSQL authenticated API | Passed, 98 tests |
| Authentication | Passed, 48 unit/application plus 32 real-PostgreSQL API tests |
| Cross-mode creative evaluation | Passed, 28 tests |
| Guarded autopilot | Passed, 57 tests |
| Playwright production browser smoke | Passed, 10 desktop/mobile checks |
| Production build | Passed with Next.js webpack build |
| Fresh database migration | Passed, all 30 migrations |
| Existing compatible database migration | Passed from 28 to 30 migrations with existing decision and evidence meaning preserved |

The authenticated API acceptance creates a project, saves Jimmy intent, retains and analyzes a
transcript, promotes a source-backed Edit recommendation into a filmmaker decision, records the
human choice, verifies Review readiness, and downloads the exact versioned project snapshot through
real HTTP handlers and a fresh PostgreSQL database.

The first independent candidate review found one IMPORTANT honesty gap: an unconfigured hosted
provider could silently fall back to an offline draft. The remediation routes application
composition through validated production configuration, fails closed without hosted credentials,
and visibly labels every explicitly selected offline creative draft without exposing credentials or
provider plumbing. Regression coverage verifies both the fail-closed and filmmaker-facing states.

## Free connected-Mac evidence

The current native source was compiled and checked on the connected Mac, then its full-detail Apple
pipeline reconstructed a preserved 26-photo room fixture. The run completed every public stage from
alignment through packaging and produced a valid browser-bounded GLB:

- Bytes: `12,258,908`
- SHA-256: `ea0dcce5c7efda8c9ae30d4b56aca572a755af0af5264df71f7f41134bf6870e`
- Current application classification: `SHOOTABLE_ESTIMATE`
- Canonical recovered bounds: approximately `3.1 m × 2.6 m × 3.2 m`
- Honesty contract: scale remains estimated; doors, windows, obstacles, floor continuity, and
  operating clearance remain explicitly unconfirmed

This native run found a real double-scaling defect in the room brief. The implementation now treats
inspector bounds as canonical meters exactly once, and targeted domain/application regression tests
cover that invariant.

## Reliability behaviors covered

- Original room and source inputs remain durable across retryable failures.
- Active reconstruction requests are idempotent and duplicate claims are prevented.
- Expired worker leases can be recovered without re-uploading evidence.
- Terminal worker failures retain inputs and offer retry.
- Reloaded UI state represents processing, needs-attention, failure, and ready states.
- Cross-owner reads and mutations fail closed.
- Stale project, intent, decision, planning, and export snapshots do not overwrite newer state.
- Integrity-invalid sources and geometry fail closed with a filmmaker-facing corrective action.

## Human-test procedure

1. Sign in and start a new project with one plain-language intent plus optional constraints.
2. Add a transcript or footage source. Confirm upload/progress survives a reload and the source
   remains available after any retryable failure.
3. Run analysis. Open at least one cited transcript excerpt or sampled frame and confirm literal
   source evidence is visually separate from interpretation.
4. Open **Story**, compare the proposed direction and alternatives, and create a Choice. Confirm no
   option is selected until the filmmaker records it.
5. Open **Plan**, save one 16:9 and one independently composed 9:16 shot. Adjust camera position,
   aim, height, lens, subject/blocking, movement, light, look, and sound; reload and confirm the exact
   setups return.
6. Open **Footage & notes**, turn an Edit recommendation into a Choice, and record keep, revise,
   reject, or defer with a human rationale.
7. Open **Review**. Confirm intent, facts, interpretations, recommendations, decisions, conflicts,
   gaps, and unresolved actions are understandable and link back to the affected work.
8. Download the project snapshot, treatment, shot plan, edit brief, decision record, review packet,
   and decision CSV. Confirm the snapshot identifier is consistent for unchanged project state.
9. In **Locations**, test one existing GLB room and one 20–40-photo room. Keep the connected Mac
   worker open for the photo room; confirm live progress, reload recovery, a usable viewer when ready,
   and preserved inputs plus a clear retry if the Mac is interrupted.
10. Select prepared rooms for the project and confirm saved storyboard shots remain attached to the
    intended room and stay editable.

## Remaining release-environment checks

Before `READY FOR HUMAN TESTING`, the exact reviewed SHA must pass CI, merge through the established
non-force process, deploy, and complete the signed-in browser smoke on that deployment. Independent
review must inspect product meaning and runtime evidence and return zero BLOCKING and IMPORTANT
findings. No local automated result is represented as that final external verdict.
