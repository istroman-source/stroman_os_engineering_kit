# Testing and QA Manual

## Test pyramid
- Unit tests for rules and validation.
- Database tests for constraints and workspace isolation.
- Contract tests for adapters and AI providers.
- Integration tests for application services and jobs.
- End-to-end tests for critical user journeys.
- Accessibility tests for interactive UI.
- AI evaluations for grounding, schema conformance, differentiation, uncertainty, and prompt injection.

## Release blockers
Cross-workspace access, fabricated evidence, irreversible data loss, secrets exposure, broken migrations, inaccessible primary workflows, fake integration status, or failing critical end-to-end journeys.
