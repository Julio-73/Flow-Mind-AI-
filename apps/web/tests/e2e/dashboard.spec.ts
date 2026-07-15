import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows dashboard page header", async ({ page }) => {
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Overview of your workspace activity")).toBeVisible();
  });

  test("shows New Flow button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /new flow/i })).toBeVisible();
  });

  test("shows period filter buttons", async ({ page }) => {
    await expect(page.getByText("24h")).toBeVisible();
    await expect(page.getByText("7d")).toBeVisible();
    await expect(page.getByText("30d")).toBeVisible();
  });

  test("shows KPI section", async ({ page }) => {
    await expect(page.locator("text=Total Flows").or(page.locator("[class*='animate-pulse']"))).toBeVisible();
  });

  test("navigates to flows page when clicking New Flow", async ({ page }) => {
    await page.getByRole("button", { name: /new flow/i }).click();
    await expect(page).toHaveURL(/\/flows/);
  });

  test("changes period filter on click", async ({ page }) => {
    const periodBtn = page.getByText("7d");
    await periodBtn.click();
    await expect(periodBtn).toHaveClass(/bg-biolume/);
  });
});
