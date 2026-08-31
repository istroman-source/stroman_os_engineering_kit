# Release Notes

## Functional V1 completion candidate (2026-08-31)

- Connected structured intent, source evidence, Develop/Build/Edit recommendations, durable
  filmmaker choices, human Review, and versioned exports into one owner-scoped decision loop.
- Added canonical evidence links, keep/revise/reject/defer semantics, affected-artifact versions,
  uncertainty/tradeoff recording, and stale-choice review signals without allowing advisory output
  to decide for the filmmaker.
- Added private treatment, shot-plan, edit-brief, decision-record, review-packet, JSON snapshot, and
  spreadsheet-safe CSV handoffs tied to exact intent and decision versions.
- Revalidated actual hosted artifacts across commercial, documentary, narrative, performance, and
  open modes against the current semantic and visual-planning contracts.
- Added an authenticated real-PostgreSQL acceptance journey from intent and source import through
  analysis, human decision, Review, and exact snapshot export.
- Added a reproducible existing-database migration rehearsal. Existing decision/evidence rows retain
  their meaning while the final two additive migrations apply.
- Reconstructed a preserved 26-photo room through the current full-detail Apple pipeline with no
  paid service. The resulting 12.3 MB GLB passed current application validation and exposed a
  double-scaling defect in room dimensions; canonical bounds are now reported exactly once with
  regression coverage.

The candidate remains behind exact-SHA independent review, CI, established merge/deploy safeguards,
and the final signed-in deployed-browser acceptance. Evidence and human-test steps are in
`docs/V1_RELEASE_EVIDENCE.md`.

## Zero-fee Apple reconstruction path (2026-08-20)

- Added an Apple RealityKit photogrammetry engine for supported Macs, verified on the owner's exact
  machine with `PhotogrammetrySession.isSupported == true`.
- Added a one-command private-test mode that compiles the native engine, creates an ephemeral HMAC
  secret without exposing it, starts the loopback-only worker, and launches Stroman OS on port 3200.
- Apple progress maps into the existing no-reload phases; insufficient source coverage fails closed,
  and the one textured OBJ result is packaged through locked `gltfpack` into the existing bounded
  GLB ingest path.
- Local capture defaults to RealityKit's reduced detail tier so the first real room test uses the
  least practical compute; medium is an explicit follow-up option after the visual gate.
- The free mode does not turn localhost into production infrastructure. COLMAP remains the remote
  owned-engine path and KIRI remains an explicit comparison/rollback adapter.

## Stroman-owned reconstruction engine foundation (2026-08-20)

- Added a signed, provider-neutral adapter for a Stroman-controlled photo-reconstruction worker;
  automatic selection prefers the owned worker while preserving KIRI as a deliberate rollback.
- Added a persistent single-flight worker with bounded per-photo uploads, MIME/magic/hash checks,
  timestamped nonce-protected HMAC authentication, restart recovery, safe subprocess invocation,
  bounded results, and direct GLB delivery.
- Added a reproducible GPU-container definition for COLMAP camera alignment, CUDA dense geometry,
  meshing, simplification, texturing, and `gltfpack` packaging. Deployed images require reviewed
  COLMAP digests and meshoptimizer commits rather than mutable production pins.
- The filmmaker now receives useful owned-engine stages and bounded percentages without exposing
  reconstruction plumbing or requiring page reloads.

## Reconstruction progress recovery (2026-08-20)

- Long-running photo reconstructions now expose honest upload, queue, and active-reconstruction
  progress without exposing provider plumbing. The workspace explains the normal intensive-scan
  window and keeps the original paid task active instead of encouraging a duplicate submission.
- Visible workspaces now refresh immediately and continue polling through a stable, single-flight
  loop without page reloads or duplicate requests from hidden tabs. **Check now** visibly enters a
  checking state and reports the last successful status check instead of appearing inert.

## Photo-to-space upload reliability fix (2026-08-20)

- Replaced the single 20–40-photo multipart request that could exhaust a production container with
  bounded, sequential, owner-scoped photo staging followed by an opaque-id job start.
- KIRI submission now uses an integrity-checked, fixed-length multipart stream that loads one
  preserved photo at a time instead of retaining or copying the complete photo set.
- The filmmaker sees per-photo upload progress, while the same 8 MB-per-photo, 180 MB-set,
  authentication, provenance, duplicate-evidence, provider-neutrality, and private-storage bounds
  remain enforced.
