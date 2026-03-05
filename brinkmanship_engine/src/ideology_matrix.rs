/// # ideology_matrix.rs — The Structural Matrix Engine
///
/// This module implements the 11×11 Sovereign Grid from SOVEREIGN_DISPATCH_V15.
/// It is a **pure, stateless utility module with zero side effects**, designed
/// to be called from `chronos.rs`, `reactor.rs`, and integration tests alike.
///
/// ## The Axes
/// - **X-Axis (Economic)**: `-5` (Command) to `+5` (Commodified)
/// - **Y-Axis (Authority)**: `-5` (Stateless) to `+5` (Totalitarian)
///
/// ## Key Exported Functions
/// - [`resolve_flavor_label`]: Maps `(econ_x, auth_y)` → flavor string (e.g., "Liberalism")
/// - [`euclidean_distance`]: 2D distance between two ideological coordinates
/// - [`action_authority_cost`]: Friction-adjusted AUT cost for an action
/// - [`check_zone_gates`]: Returns active systemic gates for a position
///
/// ## Cross-Reference
/// See `implementation_plan_phase15.md` (V15 Implementation Plan) and
/// `artifacts/SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md` for the full
/// design treatise, formulas, and zone definitions.

// ────────────────────────────────────────────────────────────────────────────
// STATIC FLAVOR GRID
// Rows: auth_y from +5 (Totalitarian) to -5 (Stateless) — 11 rows
// Cols: econ_x from -5 (Command) to +5 (Commodified) — 11 cols
// Source: artifacts/Sovereign Flavor Matrix Explained.csv
// ────────────────────────────────────────────────────────────────────────────
const FLAVOR_GRID: [[&str; 11]; 11] = [
    // econ: -5       -4                  -3                 -2              -1                   0                 +1                   +2                    +3                      +4                 +5
    // auth_y = +5 (Totalitarian)
    ["Stalinism", "Maoism", "State Capitalism", "War Economy", "Command Socialism", "Garrison State", "Corporate Dirigisme", "Stratocracy", "Cyberpunk Autocracy", "Techno-Feudalism", "Corporate Dystopia"],
    // auth_y = +4 (Autocratic)
    ["Juche", "Command Administration", "State Champions", "Dirigisme", "Neo-Statism", "One-Party State", "Market Authoritarianism", "Crony Capitalism", "Plutocracy", "Oligarchic Capitalism", "Private Tyranny"],
    // auth_y = +3 (Oligarchic)
    ["Politburo Rule", "Nomenklatura", "Developmentalism", "National Synergy", "Social Corporatism", "Corporatism", "Paternalism", "Clientelism", "Plutocratic Republic", "Cartel State", "Anarcho-Capitalist State"],
    // auth_y = +2 (Illiberal)
    ["People's Republic", "State-Led Development", "Guided Economy", "Welfare Statism", "Managed Democracy", "Illiberal Democracy", "Soft Autocracy", "Neoliberalism", "Market Populism", "Private Statehood", "Proprietary Rule"],
    // auth_y = +1 (Executive)
    ["National Command", "Central Bureaucracy", "Industrial Policy", "New Dealism", "Third Way", "Executive Republic", "Liberal Democracy", "Neoliberalism", "Hyper-Privatization", "Contractualism", "Market Hegemony"],
    // auth_y = 0 (Constitutional)
    ["Council Republic", "Planned Democracy", "Social Democracy", "Welfare State", "Rhine Capitalism", "Liberalism", "Market Democracy", "Laissez-Faire Republic", "Market Constitutionalism", "Galt's Gulch", "Contract State"],
    // auth_y = -1 (Decentralized)
    ["Idealized Soviet", "Local Planning", "Guild Socialism", "Distributism", "Social Liberalism", "Federalism", "Minarchism", "Polycentric Law", "Voluntarism", "Free Banking", "Market Anarchy"],
    // auth_y = -2 (Minimalist)
    ["Minarchist Commune", "Syndicalism", "Mutualism", "Georgism", "Civil Society", "Classical Liberalism", "Night-Watchman State", "Agorism", "Panarchism", "Private Law Society", "Contract Society"],
    // auth_y = -3 (Watchman)
    ["Communitarianism", "Cooperative Federation", "Left-Agorism", "Market Socialism", "Libertarianism", "Minarchism", "Watchman State", "Anarcho-Capitalism Lite", "Voluntarism", "Private Cities", "Market Order"],
    // auth_y = -4 (Autonomous)
    ["Autonomous Zone", "Collective", "Communes", "Cooperative Federation", "Mutualism", "Free Territory", "Autonomy", "Agorist Cell", "Voluntarism", "Privatism", "Anarcho-Capitalism"],
    // auth_y = -5 (Stateless)
    ["Pure Communism", "Gift Economy", "Left-Anarchism", "Collectivism", "Distributism", "Anarchism", "Individualism", "Agorism", "Voluntarism", "Market Anarchism", "Anarcho-Capitalism"],
];

