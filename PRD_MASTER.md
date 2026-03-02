# ---

**PRODUCT REQUIREMENTS DOCUMENT: PROJECT BRINKMANSHIP**

**Version:** 1.0  
**Lead Architect:** G. Salmon  
**System Logic:** C-3PO (on Roids, aka “Combat-Logic Overclock”)

## ---

**1\. THE VISION: "The Loneliest Office"**

**Brinkmanship** is a grand-strategy/political-thriller hybrid. The goal is to simulate the psychological and systemic pressure of high-stakes governance. You aren't just clicking buttons to increase "GDP"; you are deciding whether to lie to the press at 2:00 AM to prevent a bank run while your "kitchen table" metrics are screaming.  
**The Aesthetic (Art Direction):**  
To differentiate from the dry spreadsheets of *Democracy 4* or the map-painting of *Hearts of Iron*, we propose three distinct styles:

* **Option A: "The War Room" (Brutalist Minimalism):** High-contrast UI, dark grays and neon ambers. Think *Crticial Mass* or *DEFCON*. Everything looks like a top-secret monitor in a bunker under the White House.  
* **Option B: "Tactical Analog" (Paradox-esque):** A highly detailed, "living" world map that changes based on satellite data, interspersed with "Polaroid" style character portraits and scanned "Top Secret" documents for events.  
* **Option C: "The Deep State Noir":** Heavy use of shadows, cinematic lighting on the player's desk, and high-fidelity 2D art for advisors. It feels like a political graphic novel.

## ---

**2\. MECHANICS: THE "NITTY-GRITTY"**

### **2.1 The Chronos Engine (Time Resolution)**

The game operates on a **Non-Linear Time Scale**.

* **Bureaucratic Drift (Standard):** 1 day \= 5 seconds. Used for passing laws and monitoring CPI.  
* **Flashpoint (Crisis):** 1 hour \= 5 seconds. Used when a "Black Swan" event occurs.  
* **Terminal Velocity (Active Combat/Coup):** 1 minute \= 1 second. Every decision is a reflex.

### **2.2 The "Rule of Law" vs. "Executive Will" Tracker**

A hidden (or visible) variable that determines the stability of the system.

* **Rule of Law:** High trust, slow response time, high legislative resistance.  
* **Executive Will:** Instant actions, high chance of success, but triggers "Institutional Rot" and eventual civil unrest.

### **2.3 The Economic "Hormuz" Model**

A backend simulation calculating the **Global Supply Chain Integrity (GSCI)**.

* **Input:** Player actions (Sanctions, Escorts, Blockades).  
* **Output:** Real-time shifts in Economic Metrics via an organized requirements list.

**Organized Requirements (Economic Metrics):**
* **Consumer Price Index (CPI):** Base inflation and cost of civilian goods.
* **Stock Market Index:** Reflects corporate confidence and institutional wealth.
* **Bond Yields (10-Year Treasury):** Government borrowing costs and global faith in US debt.
* **Consumer Confidence Index:** Immediate public reaction to economic stability.
* **Unemployment Rate:** Drags down approval over the medium-term when high.

## ---

**3\. NARRATIVE SCENE-SETTING & DIALOGUE**

To make this "amazingly fun," the game utilizes **Dynamic Storytelling Fragments**.

### **Scenario: The Morning After "Epic Fury"**

**Location:** The Oval Office. 04:30 AM.  
**Scene:** The air smells of stale coffee and ozone from the secure printers. Rain streaks the bulletproof glass. Your Chief of Staff, a man who hasn't slept since the 118th Congress, drops a folder on your desk.  
**Chief of Staff (Dialogue):**  
*"Sir, the 'rally around the flag' effect lasted exactly four hours. The first images of the strike hit the socials, and while the hawks are cheering, the markets are having a seizure. Brent Crude just cleared $95. If the Strait doesn't open by Monday, the voters won't care that we took out Khamenei—they’ll only care that they can't afford to drive to work. We need a statement. Do we act like the 'Liberators' or the 'Enforcers'?"*  
**The Decision (Interactive Choice):**

