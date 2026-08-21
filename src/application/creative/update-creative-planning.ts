import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  attachCreativePlanningContext,
  CreativeQualityError,
  evaluateVisualPlanQuality,
  refreshBlueprintVisualPlan,
  type CreativeBrief,
  type CreativeBriefRepository,
  type ProductionReality,
  type ProductionStage,
  type ScoutPhotoRef,
  type ShotPlanningState,
  type LocationWorkspaceState,
  withPlanningSettings,
  withScoutPhotos,
  withSpatialCorrection,
  withShotPlanning,
  withLocationWorkspace,
} from "@/domain/creative";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { InvalidValueError, type DomainError } from "@/domain/shared";
import { attempt, attemptUpdate } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { IdGenerator } from "../shared";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type AnalysisView, toCreativeBriefView } from "./creative-view";

export interface UpdateCreativePlanningDeps {
  readonly projects: ProjectRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly ids: IdGenerator;
}

export interface UpdateCreativePlanningInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  readonly stage?: ProductionStage;
  readonly production?: Partial<ProductionReality>;
  readonly correction?: {
    readonly statement: string;
    readonly replacesClaimId?: string | null;
  };
  readonly scoutPhotos?: readonly ScoutPhotoRef[];
  readonly shotPlanning?: ShotPlanningState;
  readonly locationWorkspace?: LocationWorkspaceState;
}

export type UpdateCreativePlanningResult = Result<
  AnalysisView,
  DomainError | NotFoundError | NotAuthorizedError | OptimisticConcurrencyError | RepositoryError
>;

export async function updateCreativePlanning(
  deps: UpdateCreativePlanningDeps,
  input: UpdateCreativePlanningInput,
): Promise<UpdateCreativePlanningResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  if (!projectLoad.value) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, projectLoad.value.ownerId, "project.plan");
  if (!authorized.ok) return authorized;

  const briefLoad = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!briefLoad.ok) return briefLoad;
  if (!briefLoad.value) return err(new NotFoundError("CreativeBrief", input.projectId));
  const existingBlueprint = briefLoad.value.blueprint;
  if (!existingBlueprint) return err(new NotFoundError("CreativeBlueprint", input.projectId));

  const original = briefLoad.value;
  let planning = original.planningContext;
  if (input.stage || input.production) {
    planning = withPlanningSettings(
      planning,
      input.stage ?? planning.stage,
      input.production ?? {},
    );
  }
  if (input.scoutPhotos?.length) planning = withScoutPhotos(planning, input.scoutPhotos);
  if (input.shotPlanning) planning = withShotPlanning(planning, input.shotPlanning);
  if (input.locationWorkspace) planning = withLocationWorkspace(planning, input.locationWorkspace);
  if (input.correction) {
    const statement = input.correction.statement.trim();
    if (!statement) {
      return err(new InvalidValueError("A spatial correction must describe what is true."));
    }
    planning = withSpatialCorrection(planning, {
      id: deps.ids.generate("corr"),
      statement,
      replacesClaimId: input.correction.replacesClaimId ?? null,
    });
  }
  const blueprint = refreshBlueprintVisualPlan(original, existingBlueprint, planning);
  const visualQuality = evaluateVisualPlanQuality(blueprint.development.visualPlan);
  if (!visualQuality.passed) {
    return err(
      new CreativeQualityError(
        "The planning update failed the visual-planning quality gate.",
        visualQuality.findings,
      ),
    );
  }
  let brief: CreativeBrief = attachCreativePlanningContext(original, planning, blueprint);
  const saved = await attemptUpdate("creativeBrief.updatePlanning", () =>
    deps.creativeBriefs.update(brief),
  );
  if (!saved.ok) return saved;
  brief = { ...brief, lockVersion: brief.lockVersion + 1 };
  return ok({ brief: toCreativeBriefView(brief), blueprint });
}