// ────────────────────────────────────────────────────────────────────────────
// ZONE GATE SYSTEM
// ────────────────────────────────────────────────────────────────────────────

/// Active systemic gates unlocked (or at-risk) based on grid position.
///
/// Each zone corresponds to a V15 design directive. Refer to
/// `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`, Section III for details.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ZoneGate {
    /// **Unlock** — Five-Year Plan: Massive industrial output boost.
    /// Zone: Totalitarian Planned (econ_x < -3, auth_y > +3)
    FiveYearPlan,

    /// **Disaster Risk** — Bureaucratic Famine: Every tick in this zone
    /// increments a hidden counter. On trigger, demographics collapse.
    /// Zone: Totalitarian Planned (econ_x < -3, auth_y > +3)
    BureaucraticFamine,

    /// **Unlock** — Corporate Sovereign Zones: Mega-corps self-fund infrastructure.
    /// Trade-off: reduces direct Political Control.
    /// Zone: Decentralized Laissez-Faire (econ_x > +3, auth_y < -1)
    CorporateSovereignZone,

    /// **Disaster Risk** — Plutocratic Secession: Corporate estates may fracture
    /// and declare independence, splitting the nation on the tactical map.
    /// Zone: Decentralized Laissez-Faire (econ_x > +3, auth_y < -1)
    PlutocraticSecession,

    /// **Unlock** — State Champion Subsidies: Direct sovereign wealth into a
    /// tech sector, gaining artificial R&D advantage.
    /// Zone: Illiberal Directed (econ_x: -3 to 0, auth_y: +1 to +3)
    StateChampionSubsidy,

    /// **Disaster Risk** — Capital Flight: Elite estates move wealth offshore.
    /// Must expend Authority each turn to plug leaks.
    /// Zone: Illiberal Directed (econ_x: -3 to 0, auth_y: +1 to +3)
    CapitalFlight,
}

// ────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────────────────────────────────

/// Resolves the ideological flavor label for a given `(econ_x, auth_y)` coordinate.
///
/// Clamps and rounds float inputs to the valid integer range `[-5, +5]` before lookup.
///
/// # Examples
/// ```
/// use brinkmanship_engine::ideology_matrix::resolve_flavor_label;
/// assert_eq!(resolve_flavor_label(0.0, 0.0), "Liberalism");
/// assert_eq!(resolve_flavor_label(-5.0, 5.0), "Stalinism");
/// assert_eq!(resolve_flavor_label(5.0, -5.0), "Anarcho-Capitalism");
/// assert_eq!(resolve_flavor_label(1.0, 0.0), "Market Democracy");
/// ```
pub fn resolve_flavor_label(econ_x: f64, auth_y: f64) -> &'static str {
    // Round to nearest integer and clamp to [-5, +5]
    let x = econ_x.round().clamp(-5.0, 5.0) as i32;
    let y = auth_y.round().clamp(-5.0, 5.0) as i32;

    // Convert to 0-indexed array positions
    // auth_y: +5 is row 0, -5 is row 10
    let row = (5 - y) as usize;
    // econ_x: -5 is col 0, +5 is col 10
    let col = (x + 5) as usize;

    FLAVOR_GRID[row][col]
}

/// Computes the Euclidean distance between two 2D ideological coordinates.
///
/// Used in the friction physics formula. Coordinates are on the `[-5, +5]` scale.
///
/// # Examples
/// ```
/// use brinkmanship_engine::ideology_matrix::euclidean_distance;
/// assert_eq!(euclidean_distance((0.0, 0.0), (3.0, 4.0)), 5.0);
/// assert_eq!(euclidean_distance((1.0, 0.0), (1.0, 0.0)), 0.0);
/// ```
pub fn euclidean_distance(a: (f64, f64), b: (f64, f64)) -> f64 {
    ((a.0 - b.0).powi(2) + (a.1 - b.1).powi(2)).sqrt()
}