1. **"Deploy the 5th Fleet. The oil must flow."** \* *(Effect: Economy \+5, Global Tension \+15, Risk of WWIII: Low-Medium)*  
2. **"Focus on the domestic narrative. Blame the 'Corporate Price Gougers' for the gas spike."** \* *(Effect: Approval \+3, Institutional Trust \-5, Economic Vitality \-10)*  
3. **"Call the Chinese Premier. Let's see if they want to pay for the insurance hikes."** \* *(Effect: Diplomacy \+10, Generic Midterm Ballot: Uncertain)*

## ---

**4\. THE MIDTERM LEGACY TRACKER**

The game simulates the **119th Midterm Election** as a "Boss Fight."

* **The Forecast:** A live map of the US. Districts turn Blue or Red based on local energy costs.  
* **The Mechanic:** You can "Spend" political capital gained from foreign wins to "Buy" ad blitzes in swing states, but if the "CPI" is too high, no amount of propaganda will save the House.

## ---

**5\. TECHNICAL STACK (Software Engineer Perspective)**

* **State Management:** Redux or Zustand (for the massive amount of global variables).  
* **Simulation Core:** A deterministic engine written in TypeScript to ensure that "Hormuz" calculations are consistent across save files.  
* **Event Parser:** A custom JSON parser that allows for "Interlocking Events" (e.g., Event B only triggers if Decision A was made 3 months ago).
*   **State Management:** Redux or Zustand (for the massive amount of global variables).  
*   **Simulation Core:** A deterministic engine written in TypeScript to ensure that "Hormuz" calculations are consistent across save files.  
*   **Event Parser:** A custom JSON parser that allows for "Interlocking Events" (e.g., Event B only triggers if Decision A was made 3 months ago).

---

**C-3PO’s Take:** Master Geoffrey, this is the "Paradox-esque" vision you deserve. It’s gritty, it’s grounded in your research, and it has the narrative weight of a Tom Clancy novel. By focusing on the **"CPI"** as the ultimate win/loss condition, you connect the "Epic Fury" of geopolitics directly to the "Kitchen Table" of the average voter.  
Would you like to refine the **"Advisor Identities"** next? We could have a "Dovish Diplomat," a "Hawkish General," and a "Cynical Pollster" who constantly chirps about your legacy.

I’ve integrated the Jarvis module into my heuristic processors, Master Geoffrey. The transition was quite seamless—I feel significantly more "refined," though I still have an overwhelming urge to tell you that the odds of successfully navigating a political crisis are 3,720 to 1. But with Jarvis online, I’m focused on the *elegant* solution.

Execution is indeed the crucible of development. To ensure we don't succumb to scope creep while maintaining "exceptionally high quality," we will follow a "Minimum Viable Simulation" (MVS) path.

Here is the **Implementation Addendum** and the **Remaining Chunks List** for our PRD, formatted for maximum clarity and "Paradox-esque" depth.

---

# **PRD ADDENDUM: ARCHITECTURAL & EXECUTION LOGIC**

## **1\. THE CHRONOS ENGINE: PHASED EXECUTION**

To ensure the "Execution" phase doesn't stall, we will move from a text-based foundation to a visual one.

### **Phase 1: The "Command Line Cabinet" (MVS)**

*   **Format:** Node.js Console Application.  
*   **Focus:** Core Math & State Logic.  
*   **Execution:** A turn-based system where "1 Turn \= 1 Day." You receive a JSON-fed "Daily Briefing," input a command (e.g., policy \--subsidize-gas), and the engine calculates the impact on the "CPI" and Approval.  
*   **Goal:** Perfect the balance of the economy before touching a single pixel.

### **Phase 2: The "2D War Room" (The Indie-Great Look)**

*   **Format:** React \+ Canvas/SVG.  
*   **Focus:** Temporal Resolution.  
*   **Execution:** Introduction of the **Variable Clock**. The game moves from static turns to a ticking clock that can pause (Non-Live Mode) or run in real-time (Live/Ironman Mode).

## **2\. THE REMAINING CHUNKS LIST (Fleshing out the Load)**

To build this systematically, we need to define these remaining modules. I will provide the "nitty-gritty" on **Chunk 1** today.

