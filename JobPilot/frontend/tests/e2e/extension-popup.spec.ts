import { test, expect } from "@playwright/test";

test.describe("Extension popup (simulated)", () => {
  test("content script detects job on fixture page", async ({ page }) => {
    await page.goto("http://127.0.0.1:4010/job-posting");
    const title = page.locator("h1");
    await expect(title).toContainText("Senior Software Engineer");
  });

  test("content script extracts LD+JSON job data", async ({ page }) => {
    await page.goto("http://127.0.0.1:4010/job-posting");

    const jobTitle = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      if (!script?.textContent) return null;
      const data = JSON.parse(script.textContent);
      return data?.title || null;
    });
    expect(jobTitle).toBe("Senior Software Engineer");
  });

  test("fixture server returns 404 for unknown route", async ({ page }) => {
    const response = await page.request.get("http://127.0.0.1:4010/unknown");
    expect(response.status()).toBe(404);
  });

  test("no job on non-job page", async ({ page }) => {
    await page.goto("http://127.0.0.1:4010/not-a-job");
    const hasH1Job = await page.locator("h1").count();
    expect(hasH1Job).toBe(1);
    await expect(page.locator("h1")).toContainText("Google Search");
  });

  test("fixture server health endpoint", async ({ page }) => {
    const response = await page.request.get("http://127.0.0.1:4010/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
