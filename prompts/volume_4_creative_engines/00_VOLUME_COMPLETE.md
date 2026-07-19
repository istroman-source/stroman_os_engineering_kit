# Stroman OS — Creative Intelligence Engines

Use these prompts one at a time in numeric order. Do not paste an entire volume at once.

# Prompt 076 — Story Engine input contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **76 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Finalize Story Discovery inputs, exclusions, evidence rules, and output schema.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 077.

---

# Prompt 077 — Story Engine prompt v1

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **77 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement a rigorous prompt that produces distinct evidence-backed candidates without invented drama.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 078.

---

# Prompt 078 — Story Engine service

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **78 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Connect context assembly, jobs, providers, validation, storage, and permissions.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 079.

---

# Prompt 079 — Story candidate comparison UI

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **79 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build side-by-side premise, arc, evidence, risk, tradeoff, and confidence comparison.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 080.

---

# Prompt 080 — Story selection decision flow

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **80 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Require human selection or rejection and record the final decision with evidence.

## Step-specific engineering direction

Implement the complete narrow workflow, not an attractive shell. Include validation, permissions, history, and failure states.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 081.

---

# Prompt 081 — Story Engine evaluation suite

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **81 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Evaluate strong, flat, contradictory, sparse, and malicious project inputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 082.

---

# Prompt 082 — Character Engine contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **82 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define safe character analysis boundaries, schemas, evidence, and sensitive-trait restrictions.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 083.

---

# Prompt 083 — Character Engine implementation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **83 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Generate observable roles, quotes, pressures, signature moments, and possible arcs.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 084.

---

# Prompt 084 — Character profiles UI

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **84 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build editable profiles, transcript filters, evidence, merge, split, and correction tools.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 085.

---

# Prompt 085 — Character Engine evaluation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **85 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Test stereotype avoidance, unsupported emotions, speaker ambiguity, and sparse evidence.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 086.

---

# Prompt 086 — Audience Engine contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **86 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define viewer perspectives, curiosity, clarity, investment, confusion, and memory schemas.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 087.

---

# Prompt 087 — Audience Engine implementation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **87 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Generate audience simulations grounded in the intended audience and available structure.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 088.

---

# Prompt 088 — Audience experience UI

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **88 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build predicted viewer journey, uncertainty, friction points, and supporting evidence.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 089.

---

# Prompt 089 — Retention Engine contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **89 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define moment-level curiosity, momentum, redundancy, payoff, and cognitive-load analysis.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 090.

---

# Prompt 090 — Retention Engine implementation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **90 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Analyze structured sequences or scripts without pretending to measure unavailable performance data.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 091.

---

# Prompt 091 — Retention timeline UI

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **91 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build interpretable retention-risk segments and evidence-linked revision suggestions.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 092.

---

# Prompt 092 — Creative Council role contracts

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **92 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define expertise, boundaries, schemas, and required differentiation for each reviewer.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 093.

---

# Prompt 093 — Independent Council reviews

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **93 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Run role reviews independently and preserve evidence-backed disagreement.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 094.

---

# Prompt 094 — Council consensus engine

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **94 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Synthesize agreements, risks, unresolved choices, and recommended actions without false unanimity.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 095.

---

# Prompt 095 — Creative Council interface

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **95 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build reviewer, comparison, consensus, evidence, acceptance, rejection, and conversion flows.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 096.

---

# Prompt 096 — Rubric definition system

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **96 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement workspace-configurable criteria, weights, guidance, critical failures, and versions.

## Step-specific engineering direction

Implement the complete narrow workflow, not an attractive shell. Include validation, permissions, history, and failure states.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 097.

---

# Prompt 097 — Final Review engine

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **97 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Generate evidence-backed AI scores, confidence, critical issues, and prioritized revisions.

## Step-specific engineering direction

AI advises rather than decides. Separate observation from inference, cite evidence, expose uncertainty, and store versioned outputs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 098.

---

# Prompt 098 — Human scoring and overrides

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **98 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Preserve separate human scores, reasons, approvals, and historical comparisons.

## Step-specific engineering direction

Implement the complete narrow workflow, not an attractive shell. Include validation, permissions, history, and failure states.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 099.

---

# Prompt 099 — Creative engine regression suite

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **99 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Run cross-engine grounding, consistency, safety, and role-differentiation evaluations.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 100.

---

# Prompt 100 — Creative engines release gate

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **100 of 150**, within **Creative Intelligence Engines**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Audit product usefulness, false confidence, evidence, UX, costs, and known limitations.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 101.

---
