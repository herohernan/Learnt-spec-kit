// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Album creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows empty state on first visit', async ({ page }) => {
    await expect(page.getByText('No albums yet')).toBeVisible();
  });

  test('opens create album dialog when button clicked', async ({ page }) => {
    await page.getByRole('button', { name: '+ Create album' }).click();
    await expect(page.getByRole('heading', { name: 'Create album' })).toBeVisible();
  });

  test('shows validation errors when form submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: '+ Create album' }).click();
    await page.getByRole('button', { name: 'Save album' }).click();
    await expect(page.getByText('Album title is required')).toBeVisible();
  });

  test('creates an album and shows it in the grid', async ({ page }) => {
    await page.getByRole('button', { name: '+ Create album' }).click();
    await page.getByLabel('Album title').fill('My Road Trip');
    await page.getByLabel('Album date').fill('2024-07-14');
    await page.getByRole('button', { name: 'Save album' }).click();

    // Dialog should close
    await expect(page.getByRole('heading', { name: 'Create album' })).not.toBeVisible();
    // Album card should appear
    await expect(page.getByText('My Road Trip')).toBeVisible();
    // Toast should appear
    await expect(page.getByText(/Album.*created/i)).toBeVisible();
  });

  test('closes dialog on Cancel', async ({ page }) => {
    await page.getByRole('button', { name: '+ Create album' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Create album' })).not.toBeVisible();
  });
});
