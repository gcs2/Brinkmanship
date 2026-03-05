# scripts/

Dev scripts and utilities for the Brinkmanship project.

| Script | Purpose |
|:-------|:--------|
| `dev_rust.ps1` | Primary dev server — starts the Rust Axum backend with auto-reload |
| `dev.ps1` | Starts the full stack (backend + UI) |
| `dev.bat` | Windows batch wrapper for `dev.ps1` |
| `build_app.ps1` | Production build script |
| `test_rust_engine.ps1` | Runs the Rust engine test suite |
| `merge_scenarios.py` | Utility: merge scenario JSON files |
| `update_assets.py` | Utility: update game asset manifests |
| `stress_test.py` | Python-based stress test (legacy — Rust version in `brinkmanship_engine/tests/`) |
| `main.py` | Legacy Python entry point |
| `replace_sourdough.py` | One-off data migration utility |

> **Note:** `dev_rust.ps1` is the canonical dev entrypoint for engine development.
> Run it from the **project root** (`./scripts/dev_rust.ps1`).
