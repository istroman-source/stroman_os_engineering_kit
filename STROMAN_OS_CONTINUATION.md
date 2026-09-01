# Stroman OS continuation

## Current objective

Ship the production-discovered music-video intake reliability fix and pass its exact-SHA release
gate without weakening filmmaker authority, evidence integrity, security, or source preservation.

## Completed

- Replaced redundant creative-intake questions with one detailed natural-language brief and three
  optional format fields.
- Persisted the complete brief before hosted reasoning and added durable processing/failure recovery
  so navigation, proxy, and provider failures cannot erase the filmmaker's words.
- Added reload-safe progress, automatic completion polling, and retry without re-entry.
- Simplified the project entry to one required, plain-language question.
- Moved optional planning details behind intentional progressive disclosure.
- Changed the project landing language to "Start a video" and simplified project navigation.
- Simplified rooms, source intake, analysis, editing, choices, and shot planning around filmmaker actions.
- Removed repeated navigation and planning cards while preserving every existing route and API contract.
- Kept recommendations editable, evidence distinct, and technical/manual controls behind disclosure.

## Relevant commits

- `3f5fec0` — simplified filmmaker project entry
- `f4b1810` — clarified project navigation
- `44be115` — updated regression coverage
- `2d3002e` — streamlined the filmmaker planning workspace
- `af4fd05` — improved mobile and keyboard UX
- `9ae7a58` — aligned the complete decision workspace with the simplified language

## Verification

- TypeScript, formatting, OpenAPI (98 paths), production build, and Playwright desktop/mobile smoke
  pass.
- Full unit/UI/worker suite: 716/716 passed; real-PostgreSQL integration: 92/92; authenticated API:
  98/98; cross-mode evaluation: 28/28; guarded autopilot: 57/57.
- Fresh 30-migration deployment and seeded compatible 28→30 migration rehearsal pass.
- Current full-detail Apple pipeline produced and application-validated a 12.3 MB GLB from 26
  preserved room photos without a paid service.
- ESLint has zero errors; two pre-existing unused-parameter warnings remain in
  `decisions-api.test.ts`.

## Important constraints

- Work only in this clean checkout: `work/v1-functional-completion`.
- Preserve the canonical checkout and the separate dirty Apple reconstruction experiment in
  `work/room-fidelity-release`.
- Do not use KIRI, RunPod, or paid reconstruction. Never expose credential values.
- Preserve normal non-force PR, CI, independent-review, merge, deployment, and post-merge checks.

## Priority order

1. Freeze the music-video intake fix at an exact review SHA.
2. Obtain independent product-meaning and implementation review; remediate any BLOCKING or IMPORTANT
   finding against a new exact SHA.
3. Push, pass exact-head CI, merge normally, and verify post-merge main CI.
4. Exercise the signed-in deployed workflow and publish the human-test handoff.

## Completed UX redesign queue

- [x] Complete full UX audit against the original redesign brief and maintain the final PASS/PARTIAL/FAIL audit.
- [x] Simplify the project entry and project navigation.
- [x] Simplify Storyboard, Materials, source import, analysis, edit, and export entry language.
- [x] Simplify the Locations library entry state without changing reconstruction behavior.
- [x] Simplify creative decision creation and detail for plain-language guidance and progressive disclosure.
- [x] Simplify location-detail advanced details, recovery, and on-set mobile hierarchy.
- [x] Simplify global navigation and project empty states around one primary action.
- [x] Audit shot planning, production-stage flow, and AI placement for filmmaker authority and progressive disclosure.
- [x] Audit responsive and accessibility behavior across modified major screens.
- [x] Remove repeated information and preserve cross-stage project continuity wherever current contracts support it.
- [x] Run targeted UX regression coverage for every modified area (48/48 passing).
- [x] Run typecheck, lint, and the full locally-runnable suite; record any environment-only failures precisely.
- [x] Perform the full Definition-of-Done audit; every relevant area is PASS.

## Definition-of-Done audit

