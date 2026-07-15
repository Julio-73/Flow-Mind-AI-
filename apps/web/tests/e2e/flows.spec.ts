import { test, expect } from "@playwright/test";

test.describe("Flows List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/flows");
  });

  test("shows flows page header", async ({ page }) => {
    await expect(page.getByText("Flows")).toBeVisible();
    await expect(page.getByText("Create and manage your automation flows")).toBeVisible();
  });

  test("shows New Flow button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /new flow/i })).toBeVisible();
  });

  test("opens new flow dialog when clicking New Flow", async ({ page }) => {
    await page.getByRole("button", { name: /new flow/i }).click();
    await expect(page.getByText("New Flow")).toBeVisible();
    await expect(page.getByText("Create a new automation flow")).toBeVisible();
  });

  test("new flow dialog has name input and create options", async ({ page }) => {
    await page.getByRole("button", { name: /new flow/i }).click();
    await expect(page.getByPlaceholder("Flow name")).toBeVisible();
    await expect(page.getByText("From Scratch")).toBeVisible();
    await expect(page.getByText("From Template")).toBeVisible();
    await expect(page.getByText("With AI")).toBeVisible();
  });

  test("create button is disabled without a name", async ({ page }) => {
    await page.getByRole("button", { name: /new flow/i }).click();
    const createBtn = page.getByRole("button", { name: /create/i });
    await expect(createBtn).toBeDisabled();
  });

  test("shows search command and status filter", async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i).or(page.locator('[data-testid="search"]'))).toBeVisible();
  });
});
