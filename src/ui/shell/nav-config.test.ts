import { describe, expect, it } from "vitest";
import { navItems, secondaryNavItems } from "./nav-config";

describe("primary navigation", () => {
  it("keeps only the two filmmaker workspaces in primary navigation", () => {
    expect(navItems.map(({ href, label }) => ({ href, label }))).toEqual([
      { href: "/projects", label: "Projects" },
      { href: "/locations", label: "Rooms" },
    ]);
  });

  it("keeps settings secondary", () => {
    expect(secondaryNavItems.map(({ href, label }) => ({ href, label }))).toEqual([
      { href: "/settings", label: "Settings" },
    ]);
  });
});
