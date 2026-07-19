import { expect, test } from "@playwright/test";

test.describe("application shell", () => {
  test("root redirects to the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  });

  test("primary navigation moves between sections", async ({ page }) => {
    await page.goto("/dashboard");

    const nav = page.getByRole("navigation", { name: "Primary" }).first();
    await nav.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

    await nav.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  });
});
