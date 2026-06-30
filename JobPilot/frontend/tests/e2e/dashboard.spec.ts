import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to login when accessing protected routes", async ({ page }) => {
    await page.goto("/dashboard/jobs");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to login when accessing settings", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to login when accessing analytics", async ({ page }) => {
    await page.goto("/dashboard/analytics");
    await expect(page).toHaveURL(/\/login/);
  });
});
