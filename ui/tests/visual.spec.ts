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

        // Trigger the dossier modal via the "Advance Chronos" button
        await page.click('button:has-text("Advance Chronos")');

        // Wait for modal transition
        await page.waitForSelector('h3:has-text("Priority Dossier")');

        // Take snapshot of the high-stakes decision UI
        await expect(page.locator('.panel border-amber-accent/30')).toHaveScreenshot('dossier-modal.png');
    });
});
