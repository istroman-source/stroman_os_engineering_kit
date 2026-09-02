import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

const { navigation } = vi.hoisted(() => ({ navigation: { pathname: "/projects" } }));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
vi.mock("./sidebar", () => ({ Sidebar: () => <aside>Full workspace navigation</aside> }));
vi.mock("./top-nav", () => ({ TopNav: () => <header>Mobile workspace navigation</header> }));

beforeEach(() => {
  navigation.pathname = "/projects";
});

describe("AppShell", () => {
  it("keeps the first brief focused on one active job", () => {
    navigation.pathname = "/projects/proj_1/brief";
    render(<AppShell>Describe the film</AppShell>);

    expect(screen.getByRole("main")).toHaveTextContent("Describe the film");
    expect(screen.queryByText("Full workspace navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Mobile workspace navigation")).not.toBeInTheDocument();
  });

  it("preserves the normal workspace outside the guided first step", () => {
    render(<AppShell>Films</AppShell>);

    expect(screen.getByText("Full workspace navigation")).toBeInTheDocument();
    expect(screen.getByText("Mobile workspace navigation")).toBeInTheDocument();
  });
});
