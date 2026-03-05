# test_rust_engine.ps1
# Optimized Test Runner for Brinkmanship Engine (Windows)
# Addresses "Slow Tests" and "OS Error 32" (Filesystem Locks)

# 1. Configuration
$ENGINE_DIR = "c:\Users\zephy\Documents\Brinkmanship\brinkmanship_engine"
$STABLE_TARGET_DIR = "C:\Users\zephy\cargo_cache\brinkmanship"
$MSVC_BIN = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64"

# 2. Setup Environment
if (-not (Test-Path $STABLE_TARGET_DIR)) {
    New-Item -ItemType Directory -Force -Path $STABLE_TARGET_DIR
}

$env:PATH = "C:\Users\zephy\.cargo\bin;$MSVC_BIN;$env:PATH"
$env:CARGO_TARGET_DIR = $STABLE_TARGET_DIR
# Enabling Incremental again for speed; if Locks occur, the stable target dir usually helps
$env:CARGO_INCREMENTAL = "1" 

Set-Location $ENGINE_DIR

# 3. Execution
Write-Host "--- Initiating High-Performance Test Suite ---" -ForegroundColor Cyan
# Run all tests at once with default parallelism
cargo test $args

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed. If you encounter 'Access Denied' (os error 32), try running with --jobs 1" -ForegroundColor Yellow
}
