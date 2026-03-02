from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import json
import datetime
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

# Add engine path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'engine'))
from state_manager import (
    State, update_turn, apply_action, enqueue_action,
    PHASE_MUNDANE, PHASE_TENSIONS, PHASE_FLASHPOINT
)
from event_processor import EventProcessor

app = FastAPI(title="Sovereign API Bridge v2.0 — Friction & Fog")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas (Manifesto Compliant) ---

class MetricState(BaseModel):
    id: str
    label: str
    tooltip: str
    value: float
    volatility: float
    trend: List[float]

class PendingActionOut(BaseModel):
    action_id: str
    source_event: str
    option_label: str
    target: str
    resolve_on_turn: int

class GameStateSnapshot(BaseModel):
    turn_id: int
    current_date: str
    active_phase: int
    phase_name: str
    metrics: Dict[str, float]
    demographics: Dict[str, float]
    system: Dict[str, float]
    formatted_metrics: List[MetricState]
    pending_actions: List[PendingActionOut]
    action_logs: List[str]
    volatility_history: List[float]
    active_scenario: str
    ui_context: Optional[Dict[str, Any]] = None
    audio_texture: Optional[Dict[str, Any]] = None

class ActionRequest(BaseModel):
    action_type: str
    target: str
    amount: float

class EventDecisionRequest(BaseModel):
    event_id: str
    option_id: str

# --- Persistence Stack ---
SCENARIO = "modern_geopolitics"
state_history: List[State] = []
processor = None
scenario_config = {}

PHASE_NAMES = {
    PHASE_MUNDANE: "Incremental Growth",
    PHASE_TENSIONS: "Building Tensions",
    PHASE_FLASHPOINT: "Flashpoint"
}

def get_initial_state() -> State:
    return State(
        current_date=datetime.date(2025, 1, 20),
        metrics={
            "metric_1": 80.0,
            "metric_2": 50.0,
            "metric_3": 100.0,
            "metric_4": 60.0,
            "metric_5": 35000.0,
            "metric_6": 4.5,
            "metric_7": 4.0,
            "metric_8": 75.0,
            "metric_9": 10.0,
        },
        demographics={
            "demo_1": 50.0,
            "demo_2": 50.0,
            "demo_3": 50.0,
        },
        system={
            "volatility": 5.0,
            "fear_index": 0.0,
            "provocation": 15.0,
        },
        turn_id=0,
        active_phase=PHASE_MUNDANE,
        pending_actions=tuple(),
        action_logs=tuple(),
        volatility_history=tuple(),
    )

def load_system():
    global processor, scenario_config, state_history
    processor = EventProcessor(SCENARIO)

    config_path = os.path.join(os.path.dirname(__file__), '..', 'scenarios', SCENARIO, 'scenario.json')
    try:
        with open(config_path, 'r') as f:
            scenario_config = json.load(f)
    except FileNotFoundError:
        scenario_config = {}

    initial_state = get_initial_state()
    state_history = [initial_state]

load_system()

def format_state(state: State) -> GameStateSnapshot:
    """Translates engine State to UI-ready Snapshot"""
    formatted_metrics = []
    mappings = scenario_config.get("mappings", {})
    metric_labels = mappings.get("metrics", {})
    metric_tooltips = mappings.get("metric_tooltips", {})

    # Build trend from recent history
    history_window = state_history[-20:] if len(state_history) > 1 else [state]

    for mid, val in state.metrics.items():
        trend = [s.metrics.get(mid, val) for s in history_window]
        formatted_metrics.append(MetricState(
            id=mid,
            label=metric_labels.get(mid, mid),
            tooltip=metric_tooltips.get(mid, ""),
            value=val,
            volatility=state.system.get("volatility", 0.0),
            trend=trend,
        ))

    pending_out = [
        PendingActionOut(
            action_id=pa.action_id,
            source_event=pa.source_event,
            option_label=pa.option_label,
            target=pa.target,
            resolve_on_turn=pa.resolve_on_turn,
        )
        for pa in state.pending_actions
    ]

    return GameStateSnapshot(
        turn_id=state.turn_id,
        current_date=state.current_date.isoformat(),
        active_phase=state.active_phase,
        phase_name=PHASE_NAMES.get(state.active_phase, "Unknown"),
        metrics=state.metrics,
        demographics=state.demographics,
        system=state.system,
        formatted_metrics=formatted_metrics,
        pending_actions=pending_out,
        action_logs=list(state.action_logs),
        volatility_history=list(state.volatility_history),
        active_scenario=SCENARIO,
        ui_context=scenario_config.get("assets", {}).get("ui_context"),
        audio_texture=scenario_config.get("assets", {}).get("audio_texture"),
    )

