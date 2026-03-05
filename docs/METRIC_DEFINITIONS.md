# Brinkmanship: Metric Definitions & Simulation Logic

This document serves as the **absolute single source of truth** for all simulation metrics.
No ad-hoc definitions are permitted in code. Every coefficient must trace back here.

> **Rule 11 (AI_RULES.md) — Semantic Integrity:** Any code modifying simulation metrics
> (`state.rs`, `chronos.rs`, `reactor.rs`, `ideology_matrix.rs`) MUST align with the definitions
> below. If a new metric is introduced, **update this document first**.

---

## 1. Political Stability (STB)
- **Definition**: The internal coherence of the state and its monopoly on violence.
- **Range**: `[0.0, 100.0]`
- **Mechanics**:
    - **Unrest Factor**: Low stability increases the probability of "Protest" and "Civil War" events.
    - **Estate Interaction**: Stability dynamically impacts Estate Happiness and Influence. High stability favors institutionalized estates; low stability favors disruptive or revolutionary estates.
    - **Authority Generation**: Consistent high stability provides a passive bonus to Authority generation.

---

## 2. Executive Approval (APP)
- **Definition**: The perceived legitimacy of the current administration.
- **Range**: `[0.0, 100.0]`
- **Mechanics**:
    - **Derivation**: Calculated as a **weighted average of Estate Happiness**, where weights are determined by each estate's current Influence.
    - `APP = Σ(estate.happiness × estate.influence) / Σ(estate.influence)`
    - **Authority Contribution**: High approval increases the rate of Authority accumulation.
    - **Fallback**: If no Estate data is present, APP = average of the three demographic sentiments (working\_class, elites, state\_security).

---

## 3. Sovereign Authority (AUT)
- **Definition**: The finite political capital required to execute unilateral executive actions.
- **Range**: No hard cap; accumulated per tick, spent on actions.
- **Mechanics**:
    - **Currency**: Authority is spent on Decrees, Crackdowns, Radical Reforms.
    - **Generation Formula per tick**:
      `AUT_gained = (generation_rate + (APP/100 × 2.0) + (STB/100 × 1.0)) × Π(modifiers)`
    - **Modifiers**: Leader trait coefficients (e.g., "Narcissistic Leader" boosts generation 1.25×).
    - **Friction Spending**: See §9 (Ideological Friction).

---

## 4. The Overton Window (OVW)
- **Definition**: The range of policies currently acceptable to mainstream political discourse.
- **Mechanics**:
    - **Center `(OW_X, OW_Y)`**: Weighted Mean of all Faction alignments.
      `OW_X = Σ(faction.alignment.x × faction.influence) / Σ(faction.influence)`
    - **Spread (`OW_σ`)**: Weighted Population Standard Deviation of Faction alignments.
      `OW_σ = √(Σ(dist²(faction.alignment, OW_center) × faction.influence) / Σ(faction.influence))`
      Floored at `0.05` to prevent collapse to a singularity.
    - **Polarization**: A high Spread indicates a divided society. A low Spread = ideological consensus.
    - **Gating**: Actions outside the Spread carry higher AUT cost and Estate Happiness penalties.

---

## 5. Estates (Interest Groups — Hard Power)
- **Definition**: Structural power centers with material leverage over the state (e.g., Elites, Unions, Military, State Security).
- **Attributes**:
    - **Influence `[0.0, 100.0]`**: Their percentage share of structural power (conceptually Zero-Sum).
    - **Happiness `[0.0, 100.0]`**: Satisfaction with current policies. Low happiness drives down global Approval.
- **Role**: Estates define **Stability** and **Approval** (Hard Power).

---

## 6. Factions (Political Movements — Soft Power)
- **Definition**: Ideological movements competing to define the national narrative (e.g., MAGA, Progressives, Neoliberals, Peronists).
- **Attributes**:
    - **Influence `[0.0, 100.0]`**: Share of the cultural/political conversation.
    - **Alignment `(f64, f64)`**: Position on the 2D Structural Matrix (`econ_x ∈ [-5,+5]`, `auth_y ∈ [-5,+5]`).
