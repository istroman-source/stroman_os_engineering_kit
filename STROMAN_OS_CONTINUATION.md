# Stroman OS continuation

## Current objective

Make Stroman OS easier to enter and navigate without changing its API contracts or production data.

## Completed

- Simplified the project entry to one required, plain-language question.
- Moved optional planning details behind intentional progressive disclosure.
- Changed the project landing language to "Start a video" and simplified project navigation.

## Relevant commits

- `3f5fec0` — simplified filmmaker project entry
- `f4b1810` — clarified project navigation
- `44be115` — updated regression coverage

## Verification

- TypeScript: passed (`npm run typecheck`).
- Focused UX tests: 12/12 passed.
- Focused lint and whitespace checks: passed.
- The full unit suite reached 650 passing tests. Two existing reconstruction-worker tests cannot bind localhost in this sandbox (`EPERM`); that is an environment restriction, not a dismissed test failure.

## Important constraints

- Work only in this clean checkout: `work/ux-redesign`.
- Preserve the separate dirty Apple reconstruction experiment in `work/room-fidelity-release`.
- Do not use secrets, deployments, Railway, browser sign-in, external workers, or paid services during this local-only phase.
- Do not claim full-suite success until the localhost-capable environment runs the worker tests.

## Priority order

1. Continue simplifying the remaining in-project language and hierarchy while preserving routes and API contracts.
2. Add targeted regression coverage for each UX behavior changed.
3. Run typecheck, focused lint, and focused tests after each coherent slice.
4. Run the full local suite when appropriate; record the localhost sandbox limitation exactly if it recurs.

## Next task

Audit and simplify the project’s Storyboard and Materials entry copy so users see a clear next action before advanced workspace controls.

## First action next run

Read this file, run `git status --short --branch`, inspect `src/app/(app)/projects/[projectId]/storyboard/page.tsx` and `src/app/(app)/projects/[projectId]/materials/page.tsx`, then implement the smallest safe copy/hierarchy improvement with targeted tests.
