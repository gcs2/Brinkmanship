use serde::{Deserialize, Serialize};
use im::HashMap;

/// Entity ID - Replaces monolithic State tracking. 
/// "PLAYER" is just one entity. Rivals like "RUS" or "CHN" are equivalent peers.
pub type EntityId = String;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct MetricsComponent {
    pub stability: f64,
    pub executive_approval: f64,
    pub cpi: f64,
    pub military_readiness: f64,
    pub stock_market: f64,
    pub unemployment: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DemographicsComponent {
    pub working_class: f64,
    pub elites: f64,
    pub state_security: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct IdeologyComponent {
    pub authoritarian_axis: f64,
    pub economic_axis: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SystemComponent {
    pub volatility: f64,
    pub provocation: f64,
    pub fear_index: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PendingAction {
    pub action_id: String,
    pub source_entity: EntityId,
    pub target_entity: EntityId,
    pub option_label: String,
    pub resolve_on_turn: u32,
    pub action_type: String, // "metric", "demographic", "system"
    pub target: String,
    pub amount: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct State {
    pub turn_id: u32,
    pub current_date: String,
    pub active_phase: u8,

    pub metrics: HashMap<EntityId, MetricsComponent>,
    pub demographics: HashMap<EntityId, DemographicsComponent>,
    pub ideology: HashMap<EntityId, IdeologyComponent>,
    pub system_states: HashMap<EntityId, SystemComponent>,

    pub pending_actions: Vec<PendingAction>,
    pub action_logs: Vec<String>,
    pub volatility_history: Vec<f64>,
}

/// The Core Chronos Engine Trait
pub trait ChronosEngine {
    /// Pure, mathematically immutable tick. 
    /// Consumes a reference to current state and returns a fully cloned & updated new state.
    fn tick(&self, current_state: &State) -> State;
}
