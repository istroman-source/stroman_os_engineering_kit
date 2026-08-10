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
});
