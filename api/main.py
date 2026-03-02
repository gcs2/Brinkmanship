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
import random

app = FastAPI(title="Sovereign API Bridge v2.1 — Identity & Feedback")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

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

class Advisor(BaseModel):
    id: str
    name: str
    role: str
    specialty: str
    trust: float

class Relation(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    approval: float

class PlayerProfile(BaseModel):
    country: str
    leader_name: str
    title: str
    stress: float
    nuclear_stockpile: Optional[int] = None

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
    player_profile: Optional[PlayerProfile] = None
    advisors: List[Advisor] = []
    relations: List[Relation] = []

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
    # If the scenario defines a specific start date, use it
    if "player_profile" in scenario_config and "start_date" in scenario_config["player_profile"]:
        dt = datetime.datetime.strptime(scenario_config["player_profile"]["start_date"], "%Y-%m-%d").date()
        initial_state = State(
            current_date=dt,
            metrics=initial_state.metrics, demographics=initial_state.demographics, system=initial_state.system,
            turn_id=initial_state.turn_id, active_phase=initial_state.active_phase,
            pending_actions=initial_state.pending_actions, action_logs=initial_state.action_logs,
            volatility_history=initial_state.volatility_history
        )
    
    state_history = [initial_state]

load_system()

def format_state(state: State) -> GameStateSnapshot:
    """Translates engine State to UI-ready Snapshot"""
    formatted_metrics = []
    mappings = scenario_config.get("mappings", {})
    metric_labels = mappings.get("metrics", {})
    metric_tooltips = mappings.get("metric_tooltips", {})

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

    # Calculate global approval for relations math
    global_approval = state.metrics.get("metric_2", 50.0)

    # Dynamic Relations Generation based on scenario defaults + state
    raw_relations = scenario_config.get("great_powers", [])
    relations = []
    for r in raw_relations:
        # If things are volatile or approval drops, foreign relations drift
        drift = (50.0 - global_approval) * 0.2
        final_approval = min(100, max(0, r.get("base_approval", 50) - drift))
        relations.append(Relation(
            id=r["id"], name=r["name"], lat=r["lat"], lon=r["lon"], approval=round(final_approval, 1)
        ))

    # Dynamic Profile
    raw_profile = scenario_config.get("player_profile", {})
    stress_level = min(100, max(0, state.system.get("volatility", 0) * 1.5 + (100 - global_approval) * 0.5))
    profile = PlayerProfile(
        country=raw_profile.get("country", "Unknown"),
        leader_name=raw_profile.get("leader_name", "Classified"),
        title=raw_profile.get("title", "Executive"),
        stress=round(stress_level, 1),
        nuclear_stockpile=raw_profile.get("nuclear_stockpile")
    )

    # Advisors drift based on trust metric (demo_2 usually)
    elite_trust = state.demographics.get("demo_2", 50.0)
    raw_advisors = scenario_config.get("advisors", [])
    advisors = []
    for a in raw_advisors:
        # Trust is base trust +/- elite support
        trust = min(100, max(0, a.get("base_trust", 50) + (elite_trust - 50) * 0.5))
        advisors.append(Advisor(
            id=a["id"], name=a["name"], role=a["role"], specialty=a["specialty"], trust=round(trust, 1)
        ))

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
        player_profile=profile,
        relations=relations,
        advisors=advisors
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

    if len(state_history) > 50:
        state_history.pop(0)

    return {"status": "success", "new_state": format_state(new_state)}

@app.get("/api/scenarios")
def list_scenarios():
    base_path = os.path.join(os.path.dirname(__file__), '..', 'scenarios')
    scenarios = []
    if os.path.exists(base_path):
        for d in os.listdir(base_path):
            if os.path.isdir(os.path.join(base_path, d)):
                scenarios.append(d)
    return {"scenarios": scenarios}

class ScenarioLoadRequest(BaseModel):
    scenario_id: str

@app.post("/api/load_scenario")
def api_load_scenario(req: ScenarioLoadRequest):
    global SCENARIO, scenario_config
    base_path = os.path.join(os.path.dirname(__file__), '..', 'scenarios', req.scenario_id)
    if not os.path.exists(base_path):
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    SCENARIO = req.scenario_id
    load_system()
    return {"status": "loaded", "theme": scenario_config.get("theme_name", "Unknown"), "new_state": format_state(state_history[-1])}

@app.get("/api/next_event")
def get_next_event():
    """Returns an appropriate event based on the current phase and stochastic engine, or null if nothing triggered."""
    state = state_history[-1]
    
    # Simple trigger logic: Phase 1 triggers every 14 days. Phase 2 every 7 days. Phase 3 every 3 days.
    trigger_modulo = 14 if state.active_phase == 1 else (7 if state.active_phase == 2 else 3)
    
    if state.turn_id % trigger_modulo != 0 or state.turn_id == 0:
        return {"event": None}

    events = scenario_config.get("events", [])
    valid_events = [e for e in events if e.get("phase_requirement", 1) <= state.active_phase]

    if not valid_events:
        return {"event": None}
    
    # Pick a random valid event for now (in the future, check trigger_conditions actively)
    event = random.choice(valid_events)
    
    # Map effects for predictive tooltip flavor
    mappings = scenario_config.get("mappings", {}).get("metrics", {})
    mapped_options = []
    for opt in event.get("options", []):
        opt_copy = opt.copy()
        
        # Analyze predicted effects to show the user
        effects = opt.get("outcomes", {}).get("SUCCESS", {}).get("effects", {})
        predicted_text = ", ".join([f"{mappings.get(k, k)} {('+' if v>0 else '')}{v}" for k, v in effects.items()])
        opt_copy["predicted_impact"] = predicted_text if predicted_text else "Impact Uncertain."
        
        mapped_options.append(opt_copy)
    
    event_payload = event.copy()
    event_payload["options"] = mapped_options
    return {"event": event_payload}

@app.post("/api/resolve_event")
def resolve_event(req: EventDecisionRequest):
    global state_history
    current_state = state_history[-1]

    event = processor.load_event_from_json(req.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    option = next((opt for opt in event.get("options", []) if opt["id"] == req.option_id), None)
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    lag_time = option.get("lag_time", 5)
    option_label = option.get("text", "Operation")

    outcome_key, actions, narrative = processor.resolve_event(option, current_state)

    new_state = current_state
    for action in actions:
        new_state = enqueue_action(
            new_state, action, lag_time, f"{option_label} ({outcome_key})", req.event_id
        )

    vol_shock = random.gauss(20.0, 5.0)
    new_sys = dict(new_state.system)
    new_sys["volatility"] = round(min(100.0, new_state.system.get("volatility", 0) + vol_shock), 4)
    from engine.state_manager import State as St
    new_state = St(
        new_state.current_date, new_state.metrics, new_state.demographics, new_sys,
        new_state.turn_id, new_state.active_phase, new_state.pending_actions,
        new_state.action_logs, new_state.volatility_history
    )

    state_history[-1] = new_state

    return {
        "status": "queued",
        "outcome_preview": outcome_key,
        "narrative": "Operation committed into the bureaucratic stream. Monitor intel feed.",
        "lag_time_days": lag_time,
        "pending_count": len(new_state.pending_actions),
        "state": format_state(new_state)
    }

@app.post("/api/save")
def save_state():
    import pickle
    os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'saves'), exist_ok=True)
    save_path = os.path.join(os.path.dirname(__file__), '..', 'saves', 'current_run.pkl')
    with open(save_path, 'wb') as f:
        pickle.dump(state_history, f)
    return {"status": "saved", "turn_id": state_history[-1].turn_id}

@app.post("/api/load")
def load_state():
    import pickle
    global state_history
    save_path = os.path.join(os.path.dirname(__file__), '..', 'saves', 'current_run.pkl')
    with open(save_path, 'rb') as f:
        state_history = pickle.load(f)
    return {"status": "loaded", "new_state": format_state(state_history[-1])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
