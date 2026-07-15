import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("sidebar navigation links are visible", async ({ page }) => {
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /flows/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /templates/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /connectors/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /variables/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /monitor/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /activity/i })).toBeVisible();
  });

  test("navigates to flows page via sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /flows/i }).first().click();
    await expect(page).toHaveURL(/\/flows/);
  });

  test("navigates to templates page via sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /templates/i }).click();
    await expect(page).toHaveURL(/\/templates/);
  });

  test("navigates to settings page via bottom nav", async ({ page }) => {
    await page.getByRole("link", { name: /settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test("navigates to dashboard from other page", async ({ page }) => {
    await page.goto("/flows");
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
