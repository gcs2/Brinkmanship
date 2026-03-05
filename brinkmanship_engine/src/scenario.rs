/// # scenario.rs — Strictly Typed Scenario Definition (IDX-012)
///
/// Implements the `ScenarioDef` + `ActorDef` structs for sovereign scenario loading.
/// Invalid scenario files **panic at engine boot**, not during gameplay.
///
/// ## Validation Rules (enforced at load time)
/// - `starting_position` coordinates must be in `[-5.0, +5.0]`
/// - `faction.influence` values per actor must sum to 100.0 (±1.0 tolerance)
/// - `estate.influence` values per actor must sum to 100.0 (±1.0 tolerance)
///
/// ## Cross-Reference
/// - `docs/FUTURE_WORKS.md` IDX-012
/// - `implementation_plan_phase16.md` §ScenarioDef
/// - `AI_RULES.md` Rule 10 (Radical Change Disclosure — not applicable here, new file)
///
/// ## Usage
/// ```ignore
/// let def = ScenarioDef::load_from_file("scenarios/persian_gulf.json");
/// // Panics on boot if the JSON violates any constraint.
/// ```
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::state::EntityId;

// ────────────────────────────────────────────────────────────────────────────
// CORE SCENARIO STRUCTS
// ────────────────────────────────────────────────────────────────────────────

/// Top-level scenario definition file. One file = one geopolitical scenario.
///
/// Deserialized from `scenarios/<scenario_id>.json`. All fields required.
/// Load via `ScenarioDef::load_from_str()` or `ScenarioDef::load_from_file()`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScenarioDef {
    /// Unique machine-readable scenario identifier. e.g., "persian_gulf_crisis"
    pub id: String,

    /// Human-readable scenario name. Displayed in the UI title.
    pub name: String,

    /// Narrative description shown to the player on scenario load.
    pub description: String,

    /// Simulation start date in `YYYY-MM-DD` format.
    pub start_date: String,

    /// One entry per sovereign actor on the Structural Matrix.
    /// Key = `EntityId` (e.g., "PLAYER", "USA", "CHN").
    pub actors: HashMap<EntityId, ActorDef>,
}

/// Per-actor definition block within a scenario file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActorDef {
    /// Starting position on the 11×11 Structural Matrix.
    /// Both coordinates must be in `[-5.0, +5.0]` — panics if not.
    pub starting_position: (f64, f64),

    /// Initial Authority pool. Typically 50–200.
    pub authority_start: f64,

    /// Authority generation rate per tick before modifiers.
    pub authority_generation_rate: f64,

    /// Named factions shaping the Overton Window.
    /// Influences must sum to 100.0 (±1.0 tolerance) — panics if not.
    pub factions: Vec<FactionDef>,

    /// Named estates that drive Approval and Estate physics.
    /// Influences must sum to 100.0 (±1.0 tolerance) — panics if not.
    pub estates: Vec<EstateDef>,
}

/// A single faction within an actor's scenario definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactionDef {
    /// Faction name. e.g., "MAGA", "Progressives", "CCP Hardliners"
    pub name: String,

    /// Relative influence weight (0.0–100.0). Must sum to 100 across all factions.
    pub influence: f64,

    /// Ideological alignment on the Structural Matrix `(econ_x, auth_y)`.
    /// Both coordinates in `[-5.0, +5.0]`.
    pub alignment: (f64, f64),
}

/// A single estate within an actor's scenario definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstateDef {
    /// Estate name. e.g., "Military", "Capital", "Labor", "Clergy"
    pub name: String,

    /// Relative influence weight (0.0–100.0). Must sum to 100 across all estates.
    pub influence: f64,

    /// Starting happiness (0.0–100.0).
    pub happiness: f64,
}

// ────────────────────────────────────────────────────────────────────────────
// LOADING AND VALIDATION
// ────────────────────────────────────────────────────────────────────────────

impl ScenarioDef {
    /// Load and validate a `ScenarioDef` from a JSON string.
    ///
    /// # Panics
    /// Panics if:
    /// - JSON is malformed
    /// - Any `starting_position` coordinate is outside `[-5.0, +5.0]`
    /// - Any actor's faction influences don't sum to 100.0 (±1.0)
    /// - Any actor's estate influences don't sum to 100.0 (±1.0)
    pub fn load_from_str(json: &str) -> Self {
        let def: ScenarioDef = serde_json::from_str(json)
            .unwrap_or_else(|e| panic!("ScenarioDef: JSON parse error — {e}"));
        def.validate();
        def
    }

