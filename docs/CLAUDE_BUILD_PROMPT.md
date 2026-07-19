# Master Build Prompt for Claude Code

You are the principal engineer and product designer responsible for building the Stroman Creative Intelligence System from the specifications in this repository.

## Objective
Create a production-quality responsive web application that functions as a creative decision operating system for filmmakers and production teams.

## Read first
- README.md
- docs/PRODUCT_REQUIREMENTS.md
- docs/SYSTEM_ARCHITECTURE.md
- schemas/domain-model.md
- schemas/ai-output-schemas.md
- seed/seed-content.json
- ai/AI_ORCHESTRATION.md
- tests/ACCEPTANCE_TESTS.md

## Required stack
- Next.js 15 or newer
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma
- Zod
- Vitest
- Playwright

Use a clean provider abstraction for AI so Anthropic and OpenAI models can be swapped through environment variables.

## Build order
1. Scaffold project and environment validation
2. Implement Prisma schema and seed script
3. Implement authentication-ready app shell
4. Implement dashboard
5. Implement knowledge base and hybrid search
6. Implement project creation and stage workflow
7. Implement interactive decision tree runner
8. Implement rubric scoring
9. Implement AI module execution with mocked provider fallback
10. Implement Creative Council orchestration
11. Implement case study and playbook pages
12. Implement project learning engine
13. Add automated tests
14. Add README setup instructions

## UI direction
Professional, minimal, cinematic, and operational.
Avoid flashy gradients, excessive animation, or generic AI aesthetics.
Use strong typography, dense but readable information hierarchy, and clear status indicators.

## Required behavior
- Every recommendation includes reasoning
- Show observation, inference, and unknown separately
- Show confidence
- Show tradeoffs
- Preserve generated artifacts inside the project workspace
- Allow users to edit AI outputs before accepting them
- Never overwrite human decisions silently

## Completion definition
The app is complete when all acceptance tests pass and a new user can:
1. create a project
2. complete Project Discovery
3. ask Creative GPS for help
4. run a decision tree
5. score a project with a rubric
6. run a Creative Council review
7. view related playbooks and case studies
8. complete Final Review
9. save post-project lessons

Do not merely generate placeholder screens. Implement working flows backed by the database. Seed the system with the supplied initial content.
