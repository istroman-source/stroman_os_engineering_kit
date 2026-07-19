# Domain Model

## ContentItem
- id: UUID
- type: enum
- slug: string unique
- title: string
- summary: string
- body: markdown
- status: draft | published | archived
- version: integer
- metadata: JSON
- createdAt
- updatedAt

Content types:
- FIRST_PRINCIPLE
- PROTOCOL
- STANDARD
- ENGINE
- TOOL
- PLAYBOOK
- RUBRIC
- DECISION_TREE
- CASE_STUDY
- TAXONOMY_TERM
- AI_MODULE

## ContentRelation
- id
- fromContentId
- toContentId
- relationType
- weight

Relation types:
- RELATED_TO
- REQUIRES
- APPLIES_TO
- DEMONSTRATED_BY
- SCORED_BY
- ROUTES_TO

## Project
- id
- ownerId
- title
- client
- projectType
- primaryObjective
- secondaryObjectives[]
- audience
- platform
- runtimeTarget
- status
- createdAt
- updatedAt

## ProjectStage
- id
- projectId
- stageType
- status
- inputData JSON
- outputData JSON
- acceptedAt

## ProjectDecision
- id
- projectId
- stageId optional
- question
- options JSON
- selectedOption
- reasoning
- tradeoffs
- confidence
- evidence JSON

## Rubric
- id
- slug
- title
- description
- totalWeight

## RubricCriterion
- id
- rubricId
- name
- description
- weight
- anchor1
- anchor5
- anchor10

## Evaluation
- id
- projectId
- rubricId
- reviewerType
- reviewerId optional
- totalScore
- summary
- createdAt

## EvaluationScore
- id
- evaluationId
- criterionId
- score
- justification
- evidence

## DecisionTree
- id
- slug
- title
- entryPrompt
- description

## DecisionNode
- id
- treeId
- nodeKey
- question
- explanation
- nodeType
- action JSON

## DecisionEdge
- id
- treeId
- fromNodeId
- toNodeId
- label
- condition JSON

## AIModule
- id
- slug
- name
- purpose
- inputSchema JSON
- outputSchema JSON
- systemPrompt
- status

## AIRun
- id
- projectId optional
- moduleId
- provider
- model
- promptVersion
- input JSON
- output JSON
- latencyMs
- tokenUsage JSON
- status

## CouncilReview
- id
- projectId
- role
- findings JSON
- recommendation
- confidence

## ProjectLearning
- id
- projectId
- whatWorked
- whatFailed
- surprises
- timeSinks
- repeatNextTime
- avoidNextTime
- reusablePrinciples[]
