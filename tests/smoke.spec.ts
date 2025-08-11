import { test, expect } from '@playwright/test';

test('home renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/feel|fitness|next/i);
  await expect(page.locator('body')).toBeVisible();
});
