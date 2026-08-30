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

## ACTIVE WORK QUEUE

- [ ] Complete full UX audit against the original redesign brief and maintain the final PASS/PARTIAL/FAIL audit.
- [x] Simplify the project entry and project navigation.
- [x] Simplify Storyboard, Materials, source import, analysis, edit, and export entry language.
- [x] Simplify the Locations library entry state without changing reconstruction behavior.
- [x] Simplify creative decision creation and detail for plain-language guidance and progressive disclosure.
- [x] Simplify location-detail advanced details, recovery, and on-set mobile hierarchy.
- [x] Simplify global navigation and project empty states around one primary action.
- [x] Audit shot planning, production-stage flow, and AI placement for filmmaker authority and progressive disclosure.
- [ ] Audit responsive and accessibility behavior across modified major screens.
- [x] Remove repeated information and preserve cross-stage project continuity wherever current contracts support it.
- [ ] Run targeted UX regression coverage for every modified area.
- [ ] Run typecheck, lint, and the full locally-runnable suite; record any environment-only failures precisely.
- [ ] Perform the full Definition-of-Done audit; every relevant area must be PASS before declaring the redesign complete.

## Next task

Audit responsive and accessibility behavior across every modified major screen, then run the complete targeted UX regression set.

## First action next run

Read this file, run `git status --short --branch`, inspect the modified-screen diff for labels, focus order, touch targets, overflow, and mobile stacking, then fix and test every reproducible issue.