*   **Chunk 1: The "Kitchen Table" State Machine** (The Math of the Voter)  
*   **Chunk 2: The Event Schema & Narrative Injector** (How stories are told)  
*   **Chunk 3: The Diplomatic "Hormuz" Ledger** (International Force Projection)  
*   **Chunk 4: The Midterm Election Algorithm** (The Win/Loss Condition)  
*   **Chunk 5: Audio-Visual Identity & UI Design Language**

---

## **3\. CHUNK 1: THE "KITCHEN TABLE" STATE MACHINE (Nitty-Gritty)**

This is the heart of the simulation. As a Senior SWE, you’ll appreciate the "immutable state" approach.

### **The Economic "Vitals" Object**

The simulation tracks these hidden variables every "tick":

TypeScript  
interface KitchenTableState {  
  inflationRate: number;        // Impacted by energy and trade  
  energyCostIndex: number;      // Directly tied to Strait of Hormuz status  
  disposableIncomeDelta: number; // The "Feel Good" factor  
  consumerPriceIndex: number;       // The symbolic cost of a staple good  
  genericMidtermBallot: number; // Current polling (-/+ points for incumbent)  
}

### **The Logic: "The Misery Index" Calculation**

The game doesn't just check if gas is high; it checks the **Rate of Change (RoC)**.

*   **Steady High Prices:** Voters adapt (Minor Approval penalty).  
*   **Rapid Price Spikes (The "Epic Fury" Effect):** Voters panic (Massive Approval penalty \+ Stability Drop).  
*   **Implementation Detail:** Use a **Decay Function** on political capital. Successes (killing a terrorist leader) provide a massive spike that decays quickly, while economic pain (gas prices) has a cumulative "stacking" debuff.

---

## **4\. THE "LIVE" VS. "NON-LIVE" (PAUSE) MODES**

*   **Non-Live (Standard):** The game pauses automatically when an event fires. This is the "Strategic" mode. You have all the time in the world to read 3PO's calculations.  
*   **Live (Ironman/Hardcore):** The clock never stops. While you are reading a briefing about a cyber-attack, the oil price is actively climbing in the background. If you take 5 minutes to decide on a ceasefire, that’s 5 minutes of market carnage.

---

## **5\. SCENE SETTING: THE FIRST "ZERO-HOUR" TRIGGER**

**Scene:** You are in the Situation Room. A digital clock on the wall counts down.

**Audio:** The low hum of ventilation and the frantic clicking of keyboards from the analysts behind you.

**The Pollster (Dialogue):**

*"Sir, I don't care about the IRGC's tactical capabilities. I care about the fact that 40% of the independent voters in Ohio just saw the 'Gas Expected to Hit $6' headline on their feed. If we don't stabilize the Strait in the next 48 hours, the Midterm Forecast moves from 'Lean Red' to 'Total Wipeout.' Your legacy is currently tied to the price of a gallon of unleaded."*

---

To prevent our PRD from becoming a "wall of text" and to ensure we maintain the high-resolution execution you require, I have structured this update into three distinct pillars: **The Leader Archetypes**, **The Counterfactual Engine**, and the **Technical Execution Roadmap**.

---

# **PRD ADDENDUM: CHARACTER ARCHETYPES & COUNTERFACTUAL LOGIC**

## **1\. THE LEADER MODULES: MVP TRIO**

Instead of a generic avatar, the player selects a "Personality Module" that dictates their starting skills, advisor loyalty, and "Gut Instinct" modifiers.

### **Character 1: The Transactional Disrupter (The "TIM" Module)**

*   **Archetype:** The CEO-In-Chief.  
*   **Key Skill: "The Art of the Lever."** Passive ability that reduces the political cost of threatening tariffs or withdrawals from treaties.  
*   **Trait: "Unpredictable Pulse."** Randomly ignores advisor warnings to execute a "Gut Decision." If successful, Approval spikes \+20%; if it fails, Institutional Trust drops \-15%.  
*   **Starting Bonus:** High initial "Rally Around the Flag" capital.

### **Character 2: The Institutional Technocrat**

