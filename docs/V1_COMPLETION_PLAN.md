# Stroman OS V1 functional completion plan

This is the execution queue for the functional V1 pass. Work proceeds in phase order unless a
phase exposes a prerequisite or an independent test can safely run concurrently. A checked item
requires implementation and proportionate verification; prose or a passing partial test is not
completion.

## Permanent acceptance rules

- Preserve filmmaker authority. Stroman proposes; the filmmaker keeps, revises, rejects, defers, or
  decides.
- Preserve provenance. Source observation, reasonable interpretation, creative hypothesis, and
  proposed execution remain distinct.
- Preserve provider-neutral architecture and deterministic/offline behavior where appropriate.
- Do not weaken authentication, ownership, optimistic concurrency, CI, exact-SHA review, or source
  preservation.
- Do not extend 3D reconstruction during this pass unless required to fix data loss, false certainty,
  or a broken existing V1 path.
- Use targeted tests while iterating. Run the complete validation and authenticated runtime journey
  once after final integration, then repeat only failed gates after fixes.

## Phase 0 — evidence audit and scope control

- [x] Inspect repository structure, routes, schema, domains, applications, infrastructure, UI, docs,
  prompts, evaluations, migrations, and automated tests.
- [x] Reconcile stale milestone documentation with current runtime capability.
- [x] Record complete, partial, broken, not-started, and deferred capability state in
  `docs/V1_CURRENT_STATE.md`.
- [x] Record the ordered V1 execution and verification plan in this document.
- [ ] Keep both documents current as findings, scope decisions, and acceptance evidence change.

## Phase 1 — project foundation and recoverable state

- [x] Add an owner-scoped project rename use case through domain, application, persistence, HTTP,
  client, and UI boundaries.
- [x] Require the existing optimistic-concurrency token for rename and return an actionable stale
  state conflict.
- [x] Expose activate, complete, archive, and reopen/restore behavior through one coherent project
  settings surface, adding only domain transitions that V1 truly needs.
- [x] Ensure project list/detail empty, loading, unauthorized, missing, stale, and service-failure
  states give a recoverable next action.
- [x] Add targeted domain/application/API/UI coverage for project editing and lifecycle recovery.

Verification: typecheck; 34 focused domain/application/UI tests; 8 real-PostgreSQL project API
tests; focused ESLint; OpenAPI validation (92 paths); formatting and whitespace checks.

**Acceptance:** an authenticated owner can create, rename, advance, archive, and recover a project;
a second owner cannot see or mutate it; stale writes do not overwrite current state.

## Phase 2 — structured intent and project memory

- [ ] Define the minimum structured intent fields: objective, audience, mode, runtime, platform,
  desired audience effect, references, constraints, client requirements, non-negotiables, and
  success criteria.
- [ ] Add backward-compatible persistence and migration without rewriting existing brief meaning.
- [ ] Present one concise intent editor with progressive disclosure and explicit save/revision state.
- [ ] Preserve an inspectable revision history or durable memory record for consequential intent
  changes.
- [ ] Compose current intent into Develop, Build, Edit, Review, decisions, and exports.
- [ ] Cover migration, ownership, revision, concurrency, and legacy-project behavior.

**Acceptance:** the filmmaker can return later and see what the project is trying to achieve, what
changed, and which current outputs used that intent.

## Phase 3 — source inventory and evidence inspection

- [ ] Replace ambiguous source statuses with uploading/processing/ready/retryable/failed states and
  plain-language recovery.
- [ ] Preserve original input on retryable failure and support retry without unnecessary re-upload.
- [ ] Normalize transcript, audio/video, script/brief/note document, and reference-image intake into
  one source inventory while preserving type-specific processing.
- [ ] Add an evidence inspector that opens the exact transcript excerpt or sampled frame supporting
  an observation, interpretation, recommendation, or decision.
- [ ] Surface uncertainty, missing coverage, and processing provenance without exposing system
  plumbing by default.
- [ ] Add authorization, integrity, retry, reload, and browser-level regression coverage.

**Acceptance:** every source is durable and understandable; every cited claim can be inspected in
its original context; recoverable failures never discard the input.

## Phase 4 — Develop completion

- [ ] Organize creative output around proposed direction, why it matters, tradeoff, confidence,
  evidence/intent basis, alternatives, and filmmaker action.
- [ ] Make distinct alternatives differ in organizing principle and audience effect rather than
  noun substitution.
- [ ] Promote a recommendation into a durable decision without copying internal IDs or prose.
- [ ] Ensure scenes and craft choices are project-specific, concrete, and executable.
- [ ] Extend hosted/deterministic fixtures and semantic gates for anti-genericness and traceability.

**Acceptance:** supported modes produce useful, distinct, project-dependent creative thought and
the filmmaker can accept, revise, reject, or defer it without losing context.

## Phase 5 — Build and authoritative shot planning

- [ ] Connect approved story recommendations to editable shots with preserved rationale.
- [ ] Verify camera, lens, height, aim, blocking, movement, light, look, sound, and production notes
  share one authoritative shot state.
- [ ] Verify separately authored 16:9 and 9:16 compositions; never treat a crop as a second plan.
- [ ] Ensure saving a viewer adjustment updates the storyboard and shooting information.
- [ ] Produce a concise, printable/shareable shot-plan artifact.
- [ ] Add targeted state-transition, rendering-contract, and browser coverage.

**Acceptance:** a serious filmmaker can identify where the camera and subject go, what the frame is,
why it serves the film, and how to execute it.

## Phase 6 — narrow Space Scan completion

