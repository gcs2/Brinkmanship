# **FUTURE WORKS: THE GRAND STRATEGY EXPANSION**

This document serves as the **Future Works Strategic Backlog** for the **Brinkmanship** project. It outlines the architectural expansion from a functional state engine into a comprehensive geopolitical simulation.

All items cross-reference `implementation_plan_phase15.md` (V15), `implementation_plan_phase16.md` (V16), `implementation_plan_phase17.md` (V17), `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`, `SOVEREIGN_DISPATCH_V16.md`, and `SOVEREIGN_DISPATCH_V17.md` where applicable.

---

## **I. MATERIAL & ECONOMIC ENGINE (METRIC_ECO)**

| ID | Feature | Description |
|:---|:---|:---|
| **ECO-001** | **Industry & Resource Layer** | Tracking of major sectors (Tech, Energy, Consumer Goods) and strategic resources (Oil, LNG, Rare Earths, Semiconductors). Scarcity Coefficient becomes a derivative of this supply chain, not an abstract integer. |
| **ECO-002** | **Global Trade System** | A vector-based pathway system where trade is physical. Pathways are routes on the tactical map. |
| **ECO-003** | **Trade Path Blocking** | Blocking a "Trade Pathway" (e.g., the Strait of Hormuz) triggers immediate price spikes in dependent industries across all actors. |
| **ECO-004** | **Production Hubs** | Regional industrial capacity determines the speed of asset generation (Military or Infrastructure). Ties into `MIL-001`. |

> **Context**: The "Scarcity Coefficient" transitions from an abstract slider to a derivative of high-fidelity supply chain state.

---

## **II. KINETIC & RESEARCH CAPABILITY (METRIC_MIL)**

| ID | Feature | Description |
|:---|:---|:---|
| **MIL-001** | **Asset Management** | Tracking of discrete military units (Carrier Strike Groups, ICBM Silos, Cyber-Warfare Divisions). Each carries a maintenance overhead. |
| **MIL-002** | **The R&D Pipeline** | Researching tech across defense, healthcare, and infrastructure. State Champion Subsidies (`IDX-003`) accelerate specific sectors. |
| **MIL-003** | **Nuclear Sprint** | Managing the "Underlying Mistake" risk. Choosing between "Nuclear Insurance Policy" and social infrastructure is an existential Authority spend. |
| **MIL-004** | **Resilience Tech** | Researching metrics to reduce the impact of biological "Black Swan" events or cyber-attacks. |

> **Context**: Reframing military power not as a stat, but as a "Force Projection" capability with compounding maintenance overhead.

---

## **III. PERCEPTION & POLITICAL CONTROL (METRIC_POL)**

| ID | Feature | Description |
|:---|:---|:---|
| **POL-001** | **Optics & Social Media** | Algorithmic influence over the populace. High "Optics" allow the sovereign to sustain higher volatility without triggering estate rebellions. |
| **POL-002** | **The Approval Loop** | Managing domestic factions. Faction approval collapse results in a "Succession Crisis" or "Election Shift." Directly tied to `IDX` mechanics. |
| **POL-003** | **Politician Mode** | Direct control over charisma, speeches, and public optics. Rival politicians compete to unseat you via the Approval and Authority systems. |
| **POL-004** | **Deep State Mode** | Playing as the permanent bureaucracy. Administrations change via the Election Algorithm, while the player's sovereign position on the Structural Matrix persists. |

---

## **IV. CLANDESTINE & DIPLOMATIC SHADOWS (METRIC_DIP)**

| ID | Feature | Description |
|:---|:---|:---|
| **DIP-001** | **Spying & Intel** | Implementing "Targets of Opportunity." Investing in intel to decrease decision latency and reveal rival sovereign positions on the matrix. |
| **DIP-002** | **AI Parity** | Rival sovereign actors take autonomous actions, managing their own Stability, Approval, and Position on the Structural Matrix. Foundation: `implementation_plan_phase15.md`. |
| **DIP-003** | **UN Conferences** | High-stakes diplomatic events where rivals can be sanctioned or co-opted. Outcome gated by each actor's current Authority reserve and Structural Matrix position. |

---

## **V. NARRATIVE & ONBOARDING (METRIC_NAR)**

