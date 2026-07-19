# Stroman OS — AI Infrastructure

Use these prompts one at a time in numeric order. Do not paste an entire volume at once.

# Prompt 051 — AI provider contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **51 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define provider-neutral generation, structured output, embeddings, streaming, usage, and capability interfaces.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 052.

---

# Prompt 052 — Deterministic fake provider

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **52 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement a test provider with fixtures, errors, delays, and repeatable outputs.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 053.

---

# Prompt 053 — Anthropic adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **53 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement Anthropic through the provider contract with secure configuration and contract tests.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 054.

---

# Prompt 054 — OpenAI adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **54 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement optional OpenAI support without leaking provider logic into domains.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 055.

---

# Prompt 055 — Gemini adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **55 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement optional Gemini support through the same contract.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 056.

---

# Prompt 056 — Model routing configuration

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **56 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create explicit model selection, capability checks, fallbacks, and workspace policy hooks.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 057.

---

# Prompt 057 — Prompt registry

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **57 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement named, versioned prompts with immutable historical versions.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 058.

---

# Prompt 058 — Structured output validation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **58 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Require schema validation, repair boundaries, and transparent failures.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 059.

---

# Prompt 059 — Usage and cost ledger

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **59 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Record provider, model, tokens, latency, estimated cost, and workspace attribution.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 060.

---

# Prompt 060 — AI logging and redaction

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **60 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement useful traces without exposing secrets or sensitive project content.

## Step-specific engineering direction

Enforce controls server-side. Hidden buttons are not authorization. Add adversarial tests.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 061.

---

# Prompt 061 — Job queue selection and setup

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **61 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Choose and implement a reliable asynchronous job system with documented tradeoffs.

## Step-specific engineering direction

Design for retries, idempotency, observability, cancellation, and preservation of earlier successful results.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 062.

---

# Prompt 062 — Analysis run state machine

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **62 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement queued, running, completed, failed, canceled, and superseded transitions.

## Step-specific engineering direction

Design for retries, idempotency, observability, cancellation, and preservation of earlier successful results.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 063.

---

# Prompt 063 — Idempotency and duplicate prevention

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **63 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Prevent accidental duplicate analysis while allowing intentional versioned reruns.

## Step-specific engineering direction

Design for retries, idempotency, observability, cancellation, and preservation of earlier successful results.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 064.

---

# Prompt 064 — Retries, timeouts, and cancellation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **64 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement bounded retries, provider timeouts, cancellation, and prior-output preservation.

## Step-specific engineering direction

Design for retries, idempotency, observability, cancellation, and preservation of earlier successful results.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 065.

---

# Prompt 065 — Analysis progress interface

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **65 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build visible job progress, errors, retry controls, and analysis history.

## Step-specific engineering direction

Use the established design system, complete state coverage, keyboard access, and no fake controls.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 066.

---

# Prompt 066 — Context assembly service

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **66 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Assemble briefs, brand rules, transcripts, notes, and evidence within explicit token budgets.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 067.

---

# Prompt 067 — Evidence-grounding contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **67 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Enforce citation identifiers and prohibit nonexistent or inaccessible evidence references.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 068.

---

# Prompt 068 — Observation and inference separation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **68 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create shared schemas and UI labels distinguishing evidence, context, and inference.

## Step-specific engineering direction

Keep provider-neutral boundaries, validated structured outputs, evidence grounding, usage tracking, and safe failure behavior.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 069.

---

# Prompt 069 — Prompt-injection filtering

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **69 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Treat uploaded material as untrusted data and defend system instructions and tool boundaries.

## Step-specific engineering direction

Enforce controls server-side. Hidden buttons are not authorization. Add adversarial tests.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 070.

---

# Prompt 070 — Evaluation fixture framework

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **70 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create reusable creative-project fixtures, expected properties, and scoring hooks.

## Step-specific engineering direction

