"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { getProject } from "@/ui/auth/api-client";
import { AnalyzeForm } from "./analyze-form";
import { BlueprintView } from "./blueprint-view";
import {
  type Analysis,
  type AnalyzeFields,
  type IntentRevision,
  analyzeProject,
  getAnalysis,
  getCreativeIntent,
  getIntentHistory,
} from "./creative-api";
import {
  saveLocationShot,
  getLatestLocationPhotoReconstruction,
  refreshLocationPhotoReconstruction,
  retryLocationPhotoReconstruction,
  startLocationPhotoReconstruction,
  updatePlanning,
  uploadLocationEnvironment,
  uploadScoutPhotos,
} from "./creative-api";
import type { ProductionReality, ProductionStage } from "@/domain/creative";
import type {
  LocationWorkspaceState,
  ShotPlanningState,
  SpatialShotState,
} from "@/domain/creative";
import { proposeRecommendationDecision } from "@/ui/decisions/decisions-api";

type Mode = "loading" | "form" | "processing" | "blueprint";

function editableIntent(fields: AnalyzeFields): AnalyzeFields {
  return {
    title: fields.title,
    client: fields.client,
    projectType: fields.projectType,
    creativeGoal: fields.creativeGoal,
    targetAudience: fields.targetAudience,
    desiredEmotion: fields.desiredEmotion,
    context: fields.context,
    runtimeTarget: fields.runtimeTarget,
    deliveryPlatform: fields.deliveryPlatform,
    references: fields.references,
    restrictions: fields.restrictions,
    clientRequirements: fields.clientRequirements,
    nonNegotiables: fields.nonNegotiables,
    successCriteria: fields.successCriteria,
  };
}

function isStaleDevelopment(startedAt: string | null): boolean {
  if (!startedAt) return true;
  return Date.now() - new Date(startedAt).getTime() > 45 * 60_000;
}

/**
 * The creator can begin with one idea and move through Story, Plan, and Edit.
 * Existing project development loads immediately with an intent-update path.
 */
