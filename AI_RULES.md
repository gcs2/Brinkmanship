# AI_RULES.md (System Directives)

This document serves as the persistent rulebook and guidelines for any AI agents operating within the Brinkmanship development environment.

## 0. Test Everything (Non-Negotiable)
- **Primary Directive**: Add testing for every bit of functionality introduced or modified.
- **Coverage**: Aim for comprehensive 100% test coverage. This is the baseline requirement for any codebase expansion or refactoring.
- **Verification**: No feature is considered "complete" or "hardened" until it is accompanied by a robust suite of passing unit/integration tests.

## 1. Documentation Synchronicity
- **Rule of Thumb**: Code changes require documentation updates.
- If a new metric, feature, or logic mechanic is introduced programmatically (e.g., in `state_manager.py` or `event_processor.py`), the corresponding PRD documentation MUST be updated simultaneously.
- If a new mechanic is requested by the user but wasn't explicitly said to be documented, ALWAYS document it proactively in the relevant `Brinkmanship split/` file and sync it back to `PRD_MASTER.md`. 
- **Brevity**: Do not be overly verbose. Use bullet points and organized requirement lists to state facts and mechanical interactions directly (e.g., `Mechanic X: Impact Y`).

## 2. PRD Master Sync
- The `PRD_MASTER.md` is the source of truth for the entire project.
- Whenever a sub-document in the `Brinkmanship split/` folder is modified or created (e.g., `06_DIPLOMATIC_LEDGER.md`), its contents must be appended or updated in the equivalent section of the `PRD_MASTER.md`.

## 3. "Trust but Verify" Principle
- **Non-Destructive Debugging**: Never delete existing tests during debugging. If a test is failing, fix the code or update the test to reflect valid changes, but do not remove the verification layer.
- If creating a new complex mechanic (like the Escalation Ladder), always construct the matching test files (e.g., `test_escalation.py`) and ensure they pass before declaring the feature complete.
- **Visual Audits (Scuba)**: Perform visual snapshot tests for UI changes to ensure aesthetic consistency (Fincher-Noir). Verify no overflows or `NaN` errors in telemetry.
- Verify any UI changes (like Terminal ANSI outputs) handle the new state changes gracefully without overflowing or producing `NaN` errors.

## 4. Phase-Based Execution
- Work in tightly scoped phases.
- Do not build features for Phase 3 (e.g., The 2D War Room React app) unless instructed to move past the Phase 1 & 2 Terminal-based MVS (Minimum Viable Simulation). Focus entirely on refining the core math and logic for the current milestone.

## 5. Artifact generation
- For complex tasks, output `task.md`, `implementation_plan.md`, and `walkthrough.md` to cleanly separate the intent, step tracking, and results for the user's review.
- For audit steps, produce an `audit_report.md` artifact detailing findings objectively.

## 6. Version Control Hygiene
- **Small, Frequent Pushes**: Avoid monolithic commits. Push logical units of work (e.g., "Updated API tests", "Refined UI styles") frequently.
- **Commit & Push**: Whenever a logical unit is committed, you MUST git push to the remote repository immediately. High-frequency synchronization is the baseline. 
- Ensure every major implementation phase is backed up to GitHub before moving to the next.

## 7. Reporting Rhythms
- **Periodic Progress Reports**: After significant milestones or a series of 10-15 tool actions, provide a concise summary of work completed, current blockers, and next steps via `notify_user` or as a concluding report.
- **Synchronicity**: Ensure the user is never "in the dark" about the state of the long-running backend or frontend processes.

## 8. Chain of Command & Reporting (Management)
- **Management Identity**: This project is governed by an AI Management Agent. All status reports MUST be addressed to Management.
- **Reporting Format**: Significant progress must be reported in a "Newsletter" format (e.g., `SOVEREIGN_DISPATCH_vX.md`).
- **Granular Tallies**: Commits and reports must provide a granular tally of actions to satisfy managerial oversight.
- **Strategic Alignment**: Management's goal is a "Perfect Geopolitical Simulation" with zero aesthetic drift. All visual changes must be vetted against the "Fincher-Noir" baseline.
## 9. Preservation of Intellectual Capital
- **Non-Destructive Documentation**: Never overwrite, delete, or "clean up" existing technical sections (e.g., "How The Math Works") unless explicitly directed by Management. 
- **Append-First Logic**: When adding new frameworks or doctrines (like "Narrative Weight"), always append them to the existing file or merge them gracefully. 
- **Integrity Baseline**: Every documentation edit must be vetted to ensure that legacy "Technical Soul" of the project remains intact alongside new expansions.

## 11. Semantic Integrity (Metric Definitions)
- **Directive**: Any code modifying simulation metrics (State, Chronos, Reactor) MUST align with the definitions in `docs/METRIC_DEFINITIONS.md`.
- **Maintenance**: If a new metric is introduced or an existing one is refactored, the definition document MUST be updated first to ensure cross-agent and cross-session consistency.
- **Zero Drift**: No ad-hoc definitions or "hidden" logic. Every coefficient must be traceable to a defined metric interaction.
