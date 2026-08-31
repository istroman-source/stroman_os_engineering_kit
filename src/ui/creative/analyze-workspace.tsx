"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { AnalyzeForm } from "./analyze-form";
import { BlueprintView } from "./blueprint-view";
import {
  type Analysis,
  type AnalyzeFields,
  type IntentRevision,
  analyzeProject,
  getAnalysis,
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

type Mode = "loading" | "form" | "blueprint";

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

  useEffect(() => {
    let active = true;
    getAnalysis(projectId)
      .then((loaded) => {
        if (!active) return;
        setAnalysis(loaded);
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
        // 404 = not analyzed yet → show the form. Anything else → show the form too,
        // but surface the message.
        if (errorStatus(err) !== 404) setError(friendlyError(err));
        setMode("form");
      });
    return () => {
      active = false;
    };
  }, [projectId, router]);

  async function onAnalyze(fields: AnalyzeFields) {
    setBusy(true);
    setError(null);
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
        <h2 className="text-2xl font-semibold tracking-tight">What are you making?</h2>
        <p className="text-muted-foreground text-sm">
          Start with the idea. Stroman will help you shape a story, choose what matters, and make a
          plan you can actually shoot.
        </p>
      </header>
      <AnalyzeForm
        initial={analysis?.brief}
        history={intentHistory}
        busy={busy}
        error={error}
        onSubmit={onAnalyze}
      />
    </div>
  );
}
