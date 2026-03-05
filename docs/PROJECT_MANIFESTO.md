
# NOTE: this seems outdated, maybe has some good ideas.
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

## **IV. THE METRIC GAMEPLAY ENCYCLOPEDIA**

Each variable in the Sovereign Engine is designed to create specific psychological "friction" for the player.

### **1. Global Stability (metric_1) - [The Anchor]**
*   **Meaning**: The macro-equilibrium of the world. Represents the "health" of the simulation's current timeline.
*   **The Fun**: When this drops, the engine enters "Chronos Decay" mode. Everything breaks faster. It’s the timer that forces you to make hard, ugly choices.

### **2. Approval Rating (metric_2) - [The Shield]**
*   **Meaning**: Your political capital. Calculated as the weighted average of all demographic favor.
*   **The Fun**: Low approval triggers a "Soft End" (Coup/Impeachment). It limits your aggressive options; you can't go to war if the people are already in the streets.

### **3. CPI / Inflation (metric_3) - [The Boiling Frog]**
*   **Meaning**: The day-to-day cost of existence for the working class.
*   **The Fun**: It is a slow, stacking debuff. Players often ignore it until it reaches a tipping point where `demo_1` (Workers) turns violent. It forces economic trade-offs.

### **4. Institutional Trust (metric_4) - [The Structural Floor]**
*   **Meaning**: Faith in the courts, the bureaucracy, and the "Deep State." 
*   **The Fun**: Unlike Approval, this stays low for a long time. If it breaks, your orders might be ignored or leaked. It represents the "Passive Resistance" of the government.

### **5. Stock Market Index (metric_5) - [The Greed Gauge]**
*   **Meaning**: Real-time sentiment of the elite and corporate sectors.
*   **The Fun**: Haptic feedback. It reacts instantly to events, providing the "Juice" of the simulation. A sudden crash creates immediate panic for the player.

### **6. Bond Yields (metric_6) - [The Risk Horizon]**
*   **Meaning**: Long-term international faith in your state’s debt.
*   **The Fun**: High yields mean you can't borrow your way out of a crisis. It turns a "Bad Year" into a "Death Spiral."

### **7. Unemployment Rate (metric_7) - [The Street Pressure]**
*   **Meaning**: Percentage of the population without meaningful labor mapping.
*   **The Fun**: High unemployment turns every event into a riot. It’s the "Force Multiplier" for domestic unrest.

### **8. Oil / Energy Price (metric_8) - [The Catalyst]**
*   **Meaning**: The cost of global throughput.
*   **The Fun**: A "Lever Metric." Moving this affects CPI, Stock Market, and Allies instantly. It’s the main tool for foreign policy pressure.

### **9. Scarcity Index (metric_9) - [The Bottleneck]**
*   **Meaning**: Availability of scenario-critical resources (Rare Earths / Mana / Credits).
*   **The Fun**: It creates artificial scarcity. You might have the money (metric_5), but if the Scarcity Index is high, you can't build the solution. It’s the ultimate strategic blocker.

---

## **V. THE DATA-DRIVEN DOCTRINE**

Brinkmanship is not a game; it is an **Engine for Geopolitical Scenarios**. To preserve architectural integrity, there must be no "ad-hoc" solutions in the codebase.

1. **Total Configuration**: If a feature requires a specific UI element (like a "Nuclear Stockpile" readout or a "Great Power" pin), it must be defined in the `scenario.json` and parsed by the frontend.
2. **Theme Agnosticism**: The engine makes zero assumptions about the timeline. A "Modern" scenario and a "Fantasy" scenario use the same React components, differing only in their JSON payloads.
3. **The Sovereign Dispatch**: Major architectural shifts must be reported to Management to ensure compliance with the "Fincher-Noir" aesthetic and functional immutability.

---

