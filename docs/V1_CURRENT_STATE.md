# Stroman OS V1 current state

Last audited: 2026-08-30  
Audit baseline: `d023cb474448144cf963ec9891025cad57e3eba4`

This is the authoritative functional audit for the V1 completion pass. It describes what the
running code can support, not what early milestone documents expected to exist. Older readiness
and limitations documents remain useful release history but are not a reliable inventory of the
current product.

## Classification

- **COMPLETE** — implemented, durable, owner-scoped where required, and covered at an appropriate
  automated layer.
- **PARTIAL** — a real workflow exists, but one or more V1 acceptance conditions are missing.
- **BROKEN** — an implemented V1 path has a reproducible correctness failure.
- **NOT STARTED** — no filmmaker-facing workflow exists yet.
- **DEFERRED** — deliberately outside the functional V1 boundary.

## Executive state

Stroman OS already has a strong modular foundation: private authentication, owner-scoped projects,
durable creative briefs, transcript and media intake, evidence-grounded transcript analysis,
provider-neutral creative reasoning, editable visual planning, decisions, prepared rooms, and a
Mac reconstruction worker. The missing V1 is not another platform rewrite. It is the functional
connection between those capabilities: complete project state, structured intent, inspectable
evidence, coherent recommendations and decisions, a human Review mode, and useful exports.

No current finding justifies expanding the 3D/reconstruction system during this pass. Existing room
work is retained and tested, but V1 effort goes to the filmmaking decision loop.

## Capability inventory

### 1. Identity, ownership, and project foundation — COMPLETE LOCALLY; RUNTIME GATE PENDING

**Complete**

- Private sign-in, HttpOnly session handling, refresh, sign-out, CSRF policy, and owner-scoped API
  access are implemented.
- Projects can be created, listed, opened, activated, completed, and archived with optimistic
  concurrency in the domain, persistence, and HTTP layers.
- Project records and all principal creative resources persist in PostgreSQL.
- Cross-owner access is denied by the application layer and covered in API/application tests.

**Completed in the functional pass**

- Owners can rename a project through domain, application, persistence, HTTP, browser-client, and
  UI boundaries using exact optimistic-concurrency tokens.
- Project settings now expose start, complete, archive, reopen, and restore behavior without
  deleting project history.
- Project list/detail failures can be retried in place; missing projects have a safe exit; stale
  mutations preserve the filmmaker's input and explain the required reload.
- Domain/application/UI tests and real-PostgreSQL API tests cover the new behavior. Authenticated
  running-browser acceptance remains part of the final runtime gate.

**Documentation drift**

- Some operational readiness documents still describe authentication and database models as absent;
  this is historical documentation drift, not a runtime defect.

### 2. Project intent and creative memory — COMPLETE LOCALLY; DOWNSTREAM COMPOSITION PENDING

**Complete**

- Each project can persist and revise a creative brief containing title/client/project type,
  creative goal, audience, desired emotion, context, blueprint, provider metadata, and planning
  context.
- Saving intent regenerates a provider-neutral creative blueprint atomically.
- A durable memory/knowledge graph exists behind application and persistence boundaries.

**Completed in the functional pass**

- Runtime, delivery platform, references, restrictions, client requirements, non-negotiables, and
  success criteria are first-class structured intent while legacy clients and rows safely normalize
  omitted values to empty text.
- Every initial save and consequential revision records an immutable, owner-scoped intent snapshot.
- The Analyze editor keeps the required intent concise, progressively discloses production detail,
  and exposes an inspectable revision timeline without provider or system plumbing.
- Current structured intent is included in hosted and deterministic creative reasoning; migration,
  ownership, revision order, concurrency, legacy input, and prompt propagation have targeted
  automated coverage.

**Missing for V1**

- Edit, unified decisions, Review, and exports must consume the same current intent snapshot as
  those later V1 surfaces are completed.
- The broader memory graph remains an internal foundation; V1 surfaces its useful state through
  intent history and the later Review packet rather than exposing graph plumbing.

### 3. Sources, evidence, and media understanding — PARTIAL

**Complete**

- Project-scoped video, audio, and transcript imports persist original metadata and status.
- Transcript parsing supports SRT, VTT, JSON, and plain text.
- Video frames can be sampled in the browser and analyzed through a provider-neutral visual
  boundary.
- Transcript analysis creates versioned runs, evidence references, source-backed observations,
  interpretations, recommendations, and recommendation-evidence joins.
- Grounded analysis rejects fabricated citations and preserves empty states for insufficient signal.

**Completed in the functional pass**

