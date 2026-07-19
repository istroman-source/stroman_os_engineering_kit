# Stroman OS — Integrations and Growth

Use these prompts one at a time in numeric order. Do not paste an entire volume at once.

# Prompt 101 — Integration framework hardening

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **101 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Finalize adapter lifecycles, credentials, sync states, provenance, and disconnect behavior.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 102.

---

# Prompt 102 — Wideframe capability verification

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **102 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Research and document only supported Wideframe APIs, exports, webhooks, or manual workflows.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 103.

---

# Prompt 103 — Wideframe fixture adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **103 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement a transparent development adapter and representative import mappings.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 104.

---

# Prompt 104 — Wideframe import preview

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **104 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build field mapping, duplicate detection, partial failures, provenance, and confirmation UI.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 105.

---

# Prompt 105 — Wideframe synchronization

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **105 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement idempotent repeated sync if supported; otherwise preserve a documented manual import path.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 106.

---

# Prompt 106 — Frame.io adapter specification

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **106 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define review-comment, asset, version, and source-link mappings without inventing capabilities.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 107.

---

# Prompt 107 — Google Drive import adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **107 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement OAuth-scoped file selection and safe import through adapter boundaries.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 108.

---

# Prompt 108 — Dropbox import adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **108 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement scoped file selection, provenance, retries, and disconnect behavior.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 109.

---

# Prompt 109 — Premiere interchange specification

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **109 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define practical XML, marker, transcript, or panel boundaries for future Premiere workflows.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 110.

---

# Prompt 110 — DaVinci interchange specification

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **110 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define supported timeline, marker, transcript, and export exchange paths.

## Step-specific engineering direction

Use adapters, provenance, idempotency, honest capability labels, and no invented external APIs.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 111.

---

# Prompt 111 — Integration health center

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **111 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build connection state, last sync, failures, permissions, and reauthorization controls.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 112.

---

# Prompt 112 — Export service architecture

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **112 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create asynchronous export jobs, templates, storage, authorization, and records.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 113.

---

# Prompt 113 — Markdown and JSON exports

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **113 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement stable structured exports with evidence and schema versioning.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 114.

---

# Prompt 114 — Professional PDF exports

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **114 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement branded reports with pagination, citations, accessibility, and snapshot tests.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 115.

---

# Prompt 115 — Case study generator

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **115 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Generate a draft case study from approved decisions, reviews, lessons, and evidence.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 116.

---

# Prompt 116 — Case study approval workflow

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **116 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Require human editing and approval before institutional publication.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 117.

---

# Prompt 117 — Knowledge search v1

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **117 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement relational and full-text search across approved organizational knowledge.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 118.

---

# Prompt 118 — Semantic search experiment

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **118 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Evaluate pgvector retrieval only where it improves real search quality.

## Step-specific engineering direction

Define a success metric and rollback path. Do not merge experimental complexity unless results justify it.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 119.

---

# Prompt 119 — Knowledge relationship graph

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **119 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create an explainable relationship model without prioritizing decorative visualization.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 120.

---

# Prompt 120 — Analytics event taxonomy

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **120 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define privacy-conscious product events, creative outcomes, and operational metrics.

## Step-specific engineering direction

Collect the minimum useful data, document meaning, avoid vanity metrics, and preserve workspace privacy.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 121.

---

# Prompt 121 — Workspace analytics

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **121 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build useful project completion, revisions, analysis usage, and knowledge reuse views.

## Step-specific engineering direction

Collect the minimum useful data, document meaning, avoid vanity metrics, and preserve workspace privacy.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 122.

---

# Prompt 122 — Plugin manifest specification

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **122 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define future extension packaging, permissions, compatibility, and review requirements.

## Step-specific engineering direction

Prefer modular boundaries, explicit interfaces, ADRs, and dependency direction that can be enforced automatically.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 123.

---

# Prompt 123 — Marketplace boundaries

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **123 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Document deferred marketplace scope, security model, licensing, and moderation needs.

## Step-specific engineering direction

Make explicit product decisions, write down exclusions, and avoid implementation until the decision record is approved.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 124.

---

# Prompt 124 — Billing and entitlement design

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **124 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define plans, metering, limits, trials, upgrades, and provider-cost safeguards without implementing billing prematurely.

## Step-specific engineering direction

Make explicit product decisions, write down exclusions, and avoid implementation until the decision record is approved.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 125.

---

# Prompt 125 — Integrations and growth release gate

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **125 of 150**, within **Integrations and Growth**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Audit adapter honesty, privacy, exports, search, analytics, and deferred-scope boundaries.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 126.

---
