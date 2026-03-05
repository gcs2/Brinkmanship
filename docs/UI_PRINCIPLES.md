# UI Principles — Brinkmanship Sovereign Simulator
*Authored per V18 Management Directive. Cross-reference: `implementation_plan_phase18.md`, `docs/FUTURE_WORKS.md §X`.*

---

## I. The Three Core Tenets

### 1. The Glass Cockpit Principle
Information must be **layered by depth of engagement.**

- **Quick Glance (Flavor):** Window titles, status rings, color-coded map zones. The player understands *overall health* without reading a number.
- **Hover (Summary):** Tooltip with the metric name, current value, and one-line description. Triggered on mouse enter.
- **Click / Expand (Physics):** Full window opens showing raw Rust-derived metrics, trend lines, and system internals.

No raw number should be the *first* thing a player sees. Every data point has a visual equivalent.

---

### 2. Tactile Sovereignty
Every window is **an instrument of state.** The player configures their own command center.

- All major UI elements are draggable `<SovereignWindow>` components
- Windows stack by z-index; clicking a window brings it to the front
- Each window has: **Title bar** (drag handle) · **Fullscreen icon** (if applicable) · **Close icon**
- Window positions are persisted to `localStorage` so the layout survives page refreshes
- The minimap (bottom-right) always stays fixed — it is the anchor of the sovereign's situational awareness

---

### 3. The Perception Gap
The UI must visually distinguish **Public Truth** (perceived state) from **Deep State Reality** (actual state).

- The **IdeologyCompass** maintains a dual crosshair: solid amber = real position, hollow ring = perceived position
- The **tension line** between them shifts from amber → orange → red as the Veil Gap grows
- **Flavor Labels** in the window header show the *public* label; the hover tooltip reveals the *real* label if they differ
- Any UI element showing perceived data is rendered with a subtle `blur(0.5px)` or `opacity: 0.85` treatment vs. the sharp, full-opacity real data

---

## II. Color Language

| Color | Semantic Meaning |
|:------|:----------------|
| `#FFB000` Amber | Real/true data, player position, confirmed events |
| `#F97316` Orange | Warning threshold, Veil Gap > 2.5, moderate risk |
| `#FF2222` Red | Critical threshold, Veil Collapse, existential risk |
| `#10B981` Emerald | Positive delta, stability gain, authority replenished |
| `#3B82F6` Blue | Authoritarian-Right quadrant (calm authority) |
| `#EF4444` Crimson | Authoritarian-Left quadrant (revolutionary pressure) |
| `#22C55E` Green | Libertarian-Left quadrant (civil spontaneity) |
| `#EAB308` Yellow | Libertarian-Right quadrant (market dynamism) |
| `#6B7280` Gray | The center — ideological ambiguity, pragmatism |

---

## III. The Ideology Grid Color System

The 11×11 grid uses **bilinear RGB interpolation** between 4 corner colors, blending continuously into charcoal `rgb(33,33,33)` at the center. No discrete quadrant boundaries — every cell's color is a weighted average of all four corners.

```
Corner colors (vivid dark-tone RGB):
  Auth-Planned  (top-left):   rgb(185,  35,  35)  — Dark Red
  Auth-Market   (top-right):  rgb( 28,  58, 195)  — Dark Blue
  Lib-Planned   (bottom-left): rgb( 33, 150,  48)  — Dark Green
  Lib-Market    (bottom-right): rgb(158, 130,  22)  — Dark Gold

Formula per cell (x,y) ∈ [-5,5]²:
  nx = (x + 5) / 10                  // 0 = Planned, 1 = Market
  ny = (y + 5) / 10                  // 0 = Lib, 1 = Auth
  t  = min(√(x²+y²) / 7.071, 1.0)  // 0 = center (gray), 1 = corner (vivid)

  color_bilinear = blerp(C_tl, C_tr, C_bl, C_br, nx, ny)
  final_color    = lerp(gray, color_bilinear, t)   // fades to charcoal at center
```

