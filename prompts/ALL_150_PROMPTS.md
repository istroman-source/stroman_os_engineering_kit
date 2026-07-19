# Stroman OS — Complete Claude Code Build Book

This is a convenience compilation. **Do not paste this whole file into Claude.** Use one numbered prompt at a time.

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

# Prompt 026 — Dashboard data contracts

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **26 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define dashboard queries, response schemas, and deterministic next-action rules.

## Step-specific engineering direction

Use typed contracts, efficient queries, authorization, predictable errors, and tests.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 027.


---

# Prompt 027 — Dashboard interface

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **27 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build the real-data dashboard with loading, empty, error, and permission states.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 028.


---

# Prompt 028 — Project creation workflow

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **28 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement validated project creation with clients, objectives, audiences, platforms, and deliverables.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 029.


---

# Prompt 029 — Project overview workspace

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **29 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build project overview, health state, missing information, and recent activity.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 030.


---

# Prompt 030 — Project metadata editing

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **30 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement safe editing, audit logs, concurrency handling, and authorization.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 031.


---

# Prompt 031 — Project lifecycle states

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **31 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement draft, active, review, delivered, archived, and soft-deleted transitions.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 032.


---

# Prompt 032 — Brand profile management

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **32 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build living client brand profiles with rules, references, voice, and prohibited patterns.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 033.


---

# Prompt 033 — Storage adapter contract

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **33 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define provider-neutral object storage and signed upload interfaces.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 034.


---

# Prompt 034 — Development storage adapter

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **34 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement a safe local or development storage adapter with deterministic tests.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 035.


---

# Prompt 035 — Direct upload workflow

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **35 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement validated signed uploads, progress, cancellation, retry, and duplicate protection.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 036.


---

# Prompt 036 — Asset library views

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **36 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build asset table, grid, filters, status, metadata, and detail drawer.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 037.


---

# Prompt 037 — Asset integrity and deletion

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **37 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement checksums, duplicates, safe deletion, unavailable evidence handling, and audit trails.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 038.


---

# Prompt 038 — Transcript parser contracts

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **38 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Define normalized transcript structures and parser errors.

## Step-specific engineering direction

Use typed contracts, efficient queries, authorization, predictable errors, and tests.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 039.


---

# Prompt 039 — SRT and VTT import

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **39 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement standards-compliant SRT and VTT parsing with fixtures and edge-case tests.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 040.


---

# Prompt 040 — JSON and text transcript import

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **40 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement normalized JSON and plain-text imports without altering original wording.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 041.


---

# Prompt 041 — Transcript versioning

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **41 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Separate source text from user edits and preserve complete revision history.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 042.


---

# Prompt 042 — Transcript viewer

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **42 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build virtualized transcript display with timestamps, speakers, and deep links.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 043.


---

# Prompt 043 — Transcript search and filters

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **43 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement fast keyword search, speaker filtering, and result navigation.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 044.


---

# Prompt 044 — Evidence bookmarking

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **44 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Allow users to create evidence references from transcript selections and assets.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 045.


---

# Prompt 045 — Evidence drawer and citations

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **45 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build resolvable evidence chips, drawers, provenance labels, and unavailable states.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 046.


---

# Prompt 046 — Character assignment tools

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **46 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Allow manual speaker-to-character linking, merge, split, and correction.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 047.


---

# Prompt 047 — Decision log foundation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **47 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build manual decisions, alternatives, tradeoffs, evidence, approval, and history.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 048.


---

# Prompt 048 — Lessons and retrospective workflow

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **48 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build human-approved project learning capture and contextual warnings.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 049.


---

# Prompt 049 — Global command palette

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **49 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement navigation and deterministic project actions with permission enforcement.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 050.


---

# Prompt 050 — Core application release gate

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **50 of 150**, within **Core Application**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Run end-to-end workflows, security checks, UX review, and document all limitations.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 051.


---

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

# Prompt 126 — Comprehensive threat model

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **126 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Model assets, actors, trust boundaries, abuse cases, mitigations, and residual risks.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 127.


---

# Prompt 127 — Upload security hardening

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **127 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Enforce file validation, quarantine hooks, signed access, filename safety, and resource limits.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 128.


---

# Prompt 128 — Application security headers

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **128 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement CSP, HSTS, frame controls, referrer policy, and secure cookie configuration.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 129.


---

# Prompt 129 — Rate limiting and abuse controls

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **129 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Protect authentication, uploads, search, exports, integrations, and AI execution.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 130.


