import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResolutionForm } from "./resolution-form";

describe("ResolutionForm", () => {
  it("forwards optional confidence and evidence for Insight materialization", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResolutionForm kind="INSIGHT" onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Memory IDs (comma separated)"), "mem_12345678");
    await user.type(screen.getByLabelText("Confidence (optional)"), "0.85");
    await user.type(screen.getByLabelText("Evidence (optional)"), "Confirmed in interview");
    await user.click(screen.getByRole("button", { name: "Materialize insight" }));
    expect(onSubmit).toHaveBeenCalledWith({
      kind: "INSIGHT",
      memoryIds: ["mem_12345678"],
      confidence: 0.85,
      evidence: "Confirmed in interview",
    });
  });
});
