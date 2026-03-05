# build_app.ps1 - Automated Build & Launch Utility
# Sovereign Engine Life-Cycle Management

Write-Host "--- INITIALIZING SOVEREIGN BUILD CYCLE ---" -ForegroundColor Cyan

# 1. Dependency Check
Write-Host "Verifying Node.js and Python dependencies..." -ForegroundColor Gray
Set-Location -Path "$PSScriptRoot\ui"
& npm.cmd install --quiet --legacy-peer-deps
Set-Location -Path "$PSScriptRoot"
# Assuming pip requirements are static for now, or add: pip install -r requirements.txt

# 2. Verification Block
Write-Host "Executing Core Verification Suite..." -ForegroundColor Yellow
& npx.cmd playwright install # Ensure browsers are present for tests
& npx.cmd playwright test tests/visual.spec.ts --project=chromium

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Visual Verification Failed. Proceeding to launch anyway for manual audit."
}

# 3. Port Cleanup
Write-Host "Clearing stale ports (3000, 8000)..." -ForegroundColor Gray
Get-Process -Name python, node -ErrorAction SilentlyContinue | Stop-Process -Force

# 4. Launch Sequence
Write-Host "Launching Sovereign Systems..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "api/main.py" -WorkingDirectory "$PSScriptRoot"
Set-Location -Path "$PSScriptRoot\ui"
& npm.cmd run dev
