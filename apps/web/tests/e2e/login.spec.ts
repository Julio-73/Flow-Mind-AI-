import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("shows login page elements", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("FlowMind AI");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Login failed")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to dashboard on successful login", async ({ page }) => {
    await page.fill('input[type="email"]', "admin@flowmind.ai");
    await page.fill('input[type="password"]', "correctpassword");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("disables submit button when fields are empty", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /sign in/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("enables submit button when fields are filled", async ({ page }) => {
    await page.fill('input[type="email"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    const submitBtn = page.getByRole("button", { name: /sign in/i });
    await expect(submitBtn).toBeEnabled();
  });

  test("shows Google OAuth button", async ({ page }) => {
    await expect(page.getByText("Continue with Google")).toBeVisible();
  });

  test("shows terms and privacy links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /terms/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /privacy/i })).toBeVisible();
  });
});
