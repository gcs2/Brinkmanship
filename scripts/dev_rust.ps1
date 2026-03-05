# dev_rust.ps1 - Brinkmanship Rust Development Launcher
# Run from project root: ./scripts/dev_rust.ps1

Write-Host "--- INITIALIZING BRINKMANSHIP RUST SYSTEMS ---" -ForegroundColor Cyan

# 1. Cleanup stale processes
Write-Host "Clearing stale processes (brinkmanship_engine, node)..." -ForegroundColor Gray
Get-Process -Name brinkmanship_engine, node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Set environment
$MSVC_BIN = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64"
$env:PATH = "C:\Users\zephy\.cargo\bin;$MSVC_BIN;$env:PATH"
$env:CARGO_TARGET_DIR = "C:\Users\zephy\cargo_cache\brinkmanship"

# 3. Start Rust backend in a new window (port 8000)
Write-Host "Launching Rust/Axum engine at http://localhost:8000 ..." -ForegroundColor Yellow
$projectRoot = Split-Path $PSScriptRoot -Parent
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='C:\Users\zephy\.cargo\bin;$MSVC_BIN;$env:PATH'; `$env:CARGO_TARGET_DIR='C:\Users\zephy\cargo_cache\brinkmanship'; Set-Location '$projectRoot\brinkmanship_engine'; cargo run"

# 4. Start React frontend in current terminal (port 3000)
Write-Host "Launching React UI at http://localhost:3000 ..." -ForegroundColor Green
Set-Location -Path "$projectRoot\ui"
& npm.cmd run dev