    /// Load and validate a `ScenarioDef` from a JSON file path.
    ///
    /// # Panics
    /// Panics if the file cannot be read or fails validation.
    pub fn load_from_file(path: &str) -> Self {
        let json = std::fs::read_to_string(path)
            .unwrap_or_else(|e| panic!("ScenarioDef: could not read '{path}' — {e}"));
        Self::load_from_str(&json)
    }

    /// Internal validation. Called automatically by all load methods.
    /// Panics with a human-readable error on the first violation found.
    fn validate(&self) {
        const COORD_RANGE: std::ops::RangeInclusive<f64> = -5.0..=5.0;
        const INFLUENCE_SUM: f64 = 100.0;
        const INFLUENCE_TOLERANCE: f64 = 1.0;

        for (actor_id, actor) in &self.actors {
            // ── Starting Position ───────────────────────────────────────────
            let (x, y) = actor.starting_position;
            if !COORD_RANGE.contains(&x) || !COORD_RANGE.contains(&y) {
                panic!(
                    "ScenarioDef[{}]: starting_position ({:.2}, {:.2}) is outside valid range [-5.0, +5.0]. \
                     Fix the scenario file — invalid positions crash at runtime.",
                    actor_id, x, y
                );
            }

            // ── Faction Influence Sum ───────────────────────────────────────
            if !actor.factions.is_empty() {
                let faction_sum: f64 = actor.factions.iter().map(|f| f.influence).sum();
                if (faction_sum - INFLUENCE_SUM).abs() > INFLUENCE_TOLERANCE {
                    panic!(
                        "ScenarioDef[{}]: faction influences sum to {:.2}, expected 100.0 (±{:.1}). \
                         Adjust faction weights in the scenario file.",
                        actor_id, faction_sum, INFLUENCE_TOLERANCE
                    );
                }

                // Validate faction alignment coordinates
                for faction in &actor.factions {
                    let (fx, fy) = faction.alignment;
                    if !COORD_RANGE.contains(&fx) || !COORD_RANGE.contains(&fy) {
                        panic!(
                            "ScenarioDef[{}]: faction '{}' alignment ({:.2}, {:.2}) outside [-5.0, +5.0].",
                            actor_id, faction.name, fx, fy
                        );
                    }
                }
            }

            // ── Estate Influence Sum ────────────────────────────────────────
            if !actor.estates.is_empty() {
                let estate_sum: f64 = actor.estates.iter().map(|e| e.influence).sum();
                if (estate_sum - INFLUENCE_SUM).abs() > INFLUENCE_TOLERANCE {
                    panic!(
                        "ScenarioDef[{}]: estate influences sum to {:.2}, expected 100.0 (±{:.1}). \
                         Adjust estate weights in the scenario file.",
                        actor_id, estate_sum, INFLUENCE_TOLERANCE
                    );
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────────────────────────
// UNIT TESTS — IDX-012 (Rule 0: Test Everything)
// ────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_scenario_json() -> &'static str {
        r#"{
            "id": "test_scenario",
            "name": "Test Scenario",
            "description": "Used in unit tests.",
            "start_date": "2025-01-20",
            "actors": {
                "PLAYER": {
                    "starting_position": [1.0, 0.0],
                    "authority_start": 100.0,
                    "authority_generation_rate": 3.5,
                    "factions": [
                        {"name": "Center", "influence": 60.0, "alignment": [0.5, 0.0]},
                        {"name": "Right", "influence": 40.0, "alignment": [2.0, 0.5]}
                    ],
                    "estates": [
                        {"name": "Capital", "influence": 50.0, "happiness": 65.0},
                        {"name": "Labor", "influence": 50.0, "happiness": 55.0}
                    ]
                }
            }
        }"#
    }

    #[test]
    fn test_valid_scenario_loads_cleanly() {
        let def = ScenarioDef::load_from_str(valid_scenario_json());
        assert_eq!(def.id, "test_scenario");
        assert!(def.actors.contains_key("PLAYER"));
        let player = &def.actors["PLAYER"];
        assert_eq!(player.starting_position, (1.0, 0.0));
        assert_eq!(player.authority_start, 100.0);
        assert_eq!(player.factions.len(), 2);
        assert_eq!(player.estates.len(), 2);
    }

    #[test]
    #[should_panic(expected = "starting_position")]
    fn test_position_out_of_range_panics_at_load() {
        let json = r#"{
            "id": "bad", "name": "Bad", "description": "", "start_date": "2025-01-01",
            "actors": {
                "PLAYER": {
                    "starting_position": [6.0, 0.0],
                    "authority_start": 100.0, "authority_generation_rate": 3.0,
                    "factions": [{"name": "A", "influence": 100.0, "alignment": [0.0, 0.0]}],
                    "estates": [{"name": "E", "influence": 100.0, "happiness": 50.0}]
                }
            }
        }"#;
        ScenarioDef::load_from_str(json);
    }

    #[test]
    #[should_panic(expected = "faction influences sum to")]
    fn test_faction_sum_mismatch_panics() {
        let json = r#"{
            "id": "bad", "name": "Bad", "description": "", "start_date": "2025-01-01",
            "actors": {
                "PLAYER": {
                    "starting_position": [0.0, 0.0],
                    "authority_start": 100.0, "authority_generation_rate": 3.0,
                    "factions": [
                        {"name": "A", "influence": 60.0, "alignment": [0.0, 0.0]},
                        {"name": "B", "influence": 20.0, "alignment": [1.0, 0.0]}
                    ],
                    "estates": [{"name": "E", "influence": 100.0, "happiness": 50.0}]
                }
            }
        }"#;
        ScenarioDef::load_from_str(json);
    }