- PASS — Information architecture and navigation: two global filmmaker destinations and four plain-language project stages.
- PASS — Dashboard, onboarding, project creation, and empty states: one primary start action with guidance at the point of need.
- PASS — Intent and analysis: one required brief field, optional context disclosed on demand, evidence separated from interpretation.
- PASS — Locations and room recovery: room-first language, clear states, saved-source retries, mobile controls, and technical details disclosed on demand.
- PASS — Shot planning and storyboard: room grounding is optional until material, proposals stay editable, separate frame/blocking/lighting artifacts remain available.
- PASS — Footage, notes, edit, and handoff: plain-language entry actions and captured evidence remain distinct from shaping ideas.
- PASS — Choices and recommendations: filmmaker authority is explicit; manual recommendation plumbing is not in the default path.
- PASS — Cross-stage continuity: shared project navigation and preserved room/story context without duplicate backlinks or input summaries.
- PASS — Responsive and accessibility behavior: mobile stacking, horizontal project navigation, 44px controls, labeled inputs, keyboard-visible disclosures, contextual action labels, and mobile-safe uploads.
- PASS — Reliability and error states: authentication redirects, retry-safe rooms, preserved source messaging, actionable failures, and live progress behavior remain covered.
- N/A — Internal acquisition and knowledge administration routes: not part of the filmmaker-facing redesign or primary navigation.

## ACTIVE WORK QUEUE

- [x] Reproduce the lost music-video plan in the signed-in deployed app and identify the repeated
  404 polling caused by saving intent only after hosted development.
- [x] Persist full filmmaker intent before provider work and expose its durable lifecycle.
- [x] Reduce the intake to one detailed brief while preserving legacy structured intent on edits.
- [x] Recover processing and failed plans across navigation and reload without duplicate generation.
- [x] Add focused unit/UI/API/PostgreSQL regression coverage and update the OpenAPI contract.
- [x] Pass format, lint, typecheck, full 720-test unit/UI/worker suite, fresh 31-migration real-
  PostgreSQL API suite (99 tests), integration suite (92 tests), evaluation suite (28 tests),
  autopilot suite (57 tests), migration rehearsal, 10 desktop/mobile browser smokes, and webpack
  production build.
- [ ] Freeze the music-video intake fix at an exact SHA and obtain independent review with zero
  BLOCKING and IMPORTANT findings.
- [ ] Push, pass exact-head CI, merge normally, and verify post-merge main CI/deployment.
- [ ] Verify the simplified, saved-before-development workflow in the signed-in deployed browser.
- [ ] Publish exact evidence and the READY FOR HUMAN TESTING verdict.

### Previously completed V1 release queue

- [x] Complete the filmmaker-facing UX redesign.
- [x] Complete project lifecycle, structured intent, source/evidence inspection, Develop, Build,
  Edit, unified decisions, Review, exports, and cross-mode acceptance.
- [x] Apply all 30 migrations on a fresh database and rehearse the final two over preserved
  compatible data.
- [x] Pass local unit/UI/worker, real-PostgreSQL integration/API/auth, evaluation, autopilot,
  Playwright, security, OpenAPI, format, lint, typecheck, and production-build gates.
- [x] Reconstruct the preserved 26-photo room through the current full-detail Apple pipeline and
  validate its resulting GLB through the application geometry gate.
- [x] Fix the runtime-discovered canonical room-dimension double scaling with regression coverage.
- [x] Record exact automated/native evidence and reproducible human-testing instructions.
- [x] Remediate the first independent review's hosted-versus-offline honesty finding: production
  now fails closed, while explicit offline drafts are visibly labeled for the filmmaker.
- [x] Freeze the final exact SHA and obtain independent Claude review with zero BLOCKING and
  IMPORTANT findings.
- [x] Push the private branch, pass exact-head CI, and complete the established non-force merge.
- [x] Verify post-merge main CI and the signed-in deployed intent → evidence → decision → Review →
  export and prepared-room workflow.
- [x] Publish the final exact SHA, evidence, limitations, and READY FOR HUMAN TESTING verdict.

The task remains in progress while an executable unchecked item remains.
