# Brinkmanship: Metric Definitions & Simulation Logic

This document serves as the absolute source of truth for all simulation metrics to prevent semantic drift across the codebase.

## 1. Political Stability (STB)
- **Definition**: The internal coherence of the state and its monopoly on violence.
- **Mechanics**:
    - **Unrest Factor**: Low stability increases the probability of "Protest" and "Civil War" events.
    - **Estate Interaction**: Stability dynamically impacts Estate Happiness and Influence. High stability favors institutionalized estates; low stability favors disruptive or revolutionary estates.
    - **Authority Generation**: Consistent high stability provides a passive bonus to Authority generation.

## 2. Executive Approval (APP)
- **Definition**: The perceived legitimacy of the current administration.
- **Mechanics**:
    - **Derivation**: Calculated as a weighted average of **Estate Happiness**, where weights are determined by each estate's current **Influence**.
    - **Authority Contribution**: High approval increases the rate of Authority accumulation.

## 3. Sovereign Authority (AUT)
- **Definition**: The political capital required to execute unilateral executive actions.
- **Mechanics**:
    - **Currency**: Authority is a finite resource "spent" on specific actions (e.g., Decrees, Crackdowns, Radical Reforms).
    - **Modifiers**: Individual leaders (e.g., "Narcissistic Leader") apply coefficients to authority generation or specific action costs.
    - **Regime Type**: Autocratic regimes generate more Authority at the cost of higher Stability decay.

## 4. The Overton Window (OVW)
- **Definition**: The range of policies acceptable to the mainstream political discourse.
- **Mechanics**:
    - **Derivation**: 
        - **Center**: Weighted Mean of Faction alignments.
        - **Spread**: Weighted Standard Deviation of Faction alignments.
    - **Gating**: Actions classified as "Government Reform" are locked or carry massive Stability/Authority penalties if they fall outside the current Spread.

## 5. Estates (Interest Groups)
- **Definition**: Power centers that hold structural influence over the state (e.g., Elites, Unions, Military).
- **Attributes**:
    - **Influence**: Their percentage share of power (Zero-Sum).
    - **Happiness**: Their satisfaction with current policies. Low happiness drives down global Approval.

## 6. Factions (Political Movements)
- **Definition**: Ideological movements that compete to define the national discourse (e.g., MAGA, Progressives, Neoliberals).
- **Attributes**:
    - **Influence**: Their share of the cultural/political conversation.
    - **Alignment**: Their position on the 2D Ideology Matrix (Authoritarian/Libertarian, Planned/Market).