- Source intake now exposes honest uploading, processing, ready, retryable, and replacement-required
  states with plain-language next actions.
- Original bytes are retained before processing is attempted. Transient completion failures create
  a durable retryable receipt, and retry claims the preserved input once without another upload.
- Video, audio, transcripts/scripts, briefs/notes/documents, and reference images share one durable
  inventory while transcript parsing and video-frame analysis retain type-specific behavior.
- Unreadable or integrity-invalid files remain visible but cannot be unsafely retried.
- Transcript evidence can be opened from observations, interpretations, and recommendations at the
  exact cited excerpt with neighboring context, source identity, speaker, and time range.
- Sampled video frames are retained with byte size, digest, source time, and owner/project
  provenance; the inspector renders the exact cited image through an integrity-checked private
  route rather than forcing the filmmaker to translate a timestamp.
- Targeted domain/UI tests, repository integration tests, and real-PostgreSQL HTTP tests cover
  preservation, retry, reload representation, ownership, and terminal replacement behavior.

**Missing for V1**

- Transcript and sampled-frame understanding are separate paths; the primary analysis does not yet
  synthesize both as one evidence set.
- Source processing progress and recovery require stronger browser-level acceptance coverage.

### 4. Develop — COMPLETE LOCALLY; CROSS-MODE RUNTIME GATE PENDING

**Complete**

- Develop & Plan accepts project intent and produces structured story, directions, rationale,
  alternatives, scenes, interview strategy, production thinking, and storyboard artifacts.
- Creative reasoning is provider-neutral, with a hosted path and a deterministic offline/testing
  specialist.
- Permanent doctrine rejects generic restatement, unsupported certainty, and fake spatial claims.
- Storyboard frames, blocking, lighting, look, sound, and execution information are separately
  represented.

**Completed in the functional pass**

- The default Develop surface now leads with one proposed direction and clearly separates why it
  matters for this project, its story engine, sacrifice, calibrated confidence, uncertainty, typed
  intent/evidence/hypothesis basis, and the filmmaker's next action.
- Hosted and deterministic directions share the same traceability contract. The semantic quality
  gate rejects missing basis/confidence, repeated alternative story engines or audience effects,
  generic noun substitution, incomplete physical craft, and unsupported innovation.
- A recommendation can become a durable open Choice in one action. The bridge generates new
  decision-local option identifiers, carries visible rationale and traceable basis, includes the
  materially distinct alternatives plus a reject-and-redevelop option, and records Stroman's
  recommendation only as advisory. No option is selected for the filmmaker.
- Existing scene gates require concrete physical action, a distinct dramatic turn, project-specific
  causality, complete camera/blocking/light/design/color/sound thinking, and honest constraints.

**Remaining release gate**

- Phase 11 verifies the contract across commercial, documentary, narrative, performance, and open
  fixtures; Phase 12 exercises the authenticated running promotion and human-decision journey.

### 5. Build / shot planning — PARTIAL

**Complete**

- Planning supports camera state, scene state, saved shots, separate horizontal and vertical
  compositions, blocking, lighting, look, sound, movement, and production reality.
- Camera state is editable and storyboard artifacts derive from structured state rather than a flat
  screenshot.
- Location grounding is optional and uncertainty labels distinguish observed, estimated, unknown,
  and filmmaker-confirmed claims.

**Missing for V1**

- The path from an approved story recommendation to an editable shot is not a single obvious
  workflow.
- The application needs stronger tests that a saved camera adjustment updates the authoritative shot
  and storyboard representation without losing intent/evidence links.
- Shot-plan output needs a concise printable/shareable production artifact.

### 6. Space Scan / prepared rooms — PARTIAL (narrow V1 scope)

**Complete**

- Owner-scoped prepared rooms accept GLB input or 20–40 overlapping photos.
- Inputs, reconstruction jobs, leases, retries, worker status, failure reports, and results are
  durable.
- A free connected-Mac Apple reconstruction worker can claim jobs and return a GLB without KIRI,
  RunPod, or paid reconstruction.
- Ready rooms can be selected for project grounding and opened in a camera viewer.

**Missing for V1**

- V1 needs a concise shoot-brief use of existing room evidence and honest uncertainty, not more 3D
  technology.
- The three input paths need exact acceptance coverage from preserved input through ready room and
  project selection.
- Distorted or incomplete geometry must fail honestly or request useful coverage rather than appear
  shoot-ready.

### 7. Analyze & Edit — PARTIAL

**Complete**

- The materials workspace composes source intake, automatic analysis, Edit Engine, and prompt
  handoff.
