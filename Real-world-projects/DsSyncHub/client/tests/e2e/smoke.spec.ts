import { test, expect } from '@playwright/test'

test('auth pages and dashboard entry smoke', async ({ page }) => {
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: /Create account/i })).toBeVisible()

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /Login to your account/i })).toBeVisible()
})

test('forgot and reset pages render', async ({ page }) => {
  await page.goto('/forgot-password')
  await expect(page.getByRole('heading', { name: /Forgot your password/i })).toBeVisible()

  await page.goto('/reset-password/test-token')
  await expect(page.getByRole('heading', { name: /Reset your password/i })).toBeVisible()
})
