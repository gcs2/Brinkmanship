import datetime
import math
import random
from dataclasses import dataclass, field
from typing import Dict, Any, List, Tuple

# Phase Constants
PHASE_MUNDANE = 1       # Incremental Growth: low variance, stable world
PHASE_TENSIONS = 2      # Building: decay accelerates, Gaussian noise expands
PHASE_FLASHPOINT = 3    # Kinetic: binary triggers, systemic collapse risk

# Phase thresholds based on Global Stability (metric_1)
MUNDANE_THRESHOLD = 70.0
TENSIONS_THRESHOLD = 45.0

@dataclass(frozen=True)
class PendingAction:
    """An action that has been committed but not yet resolved."""
    action_id: str
    source_event: str     # Event ID that spawned this
    option_label: str     # Human-readable label for the Intel Feed
    target: str
    action_type: str      # "metric", "demographic", "system"
    amount: float
    resolve_on_turn: int  # The turn_id on which this resolves

@dataclass(frozen=True)
class State:
    current_date: datetime.date
    metrics: Dict[str, float]
    demographics: Dict[str, float]
    system: Dict[str, float]
    # Phase 6 additions
    turn_id: int = 0
    active_phase: int = PHASE_MUNDANE
    pending_actions: Tuple[PendingAction, ...] = field(default_factory=tuple)
    action_logs: Tuple[str, ...] = field(default_factory=tuple)
    volatility_history: Tuple[float, ...] = field(default_factory=tuple)

    def update_metric(self, key: str, value: float) -> 'State':
        """Returns a new state with the updated metric"""
        new_metrics = dict(self.metrics)
        if key in new_metrics:
            new_metrics[key] = round(new_metrics[key] + value, 4)
            if key in ('metric_1', 'metric_2', 'metric_4', 'metric_9'):
                new_metrics[key] = max(0.0, min(100.0, new_metrics[key]))
        return State(
            self.current_date, new_metrics, self.demographics, self.system,
            self.turn_id, self.active_phase, self.pending_actions,
            self.action_logs, self.volatility_history
        )

    def update_demographic(self, key: str, value: float) -> 'State':
        new_demos = dict(self.demographics)
        if key in new_demos:
            new_demos[key] = round(max(0.0, min(100.0, new_demos[key] + value)), 4)
        return State(
            self.current_date, self.metrics, new_demos, self.system,
            self.turn_id, self.active_phase, self.pending_actions,
            self.action_logs, self.volatility_history
        )

    def update_system(self, key: str, value: float) -> 'State':
        new_sys = dict(self.system)
        if key in new_sys:
            new_sys[key] = round(new_sys[key] + value, 4)
        return State(
            self.current_date, self.metrics, self.demographics, new_sys,
            self.turn_id, self.active_phase, self.pending_actions,
            self.action_logs, self.volatility_history
        )


def _calculate_phase(stability: float, current_phase: int) -> int:
    """Phase can escalate forward but doesn't trivially de-escalate (hysteresis)."""
    if stability < TENSIONS_THRESHOLD:
        return PHASE_FLASHPOINT
    elif stability < MUNDANE_THRESHOLD:
        return max(current_phase, PHASE_TENSIONS)  # Can't drop back to mundane once tense
    return current_phase