Create deterministic fixtures, measurable assertions, failure reporting, and regression coverage.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 071.

---

# Prompt 071 — Schema conformance evaluations

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **71 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Measure valid outputs, repair rates, missing fields, and provider differences.

## Step-specific engineering direction

Create deterministic fixtures, measurable assertions, failure reporting, and regression coverage.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 072.

---

# Prompt 072 — Grounding evaluations

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **72 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Measure citation validity, unsupported claims, and insufficient-evidence behavior.

## Step-specific engineering direction

Create deterministic fixtures, measurable assertions, failure reporting, and regression coverage.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 073.

---

# Prompt 073 — Provider resilience tests

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **73 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Test rate limits, malformed output, outages, retries, and graceful degradation.

## Step-specific engineering direction

Create deterministic fixtures, measurable assertions, failure reporting, and regression coverage.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 074.

---

# Prompt 074 — AI operations dashboard

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **74 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Provide internal run status, usage, failure categories, and retry visibility.

## Step-specific engineering direction

Prioritize diagnosability, access control, data safety, and actionable operator workflows.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 075.

---

# Prompt 075 — AI infrastructure release gate

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **75 of 150**, within **AI Infrastructure**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Audit security, costs, reliability, contracts, evaluations, and documentation.

## Step-specific engineering direction

Do not add major scope. Inspect, test, fix blockers, update documentation, and issue an honest readiness verdict.

## Operating rules

- Work only on this prompt's objective. Do not begin the next numbered prompt.
- Read `README.md`, `docs/MVP_SCOPE.md`, `docs/TECHNICAL_DECISIONS.md`, `docs/ARCHITECTURE.md`, and the most recent progress log before changing code.
- Inspect existing implementation before creating a second abstraction or duplicate component.
- Preserve strict TypeScript and current architecture boundaries.
- All reads and writes involving workspace data require server-side authorization.
- Do not represent mocked, fixture-based, or undocumented integrations as production-ready.
- Do not create a generic AI chat interface.
- AI content must be visibly distinguishable from human-approved decisions.
- Never invent evidence, external API capabilities, passing tests, or completed work.
- Avoid unrelated refactors. Record discovered out-of-scope problems in `docs/BACKLOG.md`.

## Required process

1. Inspect the relevant code, tests, schemas, migrations, and documentation.
2. State a concise implementation plan before editing.
3. Implement the smallest complete version of this objective.
4. Add or update automated tests that prove the important behavior.
5. Run the narrow tests first, then lint, type-check, and the production build.
6. Fix regressions caused by this step.
7. Update the relevant documentation and `docs/BUILD_PROGRESS.md`.
8. Record any deliberately deferred work with rationale.

## Acceptance criteria

- The objective is usable end-to-end within its intended narrow scope.
- Data access is workspace-scoped and authorized on the server.
- Inputs are validated and failures produce useful, non-sensitive errors.
- Loading, empty, success, denied, and failure states exist where a user interface is involved.
- New schemas and public contracts are typed and documented.
- Existing completed workflows continue to pass their tests.
- There are no knowingly fake success states, hidden TODO behavior, or undocumented shortcuts.
- Documentation explains setup, behavior, limitations, and any operational concerns introduced by this step.

## Tests required

At minimum, add the most appropriate tests from this set:

- Unit tests for isolated rules and validation.
- Database integration tests for persistence and workspace isolation.
- Contract tests for adapters or providers.
- End-to-end tests for user-visible workflows.
- Accessibility checks for new interactive interfaces.
- Regression fixtures for AI behavior when this prompt changes AI logic.

Do not claim a check passed unless you actually ran it. If the environment prevents a check, state the exact command, failure, and remaining risk.

## Documentation updates

Update all directly affected documents. At minimum append to `docs/BUILD_PROGRESS.md`:

- Prompt number and title
- Files changed
- Decisions made
- Tests executed and results
- Known limitations
- Recommended next prompt

## Stop condition

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 076.

---
