# **FUTURE WORKS: THE GRAND STRATEGY EXPANSION**

This document serves as the **Future Works Strategic Backlog** for the **Brinkmanship** project. It outlines the architectural expansion from a functional state engine into a comprehensive geopolitical simulation.

All items cross-reference `implementation_plan_phase15.md` (V15 Implementation Plan) and `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md` where applicable.

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
| **IDX-001** | **11×11 Sovereign Grid** | 121-label political archetype lookup table. Each `(econ_x, auth_y)` coordinate resolves to a flavor label (e.g., "Liberalism", "Stalinism"). Seeded from `artifacts/Sovereign Flavor Matrix Explained.csv`. | ✅ **Implemented** in `ideology_matrix.rs` |
| **IDX-002** | **Ideological Friction Physics** | `Final_AUT_Cost = Base_Cost × (1.0 + dist(current_pos, action_pos) × friction_coeff)`. Ensures radical policy changes carry massive Authority premiums. Default FC = 0.3. | ✅ **Implemented** in `ideology_matrix::action_authority_cost()` |
| **IDX-003** | **Zone-Specific Systemic Gates** | Three active zones (Totalitarian Planned, Decentralized Laissez-Faire, Illiberal Directed) each unlock a Decision and activate a Disaster Risk counter. | ✅ **Implemented** in `ideology_matrix::check_zone_gates()` |
| **IDX-004** | **Dual Coordinate System** | `position` (sovereign's policy track record) is distinct from `center` (Overton Window). The gap is **Ideological Tension** — a risk multiplier. | ✅ **Implemented** in `state::IdeologyComponent` |
| **IDX-005** | **Dynamic HUD Title (Flavor Label)** | The sovereign's current grid label (stored as `flavor_label: String`) drives the live government title in the HUD. Changes automatically as policies shift position. | ✅ **Implemented** in `state::IdeologyComponent::flavor_label` |
| **IDX-006** | **Rubber Band Effect** | If a sovereign forces a position jump beyond the Overton Spread, a Chaos Modifier spikes, degrading Stability. If STB falls too far, Estates rebel, snapping the position back. | 🔲 Pending — Reactor integration |
| **IDX-007** | **Glacial Shift Mechanic** | Position only moves when underlying Estates shift their influence. Direct single-turn jumps across zones are mechanically prohibited without massive AUT/STB sacrifice. | 🔲 Pending — Chronos integration |
| **IDX-008** | **Multi-Actor Matrix Test** | Integration test with 3 sovereign actors (e.g., USA/CHN/ARG archetypes), each with independent factions, estates, and matrix positions. Validates all IDX mechanics end-to-end. | ✅ **Implemented** in `tests/journey_tests.rs` |

> [!IMPORTANT]
> **Management Directive (V15)**: IDX-006 (Rubber Band) and IDX-007 (Glacial Shift) are the next highest-priority engine items. Without them, the sovereign position is a label, not a constraint system. These must be implemented before the Tutorial (NAR-001) is scripted.

---

## **VIII. THE 3-ACTOR MULTI-POLAR INTEGRATION TEST (TEST-15)**

*Refer to `implementation_plan_phase15.md` for the full test design and actor archetypes.*

This integration test (`test_journey_three_actor_multipolar`) acts as a **living regression benchmark** for the entire political simulation layer. It must pass after every engine change.

**Three Archetypes Under Test:**

| Actor | Starting Position | Flavor Label | Dominant Dynamic |
|:------|:------------------|:-------------|:-----------------|
| `USA` | `(+1, 0)` | Liberal Democracy | Centrist Neoliberal — Moderate friction on progressive reforms |
| `CHN` | `(-2, +3)` | National Synergy | Illiberal Directed — High approval from Party estates, Capital Flight risk |
| `ARG` | `(-1, +1)` | Third Way | Volatile Populist — Worker-dominated estates, low happiness → approval crisis |

---

### **MANAGEMENT DIRECTIVE**

All future development must prioritize:
1. **NAR-001 (The Tutorial)** to ensure all IDX functionality is accessible and legible to the end-user.
2. **IDX-006 & IDX-007** (Rubber Band + Glacial Shift) to make the Structural Matrix a genuine constraint system, not just a label.
3. **DIP-002 (AI Parity)** — Rival actors must autonomously navigate the matrix.

*Verbatim Reference (V15): "This structural framework guarantees that Brinkmanship is a simulation of systemic physics, not just a branching narrative. Every click has a mathematical weight defined by this 121-point matrix."*
