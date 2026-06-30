import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows the main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("has navigation links to login and signup", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('a[href="/login"]').first();
    const signupLink = page.locator('a[href="/signup"]').first();
    await expect(loginLink).toBeVisible();
    await expect(signupLink).toBeVisible();
  });

  test("login link navigates to login page", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/login"]').first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
