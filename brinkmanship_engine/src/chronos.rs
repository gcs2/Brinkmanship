use crate::state::{State, PendingAction};
use rand::prelude::*;
use rand_distr::Normal;
use chrono::{NaiveDate, Duration};
use im::HashMap;

pub const PHASE_MUNDANE: u8 = 1;
pub const PHASE_TENSIONS: u8 = 2;
pub const PHASE_FLASHPOINT: u8 = 3;

pub const MUNDANE_THRESHOLD: f64 = 70.0;
pub const TENSIONS_THRESHOLD: f64 = 45.0;

pub struct Chronos;

impl Chronos {
    pub fn tick(&self, state: &State) -> State {
        let mut rng = thread_rng();
        let new_turn = state.turn_id + 1;
        
        let current_date = NaiveDate::parse_from_str(&state.current_date, "%Y-%m-%d")
            .unwrap_or_else(|_| NaiveDate::from_ymd_opt(2025, 1, 20).unwrap());
        let new_date = (current_date + Duration::days(1)).format("%Y-%m-%d").to_string();

        let mut next_metrics = state.metrics.clone();
        let mut next_demographics = state.demographics.clone();
        let mut next_system_states = state.system_states.clone();
        let mut new_action_logs = state.action_logs.clone();
        let mut still_pending: Vec<PendingAction> = Vec::new();

        // 1. Resolve Pending Actions
        for pa in &state.pending_actions {
            if new_turn >= pa.resolve_on_turn {
                let entity_id = &pa.target_entity;
                
                match pa.action_type.as_str() {
                    "metric" => {
                        if let Some(mut m) = next_metrics.get(entity_id).cloned() {
                            match pa.target.as_str() {
                                "metric_1" => m.stability = (m.stability + pa.amount).clamp(0.0, 100.0),
                                "metric_2" => m.executive_approval = (m.executive_approval + pa.amount).clamp(0.0, 100.0),
                                "metric_3" => m.cpi += pa.amount,
                                "metric_4" => m.military_readiness = (m.military_readiness + pa.amount).clamp(0.0, 100.0),
                                "metric_5" => m.stock_market += pa.amount,
                                "metric_6" => m.unemployment += pa.amount,
                                _ => {}
                            }
                            next_metrics.insert(entity_id.clone(), m);
                        }
                    }
                    "demographic" => {
                        if let Some(mut d) = next_demographics.get(entity_id).cloned() {
                            match pa.target.as_str() {
                                "demo_1" => d.working_class = (d.working_class + pa.amount).clamp(0.0, 100.0),
                                "demo_2" => d.elites = (d.elites + pa.amount).clamp(0.0, 100.0),
                                "demo_3" => d.state_security = (d.state_security + pa.amount).clamp(0.0, 100.0),
                                _ => {}
                            }
                            next_demographics.insert(entity_id.clone(), d);
                        }
                    }
                    "system" => {
                        if let Some(mut s) = next_system_states.get(entity_id).cloned() {
                            match pa.target.as_str() {
                                "volatility" => s.volatility += pa.amount,
                                "provocation" => s.provocation += pa.amount,
                                "fear_index" => s.fear_index += pa.amount,
                                _ => {}
                            }
                            next_system_states.insert(entity_id.clone(), s);
                        }
                    }
                    _ => {}
                }

                let sign = if pa.amount >= 0.0 { "+" } else { "" };
                new_action_logs.push(format!(
                    "[Day {}] {}: {} {}{:.2}",
                    new_date, pa.option_label, pa.target, sign, pa.amount
                ));

                // Action resolution spikes volatility
                if let Some(mut s) = next_system_states.get(entity_id).cloned() {
                    s.volatility = (s.volatility + pa.amount.abs() * 0.5).round_to(4);
                    next_system_states.insert(entity_id.clone(), s);
                }
            } else {
                still_pending.push(pa.clone());
            }
        }

        // --- GLOBAL VOLATILITY ECG ---
        let current_phase = state.active_phase;

        // 2. Component Drift (For each entity registered in metrics)
        for entity_id in next_metrics.keys().cloned().collect::<Vec<_>>() {
            let mut m = next_metrics.get(&entity_id).unwrap().clone();
            let mut s = next_system_states.get(&entity_id).unwrap().clone();
            let mut d = next_demographics.get(&entity_id).cloned().unwrap_or_default();
            
            let stability = m.stability;
            let phase = self.calculate_phase(stability, current_phase);

            let mut volt_decay_base = 0.0;

            match phase {
                PHASE_MUNDANE => {
                    volt_decay_base = -0.3;
                    m.cpi += rng.sample(Normal::new(0.05, 0.02).unwrap());
                    m.stock_market += rng.sample(Normal::new(10.0, 5.0).unwrap());
                }
                PHASE_TENSIONS => {
                    let df = (MUNDANE_THRESHOLD - stability) / 100.0;
                    volt_decay_base = 0.1;
                    m.cpi += rng.sample(Normal::new(df * 1.5, 0.5).unwrap());
                    m.stock_market -= rng.sample(Normal::new(df * 10.0, 5.0).unwrap());
                    m.unemployment += rng.sample(Normal::new(df * 0.005, 0.002).unwrap());
                }
                _ => { // FLASHPOINT
                    let df = (50.0 - stability) / 100.0;
                    volt_decay_base = 1.5;
                    m.cpi += rng.sample(Normal::new(df * 3.0, 1.5).unwrap());
                    m.stock_market -= rng.sample(Normal::new(df * 30.0, 15.0).unwrap());
                    m.unemployment += rng.sample(Normal::new(df * 0.02, 0.01).unwrap());
                }
            }

            // ECG Decay: 8% per tick toward 0
            let ecg_decay = s.volatility * 0.08;
            s.volatility = (s.volatility - ecg_decay + volt_decay_base).max(0.0).round_to(4);

            // GFI: (Vol * 0.4) + (Prov * 0.6)
            s.fear_index = (s.volatility * 0.4 + s.provocation * 0.6).round_to(4);

            // Demographic tensions
            d.working_class = (d.working_class - (m.cpi - 100.0) * 0.01).clamp(0.0, 100.0);
            d.elites = (d.elites - (s.volatility - 15.0) * 0.01).clamp(0.0, 100.0);
            d.state_security = (d.state_security - (s.fear_index * 0.01)).clamp(0.0, 100.0);

            // Re-calculate approval
            let avg_app = (d.working_class + d.elites + d.state_security) / 3.0;
            m.executive_approval = avg_app.round_to(4);

            next_metrics.insert(entity_id.clone(), m);
            next_system_states.insert(entity_id.clone(), s);
            next_demographics.insert(entity_id.clone(), d);
        }

        // Global Phase calculated from average stability for now
        let avg_stab = next_metrics.values().map(|m| m.stability).sum::<f64>() / next_metrics.len() as f64;
        let final_phase = self.calculate_phase(avg_stab, state.active_phase);

        State {
            turn_id: new_turn,
            current_date: new_date,
            active_phase: final_phase,
            metrics: next_metrics,
            demographics: next_demographics,
            ideology: state.ideology.clone(),
            system_states: next_system_states,
            pending_actions: still_pending,
            action_logs: new_action_logs.iter().cloned().take(30).collect(),
            intel_feed: state.intel_feed.clone(),
            volatility_history: state.volatility_history.clone(),
        }
    }