def update_turn(state: State) -> State:
    """
    Pure function: advances Chronos by 1 day.
    Resolves any pending_actions whose resolve_on_turn <= new turn_id.
    Applies phase-based decay. Updates volatility history for ECG readout.
    """
    new_turn = state.turn_id + 1
    new_date = state.current_date + datetime.timedelta(days=1)

    new_metrics = dict(state.metrics)
    new_demos = dict(state.demographics)
    new_sys = dict(state.system)
    new_action_logs = list(state.action_logs)
    still_pending = []

    # --- RESOLVE PENDING ACTIONS (Temporal Friction) ---
    for pa in state.pending_actions:
        if new_turn >= pa.resolve_on_turn:
            # Execute the deferred effect
            if pa.action_type == "metric" and pa.target in new_metrics:
                new_metrics[pa.target] = round(new_metrics[pa.target] + pa.amount, 4)
            elif pa.action_type == "demographic" and pa.target in new_demos:
                new_demos[pa.target] = round(new_demos[pa.target] + pa.amount, 4)
            elif pa.action_type == "system" and pa.target in new_sys:
                new_sys[pa.target] = round(new_sys[pa.target] + pa.amount, 4)

            sign = "+" if pa.amount >= 0 else ""
            new_action_logs.append(
                f"[Day {new_date.isoformat()}] {pa.option_label}: {pa.target} {sign}{pa.amount:.2f}"
            )
            # Action resolution spikes volatility (the ECG pulse)
            new_sys["volatility"] = round(new_sys.get("volatility", 0) + abs(pa.amount) * 0.5, 4)
        else:
            still_pending.append(pa)

    stability = new_metrics.get("metric_1", 50.0)
    new_phase = _calculate_phase(stability, state.active_phase)

    # --- PHASE-BASED DECAY CALCULUS ---
    if new_phase == PHASE_MUNDANE:
        # Peacetime incremental drift — barely noticeable
        volatility_decay = -0.3  # actively decay toward 0
        new_metrics["metric_3"] += random.gauss(0.05, 0.02)   # tiny CPI creep
        new_metrics["metric_5"] += random.gauss(10.0, 5.0)    # Market slow growth

    elif new_phase == PHASE_TENSIONS:
        # Tension: pressures build, Gaussian noise widens
        decay_factor = (MUNDANE_THRESHOLD - stability) / 100.0
        volatility_decay = 0.1
        new_metrics["metric_3"] += random.gauss(decay_factor * 1.5, 0.5)
        new_metrics["metric_5"] -= random.gauss(decay_factor * 10.0, 5.0)
        new_metrics["metric_6"] += random.gauss(decay_factor * 0.01, 0.005)
        new_metrics["metric_7"] += random.gauss(decay_factor * 0.005, 0.002)
        new_metrics["metric_8"] += random.gauss(decay_factor * 0.5, 0.2)
        new_metrics["metric_9"] += random.gauss(decay_factor * 1.2, 0.3)

    else:  # PHASE_FLASHPOINT
        # Flashpoint: accelerated collapse, high Gaussian noise
        decay_factor = (50.0 - stability) / 100.0
        volatility_decay = 1.5
        new_metrics["metric_3"] += random.gauss(decay_factor * 3.0, 1.5)
        new_metrics["metric_5"] -= random.gauss(decay_factor * 30.0, 15.0)
        new_metrics["metric_6"] += random.gauss(decay_factor * 0.05, 0.02)
        new_metrics["metric_7"] += random.gauss(decay_factor * 0.02, 0.01)
        new_metrics["metric_8"] += random.gauss(decay_factor * 2.0, 1.0)
        new_metrics["metric_9"] += random.gauss(decay_factor * 3.0, 1.0)

    # --- VOLATILITY ECG DECAY (The Heart Monitor) ---
    # Volatility naturally gravitates toward 0 (Peacetime). Events spike it.
    current_volatility = new_sys.get("volatility", 15.0)
    ecg_decay = current_volatility * 0.08  # Decay 8% per tick toward 0
    new_sys["volatility"] = round(max(0.0, current_volatility - ecg_decay + volatility_decay), 4)

    # GFI Calculation: (Volatility * 0.4) + (Provocation * 0.6)
    new_sys["fear_index"] = round(
        (new_sys.get("volatility", 0.0) * 0.4) + (new_sys.get("provocation", 0.0) * 0.6), 4
    )

    # Demographic tensions
    new_demos["demo_1"] -= (new_metrics.get("metric_3", 100) - 100) * 0.01
    new_demos["demo_2"] -= (new_sys.get("volatility", 15) - 15) * 0.01
    new_demos["demo_3"] -= (new_sys.get("fear_index", 0) * 0.01)

    # Precision & bounds
    for k in new_metrics:
        new_metrics[k] = round(new_metrics[k], 4)
    for k in new_demos:
        new_demos[k] = round(max(0.0, min(100.0, new_demos[k])), 4)
    for k in new_sys:
        new_sys[k] = round(new_sys[k], 4)

    # Re-calculate avg approval
    avg_approval = sum(new_demos.values()) / len(new_demos) if new_demos else 50.0
    new_metrics["metric_2"] = round(avg_approval, 4)

    # Metric bounds
    for k in ('metric_1', 'metric_4', 'metric_9'):
        if k in new_metrics:
            new_metrics[k] = max(0.0, min(100.0, new_metrics[k]))

    # --- VOLATILITY HISTORY (ECG buffer, last 60 ticks) ---
    new_vol_history = list(state.volatility_history) + [new_sys["volatility"]]
    new_vol_history = new_vol_history[-60:]  # Keep 60-tick rolling window

    # Trim logs to last 30 entries
    trimmed_logs = new_action_logs[-30:]

    return State(
        current_date=new_date,
        metrics=new_metrics,
        demographics=new_demos,
        system=new_sys,
        turn_id=new_turn,
        active_phase=new_phase,
        pending_actions=tuple(still_pending),
        action_logs=tuple(trimmed_logs),
        volatility_history=tuple(new_vol_history)
    )


def enqueue_action(state: State, action: Dict[str, Any], lag_time: int,
                   option_label: str, event_id: str) -> State:
    """
    Non-immediate: queues an action to resolve after `lag_time` turns.
    The frontend will see it as a pending operation.
    """
    import uuid
    pa = PendingAction(
        action_id=str(uuid.uuid4())[:8],
        source_event=event_id,
        option_label=option_label,
        target=action["target"],
        action_type=action.get("type", "metric"),
        amount=action["amount"],
        resolve_on_turn=state.turn_id + lag_time
    )
    new_pending = tuple(list(state.pending_actions) + [pa])
    return State(
        state.current_date, state.metrics, state.demographics, state.system,
        state.turn_id, state.active_phase, new_pending,
        state.action_logs, state.volatility_history
    )


def apply_action(state: State, action: Dict[str, Any]) -> State:
    """
    Immediate (legacy) - use enqueue_action for temporal friction.
    """
    if action["type"] == "metric":
        return state.update_metric(action["target"], action["amount"])
    elif action["type"] == "demographic":
        return state.update_demographic(action["target"], action["amount"])
    elif action["type"] == "system":
        return state.update_system(action["target"], action["amount"])
    return state
