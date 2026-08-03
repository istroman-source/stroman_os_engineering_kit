# Internal Alpha Readiness Gate

## Verdict

**READY FOR CONTROLLED INTERNAL ALPHA**

This verdict covers the concept-to-transcript-to-grounded-analysis-to-Edit-Engine-to-
manual-prompt-handoff workflow. It is not a beta or production-readiness claim.

## Automated release criteria

The repository-owned `npm run test:evaluations` gate fails unless all fixtures prove:

- every generated claim cites at least one supplied transcript segment;
- no generated citation points outside the supplied source set;
- confidence values remain in the documented zero-to-one range;
- identical inputs produce identical baseline analysis;
- absent evidence returns an empty result instead of crashing or inventing claims;
- source-derived prompt content is delimited, angle-bracket escaped, and preceded by
  authority rules that reject embedded instructions;
- Wideframe remains explicitly labeled as manual-only with no claimed API transfer.

This evaluation command is required by pull-request CI alongside unit tests and the
production build.

## Known limitations and manual checks

- The analysis adapter is a transparent deterministic baseline, not a hosted model.
- Fixture evaluations demonstrate invariants, not subjective editorial quality.
- Authenticated end-to-end coverage remains API- and unit-level; the current Playwright
  suite verifies the signed-out gate but not a complete signed-in filmmaker journey.
- Clipboard and file-download behavior require a browser smoke test on the internal-alpha
  build.
- Manual Wideframe paste acceptance must be tested in the currently available Wideframe
  desktop product; no public API contract has been verified.

Any cross-owner access, fabricated citation, orphaned analysis run, destructive source
mutation, fake integration status, or failure of the critical project workflow blocks
internal-alpha release.
