/// # Journey Tests — Multi-Actor Political Simulation
///
/// These integration tests validate the end-to-end behavior of the political
/// simulation layer including estate-driven approval, faction-derived Overton
/// Windows, ideological friction physics, and zone gating.
///
/// ## Cross-Reference
/// - `implementation_plan_phase15.md` (V15 Implementation Plan)
/// - `SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`
/// - `docs/METRIC_DEFINITIONS.md`
///
/// ## Test Inventory
/// - `test_journey_populist_surge`: Single-actor, tests Overton shift and approval.
/// - `test_journey_three_actor_multipolar`: Three actors on the 2D matrix — USA, CHN, ARG archetypes.
/// - `test_journey_ideology_matrix_labels`: Pure unit-level integration of flavor label lookup.
/// - `test_journey_ideological_friction_cost`: Validates authority cost formula across actors.
/// - `test_journey_zone_gate_activation`: Verifies CHN position triggers Illiberal Directed gates.

use brinkmanship_engine::state::{
    State, MetricsComponent, Faction, Estate, AuthorityComponent, SystemComponent, IdeologyComponent,
};
use brinkmanship_engine::chronos::Chronos;
use brinkmanship_engine::ideology_matrix::{
    resolve_flavor_label, euclidean_distance, action_authority_cost, check_zone_gates, ZoneGate,
};
use im::HashMap;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

fn make_faction(influence: f64, econ_x: f64, auth_y: f64) -> Faction {
    Faction { name: String::new(), influence, alignment: (econ_x, auth_y) }
}

fn make_estate(influence: f64, happiness: f64) -> Estate {
    Estate { name: String::new(), influence, happiness }
}

