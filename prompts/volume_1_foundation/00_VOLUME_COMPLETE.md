# Stroman OS — Foundation

Use these prompts one at a time in numeric order. Do not paste an entire volume at once.

# Prompt 001 — Repository audit and baseline

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **1 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Inspect the repository, establish the baseline, and document all existing files, assumptions, gaps, and risks.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 002.

---

# Prompt 002 — MVP scope lock

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **2 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define the smallest credible internal beta and explicitly defer nonessential capabilities.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 003.

---

# Prompt 003 — Architecture decision records

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **3 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create ADRs for the application framework, database, authentication, jobs, storage, search, and AI-provider abstractions.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 004.

---

# Prompt 004 — Monorepo and folder structure

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **4 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create the maintainable repository structure without implementing business features.

## Step-specific engineering direction

Keep this step infrastructure-only. Do not smuggle future product features into the foundation.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 005.

---

# Prompt 005 — Local development environment

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **5 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create deterministic local setup with environment validation and Docker-backed dependencies.

## Step-specific engineering direction

Keep this step infrastructure-only. Do not smuggle future product features into the foundation.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 006.

---

# Prompt 006 — Code quality toolchain

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **6 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Configure strict TypeScript, linting, formatting, import boundaries, and pre-commit checks.

## Step-specific engineering direction

Keep this step infrastructure-only. Do not smuggle future product features into the foundation.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 007.

---

# Prompt 007 — Continuous integration baseline

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **7 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create CI jobs for install, lint, type-check, unit tests, and production build.

## Step-specific engineering direction

Make automation reproducible, least-privileged, and capable of failing clearly before deployment.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 008.

---

# Prompt 008 — Database development environment

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **8 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Configure PostgreSQL, Prisma, migrations, resets, and safe seed execution.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 009.

---

# Prompt 009 — Core domain glossary

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **9 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Translate the Stroman Method taxonomy into enforceable domain terminology and naming rules.

## Step-specific engineering direction

Use the exact Stroman OS vocabulary consistently and identify ambiguous or overloaded terms.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 010.

---

# Prompt 010 — Initial domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **10 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement workspaces, memberships, clients, projects, and brand profiles.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 011.

---

# Prompt 011 — Media and transcript domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **11 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement assets, transcript documents, segments, speakers, and provenance.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 012.

---

# Prompt 012 — Evidence domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **12 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement durable evidence references and provenance classifications.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 013.

---

# Prompt 013 — Analysis and decision domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **13 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement versioned analysis runs, outputs, recommendations, and human decisions.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 014.

---

# Prompt 014 — Review and rubric domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **14 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement rubric definitions, criteria, scores, overrides, and review runs.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 015.

---

# Prompt 015 — Learning domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **15 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement lessons, retrospectives, approvals, and related project context.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 016.

---

# Prompt 016 — Audit and integration domain model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **16 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement audit events, external connections, sync runs, and external identifiers.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 017.

---

# Prompt 017 — Database indexes and constraints

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **17 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Add uniqueness, referential integrity, workspace scoping, and performance indexes.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 018.

---

# Prompt 018 — Seeded demonstration workspace

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **18 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create realistic Stroman Productions seed data for development and testing.

## Step-specific engineering direction

Use migrations, constraints, indexes, test fixtures, and workspace-scoped relationships. Do not store media binaries in PostgreSQL.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 019.

---

# Prompt 019 — Authentication foundation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **19 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement sign-in, sign-out, protected routes, and development-safe authentication.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 020.

---

# Prompt 020 — Workspace authorization service

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **20 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create reusable server-side access checks and role capabilities.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 021.

---

# Prompt 021 — Cross-workspace isolation tests

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **21 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Prove users cannot read or mutate data outside authorized workspaces.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 022.

---

# Prompt 022 — Application shell foundation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **22 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build the responsive dark-first shell, navigation, workspace switcher, and user menu.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 023.

---

# Prompt 023 — Design tokens

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **23 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement typography, spacing, color, radius, elevation, focus, and motion tokens.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 024.

---

# Prompt 024 — Core component library

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **24 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build and document reusable application components and state variants.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 025.

---

# Prompt 025 — Foundation release gate

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **25 of 150**, within **Foundation**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Audit all foundation work, remove shortcuts, run checks, and produce a readiness report.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 026.

---
