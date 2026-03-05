use brinkmanship_engine::state::{State, MetricsComponent, DemographicsComponent, IdeologyComponent, Faction, Estate, AuthorityComponent, PendingAction};
use brinkmanship_engine::chronos::Chronos;
use im::HashMap;

#[test]
fn test_journey_populist_surge() {
    let chronos = Chronos;
    
    // 1. Initial State: Stable Technocracy
    let mut metrics = HashMap::new();
    metrics.insert("PLAYER".to_string(), MetricsComponent {
        stability: 80.0,
        executive_approval: 50.0,
        ..Default::default()
    });

    let mut factions = HashMap::new();
    let mut p_factions = HashMap::new();
    p_factions.insert("Establishment".to_string(), Faction {
        name: "Establishment".to_string(),
        influence: 80.0,
        alignment: (0.0, 0.0), // Dead Center
    });
    p_factions.insert("Populists".to_string(), Faction {
        name: "Populists".to_string(),
        influence: 20.0,
        alignment: (-0.8, 0.5), // Radical Left-Auth
    });
    factions.insert("PLAYER".to_string(), p_factions);

    let mut estates = HashMap::new();
    let mut p_estates = HashMap::new();
    p_estates.insert("Elites".to_string(), Estate {
        name: "Elites".to_string(),
        influence: 70.0,
        happiness: 80.0,
    });
    p_estates.insert("Workers".to_string(), Estate {
        name: "Workers".to_string(),
        influence: 30.0,
        happiness: 40.0,
    });
    estates.insert("PLAYER".to_string(), p_estates);

    let mut authority = HashMap::new();
    authority.insert("PLAYER".to_string(), AuthorityComponent {
        current: 10.0,
        generation_rate: 1.0,
        modifiers: HashMap::new(),
    });

    let mut system_states = HashMap::new();
    system_states.insert("PLAYER".to_string(), brinkmanship_engine::state::SystemComponent::default());

    let state = State {
        turn_id: 0,
        current_date: "2026-03-01".to_string(),
        active_phase: 1,
        metrics,
        demographics: HashMap::new(),
        ideology: HashMap::new(),
        estates,
        factions,
        authority,
        system_states,
        industry: HashMap::new(),
        diplomatic_ledgers: HashMap::new(),
        pending_actions: Vec::new(),
        action_logs: Vec::new(),
        intel_feed: Vec::new(),
        volatility_history: Vec::new(),
    };

    // 2. Tick 1: Verify Initial Overton Window
    let state_t1 = chronos.tick(&state);
    let ideology_t1 = state_t1.ideology.get("PLAYER").expect("Ideology should be derived");
    
    // Center should be weighted toward Establishment (80 influence at 0,0)
    // 20% influence at -0.8 -> Center X = -0.16
    assert!((ideology_t1.center.0 - (-0.16)).abs() < 0.01);
    
    // 3. Apply "Populist Surge" - Shift influence to Populists
    let mut state_t2_prep = state_t1.clone();
    state_t2_prep.factions = state_t2_prep.factions.alter(|f| {
        let mut f = f.unwrap();
        f.get_mut("Establishment").unwrap().influence = 40.0;
        f.get_mut("Populists").unwrap().influence = 60.0;
        Some(f)
    }, "PLAYER".to_string());

    let state_t3 = chronos.tick(&state_t2_prep);
    let ideology_t3 = state_t3.ideology.get("PLAYER").unwrap();

    // Center X should now be (0.4 * 0.0) + (0.6 * -0.8) = -0.48
    assert!((ideology_t3.center.0 - (-0.48)).abs() < 0.01);
    // Spread should have increased as the two poles are now more balanced (Standard Deviation)
    assert!(ideology_t3.spread > ideology_t1.spread);
    
    // 4. Verify Estate-driven Approval
    // Elites (40%) @ 80 happiness, Workers (60%) @ 40 happiness
    // (0.4 * 80) + (0.6 * 40) = 32 + 24 = 56
    // Wait, the test setup had Elites 70%, Workers 30%. Let's check state_t3 metrics
    let approval = state_t3.metrics.get("PLAYER").unwrap().executive_approval;
    // Initial: (0.7 * 80) + (0.3 * 40) = 56 + 12 = 68
    assert!(approval >= 68.0); 
}
