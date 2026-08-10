# Product Roadmap

## Product direction

The roadmap is organized around the Edit Engine: one concept-first workflow that turns
creative intent and source material into evidence-grounded story and editorial guidance.
Knowledge Acquisition, Memory, entities, relationships, evidence linking, clustering, and
workflow state are backend capabilities, not separate user journeys. See
`docs/FILMMAKING_INTELLIGENCE_DIRECTION.md`.

The durable product boundary is the full filmmaking continuum from idea and development through
production, source understanding, editorial, revision, and delivery. Stroman must remain useful
before footage exists and when footage already exists. Every product slice must preserve or
strengthen the shared intent–evidence bridge; transcript analysis is one input path, not the
product definition.

## Current progress

Foundation Prompts 001–017 are complete. Prompt 017 passed the canonical real-database gate,
exact-head CI, independent exact-commit review, bounded remediation, atomic merge, and
post-merge `main` CI. The repository baseline, architecture decision coverage, bundled
repository/tooling foundations, the domain glossary, the initial domain model,
media/transcript provenance, durable Evidence,
versioned analysis with human-authoritative Decision linkage, review runs, and approved
project learning. Delivery now follows
the accelerated vertical slices below instead of implementing unrelated numbered
foundation prompts before visible filmmaker value.

The next incomplete dependency is Prompt 018. Prompts 004–007, 009, and 010 are recorded as
completed through previous bundled work in `docs/BUILD_PROGRESS.md`; Prompt 008 completes the
previously missing safe reset and seed boundary. These foundations must not be rebuilt.
Prompt 018 is not authorized by the current rollout.

## Approved autonomous first rollout

Prompt 017 is the sole approved post-alpha hardening milestone for the first continuous
Autopilot rollout. Its exact-reviewed change passed local verification and CI, merged, and
passed post-merge `main` CI. Automation has stopped at **READY FOR HUMAN TESTING**. Prompt
018 and later work are not part of this activation and require a new explicit roadmap stop.

Autopilot continuous stop milestone is Prompt 017.

## Current human-test corrective rollout

The first real filmmaker test validated authentication, persistence, the story workspace,
transcript ingestion, evidence-backed analysis, recommendations, alternatives, and analysis UI.
It also exposed a false client error after successful transcript import and weak editorial
selection in the deterministic analysis baseline.

The explicitly authorized corrective rollout is independent of the numbered Prompt 018 sequence
and does not move the Autopilot stop beyond Prompt 017. Its shortest safe acceptance path is:

1. preserve the working end-to-end path and fix the successful-import false error;
2. suppress metadata, slate, test, and closing chatter from editorial selection;
3. replace length/first/last shortcuts with source-backed substantive-moment and progression
   selection;
4. distinguish factual source moments from editorial interpretations and explain why proposed
   connections may matter;
5. normalize project-intent prose while preserving the filmmaker's meaning;
6. encode the pre-footage and post-footage product north star as a durable test;
7. require the canonical local gate, exact-head CI, independent exact-SHA review, atomic merge,
   and green post-merge `main` before returning to human testing.

Prompt 018 remains unauthorized by this rollout. Future autonomous work must evaluate the next
highest-value filmmaker outcome against the intent–evidence bridge before advancing a numbered
prompt.

## Owner-authorized creative-intelligence continuation

The 2026-08-10 Autonomous Continuation Directive authorizes the next human-test vertical slice:
idea-first creative development, distinct candidate search and critique, purposeful rule-breaking,
decision-changing questions, sequence thinking, and a production-literate director blueprint.
This product slice is governed by `docs/CREATIVE_INTELLIGENCE_DOCTRINE.md`.

The shortest safe acceptance path is:

1. require only a basic idea; preserve missing audience, emotion, format, access, and constraints as
   explicit unknowns rather than invented facts;
2. recommend one direction with a defensible point of view, audience effect, execution test, and
   tradeoff;
3. compare genuinely distinct alternatives and include at least one purposeful rule-break;
4. ask only questions that identify the creative decision they change;
5. expose sequence thinking and a provider-neutral director blueprint covering composition,
   blocking, lens/camera, light, design, color/grade, movement, and sound;
6. clearly label idea-stage output as creative hypothesis rather than evidence, and clearly report
   when no visual renderer is configured;
7. add a benchmark contract and regression fixture, then require canonical verification,
   exact-head CI, independent exact-SHA review, atomic merge, and post-merge `main` CI.

This continuation does not select the legacy Prompt 018 seeded-demonstration objective and does not
open the remaining numbered backlog. Autopilot's configured Prompt 017 stop remains a deliberate
safeguard while this owner-directed vertical slice runs through the same lifecycle manually.

## Accelerated delivery sequence

### Project Source Intake & Transcript Import — complete

**Goal:** let a filmmaker select or create a project, add source material once, and leave
with project-owned, provenance-preserving transcript material that the existing Evidence
and Analysis domains can consume.

**Scope:**

- One minimal filmmaker-facing project intake flow for source media metadata and files.
- Provider-neutral storage boundary plus the smallest development implementation needed
  for upload, integrity checks, and deterministic tests.
- Transcript acceptance and extraction boundary, with normalized SRT, VTT, JSON, and
  plain-text parsing into stable documents and segments.
- Idempotent project-scoped import orchestration with processing, success, retryable
  failure, and terminal failure states.
- Ownership, project isolation, immutable provenance, source integrity, audit metadata,
  typed failures, transaction safety, corruption-safe mappers, in-memory parity, and
  real-database integration coverage.
- An application boundary through which imported sources become available to the
  existing Evidence and Analysis contexts without manual Evidence, entity, relationship,
  graph, or Knowledge Acquisition administration.

**Explicitly deferred:** review/rubric expansion, learning and retrospectives, generic
integration administration, generic dashboards, asset-library management, transcript
editing/search, knowledge-management UI, manual graph workflows, multi-provider AI,
analytics, billing, marketplace, and unrelated Prompt 014–025 work.

**Acceptance gate:** focused and full local verification, green CI, preview smoke tests,
independent approval, and zero unresolved BLOCKING or IMPORTANT findings. Auto-merge may
be armed only after all of those conditions are true.

### Following vertical slices

1. Automatic Evidence-Grounded Analysis Pipeline — complete.
2. Edit Engine v1: Story, Recommendations, and Alternatives — complete.
3. Prompt Synthesis and verified Wideframe handoff — complete.
4. Internal-alpha reliability and evaluation gate — complete.
5. Beta security, deployment, accessibility, observability, and onboarding gate —
   implementation complete, review pending; beta release remains blocked by the gate.

## Internal alpha

1. Foundation, secure ownership, projects, provenance, and auditability.
2. Project-scoped source intake, media registration, and transcript import.
3. Automatic editorial context: observations, entities, relationships, evidence, and
   themes.
4. Evidence-grounded Story Discovery and Edit Engine recommendations.
5. Human selection, review, completion lessons, and export.
6. Provider-neutral prompt synthesis and a fixture-backed integration boundary.

## Limited beta
Character, Audience, Retention, Creative Council, approved case studies, verified
integration previews, operational monitoring, and onboarding.

## Version 1.x
Measured improvements to editorial retrieval, integrations, evaluation quality, team
collaboration, and production interchange.

## Later exploration
Generic knowledge-management expansion, generalized analytics, billing, computer vision,
NLE panels, plugin ecosystem, marketplace, enterprise identity, private deployments, and
broader creative disciplines.
