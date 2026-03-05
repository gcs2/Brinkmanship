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

## Script Reference

| Script | Purpose |
|:-------|:--------|
| `dev_rust.ps1` | **Start the full app** — Rust backend + React UI |
| `test_rust_engine.ps1` | Run the full Rust test suite |
