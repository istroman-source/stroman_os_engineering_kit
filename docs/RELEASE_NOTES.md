# Release Notes

## Corrective creative-development candidate — hosted proof pending (2026-08-10)

- Deep development now runs through a provider-neutral four-stage reasoning boundary:
  project understanding, distinct candidate generation, independent candidate critique, and
  synthesis. A strict OpenAI Responses/Structured Outputs adapter is selected when configured;
  the deterministic specialist remains an offline and safety fallback.
- Every result must clear a semantic gate for transformation, project specificity, actionability,
  distinctiveness, judgment, innovation, humanness, craft coherence, honesty, and visual
  completion before it can be persisted or shown.
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