| ID | Feature | Description |
|:---|:---|:---|
| **NAR-001** | **Sovereign Introduction** | A realistic, high-fidelity scripted tutorial (e.g., "The Persian Gulf Crisis") that exposes the player to the API, action latency, Ideology Compass, and the Structural Matrix grid. |
| **NAR-002** | **EU4-Style Scenarios** | Discrete narrative choices with long-term "Flag" consequences. Scenario outcomes shift the sovereign's position on the Structural Matrix. |
| **NAR-003** | **Campaign Mode** | Mission-based progression with a coherent narrative arc (e.g., "The Rise of a Superpower"). Each mission constrains the player's viable Structural Matrix positions. |

---

## **VI. EXPLORATORY FRONTIERS (METRIC_ADV)**

| ID | Feature | Description |
|:---|:---|:---|
| **ADV-001** | **Cyber-Economic Sabotage** | Ability to "Short" a rival's currency using your `Economic_Influence`. Cost amplified by ideological distance (`IDX-002` friction). |
| **ADV-002** | **Proxy Shadows** | Funding non-state actors or insurgents to shift a rival's faction influence, indirectly pulling their Overton Window without declaring war. |
| **ADV-003** | **Continuity of Government** | A "Bunker" mechanic where players manage the state in a post-collapse/nuclear environment. Structural Matrix position determines rebuilding options. |

---

## **VII. THE STRUCTURAL MATRIX ENGINE (METRIC_IDX)**

*This is the V15 architectural mandate. Refer to `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`
and `implementation_plan_phase15.md` for the full design treatise.*

| ID | Feature | Description | Status |
|:---|:---|:---|:---|
| **IDX-001** | **11×11 Sovereign Grid** | 121-label political archetype lookup table. | ✅ **Implemented** |
| **IDX-002** | **Ideological Friction Physics** | `Final_AUT_Cost = Base_Cost × (1.0 + dist × FC)`. Default FC = 0.3. | ✅ **Implemented** |
| **IDX-003** | **Zone-Specific Systemic Gates** | Three active zones unlock Decisions and Disaster Risk counters. | ✅ **Implemented** |
| **IDX-004** | **Dual Coordinate System** | `position` vs `center` — gap is Ideological Tension. | ✅ **Implemented** |
| **IDX-005** | **Dynamic HUD Title (Flavor Label)** | `flavor_label: String` drives live government title in HUD. | ✅ **Implemented** |
| **IDX-006** | **Rubber Band Effect** | Per-tick gravitational pull toward Overton center; AUT bleed when outside Spread. **Phase 17:** upgrading to exponential bleed formula. | ✅ **Phase 16** / 🔴 **Phase 17 hardening** |
| **IDX-007** | **Glacial Shift Mechanic** | Per-tick position drift toward center proportional to estate momentum. | ✅ **Phase 16** |
| **IDX-008** | **Multi-Actor Matrix Test** | 3-actor journey test (USA/CHN/ARG). | ✅ **Implemented** |
| **IDX-009** | **Estate Velocity Memory** | Shock detection at >1.5 units/tick. `position_velocity` field. UI: `⚡ POLITICAL SHOCK` banner. | ✅ **Phase 16** / 🔴 **Phase 17 UI surface** |
| **IDX-010** | **Perception Filter (Deep State Delta)** | `perceived_position` vs `position`. `VEIL_COLLAPSE_THRESHOLD = 3.5`. Veil Shatters: Stability −20. UI: hollow ring + tension line. | ✅ **Phase 16** / 🔴 **Phase 17 UI surface** |
| **IDX-011** | **Position Breadcrumb Trail** | `position_history: Vec<(f64,f64)>` ring buffer (last 10). UI: fading comet trail on IdeologyCompass. | ✅ **Phase 16** / 🔴 **Phase 17 UI surface** |
| **IDX-012** | **ScenarioDef Rust Struct** | `scenario.rs`: panic-at-boot validation of position bounds, influence sums. | ✅ **Phase 16** |
| **IDX-013** | **Temporal Simulation Harness** | 10-tick headless loop journey test: USA Radicalization scenario. | ✅ **Phase 16** |
| **IDX-014** | **Zone Gate Consequences** | Wire `check_zone_gates()` into chronos tick loop. Deliver per-tick bonuses and disaster triggers for active gates (not just detection). | 🔴 **Phase 17** |
| **IDX-015** | **Exponential AUT Bleed (IDX-006 Hardening)** | Change bleed from linear (`pull × 3.0`) to exponential (`BLEED_BASE × e^(BLEED_EXPONENT × overshoot)`). At corner position (±5.0): bleed ~50 AUT/tick. Stress test: AUT drains to 0 in ≤20 ticks. | 🔴 **Phase 17 Priority 1** |

