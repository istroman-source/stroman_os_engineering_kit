import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BlueprintView } from "./blueprint-view";
import { creativeAnalysisFixture } from "./creative-test-fixtures";

function props(overrides: Record<string, unknown> = {}) {
  return {
    analysis: creativeAnalysisFixture(),
    busy: false,
    error: null,
    onReanalyze: vi.fn(),
    onStage: vi.fn().mockResolvedValue(undefined),
    onProduction: vi.fn().mockResolvedValue(undefined),
    onUploadScoutPhotos: vi.fn().mockResolvedValue(undefined),
    onCorrection: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("BlueprintView", () => {
  it("defaults to a concise creative spine and one obvious next decision", () => {
    render(<BlueprintView {...props()} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/film stroman believes/i)).toBeInTheDocument();
    expect(screen.getByText(/next important decision/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/horizontal and vertical are separate setups/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/discarded directions and tradeoffs/i)).not.toBeInTheDocument();
  });

  it("reveals independently composed 16:9 and 9:16 previs only in Blueprint depth", async () => {
    const user = userEvent.setup();
    render(<BlueprintView {...props()} />);
    await user.click(screen.getByRole("button", { name: /blueprinthow to execute/i }));
    expect(screen.getByText(/horizontal and vertical are separate setups/i)).toBeInTheDocument();
    expect(screen.getAllByText("16:9")).toHaveLength(4);
    expect(screen.getAllByText("9:16")).toHaveLength(4);
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(8);
    expect(screen.getAllByText("Frame map")).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Blocking" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lighting" })).toBeInTheDocument();
  });

  it("keeps blocking and lighting in separate single-question diagrams", async () => {
    const user = userEvent.setup();
    render(<BlueprintView {...props()} />);
    await user.click(screen.getByRole("button", { name: /blueprinthow to execute/i }));
    await user.click(screen.getByRole("button", { name: "Blocking" }));
    expect(screen.getByText(/where are the people and cameras/i)).toBeInTheDocument();
    expect(screen.queryByText(/where are the meaningful sources/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Lighting" }));
    expect(screen.getByText(/where are the meaningful sources/i)).toBeInTheDocument();
    expect(screen.queryByText(/where are the people and cameras/i)).not.toBeInTheDocument();
    const diagram = screen.getByRole("img", { name: /motivated source hypothesis/i });
    const labels = [...diagram.querySelectorAll("text")];
    const zoneLabel = labels.find((label) => label.textContent === "SINK + WINDOW")!;
    const sourceLabel = labels.find((label) => label.textContent === "L1")!;
    expect(
      Number(zoneLabel.getAttribute("y")) - Number(sourceLabel.getAttribute("y")),
    ).toBeGreaterThan(4);
    expect(screen.getByText(/window — cool ambience/i)).toBeInTheDocument();
  });

  it("keys clustered lighting sources to a readable execution legend", async () => {
    const base = creativeAnalysisFixture();
    const visualPlan = base.blueprint.development.visualPlan;
    const firstSource = visualPlan.lighting.sources[0]!;
    const analysis = {
      ...base,
      blueprint: {
        ...base.blueprint,
        development: {
          ...base.blueprint.development,
          visualPlan: {
            ...visualPlan,
            lighting: {
              ...visualPlan.lighting,
              sources: [
                { ...firstSource, id: "bedroom_window", label: "BEDROOM WINDOW KEY", x: 80, y: 20 },
                { ...firstSource, id: "kitchen_window", label: "KITCHEN WINDOW KEY", x: 82, y: 21 },
              ],
            },
          },
        },
      },
    };
    const user = userEvent.setup();
    render(<BlueprintView {...props({ analysis })} />);
    await user.click(screen.getByRole("button", { name: /blueprinthow to execute/i }));
    await user.click(screen.getByRole("button", { name: "Lighting" }));

    const diagram = screen.getByRole("img", { name: /where are the meaningful sources/i });
    const inDiagram = [...diagram.querySelectorAll("text")].map((label) => label.textContent);
    expect(inDiagram).toContain("L1");
    expect(inDiagram).toContain("L2");
    expect(inDiagram).not.toContain("BEDROOM WINDOW KEY");
    expect(inDiagram).not.toContain("KITCHEN WINDOW KEY");
    expect(screen.getByText(/bedroom window key/i)).toBeInTheDocument();
    expect(screen.getByText(/kitchen window key/i)).toBeInTheDocument();
  });

  it("keeps alternatives and craft reasoning in the optional Deep room", async () => {
    const user = userEvent.setup();
    render(<BlueprintView {...props()} />);
    await user.click(screen.getByRole("button", { name: /deep roomreasoning/i }));
    expect(screen.getByText(/discarded directions and tradeoffs/i)).toBeInTheDocument();
    expect(screen.getByText(/detailed scene and craft reasoning/i)).toBeInTheDocument();
  });

  it("changes stage and invokes intent editing", async () => {
    const onStage = vi.fn().mockResolvedValue(undefined);
    const onReanalyze = vi.fn();
    const user = userEvent.setup();
    render(<BlueprintView {...props({ onStage, onReanalyze })} />);
    await user.click(screen.getByRole("button", { name: "Scouting" }));
    expect(onStage).toHaveBeenCalledWith("SCOUTING");
    await user.click(screen.getByRole("button", { name: /update intent/i }));
    expect(onReanalyze).toHaveBeenCalled();
  });

  it("lets a filmmaker replace the inferred claim or explicitly add a confirmed fact", async () => {
    const base = creativeAnalysisFixture();
    const visualPlan = base.blueprint.development.visualPlan;
    const analysis = {
      ...base,
      blueprint: {
        ...base.blueprint,
        development: {
          ...base.blueprint.development,
          visualPlan: {
            ...visualPlan,
            stage: "PRE_PRODUCTION" as const,
            location: {
              ...visualPlan.location,
              mode: "PHOTO_ANCHORED" as const,
              claims: [
                {
                  id: "inferred_camera_lane",
                  state: "INFERRED_GEOMETRY" as const,
                  label: "Reverse camera lane",
                  detail: "The lane may exist, pending operating-clearance confirmation.",
                  evidencePhotoIds: ["scout_reverse"],
                  affects: ["STORYBOARD", "BLOCKING"] as const,
                },
              ],
              confirmationQuestion: "Can the camera operate behind the island?",
            },
          },
        },
      },
    };
    const onCorrection = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<BlueprintView {...props({ analysis, onCorrection })} />);
    expect(screen.getByRole("combobox", { name: /this correction replaces/i })).toHaveValue(
      "inferred_camera_lane",
    );
    await user.type(
      screen.getByPlaceholderText(/quick correction/i),
      "Camera cannot go behind the island.",
    );
    await user.click(screen.getByRole("button", { name: "Apply correction" }));
    expect(onCorrection).toHaveBeenCalledWith(
      "Camera cannot go behind the island.",
      "inferred_camera_lane",
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: /this correction replaces/i }),
      "",
    );
    expect(screen.getByRole("combobox", { name: /this correction replaces/i })).toHaveValue("");
    await user.type(
      screen.getByPlaceholderText(/quick correction/i),
      "The practical over the island can be dimmed.",
    );
    await user.click(screen.getByRole("button", { name: "Apply correction" }));
    expect(onCorrection).toHaveBeenLastCalledWith(
      "The practical over the island can be dimmed.",
      null,
    );
  });

  it("uses named route marks instead of overlapping people for dense blocking paths", async () => {
    const base = creativeAnalysisFixture();
    const visualPlan = base.blueprint.development.visualPlan;
    const analysis = {
      ...base,
      blueprint: {
        ...base.blueprint,
        development: {
          ...base.blueprint.development,
          visualPlan: {
            ...visualPlan,
            blocking: {
              ...visualPlan.blocking,
              subjects: [
                {
                  id: "mom",
                  label: "MOM",
                  carries: null,
                  states: [
                    { label: "START", x: 18, y: 57, note: "entry" },
                    { label: "2", x: 46, y: 50, note: "counter" },
                    { label: "3", x: 38, y: 59, note: "table" },
                    { label: "4", x: 74, y: 58, note: "high chair" },
                    { label: "END", x: 39, y: 60, note: "table" },
                  ],
                },
                {
                  id: "baby",
                  label: "BABY",
                  carries: null,
                  states: [{ label: "START", x: 79, y: 58, note: "high chair" }],
                },
              ],
            },
          },
        },
      },
    };
    const user = userEvent.setup();
    render(<BlueprintView {...props({ analysis })} />);
    await user.click(screen.getByRole("button", { name: /blueprinthow to execute/i }));
    await user.click(screen.getByRole("button", { name: "Blocking" }));
    expect(screen.getByText("MOM route")).toBeInTheDocument();
    expect(screen.getByText("BABY position")).toBeInTheDocument();
    expect(screen.getByText("M3·M5")).toBeInTheDocument();
  });

  it("keeps camera names in a keyed legend instead of colliding inside the blocking map", async () => {
    const base = creativeAnalysisFixture();
    const visualPlan = base.blueprint.development.visualPlan;
    const cameraLabel = "Camera bedroom diagonal with protected doorway axis";
    const analysis = {
      ...base,
      blueprint: {
        ...base.blueprint,
        development: {
          ...base.blueprint.development,
          visualPlan: {
            ...visualPlan,
            blocking: {
              ...visualPlan.blocking,
              cameras: [
                {
                  ...visualPlan.blocking.cameras[0]!,
                  id: "cluster_camera_1",
                  label: cameraLabel,
                  x: 20,
                  y: 20,
                },
                {
                  ...visualPlan.blocking.cameras[0]!,
                  id: "cluster_camera_2",
                  label: "Camera doorway safety",
                  x: 23,
                  y: 22,
                },
                {
                  ...visualPlan.blocking.cameras[0]!,
                  id: "cluster_camera_3",
                  label: "Camera table profile",
                  x: 25,
                  y: 21,
                },
              ],
            },
          },
        },
      },
    };
    const user = userEvent.setup();
    render(<BlueprintView {...props({ analysis })} />);
    await user.click(screen.getByRole("button", { name: /blueprinthow to execute/i }));
    await user.click(screen.getByRole("button", { name: "Blocking" }));

    const diagram = screen.getByRole("img", { name: /where are the people and cameras/i });
    const inDiagram = [...diagram.querySelectorAll("text")].map((label) => label.textContent);
    expect(inDiagram).toContain("C1/2/3");
    expect(inDiagram).not.toContain(cameraLabel);
    expect(screen.getByText(cameraLabel)).toBeInTheDocument();
  });
});
