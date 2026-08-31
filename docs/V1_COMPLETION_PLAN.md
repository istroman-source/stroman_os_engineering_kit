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

- [x] Define the minimum structured intent fields: objective, audience, mode, runtime, platform,
  desired audience effect, references, constraints, client requirements, non-negotiables, and
  success criteria.
- [x] Add backward-compatible persistence and migration without rewriting existing brief meaning.
- [x] Present one concise intent editor with progressive disclosure and explicit save/revision state.
- [x] Preserve an inspectable revision history or durable memory record for consequential intent
  changes.
- [ ] Compose current intent into Develop, Build, Edit, Review, decisions, and exports.
- [x] Cover migration, ownership, revision, concurrency, and legacy-project behavior.

Implemented locally: structured intent and immutable revision snapshots now cross domain,
persistence, HTTP, hosted/deterministic reasoning, and filmmaker UI boundaries. Fresh-database
migrations, repository concurrency, owner-scoped API history, legacy omitted fields, hosted prompt
propagation, and evaluations are verified. The remaining composition checkbox closes with the
Edit, decision, Review, and export phases because those filmmaker-facing consumers do not all exist
yet.

**Acceptance:** the filmmaker can return later and see what the project is trying to achieve, what
changed, and which current outputs used that intent.

## Phase 3 — source inventory and evidence inspection

- [x] Replace ambiguous source statuses with uploading/processing/ready/retryable/failed states and
  plain-language recovery.
- [x] Preserve original input on retryable failure and support retry without unnecessary re-upload.
- [x] Normalize transcript, audio/video, script/brief/note document, and reference-image intake into
  one source inventory while preserving type-specific processing.
- [x] Add an evidence inspector that opens the exact transcript excerpt or sampled frame supporting
  an observation, interpretation, recommendation, or decision.
- [x] Surface uncertainty, missing coverage, and processing provenance without exposing system
  plumbing by default.
- [ ] Add authorization, integrity, retry, reload, and browser-level regression coverage.

Implemented locally: every accepted upload now creates a durable processing receipt after its
original bytes are retained; transient persistence failures become single-claim retryable records,
and unreadable/corrupt inputs remain visible as replacement-required records. The UI distinguishes
uploading, processing, ready, retryable, and terminal states, polls interrupted processing, and can
retry preserved input. Owner-scoped transcript evidence opens inline at the exact cited segment
with neighboring context. Each analyzed sampled frame is now integrity-hashed, retained, linked only
to the claims that cite it, and served through an owner-scoped no-store route inside the inspector.
Video, audio, transcripts/scripts, project documents, and reference images share the durable
inventory while keeping transcript parsing and video-frame analysis type-specific. The final
authenticated browser gate remains open.

**Acceptance:** every source is durable and understandable; every cited claim can be inspected in
its original context; recoverable failures never discard the input.

## Phase 4 — Develop completion

- [x] Organize creative output around proposed direction, why it matters, tradeoff, confidence,
  evidence/intent basis, alternatives, and filmmaker action.
- [x] Make distinct alternatives differ in organizing principle and audience effect rather than
  noun substitution.
- [x] Promote a recommendation into a durable decision without copying internal IDs or prose.
- [x] Ensure scenes and craft choices are project-specific, concrete, and executable.
- [x] Extend hosted/deterministic fixtures and semantic gates for anti-genericness and traceability.

Implemented locally: Develop now leads with one explicit proposed direction and separates its
project-specific value, story engine, real sacrifice, calibrated working confidence, uncertainty,
and typed intent/evidence/hypothesis basis. One action creates a new owner-scoped open Choice with
fresh option identifiers, all materially distinct directions, a reject-and-redevelop option, the
recommendation as advisory rather than selection, and its traceable basis. Hosted structured
outputs and the deterministic specialist now emit the same reasoning contract. The semantic gate
rejects missing confidence, missing intent/evidence traceability, repeated alternative story
engines or audience journeys, generic substitution, incomplete craft, and unsupported innovation.
Targeted domain/application/provider/UI/API-client tests pass (66 tests), with typecheck, focused
ESLint, formatting, and whitespace validation clean.

**Acceptance:** supported modes produce useful, distinct, project-dependent creative thought and
the filmmaker can accept, revise, reject, or defer it without losing context.

## Phase 5 — Build and authoritative shot planning

- [ ] Connect approved story recommendations to editable shots with preserved rationale.
- [x] Verify camera, lens, height, aim, blocking, movement, light, look, sound, and production notes
  share one authoritative shot state.
- [x] Verify separately authored 16:9 and 9:16 compositions; never treat a crop as a second plan.
- [x] Ensure saving a viewer adjustment updates the storyboard and shooting information.
- [x] Produce a concise, printable/shareable shot-plan artifact.
- [ ] Add targeted state-transition, rendering-contract, and browser coverage.

