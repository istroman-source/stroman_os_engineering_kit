# Known Limitations

Honest inventory of what the foundation does **not** yet do, and constraints a
new engineer should know. Captured after Prompt 002 and the Gate 1 review. None
of these are defects in the foundation's scope; they are deliberate boundaries or
tracked follow-ups. Operational follow-ups also live in `docs/BACKLOG.md`.

## Product capability not yet built (by design)

The foundation intentionally contains **no business functionality**. Absent:

- Authentication and session management.
- Authorization (server-side workspace/role checks). The `src/server` boundary is
  reserved and documented, but empty. **Do not build data access without it.**
- Database models and migrations (`prisma/schema.prisma` has no models;
  `DATABASE_URL` is optional until models exist).
- AI providers/engines, uploads, transcripts, evidence, decisions, dashboards,
  and API endpoints.

These arrive in later build steps and must not be assumed present.

## Platform / tooling constraints

- **Prisma pinned to v6.** Prisma 7 (config file + driver adapter) is not adopted;
  migrating is a tracked task. See ADR-0008.
- **Local Node via `~/.local/node`.** Non-standard install (Homebrew needed an
  interactive admin password). Standardize with Homebrew/nvm/`.tool-versions`
  before team onboarding. See ADR-0013.
- **npm 11 install-script allowlist.** `package.json` `allowScripts` pins approved
  packages (esbuild, sharp, unrs-resolver, prisma engines, fsevents). Revisit on
  major dependency bumps.
- **Playwright browsers are not bundled.** Run `npx playwright install` (CI does
  this in the e2e job).

## CI/CD gaps

- No PostgreSQL service in the e2e job yet (no DB-backed routes exist). Add when
  routes read data.
- No dependency-audit gate (`npm audit`/Dependabot) — deferred to avoid flaky
  failures on transitive advisories; add a scheduled audit before beta.
- No Playwright browser caching in CI (minor speed cost).

## Quality gaps (foundation-appropriate, tracked)

- **No coverage thresholds.** 51 unit + 2 e2e tests exist, but no enforced
  minimum. Add thresholds as the codebase grows.
- **No automated accessibility testing.** Manual a11y foundations are in place
  (focus-visible, skip link, ARIA labels, `color-scheme`); add `axe`-based checks
  when interactive features land.
- **No bundle-size budget or DB query profiling.** Not meaningful until real
  features/data exist.

## Design system limitations

- **Dark-first only; no runtime theme toggle.** Tokens support `.light`, but there
  is no persisted theme provider/toggle yet. See ADR-0005.
- **Spacing uses Tailwind's default scale** rather than bespoke spacing tokens.
  Acceptable in Tailwind v4 (the scale *is* the token system); revisit only if
  brand spacing diverges.
- **Single shadcn/ui primitive so far** (`Button`). The component library grows in
  later steps; conventions (`components.json`, `cn`) are in place.

## Documentation gaps

- No `SECURITY.md` or `CONTRIBUTING.md` yet — recommended before external
  contributors. (`ARCHITECTURAL_DECISIONS.md` and this file now exist.)

## Process / repository notes

- **Kit prompt-numbering divergence.** The custom Prompt 002 bundled what the kit
  splits across steps 004–008 and 022–024; skip those when rejoining the sequence.
- **`public/` is empty** (default Next assets removed); the favicon lives in
  `src/app`. Add real assets when branding is defined.
- **`.prettierignore` excludes markdown and `prompts/`** so the kit's authored
  content is never reformatted; docs are therefore not format-checked.