---

# Prompt 130 — Data retention and deletion

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **130 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement configurable retention, workspace deletion, account deletion, and verifiable cleanup workflows.

## Step-specific engineering direction

Make collection, retention, deletion, and third-party exposure explicit and testable.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 131.


---

# Prompt 131 — Backup and restore rehearsal

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **131 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement and test database and object-storage recovery procedures.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 132.


---

# Prompt 132 — Audit log review tools

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **132 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Build authorized audit search, export, integrity, and retention controls.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 133.


---

# Prompt 133 — Accessibility automated audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **133 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Run automated WCAG checks across all primary workflows and fix violations.

## Step-specific engineering direction

Fix issues in implementation rather than merely producing an audit document.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 134.


---

# Prompt 134 — Accessibility manual audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **134 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Complete keyboard, screen reader, focus, zoom, contrast, motion, and error-message review.

## Step-specific engineering direction

Fix issues in implementation rather than merely producing an audit document.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 135.


---

# Prompt 135 — UX consistency audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **135 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Remove dead ends, fake controls, inconsistent states, jargon, and unclear user authority.

## Step-specific engineering direction

Evaluate complete journeys, user authority, clarity, interruption costs, and recovery from errors.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 136.


---

# Prompt 136 — Database performance audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **136 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Profile queries, indexes, pagination, locking, and realistic workspace scale.

## Step-specific engineering direction

Measure with representative data before optimizing and preserve correctness while improving speed.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 137.


---

# Prompt 137 — Frontend performance audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **137 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Profile bundles, rendering, transcript virtualization, loading waterfalls, and interaction latency.

## Step-specific engineering direction

Measure with representative data before optimizing and preserve correctness while improving speed.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 138.


---

# Prompt 138 — Job reliability and concurrency audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **138 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Stress retries, idempotency, cancellation, duplicate prevention, and worker recovery.

## Step-specific engineering direction

Measure with representative data before optimizing and preserve correctness while improving speed.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 139.


---

# Prompt 139 — AI cost and latency controls

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **139 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Add budgets, warnings, model policies, caching rules, and transparent usage reporting.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 140.


---

# Prompt 140 — Observability foundation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **140 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement structured logs, metrics, tracing boundaries, health checks, and alert-ready signals.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 141.


---

# Prompt 141 — Error monitoring and incident context

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **141 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Integrate error reporting with safe redaction and actionable release metadata.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 142.


---

# Prompt 142 — Staging environment

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **142 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create production-like staging with migrations, workers, storage, monitoring, and seeded demo data.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 143.


---

# Prompt 143 — CI/CD release pipeline

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **143 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Implement gated builds, migrations, tests, deployment, smoke checks, and rollback support.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 144.


---

# Prompt 144 — End-to-end release suite

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **144 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Cover the complete user journey from workspace creation through export and retrospective.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 145.


---

# Prompt 145 — AI red-team evaluation

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **145 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Test unsupported claims, prompt injection, sensitive inference, malicious evidence, and false authority.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 146.


---

# Prompt 146 — Operational runbooks

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **146 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create incident, outage, provider failure, stuck jobs, failed migrations, and data recovery runbooks.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 147.


---

# Prompt 147 — Beta onboarding experience

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **147 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Create guided setup, sample project, contextual education, and honest limitations.

## Step-specific engineering direction

Teach the workflow without masking limitations or turning the product into an AI chat experience.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 148.


---

# Prompt 148 — Legal and policy readiness checklist

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **148 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Document required terms, privacy notices, subprocessors, consent, and counsel review items.

## Step-specific engineering direction

Identify items requiring legal or business approval and do not pretend engineering documents are legal advice.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 149.


---

# Prompt 149 — Limited beta release audit

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **149 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Classify blockers and determine readiness for a small invited user cohort.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 150.


---

# Prompt 150 — Version 1 release and roadmap

You are continuing the implementation of **Stroman OS**, a professional Creative Intelligence Platform.

## Context

This is sequential build step **150 of 150**, within **Hardening and Release**. The repository may already contain work from all earlier prompts. Treat that work as the current source of truth unless it conflicts with an approved architecture decision.

## Objective

Finalize changelog, known limitations, adoption metrics, feedback loop, and v1.1 priorities.

## Step-specific engineering direction

Freeze major scope, verify release evidence, and establish the feedback and rollback process.

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

Stop after this objective is implemented, tested, documented, and summarized. Do not start Prompt 151.


---
