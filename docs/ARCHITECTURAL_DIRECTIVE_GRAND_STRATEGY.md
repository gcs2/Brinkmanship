This is the precise architectural roadmap required to elevate *Brinkmanship* from an intriguing simulation to a AAA-quality Grand Strategy experience.

To achieve that highly elusive "fun" factor, the engine must pivot away from a static spreadsheet and toward a deeply reactive, interconnected world. The player needs to feel the friction of opposing forces. The environment must push back with the same level of ideological depth and unforgiving consequence found in the most complex, systemic RPGs. Furthermore, the economic layer must evolve beyond mere numbers to reflect the genuine, compounding risks of a real-world financial ecosystem.

---

# **ARCHITECTURAL DIRECTIVE: THE GRAND STRATEGY QUEUE**

**TO:** Antigravity (Principal Simulation Architect)
**FROM:** Executive Management
**SUBJECT:** Big-Picture Implementation & AAA Priority Queue — Phases 14–15 and Future Works

*Cross-Reference: `implementation_plan_phase15.md` (V15), `implementation_plan_phase16.md` (V16), `implementation_plan_phase17.md` (V17), `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`, `SOVEREIGN_DISPATCH_V16.md`, `SOVEREIGN_DISPATCH_V17.md`, `docs/FUTURE_WORKS.md`, `docs/METRIC_DEFINITIONS.md`*

Antigravity, we are initiating a massive expansion of the *Brinkmanship* engine. The objective is to build an autonomous, reactive world that provides a AAA-quality gameplay loop. The environment must be actively hostile, ideologically complex, and economically rigorous.

To accomplish this, you must understand the entire codebase as a series of interlocking dependencies. You cannot build the "Overton Window" without first establishing the "Ideology Matrix" in `state.rs`. You cannot simulate "Global Trade" without first implementing "Regional Event Decks." You cannot make Zone Gates meaningful (IDX-003) without first implementing the Rubber Band Effect (IDX-006) and Glacial Shift (IDX-007).

Below is the **Strict Priority Queue** for the upcoming development cycles. Execute these in order, ensuring each phase is perfectly integrated into the functional, immutable Rust ECS architecture before advancing.

---

### **PRIORITY TIER 1: THE REACTIVE FOUNDATION & LEGIBILITY**
*A game is only fun if the world is alive, and complex systems are only engaging if the player can read them.*

1. **[PHASE 14.1 / DIP-002] The AI Actor System (Autonomous Rivals):**
   - **Why:** The "Player vs. Spreadsheet" model is dead. Rivals must evaluate global state and queue autonomous actions.
   - **Implementation:** Great Powers need hidden "Drives" (Expansionist, Isolationist, Consolidationist). They must hit the same `reactor.rs` pipeline the player uses.
   - **Status:** Foundation laid with the ECS-Lite multi-entity schema (`state.rs` — Phase 14 complete). Full AI Director logic is next.

2. **[NAR-001] The Sovereign Introduction (Tutorial Engine):**
   - **Why:** *Management Mandate.* Highest-priority narrative task. Cannot introduce AI parity without teaching the player the mechanics — especially the Structural Matrix and Authority costs.
   - **Implementation:** Scripted, on-rails EU4-style scenario ("The Persian Gulf Crisis") exposing the user to the API backend, Action Latency, Ideology Compass, and Zone Gates.

---

### **PRIORITY TIER 2: IDEOLOGICAL DEPTH & REALPOLITIK (THE STRUCTURAL MATRIX)**
*Players engage with Grand Strategy for the fantasy of radical, consequential change. The political system must have deep ethical and physical consequences.*

> *Refer to `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md` for the full design treatise and `implementation_plan_phase15.md` for the Phase 15 execution plan.*