- Source-backed observations and editorial interpretations are visually and semantically separated.
- Edit Engine presents current story, observations, recommendations, alternatives, and production
  prompts.
- Insufficient evidence completes with informative empty states instead of inventing findings.

**Missing for V1**

- Analysis needs one evidence inspector spanning transcript excerpts and sampled frames.
- Edit recommendations are not yet promoted into the same durable human-decision workflow used by
  Choices.
- The intent–evidence comparison is distributed across sections rather than summarized as “intended,
  captured, supported, missing, next”.

### 8. Decision engine and filmmaker authority — PARTIAL

**Complete**

- Decisions, options, advisories, advisory evidence, selected options, notes, timestamps, ownership,
  and optimistic concurrency are durable.
- Human decisions are authoritative; AI advisory cannot decide on the filmmaker’s behalf.
- A plain-language Choices UI supports proposing, comparing, and recording consequential choices.

**Missing for V1**

- Edit recommendations are not yet one-click inputs to a durable Decision; Develop recommendations
  now are.
- Advisory evidence is manually entered text rather than linked to canonical EvidenceReference
  records.
- Decision status is binary; V1 needs explicit keep/revise/reject/defer behavior without obscuring
  the existing immutable final-selection rule.
- Decisions are not summarized in Review or export artifacts.

### 9. Human Review mode — NOT STARTED

- Evaluation, rubric, and review-run domain/application/persistence/API foundations exist.
- There is no project Review screen that assembles intent, evidence, recommendations, decisions,
  unresolved conflicts, missing coverage, and export readiness for a filmmaker.
- The existing evaluation APIs are infrastructure, not a usable product review experience.

### 10. Export and handoff — PARTIAL

**Complete**

- Provider-neutral prompt handoff can be copied or downloaded as text.
- Wideframe is honestly labeled as manual-only; no unsupported synchronization is claimed.

**Missing for V1**

- No consolidated treatment, shot list, decision record, review packet, or evidence-aware edit brief.
- No structured JSON/CSV export for durable downstream use.
- No acceptance test proves exported content matches the currently approved project state.

### 11. Cross-mode behavior — PARTIAL

- Project type is persisted and hosted calibration fixtures cover several modes.
- The product doctrine requires materially different reasoning for commercial, documentary,
  narrative, performance, and ambiguous/open projects.
- V1 lacks one stable, automated cross-mode acceptance suite that checks behavioral difference,
  evidence discipline, and filmmaker usefulness end to end.

### 12. Reliability, security, and release operations — PARTIAL

**Complete**

- Unit, real-PostgreSQL API/integration, lint, typecheck, OpenAPI, security header, evaluation,
  production build, container, and Playwright gates exist in CI.
- Exact-SHA independent review and post-merge verification have been used for recent releases.
- Worker jobs preserve inputs across worker outages and prevent duplicate claims.

**Missing or externally bounded**

- Signed-in browser coverage is incomplete across the full intent → source → analysis → decision →
  review → export workflow.
- Public beta still requires durable OTP abuse limiting, staging/restore rehearsal, production object
  storage/pooling confirmation, legal/privacy operations, CSP, HSTS verification, and a manual WCAG
  audit. These are release-environment blockers, not reasons to leave V1 application behavior
  incomplete.
- The health response’s release identifier has previously lagged the deployed Git SHA; deployment
  provenance needs a reliable source before it is used as an exact-SHA gate.

## Broken findings

No broad workflow is classified **BROKEN** solely from static audit evidence. Reproducible failures
found during implementation or runtime acceptance will be added here with a regression test and
will block V1 readiness until resolved.

## Explicitly deferred from functional V1

- Additional photogrammetry, NeRF/Gaussian-splat, AR, scan-distortion research, or custom 3D engine
  work beyond preserving and honestly gating the current room workflow.
- Multi-agent “creative council” personas, exposed chain-of-thought, or internal orchestration UI.
- Marketplace, plugin ecosystem, CRM, billing, teams/organizations, broad analytics, generalized
  knowledge-management UI, and enterprise administration.
- Unsupported automatic Wideframe synchronization or any fabricated third-party integration.
- Pixel-polish, animation, and brand refinement that do not remove a functional blocker.

## V1 release statement

Stroman OS is **not yet FUNCTIONALLY COMPLETE V1**. It becomes eligible only after the completion
plan is closed, the authenticated running workflow demonstrates the connected decision loop, all
required verification is green, and independent review approves the exact final SHA with zero
BLOCKING and IMPORTANT findings.