@app.get("/api/state", response_model=GameStateSnapshot)
def get_state():
    if not state_history:
        raise HTTPException(status_code=500, detail="State history empty")
    return format_state(state_history[-1])

@app.get("/api/config")
def get_config():
    return scenario_config

@app.post("/api/turn")
def next_turn():
    global state_history
    new_state = update_turn(state_history[-1])
    state_history.append(new_state)

    # Cap history at 50 snapshots (Manifesto Requirement)
    if len(state_history) > 50:
        state_history.pop(0)

    return {"status": "success", "new_state": format_state(new_state)}

@app.post("/api/action")
def submit_action(req: ActionRequest):
    """Immediate legacy action (no lag)."""
    global state_history
    current_state = state_history[-1]
    action = {"type": req.action_type, "target": req.target, "amount": req.amount}
    new_state = apply_action(current_state, action)
    state_history[-1] = new_state
    return {"status": "success", "new_state": format_state(new_state)}

@app.post("/api/resolve_event")
def resolve_event(req: EventDecisionRequest):
    """
    Phase 6: Actions are now QUEUED with lag_time, not immediately applied.
    Returns the pending operations for the frontend Intel Feed.
    """
    global state_history
    current_state = state_history[-1]

    event = processor.load_event_from_json(req.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    option = next((opt for opt in event.get("options", []) if opt["id"] == req.option_id), None)
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    lag_time = option.get("lag_time", 5)  # Default 5 days if not specified
    option_label = option.get("text", "Operation")

    # Resolve the stochastic outcome (but don't apply yet — queue it)
    outcome_key, actions, narrative = processor.resolve_event(option, current_state)

    new_state = current_state
    for action in actions:
        new_state = enqueue_action(
            new_state, action, lag_time, f"{option_label} ({outcome_key})", req.event_id
        )

    # Spike volatility immediately (the tension of committing to a decision)
    import random
    from engine.state_manager import State as St
    vol_shock = random.gauss(20.0, 5.0)
    new_sys = dict(new_state.system)
    new_sys["volatility"] = round(min(100.0, new_state.system.get("volatility", 0) + vol_shock), 4)
    new_state = State(
        new_state.current_date, new_state.metrics, new_state.demographics, new_sys,
        new_state.turn_id, new_state.active_phase, new_state.pending_actions,
        new_state.action_logs, new_state.volatility_history
    )

    state_history[-1] = new_state

    return {
        "status": "queued",
        "outcome_preview": outcome_key,
        "narrative": narrative,
        "lag_time_days": lag_time,
        "pending_count": len(new_state.pending_actions),
        "state": format_state(new_state)
    }

@app.post("/api/rewind")
async def rewind_simulation():
    global state_history
    if len(state_history) > 1:
        state_history.pop()
        return {"status": "rewound", "new_state": format_state(state_history[-1])}
    return {"status": "at_origin", "new_state": format_state(state_history[-1])}

@app.post("/api/save")
def save_state():
    """Serialize the full state history for Snapshot Persistence."""
    import pickle
    os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'saves'), exist_ok=True)
    save_path = os.path.join(os.path.dirname(__file__), '..', 'saves', 'current_run.pkl')
    with open(save_path, 'wb') as f:
        pickle.dump(state_history, f)
    return {"status": "saved", "turn_id": state_history[-1].turn_id}

@app.post("/api/load")
def load_state():
    """Load the saved state history from disk."""
    import pickle
    global state_history
    save_path = os.path.join(os.path.dirname(__file__), '..', 'saves', 'current_run.pkl')
    if not os.path.exists(save_path):
        raise HTTPException(status_code=404, detail="No save file found")
    with open(save_path, 'rb') as f:
        state_history = pickle.load(f)
    return {"status": "loaded", "new_state": format_state(state_history[-1])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
