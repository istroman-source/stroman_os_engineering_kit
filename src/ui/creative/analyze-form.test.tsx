import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnalyzeForm } from "./analyze-form";

describe("AnalyzeForm", () => {
  it("requires only the idea and preserves optional fields as explicit unknowns", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalyzeForm busy={false} error={null} onSubmit={onSubmit} />);

    const submit = screen.getByRole("button", { name: /develop creative direction/i });
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByLabelText("Video concept"),
      "A baker teaches his daughter the family recipe before selling the bakery",
    );

    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith({
      title: "A baker teaches his daughter the family recipe before selling the bakery",
      client: "",
      projectType: "",
      creativeGoal: "",
      targetAudience: "",
      desiredEmotion: "",
      context: "",
    });
  });

  it("prefills from an existing brief", () => {
    render(
      <AnalyzeForm
        busy={false}
        error={null}
        onSubmit={vi.fn()}
        initial={{
          title: "Existing",
          client: "C",
          projectType: "reel",
          creativeGoal: "g",
          targetAudience: "a",
          desiredEmotion: "e",
          context: "ctx",
        }}
      />,
    );
    expect(screen.getByLabelText("Video concept")).toHaveValue("Existing");
    expect(screen.getByLabelText("Client or owner")).toHaveValue("C");
  });

  it("submits only editable fields when a saved brief includes response metadata", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const editable = {
      title: "Existing",
      client: "C",
      projectType: "commercial",
      creativeGoal: "g",
      targetAudience: "a",
      desiredEmotion: "e",
      context: "ctx",
    };
    const savedBrief = {
      ...editable,
      id: "brief_1",
      projectId: "proj_1",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z",
      planningContext: { stage: "IDEA" },
    };

    render(<AnalyzeForm busy={false} error={null} onSubmit={onSubmit} initial={savedBrief} />);
    await user.click(screen.getByRole("button", { name: /develop creative direction/i }));

    expect(onSubmit).toHaveBeenCalledWith(editable);
    expect(Object.keys(onSubmit.mock.calls[0]![0])).toEqual(Object.keys(editable));
  });
});
