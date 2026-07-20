import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KnowledgeWorkspace } from "./knowledge-workspace";
import { createEntity, getEntityKnowledge, listEntities, listSources } from "./memory-api";

const { routerMock } = vi.hoisted(() => ({
  routerMock: { replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
}));
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("@/ui/auth/api-client", () => ({
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));
vi.mock("./memory-api", () => ({
  listEntities: vi.fn(),
  listSources: vi.fn(),
  createEntity: vi.fn(),
  createSource: vi.fn(),
  createMemory: vi.fn(),
  createRelationship: vi.fn(),
  createInsight: vi.fn(),
  getEntityKnowledge: vi.fn(),
}));

const michael = { id: "ent_1", name: "Michael Kramer", kind: "person", createdAt: "" };

beforeEach(() => {
  vi.mocked(listEntities).mockReset().mockResolvedValue([]);
  vi.mocked(listSources).mockReset().mockResolvedValue([]);
  vi.mocked(createEntity).mockReset().mockResolvedValue(michael);
  vi.mocked(getEntityKnowledge).mockReset();
});

describe("KnowledgeWorkspace", () => {
  it("renders the manual-entry interface and loads lists", async () => {
    render(<KnowledgeWorkspace />);
    expect(await screen.findByRole("heading", { name: /creative memory/i })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: /new entity/i })).toBeInTheDocument();
    await waitFor(() => expect(listEntities).toHaveBeenCalled());
  });

  it("creates an entity from the form", async () => {
    const user = userEvent.setup();
    render(<KnowledgeWorkspace />);
    await user.type(await screen.findByLabelText(/entity name/i), "Michael Kramer");
    await user.type(screen.getByLabelText(/entity kind/i), "person");
    await user.click(screen.getByRole("button", { name: /add entity/i }));
    await waitFor(() => expect(createEntity).toHaveBeenCalledWith("Michael Kramer", "person"));
  });

  it("loads and displays an entity's knowledge with traceable evidence", async () => {
    vi.mocked(listEntities).mockResolvedValue([michael]);
    vi.mocked(getEntityKnowledge).mockResolvedValue({
      entity: michael,
      memories: [
        {
          memory: {
            id: "mem_1",
            entityId: "ent_1",
            sourceId: "src_1",
            content: "Authentic voice",
            createdAt: "",
          },
          source: {
            id: "src_1",
            label: "Founder interview",
            sourceType: "interview",
            url: null,
            detail: null,
            createdAt: "",
          },
        },
      ],
      relationships: [
        {
          relationship: {
            id: "rel_1",
            fromEntityId: "ent_1",
            toEntityId: "ent_2",
            relationType: "leads",
            createdAt: "",
          },
          direction: "outgoing",
          otherEntity: {
            id: "ent_2",
            name: "Jimmy's Famous Seafood",
            kind: "organization",
            createdAt: "",
          },
        },
      ],
      insights: [
        {
          insight: {
            id: "ins_1",
            statement: "Authenticity is the asset",
            confidence: 0.9,
            evidence: "consistent",
            memoryIds: ["mem_1"],
            createdAt: "",
          },
          citedMemories: [
            {
              id: "mem_1",
              entityId: "ent_1",
              sourceId: "src_1",
              content: "Authentic voice",
              createdAt: "",
            },
          ],
        },
      ],
    });

    const user = userEvent.setup();
    render(<KnowledgeWorkspace />);
    await user.selectOptions(await screen.findByLabelText(/select entity/i), "ent_1");

    await waitFor(() => expect(getEntityKnowledge).toHaveBeenCalledWith("ent_1"));
    const panel = within(await screen.findByLabelText(/entity knowledge/i));
    expect(panel.getByText(/Founder interview/)).toBeInTheDocument();
    expect(panel.getByText(/Jimmy's Famous Seafood/)).toBeInTheDocument();
    expect(panel.getByText(/Authenticity is the asset/)).toBeInTheDocument();
    expect(panel.getByText(/Traceable to:/)).toHaveTextContent(/Authentic voice/);
  });
});
