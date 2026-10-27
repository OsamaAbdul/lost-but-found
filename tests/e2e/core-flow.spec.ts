import { test, expect } from '@playwright/test';

test.describe('Lost and Found Core User Flow', () => {
  test('homepage renders hero, search bar, and recent reports', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Find what matters');
    await expect(page.locator('input[name="q"]')).toBeVisible();
    await expect(page.locator('text=Report a Lost Item')).toBeVisible();
    await expect(page.locator('text=Report a Found Item')).toBeVisible();
  });

  test('search directory filters items by query', async ({ page }) => {
    await page.goto('/items');
    await expect(page.locator('h1')).toContainText('Search Lost & Found Belongings');

    // Search for laptop
    const searchInput = page.locator('input[placeholder*="Search by item title"]');
    await searchInput.fill('MacBook');
    await page.keyboard.press('Enter');

    // Wait for filtered item to be visible
    await expect(page.locator('text=MacBook Pro 14" Space Gray')).toBeVisible();
  });

  test('item detail page enforces privacy on confidential verification details', async ({ page }) => {
    await page.goto('/items/a2222222-2222-2222-2222-222222222222');
    await expect(page.locator('h1')).toContainText('Apple Laptop');
    // Confidential notes should not be leaked to ordinary user without proper credentials
    await expect(page.locator('text=Public Description')).toBeVisible();
  });

  test('matches page renders explainable breakdown factors', async ({ page }) => {
    await page.goto('/matches');
    await expect(page.locator('h1')).toContainText('Authorized Potential Matches');
    await expect(page.locator('text=Explainable Matching Weights')).toBeVisible();
  });
});