Implemented locally: the saved spatial shot is now the single production state for camera position,
aim, lens, height, aspect ratio, support, movement, subject/blocking, action, light, look, sound,
production notes, creative rationale, geometry confidence, and direction provenance. Saving produces
an exact rendered storyboard frame and shooting card from that state; reload persistence already
crosses the planning application/repository boundary. Horizontal and vertical setups remain
separate saved versions and targeted UI coverage proves their focal length and aspect state do not
collapse into a crop. The same saved state produces downloadable plain-text and printable shot-plan
handoffs. Linking only a filmmaker-approved (rather than merely proposed) direction awaits the
unified decision contract in Phase 8; authenticated browser acceptance remains in Phase 12.

**Acceptance:** a serious filmmaker can identify where the camera and subject go, what the frame is,
why it serves the film, and how to execute it.

## Phase 6 — narrow Space Scan completion

- [x] Retain current GLB, Apple reconstruction, and overlapping-photo paths; do not add new 3D
  technology.
- [x] Gate “ready” on usable evidence and honest geometry/coverage status.
- [x] Produce a concise room shoot brief: usable views, observed constraints, estimates, unknowns,
  no-go areas, and filmmaker corrections.
- [ ] Verify preserved-input retry, outage recovery, duplicate prevention, reload persistence, and
  project selection for all three input methods.
- [x] Ensure incomplete/distorted reconstruction asks for actionable coverage or replacement instead
  of claiming a shootable room.

Implemented locally without adding reconstruction technology: both uploaded GLB and connected-Mac
photo reconstruction pass through one deterministic geometry-readiness assessment. Plausible
geometry remains clearly estimated and gets a concise shoot brief covering usable exploration,
observed bounds, estimates, unknown semantic structure, and unverified/no-go space. Empty,
implausibly low/tall, too-narrow, or severely stretched bounds are retained as `NEEDS_ATTENTION`
rather than `READY`; the normal planning viewer is withheld and the UI asks for specific overlapping
coverage or a complete replacement GLB. Original evidence and incomplete geometry remain preserved
and inspectable behind disclosure. Targeted domain/application/UI tests pass (18 tests), and the
owner-scoped real-PostgreSQL location API suite passes (4 tests) against all 27 migrations. The full
three-input outage/reload/project-selection runtime matrix remains in Phase 12.

**Acceptance:** a prepared room adds trustworthy planning context without forcing the filmmaker to
interpret warped or falsely precise geometry.

## Phase 7 — Analyze & Edit completion

- [x] Synthesize transcript and visual observations through one evidence-aware project analysis.
- [x] Present the intent–evidence bridge: intended, captured, supported story, exceeded plan,
  missing, and next action.
- [x] Make counter-evidence and uncertainty visible for editorial interpretations.
- [x] Promote edit recommendations and alternatives into durable decisions.
- [x] Preserve empty-state success for insufficient signal and grounded literal evidence.
- [ ] Add cross-source, contradiction, chatter-only, reload, and browser regression fixtures.

Implemented locally: every analysis run now records whether it came from transcript or sampled visual
media. The project result selects the newest completed run for each source type, so a later visual
pass cannot erase current transcript findings and an empty transcript pass cannot revive stale
claims. The Edit Engine now leads with a compact intent–evidence bridge covering intended outcome,
captured facts, supported story, possible material beyond the brief, explicit gaps, and the next
advisory action. Interpretations show scored uncertainty and a concrete counter-evidence check.
Recommendations can become open owner-scoped decisions with alternate recommendations plus explicit
revise and reject paths; no option is silently selected. Targeted domain, application, and UI tests
pass (30 tests), and the analysis repository passes against a fresh local PostgreSQL database with
all 28 migrations. The remaining fixture item is reserved for the complete contradiction/reload and
authenticated browser matrix in Phase 12.

**Acceptance:** the filmmaker can see what the material actually supports, inspect why, and make an
authoritative edit decision without generic AI narration.

## Phase 8 — unified decision engine

- [x] Define one recommendation-to-decision contract shared by Develop, Build, and Edit.
- [x] Link advisory evidence to canonical evidence references where source material exists.
- [x] Support keep/revise/reject/defer semantics while preserving immutable final selection.
- [x] Record rationale, tradeoff, confidence/uncertainty, decision owner, and affected artifact.
- [x] Show when an upstream intent/evidence change makes a decision worth revisiting.
- [x] Cover ownership, concurrency, provenance, and no-AI-decision invariants.