/// Computes the friction-adjusted Authority (AUT) cost for an action.
///
/// # Formula (V15 Dispatch, Section IV — The Calculus of Authority)
/// ```text
/// Final_Cost = Base_Cost * (1.0 + euclidean_distance(current_pos, action_pos) * friction_coefficient)
/// ```
///
/// The `friction_coefficient` is a per-action constant (default `0.3`).
/// A coefficient of `0.3` means:
/// - Distance 1 → 1.3× multiplier
/// - Distance 3 → 1.9× multiplier  
/// - Distance 7.07 (corner to corner) → ~3.1× multiplier
///
/// If the action is aligned with the current position (distance ≈ 0), cost = base_cost.
///
/// # Examples
/// ```
/// use brinkmanship_engine::ideology_matrix::action_authority_cost;
/// // UBI at distance 3 from current position, FC = 0.3
/// let cost = action_authority_cost(100.0, (1.0, 0.0), (-2.0, 0.0), 0.3);
/// assert!((cost - 190.0).abs() < 0.01);
/// ```
pub fn action_authority_cost(
    base_cost: f64,
    current_pos: (f64, f64),
    action_pos: (f64, f64),
    friction_coefficient: f64,
) -> f64 {
    let dist = euclidean_distance(current_pos, action_pos);
    base_cost * (1.0 + dist * friction_coefficient)
}

/// Returns the list of active `ZoneGate`s for the given grid position.
///
/// A position can activate multiple gates simultaneously. Results should be
/// stored and re-evaluated each tick as the position shifts.
///
/// Refer to `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`, Section III
/// for the full zone definitions and disaster mechanics.
///
/// # Examples
/// ```
/// use brinkmanship_engine::ideology_matrix::{check_zone_gates, ZoneGate};
/// let gates = check_zone_gates((-4.0, 4.0));
/// assert!(gates.contains(&ZoneGate::FiveYearPlan));
/// assert!(gates.contains(&ZoneGate::BureaucraticFamine));
/// ```
pub fn check_zone_gates(pos: (f64, f64)) -> Vec<ZoneGate> {
    let (x, y) = pos;
    let mut gates = Vec::new();

    // Zone 1: Totalitarian Planned (econ_x < -3, auth_y > +3)
    if x < -3.0 && y > 3.0 {
        gates.push(ZoneGate::FiveYearPlan);
        gates.push(ZoneGate::BureaucraticFamine);
    }

    // Zone 2: Decentralized Laissez-Faire (econ_x > +3, auth_y < -1)
    if x > 3.0 && y < -1.0 {
        gates.push(ZoneGate::CorporateSovereignZone);
        gates.push(ZoneGate::PlutocraticSecession);
    }

    // Zone 3: Illiberal Directed (econ_x: -3 to 0, auth_y: +1 to +3)
    if x >= -3.0 && x <= 0.0 && y >= 1.0 && y <= 3.0 {
        gates.push(ZoneGate::StateChampionSubsidy);
        gates.push(ZoneGate::CapitalFlight);
    }

    gates
}

// ────────────────────────────────────────────────────────────────────────────
// PHASE 16: PERCEPTION FILTER
// ────────────────────────────────────────────────────────────────────────────

/// Maximum allowable Euclidean gap between the sovereign's real `position` and
/// their publicly `perceived_position` before the Veil Shatters.
///
/// If `euclidean_distance(position, perceived_position) > VEIL_COLLAPSE_THRESHOLD`,
/// `perception_maintenance_cost()` returns `None` — the engine fires a Veil Shatter event.
///
/// Cross-ref: `docs/METRIC_DEFINITIONS.md §13`
pub const VEIL_COLLAPSE_THRESHOLD: f64 = 3.5;

/// Computes the per-tick Authority cost to maintain a Perception Filter.
///
/// The further the sovereign's real position is from their publicly projected
/// position, the higher the Authority drain per tick.
///
/// # Returns
/// - `Some(cost)` — The AUT cost to sustain the projection this tick.
/// - `None` — The gap exceeds `VEIL_COLLAPSE_THRESHOLD`: the Veil Shatters.
///             The caller (chronos.rs) must fire the Stability collapse event.
///
/// # Formula
/// `cost = base_cost * euclidean_distance(real_pos, perceived_pos) * 0.5`
///
/// # Examples
/// ```
/// use brinkmanship_engine::ideology_matrix::{perception_maintenance_cost, VEIL_COLLAPSE_THRESHOLD};
///
/// // Small gap: affordable maintenance
/// let cost = perception_maintenance_cost((1.0, 0.0), (0.0, 0.0), 10.0);
/// assert!(cost.is_some());
///
/// // Gap below threshold
/// let cost = perception_maintenance_cost((0.0, 0.0), (3.4, 0.0), 10.0);
/// assert!(cost.is_some());
///
/// // Gap at/above threshold: Veil Shatters
/// let cost = perception_maintenance_cost((0.0, 0.0), (4.0, 0.0), 10.0);
/// assert!(cost.is_none());
/// ```
pub fn perception_maintenance_cost(
    real_pos: (f64, f64),
    perceived_pos: (f64, f64),
    base_cost: f64,
) -> Option<f64> {
    let gap = euclidean_distance(real_pos, perceived_pos);
    if gap > VEIL_COLLAPSE_THRESHOLD {
        None // Veil Shatters — caller must fire stability collapse
    } else {
        Some(base_cost * gap * 0.5)
    }
}

