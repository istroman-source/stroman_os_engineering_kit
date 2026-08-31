import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  type CreativeBrief,
  CreativeBriefId,
  type CreativeBriefInputFields,
  type CreativeBriefRepository,
  attachCreativeBlueprint,
  createCreativeBrief,
  reviseCreativeBrief,
} from "@/domain/creative";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import type { DecisionRepository } from "@/domain/decision";
import { attempt, attemptUpdate } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock, IdGenerator } from "../shared";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type AnalysisView, toCreativeBriefView } from "./creative-view";
import {
  developCreativeBlueprint,
  type DevelopCreativeBlueprintDeps,
} from "./develop-creative-blueprint";

export interface SaveCreativeBriefDeps extends DevelopCreativeBlueprintDeps {
  readonly projects: ProjectRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly decisions: DecisionRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface SaveCreativeBriefInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  readonly fields: CreativeBriefInputFields;
}

export type SaveCreativeBriefResult = Result<
  AnalysisView,
  DomainError | NotFoundError | NotAuthorizedError | OptimisticConcurrencyError | RepositoryError
>;

/**
 * Analyze a project: capture (or re-capture) its creative brief and produce a
 * blueprint. Ownership is enforced via the parent project. Insert on first
 * analysis, compare-and-swap update on re-analysis.
 */
export async function saveCreativeBrief(
  deps: SaveCreativeBriefDeps,
  input: SaveCreativeBriefInput,
): Promise<SaveCreativeBriefResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "project.analyze");
  if (!authorized.ok) return authorized;

  const existingLoad = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!existingLoad.ok) return existingLoad;
  const now = deps.clock.now();

  let brief: CreativeBrief;
  const creating = existingLoad.value === null;
  if (existingLoad.value === null) {
    const created = createCreativeBrief({
      id: CreativeBriefId.unsafe(deps.ids.generate(CreativeBriefId.prefix)),
      projectId: input.projectId,
      now,
      ...input.fields,
    });
    if (!created.ok) return created;
    brief = created.value;
  } else {
    const revised = reviseCreativeBrief(existingLoad.value, input.fields, now);
    if (!revised.ok) return revised;
    brief = revised.value;
  }

  const developed = await developCreativeBlueprint(deps, brief);
  if (!developed.ok) return developed;
  brief = attachCreativeBlueprint(brief, developed.value, deps.creativeReasoning.id);

  if (creating) {
    const inserted = await attempt("creativeBrief.insert", () => deps.creativeBriefs.insert(brief));
    if (!inserted.ok) return inserted;
  } else {
    const saved = await attemptUpdate("creativeBrief.update", () =>
      deps.creativeBriefs.update(brief),
    );
    if (!saved.ok) return saved;
    brief = { ...brief, lockVersion: brief.lockVersion + 1 };
    const marked = await attempt("decision.markForReview", () =>
      deps.decisions.markForReview(
        input.projectId,
        ["DEVELOP", "BUILD", "EDIT"],
        "Project intent changed after this decision was recorded.",
      ),
    );
    if (!marked.ok) return marked;
  }

  return ok({ brief: toCreativeBriefView(brief), blueprint: developed.value });
}