Implemented locally: Develop directions, saved Build shots, and Edit recommendations now use one
recommendation-to-decision contract. Every generated proposal provides explicit keep, revise,
reject, and defer paths; alternatives remain optional proposals and only the authenticated owner can
finalize a selection with an immutable rationale. Decisions record their originating stage, affected
artifact and version, structured tradeoff and uncertainty, and canonical evidence identifiers.
Changes to project intent, planning, or source analysis conservatively mark affected choices for
review, and an explicit human decision clears that warning. Ownership, evidence provenance,
optimistic concurrency, stale-choice behavior, and the invariant that advisory output never decides
are covered across domain, application, UI, HTTP, and fresh-PostgreSQL persistence tests. All 30
migrations apply cleanly in the verified fresh-database path.

**Acceptance:** consequential recommendations end in an inspectable human choice, not a transient
card or model answer.

## Phase 9 — Review mode

- [x] Add a project Review destination using existing evaluation/review foundations where suitable.
- [x] Summarize current intent, evidence, key recommendations, accepted/rejected/deferred decisions,
  missing coverage, conflicts, and unresolved actions.
- [x] Allow the filmmaker to inspect evidence and jump back to revise the affected artifact.
- [x] Distinguish product review from internal rubric/reviewer plumbing.
- [x] Add empty, complete, conflict, insufficient-evidence, and ownership coverage.

Implemented locally: every project now has a filmmaker-facing Review destination that assembles the
current intent and direction, source inventory, latest evidence by source type, editorial
interpretations, recommendations, accepted/rejected/deferred/open choices, stale-choice conflicts,
coverage gaps, and unresolved actions. Source facts remain visibly separate from interpretations;
the filmmaker can return directly to Idea, Footage & notes, or a specific choice to inspect proof or
revise the affected work. This is deliberately separate from Stroman's internal rubric and reviewer
infrastructure. Empty, complete, conflict, insufficient-evidence, reload-recovery, navigation, and
cross-owner denial paths pass at the application, UI, and authenticated real-PostgreSQL HTTP layers.

**Acceptance:** before handoff, the filmmaker can answer what the film is, why current decisions were
made, what evidence supports them, and what remains unresolved.

## Phase 10 — exports and handoff

- [x] Define an exportable project snapshot tied to current intent and decision versions.
- [x] Export a treatment/creative brief, shot plan, edit brief, decision record, and review packet in
  appropriate human-readable formats.
- [x] Provide structured JSON/CSV where it adds durable downstream value.
- [x] Keep unsupported third-party integrations explicitly manual.
- [x] Verify filename safety, ownership, content integrity, empty states, and snapshot consistency.

Implemented locally: Review now offers private downloads for the treatment, shot plan, edit brief,
decision record, and complete review packet, plus a structured project JSON snapshot and a
spreadsheet-safe decision CSV. Every export carries the same deterministic snapshot identifier and
records the exact creative-intent and decision lock versions that produced it. The generator rereads
those versions before returning and rejects a torn snapshot if the project changes mid-generation.
Human-readable shot plans include separately composed 16:9 and 9:16 proposals plus exact saved
filmmaker shots where present. Filenames are normalized, CSV formula injection is neutralized,
downloads are private/no-store, and unsupported transfers remain explicit manual handoffs. Empty,
ownership, filename, structured-content, concurrency, UI-link, and authenticated HTTP behavior pass.

**Acceptance:** exports are understandable outside Stroman OS and exactly reflect the approved
project state that produced them.

## Phase 11 — cross-mode acceptance

- [x] Maintain commercial, documentary, narrative, performance, and ambiguous/open fixtures.
- [x] Verify mode differences affect creative reasoning, evidence use, structure, scenes, craft, and
  review—not just labels.
- [x] Compare relevant hosted outputs with a strong general-purpose baseline where the existing
  evaluation architecture supports it.
- [x] Record honest limitations when hosted calibration cannot run without a configured environment.

Implemented and revalidated: durable hosted application-path artifacts cover commercial,
documentary, narrative, performance, and open/ambiguous projects. The evaluation gate verifies the
real provider metadata, current Blueprint schema, application semantic gate, score of at least 85,
non-generic substitution signal, scene-level action and turn, mode-specific camera/sound craft, and
independent 16:9/9:16 compositions. Direction titles, story engines, formal strategies, opening
actions, camera choices, and sound choices are materially distinct across all five modes. The Jimmy
artifact remains paired with a raw general-purpose baseline; concrete weaknesses such as center-safe
cropping and generic craft defaults are recorded without turning model self-scoring into a claimed
human verdict. Re-running hosted calls requires an explicitly configured owner credential and usage;
offline drafts continue to fail closed. The full evaluation suite passes 28/28, and deterministic
checked-in artifacts were regenerated to match the current confidence and basis schema exactly.

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