- [ ] Retain current GLB, Apple reconstruction, and overlapping-photo paths; do not add new 3D
  technology.
- [ ] Gate “ready” on usable evidence and honest geometry/coverage status.
- [ ] Produce a concise room shoot brief: usable views, observed constraints, estimates, unknowns,
  no-go areas, and filmmaker corrections.
- [ ] Verify preserved-input retry, outage recovery, duplicate prevention, reload persistence, and
  project selection for all three input methods.
- [ ] Ensure incomplete/distorted reconstruction asks for actionable coverage or replacement instead
  of claiming a shootable room.

**Acceptance:** a prepared room adds trustworthy planning context without forcing the filmmaker to
interpret warped or falsely precise geometry.

## Phase 7 — Analyze & Edit completion

- [ ] Synthesize transcript and visual observations through one evidence-aware project analysis.
- [ ] Present the intent–evidence bridge: intended, captured, supported story, exceeded plan,
  missing, and next action.
- [ ] Make counter-evidence and uncertainty visible for editorial interpretations.
- [ ] Promote edit recommendations and alternatives into durable decisions.
- [ ] Preserve empty-state success for insufficient signal and grounded literal evidence.
- [ ] Add cross-source, contradiction, chatter-only, reload, and browser regression fixtures.

**Acceptance:** the filmmaker can see what the material actually supports, inspect why, and make an
authoritative edit decision without generic AI narration.

## Phase 8 — unified decision engine

- [ ] Define one recommendation-to-decision contract shared by Develop, Build, and Edit.
- [ ] Link advisory evidence to canonical evidence references where source material exists.
- [ ] Support keep/revise/reject/defer semantics while preserving immutable final selection.
- [ ] Record rationale, tradeoff, confidence/uncertainty, decision owner, and affected artifact.
- [ ] Show when an upstream intent/evidence change makes a decision worth revisiting.
- [ ] Cover ownership, concurrency, provenance, and no-AI-decision invariants.

**Acceptance:** consequential recommendations end in an inspectable human choice, not a transient
card or model answer.

## Phase 9 — Review mode

- [ ] Add a project Review destination using existing evaluation/review foundations where suitable.
- [ ] Summarize current intent, evidence, key recommendations, accepted/rejected/deferred decisions,
  missing coverage, conflicts, and unresolved actions.
- [ ] Allow the filmmaker to inspect evidence and jump back to revise the affected artifact.
- [ ] Distinguish product review from internal rubric/reviewer plumbing.
- [ ] Add empty, complete, conflict, insufficient-evidence, and ownership coverage.

**Acceptance:** before handoff, the filmmaker can answer what the film is, why current decisions were
made, what evidence supports them, and what remains unresolved.

## Phase 10 — exports and handoff

- [ ] Define an exportable project snapshot tied to current intent and decision versions.
- [ ] Export a treatment/creative brief, shot plan, edit brief, decision record, and review packet in
  appropriate human-readable formats.
- [ ] Provide structured JSON/CSV where it adds durable downstream value.
- [ ] Keep unsupported third-party integrations explicitly manual.
- [ ] Verify filename safety, ownership, content integrity, empty states, and snapshot consistency.

**Acceptance:** exports are understandable outside Stroman OS and exactly reflect the approved
project state that produced them.

## Phase 11 — cross-mode acceptance

- [ ] Maintain commercial, documentary, narrative, performance, and ambiguous/open fixtures.
- [ ] Verify mode differences affect creative reasoning, evidence use, structure, scenes, craft, and
  review—not just labels.
- [ ] Compare relevant hosted outputs with a strong general-purpose baseline where the existing
  evaluation architecture supports it.
- [ ] Record honest limitations when hosted calibration cannot run without a configured environment.

**Acceptance:** each mode demonstrates materially different filmmaking thought while preserving the
same authority and evidence rules.

## Phase 12 — reliability benchmark and final runtime gate

- [ ] Run migrations against a fresh and an existing compatible database state.
- [ ] Run typecheck, lint, formatting, OpenAPI validation, unit, real-PostgreSQL API/integration,
  worker, evaluation, Playwright, security, and production-build gates.
- [ ] Exercise the complete authenticated intent → sources → analysis → decisions → review → export
  journey in the running app.
- [ ] Exercise GLB, connected-Mac reconstruction, and regular-photo room inputs without paid
  reconstruction.
- [ ] Verify retry, reload, outage, duplicate, stale-write, cross-owner, and failure-reporting paths.
- [ ] Capture reproducible evidence and exact human-testing instructions.

## Phase 13 — final audit, independent review, and release report

- [ ] Re-scan TODO/FIXME/HACK/placeholder/mock markers and classify every real V1 item as resolved,
  accepted limitation, or explicit deferral.
- [ ] Reconcile `V1_CURRENT_STATE.md`, this plan, OpenAPI, schema, migrations, and release notes with
  the final implementation.
- [ ] Freeze the exact final SHA and obtain independent Claude review of product meaning, runtime
  evidence, and implementation.
- [ ] Remediate all BLOCKING and IMPORTANT findings and repeat exact-head verification.
- [ ] Push through the established non-force PR/CI/merge process and verify post-merge main CI.
- [ ] Publish the final V1 report with exact SHA, verification evidence, limitations, and human-test
  procedure.

## Completion condition

The queue remains active while any executable item above is unchecked. “FUNCTIONALLY COMPLETE V1”
and “READY FOR HUMAN TESTING” are permitted only when Phases 0–13 are closed or a remaining item is
explicitly deferred outside V1 with evidence that it does not break the connected filmmaking
decision loop.
