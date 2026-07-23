# Product Roadmap

## Product direction

The roadmap is organized around the Edit Engine: one concept-first workflow that turns
creative intent and source material into evidence-grounded story and editorial guidance.
Knowledge Acquisition, Memory, entities, relationships, evidence linking, clustering, and
workflow state are backend capabilities, not separate user journeys. See
`docs/FILMMAKING_INTELLIGENCE_DIRECTION.md`.

## Current progress

Foundation Prompts 011–013 are complete: media/transcript provenance, durable Evidence,
and versioned analysis with human-authoritative Decision linkage. Delivery now follows
the accelerated vertical slices below instead of implementing unrelated numbered
foundation prompts before visible filmmaker value.

## Accelerated delivery sequence

### Project Source Intake & Transcript Import — in progress

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

1. Automatic Evidence-Grounded Analysis Pipeline.
2. Edit Engine v1: Story, Recommendations, and Alternatives.
3. Prompt Synthesis and verified Wideframe handoff.
4. Internal-alpha reliability and evaluation gate.
5. Beta security, deployment, accessibility, observability, and onboarding gate.

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
