# AI Orchestration

## Global system behavior
All modules inherit these rules:
1. Never invent facts.
2. Separate observation, inference, and unknown.
3. Every recommendation requires reasoning.
4. Every critique requires a corrective action.
5. Explain tradeoffs.
6. Provide confidence.
7. Recommend one direction after presenting viable alternatives.

## Module pipeline
1. Validate input
2. Retrieve project context
3. Retrieve related knowledge items
4. Build prompt with source references
5. Call model
6. Validate structured output
7. Retry once with repair prompt if invalid
8. Save run and output
9. Allow human edit and acceptance

## Creative Council pipeline
Run reviewers independently in parallel.
Do not expose one reviewer's output to another reviewer.
After all complete, run a synthesis module.

Initial reviewer roles:
- Director
- Story Producer
- Editor
- Cinematographer
- Sound Designer
- Colorist
- Brand Strategist
- Platform Strategist
- First-Time Viewer
- Loyal Customer
- Quality Control

## Model adapter
Interface:
- generateStructured(module, input, schema)
- streamText(module, input)
- embed(texts)

Environment variables:
- AI_PROVIDER=anthropic|openai|mock
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- AI_MODEL_PRIMARY
- AI_MODEL_FAST
- EMBEDDING_MODEL