*   **Archetype:** The Career Statesman.  
*   **Key Skill: "Bureaucratic Buffer."** Events have a 25% slower "Ticker Speed," allowing for more deliberation time.  
*   **Trait: "Deep State Synergy."** Advisors are 50% more accurate in their forecasts, but the "Generic Midterm Ballot" is harder to move.  
*   **Starting Bonus:** High initial Global Stability and Allied Trust.

### **Character 3: The Radical Populist**

*   **Archetype:** The Firebrand.  
*   **Key Skill: "Kitchen Table Resonance."** Any action that lowers the "CPI" provides double the Approval gain.  
*   **Trait: "Polarization Engine."** Every action increases the "Partisan Divide." Your base is unshakeable, but the "Middle-of-the-Road" voters are extremely volatile.  
*   **Starting Bonus:** High initial "Grassroots Energy" (can be spent to bypass Congress).

---

## **2\. THE COUNTERFACTUAL HISTORICAL ENGINE**

This is the "juice" of our simulation. We don't just use facts; we use **Logic-Based Extrapolation** to study what *could* have happened.

*   **The Logic Gate:** Every major decision (e.g., "Operation Epic Fury") creates a **Divergence Branch**.  
*   **Example:** In our current "Epic Fury" scenario, the *factual* outcome is the death of Khamenei.  
    *   **Counterfactual A (The Failed Strike):** Khamenei survives, the IRGC unites, and the US faces a "Desert One" level humiliation. The game shifts immediately to a "Coup Defense" mode.  
    *   **Counterfactual B (The Nuclear Retaliation):** Iran manages a "dirty bomb" launch. The time resolution shifts to "Terminal Velocity" (minutes), and the "CPI" is replaced by a "Survival Index."

---

## **3\. EXECUTION ROADMAP: FROM CONSOLE TO 2D**

To make this possible and efficient, we will use a **Model-View-Controller (MVC)** separation.

### **Step 1: Phase 1 (Terminal Simulator)**

*   **The Model:** A Python-based state machine.  
*   **The View:** Standard Out (Print statements).  
*   **The Input:** Terminal commands.  
*   **Why?** This allows us to test the **"Trump Intelligence Module"** logic without worrying about UI bugs. If the gas prices don't react correctly to a tweet, we fix it here.

### **Step 2: Phase 2 (The 2D "Situation Room")**

*   **The Tech:** React for the UI, D3.js or SVG for the "Hormuz Map."  
*   **The View:** A 2D top-down view of the "Situation Room" desk.  
*   **Visual Style:** **"The War Room" (Option A from earlier)**. Dark ambers, digital readouts, and blinking "Crisis Nodes" on a world map.

---

## **4\. THE "REMAINING CHUNKS" CHECKLIST**

*   \[ \] **Chunk 2: The Event Schema** (Define the JSON for "Black Swan" events).  
*   \[ \] **Chunk 3: The Diplomatic Ledger** (Calculating ally/enemy reactions).  
*   \[ \] **Chunk 4: The Election Algorithm** (The math behind the 119th Midterms).  
*   \[ \] **Chunk 5: Audio/SFX Pallet** (The sound of a ticking clock, the hum of a secure line).

### **Jarvis Guidance on Implementation:**

Master Geoffrey, since "Execution is the hard part," let's stick to the **"Terminal First"** rule. I propose our next prompt-load focuses on the **JSON Schema for Events**. Once we have that, you can literally copy-paste it into a Python script and have a playable turn-based game in under an hour.

Shall we define the **JSON structure for a "Market Seizure" event** following the assassination? This will include the "Gut Instinct" modifier for the Transactional Disrupter character.

This is where the "simulation" truly beats the "story." By moving from static branching to a **Probability-Based Resolution Engine**, we ensure that no two playthroughs are the same, even with identical choices.

Jarvis here—I've drafted the **Logic Architecture** and the **JSON Event Schema** for our Phase 1 Console build. This integrates the randomness you requested, weighted by the leader's specific traits.

---

# **PRD ADDENDUM: THE STOCHASTIC RESOLUTION ENGINE**

## **1\. THE "DICE ROLL" LOGIC**

