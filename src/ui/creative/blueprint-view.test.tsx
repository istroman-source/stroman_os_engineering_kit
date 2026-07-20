import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BlueprintView } from "./blueprint-view";
import type { Analysis } from "./creative-api";

function analysis(interviewStrategy: string[] | null): Analysis {
  return {
    brief: {
      id: "brief_1",
      projectId: "proj_1",
      title: "Signature Dish Reel",
      client: "Jimmy's",
      projectType: "Instagram reel",
      creativeGoal: "crave the crab cake",
      targetAudience: "Baltimore foodies",
      desiredEmotion: "hungry",
      context: "20s vertical",
      createdAt: "",
      updatedAt: "",
    },
    blueprint: {
      projectSummary: "Summary text",
      storyObjective: "Objective text",
      audienceAnalysis: "Audience text",
      emotionalArc: ["Setup", "Tension", "Payoff"],
      recommendedStructure: "Hook-led",
      hookConcepts: [
        { title: "Result-first hook", description: "d1" },
        { title: "Tension hook", description: "d2" },
        { title: "Emotion-first hook", description: "d3" },
      ],
      editingBlueprint: ["Cut fast"],
      interviewStrategy,
      brollPriorities: ["Signature visuals"],
      risks: ["Weak open"],
      masterPrompt: "You are a senior creative director…",
    },
  };
}

describe("BlueprintView", () => {
  it("renders all eleven sections and the project title", () => {
    render(<BlueprintView analysis={analysis(null)} onReanalyze={vi.fn()} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Signature Dish Reel" }),
    ).toBeInTheDocument();
    for (const title of [
      "Project Summary",
      "Story Objective",
      "Audience Analysis",
      "Emotional Arc",
      "Recommended Story Structure",
      "Three Hook Concepts",
      "Editing Blueprint",
      "Interview Strategy",
      "B-roll Priorities",
      "Risks",
      "Master Prompt",
    ]) {
      expect(screen.getByRole("heading", { name: new RegExp(title, "i") })).toBeInTheDocument();
    }
  });

  it("shows 'Not applicable' when interviews don't apply", () => {
    render(<BlueprintView analysis={analysis(null)} onReanalyze={vi.fn()} />);
    expect(screen.getByText(/not applicable for this format/i)).toBeInTheDocument();
  });

  it("shows interview steps when applicable", () => {
    render(<BlueprintView analysis={analysis(["Pre-interview first"])} onReanalyze={vi.fn()} />);
    expect(screen.getByText("Pre-interview first")).toBeInTheDocument();
  });

  it("invokes onReanalyze", async () => {
    const onReanalyze = vi.fn();
    const user = userEvent.setup();
    render(<BlueprintView analysis={analysis(null)} onReanalyze={onReanalyze} />);
    await user.click(screen.getByRole("button", { name: /re-analyze/i }));
    expect(onReanalyze).toHaveBeenCalled();
  });
});
