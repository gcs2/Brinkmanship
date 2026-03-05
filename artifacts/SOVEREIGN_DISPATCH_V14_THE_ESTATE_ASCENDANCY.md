The transition from a static `overton_radius` to a **Dynamic Estate Model** is a major advancement in the simulation’s fidelity. This shifts the core gameplay from "direct dial manipulation" to **Social Engineering**. By making the Overton Window a derived property of interest group influence, we introduce authentic political friction: a leader cannot simply "choose" a new policy direction; they must first cultivate the power centers that make that direction possible.

---

📡 **SOVEREIGN DISPATCH v14: THE ESTATE ASCENDANCY**
**TO:** Principal Simulation Architect
**FROM:** Executive Management
**STATUS:** [PIVOT AUTHORIZED]

## **1. THE "LIVING" OVERTON WINDOW**

The removal of the static `overton_radius` in favor of a **Weighted Standard Deviation (Spread)** is a superior mathematical model for the Noir genre. It creates a "Living Window" that breathes—expanding during periods of high-influence polarization and contracting during periods of monolithic control.

* **The Center of Gravity**: Deriving the `center` from the weighted mean of Estate alignments ensures the "Political Median" is always grounded in the reality of who holds the most influence.
* **The Spread of Tolerance**: Using Standard Deviation to define the "Acceptable Zone" (The Overton Window) means that a fragmented society naturally allows for more radicalism, while a unified society punishes it.

## **2. THE ARCHITECTURAL SPLIT: LIB/BIN REFACTOR**

The decision to split the engine into a library and a binary is a critical step for **Sovereign Reliability**.

* **Encapsulation**: Moving the core logic into `lib.rs` allows the `journey_tests.rs` to import the simulation engine without the overhead of the Axum web server.
* **Verification**: 100% coverage through "The Populist Surge" journey test provides the first end-to-end proof that our economic actions correctly translate into ideological shifts.

## **3. TECHNICAL SCRUTINY: THE MATH**

The formula for the **Weighted Spread** must be implemented with care regarding the $N/(N-1)$ correction for small samples, though in a world of 50+ actors, a standard weighted population deviation is sufficient.

* **Friction Check**: Ensure that `Estate` influence is a zero-sum game or has a global normalization step. If one estate’s influence grows, another’s must decay to prevent "Influence Inflation" from breaking the Overton calculation.

---

### **MANAGEMENT DIRECTIVES**

1. **Initialize the "Estate Registry"**: Update the `cold_war_1983` scenario to include the baseline Estates (e.g., "The Politburo," "The Labor Unions," "The Military Industrial Complex").
2. **UI Verification**: The `IdeologyCompass.tsx` must now render the **Spread** as the pulsing radius. If the standard deviation increases, the "Window" on the UI must visually enlarge.
3. **The "Populist Surge" Audit**: Upon completion of the first journey test, output the results to a `tests/audit_report_v3.md`. We must see the exact turn-by-turn migration of the `center` as the "Lower Class" happiness and influence fluctuate.

**The "Thinking" phase is over. The "Estates" logic is now the law of the simulation. Proceed to the library refactor and initialize the Journey Tests.**

**Standing by for the "Populist Surge" validation report.**