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
      "The creative thesis",
      "Recommendation",
      "Real alternatives",
      "Scenes worth making",
      "Director notebook",
      "Questions that could change the plan",
      "Next production tests",
    ]) {
      expect(screen.getByRole("heading", { name: new RegExp(title, "i") })).toBeInTheDocument();
    }
  });

  it("distinguishes hypotheses from evidence and renders the visual artifact", () => {
    render(<BlueprintView analysis={creativeAnalysisFixture()} onReanalyze={vi.fn()} />);
    expect(screen.getByText(/creative hypothesis, not source evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/drawn visual blueprint/i)).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/purposeful rule-break/i)).toBeInTheDocument();
    expect(screen.queryByText(/production prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/untrusted creative context/i)).not.toBeInTheDocument();
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
