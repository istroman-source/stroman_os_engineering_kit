# Filmmaking Intelligence Product Direction

The behavior, search, anti-genericness, purposeful rule-breaking, visual language, and benchmark
standards in `docs/CREATIVE_INTELLIGENCE_DOCTRINE.md` are authoritative alongside this product
direction.

## Product north star

Stroman OS is a filmmaker's creative operating system and one connected workspace across the
full filmmaking continuum:

**IDEA → DEVELOPMENT → STORY → PRE-PRODUCTION → PRODUCTION → SOURCE/MEDIA UNDERSTANDING →
EDITORIAL → REVISION → DELIVERY**

Filmmakers may enter at any point. The product must support both paths below without turning
them into separate products or forcing either path to exist first.

### Develop & Plan — useful before footage exists

Starting from an idea, objective, brief, product, person, campaign, documentary subject, or
creative problem, Stroman should help a filmmaker develop concepts, audience and objective,
creative directions, story and character arcs, treatments, interview strategy, scenes,
storyboards, shot planning, production needs, alternatives, gaps, and unanswered questions.

Deep creative development sits behind `CreativeReasoningProvider`, not inside UI templates. Its
minimum process is project understanding, genuinely distinct candidate generation, candidate
critique, and synthesis. A hosted reasoning adapter may supply the primary creative work when
configured; deterministic logic remains valuable for offline operation, contract validation,
semantic gates, safety, and reproducible regression fixtures. Deterministic output must never be
marketed as equivalent to an unexercised hosted creative path.
When deterministic logic cannot produce project-dependent physical scenes, it must fail closed and
ask for the configured reasoning path rather than completing a polished template.

A development result is incomplete until it includes a rendered visual artifact. The renderer is
provider-neutral and consumes structured storyboard frames, blocking/light/camera geometry, motion
paths, and look/color references. Default filmmaker UI shows the artifact and the decisions it
communicates; provider names, credentials, system instructions, master prompts, and internal
deliberation remain behind the product surface.

### Cognitive economy and authoritative spatial planning

The product uses one obvious mental model:

1. **Story** develops the film, its point of view, audience effect, scenes, alternatives, and the
   recommendation Stroman is willing to defend.
2. **Plan** enters the physical scene. It proposes a spatial shot that the filmmaker can directly
   change and save as a versioned decision.
3. **Edit** works with captured material, preserving source evidence while testing what story the
   footage now supports.

Each mode preserves cognitive economy through progressive disclosure. Detailed craft reasoning,
alternatives, scout grounding, production reality, and crew artifacts remain available without
competing with the active decision.

The active stage—Idea, Scouting, Pre-production, Shooting, or Post—changes which decisions are
prominent. Recommendations are ranked as must solve now, important, worth exploring, or optional.
Coverage is ranked as must get, safety, or optional exploration. Sound is a first-class plan, and
production reality—crew, camera, lenses, support, lighting, sound, time, access, talent, budget,
and time of day—changes recommendations rather than appearing as inert metadata.

Camera state is authoritative across the room view, view through camera, saved storyboard, shooting
information, and execution guidance. The filmmaker can change camera position and aim, pan/tilt via
the target, camera height, focal length, aspect ratio, support and movement, subject start/end
blocking, and saved position. Camera movement has editable start/path/end state distinct from
subject movement.

Every saved shot has independently composed 16:9 and 9:16 states. A crop guide is not a vertical
plan. Each frame places subjects and meaningful set pieces, states camera/lens/height/distance/
movement choices at an honest level of precision, and retains concise execution information.
Blocking directly names people, beats, movement states, and cameras. Lighting and look remain
separate artifacts so an operator never decodes anonymous dots or mixed visual grammar.

Location-aware planning is optional and additive. A filmmaker may upload multiple scout/location
photos; those files remain private and project-scoped. Spatial statements are always labeled as:

- **Observed** — directly supported by supplied media.
- **Estimated** — a useful spatial hypothesis whose clearance or relationship is not fully
  visible.
- **Unknown** — unavailable from current material and not safe to infer.
- **Filmmaker-confirmed** — an explicit correction or confirmation supplied by the owner.

Stroman must never invent unseen rooms, exact dimensions, operating clearances, or fixture controls.
Photo-dependent frames identify the facts and uncertainties they use. A correction regenerates the
affected planning layer without asking the filmmaker to re-enter project intent, and the UI reports
the creative delta: what changed, what stayed, and why.

Restraint is a product behavior. The system protects must-get material, offers a useful safety, and
keeps optional exploration genuinely optional. It does not maximize shot count, tools, diagrams,
or prose to appear intelligent.

### Analyze & Edit — useful when source material already exists

Starting from footage, transcripts, interviews, scripts, notes, selects, rough cuts, or other
source material, Stroman should help reveal characters, chronology, themes, emotional beats,
turning points, contradictions, strong moments, evidence, missing coverage, alternative
narratives, editorial structure, and edit recommendations.

For video, representative frames may be extracted locally and analyzed through a provider-neutral
vision boundary when direct video input is unavailable. Every visible observation retains the
imported media asset as evidence and its sampling timestamp. Interpretations remain labeled as
estimated; unverified sound, motion between frames, identity, causality, and off-screen action remain
unknown. A successful upload or valid provider response alone is not proof of useful media
understanding.

### The intent–evidence bridge

Both paths share one evolving project understanding. Stroman's differentiator is helping the
filmmaker compare:

- What were we trying to make?
- What did we actually capture?
- What story does the evidence now support?
- What exceeded the original plan?
- What is missing?
- What should we do next?

Evidence grounding is mandatory, but grounding alone is not creative intelligence. The product
must distinguish source-backed facts from editorially meaningful interpretations, explain why
an interpretation may matter, expose uncertainty and counter-evidence, and leave every creative
decision with the filmmaker. Internal evidence IDs, graph structures, and workflow machinery
must support that experience without becoming the experience.

This north star is a sequencing constraint. Autonomous work must not optimize Stroman into only
a transcript-analysis application, only a pre-production planner, or a generic knowledge tool.
Each material product milestone must either improve one path or strengthen the bridge between
them while preserving the other path.

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
- Additional hosted creative-reasoning adapters beyond the first provider-neutral boundary.
- Wideframe synchronization until supported capabilities are verified. Editor handoffs remain
  provider-neutral, collapsed by default, and explicit exports until then.

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
