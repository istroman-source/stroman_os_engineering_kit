import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnalyzeForm } from "./analyze-form";

describe("AnalyzeForm", () => {
  it("keeps submit disabled until every field is filled, then submits the fields", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalyzeForm busy={false} error={null} onSubmit={onSubmit} />);

    const submit = screen.getByRole("button", { name: /build story plan/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("Video concept"), "Signature Dish Reel");
    await user.type(screen.getByLabelText("Client"), "Jimmy's");
    await user.type(screen.getByLabelText("Project type"), "Instagram reel");
    await user.type(screen.getByLabelText("Creative intent"), "crave the crab cake");
    await user.type(screen.getByLabelText("Target audience"), "Baltimore foodies");
    await user.type(screen.getByLabelText("Desired emotion"), "hungry");
    await user.type(screen.getByLabelText("Source material and constraints"), "20s vertical");

    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Signature Dish Reel",
      client: "Jimmy's",
      projectType: "Instagram reel",
      creativeGoal: "crave the crab cake",
      targetAudience: "Baltimore foodies",
      desiredEmotion: "hungry",
      context: "20s vertical",
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
  });
});
