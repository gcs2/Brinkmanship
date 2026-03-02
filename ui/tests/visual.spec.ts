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
        await page.waitForSelector('.panel', { timeout: 30000 });
        await page.click('button:has-text("Advance Chronos")');
        await page.waitForSelector('h3:has-text("Priority Dossier")', { timeout: 10000 });

        const modal = page.locator('.fixed.right-0'); // Select the sliding pane
        await expect(modal).toBeVisible();
        await expect(modal).toHaveScreenshot('dossier-pane.png');
    });

    test('Identity Panel & Advisors check', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForSelector('.panel');

        const identity = page.locator('.col-span-3').first(); // Left column contains Identity
        await expect(identity).toHaveScreenshot('identity-panel.png');
    });

    test('Intel Feed and Metric Readout check', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForSelector('.panel');

        const intel = page.locator('.col-span-6 .panel').last(); // Bottom center is Intel
        await expect(intel).toHaveScreenshot('intel-feed.png');
    });

    test('Scenario Selector menu check', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForSelector('button:has-text("Swap Config")');

        await page.click('button:has-text("Swap Config")');
        const menu = page.locator('.absolute.top-full.right-0');
        await expect(menu).toBeVisible();
        await expect(menu).toHaveScreenshot('scenario-menu.png');
    });
});

