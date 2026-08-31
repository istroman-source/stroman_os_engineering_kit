import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnalyzeForm } from "./analyze-form";

describe("AnalyzeForm", () => {
  it("requires only the idea and preserves optional fields as explicit unknowns", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalyzeForm busy={false} error={null} onSubmit={onSubmit} />);

    const submit = screen.getByRole("button", { name: /make my plan/i });
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByLabelText("What are you making?"),
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
      runtimeTarget: "",
      deliveryPlatform: "",
      references: "",
      restrictions: "",
      clientRequirements: "",
      nonNegotiables: "",
      successCriteria: "",
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
          runtimeTarget: "30 seconds",
          deliveryPlatform: "YouTube",
          references: "observational food films",
          restrictions: "no customer faces",
          clientRequirements: "show the finished dish",
          nonNegotiables: "real kitchen",
          successCriteria: "viewers understand the process",
        }}
      />,
    );
    expect(screen.getByLabelText("What are you making?")).toHaveValue("Existing");
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
      runtimeTarget: "30 seconds",
      deliveryPlatform: "YouTube",
      references: "observational food films",
      restrictions: "no customer faces",
      clientRequirements: "show the finished dish",
      nonNegotiables: "real kitchen",
      successCriteria: "viewers understand the process",
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
    await user.click(screen.getByRole("button", { name: /make my plan/i }));

    expect(onSubmit).toHaveBeenCalledWith(editable);
    expect(Object.keys(onSubmit.mock.calls[0]![0])).toEqual(Object.keys(editable));
  });

  it("shows saved intent versions without exposing system metadata", async () => {
    const user = userEvent.setup();
    render(
      <AnalyzeForm
        busy={false}
        error={null}
        onSubmit={vi.fn()}
        history={[
          {
            title: "First direction",
            client: "",
            projectType: "documentary",
            creativeGoal: "Reveal the cost of the handoff",
            targetAudience: "working families",
            desiredEmotion: "earned respect",
            context: "one overnight shift",
            runtimeTarget: "8 minutes",
            deliveryPlatform: "festival and web",
            references: "",
            restrictions: "",
            clientRequirements: "",
            nonNegotiables: "No staged danger",
            successCriteria: "Workers recognize the film as honest",
            version: 1,
            createdAt: "2026-08-30T12:00:00.000Z",
          },
        ]}
      />,
    );

    await user.click(screen.getByText(/intent history/i));
    expect(screen.getByText("Version 1")).toBeInTheDocument();
    expect(screen.getByText(/Reveal the cost of the handoff/i)).toBeInTheDocument();
    expect(screen.getByText(/No staged danger/i)).toBeInTheDocument();
    expect(screen.queryByText(/provider|lockVersion|system prompt/i)).not.toBeInTheDocument();
  });
});
