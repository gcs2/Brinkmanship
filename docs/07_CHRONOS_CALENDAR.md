# 07 THE CHRONOS CALENDAR

The Chronos Engine grounds the simulation in reality by moving away from abstract integer "Turns" to a high-resolution time-series Calendar. By executing changes daily and fractionally, players experience realistic demographic fade and economic momentum.

## 1. Temporal Constraints
* **Epoch:** Jan 20, 2025 (Inauguration Day).
* **Time Scale:** 1 Turn = 1 Day.

## 2. Event Frequency
The simulation handles different classifications of updates at different beats:
* **Daily:** Economic micro-fluctuations (e.g., fractional decay of CPI or Stock Market Index based on current velocity/stability).
* **Weekly:** "Kitchen Table" summary reports compiling the fractions into readable macro-trends for the player.
* **Ad-hoc:** "Black Swan" events triggered by $GFI$ or Actor Aggression.

## 3. The Granularity Overhaul (Floating-Point Calculus)
Metrics do not jump by round integers ($\pm5$). Instead, events trigger **weighted distributions** of fractional changes.
* State variables utilize floating-point precision.
* The `update_turn()` step acts as a daily calculus tick, applying **Decay Coefficients** to metrics matching their current momentum. (Example: `approval -= (cpi_velocity * 0.015)`).

## 4. Demographic Tensions
Approval ratings are no longer monolithic. They are fragmented into demographic sub-categories to create competing internal pressures. Actions pleasing one faction will mathematically agitate another.
* **Working Class:** Highly sensitive to CPI and unemployment.
* **Institutional Elites:** Highly sensitive to Market Volatility and Institutional Trust.
* **Global Allies:** Highly sensitive to $GFI$ and Diplomatic Stances.
