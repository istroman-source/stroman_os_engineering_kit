import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title as a level-1 heading", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<PageHeader title="Projects" description="All your work" />);
    expect(screen.getByText("All your work")).toBeInTheDocument();
  });

  it("omits the description when absent", () => {
    const { container } = render(<PageHeader title="Settings" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
