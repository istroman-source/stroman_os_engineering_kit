import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BlueprintView } from "./blueprint-view";
import { creativeAnalysisFixture } from "./creative-test-fixtures";

describe("BlueprintView", () => {
  it("renders the concept-first story workspace and the project title", () => {
    render(<BlueprintView analysis={creativeAnalysisFixture()} onReanalyze={vi.fn()} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Signature Dish Reel" }),
    ).toBeInTheDocument();
    for (const title of [
      "Creative read",
      "Distinct directions worth testing",
      "Questions that change the plan",
      "Sequence sketch",
      "Production next steps",
      "Production prompt",
    ]) {
      expect(screen.getByRole("heading", { name: new RegExp(title, "i") })).toBeInTheDocument();
    }
  });

  it("distinguishes hypotheses from evidence and reports the missing visual renderer", () => {
    render(<BlueprintView analysis={creativeAnalysisFixture()} onReanalyze={vi.fn()} />);
    expect(screen.getByText(/creative hypothesis, not source evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/no visual storyboard provider is configured/i)).toBeInTheDocument();
    expect(screen.getByText(/purposeful rule-break/i)).toBeInTheDocument();
  });

  it("shows interview steps when applicable", () => {
    render(
      <BlueprintView
        analysis={creativeAnalysisFixture(["Pre-interview first"])}
        onReanalyze={vi.fn()}
      />,
    );
    expect(screen.getByText("Pre-interview first")).toBeInTheDocument();
  });

  it("invokes onReanalyze", async () => {
    const onReanalyze = vi.fn();
    const user = userEvent.setup();
    render(<BlueprintView analysis={creativeAnalysisFixture()} onReanalyze={onReanalyze} />);
    await user.click(screen.getByRole("button", { name: /update intent/i }));
    expect(onReanalyze).toHaveBeenCalled();
  });
});
