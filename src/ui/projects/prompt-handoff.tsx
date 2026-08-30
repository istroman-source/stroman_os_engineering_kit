"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";

interface PromptHandoffResult {
  format: "PLAIN_TEXT";
  analysisVersion: number;
  prompt: string;
  evidenceReferenceIds: string[];
  wideframe: {
    capability: "MANUAL_COPY_ONLY";
    label: string;
    instructions: string;
  };
}

export function PromptHandoff({ projectId }: { projectId: string }) {
  const [result, setResult] = useState<PromptHandoffResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/prompt-handoff`, {
      credentials: "same-origin",
    });
    if (response.status === 404) return;
    if (response.ok) setResult((await response.json()) as PromptHandoffResult);
  }, [projectId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const refresh = () => void load();
    window.addEventListener("stroman:analysis-completed", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("stroman:analysis-completed", refresh);
    };
  }, [load]);

  if (!result) return null;

  async function copyPrompt() {
    await navigator.clipboard.writeText(result!.prompt);
    setNotice("Prompt copied.");
  }

  function downloadPrompt() {
    const url = URL.createObjectURL(new Blob([result!.prompt], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `stroman-edit-prompt-v${result!.analysisVersion}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Prompt downloaded.");
  }

  return (
    <section className="border-border bg-card mb-8 rounded-lg border p-5" aria-labelledby="handoff">
      <h2 id="handoff" className="text-lg font-semibold">
        Take your plan to another tool
      </h2>
      <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
        Review, copy, or download a source-grounded editing brief when you are ready to continue in
        another tool.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Hide export details" : "Review export details"}
        </Button>
        {expanded ? (
          <>
            <Button type="button" onClick={() => void copyPrompt()}>
              Copy handoff
            </Button>
            <Button type="button" variant="secondary" onClick={downloadPrompt}>
              Download .txt
            </Button>
          </>
        ) : null}
      </div>
      {expanded ? (
        <>
          <pre className="border-border bg-background mt-4 max-h-64 overflow-auto rounded border p-3 text-xs whitespace-pre-wrap">
            {result.prompt}
          </pre>
          <div className="border-border mt-4 rounded border p-3">
            <p className="text-sm font-medium">{result.wideframe.label}</p>
            <p className="text-muted-foreground mt-1 text-sm">{result.wideframe.instructions}</p>
          </div>
        </>
      ) : null}
      {notice ? (
        <p className="text-muted-foreground mt-3 text-sm" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
