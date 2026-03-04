pub mod state;
pub mod chronos;
pub mod reactor;
pub mod ai_director_stress;

use axum::{
    extract::State as AxumState,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::sync::{Arc, RwLock};
use tower_http::cors::CorsLayer;
use serde::{Deserialize, Serialize};
use crate::state::{State, Scenario, PendingAction, EntityId};
use crate::chronos::Chronos;
use crate::reactor::Reactor;
// use std::collections::HashMap as StdHashMap;
use im::HashMap;

// --- DTOs for React Frontend Parity ---

#[derive(Serialize)]
pub struct FormattedMetric {
    pub id: String,
    pub label: String,
    pub value: f64,
    pub tooltip: String,
}

#[derive(Serialize)]
pub struct PlayerProfile {
    pub country: String,
    pub leader_name: String,
    pub title: String,
    pub stress: f64,
    pub nuclear_stockpile: Option<u32>,
}

#[derive(Serialize)]
pub struct Advisor {
    pub id: String,
    pub name: String,
    pub role: String,
    pub specialty: String,
    pub trust: f64,
}

#[derive(Serialize)]
pub struct GameStateSnapshot {
    pub turn_id: u32,
    pub current_date: String,
    pub active_phase: u8,
    pub phase_name: String,
    pub player_profile: PlayerProfile,
    pub advisors: Vec<Advisor>,
    pub formatted_metrics: Vec<FormattedMetric>,
    pub demographics: HashMap<String, f64>,
    pub system: crate::state::SystemComponent,
    pub industry: crate::state::IndustryComponent,
    pub relations: Vec<serde_json::Value>, 
    pub action_logs: Vec<String>,
    pub volatility_history: Vec<f64>,
    pub pending_actions: Vec<PendingAction>,
}

#[derive(Deserialize)]
pub struct LoadScenarioRequest {
    pub scenario_id: String,
}

#[derive(Deserialize)]
pub struct EventDecisionRequest {
    pub event_id: String,
    pub option_id: String,
}

// --- Shared Application State ---

pub struct AppState {
    pub current_state: RwLock<Option<State>>,
    pub current_scenario: RwLock<Option<Scenario>>,
    pub chronos: Chronos,
    pub reactor: Reactor,
}

#[tokio::main]
async fn main() {
    println!("--- BRINKMANSHIP ENGINE: RUST COLD START ---");
    println!("Platform: Axum // ECS-Lite // Structural Sharing");

    let shared_state = Arc::new(AppState {
        current_state: RwLock::new(None),
        current_scenario: RwLock::new(None),
        chronos: Chronos,
        reactor: Reactor,
    });

    // --- SOVEREIGN BOOT: Auto-load default scenario ---
    println!("Booting Sovereign Default: modern_geopolitics...");
    if let Err(e) = init_scenario(Arc::clone(&shared_state), "modern_geopolitics".to_string()) {
        eprintln!("FAILED TO BOOT DEFAULT SCENARIO: {}", e);
    }

    let app = Router::new()
        .route("/api/state", get(get_state))
        .route("/api/config", get(get_config))
        .route("/api/scenarios", get(list_scenarios))
        .route("/api/load_scenario", post(load_scenario))
        .route("/api/next_event", get(get_next_event))
        .route("/api/save", post(save_game))
        .route("/api/load", post(load_game))
        .route("/api/turn", post(next_turn))
        .route("/api/resolve_event", post(resolve_event))
        .layer(CorsLayer::permissive())
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    println!("Listening on: {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

// --- Helper Functions ---

fn init_scenario(state: Arc<AppState>, scenario_id: String) -> Result<(), String> {
    let path = format!("../scenarios/{}/scenario.json", scenario_id);
    let content = std::fs::read_to_string(&path).map_err(|e| format!("Scenario file not found: {}", e))?;
    let scenario: Scenario = serde_json::from_str(&content).map_err(|e| format!("Invalid scenario JSON: {}", e))?;

    let mut initial_metrics = HashMap::new();
    initial_metrics.insert("PLAYER".to_string(), crate::state::MetricsComponent {
        stability: 80.0,
        executive_approval: 50.0,
        cpi: 100.0,
        military_readiness: 50.0,
        stock_market: 35000.0,
        unemployment: 4.0,
    });

    let mut initial_demographics = HashMap::new();
    initial_demographics.insert("PLAYER".to_string(), crate::state::DemographicsComponent {
        working_class: 65.0,
        elites: 45.0,
        state_security: 50.0,
    });

    let mut initial_systems = HashMap::new();
    initial_systems.insert("PLAYER".to_string(), crate::state::SystemComponent {
        volatility: 5.0,
        provocation: 15.0,
        fear_index: 0.0,
    });

    let s = State {
        turn_id: 0,
        current_date: "2025-01-20".to_string(),
        active_phase: 1,
        metrics: initial_metrics,
        demographics: initial_demographics,
        ideology: HashMap::new(),
        system_states: initial_systems,
        industry: HashMap::new(),
        diplomatic_ledgers: HashMap::new(),
        pending_actions: Vec::new(),
        action_logs: Vec::new(),
        intel_feed: Vec::new(),
        volatility_history: Vec::new(),
    };

    *state.current_state.write().unwrap() = Some(s);
    *state.current_scenario.write().unwrap() = Some(scenario);
    Ok(())
}

// --- Handlers ---

async fn get_state(AxumState(state): AxumState<Arc<AppState>>) -> impl IntoResponse {
    let s_lock = state.current_state.read().unwrap();
    match s_lock.as_ref() {
        Some(s) => (StatusCode::OK, Json(create_snapshot(s))).into_response(),
        None => (StatusCode::NOT_FOUND, "No active game state").into_response(),
    }
}

fn create_snapshot(s: &State) -> GameStateSnapshot {
    let player_metrics = s.metrics.get("PLAYER").cloned().unwrap_or_default();
    let player_demo = s.demographics.get("PLAYER").cloned().unwrap_or_default();
    let player_system = s.system_states.get("PLAYER").cloned().unwrap_or_default();
    let player_industry = s.industry.get("PLAYER").cloned().unwrap_or_default();

    let formatted_metrics = vec![
        FormattedMetric { id: "stability".into(), label: "Global Stability".into(), value: player_metrics.stability, tooltip: "Baseline geopolitical cohesion index.".into() },
        FormattedMetric { id: "approval".into(), label: "Approval Rating".into(), value: player_metrics.executive_approval, tooltip: "Internal domestic legitimacy.".into() },
        FormattedMetric { id: "cpi".into(), label: "CPI".into(), value: player_metrics.cpi, tooltip: "Consumer price index volatility.".into() },
        FormattedMetric { id: "unemployment".into(), label: "Unemployment".into(), value: player_metrics.unemployment, tooltip: "Labor force participation stress.".into() },
    ];

    let mut demographics = HashMap::new();
    demographics.insert("demo_1".into(), player_demo.working_class);
    demographics.insert("demo_2".into(), player_demo.elites);
    demographics.insert("demo_3".into(), player_demo.state_security);

    GameStateSnapshot {
        turn_id: s.turn_id,
        current_date: s.current_date.clone(),
        active_phase: s.active_phase,
        phase_name: match s.active_phase {
            1 => "Incremental Growth".to_string(),
            2 => "Building Tensions".to_string(),
            _ => "Flashpoint".to_string(),
        },
        player_profile: PlayerProfile {
            country: "United States".into(),
            leader_name: "Zephyr".into(),
            title: "Executive Architect".into(),
            stress: 12.5,
            nuclear_stockpile: Some(5428),
        },
        advisors: vec![
            Advisor { id: "adv_1".into(), name: "Dr. Aris".into(), role: "Systems Specialist".into(), specialty: "defense".into(), trust: 85.0 },
            Advisor { id: "adv_2".into(), name: "Marcus Vane".into(), role: "Economic Strategist".into(), specialty: "finance".into(), trust: 42.0 },
        ],
        formatted_metrics,
        demographics,
        system: player_system,
        industry: player_industry,
        relations: vec![],
        action_logs: s.action_logs.clone(),
        volatility_history: s.volatility_history.clone(),
        pending_actions: s.pending_actions.clone(),
    }
}

async fn list_scenarios() -> impl IntoResponse {
    let list = vec!["modern_geopolitics", "cold_war_1983"];
    Json(serde_json::json!({ "scenarios": list }))
}

async fn get_config(AxumState(state): AxumState<Arc<AppState>>) -> impl IntoResponse {
    let scen_lock = state.current_scenario.read().unwrap();
    if let Some(_scen) = scen_lock.as_ref() {
        // Naive: return modern_geopolitics config for now
        let scenario_id = "modern_geopolitics";
        let path = format!("../scenarios/{}/config.json", scenario_id);
        if let Ok(content) = std::fs::read_to_string(&path) {
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
                return (StatusCode::OK, Json(val)).into_response();
            }
        }
    }
    (StatusCode::NOT_FOUND, "No config available").into_response()
}

async fn get_next_event(AxumState(state): AxumState<Arc<AppState>>) -> impl IntoResponse {
    let scen_lock = state.current_scenario.read().unwrap();
    if let Some(scen) = scen_lock.as_ref() {
        if let Some(evt) = scen.events.get(0) {
            return (StatusCode::OK, Json(serde_json::json!({ "event": evt }))).into_response();
        }
    }
    (StatusCode::OK, Json(serde_json::json!({ "event": null }))).into_response()
}

async fn save_game() -> impl IntoResponse {
    (StatusCode::OK, "Anchor saved").into_response()
}

async fn load_game() -> impl IntoResponse {
    (StatusCode::OK, "Timeline recalled").into_response()
}

async fn load_scenario(
    AxumState(state): AxumState<Arc<AppState>>,
    Json(payload): Json<LoadScenarioRequest>,
) -> impl IntoResponse {
    match init_scenario(state, payload.scenario_id) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "status": "loaded" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
    }
}

async fn next_turn(AxumState(state): AxumState<Arc<AppState>>) -> impl IntoResponse {
    let mut s_lock = state.current_state.write().unwrap();
    if let Some(s) = s_lock.as_ref() {
        let next_s = state.chronos.tick(s);
        *s_lock = Some(next_s.clone());
        (StatusCode::OK, Json(serde_json::json!({ "status": "success", "new_state": create_snapshot(&next_s) }))).into_response()
    } else {
        (StatusCode::BAD_REQUEST, "No active game state").into_response()
    }
}

async fn resolve_event(
    AxumState(state): AxumState<Arc<AppState>>,
    Json(payload): Json<EventDecisionRequest>,
) -> impl IntoResponse {
    let mut s_lock = state.current_state.write().unwrap();
    let scen_lock = state.current_scenario.read().unwrap();
    
    if let (Some(s), Some(scen)) = (s_lock.as_ref(), scen_lock.as_ref()) {
        let event = scen.events.iter().find(|e| e.event_id == payload.event_id);
        if let Some(e) = event {
            let option = e.options.iter().find(|o| o.id == payload.option_id);
            if let Some(o) = option {
                let (outcome_key, new_actions, narrative) = state.reactor.resolve_event(
                    o, s, "PLAYER".to_string(), "PLAYER".to_string(), s.turn_id
                );
                
                let mut next_s = s.clone();
                for action in new_actions {
                    next_s.pending_actions.push(action);
                }
                next_s.action_logs.push(format!("[LOG] EVENT RESOLVED: {} -> {}", e.title, outcome_key));
                
                *s_lock = Some(next_s.clone());

                return (StatusCode::OK, Json(serde_json::json!({ 
                    "status": "queued",
                    "outcome_preview": outcome_key,
                    "narrative": narrative,
                    "state": create_snapshot(&next_s)
                }))).into_response();
            }
        }
    }
    
    (StatusCode::BAD_REQUEST, "Invalid event or state").into_response()
}
