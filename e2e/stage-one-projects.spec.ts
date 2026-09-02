import { expect, test, type Page } from "@playwright/test";
import { creativeAnalysisFixture } from "@/ui/creative/creative-test-fixtures";

const now = "2026-09-01T12:00:00.000Z";

async function authorize(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ json: { authenticated: true, privateBetaAccess: true } }),
  );
}

test.describe("Stage 1 film entry", () => {
  test("a first-time filmmaker starts a film and reaches only the first brief", async ({
    page,
  }) => {
    await authorize(page);
    await page.route("**/api/v1/projects", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          json: {
            id: "proj_new",
            name: "Faithful",
            status: "DRAFT",
            createdAt: now,
            updatedAt: now,
          },
        });
        return;
      }
      await route.fulfill({ json: { items: [] } });
    });
    await page.route("**/api/v1/projects/proj_new", (route) =>
      route.fulfill({
        json: {
          id: "proj_new",
          name: "Faithful",
          status: "DRAFT",
          createdAt: now,
          updatedAt: now,
        },
      }),
    );
    await page.route("**/api/v1/projects/proj_new/analysis{,/**}", (route) =>
      route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND", message: "Not found" } } }),
    );

    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Your films" })).toBeVisible();
    await expect(page.getByText("START A FILM", { exact: true })).toBeVisible();
    await page.getByLabel("Project working title").fill("Faithful");
    await page.getByRole("button", { name: "Start a film" }).click();

    await expect(page).toHaveURL(/\/projects\/proj_new\/brief$/);
    await expect(page.getByText("YOUR FIRST STEP")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /what do you want this film to become/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Describe the video")).toBeVisible();
    await expect(page.getByRole("link", { name: "Rooms" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Project" })).toHaveCount(0);
  });

  test("a returning filmmaker sees the stage and continues to the saved next step", async ({
    page,
  }) => {
    await authorize(page);
    const analysis = creativeAnalysisFixture();
    const planningContext = { ...analysis.brief.planningContext, stage: "PRE_PRODUCTION" } as const;
    const project = {
      id: "proj_existing",
      name: "Harbor Light Coffee",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    const intent = {
      ...analysis.brief,
      projectId: project.id,
      title: project.name,
      projectType: "Commercial",
      planningContext,
    };

    await page.route("**/api/v1/projects", (route) =>
      route.fulfill({ json: { items: [project] } }),
    );
    await page.route("**/api/v1/projects/proj_existing", (route) =>
      route.fulfill({ json: project }),
    );
    await page.route("**/api/v1/projects/proj_existing/analysis/intent", (route) =>
      route.fulfill({ json: intent }),
    );
    await page.route("**/api/v1/projects/proj_existing/analysis/history", (route) =>
      route.fulfill({ json: { items: [] } }),
    );
    await page.route("**/api/v1/projects/proj_existing/analysis", (route) =>
      route.fulfill({
        json: {
          ...analysis,
          brief: intent,
        },
      }),
    );
    await page.route("**/api/v1/projects/proj_existing/location-reconstructions", (route) =>
      route.fulfill({
        status: 404,
        json: { error: { code: "NOT_FOUND", message: "No reconstruction" } },
      }),
    );

    await page.goto("/projects");
    await expect(page.getByText("Commercial")).toBeVisible();
    await expect(page.getByText("SHOT PLANNING")).toBeVisible();
    await expect(
      page.getByText(/review the suggested shots and make them shootable/i),
    ).toBeVisible();
    await page.getByRole("link", { name: "Continue Harbor Light Coffee" }).click();

    await expect(page).toHaveURL(/\/projects\/proj_existing\/storyboard$/);
    await expect(page.getByRole("link", { name: "Plan shots" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("heading", { name: "Plan your shots" })).toBeVisible();
  });
});
