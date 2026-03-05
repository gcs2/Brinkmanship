# scripts/

Dev scripts for the Brinkmanship Rust engine + React UI.

---

## ▶️ HOW TO RUN THE APP

**One command from the project root:**

```powershell
./scripts/dev_rust.ps1
```

This will:
1. Kill any stale `brinkmanship_engine` or `node` processes
2. Open a **new PowerShell window** → Rust/Axum backend at **`http://localhost:8000`**
3. Launch the **React/Next.js frontend** in the current terminal → **`http://localhost:3000`**

Open your browser to **[http://localhost:3000](http://localhost:3000)**.

---

## Running Tests

```powershell
cargo test --manifest-path brinkmanship_engine/Cargo.toml
```

---

## Visual Testing (AI_RULES.md Rule 3 — Visual Audits)

Visual tests use **Playwright** with screenshot diffing. The baseline PNGs live in `ui/tests/visual.spec.ts-snapshots/`.

### Regression Check (detect unintended changes)
```powershell
cd ui
npm run test:visual
```
Compares each screenshot against the stored baseline. Fails if any diff exceeds `maxDiffPixelRatio`.

### Accept New Baselines (after intentional UI changes)
```powershell
cd ui
npm run test:visual:update
```
Re-runs all tests and **overwrites** the baseline PNGs with the new screenshots. Commit the updated PNGs to git to lock in the new baseline.

### Interactive Playwright UI (manual inspection)
```powershell
cd ui
npm run test:visual:ui
```
Opens the Playwright trace viewer — lets you step through each test, see screenshots, and debug selector failures.

> **Workflow:** Make a UI change → run `test:visual` → if diff is intentional, run `test:visual:update` → commit updated baselines + code change together, so the diff is tracked in git history.

---

## Script Reference

| Script | Purpose |
|:-------|:--------|
| `dev_rust.ps1` | **Start the full app** — Rust backend + React UI |
| `test_rust_engine.ps1` | Run the full Rust test suite |
