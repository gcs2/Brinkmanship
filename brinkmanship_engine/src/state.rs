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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct IdeologyComponent {
    /// The faction-weighted Overton Window center (mean alignment of all Factions).
    /// Derived each tick from Faction influence × alignment.
    pub center: (f64, f64),

    /// The Overton Window spread (weighted standard deviation of Faction alignments).
    /// High spread = polarized society. Low spread = ideological consensus.
    pub spread: f64,

    /// The sovereign's actual governing position on the 11×11 Structural Matrix.
    /// Distinct from `center`: a leader can govern at (+2, 0) while factions pull
    /// toward (0, 0). The Euclidean gap is `Ideological Tension`.
    /// X-Axis: Economic (-5 Command → +5 Commodified)
    /// Y-Axis: Authority (-5 Stateless → +5 Totalitarian)
    ///
    /// See: `ideology_matrix::euclidean_distance(position, center)` for tension calc.
    pub position: (f64, f64),

    /// The human-readable flavor label for the current `position`.
    /// Updated each tick via `ideology_matrix::resolve_flavor_label(position)`.
    /// e.g., "Liberalism", "Stalinism", "Market Democracy"
    ///
    /// Cross-ref: `artifacts/SOVEREIGN_DISPATCH_V15_THE_STRUCTURAL_MATRIX.md`
    pub flavor_label: String,

    // ── Phase 16 fields ────────────────────────────────────────────────────

    /// Velocity vector: `current_position - prev_position` from the last tick.
    /// Magnitude > 1.5 units/tick triggers an Estate Velocity Shock (IDX-009):
    /// Capital Flight or equivalent Zone Gate event fires even if absolute
    /// position is not yet in a danger zone. "Panic is caused by acceleration, not location."
    ///
    /// Cross-ref: `docs/METRIC_DEFINITIONS.md §12`
    pub position_velocity: (f64, f64),

    /// Ring buffer of the last 10 governing positions, oldest-first.
    /// Updated each tick by `chronos.rs`. Used for:
    ///   1. Breadcrumb trail rendering on `IdeologyCompass.tsx` (IDX-011)
    ///   2. Trend-based event triggers ("5+ ticks of leftward drift")
    ///
    /// Cross-ref: `docs/METRIC_DEFINITIONS.md §14`
    pub position_history: Vec<(f64, f64)>,

    /// The publicly projected sovereign position — what citizens and rivals observe.
    /// Distinct from `position` (actual governing track record).
    /// Spending Authority per tick maintains the gap (Perception Filter, IDX-010).
    /// If `euclidean_distance(position, perceived_position) > VEIL_COLLAPSE_THRESHOLD`,
    /// the Veil Shatters: catastrophic Stability loss, flavor labels snap to reality.
    ///
    /// Cross-ref: `docs/METRIC_DEFINITIONS.md §13`, `ideology_matrix::perception_maintenance_cost()`
    pub perceived_position: (f64, f64),

    /// The publicly broadcasted flavor label for `perceived_position`.
    /// May differ from `flavor_label` when Perception Filter is active.
    /// e.g., sovereign governs at (+3,-2) "Oligarchic" but broadcasts "Liberalism".
    pub perceived_flavor_label: String,
}

impl Default for IdeologyComponent {
    fn default() -> Self {
        Self {
            center: (0.0, 0.0),
            spread: 0.0,
            position: (0.0, 0.0),
            flavor_label: "Liberalism".to_string(),
            position_velocity: (0.0, 0.0),
            position_history: Vec::new(),
            perceived_position: (0.0, 0.0),
            perceived_flavor_label: "Liberalism".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SystemComponent {
    pub volatility: f64,
    pub provocation: f64,
    pub fear_index: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Estate {
    pub name: String,
    pub influence: f64,
    pub happiness: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Faction {
    pub name: String,
    pub influence: f64,
    pub alignment: (f64, f64), // (Planned/Market, Auth/Lib)
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AuthorityComponent {
    pub current: f64,
    pub generation_rate: f64,
    pub modifiers: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct IndustryComponent {
    pub resources: HashMap<String, f64>, // e.g., "Steel" -> 100.0, "Oil" -> 50.0
    pub production_efficiency: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DiplomaticLedger {
    pub relations: HashMap<EntityId, f64>, // -100 to 100
    pub trade_agreements: Vec<String>,
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

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct State {
    pub turn_id: u32,
    pub current_date: String,
    pub active_phase: u8,

    pub metrics: HashMap<EntityId, MetricsComponent>,
    pub demographics: HashMap<EntityId, DemographicsComponent>,
    pub ideology: HashMap<EntityId, IdeologyComponent>,
    pub estates: HashMap<EntityId, HashMap<String, Estate>>,
    pub factions: HashMap<EntityId, HashMap<String, Faction>>,
    pub authority: HashMap<EntityId, AuthorityComponent>,
    pub system_states: HashMap<EntityId, SystemComponent>,
    pub industry: HashMap<EntityId, IndustryComponent>,
    pub diplomatic_ledgers: HashMap<EntityId, DiplomaticLedger>,

    pub pending_actions: Vec<PendingAction>,
    pub action_logs: Vec<String>,
    pub intel_feed: Vec<String>,
    pub volatility_history: Vec<f64>,
}

// --- Scenario & Event Schema for Deserialization ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scenario {
    pub theme_name: String,
    pub events: Vec<Event>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub event_id: String,
    pub title: String,
    pub description: String,
    pub phase_requirement: u8,
    pub options: Vec<EventOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventOption {
    pub id: String,
    pub text: String,
    pub weights: HashMap<String, f64>, // Map of OutcomeKey -> Weight (e.g. "SUCCESS" -> 0.7, "FAILURE" -> 0.3)
    pub lag_time: u32,
    pub outcomes: HashMap<String, EventOutcome>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventOutcome {
    pub description: String,
    pub effects: HashMap<String, f64>,
}

/// The Core Chronos Engine Trait
pub trait ChronosEngine {
    /// Pure, mathematically immutable tick. 
    /// Consumes a reference to current state and returns a fully cloned & updated new state.
    fn tick(&self, current_state: &State) -> State;
}
