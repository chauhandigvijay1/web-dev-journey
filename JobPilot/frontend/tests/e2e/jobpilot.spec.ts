import { expect, test } from "@playwright/test";

function dateInputOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

test("core job flow works through the UI", async ({ page, request }) => {
  const stamp = Date.now();
  const email = `playwright.${stamp}@example.com`;
  const username = `playwright${stamp}`;
  const password = "Secure@123";

  await page.goto("/signup");
  await page.locator("#name").fill("Playwright QA");
  await page.locator("#username").fill(username);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.context().clearCookies();
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/login");

  await page.locator("#identifier").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: /Add Job/i }).click();
  await page.getByRole("button", { name: "Enter manually" }).click();
  await page.locator("#title").fill("Manual QA Engineer");
  await page.locator("#company").fill("Manual Acme");
  await page.locator("#location").fill("Remote");
  await page.locator("#jobType").fill("Full-time");
  await page.locator("#salary").fill("15 LPA");
  await page.locator("#followUpDate").fill(dateInputOffset(-1));
  await page.locator("#notes").fill("Created by Playwright");
  await page.getByRole("button", { name: "Save job" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: /Add Job/i }).click();
  await page.locator("#job-url").fill("http://127.0.0.1:4010/job-posting");
  await page.getByRole("button", { name: "Fetch details" }).click();
  await expect(page.locator("#title")).toHaveValue("Automation QA Engineer");
  await page.locator("#followUpDate").fill(dateInputOffset(2));
  await page.getByRole("button", { name: "Save job" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/dashboard/jobs");
  const card = page.getByRole("button", { name: /Manual QA Engineer/i }).first();
  const column = page.getByRole("heading", { name: "Interview" }).first();
  await expect(card).toBeVisible();
  await expect(column).toBeVisible();
  const cardBox = await card.boundingBox();
  const columnBox = await column.boundingBox();

  if (!cardBox || !columnBox) {
    throw new Error("Unable to locate kanban card or target column");
  }

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(columnBox.x + columnBox.width / 2, columnBox.y + 80, { steps: 12 });
  await page.mouse.up();
  await page.getByRole("link", { name: /Manual QA Engineer/i }).first().click();
  await expect(page.locator('select[aria-label="Job status"]')).toHaveValue("interview");

  const sweep = await request.post("http://localhost:5051/api/system/reminders/sweep", {
    headers: { "x-reminder-secret": "e2e-secret" },
  });
  expect(sweep.ok()).toBeTruthy();

  const outbox = await request.get("http://localhost:5051/api/system/mail/outbox", {
    headers: { "x-reminder-secret": "e2e-secret" },
  });
  expect(outbox.ok()).toBeTruthy();
  const outboxJson = await outbox.json();
  expect(outboxJson.data.messages.length).toBeGreaterThan(0);
  expect(
    outboxJson.data.messages.some((message: { subject: string }) =>
      message.subject.includes("Manual QA Engineer")
    )
  ).toBeTruthy();
});
