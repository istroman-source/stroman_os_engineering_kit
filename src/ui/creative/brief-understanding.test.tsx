import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AnalyzeFields } from "./creative-api";
import { BriefUnderstandingView, understandBrief } from "./brief-understanding";

const empty = (overrides: Partial<AnalyzeFields>): AnalyzeFields => ({
  title: "Test film",
  client: "",
  projectType: "",
  creativeGoal: "",
  targetAudience: "",
  desiredEmotion: "",
  context: "",
  runtimeTarget: "",
  deliveryPlatform: "",
  references: "",
  restrictions: "",
  clientRequirements: "",
  nonNegotiables: "",
  successCriteria: "",
  ...overrides,
});

const ticketToTable = empty({
  title: "Ticket to Table",
  context:
    "Ticket to table is a series where a chef quickly runs through the process describing a dishes conception from the ticket to the table (but coverage stops at the expo station) Food comes up fresh and a bell is rung at the end. this is a social media post to push brand identity and engage instagram, X and tiktok users",
});

describe("understandBrief", () => {
  it("faithfully reflects Ticket to Table without creative inventions", () => {
    const result = understandBrief(ticketToTable);
    const output = [...result.understood, ...result.decided, ...result.needsInput].join(" ");
    expect(output).toMatch(/repeatable series/i);
    expect(output).toMatch(/ticket.*expo/i);
    expect(output).toMatch(/bell/i);
    expect(output).toMatch(/Instagram, X, and TikTok/i);
    expect(output).not.toMatch(
      /starting gun|ritual|pressure|adrenaline|camera|lighting|blocking|sound design|confidence|dish name/i,
    );
  });

  it("preserves detailed facts instead of asking for them again", () => {
    const result = understandBrief(
      empty({
        context:
          "Two bakers work in the actual night kitchen and the film ends when they lock the door.",
        projectType: "Documentary short",
        runtimeTarget: "4 minutes",
        deliveryPlatform: "YouTube",
        targetAudience: "Home bakers",
        restrictions: "Use only the real kitchen",
      }),
    );
    expect(result.decided.join(" ")).toMatch(/Documentary short/i);
    expect(result.decided.join(" ")).toMatch(/4 minutes/i);
    expect(result.decided.join(" ")).toMatch(/YouTube/i);
    expect(result.decided.join(" ")).toMatch(/real kitchen/i);
    expect(result.needsInput.join(" ")).not.toMatch(/long|runtime|location|audience/i);
  });

  it("asks only material questions for a vague brief and allows none for a complete one", () => {
    expect(
      understandBrief(empty({ context: "A portrait of my neighborhood." })).needsInput,
    ).toEqual(["How long should each finished piece be?"]);
    expect(
      understandBrief(
        empty({ context: "A complete 45 second portrait.", runtimeTarget: "45 seconds" }),
      ).needsInput,
    ).toEqual([]);
  });

  it("renders three scannable sections with approval and edit actions", () => {
    render(
      <BriefUnderstandingView
        title="Ticket to Table"
        fields={ticketToTable}
        busy={false}
        onContinue={() => {}}
        onEdit={() => {}}
      />,
    );
    expect(screen.getByRole("heading", { name: /what i understood/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what you already decided/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /what still needs your input/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /looks right/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit brief/i })).toBeInTheDocument();
    expect(screen.queryByText(/working confidence/i)).not.toBeInTheDocument();
  });
});
