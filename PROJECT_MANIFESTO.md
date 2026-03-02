# **PROJECT MANIFESTO: BRINKMANSHIP (SOVEREIGN DISPATCH)**

## **I. THE ARCHITECTURAL LAW: FUNCTIONAL IMMUTABILITY**

We do not manage state; we capture reality in snapshots. To ensure total transparency and "Time Travel" (Undo/Redo) capability, the engine must follow the **Redux-Style Pure Function Pattern**.

1. **State as a Frozen Artifact**: The `engine/state_manager.py` uses `frozen` Python dataclasses. Modification is a violation. Transitions only happen via `replace(state, **changes)`.
2. **The "Sourdough" Purge**: All legacy, hard-coded strings and "gamey" variables are deprecated. Everything is mapped through `/scenarios/[scenario_name]/scenario.json`.
3. **High-Resolution Stochasticity**: We use Gaussian math (`random.gauss`) to generate fractional, organic shifts in metrics. A 2.34% drop feels real; a 5% drop feels like a game.
4. **The Chaos Floor**: The `Chaos_Modifier` (+15.0% variance) is the "Black Swan" constant. The simulation is never safe.

---

## **II. THE AESTHETIC BIBLE: FINCHER-NOIR BASELINE**

The UI is not an interface; it is a **Sovereign Dashboard**. It must reflect the "weight of the office" through environmental storytelling.

1. **Chiaroscuro Composition**: Deep blacks (`#050505`), cold slate-grays, and sharp, single-source amber highlights (`#FFB000`).
2. **Brutalist Minimalism**: No "Health Bars." No "XP." We use **Waveform Oscilloscopes** and **Dossier Modals**. If stability is low, the UI doesn't turn red; the waveform becomes erratic and the screen "ghosts."
3. **Weighted Interaction**: Framer Motion transitions must be heavy (0.4s+). Power is slow and deliberate.

---

## **III. THE SOVEREIGN BRIDGE: FASTAPI INTERFACE**

The Python backend is the "Brain"; the React frontend is the "Eyes." They communicate via a strictly typed Pydantic bridge.

* **Backend**: FastAPI serving immutable JSON snapshots.
* **Frontend**: Next.js + Tailwind + TypeScript.
* **Persistence**: A `List[State]` history stack capped at 50 snapshots for memory-efficient "Rewind" capability.

---

## **IV. THE "PRIMARY METRIC" CONFIGURATION**
The legacy `primary_metric_a` is now officially standardized as **Global Stability**. 

Additionally, we have implemented the **Scarcity Index (metric_9)** as a core derivative metric. This variable tracks the availability of critical resources (Rare Earths, Mana, or Energy Credits) and is directly tied to the global fear and stability indices.