- Quadrant borders disappear: Blue → Purple → Red (top edge), Green → Chartreuse → Gold (bottom edge)
- Hover state: `outline: 1px solid rgba(255,255,255,0.55)` — white glow, neutral, not quadrant-colored

---

## IV. Window Layer Order (z-index Conventions)

| Layer | z-index | Contents |
|:------|:-------:|:---------|
| Background | 0 | World map, static grid |
| Floating Windows | 10–999 | All `<SovereignWindow>` components |
| Active/Focused Window | max(existing) + 1 | On click/focus |
| Fullscreen Overlay | 1000 | Fullscreen compass, maximized windows |
| DossierPane (events) | 1100 | Crisis event dialogs — always on top |
| Notification Toast | 1200 | System alerts |

---

## V. Window Registry

| Window ID | Default State | Title |
|:----------|:------------:|:------|
| `ideology` | Open | Ideology Axis |
| `worldMap` | Open | Tactical Overview |
| `country` | Closed | Country Profile |
| `telemetry` | Open | Primary Telemetry |
| `intel` | Open | Intel Feed |
| `demographics` | Open | Sector Pressures |

---

## VI. Interaction Standards

- **Spacebar:** Toggle simulation play/pause (global, unblocked by windows)
- **Click compass:** Pause game + expand compass to fullscreen
- **X button:** Close window (re-openable from header toolbar)
- **Double-click title bar:** Maximize / restore window
- **Drag title bar:** Move window; constrained to viewport bounds
- **Scroll on world map:** Zoom in/out
- **Right-click on world map:** Context menu (future: "Deploy Asset", "Open Dossier")

---

*"Every window is an instrument of state. Wire your own command center."*
*— V18 Management Directive*

---

## VII. Sidebar System (Phase 19)

*Per V18 Management Directive — APPROVED 2026-03-05.*

- **The Tactical Map is the permanent canvas.** `position: fixed; z-index: 0`. It is never a window, never movable, never closeable.
- **Left Sidebar** (`w-300px, fixed left`): Identity → Country Profile → Ideology Compass. Toggle with a `◀` button in the header left cluster.
- **Right Sidebar** (`w-300px, fixed right`): Telemetry → Estates → Intel Feed. Toggle with a `▶` button in the header right cluster.
- **Sidebar state** (`showLeftSidebar`, `showRightSidebar`) persists to `localStorage` — Glass Cockpit principle applies to sidebars too.
- **Estate rows** must display: `label`, absolute value, and `±delta/tick` — legible at a glance without hover.
- **`react-rnd` draggable windows are preserved** for Phase 20 "Deep Dive" panels (rival sovereign dossiers, treaty negotiation). Do not remove the window infrastructure.

| Sidebar | Contents (top → bottom) |
|:--------|:------------------------|
| Left | Identity Panel → Country Profile → Ideology Compass |
| Right | Primary Telemetry → Estates → Intel Feed |

---

## VIII. Crisis Interrupt Protocol (Phase 19)

*Management Guardrail — V18 Dispatch §I.2.*

The **Event Modal** (formerly `DossierPane` right-side slide-in) is the most cognitively demanding UI state. Rules:

- **Position:** Centered overlay, `z-[1100]`, `bg-black/60 backdrop-blur-sm`. NOT a sidebar element.
- **Auto-Pause Mandate:** On modal mount, `isPlaying` is set to `false`. The Sovereign cannot be forced to read estate-impacting crisis text while the world clock burns days.
- **Option layout (top → bottom within each choice):**
  1. **Label** — amber, large, the action text ("Impose Emergency Sanctions")
  2. **Description** — readable body text explaining what the player is doing
  3. **EST impact tag** — `EST: METRIC ±VALUE` in small monospaced amber
  4. **Lag time** — `⏱ Resolves in ~N days`
- **Dismiss / Defer** button always visible — player retains agency to skip.

*Updated: SOVEREIGN_DISPATCH_V18 — 2026-03-05*
