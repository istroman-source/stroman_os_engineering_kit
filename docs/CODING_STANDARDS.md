# Coding Standards

These conventions keep a codebase that is expected to exceed hundreds of
thousands of lines readable and maintainable. They are enforced by tooling where
possible.

## Principles

1. Composition over inheritance.
2. Explicitness over magic.
3. Typed contracts over implicit behavior.
4. Optimize for the next developer, not for writing the most code.
5. Small modules, one responsibility each.
6. Avoid unnecessary abstractions and premature optimization.
7. Everything should be easy to test.

## TypeScript

- `strict` is on, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, and
  `noFallthroughCasesInSwitch`. Do not weaken these.
- No `any`. Prefer `unknown` at boundaries and narrow explicitly.
- Public module APIs are exported through a folder `index.ts`.
- Import across layers only via the `@/…` alias, respecting the dependency rule
  in `docs/ARCHITECTURE.md`.

## Errors and results

- Use `Result` (`src/lib/result`) for expected, recoverable outcomes.
- Throw `AppError` subclasses (`src/lib/errors`) for exceptional conditions.
- Never expose internal causes or secrets in user-facing error messages.

## Validation

- Validate all external input (env, request bodies, params) with Zod at the
  boundary via `src/lib/validation`.

## Styling

- Never hardcode colors, spacing, radius, shadow, motion, or z-index. Use design
  tokens (`src/styles/tokens.css`) through Tailwind utilities or `var(--token)`.
- Compose class names with `cn` (`src/ui/cn`).
- Meet WCAG 2.2 AA: keyboard focus is always visible; interactive elements have
  accessible names.

## Testing

- Co-locate unit/component tests as `*.test.ts(x)` beside the code.
- Inject time and IO (clocks, sinks) so tests are deterministic.
- End-to-end flows live in `e2e/` and run against the production build.

## Quality bar

- No dead code, commented-out code, or `TODO` markers left in committed work.
- No duplicate logic; extract a single-purpose module instead.
- No circular dependencies; no unnecessary dependencies.
- Every check (`format:check`, `lint`, `typecheck`, `test`, `build`) must pass
  before a step is considered done. Never claim a check passed without running it.

## Commits

Format: `prompt-NNN: short imperative summary` (e.g. `prompt-002: engineering foundation`).
Commit each stable step separately.
