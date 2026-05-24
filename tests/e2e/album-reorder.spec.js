// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Album reorder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Create two albums
    for (const [title, date] of [
      ['Alpha', '2024-01-01'],
      ['Beta', '2024-01-01'],
    ]) {
      await page.getByRole('button', { name: '+ Create album' }).click();
      await page.getByLabel('Album title').fill(title);
      await page.getByLabel('Album date').fill(date);
      await page.getByRole('button', { name: 'Save album' }).click();
      await page.waitForTimeout(300);
    }
  });

  test('move-up button shifts album earlier in list', async ({ page }) => {
    // Hover to reveal action buttons
    const betaCard = page.locator('[data-album-id]').filter({ hasText: 'Beta' });
    await betaCard.hover();
    await betaCard.getByRole('button', { name: /Move Beta up/ }).click();

    // Beta should now appear before Alpha
    const cards = page.locator('[data-album-id]');
    await expect(cards.nth(0)).toContainText('Beta');
    await expect(cards.nth(1)).toContainText('Alpha');
  });

  test('move-down button shifts album later in list', async ({ page }) => {
    const alphaCard = page.locator('[data-album-id]').filter({ hasText: 'Alpha' });
    await alphaCard.hover();
    await alphaCard.getByRole('button', { name: /Move Alpha down/ }).click();

    const cards = page.locator('[data-album-id]');
    await expect(cards.nth(0)).toContainText('Beta');
    await expect(cards.nth(1)).toContainText('Alpha');
  });
});
