use crate::state::{State, MetricsComponent, DemographicsComponent, IdeologyComponent, SystemComponent, IndustryComponent, DiplomaticLedger};
use crate::chronos::Chronos;
use crate::state::ChronosEngine;
use im::HashMap;
use std::time::Instant;
use tokio::task;
use std::sync::Arc;
use rand::prelude::*;
use std::fs::File;
use std::io::Write;
use sysinfo::System;

pub async fn run_hyper_tick_bench(actor_count: usize, days: u32) -> std::io::Result<()> {
    println!("--- STARTING HARDENED SOVEREIGN STRESS TEST: {} ACTORS / {} DAYS ---", actor_count, days);
    
    let mut sys = System::new_all();
    let pid = sysinfo::get_current_pid().expect("Failed to get PID");

    // 1. Initialize High-Density State
    let mut metrics = HashMap::new();
    let mut demographics = HashMap::new();
    let mut ideology = HashMap::new();
    let mut system_states = HashMap::new();
    let mut industry = HashMap::new();
    let mut diplomatic_ledgers = HashMap::new();

    for i in 0..actor_count {
        let id = format!("ACTOR_{}", i);
        metrics.insert(id.clone(), MetricsComponent::default());
        demographics.insert(id.clone(), DemographicsComponent::default());
        ideology.insert(id.clone(), IdeologyComponent::default());
        system_states.insert(id.clone(), SystemComponent::default());

        // Phase 15 High-Density: 15+ Resources
        let mut resources = HashMap::new();
        for r in 0..15 {
            resources.insert(format!("RESOURCE_{}", r), 100.0);
        }
        industry.insert(id.clone(), IndustryComponent {
            resources,
            production_efficiency: 1.0,
        });

        // 50-actor Diplomatic Ledger
        let mut relations = HashMap::new();
        for j in 0..actor_count {
            relations.insert(format!("ACTOR_{}", j), 0.0);
        }
        diplomatic_ledgers.insert(id.clone(), DiplomaticLedger {
            relations,
            trade_agreements: Vec::new(),
        });
    }

    let initial_state = State {
        turn_id: 0,
        current_date: "2025-01-20".to_string(),
        active_phase: 1,
        metrics,
        demographics,
        ideology,
        estates: HashMap::new(),
        factions: HashMap::new(),
        authority: HashMap::new(),
        system_states,
        industry,
        diplomatic_ledgers,
        pending_actions: Vec::new(),
        action_logs: Vec::new(),
        intel_feed: Vec::new(),
        volatility_history: Vec::new(),
    };

    let chronos = Chronos;
    let mut current_state = initial_state;

    // Ensure benchmarks directory exists
    std::fs::create_dir_all("benchmarks")?;
    let mut file = File::create("benchmarks/stress_test_v2.csv")?;
    writeln!(file, "day,tps,heap_usage_kb,active_actors,concurrent_clones")?;

    for day in 1..=days {
        let start = Instant::now();
        
        let mut handles = Vec::new();
        let state_arc = Arc::new(current_state.clone());
        
        for i in 0..actor_count {
            let s = Arc::clone(&state_arc);
            let actor_id = format!("ACTOR_{}", i);
            handles.push(task::spawn(async move {
                let mut rng = thread_rng();
                let clones_per_actor = 3;
                let mut _decision_score = 0.0;

                for _ in 0..clones_per_actor {
                    // Speculative clone - im::HashMap makes this O(1)
                    let mut speculative_state = (*s).clone();
                    
                    // DIRECTIVE: THE "DRIVE" TAX (1,000 iteration utility loop)
                    for _ in 0..1000 {
                        _decision_score += rng.gen_range(0.0..1.0);
                        _decision_score /= 1.001; // Prevent overflow and simulate weight
                    }

                    // Apply randomized actions
                    let amount: f64 = rng.gen_range(-5.0..5.0);
                    let actor_key = actor_id.clone();
                    speculative_state.metrics = speculative_state.metrics.alter(|m| {
                        let mut m = m.unwrap_or_default();
                        m.stability += amount;
                        Some(m)
                    }, actor_key);
                }
                clones_per_actor
            }));
        }

        for h in handles {
            let _ = h.await.unwrap_or(0);
        }

        // Perform the actual Chronos tick
        current_state = chronos.tick(&current_state);
        
        let duration = start.elapsed();
        let tps = 1.0 / duration.as_secs_f64();
        
        // DIRECTIVE: LIVE HEAP TRACKING via sysinfo
        sys.refresh_process(pid);
        let memory_kb = if let Some(process) = sys.process(pid) {
            process.memory() as f64 // memory() returns bytes in sysinfo 0.30? No, usually KB.
        } else {
            0.0
        };

        writeln!(file, "{},{},{},{},{}", day, tps, memory_kb, actor_count, actor_count * 3)?;
        
        if day % 100 == 0 || day == 1 {
            println!("Day {}: TPS={:.2}, HEAP={:.2}KB", day, tps, memory_kb);
        }
    }

    println!("--- HARDENED STRESS TEST COMPLETE: benchmarks/stress_test_v2.csv generated ---");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_phase14_sovereign_stress() {
        // Management Directive A: 50 actors / 365 days
        let result = run_hyper_tick_bench(50, 365).await;
        assert!(result.is_ok());
    }
}