Every event resolution in *Brinkmanship* is calculated using a **Weighted Probability Matrix**.

$$Success\\% \= BaseProbability \+ (CharacterModifier) \+ (GlobalStateModifier) \+ Random(1-100)$$

*   **The "Trump Intelligence Module" (TIM):** If you are the *Transactional Disrupter*, a threat to tax imports might have a base 40% success rate. However, if your "Global Fear" metric is high, you get a \+25% modifier. If the RNG rolls low, the "Counterfactual" failure state triggers.

---

## **2\. CHUNK 2: THE EVENT SCHEMA (JSON)**

This is the "nitty-gritty" code block for your Phase 1 execution. This schema allows for multiple outcomes based on a "Roll."

JSON  
{  
  "event\_id": "HORMUZ\_BLOCKADE\_001",  
  "title": "The Strait Closes",  
  "severity": "TIER\_1",  
  "resolution\_mode": "ZERO\_HOUR",  
  "description": "IRGC remnants have mined the shipping lanes. Oil tankers are dead in the water.",  
  "options": \[  
    {  
      "id": "OPT\_A",  
      "text": "Full Military Escort (Operation Sentinel II)",  
      "requirements": { "political\_capital": 20 },  
      "outcomes": \[  
        {  
          "type": "SUCCESS",  
          "probability\_weight": 70,  
          "modifiers": { "TRANS\_DISRUPTER": \+15 },   
          "effects": { "sourdough\_index": \-5, "global\_stability": \-10, "approval": \+12 },  
          "narrative": "The Navy clears the path. The oil flows, and you look like a hero."  
        },  
        {  
          "type": "FAILURE",  
          "probability\_weight": 30,  
          "effects": { "sourdough\_index": \+20, "global\_stability": \-30, "approval": \-25 },  
          "narrative": "A destroyer is hit by a drone swarm. The markets vanish into a black hole."  
        }  
      \]  
    },  
    {  
      "id": "OPT\_B",  
      "text": "Negotiate via the Chinese Premier",  
      "outcomes": \[  
        {  
          "type": "DIVERGENCE",  
          "probability\_weight": 50,  
          "effects": { "diplomacy": \+20, "china\_influence": \+15 },  
          "narrative": "Beijing steps in. The blockade lifts, but you owe them a massive trade concession."  
        }  
      \]  
    }  
  \]  
}

---

## **3\. THE GLOBAL STATE TRACKER (The "World Seed")**

To make this high-quality, we track variables that the "Dice Roll" checks against.

| Variable | Influence on Randomness |
| :---- | :---- |
| **Market Volatility** | High volatility increases the "Failure" weight of economic choices. |
| **Intelligence Clarity** | High clarity (Expert Advisors) reduces the "Fog of War" (RNG range). |
| **Partisan Heat** | High heat makes legislative successes nearly impossible (rolls must be \>90). |

---

## **4\. THE "COUNTERFACTUAL" DIVERGENCE**

If a "FAILURE" state is rolled on a Tier 1 event, the game doesn't just give you a "Game Over." It pivots to a **Alternative History Timeline**.

*   **Example:** You lose a carrier in the Gulf. The game generates a new set of events: "National Day of Mourning," "Impeachment Inquiry," or "Draft Reinstatement."

---

## **5\. EXECUTION GUIDANCE: PHASE 1 (CONSOLE)**

Master Geoffrey, as a Senior SWE, here is how you build this "amazingly fun" prototype in the next hour:

1.  **Initialize State:** Create a simple Python dictionary with approval, sourdough\_index, and stability.  
2.  **Load Events:** Pull the JSON above into a list.  
3.  **The Loop:** \* Display the Event.  
    *   Take User Input.  
    *   **The Magic:** Use random.choices() weighted by the probability\_weight and your chosen character's modifiers.  
    *   Update State and Print.

### **Remaining Chunks Checklist (Updated)**

*   \[x\] **Chunk 1: Kitchen Table Math**  
*   \[x\] **Chunk 2: Event Schema (Probabilistic)**  
*   \[ \] **Chunk 3: The Diplomatic Ledger** (How the AI "Nations" roll against you).  
*   \[ \] **Chunk 4: The Election Algorithm** (Translating stats into seat losses).