// ────────────────────────────────────────────────────────────────────────────
// UNIT TESTS
// ────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    // ── Flavor Label Tests ─────────────────────────────────────────────────
    #[test]
    fn test_label_center_is_liberalism() {
        assert_eq!(resolve_flavor_label(0.0, 0.0), "Liberalism");
    }

    #[test]
    fn test_label_totalitarian_command_is_stalinism() {
        assert_eq!(resolve_flavor_label(-5.0, 5.0), "Stalinism");
    }

    #[test]
    fn test_label_stateless_commodified_is_anarcho_capitalism() {
        assert_eq!(resolve_flavor_label(5.0, -5.0), "Anarcho-Capitalism");
    }

    #[test]
    fn test_label_market_democracy() {
        assert_eq!(resolve_flavor_label(1.0, 0.0), "Market Democracy");
    }

    #[test]
    fn test_label_social_democracy() {
        assert_eq!(resolve_flavor_label(-2.0, 0.0), "Welfare State");
    }

    #[test]
    fn test_label_clamps_out_of_range() {
        // Values beyond [-5, +5] should clamp gracefully
        assert_eq!(resolve_flavor_label(-99.0, 99.0), "Stalinism");
        assert_eq!(resolve_flavor_label(99.0, -99.0), "Anarcho-Capitalism");
    }

    #[test]
    fn test_label_rounds_floats() {
        // 0.4 rounds to 0, 0.6 rounds to 1
        assert_eq!(resolve_flavor_label(0.4, 0.0), "Liberalism");
        assert_eq!(resolve_flavor_label(0.6, 0.0), "Market Democracy");
    }

    #[test]
    fn test_label_maoism() {
        assert_eq!(resolve_flavor_label(-4.0, 5.0), "Maoism");
    }

    #[test]
    fn test_label_rhine_capitalism() {
        assert_eq!(resolve_flavor_label(-1.0, 0.0), "Rhine Capitalism");
    }

    // ── Euclidean Distance Tests ───────────────────────────────────────────
    #[test]
    fn test_distance_pythagorean_triplet() {
        assert!((euclidean_distance((0.0, 0.0), (3.0, 4.0)) - 5.0).abs() < 1e-9);
    }

    #[test]
    fn test_distance_zero_same_point() {
        assert_eq!(euclidean_distance((2.0, -1.0), (2.0, -1.0)), 0.0);
    }

    #[test]
    fn test_distance_axis_aligned() {
        assert!((euclidean_distance((0.0, 0.0), (3.0, 0.0)) - 3.0).abs() < 1e-9);
    }

    #[test]
    fn test_distance_corner_to_corner_is_max() {
        // From (-5, -5) to (+5, +5): sqrt(200) ≈ 14.14
        let d = euclidean_distance((-5.0, -5.0), (5.0, 5.0));
        assert!((d - (200.0_f64).sqrt()).abs() < 1e-9);
    }

    // ── Authority Cost Tests ───────────────────────────────────────────────
    #[test]
    fn test_authority_cost_no_friction() {
        // Same position: cost = base * 1.0
        let cost = action_authority_cost(100.0, (0.0, 0.0), (0.0, 0.0), 0.3);
        assert!((cost - 100.0).abs() < 1e-9);
    }

    #[test]
    fn test_authority_cost_distance_3() {
        // USA at (+1, 0) enacting UBI (target: -2, 0). Distance = 3.
        let cost = action_authority_cost(100.0, (1.0, 0.0), (-2.0, 0.0), 0.3);
        assert!((cost - 190.0).abs() < 0.01);
    }

    #[test]
    fn test_authority_cost_distance_5() {
        // Distance 3-4-5 triplet. Base = 200, FC = 0.5
        let cost = action_authority_cost(200.0, (0.0, 0.0), (3.0, 4.0), 0.5);
        // = 200 * (1 + 5 * 0.5) = 200 * 3.5 = 700
        assert!((cost - 700.0).abs() < 0.01);
    }

    #[test]
    fn test_authority_cost_increases_with_distance() {
        let cost_near = action_authority_cost(100.0, (0.0, 0.0), (1.0, 0.0), 0.3);
        let cost_far = action_authority_cost(100.0, (0.0, 0.0), (4.0, 0.0), 0.3);
        assert!(cost_far > cost_near);
    }

    // ── Zone Gate Tests ────────────────────────────────────────────────────
    #[test]
    fn test_zone_totalitarian_planned() {
        let gates = check_zone_gates((-4.0, 4.0));
        assert!(gates.contains(&ZoneGate::FiveYearPlan));
        assert!(gates.contains(&ZoneGate::BureaucraticFamine));
        assert!(!gates.contains(&ZoneGate::CorporateSovereignZone));
    }

    #[test]
    fn test_zone_decentralized_laissez_faire() {
        let gates = check_zone_gates((4.0, -2.0));
        assert!(gates.contains(&ZoneGate::CorporateSovereignZone));
        assert!(gates.contains(&ZoneGate::PlutocraticSecession));
        assert!(!gates.contains(&ZoneGate::FiveYearPlan));
    }

    #[test]
    fn test_zone_illiberal_directed() {
        let gates = check_zone_gates((-2.0, 2.0));
        assert!(gates.contains(&ZoneGate::StateChampionSubsidy));
        assert!(gates.contains(&ZoneGate::CapitalFlight));
    }

    #[test]
    fn test_zone_center_has_no_gates() {
        let gates = check_zone_gates((0.0, 0.0));
        assert!(gates.is_empty());
    }

    #[test]
    fn test_zone_boundary_exclusion() {
        // Exactly at the boundary: econ_x == -3, auth_y > 3 → should NOT be "Totalitarian Planned"
        let gates = check_zone_gates((-3.0, 4.0));
        // Zone 1 requires x < -3 (strict), x == -3 is Zone 3 boundary
        assert!(!gates.contains(&ZoneGate::FiveYearPlan));
        // However, it IS in the Illiberal/Directed zone (-3 to 0, 1 to +3)
        // auth_y = 4 > 3, so NOT in zone 3 either
        assert!(!gates.contains(&ZoneGate::StateChampionSubsidy));
    }

    // ── Phase 16: Perception Filter Tests ─────────────────────────────────
    #[test]
    fn test_perception_cost_zero_gap() {
        // Same real and perceived position: maintenance cost should be 0.0
        let cost = perception_maintenance_cost((0.0, 0.0), (0.0, 0.0), 10.0);
        assert_eq!(cost, Some(0.0));
    }

    #[test]
    fn test_perception_cost_small_gap() {
        // Real = (1, 0), Perceived = (0, 0): gap = 1.0, cost = 10 * 1.0 * 0.5 = 5.0
        let cost = perception_maintenance_cost((1.0, 0.0), (0.0, 0.0), 10.0);
        assert!(cost.is_some());
        assert!((cost.unwrap() - 5.0).abs() < 0.001);
    }

    #[test]
    fn test_perception_cost_below_threshold() {
        // Gap = 3.4 (just below VEIL_COLLAPSE_THRESHOLD = 3.5): should return Some
        let cost = perception_maintenance_cost((0.0, 0.0), (3.4, 0.0), 10.0);
        assert!(cost.is_some(), "Gap below threshold should not shatter veil");
    }

    #[test]
    fn test_perception_cost_exactly_at_threshold_ok() {
        // Gap = 3.5 is NOT above threshold (strict >), should still return Some
        let cost = perception_maintenance_cost((0.0, 0.0), (3.5, 0.0), 10.0);
        assert!(cost.is_some(), "Gap at exactly threshold should not shatter veil");
    }

    #[test]
    fn test_perception_cost_above_threshold_shatters_veil() {
        // Gap = 4.0 > 3.5: Veil Shatters, returns None
        let cost = perception_maintenance_cost((0.0, 0.0), (4.0, 0.0), 10.0);
        assert!(cost.is_none(), "Gap above threshold must trigger Veil Shatter (None)");
    }

    #[test]
    fn test_perception_cost_corner_to_corner_shatters() {
        // Maximum possible gap on the grid: ~14.14. Always shatters.
        let cost = perception_maintenance_cost((-5.0, -5.0), (5.0, 5.0), 10.0);
        assert!(cost.is_none(), "Corner-to-corner gap must always shatter veil");
    }

    #[test]
    fn test_perception_cost_scales_with_base_cost() {
        // Gap = 1.0, cost should = base_cost * 1.0 * 0.5
        let cost_10 = perception_maintenance_cost((1.0, 0.0), (0.0, 0.0), 10.0).unwrap();
        let cost_20 = perception_maintenance_cost((1.0, 0.0), (0.0, 0.0), 20.0).unwrap();
        assert!((cost_20 - cost_10 * 2.0).abs() < 0.001);
    }
}
