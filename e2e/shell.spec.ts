import { expect, test } from "@playwright/test";

test.describe("authentication gate", () => {
  test("unauthenticated visit to a protected route redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: /send sign-in link/i })).toBeVisible();
  });

  test("root also lands on /login when signed out", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("the login page shows the email sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: /send sign-in link/i })).toBeVisible();
  });
});
