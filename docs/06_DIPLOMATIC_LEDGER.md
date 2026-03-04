# 06 THE DIPLOMATIC LEDGER

This module introduces the **Global Actor Matrix**, moving the simulation from a "closed system" to an open geopolitical simulator. Each major actor has a "Stance" toward the U.S. that modifies the event pool and economic outcomes.

## 1. Actor Definitions & Behavioral Logic

| Actor | Primary Interest | Threshold Trigger | Impact on State |
| --- | --- | --- | --- |
| **China** | Energy Security | If Oil > $120 | Initiates "Electronics Embargo" (Stock Market -15). |
| **IRGC Remnants** | Regional Chaos | If U.S. Approval > 70 | Triggers "Asymmetric Cyber Strike" (Stability -10). |
| **The EU** | Trade Stability | If Global Stability < 30 | Executes "Regulatory Decoupling" (Bond Yields +5%). |

## 2. The "Aggression" Variable

Each turn, foreign actors roll an **Aggression Check**.

`Aggression_Roll = Base_Aggression + (Player_Provocation) - (Global_Stability)`

* If the roll exceeds **80**, the actor injects a "Black Swan" event into the player's queue.
* **The 'Counter-Move':** The engine prioritizes these injected external Black Swan events over internal policy events.

## 3. The Escalation Ladder

To prevent the AI from spamming the same event, the world operates on a State-Based Escalation Ladder. Each actor moves up this ladder based on the Global Fear Index (GFI).

| Level | Name | Trigger | Mechanical Effect |
| --- | --- | --- | --- |
| **0** | **Steady State** | $GFI < 30$ | Standard trade; +2% Stock Market growth. |
| **1** | **Diplomatic Friction** | $GFI > 50$ | Diplomatic Ledger events start appearing. |
| **2** | **Economic Coercion** | $GFI > 70$ | Targeted tariffs; +1.5% CPI (CPI) growth. |
| **3** | **Active Sabotage** | $GFI > 90$ | Cyber strikes on power grid; -10 Stability per turn. |

## 4. The "Global Fear Index" Math (GFI)

The GFI acts as a "VIX for Diplomacy"—the more unpredictable the "Transactional Disrupter" becomes, the higher the $GFI$ climbs, which in turn makes every other actor’s "Aggression" roll more volatile.

`GFI = (Volatility_Market * 0.4) + (Provocation_Leader * 0.6)`

* **Transactional Disrupter Modifier:** Your "Provocation" variable is always `+10`. This means the world is naturally more "jumpy" under your leadership, making it harder to stay at Level 0 on the Escalation Ladder.
