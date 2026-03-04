# Phase 0 - The Rust Pivot (Scalability Foundation)
- [x] Init Cargo workspace (`brinkmanship_engine`)
- [x] Draft ECS-Lite State architecture in Rust ([state.rs](file:///c:/Users/zephy/Documents/Brinkmanship/brinkmanship_engine/src/state.rs))
- [x] Deliver [migration_plan_rust.md](file:///C:/Users/zephy/.gemini/antigravity/brain/62d1a7c0-c33c-4c22-a2e9-e96acc9f6342/migration_plan_rust.md) for management review
- [x] Port [state_manager.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/state_manager.py) immutable logic to Rust (Traits & Structs)
- [x] Port [event_processor.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/event_processor.py) to Rust (Gaussian randomizers & Option parsing) [COMPLETE]
- [x] Sync [PRD_MASTER.md](file:///c:/Users/zephy/Documents/Brinkmanship/PRD_MASTER.md) and [migration_plan_rust.md](file:///C:/Users/zephy/.gemini/antigravity/brain/62d1a7c0-c33c-4c22-a2e9-e96acc9f6342/migration_plan_rust.md) with Management feedback
- [x] Implement Axum REST API bridge mirroring FastAPI endpoints [COMPLETE]
- [x] Deliver [LOCAL_TESTING_RUST.md](file:///C:/Users/zephy/.gemini/antigravity/brain/62d1a7c0-c33c-4c22-a2e9-e96acc9f6342/LOCAL_TESTING_RUST.md) (How to run the new backend) [COMPLETE]
- [/] Verify frontend React app connects flawlessly to Rust port (via [dev_rust.ps1](file:///c:/Users/zephy/Documents/Brinkmanship/dev_rust.ps1))

# Phase 1.5 - Independent System Audit
- [x] Code-to-PRD Sync: Add Bond Yields, Unemployment Rate, and Stock Market Index to [state_manager.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/state_manager.py)
- [x] DLC Hook Audit: Add 3 hooks for Insider Trading to [event_processor.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/event_processor.py)
- [x] Stress Test: Run 10-turn simulation with global_stability=15 and output CPI velocity table
- [x] Generate Audit Report artifact

# Phase 2 - The Diplomatic Ledger & Escalation
- [x] Create [engine/event_library.json](file:///c:/Users/zephy/Documents/Brinkmanship/engine/event_library.json) containing the China Embargo.
- [x] Add GFI logic (`global_fear_index`, `stock_market_volatility`, `leader_provocation`) to [engine/state_manager.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/state_manager.py).
- [x] Write `engine/diplomacy_manager.py` (Data structure for Global Actors).
- [x] Write `engine/escalation_manager.py` (Escalation Ladder mapping and state effects).
- [x] Connect [state_manager.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/state_manager.py) to call diplomacy and escalation updates.
- [x] Modify [engine/event_processor.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/event_processor.py) to check Escalation Level and pull from JSON.
- [x] Allow Transactional Disrupter trait to increase Player Provocation (+10 floor).
- [x] Write [tests/test_escalation.py](file:///c:/Users/zephy/Documents/Brinkmanship/tests/test_escalation.py) forcing GFI to 95 and verifying 'Active Sabotage'.
- [x] Write [tests/test_diplomacy.py](file:///c:/Users/zephy/Documents/Brinkmanship/tests/test_diplomacy.py) validation for China Electronics Embargo.
- [x] Verify UI rendering distinguishes between Internal News and Global Alerts.
- [x] Create [06_DIPLOMATIC_LEDGER.md](file:///c:/Users/zephy/Documents/Brinkmanship/Brinkmanship%20split/06_DIPLOMATIC_LEDGER.md) and update [PRD_MASTER.md](file:///c:/Users/zephy/Documents/Brinkmanship/PRD_MASTER.md) documentation.

# Phase 3 - High-Resolution Chronos Baseline
- [x] Create `Brinkmanship split/07_CHRONOS_CALENDAR.md` and append to PRD Master.
- [ ] Implement `current_date` (Jan 20, 2025) and daily tick loop in [state_manager.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/state_manager.py).
- [ ] Convert state values to floats and implement daily decay coefficients.
- [ ] Replace `approval` with `demographics` sub-dictionary for Worker/Elite/Ally splits.
- [ ] Replace `random.randint` with `random.gauss()` based on Volatility in [event_processor.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/event_processor.py).
- [ ] Update `ui/terminal_view.py` to format floats (2 decimal places) and date string.
- [ ] Run `test_high_res.py` 30-day simulation CSV verification test.

# Phase 0.5 - Verification & Cutover (Python Deprecation)
- [x] Rule Alignment: Verify all Rust changes against [AI_RULES.md](file:///c:/Users/zephy/Documents/Brinkmanship/AI_RULES.md)
- [x] PRD Sync: Update [PRD_MASTER.md](file:///c:/Users/zephy/Documents/Brinkmanship/PRD_MASTER.md) with Rust technical stack details
- [x] Verification: Run complete `cargo test` suite in clean environment
- [x] Cutover: Delete legacy Python simulation code (`engine/*.py`)
- [x] Final Dispatch: Deliver `SOVEREIGN_DISPATCH_v10.md` detailing successful cutover

# Phase 4 - The Functional Pivot (Generic Engine)
- [x] Create `/scenarios/` directories and skeleton configs.
- [x] Refactor `state_manager.py` to use an Immutable `State` dataclass and pure transition functions.
- [x] Refactor `event_processor.py` for Gaussian Noise & generic abstract metrics (`Chaos_Modifier`).
- [x] Update `main.py` state history `List[State]`.
- [x] Log all refactors to `CHANGELOG.md`.
- [x] Write `tests/test_immutable_state.py`.

# Phase 5 - The Sovereign Interface Refactor
- [x] Create `SCENARIO_CREATION_GUIDE.md` detailing how to build a custom theme.
- [x] Merge scenario `config.json` and `event_library.json` into a single `scenario.json`.
- [x] Initialize Next.js/Tailwind frontend in `/ui`.
- [x] Setup global aesthetic constraints (GAC) in Tailwind config (charcoal, slate, amber).
- [x] Create `SovereignLayout` with film-grain noise.
- [x] Build FastAPI bridge in `/api/main.py` serving immutable state and single-file scenarios.
- [x] Define React TypeScript `GameState` types.
- [x] Implement `react-simple-maps` Tactical Map.
- [x] Build Dossier Event Modal with Framer Motion.
- [x] Create SVG Oscilloscope component bound to Gaussian noise/volatility.
- [x] Log changes to `CHANGELOG.md`.

# Phase 6 - Visual Verification (Scuba)
- [x] Implement Playwright visual snapshot suite (`tests/test_visual.py`).
- [ ] Create "Visual Gold Standard" mockups using `generate_image` tool.
- [x] Sync visual testing requirements back to `AI_RULES.md`.
- [x] Final manual review of dashboard rendering.

# Phase 7 - Architectural Anchoring & Management Rhythm
- [x] Initialize `ARCHITECT_MANIFESTO.md` and `PROJECT_MANIFESTO.md` in root.
- [x] Rebrand `primary_metric_a` to "Global Stability" across configs.
- [x] Update `api/main.py` with `rewind` functionality and typed schemas.
- [x] Add `UI_Context` (Noir Filters) and audio-texture keys to `scenario.json`.
- [x] Deliver `SOVEREIGN_DISPATCH_v2.md` to Management.

# Phase 8 - Metric Expansion (Scarcity Index)
- [x] Add `metric_9` (Scarcity Index) to engine `State`.
- [x] Initialize `metric_9` in `api/main.py`.
- [x] Update all `scenario.json` files with "Scarcity Index" label.
- [x] Sync `PROJECT_MANIFESTO.md` with new metric layout.
- [x] Deliver `SOVEREIGN_DISPATCH_v3.md` to Management.

# Phase 9 - Geopolitical Mechanics & Narrative Fun
- [x] Implement "Metric Gameplay Encyclopedia" in `PROJECT_MANIFESTO.md`.
- [x] Update `SCENARIO_CREATION_GUIDE.md` with the "Narrative Weight" framework.
- [x] Verify `api/main.py` schema documentation for management review.
- [x] Deliver `SOVEREIGN_DISPATCH_v4.md` to Management.

# Phase 10 - Doctrine Preservation & Dev Continuity
- [x] Restore/Verify "How The Math Works" section in Guide.
- [x] Codify Section 9 (Preservation of Intellectual Capital) in `AI_RULES.md`.
- [x] Resolve PowerShell `npm` execution policy blockers.
- [x] Deliver `SOVEREIGN_DISPATCH_v5.md` to Management.

# Phase 11 - Environment & Tech Polish
- [x] Enable `uvicorn` hot-reloading for the API bridge.
- [x] Resolve React/Next.js hydration mismatches in `TacticalMap.tsx`.
- [x] Patch `GameStateSnapshot` schema completeness in `api/main.py`.
- [x] Deliver `dev.ps1` unified environment launcher.
- [x] Deliver `SOVEREIGN_DISPATCH_v6.md` to Management.

# Phase 13 - Immersion, Identity & Feedback
- [x] Fix event routing bug (hardcoded client events → API-driven from scenario.json)
- [x] Fix intel feed staleness (poll after actions, not just on timer)
- [x] Add autoplay (Chronos auto-tick) with spacebar pause
- [x] Add `/api/next_event` endpoint to serve phase-appropriate events from scenario
- [x] Create `player_profile` in scenario: country, leader name, stats, start date
- [x] Create `great_powers` relations block in scenario
- [x] Create `advisors` block in scenario with name, portrait, specialty
- [x] Build `PlayerIdentityBar` component (flag, name, date, stats)
- [x] Build `AdvisorBar` component (portrait cards with specialty labels)
- [x] Build `RelationsPanel` component (great powers list with approval bars)
- [x] Create `cold_war_1983` scenario (USA vs USSR, Cold War setting)
- [x] Expand option description detail to include predicted metric effects
- [x] Deliver `SOVEREIGN_DISPATCH_v8.md`

# Phase 14 - The Autonomous World Engine (EU4-Style)
- [x] UI: Add "Swap Scenario" button to demonstrate configuration power
- [x] API: Build `/api/load_scenario` endpoint to hot-swap JSONs
- [/] Backend: Design `ai_director.py` for 14 autonomous actors
- [ ] Framework: Map Ideology Axis (Authoritarian vs Libertarian)
- [ ] Overton Window: Design trigger variables for radical government shifts 
- [ ] Cold War 1983: Expand map data for all 14 global factions and sub-factions
- [ ] Internal Factions: Add "Labor Rebellions" & "Coup" triggers based on low approval 
- [ ] Finalize "Super-Demo" showing radical Overton shifts and AI-driven proxy wars

# Phase 15 - Economics & AI Parity logic
- [x] Deliver `task_economics_schema.md` (Pydantic models for Resources/Industry)
- [x] Deliver `implementation_plan_tutorial.md` (EU4-style tutorial logic)
- [x] Deliver `audit_report_ai_parity.md` (Scrutinize AI action parity)
- [x] Deliver `FUTURE_WORKS.md` (Strategic Roadmap with IDs)
- [x] Fix `build_app.ps1` dependency resolution (--legacy-peer-deps)
- [ ] Implement Resource/Industry state logic in `state_manager.py`
- [ ] Refactor `event_processor.py` to support "AI Parity" action dispatches
- [ ] Build "Sovereign Introduction" scenario JSON

# Phase 14.X - Active Development (The Autonomous World Engine)
- [ ] Implement `ai_director_stress.rs` to spawn 50 concurrent simulation actors.
- [ ] Execute the "Hyper-Tick" benchmark (365 days / 50 actors / O(1) cloning).
- [ ] Output `stress_test_v1.csv` for structural validation.
- [ ] Ideology Refactor: Add `IdeologyComponent` (Auth/Lib, Planned/Market, Overton) to `state.rs`.
- [ ] Reactor Refactor: Enable regional event deck aggregation (`events_global.json`, etc.).
- [ ] UI Refactor: Build `IdeologyCompass.tsx` in React (Fincher-Noir style).
- [ ] API Refactor: Implement `intel_feed` logic for lagged action resolution ("Chronos Sweep").
