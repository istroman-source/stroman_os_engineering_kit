import { expect, test } from "@playwright/test";

test.describe("signed-out accessibility smoke", () => {
  test("the sign-in journey is named, keyboard operable, and reports errors", async ({ page }) => {
    await page.goto("/login");

    const email = page.getByRole("textbox", { name: /email/i });
    const submit = page.getByRole("button", { name: /send sign-in link/i });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stroman OS");
    await expect(email).toBeVisible();
    await expect(submit).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(email).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(submit).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