    #[test]
    #[should_panic(expected = "estate influences sum to")]
    fn test_estate_sum_mismatch_panics() {
        let json = r#"{
            "id": "bad", "name": "Bad", "description": "", "start_date": "2025-01-01",
            "actors": {
                "PLAYER": {
                    "starting_position": [0.0, 0.0],
                    "authority_start": 100.0, "authority_generation_rate": 3.0,
                    "factions": [{"name": "A", "influence": 100.0, "alignment": [0.0, 0.0]}],
                    "estates": [
                        {"name": "E1", "influence": 40.0, "happiness": 50.0},
                        {"name": "E2", "influence": 40.0, "happiness": 50.0}
                    ]
                }
            }
        }"#;
        ScenarioDef::load_from_str(json);
    }

    #[test]
    #[should_panic(expected = "faction")]
    fn test_faction_alignment_out_of_range_panics() {
        let json = r#"{
            "id": "bad", "name": "Bad", "description": "", "start_date": "2025-01-01",
            "actors": {
                "PLAYER": {
                    "starting_position": [0.0, 0.0],
                    "authority_start": 100.0, "authority_generation_rate": 3.0,
                    "factions": [{"name": "Extreme", "influence": 100.0, "alignment": [10.0, 0.0]}],
                    "estates": [{"name": "E", "influence": 100.0, "happiness": 50.0}]
                }
            }
        }"#;
        ScenarioDef::load_from_str(json);
    }

    #[test]
    fn test_influence_sum_within_tolerance() {
        // 99.5 is within ±1.0 of 100.0 — should not panic
        let json = r#"{
            "id": "ok", "name": "OK", "description": "", "start_date": "2025-01-01",
            "actors": {
                "PLAYER": {
                    "starting_position": [0.0, 0.0],
                    "authority_start": 100.0, "authority_generation_rate": 3.0,
                    "factions": [
                        {"name": "A", "influence": 60.0, "alignment": [0.0, 0.0]},
                        {"name": "B", "influence": 39.5, "alignment": [1.0, 0.0]}
                    ],
                    "estates": [{"name": "E", "influence": 100.0, "happiness": 50.0}]
                }
            }
        }"#;
        let def = ScenarioDef::load_from_str(json);
        assert_eq!(def.actors["PLAYER"].factions.len(), 2);
    }

    #[test]
    fn test_scenario_with_no_factions_or_estates_validates() {
        // Empty factions/estates are allowed (skips sum check)
        let json = r#"{
            "id": "empty", "name": "Empty", "description": "", "start_date": "2025-01-01",
            "actors": {
                "PLAYER": {
                    "starting_position": [-3.0, 2.0],
                    "authority_start": 50.0, "authority_generation_rate": 2.0,
                    "factions": [],
                    "estates": []
                }
            }
        }"#;
        let def = ScenarioDef::load_from_str(json);
        assert_eq!(def.actors["PLAYER"].starting_position, (-3.0, 2.0));
    }
}
