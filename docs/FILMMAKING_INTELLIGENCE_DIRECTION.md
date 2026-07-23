# Filmmaking Intelligence Product Direction

## Executive verdict

Stroman OS has strong foundations for ownership, projects, provenance, media and
transcripts, structured observations, story reasoning, and human decisions. The product
surface, however, exposes Memory and Knowledge Acquisition as destinations and asks the
filmmaker to operate internal data structures. That is useful engineering infrastructure,
not the fastest path to a better edit.

The product now follows one concept-first workflow:

1. Create a project.
2. Describe the video concept, source material, creative intent, audience, and constraints.
3. Let backend workflows register sources, preserve provenance, derive observations,
   maintain entities and relationships, and assemble editorial context.
4. Present the current story, evidence-backed observations, edit recommendations,
   creative alternatives, and production prompts.

Human authority remains at consequential creative selections. Internal repositories,
aggregate identifiers, graph maintenance, ingestion runs, review mechanics, and
materialization are not primary navigation concepts.

## Audit decisions

### Stays

- Authentication, ownership, project isolation, optimistic concurrency, and auditability.
- Media/transcript foundations, source integrity, evidence, and immutable provenance.
- Knowledge Acquisition, Memory, and Story Reasoning domain/application/persistence code.
- Project creative briefs, story alternatives, recommendations, decisions, and reviews.
- Explicit errors and human approval for consequential creative choices.

### Moves behind the scenes

- Knowledge sources, documents, acquisition runs, observations, reviews, and
  materialization.
- Entity and relationship creation and graph maintenance.
- Evidence linking, thematic clustering, context assembly, and workflow state.
- Prompt construction and integration-specific formatting.

### Simplified now

- Primary navigation contains Story Studio and Settings only.
- Project creation immediately opens the concept and intent workflow.
- The existing Creative Blueprint is presented as a story workspace organized around the
  current story, creative intent, alternatives, edit recommendations, and a production
  prompt.
- Memory and Acquisition APIs and implementation remain available to backend workflows;
  their former pages redirect to Story Studio rather than exposing internal operations.

### Postponed

- Generic knowledge-base search, favorites, backlinks, public content management, and
  broad taxonomy tooling.
- Marketplace, plugin ecosystem, team billing, generalized analytics, generic admin
  interfaces, and enterprise identity extensions.
- Multi-provider AI infrastructure beyond the provider needed for the first automatic
  editorial workflow.
- Wideframe synchronization until supported capabilities are verified. Production prompts
  remain provider-neutral until then.

### Deleted from the product surface

- Primary navigation entries and direct user-facing workbenches for Dashboard, Memory,
  and Acquisition.
- The redundant Dashboard step; `/dashboard` continues to redirect safely to Story Studio.
- The Decision Log shortcut from the primary story workspace. Decision records remain
  available as a progressively disclosed human-approval capability.

No production data, migrations, domain records, APIs, or provenance were deleted by this
restructuring.

## Ranked restructuring backlog

| Rank | Change | Friction removed | Time saved | Editorial relevance | Risk |
| ---: | --- | --- | --- | --- | --- |
| 1 | Concept-first navigation and direct project handoff | High | High | High | Low |
| 2 | Project-scoped source intake and automatic transcript registration | High | High | High | Medium |
| 3 | Automatic observation, entity, relationship, and evidence materialization | Very high | Very high | High | Medium |
| 4 | Evidence-grounded Story Discovery and Edit Engine workspace | High | High | Very high | High |
| 5 | Provider-neutral prompt synthesis with verified Wideframe export | Medium | Medium | High | Medium |
| 6 | Automatic lessons from completed projects | Medium | Medium | Medium | Medium |
| 7 | Generic knowledge-management and SaaS expansion | Low | Low | Low | High |

## Architectural rule

Bounded contexts continue to protect ownership, provenance, source integrity, and
editorial auditability. They are not mirrored one-for-one in navigation. The application
layer composes them into a single filmmaker-facing workflow. Compatibility layers should
not be added merely to preserve obsolete screens.

## Follow-up milestones

1. **Project Source Intake Foundation** — project-scoped media/transcript intake with a
   single source action, safe storage boundary, status, retry, and plain-language errors.
2. **Automatic Editorial Context Pipeline** — convert accepted source content into
   observations, entities, relationships, evidence links, themes, and internal workflow
   state without manual materialization screens.
3. **Evidence-Grounded Edit Engine v1** — assemble project intent and source evidence into
   current story, strongest observations, edit recommendations, and creative alternatives.
4. **Prompt Synthesis and Wideframe Handoff** — provider-neutral prompts first; expose
   Wideframe-specific behavior only after capability verification.
5. **Completion Learning Loop** — turn approved outcomes and retrospective lessons into
   reusable internal context without exposing graph administration.
