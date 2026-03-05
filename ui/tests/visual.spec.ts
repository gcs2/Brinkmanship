import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────

async function loadApp(page: any) {
    await page.goto('http://localhost:3000');
    // Wait for the header (present in all states)
    await page.waitForSelector('header', { timeout: 15000 });
    // Let window animations settle
    await page.waitForTimeout(1500);
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1: Glass Cockpit — Window Manager
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Phase 18 — Window Manager Canvas', () => {

    test('Full canvas loads with header and default windows', async ({ page }) => {
        await loadApp(page);
        // Header present
        await expect(page.locator('header')).toBeVisible();
        // "BRINKMANSHIP" title text
        await expect(page.locator('header h1')).toContainText('BRINKMANSHIP');
        // At least one sovereign window title bar (drag handle)
        await expect(page.locator('.sovereign-drag-handle').first()).toBeVisible();
        // Screenshot of full canvas
        await expect(page).toHaveScreenshot('01-full-canvas.png', { maxDiffPixelRatio: 0.05 });
    });

    test('World map window is visible and contains zoom controls', async ({ page }) => {
        await loadApp(page);
        // Zoom in button ("+") inside TacticalMap
        const zoomIn = page.locator('button', { hasText: '+' }).first();
        await expect(zoomIn).toBeVisible();
        await expect(page).toHaveScreenshot('02-world-map-window.png', { maxDiffPixelRatio: 0.08 });
    });

    test('RESET LAYOUT button is present in header', async ({ page }) => {
        await loadApp(page);
        const resetBtn = page.locator('button', { hasText: 'Reset Layout' });
        await expect(resetBtn).toBeVisible();
    });

    test('Clicking window Profile toggle opens Country Profile window', async ({ page }) => {
        await loadApp(page);
        // Country profile window starts closed — click the Profile toggle in header
        const profileToggle = page.locator('button', { hasText: 'Profile' });
        await expect(profileToggle).toBeVisible();
        await profileToggle.click();
        // Country Profile window title bar should now appear
        await expect(page.locator('text=Country Profile')).toBeVisible({ timeout: 3000 });
        await expect(page).toHaveScreenshot('03-country-profile-open.png', { maxDiffPixelRatio: 0.05 });
    });

    test('Window close button hides the window', async ({ page }) => {
        await loadApp(page);
        // Close the Intel Feed window (id=intel, title contains "Intel Feed")
        const intelTitle = page.locator('.sovereign-drag-handle', { hasText: 'Intel Feed' });
        await expect(intelTitle).toBeVisible();
        // X button is a sibling inside the title bar
        const closeBtn = intelTitle.locator('button[title="Close"]');
        await closeBtn.click();
        await expect(intelTitle).not.toBeVisible({ timeout: 2000 });
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2: IdeologyGrid Fullscreen
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Phase 18 — IdeologyGrid Fullscreen Mode', () => {

    test('Ideology compass window is visible on load', async ({ page }) => {
        await loadApp(page);
        const compassTitle = page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' });
        await expect(compassTitle).toBeVisible();
    });

    test('Clicking fullscreen button opens IdeologyGrid overlay', async ({ page }) => {
        await loadApp(page);
        // The fullscreen button is inside the ideology window title bar (Maximize2 icon, title="Fullscreen")
        const fullscreenBtn = page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })
            .locator('button[title="Fullscreen"]');
        await expect(fullscreenBtn).toBeVisible();
        await fullscreenBtn.click();

        // IdeologyGrid fullscreen overlay should appear (fixed inset-0)
        await expect(page.locator('text=Ideology Matrix — Full Spectrum View')).toBeVisible({ timeout: 3000 });

        // Grid cells should be rendered (look for a known corner label)
        await expect(page.locator('text=Stalinism').first()).toBeVisible();
        await expect(page.locator('text=Liberalism').first()).toBeVisible();

        // Screenshot of fullscreen ideology grid
        await expect(page).toHaveScreenshot('04-ideology-grid-fullscreen.png', { maxDiffPixelRatio: 0.06 });
    });

    test('IdeologyGrid cell hover shows ideology name in tooltip', async ({ page }) => {
        await loadApp(page);
        const fullscreenBtn = page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })
            .locator('button[title="Fullscreen"]');
        await fullscreenBtn.click();
        await page.waitForSelector('text=Ideology Matrix — Full Spectrum View', { timeout: 3000 });

        // Use data-testid on the grid container and get the first cell
        const firstCell = page.locator('[data-testid="ideology-grid-cells"] > div').first();
        await expect(firstCell).toBeVisible({ timeout: 5000 });
        await firstCell.hover();
        // Tooltip is absolutely positioned; wait for it to mount
        await page.waitForSelector('[style*="bottom: calc(100% + 4px)"]', { timeout: 3000 });

        await expect(page).toHaveScreenshot('05-ideology-grid-hover-tooltip.png', { maxDiffPixelRatio: 0.06 });
    });

    test('IdeologyGrid Trajectory filter toggle works', async ({ page }) => {
        await loadApp(page);
        const fullscreenBtn = page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })
            .locator('button[title="Fullscreen"]');
        await fullscreenBtn.click();
        await page.waitForSelector('text=Ideology Matrix — Full Spectrum View', { timeout: 3000 });

        // Trajectory filter should be on by default (amber styled)
        const trajectoryBtn = page.locator('button', { hasText: 'Trajectory' });
        await expect(trajectoryBtn).toBeVisible();

        // Toggle it off
        await trajectoryBtn.click();
        await page.waitForTimeout(200);
        // Toggle back on
        await trajectoryBtn.click();

        await expect(page).toHaveScreenshot('06-ideology-grid-filters.png', { maxDiffPixelRatio: 0.05 });
    });

    test('Closing IdeologyGrid with Escape key returns to canvas', async ({ page }) => {
        await loadApp(page);
        const fullscreenBtn = page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })
            .locator('button[title="Fullscreen"]');
        await fullscreenBtn.click();
        await page.waitForSelector('text=Ideology Matrix — Full Spectrum View', { timeout: 3000 });

        await page.keyboard.press('Escape');

        await expect(page.locator('text=Ideology Matrix — Full Spectrum View')).not.toBeVisible({ timeout: 2000 });
        await expect(page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })).toBeVisible();
    });

    test('Closing IdeologyGrid with ESC button returns to canvas', async ({ page }) => {
        await loadApp(page);
        const fullscreenBtn = page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })
            .locator('button[title="Fullscreen"]');
        await fullscreenBtn.click();
        await page.waitForSelector('text=Ideology Matrix — Full Spectrum View', { timeout: 3000 });

        const closeBtn = page.locator('[data-testid="close-ideology-grid"]');
        await expect(closeBtn).toBeVisible({ timeout: 2000 });
        await closeBtn.click();

        await expect(page.locator('text=Ideology Matrix — Full Spectrum View')).not.toBeVisible({ timeout: 2000 });
        await expect(page.locator('.sovereign-drag-handle', { hasText: 'Ideology Axis' })).toBeVisible();
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3: Dossier Pane (updated selectors for Phase 18)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Phase 18 — Dossier & Simulation Controls', () => {

    test('CHRONOS play button is present and clickable', async ({ page }) => {
        await loadApp(page);
        const chronosBtn = page.locator('button', { hasText: 'CHRONOS' });
        await expect(chronosBtn).toBeVisible();
    });

    test('Scenario selector menu opens on click', async ({ page }) => {
        await loadApp(page);
        const configBtn = page.locator('button', { hasText: 'Config' });
        await expect(configBtn).toBeVisible();
        await configBtn.click();
        // Dropdown should appear
        await expect(page.locator('text=Load').first()).toBeVisible({ timeout: 2000 });
        await expect(page).toHaveScreenshot('07-scenario-menu.png', { maxDiffPixelRatio: 0.05 });
    });

});
