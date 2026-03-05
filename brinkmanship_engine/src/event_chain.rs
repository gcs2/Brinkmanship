//! event_chain.rs — Universal Event Chain Framework
//!
//! `EventChainDef` is the generic container for *any* structured in-game event:
//! legislative bills, diplomatic incidents, crisis minigames, natural disasters,
//! covert operations, or tutorial sequences. This is NOT just for legislation.
//!
//! Design principle (V18 management directive):
//! "The legislative system is a framework for event chains in general.
//!  Any policy, crisis, or diplomatic maneuver can be expressed as an EventChainDef.
//!  Player decisions shift pass probability; the loop is:
//!  spend resources → affect probability → reap or suffer outcome."
//!
//! # Lifecycle
//! 1. Event is created (from scenario JSON, engine trigger, or player action)
//! 2. Event enters `State::active_events`
//! 3. Player works through phases, making EventChoice selections
//! 4. Each choice adjusts `pass_chance_modifier` and optionally shifts the
//!    event's `ideological_coordinate` toward the Overton Window (Wonk Workshop)
//! 5. Resolution tick fires → EventOutcome determined by cumulative probability
//! 6. Outcome deltas applied to State; event moved to `State::event_log`

use serde::{Deserialize, Serialize};

// ── Core Structs ──────────────────────────────────────────────────────────────

/// Universal event chain container. Represents any structured decision sequence
/// in the simulation: bills, crises, covert ops, diplomatic events, minigames.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventChainDef {
    /// Unique identifier (e.g., "ubi_bill", "strait_of_hormuz_blockade")
    pub id: String,

    /// Human-readable event name
    pub name: String,

    /// Rich description shown to player in event dialog
    pub description: String,

    /// Where this event "lives" on the Structural Matrix.
    /// Used to compute friction cost via `ideology_matrix::action_authority_cost()`.
    /// A UBI bill at (-2.0, 0.0); a deregulation push at (3.0, 0.0).
    pub ideological_coordinate: (f64, f64),

    /// Base Authority cost before ideological friction is applied.
    pub base_aut_cost: f64,

    /// Sequential phases of the event (e.g., "Committee Review", "Floor Vote").
    /// Each phase presents player choices that affect outcome probability.
    pub phases: Vec<EventPhase>,

    /// Running modifier: starts at 0.0, adjusted by choices, used at resolution.
    /// Positive = more likely to succeed. Range: [-1.0, +1.0] clamped.
    #[serde(default)]
    pub cumulative_pass_modifier: f64,

    /// Which phase index is currently active.
    #[serde(default)]
    pub current_phase: usize,
}

/// One phase of an event chain (e.g., "Lobbying", "Committee Markup", "Floor Debate").
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventPhase {
    pub name: String,
    pub description: String,
    pub player_choices: Vec<EventChoice>,
}

/// A single decision option within an EventPhase.
///
/// Each choice carries:
/// - **metric_deltas**: immediate state effects regardless of final outcome
/// - **pass_chance_modifier**: adjusts the cumulative modifier on `EventChainDef`
/// - **ideological_shift**: if Some, shifts the event's `ideological_coordinate`
///   toward the Overton Window, reducing friction cost (the "Wonk Workshop" mechanic)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventChoice {
    /// Display label shown to player (e.g., "Invoke Party Discipline", "Attach Pork Rider")
    pub label: String,

    /// Immediate metric deltas regardless of final outcome.
    /// Tuple: (metric_id, delta) e.g. ("authority", -20.0) or ("approval", 5.0)
    pub metric_deltas: Vec<(String, f64)>,

    /// Adjusts cumulative pass modifier. +0.15 = 15pp better chance; -0.20 = 20pp worse.
    pub pass_chance_modifier: f64,

    /// If Some, shifts ideological coordinate by this delta toward Overton center.
    /// This reduces the Euclidean distance, lowering the final AUT friction cost.
    /// "Wonk Workshop" — advisors workshop the bill into a more palatable shape.
    pub ideological_shift: Option<(f64, f64)>,
}

// ── Outcome ───────────────────────────────────────────────────────────────────

/// The result of a fully-resolved EventChainDef.
///
/// Each variant carries `Vec<(metric_id, delta)>` — the lasting mechanical
/// consequences applied to State after resolution.
///
/// Examples of consequences:
/// - `Success`: approval +10, tax_rate +0.02, trade_route_unlocked = true
/// - `Failure`: stability -15, authority -30
/// - `Compromised`: guaranteed passage but scarcity_coefficient permanent +0.05
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventOutcome {
    /// Event succeeded — apply bonuses
    Success(Vec<(String, f64)>),

    /// Event failed — apply penalties
    Failure(Vec<(String, f64)>),

    /// "Pork-Barrel" outcome — guaranteed pass but with permanent negative cost.
    /// Named for the legislative practice of attaching unrelated spending riders
    /// to ensure passage of a stuck bill.
    Compromised(Vec<(String, f64)>),
}

