# Stroman OS V1 current state

Last audited: 2026-08-31

Audit baseline: `d023cb474448144cf963ec9891025cad57e3eba4`

Functional implementation verified through: `4c8e9c0`

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

The functional V1 decision loop is connected locally: private projects preserve structured intent,
sources and evidence feed grounded analysis, Develop/Build/Edit recommendations enter one durable
filmmaker-decision contract, Review exposes conflicts and missing coverage, and versioned exports
carry the exact intent and decision state. Prepared GLB and photo rooms share an honest geometry
gate, and the current Apple worker has completed a fresh 26-photo full-detail reconstruction without
a paid service.

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

### 2. Project intent and creative memory — COMPLETE LOCALLY

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

Develop, Build, Edit, Review, decisions, and exports now consume the same current intent. The
broader memory graph deliberately remains an internal foundation; V1 surfaces useful state through
intent history and the Review packet rather than exposing graph plumbing.

### 3. Sources, evidence, and media understanding — COMPLETE LOCALLY

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

The current project result selects the newest completed transcript and sampled-frame analyses as one
evidence-aware view. Cross-source gaps and contradictions remain visible instead of being flattened
into false certainty. Final deployed-browser acceptance remains a release-environment gate, not an
application implementation gap.

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

### 5. Build / shot planning — COMPLETE LOCALLY

**Complete**

- Planning supports camera state, scene state, saved shots, separate horizontal and vertical
  compositions, blocking, lighting, look, sound, movement, and production reality.
- Camera state is editable and storyboard artifacts derive from structured state rather than a flat
  screenshot.
- Location grounding is optional and uncertainty labels distinguish observed, estimated, unknown,
  and filmmaker-confirmed claims.

**Completed in the functional pass**

- One versioned spatial-shot state now owns camera position/aim/height, focal length, ratio, support,
  movement, subject/blocking, action, light, look, sound, production notes, creative rationale,
  direction provenance, and geometry confidence.
- Saving that state immediately renders the exact camera view and complete shooting card in the
  storyboard, while durable planning persistence restores it after reload.
- Horizontal and vertical frames are separately authored saved setups with independent ratio and
  lens state; the UI and tests explicitly reject describing one as a crop of the other.
- Saved state produces concise downloadable text and printable shot-plan handoffs.

Saved shots retain direction provenance and enter the same keep/revise/reject/defer decision
contract as Develop and Edit. Exact shot state drives the viewer, storyboard, shooting card, and
exports; separate 16:9 and 9:16 setups remain independently editable. Deployed-browser save/reload
acceptance remains part of the final release gate.

### 6. Space Scan / prepared rooms — COMPLETE LOCALLY (narrow V1 scope)

**Complete**

- Owner-scoped prepared rooms accept GLB input or 20–40 overlapping photos.
- Inputs, reconstruction jobs, leases, retries, worker status, failure reports, and results are
  durable.
- A free connected-Mac Apple reconstruction worker can claim jobs and return a GLB without KIRI,
  RunPod, or paid reconstruction.
- Ready rooms can be selected for project grounding and opened in a camera viewer.

**Completed in the functional pass**

- GLB and connected-Mac photo results now share one deterministic readiness gate. A structurally
  valid file cannot become `READY` when recovered bounds are empty, implausibly low/tall or narrow,
  or severely stretched.
- Every recovered room includes a plain-language shoot brief derived only from available geometry:
  estimated bounds/scale, usable estimated exploration, observed constraints, semantic unknowns,
  and unverified/no-go space. It never invents doors, windows, obstacles, or camera clearance.
- Distorted or incomplete geometry is preserved as `NEEDS_ATTENTION`, withheld from the normal
  planning viewer, optionally inspectable behind disclosure, and paired with an actionable request
  for overlapping coverage or a complete replacement GLB.

The current Apple worker completed a fresh full-detail 26-photo reconstruction and produced a valid
12.3 MB GLB. The application geometry inspector classified it as a shootable estimate with canonical
3.1 m × 2.6 m × 3.2 m bounds; that run exposed and fixed a double-scaling defect before release.
Authenticated deployed-browser selection and reload remain part of the final environment gate.

### 7. Analyze & Edit — COMPLETE LOCALLY

**Complete**

- The materials workspace composes source intake, automatic analysis, Edit Engine, and prompt
  handoff.
- Source-backed observations and editorial interpretations are visually and semantically separated.
- Edit Engine presents current story, observations, recommendations, alternatives, and production
  prompts.
- Insufficient evidence completes with informative empty states instead of inventing findings.

Transcript excerpts and sampled frames open through one evidence inspector. Edit now leads with an
intent–evidence bridge and can promote recommendations into the same durable human-decision workflow
as Develop and Build, while empty and insufficient-signal analyses remain honest successes.

### 8. Decision engine and filmmaker authority — COMPLETE LOCALLY

**Complete**

- Decisions, options, advisories, advisory evidence, selected options, notes, timestamps, ownership,
  and optimistic concurrency are durable.
- Human decisions are authoritative; AI advisory cannot decide on the filmmaker’s behalf.
- A plain-language Choices UI supports proposing, comparing, and recording consequential choices.

Develop, Build, and Edit share one recommendation-to-decision contract with explicit keep, revise,
reject, and defer paths. Advisories can link canonical evidence references, upstream changes flag
stale choices for review, and only the authenticated filmmaker can finalize the immutable selection
and rationale. Review and exports summarize those exact choices.

### 9. Human Review mode — COMPLETE LOCALLY

The project Review destination assembles current intent, sources, literal evidence, interpretations,
recommendations, accepted/rejected/deferred/open choices, stale-choice conflicts, missing coverage,
and unresolved actions. It keeps internal evaluator plumbing out of the filmmaker experience and
links back to the exact artifact that needs revision.

### 10. Export and handoff — COMPLETE LOCALLY

**Complete**

- Provider-neutral prompt handoff can be copied or downloaded as text.
- Wideframe is honestly labeled as manual-only; no unsupported synchronization is claimed.

Private no-store downloads now include treatment, shot plan, edit brief, decision record, review
packet, structured JSON, and spreadsheet-safe CSV. A deterministic snapshot identifier binds every
handoff to exact intent and decision versions, and the generator rejects a concurrent torn snapshot.

### 11. Cross-mode behavior — COMPLETE FOR CURRENT HOSTED EVIDENCE

- Project type is persisted and hosted calibration fixtures cover several modes.
- The product doctrine requires materially different reasoning for commercial, documentary,
  narrative, performance, and ambiguous/open projects.
- A stable evaluation suite revalidates the actual hosted artifacts for all five modes against the
  current schema, semantic gate, scene/craft requirements, evidence discipline, and independently
  composed horizontal/vertical frames.

### 12. Reliability, security, and release operations — AUTOMATED GATES COMPLETE LOCALLY

**Complete**

- Unit, real-PostgreSQL API/integration, lint, typecheck, OpenAPI, security header, evaluation,
  production build, container, and Playwright gates exist in CI.
- Exact-SHA independent review and post-merge verification have been used for recent releases.
- Worker jobs preserve inputs across worker outages and prevent duplicate claims.

**Externally bounded release checks**

- The full authenticated intent → source → analysis → decision → Review → export journey passes
  through real HTTP handlers and fresh PostgreSQL; the deployed signed-in browser still must confirm
  the exact reviewed SHA after the established merge/deploy process.
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

The application is **FUNCTIONALLY COMPLETE V1 LOCALLY**. `READY FOR HUMAN TESTING` remains withheld
until independent review approves the exact final SHA, CI passes, the established non-force merge
and deployment complete, and the signed-in deployed browser confirms the connected workflow.