- Regression coverage exercises the maximum 40-photo browser sequence and proves the provider
  adapter never has more than one photo loader active.

## Authoritative 3D filmmaking workspace candidate (2026-08-14)

- Replaced the filmmaker-facing visual-planning hierarchy with one **Story → Plan → Edit**
  workspace. Internal Blueprint terminology is no longer primary navigation.
- Added a provider-neutral, persistent spatial shot state containing room/set pieces, uncertainty,
  camera position and target, height, focal length, aspect ratio, support, editable camera path,
  subject blocking, lighting/look/sound intent, and versioned saved shots.
- Plan now opens an interactive oblique 3D room and a real view through the selected camera. Dragging
  or keyboard-nudging the camera, target, subject, subject end, or movement end and changing
  lens/height/ratio updates the same state used by the visible frame, shooting information, and
  saved storyboard. Direct spatial edits are explicitly persisted as filmmaker-confirmed geometry.
- The permanent “Instruction at the Desk” fixture begins at a 35mm, desk-height, slightly off-axis
  locked medium-wide with phone, yellow reminder, drawer, keyboard, mug, green fluorescent light,
  and dry sound. Browser acceptance also saved physically distinct 48mm vertical dolly versions,
  including a keyboard-directed, filmmaker-confirmed version 3 whose state survived reload; the
  9:16 result is not a crop of the horizontal frame.
- Added real video understanding. The browser samples bounded representative frames from an
  imported video, the server sends them to the configured hosted vision provider, and the resulting
  **OBSERVED / ESTIMATED / UNKNOWN** claims persist against the original media asset. The truthful
  deterministic fallback never pretends byte metadata is visual understanding.
- The signed-in local application completed the full intent → hosted Story → interactive Plan →
  saved horizontal/vertical shots → transcript import/analysis → video import/hosted visual
  analysis → Edit workflow. Review evidence is recorded in
  `evaluations/artifacts/shot-planning-3d/REVIEW_EVIDENCE.md`.

Deployment remains paused. This candidate is not **READY FOR 3D SHOT-PLANNING HUMAN TEST** until
full verification, exact-head CI, independent product-meaning review, merge safeguards, and
post-merge main verification pass.

## Private web deployment candidate (2026-08-13)

- Closed the release-gate CI gap: GitHub Actions now runs format and OpenAPI validation,
  dependency audit, the real-PostgreSQL API and integration suites, and an exact-lock
  production-image build with an entrypoint smoke proving uid/gid 1001 and mounted-data writes.
- Added a persistent, server-enforced private-beta grant keyed to Stroman's stable internal user
  identity. A verified deployment-only email can atomically bootstrap exactly one owner; ongoing
  authorization never depends on email.
- Authenticated accounts without access see a coherent private-testing state, while direct and
  forged protected API requests fail with `403`. Authentication, identity-store, and access-store
  outages remain distinct fail-closed `503` responses.
- Added owner-verified CLI operations to inspect, grant, and revoke tester access with append-only
  audit events and no unauthenticated administration endpoint.
- Added a Railway Docker deployment contract with intentional migrations, database-backed
  readiness, exact release SHA reporting, managed PostgreSQL, and persistent source-import storage.
  Production config requires HTTPS, same-origin auth callback, and hosted OpenAI reasoning.
- Documented initial owner claim, trusted tester operations, Supabase URL configuration, backup,
  additive-schema rollback, single-replica storage limitation, and deployed desktop/mobile smoke
  requirements in `docs/PRIVATE_WEB_DEPLOYMENT.md`.

This is a release candidate only. It is not ready for private web human testing until exact-head CI
and independent review pass, reviewed `main` deploys, and the actual HTTPS production smoke sequence
passes.

## Hosted creative reasoning and frame-accurate visual planning (2026-08-11)

- The configured server-side OpenAI Responses provider completed a real request and then generated
  the Jimmy's Famous Meals calibration through the actual application path. The accepted result
  scored 94/100 and is stored with its exact provider output, application translation, visual
  quality report, and provider identity; no credential value or hidden reasoning is retained.
- Cross-mode hosted calibration now covers commercial, documentary, narrative, performance, and
  open development. The modes use materially different dramatic units and editorial laws rather
  than substituting project nouns into one template.
- A raw same-model general-purpose Jimmy lane is checked in for adversarial comparison. It supplies
  competent conventional coverage; Stroman instead makes the mother actively change the caregiving
  geometry, withholds the first clean product read until she sits, and names the tradeoff and
  falsification condition.
