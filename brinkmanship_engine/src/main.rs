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
pub struct GameStateSnapshot {
    pub turn_id: u32,
    pub current_date: String,
    pub active_phase: u8,
    pub phase_name: String,
    pub metrics: HashMap<EntityId, crate::state::MetricsComponent>,
    pub demographics: HashMap<EntityId, crate::state::DemographicsComponent>,
    pub system: HashMap<EntityId, crate::state::SystemComponent>,
    pub industry: HashMap<EntityId, crate::state::IndustryComponent>,
    pub diplomatic_ledgers: HashMap<EntityId, crate::state::DiplomaticLedger>,
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

    let app = Router::new()
        .route("/api/state", get(get_state))
        .route("/api/scenarios", get(list_scenarios))
        .route("/api/load_scenario", post(load_scenario))
        .route("/api/turn", post(next_turn))
        .route("/api/resolve_event", post(resolve_event))
        .layer(CorsLayer::permissive())
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    println!("Listening on: {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

// --- Handlers ---

async fn get_state(AxumState(state): AxumState<Arc<AppState>>) -> impl IntoResponse {
    let s = state.current_state.read().unwrap();
    match s.as_ref() {
        Some(s) => {
            let snapshot = GameStateSnapshot {
                turn_id: s.turn_id,
                current_date: s.current_date.clone(),
                active_phase: s.active_phase,
                phase_name: match s.active_phase {
                    1 => "Incremental Growth".to_string(),
                    2 => "Building Tensions".to_string(),
                    3 => "Flashpoint".to_string(),
                    _ => "Unknown".to_string(),
                },
                metrics: s.metrics.clone(),
                demographics: s.demographics.clone(),
                system: s.system_states.clone(),
                industry: s.industry.clone(),
                diplomatic_ledgers: s.diplomatic_ledgers.clone(),
                action_logs: s.action_logs.clone(),
                volatility_history: s.volatility_history.clone(),
                pending_actions: s.pending_actions.clone(),
            };
            (StatusCode::OK, Json(snapshot)).into_response()
        }
        None => (StatusCode::NOT_FOUND, "No active game state").into_response(),
    }
}

async fn list_scenarios() -> impl IntoResponse {
    // For now, hardcoded as we port. In future, read the scenarios dir.
    let list = vec!["modern_geopolitics", "cold_war_1983"];
    Json(serde_json::json!({ "scenarios": list }))
}

async fn load_scenario(
    AxumState(state): AxumState<Arc<AppState>>,
    Json(payload): Json<LoadScenarioRequest>,
) -> impl IntoResponse {
    // 1. Read scenario.json
    let path = format!("../scenarios/{}/scenario.json", payload.scenario_id);
    let content = match std::fs::read_to_string(&path) {
        Ok(c) => c,
        Err(_) => return (StatusCode::NOT_FOUND, "Scenario not found").into_response(),
    };

    let scenario: Scenario = match serde_json::from_str(&content) {
        Ok(s) => s,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Invalid scenario JSON: {}", e)).into_response(),
    };

    // 2. Initialize State
    let mut initial_metrics = HashMap::new();
    initial_metrics.insert("PLAYER".to_string(), crate::state::MetricsComponent {
        stability: 80.0,
        executive_approval: 50.0,
        cpi: 100.0,
        military_readiness: 50.0,
        stock_market: 35000.0,
        unemployment: 4.0,
    });

    let mut initial_systems = HashMap::new();
    initial_systems.insert("PLAYER".to_string(), crate::state::SystemComponent {
        volatility: 5.0,
        provocation: 15.0,
        fear_index: 0.0,
    });

    let s = State {
        turn_id: 0,
        current_date: "2025-01-20".to_string(), // Placeholder, should come from scenario
        active_phase: 1,
        metrics: initial_metrics,
        demographics: HashMap::new(),
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

    (StatusCode::OK, Json(serde_json::json!({ "status": "loaded" }))).into_response()
}

async fn next_turn(AxumState(state): AxumState<Arc<AppState>>) -> impl IntoResponse {
    let mut s_lock = state.current_state.write().unwrap();
    if let Some(s) = s_lock.as_ref() {
        let next_s = state.chronos.tick(s);
        *s_lock = Some(next_s);
        (StatusCode::OK, Json(serde_json::json!({ "status": "success" }))).into_response()
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
                
                *s_lock = Some(next_s);
                return (StatusCode::OK, Json(serde_json::json!({ 
                    "status": "queued",
                    "outcome_preview": outcome_key,
                    "narrative": narrative
                }))).into_response();
            }
        }
    }
    
    (StatusCode::BAD_REQUEST, "Invalid event or state").into_response()
}
