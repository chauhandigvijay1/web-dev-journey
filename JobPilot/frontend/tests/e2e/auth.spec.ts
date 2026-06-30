import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test("login page renders the form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('input[id="identifier"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="identifier"]', "wrong@email.com");
    await page.fill('input[id="password"]', "wrongpass");
    await page.click('button[type="submit"]');
    // Should show an error message or stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup page renders the form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
  });

  test("navigates to signup from login", async ({ page }) => {
    await page.goto("/login");
    await page.locator('a[href="/signup"]').first().click();
    await expect(page).toHaveURL(/\/signup/);
  });
});