// ── Validation ────────────────────────────────────────────────────────────────

impl EventChainDef {
    /// Validate at load time. Panics if the chain is structurally invalid.
    /// Called at engine boot (same pattern as ScenarioDef).
    pub fn validate(&self) {
        assert!(
            !self.id.is_empty(),
            "[EventChainDef] id must not be empty"
        );
        assert!(
            self.base_aut_cost >= 0.0,
            "[EventChainDef '{}'] base_aut_cost ({}) must be >= 0",
            self.id, self.base_aut_cost
        );
        let (ex, ey) = self.ideological_coordinate;
        assert!(
            ex >= -5.0 && ex <= 5.0 && ey >= -5.0 && ey <= 5.0,
            "[EventChainDef '{}'] ideological_coordinate ({:.2}, {:.2}) out of [-5, +5] bounds",
            self.id, ex, ey
        );
        assert!(
            !self.phases.is_empty(),
            "[EventChainDef '{}'] must have at least one phase",
            self.id
        );
        for (i, phase) in self.phases.iter().enumerate() {
            assert!(
                !phase.player_choices.is_empty(),
                "[EventChainDef '{}'] phase {} ('{}') must have at least one choice",
                self.id, i, phase.name
            );
        }
    }
}

// ── Unit Tests ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_valid_event() -> EventChainDef {
        EventChainDef {
            id: "ubi_bill".to_string(),
            name: "Universal Basic Income Act".to_string(),
            description: "A sweeping welfare expansion.".to_string(),
            ideological_coordinate: (-2.0, 0.0),
            base_aut_cost: 80.0,
            cumulative_pass_modifier: 0.0,
            current_phase: 0,
            phases: vec![
                EventPhase {
                    name: "Committee Markup".to_string(),
                    description: "Shape the bill before the floor vote.".to_string(),
                    player_choices: vec![
                        EventChoice {
                            label: "Invoke Party Discipline".to_string(),
                            metric_deltas: vec![("authority".to_string(), -20.0)],
                            pass_chance_modifier: 0.20,
                            ideological_shift: None,
                        },
                        EventChoice {
                            label: "Wonk Workshop — Shift Bill Rightward".to_string(),
                            metric_deltas: vec![("authority".to_string(), -30.0)],
                            pass_chance_modifier: 0.10,
                            ideological_shift: Some((0.5, 0.0)),
                        },
                        EventChoice {
                            label: "Attach Pork Rider".to_string(),
                            metric_deltas: vec![("scarcity_coefficient".to_string(), 0.05)],
                            pass_chance_modifier: 0.40,
                            ideological_shift: None,
                        },
                    ],
                },
            ],
        }
    }

    #[test]
    fn test_valid_event_chain_validates() {
        let event = make_valid_event();
        event.validate(); // must not panic
    }

    #[test]
    #[should_panic(expected = "ideological_coordinate")]
    fn test_position_out_of_range_panics() {
        let mut event = make_valid_event();
        event.ideological_coordinate = (6.0, 0.0);
        event.validate();
    }

    #[test]
    #[should_panic(expected = "base_aut_cost")]
    fn test_negative_aut_cost_panics() {
        let mut event = make_valid_event();
        event.base_aut_cost = -1.0;
        event.validate();
    }

    #[test]
    #[should_panic(expected = "must have at least one phase")]
    fn test_empty_phases_panics() {
        let mut event = make_valid_event();
        event.phases.clear();
        event.validate();
    }

    #[test]
    #[should_panic(expected = "must have at least one choice")]
    fn test_empty_choices_panics() {
        let mut event = make_valid_event();
        event.phases[0].player_choices.clear();
        event.validate();
    }

    #[test]
    fn test_outcome_variants_exist() {
        let _s = EventOutcome::Success(vec![("approval".to_string(), 10.0)]);
        let _f = EventOutcome::Failure(vec![("stability".to_string(), -15.0)]);
        let _c = EventOutcome::Compromised(vec![("scarcity_coefficient".to_string(), 0.05)]);
    }

    #[test]
    fn test_wonk_workshop_choice_has_shift() {
        let event = make_valid_event();
        let wonk_choice = &event.phases[0].player_choices[1];
        assert!(wonk_choice.ideological_shift.is_some());
        let (dx, _) = wonk_choice.ideological_shift.unwrap();
        assert!(dx > 0.0, "Wonk shift should move bill toward market side");
    }
}
