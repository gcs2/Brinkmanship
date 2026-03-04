This is the precise architectural roadmap required to elevate *Brinkmanship* from an intriguing simulation to a AAA-quality Grand Strategy experience.

To achieve that highly elusive "fun" factor, the engine must pivot away from a static spreadsheet and toward a deeply reactive, interconnected world. The player needs to feel the friction of opposing forces. The environment must push back with the same level of ideological depth and unforgiving consequence found in the most complex, systemic RPGs. Furthermore, the economic layer must evolve beyond mere numbers to reflect the genuine, compounding risks of a real-world financial ecosystem.

Here is the **Master Priority Queue** formatted specifically for Antigravity to consume and execute. Copy and paste this directly to the agent.

---

# **ARCHITECTURAL DIRECTIVE: THE GRAND STRATEGY QUEUE**

**TO:** Antigravity (Principal Simulation Architect)
**FROM:** Executive Management
**SUBJECT:** Big-Picture Implementation & AAA Priority Queue for Phase 14 and Future Works

Antigravity, we are initiating a massive expansion of the *Brinkmanship* engine. The objective is to build an autonomous, reactive world that provides a AAA-quality gameplay loop. The environment must be actively hostile, ideologically complex, and economically rigorous.

To accomplish this, you must understand the entire codebase as a series of interlocking dependencies. You cannot build the "Overton Window" without first establishing the "Ideology Matrix" in the `StateManager`. You cannot simulate "Global Trade" without first implementing "Regional Event Decks."

Below is the **Strict Priority Queue** for the upcoming development cycles. You will execute these in order, ensuring each phase is perfectly integrated into the functional, immutable architecture before advancing.

---

### **PRIORITY TIER 1: THE REACTIVE FOUNDATION & LEGIBILITY**

*A game is only fun if the world is alive, and complex systems are only engaging if the player understands them. We must build the AI actors and immediately construct the tutorial.*

1. **[PHASE 14.1 / DIP-002] The AI Actor System (Diplomatic AI Service):**
* **Why:** The "Player vs. Spreadsheet" model is dead. We need an `ai_director.py` that evaluates the global state and queues autonomous actions.
* **Implementation:** Great Powers need hidden "Drives" (Expansionist, Isolationist). They must be able to hit the same `event_processor` pipeline the player uses.


2. **[NAR-001] The Sovereign Introduction (Tutorial Engine):**
* **Why:** *Management Mandate.* This is the highest-priority narrative task. We cannot introduce complex AI parity without teaching the player the mechanics.
* **Implementation:** Build a scripted, on-rails EU4-style scenario (e.g., "The Persian Gulf Crisis") that safely exposes the user to the API backend, Action Latency, and the Ideology compass.



---

### **PRIORITY TIER 2: IDEOLOGICAL DEPTH & REPLAYABILITY**

*Players engage with Grand Strategy for the fantasy of radical change. The political system must have deep ethical and philosophical consequences.*

3. **[PHASE 14.2] The Overton Window & Government Shifts:**
* **Why:** Forces the player to navigate the ideological spectrum.
* **Implementation:** Update `state_manager.py` with a 2D vector (`Authoritarian <-> Libertarian`, `Planned <-> Free Market`). Implement the logic where extreme "Chaos" or specific metric failures unlock radical transitions (Technocracy, Fascism, Anarcho-Capitalism).


4. **[PHASE 14.3] Country-Specific Disasters (Regional Decks):**
* **Why:** Prevents every playthrough from feeling identical.
* **Implementation:** Refactor the scenario loader to handle `events_[country_id].json`. Implement the hidden "Disaster Counters" that tick up during systemic mismanagement (e.g., ticking toward a Communist Revolution when Elite Trust zeroes out).



---

### **PRIORITY TIER 3: THE MATERIAL STAKES (ECONOMIC RIGOR)**

*The economy must carry genuine market risk, reflecting real-world financial friction.*

5. **[ECO-001 & ECO-002] Industry, Resources, & Global Trade:**
* **Why:** The "Scarcity Coefficient" needs a physical grounding.
* **Implementation:** Implement vector-based trade pathways. If a physical choke point is closed, the engine must dynamically calculate price spikes across dependent tech and energy sectors.


6. **[ADV-001] Cyber-Economic Sabotage:**
* **Why:** Gives the player offensive financial mechanics.
* **Implementation:** Introduce the ability to actively "Short" a rival's currency. This must be tied heavily to the new global trade system, carrying immense risk if the sabotage fails.



---

### **PRIORITY TIER 4: THE SHADOW WARS & FORCE PROJECTION**

*End-game complexity where military and optics become tools of immense pressure.*

7. **[POL-001 & POL-004] Optics, Social Media, & The Deep State:**
* **Why:** Modern warfare is won in the perception filter.
* **Implementation:** Build the algorithmic influence mechanics. Separate the player's "Deep State" objectives from the transient "Elected Administrations," forcing the player to adapt their long-term strategies to shifting political winds.


8. **[MIL-001 & MIL-003] Asset Management & The Nuclear Sprint:**
* **Why:** High-maintenance, high-stakes kinetic power.
* **Implementation:** Track discrete military assets with heavy economic overhead. Integrate the $2 Trillion "Nuclear Sprint" as a massive, multi-turn project that severely penalizes domestic infrastructure.



---