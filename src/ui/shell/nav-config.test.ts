import { describe, expect, it } from "vitest";
import { navItems } from "./nav-config";

describe("primary navigation", () => {
  it("exposes the story workflow without internal knowledge-management surfaces", () => {
    expect(navItems.map(({ href, label }) => ({ href, label }))).toEqual([
      { href: "/projects", label: "Story Studio" },
      { href: "/settings", label: "Settings" },
    ]);
  });
});
