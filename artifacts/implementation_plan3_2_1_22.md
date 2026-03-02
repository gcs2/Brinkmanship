# Phase 13: Structural Overhaul & Scenario Deepening

## Goal Description
Management has flagged critical UX friction in the Sovereign Interface and requested an expansion of the simulation's depth. The current implementation relies on instantaneous gratification (decisions applying immediately), blocks the UI with jarring modals, and lacks procedural "peacetime" pacing. This plan addresses these structural shortcomings and implements the tools required for highly configurable, open-world scenarios.

## 1. Structural Shortcomings

### 1.1 Volatility Stabilization & Meaningful Oscillators
*   **The Issue**: The [WaveformOscillator](file:///c:/Users/zephy/Documents/Brinkmanship/ui/src/app/components/WaveformOscillator.tsx#10-71) is currently a continuous looping sine wave, which feels "gamey" regardless of actual input.
*   **The Fix**: Update [WaveformOscillator.tsx](file:///c:/Users/zephy/Documents/Brinkmanship/ui/src/app/components/WaveformOscillator.tsx) to act as an ECG: perfectly flat and stable during low-volatility ticks, but spiking sharply only when `state.system.volatility` is high or a recent shock occurs. Volatility in `state_manager` will decay naturally to 0 unless provoked.

### 1.2 UX Friction: Non-Blocking UI & Advanced Chronos
*   **The Issue**: The "Advance Chronos" trigger brings up a Dossier Modal that completely overtakes the screen, destroying environmental immersion.
*   **The Fix**: 
    - Convert [DossierModal.tsx](file:///c:/Users/zephy/Documents/Brinkmanship/ui/src/app/components/DossierModal.tsx) into a `DossierPane` that slides in from the right or left, occupying 30% of the screen, allowing the Tactical Map and telemetrics to remain highly visible.
    - Remove the hardcoded "EVT-CHINA-EMBARGO" from the frontend test loop; the frontend will query the backend for pending events on each chronos tick.

### 1.3 Delayed Gratification & Action Feedback
*   **The Issue**: Clicking an option immediately shifts metrics (instant gratification). It provides no audit trail of what specifically moved.
*   **The Fix (Backend)**: Introduce an **Action Queue** in [state_manager.py](file:///c:/Users/zephy/Documents/Brinkmanship/engine/state_manager.py). Decisions have an `execution_lag` (e.g., 5 days). 
*   **The Fix (Frontend)**: Add a **Sovereign Ticker / Chronicle Log** component. It will read out active operations ("Op Sentinel resolving in 3 days...") and log post-action reports ("Impact: Stability -2.3, Scarcity +10").

### 1.4 State Persistence (Save/Load)
*   **The Issue**: No way to preserve long playthroughs.
*   **The Fix**: Create `/api/save` and `/api/load` endpoints in [main.py](file:///c:/Users/zephy/Documents/Brinkmanship/main.py) that serialize the `state_history` into `/saves/current_run.json`. Add "Anchor State" and "Recall State" text buttons to the header UI.

## 2. Configurability of Existing Functionality (The Content)

### 2.1 The "Stochastic Escalation" Mechanics
We need scenarios to feel like an open world, transitioning from peace to war naturally.
*   **Phase Definitions**: Add `escalation_phase` to the state (Mundane -> Tension -> Flashpoint -> Kinetic). 
*   **Incremental Growth**: Ensure events during the "Mundane" phase focus on minor shifts (e.g., fractional economic development, mundane struggles).
*   **Ambient RNG Injection**: The [EventProcessor](file:///c:/Users/zephy/Documents/Brinkmanship/engine/event_processor.py#6-73) will randomly inject "Flavor Events" (e.g., diplomatic gaffes, minor shortages) to ensure no two playthroughs are alike.

### 2.2 Expanding Decision Complexity 
*   **The Issue**: Events currently have binary (2) options.
*   **The Fix**: Write a massive scenario content update in [scenarios/modern_geopolitics/scenario.json](file:///c:/Users/zephy/Documents/Brinkmanship/scenarios/modern_geopolitics/scenario.json). 
    - Re-write events to include 3-5 options. 
    - Options will now include branching RNG paths (Success, Partial Success, Catastrophic Failure) weighted heavily by the 9 metrics (Rule of Law, Institutional Trust).

## 3. Documentation Requirements
Per **AI_RULES.md**, we will codify all of the above:
1.  Append the "Lag Time Mechanism" and "Action Queue" concepts to [PRD_MASTER.md](file:///c:/Users/zephy/Documents/Brinkmanship/PRD_MASTER.md).
2.  Update the [SCENARIO_CREATION_GUIDE.md](file:///c:/Users/zephy/Documents/Brinkmanship/SCENARIO_CREATION_GUIDE.md) to explain how writers can structure 5-option events and define lag time integers.

## User Review Required
> [!IMPORTANT]
> **Management Approval Requested**: Do these structural fixes align with the "Perfect Geopolitical Simulation" vision? Once approved, we will transition to EXECUTION mode to build the Action Queue and Non-Blocking UI.
