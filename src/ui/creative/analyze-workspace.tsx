"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { AnalyzeForm } from "./analyze-form";
import { BlueprintView } from "./blueprint-view";
import { type Analysis, type AnalyzeFields, analyzeProject, getAnalysis } from "./creative-api";
import { updatePlanning, uploadScoutPhotos } from "./creative-api";
import type { ProductionReality, ProductionStage } from "@/domain/creative";

type Mode = "loading" | "form" | "blueprint";

/**
 * The creator can begin with one idea and Stroman OS returns a Creative Blueprint.
 * If the project was already developed, the blueprint loads immediately
 * (with a Re-analyze path back to the form, prefilled).
 */
export function AnalyzeWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAnalysis(projectId)
      .then((loaded) => {
        if (!active) return;
        setAnalysis(loaded);
        setMode("blueprint");
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
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  const nav = (
    <nav className="text-muted-foreground flex gap-4 text-xs" aria-label="Story workspace">
      <Link className="underline-offset-4 hover:underline" href="/projects">
        ← Story Studio
      </Link>
    </nav>
  );

  if (mode === "blueprint" && analysis) {
    return (
      <div className="flex flex-col gap-6">
        {nav}
        <BlueprintView
          analysis={analysis}
          busy={busy}
          error={error}
          onReanalyze={() => setMode("form")}
          onStage={(stage: ProductionStage) =>
            runPlanning(() => updatePlanning(projectId, { stage }))
          }
          onProduction={(production: Partial<ProductionReality>) =>
            runPlanning(() => updatePlanning(projectId, { production }))
          }
          onUploadScoutPhotos={(files) => runPlanning(() => uploadScoutPhotos(projectId, files))}
          onCorrection={(statement) =>
            runPlanning(() => updatePlanning(projectId, { correction: { statement } }))
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {nav}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Develop the idea</h1>
        <p className="text-muted-foreground text-sm">
          Begin with a concept. Stroman will recommend a direction, challenge it, search distinct
          alternatives, expose the decisions that matter, and sketch a shootable director blueprint.
          It will not pretend proposed material already exists.
        </p>
      </header>
      <AnalyzeForm initial={analysis?.brief} busy={busy} error={error} onSubmit={onAnalyze} />
    </div>
  );
}
