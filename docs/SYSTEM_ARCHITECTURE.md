# System Architecture

## High-level architecture

Client:
- Next.js App Router
- Server Components where appropriate
- Client Components for interactive trees, scoring, and editors

Server:
- Next.js route handlers or separate API service
- Service layer for content, projects, AI, search, and scoring

Data:
- PostgreSQL
- Prisma
- Vector embeddings for semantic search
- Object storage for attachments

AI:
- Provider-agnostic model adapter
- Structured JSON outputs
- Prompt templates stored as versioned records
- Role-based evaluation orchestration

## Core domains

### Content domain
Stores reusable knowledge modules.
Entities:
- ContentItem
- ContentRelation
- ContentVersion
- Tag
- TaxonomyTerm

### Project domain
Stores user projects and workflow state.
Entities:
- Project
- ProjectStage
- ProjectArtifact
- ProjectDecision
- ProjectLearning

### Evaluation domain
Stores rubrics and reviews.
Entities:
- Rubric
- RubricCriterion
- Evaluation
- EvaluationScore
- CouncilReview

### Decision domain
Stores decision trees and navigation.
Entities:
- DecisionTree
- DecisionNode
- DecisionEdge
- DecisionRun

### AI domain
Stores prompts, runs, and structured output.
Entities:
- AIModule
- AIPromptVersion
- AIRun
- AIReviewerRole

## Search
Use hybrid ranking:
- PostgreSQL full-text score
- vector similarity
- tag match
- content relation boost
- project context boost

## Recommendation pipeline
1. Parse user problem
2. Classify intent and project stage
3. Retrieve matching taxonomy terms
4. Retrieve decision trees
5. Retrieve tools, rubrics, playbooks, and case studies
6. Rank resources
7. Run AI synthesis with citations to internal resources
8. Present recommended path and alternatives

## AI safety and reliability rules
- Mark observations, inferences, and unknowns separately
- Never invent project facts
- Require confidence value
- Require evidence references when project data exists
- Provide options with tradeoffs
- Require one recommended direction
- Log prompt version and model

## Permissions
Roles:
- Owner
- Admin
- Editor
- Reviewer
- Viewer

MVP can initially support Owner only but schemas should remain multi-user compatible.

## Suggested route structure
/
/dashboard
/projects
/projects/new
/projects/[projectId]
/projects/[projectId]/stage/[stageSlug]
/gps
/knowledge
/knowledge/[slug]
/decision-trees/[slug]
/rubrics/[slug]
/playbooks/[slug]
/case-studies/[slug]
/settings

## Component hierarchy
- AppShell
- GlobalSearch
- ProjectStageNavigator
- DecisionTreeRunner
- RubricScorer
- CouncilReviewPanel
- ResourceCard
- RelatedResources
- ConfidenceBadge
- EvidencePanel
- TradeoffPanel
- FinalRecommendation

## API groups
/api/projects
/api/content
/api/search
/api/decision-runs
/api/evaluations
/api/ai/run
/api/council-review
/api/learning

## Quality requirements
- Type-safe end-to-end
- All AI outputs validated with Zod
- Every mutation has authorization checks
- Optimistic UI only where safe
- Autosave guided forms
- Accessible keyboard navigation
- Responsive down to 375px width
