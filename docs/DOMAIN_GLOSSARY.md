# Domain Glossary

The approved, shared language for Stroman OS. Use these terms identically in code,
tests, and documentation. Where two terms could be confused, the distinction is
stated explicitly.

| Term | Owning domain | Definition | Not to be confused with |
|------|---------------|------------|-------------------------|
| **Project** | Project | A unit of creative work with an owner and a lifecycle. | A knowledge-base ContentItem; a Playbook. |
| **Owner** | Project | The user who holds authority over a project (referenced by `OwnerId`; the user domain is external). | Reviewer; the AI. |
| **ContentItem** | Content | A reusable **knowledge-base** entry (principle, protocol, standard, engine, tool, playbook, rubric, decision tree, case study, taxonomy term, AI module). | A media asset / footage (a deferred, separate concept); a Project. |
| **ContentType** | Content | The kind of knowledge-base entry, from a fixed set of 11 types. | Media MIME type. |
| **Slug** | shared | A URL-safe, human-readable unique key (lowercase, hyphenated). | An opaque identifier. |
| **Rubric** | Evaluation | A weighted set of scoring criteria with 1/5/10 anchors. | An Evaluation (a rubric is the template; an evaluation is one scored application). |
| **RubricCriterion** | Evaluation | A single weighted, anchored dimension within a rubric. | A Score. |
| **Evaluation** | Evaluation | A recorded, rubric-based scoring of a project by a reviewer, with per-criterion scores and justifications. | A Rubric; a Decision. |
| **Score** | shared | An integer 1–10 for one criterion within an evaluation. | Confidence (0–1); weighted total. |
| **Reviewer** | Evaluation | Who produced an evaluation: `HUMAN` or `AI`. | Owner. |
| **Decision** | Decision | A recorded creative choice among options where a **human holds final authority**. | An AI recommendation; a DecisionTree (knowledge-base content). |
| **DecisionOption** | Decision | One candidate choice within a decision (label + rationale). | The final selection. |
| **Advisory** | Decision | Non-binding AI input to a decision (an advised option + confidence + rationale). | The human's final selection — advisory can never decide. |
| **AiRecommendation** | AI | A provider-neutral structured AI output separating observations, inferences, unknowns, options, and a recommendation. | A Decision; a Rubric. |
| **Observation** | AI | A statement grounded in given evidence. | Inference (interpretation); Unknown (gap). |
| **Inference** | AI | An interpretation carrying a confidence. | Observation (fact); the final Decision. |
| **Confidence** | shared | A number in [0, 1] expressing certainty. | Score (1–10). |
| **AiRecommender** | AI | The provider-neutral port through which the app requests an `AiRecommendation`. Providers implement it **outside** the domain. | A provider SDK/adapter. |
| **MediaAsset** | Media & Transcript | Immutable metadata for an externally managed media file, owned by one project. | A `ContentItem`; the file bytes or a storage object. |
| **TranscriptDocument** | Media & Transcript | An immutable, ordered transcript for one `MediaAsset`, containing local speakers and segments. | A source-document ingestion record or a transcript viewer. |
| **TranscriptSpeaker** | Media & Transcript | A transcript-local speaker label referenced by segments in the same transcript. | A global person or Entity record. |
| **TranscriptSegment** | Media & Transcript | One ordered text passage, optionally attributed to a local speaker and optionally bounded by paired media timestamps. | A Knowledge Observation or extracted fact. |
| **SourceDocument** | Knowledge Acquisition | An ingestion/provenance record belonging to a `KnowledgeSource`, used as evidence for observations. | A `MediaAsset` metadata record or normalized `TranscriptDocument`; Prompt 011 creates no link between them. |

## Usage rules

- "Content" unqualified means the **knowledge base**. Footage/interview files are
  "**media assets**" (a separate, deferred domain) — never call them "content."
- "Decision" is a recorded human choice. An AI's suggestion is an "**advisory**" or
  "**recommendation**," never a "decision."
- "Score" is 1–10 (evaluation). "Confidence" is 0–1 (AI/advisory). Do not mix.
- Identifiers are named `<Concept>Id` and are not interchangeable across concepts.