    fn calculate_phase(&self, stability: f64, current_phase: u8) -> u8 {
        if stability < TENSIONS_THRESHOLD {
            PHASE_FLASHPOINT
        } else if stability < MUNDANE_THRESHOLD {
            current_phase.max(PHASE_TENSIONS)
        } else {
            current_phase
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{MetricsComponent, DemographicsComponent, SystemComponent, PendingAction};
    use im::HashMap;

    fn create_mock_state() -> State {
        let mut metrics = HashMap::new();
        metrics.insert("PLAYER".to_string(), MetricsComponent {
            stability: 80.0,
            executive_approval: 50.0,
            cpi: 100.0,
            military_readiness: 50.0,
            stock_market: 1000.0,
            unemployment: 5.0,
        });

        let mut systems = HashMap::new();
        systems.insert("PLAYER".to_string(), SystemComponent {
            volatility: 10.0,
            provocation: 5.0,
            fear_index: 0.0,
        });

        let mut demographics = HashMap::new();
        demographics.insert("PLAYER".to_string(), DemographicsComponent {
            working_class: 50.0,
            elites: 50.0,
            state_security: 50.0,
        });

        State {
            turn_id: 0,
            current_date: "2025-01-20".to_string(),
            active_phase: PHASE_MUNDANE,
            metrics,
            demographics,
            ideology: HashMap::new(),
            system_states: systems,
            pending_actions: Vec::new(),
            action_logs: Vec::new(),
            intel_feed: Vec::new(),
            volatility_history: Vec::new(),
        }
    }

    #[test]
    fn test_chronos_immutability() {
        let chronos = Chronos;
        let state = create_mock_state();
        let next_state = chronos.tick(&state);

        assert_eq!(next_state.turn_id, 1);
        assert_eq!(next_state.current_date, "2025-01-21");
        assert_eq!(state.turn_id, 0);
        assert_eq!(state.metrics.get("PLAYER").unwrap().stability, 80.0);
    }

    #[test]
    fn test_action_resolution() {
        let chronos = Chronos;
        let mut state = create_mock_state();
        
        state.pending_actions.push(PendingAction {
            action_id: "test_1".to_string(),
            source_entity: "PLAYER".to_string(),
            target_entity: "PLAYER".to_string(),
            option_label: "Investment".to_string(),
            resolve_on_turn: 1,
            action_type: "metric".to_string(),
            target: "metric_1".to_string(), // stability
            amount: 5.0,
        });

        let next_state = chronos.tick(&state);
        
        let player_metrics = next_state.metrics.get("PLAYER").unwrap();
        // Stability should have increased
        assert!(player_metrics.stability > 80.0);
        assert_eq!(next_state.pending_actions.len(), 0);
    }

    #[test]
    fn test_phase_transition() {
        let chronos = Chronos;
        let mut state = create_mock_state();
        
        // Force low stability
        state.metrics = state.metrics.alter(|m| {
            let mut m = m.unwrap_or_default();
            m.stability = 30.0;
            Some(m)
        }, "PLAYER".to_string());
        
        let next_state = chronos.tick(&state);
        assert_eq!(next_state.active_phase, PHASE_FLASHPOINT);
    }
}
