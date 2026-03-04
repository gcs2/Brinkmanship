# dev_rust.ps1 - Brinkmanship Rust Development Launcher
# Addressing Management's requirement for a single-command local testing cycle.

Write-Host "--- INITIALIZING BRINKMANSHIP RUST SYSTEMS ---" -ForegroundColor Cyan

# 1. Cleanup: Stopping existing instances to clear ports (8000 for Rust, 5173 for Vite)
Write-Host "Clearing environmental residue (stopping node/cargo-run)..." -ForegroundColor Gray
Get-Process -Name brinkmanship_engine, node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Setup Environment (Matching test_rust_engine.ps1)
$MSVC_BIN = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64"
$env:PATH = "C:\Users\zephy\.cargo\bin;$MSVC_BIN;$env:PATH"
$env:CARGO_TARGET_DIR = "C:\Users\zephy\cargo_cache\brinkmanship"

# 3. Start Rust Backend in a separate window
Write-Host "Launching Sovereign Rust Engine (Axum/ECS-Lite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='C:\Users\zephy\.cargo\bin;$MSVC_BIN;$env:PATH'; `$env:CARGO_TARGET_DIR='C:\Users\zephy\cargo_cache\brinkmanship'; cd brinkmanship_engine; cargo run"

# 3. Start React Frontend in the current terminal
Write-Host "Launching Sovereign Interface Telemetry (React/Vite)..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\ui"
& npm.cmd run dev