export function AnalyzeWorkspace({
  projectId,
  focus,
}: {
  projectId: string;
  focus?: "story" | "storyboard";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentHistory, setIntentHistory] = useState<IntentRevision[]>([]);
  const [formInitial, setFormInitial] = useState<AnalyzeFields | undefined>();
  const [projectName, setProjectName] = useState("");
  const [intentSaved, setIntentSaved] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getProject(projectId), getAnalysis(projectId)])
      .then(([project, loaded]) => {
        if (!active) return;
        setProjectName(project.name);
        setAnalysis(loaded);
        setFormInitial(editableIntent(loaded.brief));
        setIntentSaved(true);
        setMode("blueprint");
        void getIntentHistory(projectId)
          .then((history) => {
            if (active) setIntentHistory(history);
          })
          .catch(() => {
            // The saved blueprint remains usable if optional history retrieval is unavailable.
          });
      })
      .catch((err) => {
        if (!active) return;
        if (errorStatus(err) === 401) {
          router.replace("/login");
          return;
        }
        if (errorStatus(err) !== 404) {
          setError(friendlyError(err));
          setMode("form");
          return;
        }
        void Promise.all([getProject(projectId), getCreativeIntent(projectId).catch(() => null)])
          .then(([project, intent]) => {
            if (!active) return;
            setProjectName(project.name);
            if (!intent) {
              setMode("form");
              return;
            }
            setFormInitial(editableIntent(intent));
            setIntentSaved(true);
            if (
              intent.developmentStatus === "PROCESSING" &&
              !isStaleDevelopment(intent.developmentStartedAt)
            ) {
              setBusy(true);
              setMode("processing");
            } else {
              if (
                intent.developmentStatus === "FAILED" ||
                intent.developmentStatus === "PROCESSING"
              ) {
                setError(
                  "Your full brief is saved. The previous plan stopped before finishing; retry without entering anything again.",
                );
              }
              setMode("form");
            }
            void getIntentHistory(projectId)
              .then((history) => active && setIntentHistory(history))
              .catch(() => undefined);
          })
          .catch((loadError) => {
            if (!active) return;
            if (errorStatus(loadError) === 401) router.replace("/login");
            else {
              setError(friendlyError(loadError));
              setMode("form");
            }
          });
      });
    return () => {
      active = false;
    };
  }, [projectId, router]);

  useEffect(() => {
    if (mode !== "processing") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const intent = await getCreativeIntent(projectId);
        if (!active) return;
        setIntentSaved(true);
        setFormInitial(editableIntent(intent));
        if (intent.developmentStatus === "READY") {
          const loaded = await getAnalysis(projectId);
          if (!active) return;
          setAnalysis(loaded);
          setIntentHistory(await getIntentHistory(projectId).catch(() => []));
          setBusy(false);
          setMode("blueprint");
          return;
        }
        if (intent.developmentStatus === "FAILED") {
          setError(
            "Your full brief is saved. Stroman could not finish the plan; retry without entering it again.",
          );
          setBusy(false);
          setMode("form");
          return;
        }
        if (
          intent.developmentStatus === "PROCESSING" &&
          isStaleDevelopment(intent.developmentStartedAt)
        ) {
          setError(
            "Your full brief is saved. The previous plan stopped before finishing; retry without entering anything again.",
          );
          setBusy(false);
          setMode("form");
          return;
        }
      } catch (caught) {
        if (errorStatus(caught) === 401) {
          router.replace("/login");
          return;
        }
        // A transient status read must not interrupt the in-flight plan.
      }
      if (active) timer = setTimeout(poll, 3_000);
    };
    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [mode, projectId, router]);

  async function onAnalyze(fields: AnalyzeFields) {
    setFormInitial(fields);
    setIntentSaved(false);
    setBusy(true);
    setError(null);
    setMode("processing");
    try {
      const result = await analyzeProject(projectId, fields);
      setAnalysis(result);
      setIntentHistory(await getIntentHistory(projectId).catch(() => []));
      setMode("blueprint");
    } catch (err) {
      if (errorStatus(err) === 401) {
        router.replace("/login");
        return;
      }
      setError(friendlyError(err));
      setMode("form");
    } finally {
      setBusy(false);
    }
  }

  async function runPlanning(operation: () => Promise<Analysis>) {
    setBusy(true);
    setError(null);
    try {
      setAnalysis(await operation());
    } catch (caught) {
      if (errorStatus(caught) === 401) {
        router.replace("/login");
        return;
      }
      const validationMessage = caught as { code?: string; message?: string } | null;
      setError(
        validationMessage?.code === "VALIDATION_FAILED" && validationMessage.message
          ? validationMessage.message
          : friendlyError(caught),
      );
    } finally {
      setBusy(false);
    }
  }

  async function promoteDirection() {
    if (!analysis) return;
    setBusy(true);
    setError(null);
    try {
      const recommendation = analysis.blueprint.development.directionDecision;
      const result = await proposeRecommendationDecision({
        projectId,
        question: `Which creative direction should guide “${analysis.brief.title}”?`,
        context: {
          originStage: "DEVELOP",
          artifactKind: "CREATIVE_DIRECTION",
          artifactId: analysis.brief.id,
          artifactVersion: intentHistory.at(-1)?.version ?? 1,
        },
        recommendation: {
          label: recommendation.title,
          rationale: `${recommendation.pointOfView}\n\n${recommendation.whyThisProject}`,
          tradeoff: recommendation.sacrifice,
          uncertainty: `${recommendation.confidenceRationale ?? "Confidence is provisional."} Change course if: ${recommendation.changeMyMindIf}`,
          confidence: recommendation.confidence ?? 0.5,
          evidence: (recommendation.basis ?? []).map((item) => ({
            sourceLabel: item.label.slice(0, 200),
            observation: item.statement.slice(0, 2000),
            relevance:
              `${item.kind === "CREATIVE_HYPOTHESIS" ? "Creative hypothesis" : item.kind === "SOURCE_EVIDENCE" ? "Source evidence" : "Supplied intent"} supporting the proposed direction.`.slice(
                0,
                2000,
              ),
          })),
        },
        alternatives: analysis.blueprint.development.alternativeDecisions.map((direction) => ({
          label: direction.title,
          rationale: `${direction.pointOfView}\n\nTradeoff: ${direction.sacrifice}`,
        })),
      });
      router.push(`/projects/${projectId}/decisions/${result.data.id}`);
    } catch (caught) {
      if (errorStatus(caught) === 401) {
        router.replace("/login");
        return;
      }
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function promoteShot(shot: SpatialShotState) {
    setBusy(true);
    setError(null);
    try {
      const result = await proposeRecommendationDecision({
        projectId,
        question: `Should “${shot.title}” become an approved shooting setup?`,
        context: {
          originStage: "BUILD",
          artifactKind: "SHOT_PLAN",
          artifactId: shot.id,
          artifactVersion: shot.version,
        },
        recommendation: {
          label: shot.title,
          rationale: `${shot.rationale}\n\n${shot.camera.focalLengthMm}mm · ${shot.camera.aspectRatio} · ${shot.camera.support.toLowerCase()}.`,
          tradeoff:
            shot.productionNotes ||
            "Approving this setup commits camera, blocking, light, sound, and movement together.",
          uncertainty:
            shot.geometryConfidence === "FILMMAKER_CONFIRMED"
              ? "Geometry has filmmaker confirmation; production conditions can still require revision."
              : "Room geometry remains estimated and should be confirmed before locking production.",
          confidence: shot.geometryConfidence === "FILMMAKER_CONFIRMED" ? 0.9 : 0.65,
        },
      });
      router.push(`/projects/${projectId}/decisions/${result.data.id}`);
    } catch (caught) {
      if (errorStatus(caught) === 401) {
        router.replace("/login");
        return;
      }
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (mode === "processing") {
    return (
      <section
        className="border-border bg-card rounded-2xl border p-6 shadow-sm"
        aria-live="polite"
      >
        <p className="text-primary text-sm font-semibold">
          {intentSaved ? "Brief saved" : "Saving your brief…"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Building your film plan</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Stroman is developing the story, scene ideas, and shootable frames. You can leave this
          page and come back—your words will stay here and progress will recover automatically.
        </p>
        <div className="bg-muted mt-5 h-2 overflow-hidden rounded-full" aria-hidden="true">
          <div className="bg-primary h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </section>
    );
  }

  if (mode === "blueprint" && analysis) {
    return (
      <div className="flex flex-col gap-6">
        <BlueprintView
          analysis={analysis}
          busy={busy}
          error={error}
          focus={focus}
          onReanalyze={() => setMode("form")}
          onPromoteDirection={promoteDirection}
          onStage={(stage: ProductionStage) =>
            runPlanning(() => updatePlanning(projectId, { stage }))
          }
          onProduction={(production: Partial<ProductionReality>) =>
            runPlanning(() => updatePlanning(projectId, { production }))
          }
          onUploadScoutPhotos={(files) => runPlanning(() => uploadScoutPhotos(projectId, files))}
          onCorrection={(statement, replacesClaimId) =>
            runPlanning(() =>
              updatePlanning(projectId, { correction: { statement, replacesClaimId } }),
            )
          }
          onShotPlanning={(shotPlanning: ShotPlanningState) =>
            runPlanning(() => updatePlanning(projectId, { shotPlanning }))
          }
          onPromoteShot={promoteShot}
          onUploadLocation={(input) =>
            runPlanning(() => uploadLocationEnvironment(projectId, input))
          }
          onGetLocationReconstruction={() => getLatestLocationPhotoReconstruction(projectId)}
          onStartLocationReconstruction={(input) =>
            startLocationPhotoReconstruction(projectId, input)
          }
          onRefreshLocationReconstruction={async (id) => {
            const job = await refreshLocationPhotoReconstruction(projectId, id);
            if (job.status === "SUCCEEDED") setAnalysis(await getAnalysis(projectId));
            return job;
          }}
          onRetryLocationReconstruction={async (id) => {
            const job = await retryLocationPhotoReconstruction(projectId, id);
            return job;
          }}
          onSaveLocation={(input: {
            workspace: LocationWorkspaceState;
            frame: Blob;
            width: number;
            height: number;
            title: string;
            technicalSummary: string;
            shootingInstructions: string;
            includesUnknownSpace: boolean;
          }) => runPlanning(() => saveLocationShot(projectId, input))}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-primary text-sm font-semibold tracking-wide">YOUR FIRST STEP</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          What do you want this film to become?
        </h2>
        <p className="text-muted-foreground text-sm">
          Share the idea in your own words. Next, Stroman will turn it into a film plan you can
          review and shape.
        </p>
      </header>
      <AnalyzeForm
        initial={formInitial}
        defaultTitle={projectName}
        history={intentHistory}
        busy={busy}
        error={error}
        onSubmit={onAnalyze}
      />
    </div>
  );
}
