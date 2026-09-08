import { expect, test, type Page } from "@playwright/test";
import { creativeAnalysisFixture } from "@/ui/creative/creative-test-fixtures";

const now = "2026-09-02T05:00:00.000Z";
const project = {
  id: "proj_ticket",
  name: "Ticket to Table",
  status: "DRAFT",
  createdAt: now,
  updatedAt: now,
};
const briefText =
  "Ticket to table is a series where a chef quickly runs through the process describing a dishes conception from the ticket to the table (but coverage stops at the expo station) Food comes up fresh and a bell is rung at the end. this is a social media post to push brand identity and engage instagram, X and tiktok users";

async function authorize(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ json: { authenticated: true, privateBetaAccess: true } }),
  );
}

test.describe("Stage 2 brief understanding", () => {
  test("separates comprehension from creative development and preserves editing", async ({
    page,
  }) => {
    await authorize(page);
    let savedFields: Record<string, string> | null = null;
    await page.route("**/api/v1/projects/proj_ticket", (route) => route.fulfill({ json: project }));
    await page.route("**/api/v1/projects/proj_ticket/analysis/history", (route) =>
      route.fulfill({ json: { items: [] } }),
    );
    await page.route("**/api/v1/projects/proj_ticket/analysis/intent", async (route) => {
      if (route.request().method() === "POST") {
        savedFields = route.request().postDataJSON();
        await route.fulfill({
          json: {
            ...creativeAnalysisFixture().brief,
            ...savedFields,
            projectId: project.id,
            developmentStatus: "DRAFT",
            developmentStartedAt: null,
          },
        });
        return;
      }
      await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND" } } });
    });
    await page.route("**/api/v1/projects/proj_ticket/analysis", async (route) => {
      if (route.request().method() === "POST") {
        const fixture = creativeAnalysisFixture();
        await route.fulfill({
          json: {
            ...fixture,
            brief: { ...fixture.brief, ...route.request().postDataJSON(), projectId: project.id },
          },
        });
        return;
      }
      await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND" } } });
    });

    await page.goto("/projects/proj_ticket/brief");
    await page.getByLabel("Describe the video").fill(briefText);
    await page.getByRole("button", { name: "Make my plan" }).click();

    await expect(page.getByText("BRIEF RECEIVED")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What I understood" })).toBeVisible();
    await expect(page.getByText(/Ticket to table is a series where a chef/i)).toBeVisible();
    await expect(page.getByText(/instagram, X and tiktok users/i)).toBeVisible();
    await expect(page.getByText(/bell is rung at the end/i)).toBeVisible();
    await expect(
      page.getByText(/working confidence|starting gun|ritual of competence|camera direction/i),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Edit brief" }).click();
    await expect(page.getByLabel("Describe the video")).toHaveValue(briefText);
    await page.getByRole("button", { name: "Rebuild my plan" }).click();
    await page.getByRole("button", { name: "Looks right — Continue" }).click();
    await expect(page.getByText("The film Stroman believes you are making")).toBeVisible();
  });
});