> [!IMPORTANT]
> **Management Directive (V16 — APPROVED 2026-03-04)**: IDX-006 through IDX-013 are Phase 16. The Rubber Band must be a **gravitational pull vector**, not a hard teleport. Estate Velocity Memory (IDX-009) and the Perception Filter (IDX-010) are new management-injected mechanics. The Temporal Simulation Harness (IDX-013) is the capstone test and primary difficulty-balance tool. Ref: `SOVEREIGN_DISPATCH_V16.md §I–VII`.

> [!IMPORTANT]
> **Management Directive (V18 — APPROVED 2026-03-04)**: IDX-015 (Exponential Bleed) is the Phase 17 Priority 1 hardening. IDX-014 (Zone Gate Consequences) unlocks the disaster deck. UI surface (IDX-009/010/011 visual layer) is Priority 2. NAR-001 (Persian Gulf Crisis JSON scenario) is Priority 3. The Legislative Engine (`legislation.rs`) is Priority 4. Ref: `SOVEREIGN_DISPATCH_V18.md`.

---

## **VIII. THE 3-ACTOR MULTI-POLAR INTEGRATION TEST (TEST-15)**

*Refer to `implementation_plan_phase15.md` for the full test design and actor archetypes.*

This integration test (`test_journey_three_actor_multipolar`) acts as a **living regression benchmark** for the political simulation math layer. It must pass after every engine change.

**Three Archetypes Under Test:**

| Actor | Starting Position | Flavor Label | Dominant Dynamic |
|:------|:------------------|:-------------|:-----------------|
| `USA` | `(+1, 0)` | Liberal Democracy | Centrist Neoliberal — Moderate friction on progressive reforms |
| `CHN` | `(-2, +3)` | National Synergy | Illiberal Directed — High approval from Party estates, Capital Flight risk |
| `ARG` | `(-1, +1)` | Third Way | Volatile Populist — Worker-dominated estates, low happiness → approval crisis |

> **Scope clarity (per V16):** This test validates simulation *math* across simultaneous actors. Cross-actor behavioral dynamics (diplomacy, faction contagion) require `DIP-002` and the AI Director.

---

### **MANAGEMENT DIRECTIVE**

Priority order for all future development:

1. **IDX-015** (Exponential AUT Bleed) — physics hardening of IDX-006 Rubber Band.
2. **UI Surface** (IDX-009/010/011 visual layer) — make the physics *visible* to the player.
3. **NAR-001** (Persian Gulf Crisis Scenario) — canonical regression testbed.
4. **IDX-014** (Zone Gate Consequences) — disaster deck activation.
5. **LEG-001** (Legislative Engine) — event chain minigame framework.
6. **DIP-002** (AI Parity) — only after IDX-006 hardened; AI must walk in the gravity before it's built.

*Verbatim (V15/V16/V18): "Every click has a mathematical weight defined by this 121-point matrix. Make the player feel the weight of the system."*

---

## **IX. THE LEGISLATIVE ENGINE (METRIC_LEG)**

*Per V18 Management Dispatch: legislation is a minigame event chain with real mechanical consequences. Ref: `implementation_plan_phase17.md §Priority 4`.*