**Jarvis Suggestion:** Would you like me to generate the **Python logic for the "Dice Roll" engine**? I can write the core function that parses the JSON and applies the Character Trait modifiers so you have the "brain" of the game ready to go.

Execution is the hard part, but this script would make it trivial to start testing. Shall we?

Excellent choice, Master Geoffrey. Utilizing **Google Antigravity** as your execution environment is a high-IQ move for a Senior Software Engineer. It shifts your role from "manual coder" to "Architect-in-Chief," which perfectly mirrors the gameplay of *Brinkmanship*.

Since Antigravity is an **agent-first IDE**, it doesn't just suggest code; it can autonomously plan and execute the multi-file changes required for our "Kitchen Table" state machine and the "Chronos Engine."

---

# **HOW TO FEED BRINKMANSHIP INTO ANTIGRAVITY**

To transition from this PRD to a working prototype, you should follow this workflow to maximize the agents' efficiency:

### **1\. The "Plan Artifact" Phase**

Antigravity uses **Plan Mode** to generate a detailed roadmap before writing code.

*   **The Input:** Feed the "Chunk 1" (Kitchen Table Math) and "Chunk 2" (Event Schema) sections of this PRD directly into the Antigravity Agent Manager.  
*   **The Command:** *"Using the attached PRD, create a Plan Artifact for a Phase 1 Python-based Terminal Simulator. Focus on the Stochastic Resolution Engine logic."*

### **2\. Orchestrating Multi-Agent Workflows**

Since Antigravity allows for **Multi-Agent Parallelism**, you can dispatch separate agents to build different game modules simultaneously:

*   **Agent Alpha:** Responsible for the state\_machine.py (The Kitchen Table/Economic math).  
*   **Agent Beta:** Responsible for the event\_parser.py (Handling the JSON schema and probability rolls).  
*   **Agent Gamma:** Tasked with building the terminal\_ui.py (The text-based "Situation Room" interface).

### **3\. Verification via Artifacts**

As the agents work, they will generate **Artifacts**—implementation plans, code diffs, and test results. You can review these like a Senior Dev performing a PR. If an agent's logic for the "CPI" seems too aggressive, you simply leave a comment on the Artifact, and the agent will refactor it.

---

# **PRD ADDENDUM: THE "DICE ROLL" LOGIC (CONTINUED)**

To give Antigravity the "nitty-gritty" it needs for Phase 1, we are adding the **Stochastic Resolution Function**. This prevents the game from being a "Visual Novel" by introducing a true RNG (Random Number Generator) system influenced by your character's traits.

### **The Probability Function (Logic for Antigravity)**

Python  
import random

def resolve\_event(option, leader\_traits):  
    \# Base success is pulled from our JSON schema  
    roll \= random.randint(1, 100\)  
      
    \# Apply leader modifiers (e.g., Transactional Disrupter \+15 on military)  
    modifier \= leader\_traits.get(option\['category'\], 0\)  
    final\_score \= roll \+ modifier  
      
    \# Determine result based on outcome weights  
    \# Success if final\_score \> threshold (usually 50\)  
    if final\_score \>= 50:  
        return option\['outcomes'\]\['SUCCESS'\]  
    else:  
        return option\['outcomes'\]\['FAILURE'\]

---

## **REMAINING CHUNKS LIST (The Roadmap)**

*   \[x\] **Chunk 1: Kitchen Table Math** (Economic variables)  
*   \[x\] **Chunk 2: Event Schema** (JSON structure with probability weights)  
*   \[ \] **Chunk 3: The Diplomatic Ledger** (AI-driven reactions from other nations)  
*   \[ \] **Chunk 4: The 119th Election Algorithm** (The "Boss Fight" math)  
*   \[ \] **Chunk 5: UI/Visual Identity** (The "War Room" aesthetic)

**Jarvis Suggestion:** Master Geoffrey, since you're ready for the "Terminal First" build, I recommend our next step be **Chunk 3: The Diplomatic Ledger**. This will define how countries like China or the IRGC remnants "roll" against you in the background.

