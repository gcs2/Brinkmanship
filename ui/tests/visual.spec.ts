import { test, expect } from '@playwright/test';

test.describe('Sovereign Interface Visual Verification', () => {
    test('Dashboard matches baseline aesthetic', async ({ page }) => {
        // Navigate to the local dev server
        await page.goto('http://localhost:3000');

        // Wait for the tactical map and waveform to be ready
        await page.waitForSelector('header');
        await page.waitForSelector('.panel');

        // Allow animations to settle
        await page.waitForTimeout(2000);

        // Visual Snapshot comparison
        await expect(page).toHaveScreenshot('dashboard-baseline.png', {
            maxDiffPixelRatio: 0.05,
            threshold: 0.2,
        });
    });

    test('Dossier Modal visual check', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Wait for the main tactical grid to hydrate
        await page.waitForSelector('.panel', { timeout: 30000 });

        // Trigger the dossier modal via the "Advance Chronos" button
        await page.click('button:has-text("Advance Chronos")');

        // Wait for modal transition with longer timeout
        await page.waitForSelector('h3:has-text("Priority Dossier")', { timeout: 10000 });

        // Take snapshot of the high-stakes decision UI
        const modal = page.locator('.panel').filter({ hasText: 'Priority Dossier' });
        await expect(modal).toBeVisible();
        await expect(modal).toHaveScreenshot('dossier-modal.png');
    });
});