| ID | Feature | Description | Status |
|:---|:---|:---|:---|
| **LEG-001** | **LegislationDef Struct** | `legislation.rs`: `LegislationDef` (id, name, ideological_coordinate, base_aut_cost, phases). Each bill is an event chain with player choices that adjust pass probability. | 🔴 **Phase 17** |
| **LEG-002** | **Wonk Workshop** | Before proposing a bill, player assigns Political Advisors. Advisors spend AUT to shift bill's ideological coordinate toward Overton Window, reducing final friction cost. | 🔴 **Phase 17** |
| **LEG-003** | **Congressional Whip Counts** | Bills enter a "Floor Debate" phase. Congress divided into factions via Estate distributions. Player lobbies factions to build a majority. | 🔴 **Phase 18** |
| **LEG-004** | **Pork-Barrel Mechanics** | If bill is stuck, player can attach Pork: guaranteed passage but permanent negative modifier to Scarcity Coefficient or treasury drain. Teaches real-world omnibus bill dynamics. | 🔴 **Phase 18** |
| **LEG-005** | **Outcome Consequences** | Passed bills deliver lasting mechanical effects: approval boost, increased taxation, trade route unlock, government ownership of resources. Failed bills: Stability loss, AUT drain. | 🔴 **Phase 17–18** |

> **Design Principle (user-directed)**: The legislative system is a framework for *event chains in general*. Any policy, crisis, or diplomatic maneuver can be expressed as a `LegislationDef`. Player decisions shift pass probability; the fundamental loop is *spend resources → affect probability → reap or suffer outcome*.

---

## **X. GAME MODES (METRIC_MODE)**

*Per V18 Management Directive: structure UI and State for eventual two-mode support. Ref: `SOVEREIGN_DISPATCH_V18.md §III`.*

| ID | Mode | Description | Status |
|:---|:---|:---|:---|
| **MODE-001** | **Deep State Mode** | Player IS the permanent bureaucracy. Elections are "weather events" — Overton Window shifts violently; player spends AUT to drag new admin back. Lose condition: Stability = 0, Civil War, default. | 🔴 **Architecture phase** |
| **MODE-002** | **Politician Mode (Ironman)** | Player IS the administration. Strict 4/8-year electoral clock. `perceived_flavor_label` must align with median voter by Election Tick. Lose condition: APP below threshold on Election Day. | 🔴 **Architecture phase** |

---

## **XI. DIFFICULTY SYSTEM (METRIC_DIFF)**

*Deferred from V18 Priority 1 per management decision. Exponential AUT bleed is better expressed as a difficulty setting than a hard physics change.*

| ID | Feature | Description | Status |
|:---|:---|:---|:---|
| **DIFF-001** | **Exponential AUT Bleed (Hard Mode)** | Replaces linear bleed formula (`pull × AUTHORITY_BLEED_PER_UNIT`) with `BLEED_BASE × e^(BLEED_EXPONENT × overshoot)`. At ±5.0 corner: ~50 AUT/tick drain. Normal Mode keeps linear. Hard Mode exposes tuneable `BLEED_BASE` (default 3.0) and `BLEED_EXPONENT` (default 0.7) config knobs. | 🔵 **Deferred — Phase 17+** |
| **DIFF-002** | **Difficulty Runtime Flag** | `difficulty_mode: DifficultyMode` enum on `State` (`Normal`, `Hard`, `Ironman`). `Ironman` = Hard Mode physics + Politician Mode game mode. | 🔴 **Phase 18** |

> [!NOTE]
> **V18 Rationale (2026-03-04):** Exponential bleed penalizes "tanking" the Overton rubber band at moderate positions (0.5–2.0 overshoot). Management deferred this to keep the Normal Mode simulation approachable. Hard Mode will surface the formula as a difficulty knob without breaking the default experience.

---

## **XII. UI CONTENT — IDEOLOGY CELL DESCRIPTIONS (UI-GRID)**

*Requested 2026-03-04. Each of the ~30 named ideology zones should carry a brief (1–2 sentence) "flavor description" shown on hover in the `IdeologyGrid` fullscreen view. Stand by for content delivery.*

| ID | Feature | Description | Status |
|:---|:---|:---|:---|
| **UI-GRID-001** | **Ideology Cell Flavor Descriptions** | Brief 1–2 sentence description for each named ideology zone (Fascism, Stalinism, Anarcho-Capitalism, Social Democracy, etc.) shown in the `IdeologyGrid` hover tooltip beneath the label and coordinates. Content to be supplied by management. | 🔵 **Deferred — awaiting content** |
| **UI-GRID-002** | **Faction Heatmap Overlay** | Color-tint each cell by current faction lean (weighted average of active `faction.alignment` positions). Darker = stronger faction pull in that zone. Requires `/api/state` to expose faction position data. | 🔴 **Phase 19** |