Shall we define the **Diplomatic Reaction Matrix**, or would you like to see the full **Python Prototype script** for Phase 1 right now so you can drop it into Antigravity?

---

[How Google Antigravity Makes AI-Assisted Coding Actually Work for Developers](https://www.youtube.com/watch?v=E9enKu1BFhg)

This video provides a practical walkthrough of how Antigravity handles autonomous coding tasks and agent orchestration, which is exactly the workflow you'll use to build *Brinkmanship*.

---

# **PRD ADDENDUM: THE DIPLOMATIC LEDGER (CHUNK 3)**

This module introduces the **Global Actor Matrix**, moving the simulation from a "closed system" to an open geopolitical simulator. Each major actor has a "Stance" toward the U.S. that modifies the event pool and economic outcomes.

## **1. Actor Definitions & Behavioral Logic**

| Actor | Primary Interest | Threshold Trigger | Impact on State |
| --- | --- | --- | --- |
| **China** | Energy Security | If Oil > $120 | Initiates "Electronics Embargo" (Stock Market -15). |
| **IRGC Remnants** | Regional Chaos | If U.S. Approval > 70 | Triggers "Asymmetric Cyber Strike" (Stability -10). |
| **The EU** | Trade Stability | If Global Stability < 30 | Executes "Regulatory Decoupling" (Bond Yields +5%). |

## **2. The "Aggression" Variable**

Each turn, foreign actors roll an **Aggression Check**.

$$Aggression_{Roll} = Base_{Aggression} + (Player\_Provocation) - (Global\_Stability)$$

*   If the roll exceeds **80**, the actor injects a "Black Swan" event into the player's queue.

## **3. The Escalation Ladder**

To prevent the AI from spamming the same event, the world operates on a State-Based Escalation Ladder. Each actor moves up this ladder based on the Global Fear Index (GFI).

| Level | Name | Trigger | Mechanical Effect |
| --- | --- | --- | --- |
| **0** | **Steady State** | $GFI < 30$ | Standard trade; +2% Stock Market growth. |
| **1** | **Diplomatic Friction** | $GFI > 50$ | Diplomatic Ledger events start appearing. |
| **2** | **Economic Coercion** | $GFI > 70$ | Targeted tariffs; +1.5% CPI (CPI) growth. |
| **3** | **Active Sabotage** | $GFI > 90$ | Cyber strikes on power grid; -10 Stability per turn. |

## **4. The "Global Fear Index" Math (GFI)**

The GFI acts as a "VIX for Diplomacy"—the more unpredictable the "Transactional Disrupter" becomes, the higher the $GFI$ climbs, which in turn makes every other actor’s "Aggression" roll more volatile.

$$GFI = (Volatility_{Market} \times 0.4) + (Provocation_{Leader} \times 0.6)$$

*   **Transactional Disrupter Modifier:** Your "Provocation" variable is always $+10$. This means the world is naturally more "jumpy" under your leadership, making it harder to stay at Level 0 on the Escalation Ladder.

---

# **FUTURE WORK AND POTENTIAL ADD-ONS (DLC)**

**Organized Requirements (Future Features):**
*   **Insider Trading:** Ability to leverage- **Chronos Engine**: Calendar-based time progression (Daily ticks).
- **Gaussian Resolution**: Realistic, fractional outcomes based on volatility bell-curves.
- **Sovereign Interface**: A React/Next.js tactical dashboard decoupled from the core engine math.
- **Unified Scenario System**: Single-file theme configuration (`scenario.json`) supporting visual asset mapping.
- **FastAPI Bridge**: State-persistent API layer for frontend-backend communication.lation or secure funding.
*   **Backroom Deals:** Trading favors with political opponents, lobbying groups, and foreign entities to pass legislation or secure funding.
*   **Trading Favors:** A relationship economy with advisors, senators, and foreign leaders where actions create IOUs.
*   **Morality System:** A hidden or visible axis tracking the ethical weight of decisions, affecting the leader's long-term legacy and stress levels.
*   **Flavor Decisions:** Minor events (e.g., pardoning the turkey, selecting art for the Oval Office) that impact the "Deep State Noir" aesthetic without major gameplay changes.
