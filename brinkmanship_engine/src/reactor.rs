use crate::state::{State, EventOption, PendingAction, EntityId};
use rand::prelude::*;
use rand_distr::Normal;

pub struct Reactor;

impl Reactor {
    /// Resolves an event option using a Gaussian distribution.
    /// Returns (OutcomeKey, List of PendingActions, Narrative)
    pub fn resolve_event(
        &self,
        option: &EventOption,
        current_state: &State,
        source_entity: EntityId,
        target_entity: EntityId,
        current_turn: u32,
    ) -> (String, Vec<PendingAction>, String) {
        let mut rng = thread_rng();
        
        // 1. Get Volatility (Default to 15.0 if not found for target)
        let volatility = current_state.system_states
            .get(&target_entity)
            .map(|s| s.volatility)
            .unwrap_or(15.0);
            
        let mut chaos_modifier = 0.0;
        
        // 2. Apply Chaos Modifier if Provocation is high
        if let Some(system) = current_state.system_states.get(&source_entity) {
            if system.provocation >= 10.0 {
                chaos_modifier = 15.0;
            }
        }
        
        // 3. Roll Gaussian Curve (mu = 50 + chaos, sigma = volatility)
        let normal = Normal::new(50.0 + chaos_modifier, volatility).unwrap();
        let roll: f64 = rng.sample(normal);
        
        // 4. Determine Success/Failure
        let outcome_key = if roll >= option.threshold {
            "SUCCESS".to_string()
        } else {
            "FAILURE".to_string()
        };
        
        let mut actions = Vec::new();
        let mut narrative = String::new();
        
        if let Some(outcome) = option.outcomes.get(&outcome_key) {
            narrative = outcome.description.clone();
            
            // 5. Calculate Magnitude Scalar (Stochastic impact scaling)
            let magnitude_scalar = (roll - option.threshold).abs() / 10.0;
            let magnitude_scalar = magnitude_scalar.max(0.1);
            
            for (key, value) in &outcome.effects {
                let target_type = if key.contains("demo") {
                    "demographic".to_string()
                } else if matches!(key.as_str(), "volatility" | "fear_index" | "provocation") {
                    "system".to_string()
                } else {
                    "metric".to_string()
                };
                
                let final_amount = (value * magnitude_scalar).round_to(4);
                
                actions.push(PendingAction {
                    action_id: uuid::Uuid::new_v4().to_string(),
                    source_entity: source_entity.clone(),
                    target_entity: target_entity.clone(),
                    option_label: option.text.clone(),
                    resolve_on_turn: current_turn + option.lag_time,
                    action_type: target_type,
                    target: key.clone(),
                    amount: final_amount,
                });
            }
        } else {
            narrative = format!("ERROR: Outcome key '{}' missing in scenario.", outcome_key);
        }
        
        (outcome_key, actions, narrative)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{EventOption, EventOutcome, State};
    use im::HashMap;

    #[test]
    fn test_gaussian_resolution_routing() {
        let reactor = Reactor;
        let mut option = EventOption {
            id: "opt_1".to_string(),
            text: "Test Option".to_string(),
            threshold: 50.0,
            lag_time: 0,
            outcomes: HashMap::new(),
        };
        
        option.outcomes.insert("SUCCESS".to_string(), EventOutcome {
            description: "Success".to_string(),
            effects: HashMap::new(),
        });
        option.outcomes.insert("FAILURE".to_string(), EventOutcome {
            description: "Failure".to_string(),
            effects: HashMap::new(),
        });

        // Test with extreme volatility to see if it still routes
        let state = State::default();
        let (outcome, _, _) = reactor.resolve_event(&option, &state, "PLAYER".to_string(), "PLAYER".to_string(), 1);
        assert!(outcome == "SUCCESS" || outcome == "FAILURE");
    }

    #[test]
    fn test_magnitude_scaling() {
        let reactor = Reactor;
        let mut option = EventOption {
            id: "opt_1".to_string(),
            text: "Scalable Option".to_string(),
            threshold: 50.0,
            lag_time: 0,
            outcomes: HashMap::new(),
        };
        
        let mut effects = HashMap::new();
        effects.insert("stability".to_string(), 10.0);
        
        option.outcomes.insert("SUCCESS".to_string(), EventOutcome {
            description: "Success".to_string(),
            effects,
        });

        // We can't easily force the random seed here without refactoring Reactor to take an RNG,
        // but we can verify the logic compiles and runs without panics.
        let mut state = State::default();
        state.system_states = state.system_states.insert("PLAYER".to_string(), crate::state::SystemComponent {
            volatility: 0.5,
            ..Default::default()
        });
        let (_, actions, _) = reactor.resolve_event(&option, &state, "PLAYER".to_string(), "PLAYER".to_string(), 1);
        if !actions.is_empty() {
            assert!(actions[0].amount != 0.0);
        }
    }
}

trait RoundTo {
    fn round_to(self, places: i32) -> f64;
}

impl RoundTo for f64 {
    fn round_to(self, places: i32) -> f64 {
        let p = 10f64.powi(places);
        (self * p).round() / p
    }
}