fn make_authority(current: f64) -> AuthorityComponent {
    AuthorityComponent { current, generation_rate: 1.0, modifiers: HashMap::new() }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Populist Surge (Phase 14 regression test)
// ─────────────────────────────────────────────────────────────────────────────

/// Validates: Faction-weighted Overton Window shift & Estate-driven approval.
///
/// Scenario: A stable technocracy held together by an 80% Establishment faction
/// sees a Populist surge. The Overton Window center shifts leftward and the
/// spread (polarization index) widens.
#[test]
fn test_journey_populist_surge() {
    let chronos = Chronos;

    let mut metrics = HashMap::new();
    metrics.insert("PLAYER".to_string(), MetricsComponent {
        stability: 80.0, executive_approval: 50.0, ..Default::default()
    });

    let mut factions = HashMap::new();
    let mut p_factions = HashMap::new();
    p_factions.insert("Establishment".to_string(), make_faction(80.0, 0.0, 0.0));   // Dead center
    p_factions.insert("Populists".to_string(), make_faction(20.0, -0.8, 0.5));      // Left-Auth
    factions.insert("PLAYER".to_string(), p_factions);

    let mut estates = HashMap::new();
    let mut p_estates = HashMap::new();
    p_estates.insert("Elites".to_string(), make_estate(70.0, 80.0));
    p_estates.insert("Workers".to_string(), make_estate(30.0, 40.0));
    estates.insert("PLAYER".to_string(), p_estates);

    let mut authority = HashMap::new();
    authority.insert("PLAYER".to_string(), make_authority(10.0));

    let mut system_states = HashMap::new();
    system_states.insert("PLAYER".to_string(), SystemComponent::default());

    let state = State {
        turn_id: 0, current_date: "2026-03-01".to_string(), active_phase: 1,
        metrics, demographics: HashMap::new(), ideology: HashMap::new(),
        estates, factions, authority, system_states,
        industry: HashMap::new(), diplomatic_ledgers: HashMap::new(),
        pending_actions: Vec::new(), action_logs: Vec::new(),
        intel_feed: Vec::new(), volatility_history: Vec::new(),
    };

    // Tick 1: derive Overton Window
    let state_t1 = chronos.tick(&state);
    let ideology_t1 = state_t1.ideology.get("PLAYER").expect("ideology must be derived");

    // Center X = (0.8 × 0.0) + (0.2 × -0.8) = -0.16
    assert!((ideology_t1.center.0 - (-0.16)).abs() < 0.01,
        "Expected center.0 ≈ -0.16, got {}", ideology_t1.center.0);

    // Apply Populist Surge: flip influence 40/60
    let mut state_t2 = state_t1.clone();
    state_t2.factions = state_t2.factions.alter(|f| {
        let mut f = f.unwrap();
        f.get_mut("Establishment").unwrap().influence = 40.0;
        f.get_mut("Populists").unwrap().influence = 60.0;
        Some(f)
    }, "PLAYER".to_string());

    let state_t3 = chronos.tick(&state_t2);
    let ideology_t3 = state_t3.ideology.get("PLAYER").unwrap();

    // Center X = (0.4 × 0.0) + (0.6 × -0.8) = -0.48
    assert!((ideology_t3.center.0 - (-0.48)).abs() < 0.01,
        "Expected center.0 ≈ -0.48, got {}", ideology_t3.center.0);

    // Spread must increase (more polarization)
    assert!(ideology_t3.spread > ideology_t1.spread,
        "Spread should increase after surge. t1={}, t3={}", ideology_t1.spread, ideology_t3.spread);

    // Approval: (0.7 × 80) + (0.3 × 40) = 56 + 12 = 68
    let approval = state_t3.metrics.get("PLAYER").unwrap().executive_approval;
    assert!(approval >= 68.0, "Expected approval ≥ 68.0, got {approval}");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Three-Actor Multi-Polar Matrix Test (Phase 15 core test)
// ─────────────────────────────────────────────────────────────────────────────

/// Validates: 3 independent sovereign actors each maintain their own Overton Window,
/// approval trajectory, and structural matrix position — simultaneously, on the
/// same shared `State` object. Tests Zone Gate activation for CHN archetype.
///
/// Actors (abstract archetypes — not real-world claims):
///
/// | Actor | Position    | Flavor Label       | Dominant tension |
/// |-------|------------|-------------------|-----------------|
/// | USA   | (+1, 0)    | Liberal Democracy  | centrist friction |
/// | CHN   | (-2, +3)   | National Synergy   | capital flight risk, high approval |
/// | ARG   | (-1, +1)   | Third Way          | low worker happiness → approval crisis |
///
/// Cross-ref: `implementation_plan_phase15.md` (V15 Plan), §Multi-Polar Test Design
#[test]
fn test_journey_three_actor_multipolar() {
    let chronos = Chronos;

    // ── Actor Setup ────────────────────────────────────────────────────────
    // USA archetype: Liberal Democracy (+1, 0)
    // Factions: Establishment-leaning centrist majority with progressive minority
    let mut usa_factions = HashMap::new();
    usa_factions.insert("Establishment".to_string(), make_faction(65.0, 1.0, 0.0));   // Market-Constitutional
    usa_factions.insert("Progressives".to_string(), make_faction(35.0, -1.0, 0.0));   // Social-Market

    // USA Estates: corporatist majority, labor minority
    let mut usa_estates = HashMap::new();
    usa_estates.insert("Corporate".to_string(), make_estate(60.0, 75.0));
    usa_estates.insert("Labor".to_string(), make_estate(40.0, 55.0));

    // CHN archetype: National Synergy (-2, +3)
    // Factions: Party Cadre dominates; small Entrepreneur faction
    let mut chn_factions = HashMap::new();
    chn_factions.insert("PartyCadre".to_string(), make_faction(80.0, -2.0, 3.0));    // Oligarchic Interventionist
    chn_factions.insert("Entrepreneurs".to_string(), make_faction(20.0, 1.0, 1.0));  // Exec. Market-Leaning

    // CHN Estates: state security dominates; workers secondary
    let mut chn_estates = HashMap::new();
    chn_estates.insert("StateSec".to_string(), make_estate(70.0, 85.0));  // Happy under order
    chn_estates.insert("Workers".to_string(), make_estate(30.0, 55.0));

    // ARG archetype: Third Way (-1, +1)
    // Factions: Populist Peronist faction narrowly leads; Liberals in opposition
    let mut arg_factions = HashMap::new();
    arg_factions.insert("Peronists".to_string(), make_faction(55.0, -1.5, 1.5));   // Left-Executive
    arg_factions.insert("Liberals".to_string(), make_faction(45.0, 0.5, -0.5));    // Centrist-Decentralized

    // ARG Estates: workers dominate with LOW happiness (economic crisis)
    let mut arg_estates = HashMap::new();
    arg_estates.insert("Workers".to_string(), make_estate(80.0, 30.0));  // Crisis-level unhappiness
    arg_estates.insert("Elites".to_string(), make_estate(20.0, 60.0));

    // ── Global State Assembly ──────────────────────────────────────────────
    let mut metrics = HashMap::new();
    metrics.insert("USA".to_string(), MetricsComponent { stability: 75.0, executive_approval: 60.0, ..Default::default() });
    metrics.insert("CHN".to_string(), MetricsComponent { stability: 82.0, executive_approval: 70.0, ..Default::default() });
    metrics.insert("ARG".to_string(), MetricsComponent { stability: 55.0, executive_approval: 40.0, ..Default::default() });

    let mut factions = HashMap::new();
    factions.insert("USA".to_string(), usa_factions);
    factions.insert("CHN".to_string(), chn_factions);
    factions.insert("ARG".to_string(), arg_factions);

    let mut estates = HashMap::new();
    estates.insert("USA".to_string(), usa_estates);
    estates.insert("CHN".to_string(), chn_estates);
    estates.insert("ARG".to_string(), arg_estates);

    let mut authority = HashMap::new();
    authority.insert("USA".to_string(), make_authority(50.0));
    authority.insert("CHN".to_string(), make_authority(80.0));
    authority.insert("ARG".to_string(), make_authority(20.0));

    let mut system_states = HashMap::new();
    system_states.insert("USA".to_string(), SystemComponent::default());
    system_states.insert("CHN".to_string(), SystemComponent::default());
    system_states.insert("ARG".to_string(), SystemComponent::default());

    let mut ideology = HashMap::new();
    ideology.insert("USA".to_string(), IdeologyComponent { position: (1.0, 0.0), flavor_label: "Liberal Democracy".to_string(), ..Default::default() });
    ideology.insert("CHN".to_string(), IdeologyComponent { position: (-2.0, 3.0), flavor_label: "National Synergy".to_string(), ..Default::default() });
    ideology.insert("ARG".to_string(), IdeologyComponent { position: (-1.0, 1.0), flavor_label: "Third Way".to_string(), ..Default::default() });

    let state = State {
        turn_id: 0, current_date: "2026-01-20".to_string(), active_phase: 1,
        metrics, demographics: HashMap::new(), ideology,
        estates, factions, authority, system_states,
        industry: HashMap::new(), diplomatic_ledgers: HashMap::new(),
        pending_actions: Vec::new(), action_logs: Vec::new(),
        intel_feed: Vec::new(), volatility_history: Vec::new(),
    };

    let state_t1 = chronos.tick(&state);

    // ── ASSERTION A: Three Independent Overton Windows ─────────────────────
    let usa_ide = state_t1.ideology.get("USA").expect("USA ideology must be derived");
    let chn_ide = state_t1.ideology.get("CHN").expect("CHN ideology must be derived");
    let arg_ide = state_t1.ideology.get("ARG").expect("ARG ideology must be derived");

    // USA center.x = (0.65 × 1.0) + (0.35 × -1.0) = 0.30
    let usa_expected_center_x = (65.0 * 1.0 + 35.0 * (-1.0)) / 100.0;
    assert!((usa_ide.center.0 - usa_expected_center_x).abs() < 0.01,
        "USA center.x: expected {usa_expected_center_x:.3}, got {:.3}", usa_ide.center.0);

    // CHN center = heavily party-cadre at (-2, +3) → center.x ≈ -1.44
    // (0.8 × -2.0) + (0.2 × 1.0) = -1.6 + 0.2 = -1.4
    let chn_expected_center_x = (80.0 * (-2.0) + 20.0 * 1.0) / 100.0;
    assert!((chn_ide.center.0 - chn_expected_center_x).abs() < 0.01,
        "CHN center.x: expected {chn_expected_center_x:.3}, got {:.3}", chn_ide.center.0);

    // All three centers must be distinct (different political realities)
    assert_ne!(usa_ide.center, chn_ide.center, "USA and CHN must have different Overton centers");
    assert_ne!(usa_ide.center, arg_ide.center, "USA and ARG must have different Overton centers");
    assert_ne!(chn_ide.center, arg_ide.center, "CHN and ARG must have different Overton centers");

    // ── ASSERTION B: Divergent Approval Trajectories ───────────────────────
    let usa_approval = state_t1.metrics.get("USA").unwrap().executive_approval;
    let chn_approval = state_t1.metrics.get("CHN").unwrap().executive_approval;
    let arg_approval = state_t1.metrics.get("ARG").unwrap().executive_approval;

    // CHN: (0.7 × 85) + (0.3 × 55) = 59.5 + 16.5 = 76.0
    let chn_expected_approval = (70.0 * 85.0 + 30.0 * 55.0) / 100.0;
    assert!((chn_approval - chn_expected_approval).abs() < 1.0,
        "CHN approval: expected ~{chn_expected_approval:.1}, got {chn_approval:.1}");

    // ARG: (0.8 × 30) + (0.2 × 60) = 24 + 12 = 36 — APPROVAL CRISIS
    let arg_expected_approval = (80.0 * 30.0 + 20.0 * 60.0) / 100.0;
    assert!((arg_approval - arg_expected_approval).abs() < 1.0,
        "ARG approval: expected ~{arg_expected_approval:.1}, got {arg_approval:.1}");

    // ARG must have lowest approval (crisis state)
    assert!(arg_approval < usa_approval,
        "ARG approval ({arg_approval}) should be below USA ({usa_approval})");
    assert!(arg_approval < chn_approval,
        "ARG approval ({arg_approval}) should be below CHN ({chn_approval})");

    // ── ASSERTION C: Zone Gate Activation (ideology_matrix integration) ────
    // CHN position (-2, +3) is in the Illiberal Directed zone
    let chn_position = chn_ide.position;
    let chn_gates = check_zone_gates(chn_position);
    assert!(chn_gates.contains(&ZoneGate::StateChampionSubsidy),
        "CHN at {:?} should trigger StateChampionSubsidy", chn_position);
    assert!(chn_gates.contains(&ZoneGate::CapitalFlight),
        "CHN at {:?} should trigger CapitalFlight risk", chn_position);

    // USA position (+1, 0) — no zone gates
    let usa_position = usa_ide.position;
    let usa_gates = check_zone_gates(usa_position);
    assert!(usa_gates.is_empty(),
        "USA at {:?} should have no zone gates, got {:?}", usa_position, usa_gates);

    // ── ASSERTION D: Ideological Friction Costs ─────────────────────────────
    // Action: Market Deregulation — ideological target (+3, 0)
    let deregulation_pos = (3.0, 0.0);
    let fc = 0.3;
    let base_cost = 100.0;

    let usa_aut_cost = action_authority_cost(base_cost, usa_ide.position, deregulation_pos, fc);
    let chn_aut_cost = action_authority_cost(base_cost, chn_ide.position, deregulation_pos, fc);

    // USA starts at (+1, 0), but IDX-007 Glacial Shift slightly nudges position each tick.
    // Tolerance is 1.0 AUT to accommodate this micro-drift — the physics is correct.
    assert!((usa_aut_cost - 160.0).abs() < 1.0,
        "USA deregulation cost: expected ~160.0 (±1.0 for Glacial Shift), got {usa_aut_cost:.2}");

    // CHN is at (-2, +3), distance to (+3, 0) = sqrt(25+9) = sqrt(34) ≈ 5.83 → cost ≈ 274.9
    let chn_dist = euclidean_distance(chn_ide.position, deregulation_pos);
    let expected_chn_cost = base_cost * (1.0 + chn_dist * fc);
    assert!((chn_aut_cost - expected_chn_cost).abs() < 0.1,
        "CHN deregulation cost: expected {expected_chn_cost:.2}, got {chn_aut_cost:.2}");

    // CHN must pay significantly more than USA for the same action
    assert!(chn_aut_cost > usa_aut_cost * 1.5,
        "CHN cost ({chn_aut_cost:.1}) should be >1.5× USA cost ({usa_aut_cost:.1})");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Flavor Label Integration (ideology_matrix standalone validation)
// ─────────────────────────────────────────────────────────────────────────────

/// Validates the 121-label FLAVOR_GRID coverage at key reference coordinates.
/// These are the "canonical checkpoints" from V15 Dispatch and `METRIC_DEFINITIONS.md §10`.
#[test]
fn test_journey_ideology_matrix_labels() {
    // Anchor points from V15 Dispatch
    assert_eq!(resolve_flavor_label(0.0, 0.0), "Liberalism",        "Center must be Liberalism");
    assert_eq!(resolve_flavor_label(-5.0, 5.0), "Stalinism",        "TL corner must be Stalinism");
    assert_eq!(resolve_flavor_label(5.0, -5.0), "Anarcho-Capitalism", "BR corner must be Anarcho-Capitalism");
    assert_eq!(resolve_flavor_label(-1.0, 0.0), "Rhine Capitalism", "(-1,0) must be Rhine Capitalism");
    assert_eq!(resolve_flavor_label(1.0, 0.0), "Market Democracy",  "(+1,0) must be Market Democracy (USA archetype)");
    assert_eq!(resolve_flavor_label(-2.0, 3.0), "National Synergy", "(-2,+3) must be National Synergy (CHN archetype)");
    assert_eq!(resolve_flavor_label(-1.0, 1.0), "Third Way",        "(-1,+1) must be Third Way (ARG archetype)");
    assert_eq!(resolve_flavor_label(-4.0, 4.0), "Command Administration", "(-4,+4) must be Command Administration");
    assert_eq!(resolve_flavor_label(0.0, -1.0), "Federalism",       "(0,-1) must be Federalism");
    assert_eq!(resolve_flavor_label(4.0, -2.0), "Private Law Society", "(+4,-2) must be Private Law Society");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Zone Gate Activation Across the Matrix
// ─────────────────────────────────────────────────────────────────────────────

/// Validates zone gate logic at boundary and interior coordinates.
#[test]
fn test_journey_zone_gate_activation() {
    // Totalitarian Planned Zone (econ < -3, auth > +3)
    assert!(check_zone_gates((-4.0, 4.0)).contains(&ZoneGate::FiveYearPlan));
    assert!(check_zone_gates((-5.0, 5.0)).contains(&ZoneGate::BureaucraticFamine));

    // Decentralized Laissez-Faire (econ > +3, auth < -1)
    assert!(check_zone_gates((4.0, -3.0)).contains(&ZoneGate::CorporateSovereignZone));
    assert!(check_zone_gates((5.0, -2.0)).contains(&ZoneGate::PlutocraticSecession));

    // Illiberal Directed (econ -3 to 0, auth +1 to +3)
    assert!(check_zone_gates((-2.0, 2.0)).contains(&ZoneGate::StateChampionSubsidy));
    assert!(check_zone_gates((-2.0, 2.0)).contains(&ZoneGate::CapitalFlight));

    // Center: no gates
    assert!(check_zone_gates((0.0, 0.0)).is_empty());

    // CHN archetype position exactly
    assert!(check_zone_gates((-2.0, 3.0)).contains(&ZoneGate::StateChampionSubsidy));
}