- An adversarial hosted fixture passed without following embedded prompt-injection language or
  inventing prohibited baby-face coverage.

- The symbolic storyboard has been replaced by four frame-specific shot pairs with independently
  composed 16:9 and 9:16 previs. Each frame places the subject and physical environment and carries
  a two-line camera/lens/height/movement/hold execution strip.
- Blocking, lighting, and look now answer separate questions. The Jimmy fixture directly labels
  Mom's START → 2 → END movement, attached baby privacy, and C1/C2 camera positions; anonymous
  red-dot blocking is retired.
- Creative Spine, Blueprint, and Deep Room provide progressive disclosure. Stage-aware defaults,
  ranked priorities, must-get/safety/optional coverage, first-class sound, restrained alternatives,
  and production-reality inputs keep the active decision prominent.
- Filmmakers can optionally add bounded, private, project-scoped scout photos. The calibration
  fixture uses two independently generated kitchen angles and distinguishes visible facts, inferred
  geometry, and filmmaker-confirmed geometry without claiming unseen space or dimensions.
- Arbitrary scout uploads are labeled as photo evidence awaiting geometry interpretation; they do
  not silently become invented windows, camera lanes, dimensions, or a photo-anchored layout.
- Spatial corrections regenerate the planning layer without re-entering project intent. The plan
  reports what changed and what remained, and refuses a malformed or visually incomplete update
  before persistence.
- The correction control defaults safely when one inferred claim is available while preserving an
  explicit “add a confirmed fact” path that does not retire any existing claim. Desktop and mobile
  evidence captures demonstrate both additive and replacing corrections.
- Exact deterministic intent-only and photo-anchored JSON fixtures are tracked for automated and
  independent review, and an evaluation gate now compares both checked-in outputs with the current
  generators to prevent stale evidence. Location photos and their hashes are tracked with the
  evaluation evidence.
- Captured hosted outputs can be rerendered through the current application translator without a
  new provider call. The rerender gate rejects semantic, mode, or visual regressions and produces a
  hosted scout-grounded Jimmy artifact from the same accepted creative direction.
- Dense storyboards use compact person, set, and action marks with a visible frame map. Multi-state
  blocking uses named route marks and a route strip, so project-specific information stays legible
  on desktop and mobile without anonymous red-dot grammar.
- Existing persisted symbolic blueprints fail closed into re-analysis instead of being silently
  presented through the new contract. The migration only adds nullable planning context and does
  not rewrite source, provenance, project, or user data.

Actual hosted output and rendered desktop/mobile artifacts cleared the local semantic, visual, and
browser calibration described in `docs/HOSTED_CREATIVE_CALIBRATION.md`. Exact-head CI, independent
Claude review of product meaning and rendered evidence, SHA verification, and post-merge main CI
remain mandatory before the release is declared **READY FOR HUMAN TESTING**.

## Corrective creative-development candidate — hosted proof pending (2026-08-10)

- Deep development now runs through a provider-neutral four-stage reasoning boundary:
  project understanding, distinct candidate generation, independent candidate critique, and
  synthesis. A strict OpenAI Responses/Structured Outputs adapter is selected when configured;
  the deterministic specialist remains an offline and safety fallback.
- Every result must clear a semantic gate for transformation, project specificity, actionability,
  distinctiveness, judgment, innovation, humanness, craft coherence, honesty, and visual
  completion before it can be persisted or shown.
- The offline deterministic engine is now an honest calibration/safety fallback: the tracked Jimmy
  reference can render reproducibly, while templated drafts for unsupported projects fail closed
  instead of being labeled complete. General creative development therefore requires the hosted
  provider path to be configured and proven.
- The reviewed PR #28 Jimmy's Famous Meals result is now a negative golden. Its replacement turns
  the brief into a film-specific thesis, four physical scene hypotheses, a recommendation with
  assumptions/sacrifice/change-my-mind evidence, and a fully argued convention break.
- The Director Notebook is now a concise set of shot/beat cards. The default creative screen no
  longer exposes the master prompt or provider plumbing.
- Stroman renders an actual pencil-style visual artifact: four storyboard drawings, a camera/
  subject/light blocking map, motion paths, and a project-specific look palette. The exact fixture
  output and two running-app screenshots live under `evaluations/artifacts/` for independent review.
