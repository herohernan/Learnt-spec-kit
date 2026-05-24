// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Album detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Create an album to open
    await page.getByRole('button', { name: '+ Create album' }).click();
    await page.getByLabel('Album title').fill('Detail Test');
    await page.getByLabel('Album date').fill('2024-06-15');
    await page.getByRole('button', { name: 'Save album' }).click();
    await page.waitForTimeout(300);
  });

  test('navigates to album detail when card is clicked', async ({ page }) => {
    await page.locator('[data-album-id]').click();
    await expect(page).toHaveURL(/album\.html/);
    await expect(page.locator('#album-title')).toHaveText('Detail Test');
  });

  test('shows formatted date on detail page', async ({ page }) => {
    await page.locator('[data-album-id]').click();
    await expect(page.locator('#album-date-display')).toHaveText('June 15, 2024');
  });

  test('back link returns to main page', async ({ page }) => {
    await page.locator('[data-album-id]').click();
    await page.getByRole('link', { name: 'Back to all albums' }).click();
    await expect(page).toHaveURL('/');
  });

  test('empty state shown when album has no photos', async ({ page }) => {
    await page.locator('[data-album-id]').click();
    await expect(page.getByText('No photos yet')).toBeVisible();
  });
});
