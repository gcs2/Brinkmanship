# CHANGELOG.md

* **v0.2.0 - The Functional Pivot (Current)**
* `[Architecture]` - Shifted to Immutable Dataclasses for State.
* `[Logic]` - Replaced Integer Math with Floating Point (4-decimal).
* `[Scenario]` - Decoupled strings; added Config-driven labels.
* `[RNG]` - Replaced Flat Modifiers with Gaussian Probability Rolls.

## Change History

* `[scenarios/*/config.json]` -> `[Scenario]` Decoupled strings into JSON configs to support multiple thematic domains. -> `[Verified]` Created and structured accurately.
* `[engine/state_manager.py]` -> `[Architecture]` Refactored into Immutable Dataclass with Chronos integration (Datetime/decay). -> `[Verified]` Pure functions (`update_turn`, `apply_action`) operational.
* `[engine/event_processor.py]` -> `[RNG]` Shifted to Gaussian distribution. Abstracted metric targeting based on thresholds. -> `[Pending]` Requires full integration test.
* `[main.py]` -> `[Architecture]` Implemented `List[State]` persistence array and boot-time config loader for hot-swapping themes. -> `[Verified]` Test runs complete.