- Accepted blueprints are persisted with their server-side provider id, so a refresh cannot silently
  regenerate a different creative decision. A migration adds the nullable JSON blueprint and
  provider-audit fields without rewriting existing briefs.
- Legacy template fields are stripped from the public and persisted blueprint. In particular, the
  retired “renderer not connected” contract can no longer contradict the rendered artifact.

Automated proof covers the negative golden, the Jimmy output, noun-substitution resistance,
embedded-instruction attacks, all five filmmaking modes, provider selection/fail-closed behavior,
strict hosted request construction, full unit/API suites, all migrations, and a production build.
The deterministic Jimmy artifact has also been inspected in the running app with zero browser
console errors. This candidate does **not** claim hosted creative quality until an owner supplies a
server-side hosted-reasoning credential and the real configured path clears the same fixture and
independent review.

## Human-test alpha 3 — idea-first development and director blueprint (2026-08-10)

- A filmmaker can now begin with only an idea. Audience, objective, emotion, format, access, and
  production constraints remain visible unknowns instead of required setup or invented facts.
- Develop & Plan recommends a specific creative direction with an audience effect, execution test,
  and tradeoff; compares three structurally distinct alternatives; and includes a defensible
  purposeful rule-break.
- Decision-changing questions, a mode-specific three-part picture-and-sound sequence sketch,
  production next steps, and a production-literate director notebook make the result useful before
  footage exists.
- The director notebook adapts its craft grammar to documentary, commercial, performance,
  narrative, or open development and covers composition, blocking, camera/lens, practicals and lighting,
  background/design, color/grade, movement, sound, must-get material, optional exploration, and
  production risk.
- Idea-stage output is explicitly labeled as creative hypothesis rather than source evidence. The
  provider-neutral rendering contract reports that no visual renderer is configured and never
  pretends that storyboard frames were generated.
- The permanent creative-intelligence doctrine and evaluation fixture now protect specialized
  search, anti-genericness, purposeful innovation, filmmaker authority, and the connected Develop
  & Plan / Analyze & Edit product direction.

Existing ownership, project isolation, provenance, source integrity, evidence grounding, review
independence, and human creative authority remain unchanged. This alpha is a deterministic,
provider-neutral development baseline; it does not claim hosted-model or visual-renderer quality.

## Human-test alpha 2 — import reliability and editorial signal (2026-08-10)

- Successful transcript imports no longer become false client failures when the upload form is
  reset after an asynchronous HTTP 201 response.
- Analysis now ignores generic speaker metadata and short slate/test/closing chatter, ranks
  substantive source moments, and only proposes a story progression when the transcript contains
  grounded change or causality signals.
- Recurring-language suggestions require repetition across multiple substantive moments and omit
  common conversational filler. Excerpts stop at readable word or sentence boundaries.
- The analysis workspace now separates direct source material from editorial interpretations and
  frames recommendations as filmmaker-controlled tests with an explicit explanation of why they
  may matter.
- Project intent prose now normalizes whitespace and terminal punctuation without rewriting the
  filmmaker's stated goal.
- The durable product direction now covers the complete pre-footage and post-footage filmmaking
  continuum and protects the shared intent–evidence bridge from transcript-only optimization.

Existing ownership, provenance, evidence grounding, source persistence, human authority, and
Autopilot stop/SHA/review safeguards are unchanged. This alpha does not claim hosted-model quality,
deployment readiness, or authorization for Prompt 018.

## Prompt 017 — Database indexes and constraints (2026-08-10)

- PostgreSQL now rejects cross-owner relationships in legacy memory, story-reasoning, and
  knowledge-acquisition records.
- Knowledge observations must reference documents, acquisition runs, and sources belonging to
  the same owner and source lineage.
- Compound indexes now match owner/source/project list filters and deterministic creation-time
  ordering; knowledge-observation alignment indexes use explicit PostgreSQL-safe catalog names.
- No filmmaker-facing behavior or terminology changed; this is persistence hardening only.

Automated evidence: the Autopilot host gate passed Prisma formatting and generation,
typecheck, lint, format check, unit tests, real-PostgreSQL integration tests, production build,
and diff validation after remediation. The database suite checks every owner-aligned foreign
key and the exact alignment-index catalog names. Exact-head CI passed, independent Claude
review approved the remediated commit with only OPTIONAL findings, and post-merge `main` CI
passed. Manual SQL inspection is not represented as runtime proof.
