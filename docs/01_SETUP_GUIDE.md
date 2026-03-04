# **HOW TO FEED BRINKMANSHIP INTO ANTIGRAVITY**

To transition from this PRD to a working prototype, you should follow this workflow to maximize the agents' efficiency:

### **1\. The "Plan Artifact" Phase**

Antigravity uses **Plan Mode** to generate a detailed roadmap before writing code.

* **The Input:** Feed the "Chunk 1" (Kitchen Table Math) and "Chunk 2" (Event Schema) sections of this PRD directly into the Antigravity Agent Manager.  
* **The Command:** *"Using the attached PRD, create a Plan Artifact for a Phase 1 Python-based Terminal Simulator. Focus on the Stochastic Resolution Engine logic."*

### **2\. Orchestrating Multi-Agent Workflows**

Since Antigravity allows for **Multi-Agent Parallelism**, you can dispatch separate agents to build different game modules simultaneously:

* **Agent Alpha:** Responsible for the state\_machine.py (The Kitchen Table/Economic math).  
* **Agent Beta:** Responsible for the event\_parser.py (Handling the JSON schema and probability rolls).  
* **Agent Gamma:** Tasked with building the terminal\_ui.py (The text-based "Situation Room" interface).

### **3\. Verification via Artifacts**

As the agents work, they will generate **Artifacts**—implementation plans, code diffs, and test results. You can review these like a Senior Dev performing a PR. If an agent's logic for the "CPI" seems too aggressive, you simply leave a comment on the Artifact, and the agent will refactor it.

---