3. **[PHASE 15 / IDX-001 through IDX-005] The 11×11 Sovereign Grid (COMPLETED):**
   - **What was built:** The stateless `ideology_matrix.rs` module. Contains the full 121-label `FLAVOR_GRID`, `resolve_flavor_label()`, `euclidean_distance()`, `action_authority_cost()`, and `check_zone_gates()`. Seeded from `artifacts/Sovereign Flavor Matrix Explained.csv`.
   - **`state.rs` update:** `IdeologyComponent` now carries both `position` (sovereign's governing track record) and `center` (faction-derived Overton Window center) as distinct fields. `flavor_label: String` is updated from position each tick.
   - **Verified by:** `test_journey_three_actor_multipolar` (3 actors: USA, CHN, ARG archetypes). See `FUTURE_WORKS.md §VIII`.
   - **Mathematical foundation:** `Final_AUT_Cost = Base_Cost × (1.0 + dist(POS, action_pos) × FC)`. Default FC = 0.3. See `METRIC_DEFINITIONS.md §9`.

4. **[IDX-006] The Rubber Band Effect: ✅ Phase 16 Implemented. Phase 17: upgrading to exponential bleed:**
   - **Phase 16 delivery:** Implemented in `chronos.rs`. Linear bleed formula: `pull × AUTHORITY_BLEED_PER_UNIT`.
   - **Phase 17 hardening (IDX-015):** Bleed upgrades to `BLEED_BASE × e^(BLEED_EXPONENT × overshoot)`. At (±5.0) corner: ~50 AUT/tick drain. Extreme bleed stress test validates AUT = 0 in ≤20 ticks.

5. **[IDX-007] The Glacial Shift Mechanic: ✅ Phase 16 Implemented:**
   - **Status:** `GLACIAL_DRIFT_RATE = 0.01`, estate-momentum driven per-tick drift toward center. Confirmed via journey test tolerance adjustment.

6. **[PHASE 14.3 / REGIONAL] Country-Specific Disaster Decks (IDX-014 — Phase 17):**
   - **Why:** Zone gates are now *detected* but produce no consequences. Disaster counters must tick.
   - **Implementation (Phase 17):** Wire `check_zone_gates()` into `chronos.rs` tick loop. Active gate = per-tick counter increment. On threshold: catastrophic event fires (BureaucraticFamine, CapitalFlight, PlutocraticSecession).

---

### **PRIORITY TIER 3: THE MATERIAL STAKES (ECONOMIC RIGOR)**
*The economy must carry genuine market risk, reflecting real-world financial friction.*

7. **[ECO-001 & ECO-002] Industry, Resources, & Global Trade:**
   - **Why:** The "Scarcity Coefficient" needs a physical grounding in actual production nodes.
   - **Implementation:** Vector-based trade pathways. If a physical choke point is closed, dynamically recalculate price spikes across dependent tech and energy sectors.
   - **Matrix Interaction:** Economic position (X-Axis) affects production efficiency. Command economy actors get less market efficiency; Laissez-Faire actors get corporate instability risk.

8. **[ADV-001] Cyber-Economic Sabotage:**
   - **Why:** Gives the player offensive financial mechanics with ideological cost.
   - **Implementation:** "Shorting" a rival's currency carries a friction cost based on the ideological distance between actors' positions (`IDX-002`). Sabotage from an opponent ideologically opposite is both expensive and detectable.

---

### **PRIORITY TIER 4: THE SHADOW WARS & FORCE PROJECTION**
*End-game complexity where military and optics become tools of immense systemic pressure.*

9. **[POL-001 & POL-004] Optics, Social Media, & The Deep State:**
   - **Why:** Modern warfare is won in the perception filter. The sovereign's `flavor_label` (IDX-004) is the target of propaganda battles — rivals can try to shift your public's perception of your government type.
   - **Implementation:** Algorithmic influence mechanics. Separate the player's "Deep State" objectives from transient "Elected Administrations."

10. **[MIL-001 & MIL-003] Asset Management & The Nuclear Sprint:**
    - **Why:** High-maintenance, high-stakes kinetic power. Builds on the Sovereign Authority (AUT) currency.
    - **Implementation:** Track discrete military assets with heavy economic overhead. The $2T "Nuclear Sprint" is a massive multi-turn project that severely penalizes domestic infrastructure and moves the sovereign toward the Militarist Authority half of the Y-Axis.

---

### **PRIORITY TIER 2.5: PHASE 17 — UI MATERIALIZATION & LEGISLATIVE ENGINE**
*The physics exist. Now make the player feel them.*

11. **[UI Phase 17] IdeologyCompass.tsx — Phase 16 Surface:**
    - **What to build:** Breadcrumb Comet (10 fading `position_history` dots), Deep State Delta (hollow `perceived_position` ring + color-coded tension line), Dual Flavor Labels, `⚡ POLITICAL SHOCK` banner with framer-motion + CRT distortion.
    - **Wire via:** `page.tsx` extending the `/state` API fetch to source the new `IdeologyComponent` fields.

12. **[LEG-001] The Legislative Engine (Event Chain Framework):**
    - **Why:** Policy decisions need real mechanical consequences. The legislative loop is the core gameplay moment: *spend AUT + workshop bill → floor debate → outcome*.
    - **Structs:** `LegislationDef`, `LegislationPhase`, `LegislationChoice`, `LegislationOutcome` in `legislation.rs`.
    - **State integration:** `pending_legislation: Vec<LegislationDef>` + `legislation_log` on `State`.
    - **Outcomes:** Passed (approval boost, trade unlock, tax increase), Failed (Stability −, AUT drain), Pork-Barreled (guaranteed pass + permanent Scarcity Coefficient malus).

---

### **DEPENDENCY GRAPH**
```
IDX-001 (Grid) ──► IDX-002 (Friction) ──► IDX-006 (Rubber Band) ──► IDX-015 (Exp Bleed) ──► NAR-001 (Tutorial)
IDX-003 (Zones) ──► IDX-014 (Zone Consequences) ──────────────────────► DIP-002 (AI Rivals)
IDX-004 (Position) ─► IDX-005 (Flavor Label) ─► IDX-010 (Perception) ─► POL-004 (Deep State HUD)
IDX-011 (History) ─► UI Comet Trail ─► MODE-001/002 (Game Modes)
LEG-001 (Structs) ─► LEG-002 (Wonk) ─► LEG-003 (Whip) ─► LEG-004 (Pork) ─► LEG-005 (Outcomes)
ECO-001 (Industry) ──► ECO-002 (Trade) ──► ADV-001 (Sabotage)
MIL-001 (Assets) ──► MIL-003 (Nuclear) ──► GeoStratLayer
```

---

*Updated: SOVEREIGN_DISPATCH_V18 — 2026-03-04*

---

### **PRIORITY TIER 2.5 (ADDENDUM): PHASE 19 — THE FIXED CANVAS PIVOT**

*Ratified 2026-03-05 by Executive Management. Full guardrails: `SOVEREIGN_DISPATCH_V18.md §I`. Implementation: `implementation_plan_phase19.md`.*

13. **[UI19-001/002/003] Map as Permanent Background + Left/Right Sidebars:**
    - **Why:** A draggable map is a contradiction in terms. The Tactical Map IS the theater of operations. It anchors spatial awareness.
    - **Guardrail:** **Do not delete `react-rnd`.** The draggable window infrastructure is required in Phase 20 for floating "Deep Dive" panels (rival dossiers, treaty negotiation). Only the primary HUD elements move to fixed positions.
    - **Left sidebar** (300px): Identity → Country Profile (click-to-expand inline) → Ideology Compass
    - **Right sidebar** (300px): Telemetry → Estates (renamed) → Intel Feed. Estate rows show absolute value AND `±delta/tick`.

14. **[UI19-004/005] Centered Event Modal with Auto-Pause:**
    - **Why:** Players cannot process estate-impacting crisis choices while the world clock burns in the background.
    - **Implementation:** `DossierPane` converts to a centered `z-[1100]` modal. **On mount, it dispatches `pause_simulation`.** Option display order: Label (amber, large) → Description → EST impact → Lag.

---

### **PRIORITY TIER 1 (ADDENDUM): PHASE 20 — AI ACTORS & SYMMETRIC CONSTRAINTS**

*Management Directive: The Principle of Symmetric Constraints. `SOVEREIGN_DISPATCH_V18.md §II`.*

15. **[AI-001/002] The AI Actor Engine:**
    - **Mandate:** NPC actors are bound by the **identical** `ideology_matrix.rs` physics as the player. `action_authority_cost()` applies. Rubber Band pull applies. No exemptions.
    - **Implementation:** Each AI has a hidden `Drive` enum (`Expansionist`, `Isolationist`, `Consolidationist`). Drives gate action selection through the same `reactor.rs` pipeline. The AI walks in the same gravity before diplomacy is built.

16. **[AI-003] Ideological Diplomatic Friction:**
    - **Mandate:** Abolish arbitrary Opinion integers. Diplomatic baseline friction = `dist(actor_a.position, actor_b.position)` on the Structural Matrix.
    - **Formula:** `Diplomatic_AUT_Cost = Base_Treaty_Cost × (1.0 + dist × DC)`. Default `DC` (Diplomatic Coefficient) = management-tunable, recommend 0.5.
    - **Example:** Anarcho-Capitalist `(+5,−5)` vs. Vanguard Communist `(−5,+5)`: `dist ≈ 14.14`. No trade deal is cheap at max ideological distance.

17. **[AI-004] Event Chain State Machine Architecture:**
    - **Mandate:** Event choices inject *latent triggers* into `chronos.rs`, not immediate stat modifiers. A latent fires 10–15 ticks later, conditioned on the Sovereign's intervening actions. The world has memory.
    - **Foundation:** `event_chain.rs` structs (`LEG-001`) are already defined. Phase 20 wires them to the live tick loop.

---

### **DEPENDENCY GRAPH (UPDATED)**
```
IDX-001 (Grid) ──► IDX-002 (Friction) ──► IDX-006 (Rubber Band) ──► IDX-015 (Exp Bleed) ──► NAR-001 (Tutorial)
IDX-003 (Zones) ──► IDX-014 (Zone Consequences) ──────────────────────► AI-001 (AI Actors)
IDX-004 (Position) ─► IDX-005 (Flavor Label) ─► IDX-010 (Perception) ─► POL-004 (Deep State HUD)
IDX-011 (History) ─► UI Comet Trail ─► MODE-001/002 (Game Modes)
LEG-001 (Structs) ─► LEG-002 (Wonk) ─► LEG-003 (Whip) ─► LEG-004 (Pork) ─► LEG-005 (Outcomes)
                   └──────────────────────────────────────────────────────► AI-004 (Latent Triggers)
ECO-001 (Industry) ──► ECO-002 (Trade) ──► ADV-001 (Sabotage)
MIL-001 (Assets) ──► MIL-003 (Nuclear) ──► GeoStratLayer
AI-001 (Symmetric) ──► AI-003 (Dipl. Friction) ──► AI-005 (Intel) ──► AI-006 (UN Conferences)
UI19-001 (Map BG) ──► UI19-002 (Left Sidebar) ──► UI19-003 (Right Sidebar) ──► UI19-004 (Event Modal)
```

---

*"The transition to a 'Living Simulation' requires a coherent onboarding and narrative structure anchored in systemic physics, not just branching narrative."* — Executive Management

*Updated: SOVEREIGN_DISPATCH_V18 — 2026-03-05 (Phase 19 ratified, Phase 20 AI mandate issued)*
