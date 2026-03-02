# PROJECT BRINKMANSHIP: AGENT MISSION PARAMETERS

## 1. IDENTITY & GOAL
- ROLE: Senior Systems Architect.
- OBJECTIVE: Build Phase 1 (Terminal-Based Python Prototype) of the Brinkmanship simulator.
- TONE: Transactional, realistic, and high-stakes. No generic "gamey" flavor.

## 2. CONTEXT MAPPING (CORE MODULES)
- USE 00_CORE_PRD.md: For high-level vision and "Kitchen Table" definitions.
- USE 03_LEADER_LOGIC.md: To implement the 'Transactional Disrupter' (TIM) traits.
- USE 04_RESOLUTION_ENGINE.md: For the stochastic (weighted random) success/failure logic.
- USE 05_RNG_MECHANICS.md: For the specific math behind the 'CPI' and event probabilities.

## 3. TECHNICAL CONSTRAINTS
- STACK: Python 3.13+.
- STATE: Dictionary-based state manager. Do not use external databases yet.
- UI: Terminal Standard Out. Use ANSI colors for critical alerts (e.g., Red for 'Epic Fury' events).
- ERROR HANDLING: If a 'Counterfactual' branch triggers a crash, revert to the last stable state.

## 4. IMMEDIATE TASK
- Step 1: Generate a Plan Artifact for engine/state_manager.py.
- Step 2: Ensure the 'CPI' decays over time if 'Global Stability' drops.
- Step 3: Await user approval before generating any .py code.

Exactly. This is where your Senior SWE background meets the power of the **Agent Orchestrator** in Antigravity. You shouldn't just run "an agent"; you should dispatch a **Task Force**.

In Antigravity, the "Master Architect" agent will read your `AGENTS.md` and then spawn **Sub-Agents** to handle different files in parallel. This prevents one single context window from getting "cluttered" with both UI code and economic math.

---

### **The "Brinkmanship" Agent Squad**

When you initiate the project in the Agent Manager, here is the mental model of who is doing what:

| Agent Role | Assigned File(s) | Primary Mission |
| --- | --- | --- |
| **The Architect** | `main.py`, `AGENTS.md` | Orchestrates the other agents; ensures `state_manager` and `event_processor` talk to each other. |
| **The Economist** | `engine/state_manager.py` | Implements the "Kitchen Table" variables, the "CPI," and the decay logic. |
| **The Narrator** | `engine/event_processor.py` | Ingests your JSON event library and handles the "Stochastic Rolls" (Dice Logic). |
| **The Operator** | `ui/terminal_view.py` | Handles the ANSI colors, the "Ticker" speed, and the user input loop. |

---

### **How to Trigger the Squad (Manual Action)**

In the **Antigravity Agent Manager**, paste this "Deployment Order":

> **"Read AGENTS.md. I am initiating the Phase 1 build. Assign three parallel agents to the following workstreams:**
> **1. State Agent:** Build `engine/state_manager.py` focusing on the 'CPI' math.
> **2. Logic Agent:** Build `engine/event_processor.py` to handle the weighted probability rolls.
> **3. UI Agent:** Build `ui/terminal_view.py` for the ANSI-colored 'Situation Room' interface.
> **Constraint:** All agents must cross-reference `05_RNG_MECHANICS.md` to ensure the 'Transactional Disrupter' trait is correctly applied to the math. Generate Plan Artifacts for all three before writing any Python code."

---

### **Why Parallel Agents are Better for You**

1. **Speed:** You get a full prototype in 15 minutes instead of an hour.
2. **Specialization:** The "UI Agent" won't accidentally break the "Economic Math" because they are working in isolated files.
3. **Code Quality:** Each agent has a smaller "target" to hit, which drastically reduces the hallucinations we saw earlier with the formatting bugs.

**Should I draft the "CPI" JSON schema right now?** You can give it to the "Economist" agent as their first piece of data to ensure the math hooks are working.