- **Role**: Factions define the **Overton Window** (Soft Power).

---

## 7. The Sovereign Grid Position (POS)
- **Definition**: The sovereign's actual governing position on the **11×11 Structural Matrix**, based on their enacted policy record.
- **Format**: `(econ_x: f64, auth_y: f64)` where `econ_x ∈ [-5, +5]` and `auth_y ∈ [-5, +5]`.
- **Axes**:
    - **X-Axis (Economic)**: `-5` (Command Economy) → `+5` (Commodified / Full Privatization)
    - **Y-Axis (Authority)**: `-5` (Stateless / Anarchism) → `+5` (Totalitarian)
- **Distinction from Overton Center**: The Position is *where the sovereign governs*; the OVW Center is *where their factions pull*. These can diverge.
- **Cross-Ref**: See `implementation_plan_phase15.md` (V15) and `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md` for the full 11×11 grid design.

---

## 8. Ideological Tension (IT)
- **Definition**: The Euclidean distance between the sovereign's governing Position and the Overton Window Center.
- **Formula**: `IT = √((POS_x - OW_X)² + (POS_y - OW_Y)²)`
- **Mechanics**:
    - High IT means the sovereign is governing against their own public narrative. This increases risk of instability, estate rebellion, or faction backlash events.
    - IT is implicitly used in action cost calculations (§9).
- **Implementation**: `ideology_matrix::euclidean_distance(position, center)`

---

## 9. Ideological Friction & Action Authority Cost
- **Definition**: The AUT premium paid when an action is ideologically distant from the sovereign's current Position.
- **Formula (V15 Dispatch §IV — The Calculus of Authority)**:
  `Final_AUT_Cost = Base_Cost × (1.0 + euclidean_distance(POS, action_target_pos) × friction_coefficient)`
- **Default Friction Coefficient (FC)**: `0.3` (per action; overridable by action definition)
- **Intuition**:
    - Distance 1 → 1.3× multiplier
    - Distance 3 → 1.9× multiplier (e.g., USA enacting UBI)
    - Distance 7.07 (corner to corner) → ~3.1× multiplier
- **Overflow Mechanic**: If the sovereign cannot afford the AUT cost, the deficit is paid in **Stability loss**, simulating the institutional damage of forcing unnatural policy.
- **Implementation**: `ideology_matrix::action_authority_cost(base, current_pos, action_pos, fc)`
- **Cross-Ref**: See `implementation_plan_phase15.md` (V15 Implementation Plan).

---

## 10. Flavor Label (FL)
- **Definition**: The human-readable political archetype for a given grid coordinate.
- **Resolution**: Rounded to nearest integer in `[-5, +5]`, then looked up in the 121-cell `FLAVOR_GRID`.
- **Examples**: `(0,0)` → *Liberalism*, `(-5,+5)` → *Stalinism*, `(+5,-5)` → *Anarcho-Capitalism*, `(-1,0)` → *Rhine Capitalism*.
- **UI Role**: Displayed as the sovereign's live "Government Title" on the HUD. Changes as policies shift the Position.
- **Implementation**: `ideology_matrix::resolve_flavor_label(econ_x, auth_y)`
- **Source Data**: `artifacts/Sovereign Flavor Matrix Explained.csv`
- **Cross-Ref**: See `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`.

---

## 11. Zone Gates (ZG)
- **Definition**: Systemic unlocks and disaster risks that activate when the sovereign's Position enters a specific zone of the Structural Matrix.
- **Active Zones**:

| Zone Name | Condition | Unlock | Disaster Risk |
|:---|:---|:---|:---|
| Totalitarian Planned | `econ_x < -3` AND `auth_y > +3` | Five-Year Plan | Bureaucratic Famine |
| Decentralized Laissez-Faire | `econ_x > +3` AND `auth_y < -1` | Corporate Sovereign Zones | Plutocratic Secession |
| Illiberal Directed | `econ_x ∈ [-3, 0]` AND `auth_y ∈ [+1, +3]` | State Champion Subsidies | Capital Flight |

- **Implementation**: `ideology_matrix::check_zone_gates(position)`
- **Cross-Ref**: See `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`, Section III.
