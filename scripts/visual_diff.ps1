#!/usr/bin/env pwsh
# scripts/visual_diff.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Sovereign Visual Diff Tool
# Automates the Playwright screenshot regression workflow:
#   1. Run tests in regression mode (compare against stored baselines)
#   2. If diffs detected → open HTML report so you can see what changed
#   3. Prompt: [A]ccept new baselines | [R]eject (keep old) | [Q]uit
#   4. If accepted → update baseline PNGs and commit them
# ─────────────────────────────────────────────────────────────────────────────

param(
    [switch]$NoCommit  # Pass -NoCommit to update baselines without auto-committing
)

$ErrorActionPreference = 'Stop'
$UI_DIR = Join-Path $PSScriptRoot "..\ui"
$REPORT = Join-Path $UI_DIR "playwright-report\index.html"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       SOVEREIGN VISUAL REGRESSION SUITE              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Run regression tests ──────────────────────────────────────────────
Write-Host "▶  Running visual tests against stored baselines..." -ForegroundColor Yellow

Push-Location $UI_DIR
$exitCode = 0
try {
    npx playwright test --config=playwright.config.ts
    $exitCode = $LASTEXITCODE
}
catch {
    $exitCode = 1
}

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅  All visual tests PASSED. No regressions detected." -ForegroundColor Green
    Pop-Location
    exit 0
}

# ── Step 2: Tests failed — show what changed ───────────────────────────────────
Write-Host ""
Write-Host "⚠️  Visual differences detected." -ForegroundColor Yellow
Write-Host "   Baseline:  ui\tests\visual.spec.ts-snapshots\   (committed to git)" -ForegroundColor Gray
Write-Host "   Actual:    ui\test-results\                      (this run's output)" -ForegroundColor Gray
Write-Host ""

# List the test-results dirs (each failing test gets a subfolder)
$failedDirs = Get-ChildItem (Join-Path $UI_DIR "test-results") -Directory -ErrorAction SilentlyContinue
if ($failedDirs) {
    Write-Host "   Failed screenshot diffs:" -ForegroundColor Yellow
    foreach ($d in $failedDirs) {
        $diffPng = Get-ChildItem $d.FullName -Filter "*-diff.png" | Select-Object -First 1
        if ($diffPng) {
            Write-Host "     • $($d.Name)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Open the HTML report in the default browser
if (Test-Path $REPORT) {
    Write-Host "   Opening HTML report in browser..." -ForegroundColor Cyan
    Start-Process $REPORT
    Write-Host "   (Review the diff images in the report before deciding)" -ForegroundColor Gray
    Write-Host ""
}

# ── Step 3: Prompt user ────────────────────────────────────────────────────────
Write-Host "┌──────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│  What would you like to do?                          │" -ForegroundColor Cyan
Write-Host "│                                                      │" -ForegroundColor Cyan
Write-Host "│  [A] Accept  — update baselines, the new look is OK  │" -ForegroundColor Green
Write-Host "│  [R] Reject  — keep old baselines, this is a bug     │" -ForegroundColor Red
Write-Host "│  [Q] Quit    — do nothing, decide later              │" -ForegroundColor Gray
Write-Host "└──────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "   Your choice [A/R/Q]"

switch ($choice.ToUpper().Trim()) {

    "A" {
        Write-Host ""
        Write-Host "▶  Updating baselines (--update-snapshots)..." -ForegroundColor Yellow
        npx playwright test --config=playwright.config.ts --update-snapshots
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Some tests still failed after update — check test-results/" -ForegroundColor Red
        }
        else {
            Write-Host "✅  Baselines updated in tests\visual.spec.ts-snapshots\" -ForegroundColor Green
        }

        if (-not $NoCommit) {
            Write-Host ""
            Write-Host "▶  Committing updated baselines to git..." -ForegroundColor Yellow
            Pop-Location
            Push-Location (Join-Path $PSScriptRoot "..")
            git add "ui/tests/visual.spec.ts-snapshots/"
            git commit -m "test(visual): accept new screenshot baselines [$(Get-Date -Format 'yyyy-MM-dd')]"
            git push
            Write-Host "✅  Baselines committed and pushed." -ForegroundColor Green
            Pop-Location
        }
        else {
            Write-Host "   (Skipped auto-commit — run 'git add ui/tests/visual.spec.ts-snapshots/ && git commit' manually)" -ForegroundColor Gray
            Pop-Location
        }
    }

    "R" {
        Write-Host ""
        Write-Host "❌  Baselines kept unchanged. The diff is a regression — fix the code." -ForegroundColor Red
        Write-Host "   Check test-results\ for the actual screenshots and diff images." -ForegroundColor Gray
        Pop-Location
        exit 1
    }

    default {
        Write-Host ""
        Write-Host "   Exiting without changes. Run this script again when ready." -ForegroundColor Gray
        Pop-Location
        exit 0
    }
}
