import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings/general");
  });

  test("shows settings page header", async ({ page }) => {
    await expect(page.getByText("General Settings")).toBeVisible();
    await expect(page.getByText("Manage your workspace preferences")).toBeVisible();
  });

  test("shows workspace name input", async ({ page }) => {
    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
  });

  test("shows timezone select", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("shows save button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /save/i })).toBeVisible();
  });

  test("can change workspace name", async ({ page }) => {
    const nameInput = page.getByPlaceholder(/name/i);
    await nameInput.fill("New Workspace");
    await page.getByRole("button", { name: /save/i }).click();
    await expect(nameInput).toHaveValue("New Workspace");
  });

  test("can change timezone", async ({ page }) => {
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /europe\/madrid/i }).click();
    await expect(page.getByRole("combobox")).toContainText("Europe/Madrid");
  });
});
