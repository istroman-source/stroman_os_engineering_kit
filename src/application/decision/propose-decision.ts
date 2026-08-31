import { err, ok, type Result } from "@/lib/result";
import {
  type Advisory,
  createDecision as createDecisionAggregate,
  type DecisionContextInput,
  DecisionId,
  type DecisionOptionInput,
  type DecisionRepository,
} from "@/domain/decision";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { EvidenceReferenceRepository } from "@/domain/evidence";
import { type DomainError, makeConfidence } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock } from "../shared/clock";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";
import { type AdvisoryEvidenceInput, type DecisionView, toDecisionView } from "./decision-view";

export interface ProposeDecisionDeps {
  readonly projects: ProjectRepository;
  readonly decisions: DecisionRepository;
  readonly evidenceReferences: EvidenceReferenceRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface AdvisoryInput {
  readonly recommendedOptionId?: string | null;
  readonly rationale: string;
  readonly tradeoff?: string | null;
  readonly uncertainty?: string | null;
  readonly confidence: number;
  readonly evidence?: readonly AdvisoryEvidenceInput[];
}

export interface ProposeDecisionInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  readonly question: string;
  readonly options: readonly DecisionOptionInput[];
  readonly advisory?: AdvisoryInput;
  readonly context?: DecisionContextInput;
}

export type ProposeDecisionResult = Result<
  DecisionView,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function proposeDecision(
  deps: ProposeDecisionDeps,
  input: ProposeDecisionInput,
): Promise<ProposeDecisionResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "decision.propose");
  if (!authorized.ok) return authorized;

  for (const entry of input.advisory?.evidence ?? []) {
    if (!entry.evidenceReferenceId) continue;
    const evidenceLoad = await attempt("evidenceReference.findById", () =>
      deps.evidenceReferences.findById(entry.evidenceReferenceId!),
    );
    if (!evidenceLoad.ok) return evidenceLoad;
    if (
      !evidenceLoad.value ||
      evidenceLoad.value.ownerId !== input.actorId ||
      evidenceLoad.value.projectId !== input.projectId
    ) {
      return err(new NotFoundError("EvidenceReference", entry.evidenceReferenceId));
    }
  }

  let advisory: Advisory | null = null;
  if (input.advisory) {
    const confidence = makeConfidence(input.advisory.confidence);
    if (!confidence.ok) return confidence;
    advisory = {
      recommendedOptionId: input.advisory.recommendedOptionId ?? null,
      rationale: input.advisory.rationale,
      tradeoff: input.advisory.tradeoff ?? null,
      uncertainty: input.advisory.uncertainty ?? null,
      confidence: confidence.value,
      evidence: (input.advisory.evidence ?? []).map((entry) => ({
        evidenceReferenceId: entry.evidenceReferenceId ?? null,
        sourceLabel: entry.sourceLabel,
        observation: entry.observation,
        relevance: entry.relevance,
      })),
    };
  }

  const decision = createDecisionAggregate({
    id: DecisionId.unsafe(deps.ids.generate(DecisionId.prefix)),
    projectId: input.projectId,
    question: input.question,
    options: input.options,
    advisory,
    context: input.context,
    now: deps.clock.now(),
  });
  if (!decision.ok) return decision;

  const saved = await attempt("decision.insert", () => deps.decisions.insert(decision.value));
  if (!saved.ok) return saved;
  return ok(toDecisionView(decision.value));
}
