# dev.ps1 - Brinkmanship Development Environment Launcher
# Addressing Management's requirement for simplified lifecycle management.

Write-Host "--- INITIALIZING BRINKMANSHIP SYSTEMS ---" -ForegroundColor Cyan

# 1. Kill existing processes to prevent port locks
Write-Host "Stopping existing engine and UI instances..." -ForegroundColor Gray
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Add Node.js to path for the session
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# 3. Start API Bridge in the background
Write-Host "Launching Sovereign API Bridge (Hot-Reload Enabled)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "api/main.py" -WorkingDirectory "$PSScriptRoot"

# 4. Start Next.js Development Server
Write-Host "Launching Sovereign Interface Telemetry..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\ui"
& npm.cmd run dev
