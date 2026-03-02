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
from state_manager import State, update_turn, apply_action
from event_processor import EventProcessor

app = FastAPI(title="Sovereign API Bridge")

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
    value: float
    volatility: float
    trend: List[float]

class GameStateSnapshot(BaseModel):
    turn_id: int
    current_date: str
    metrics: Dict[str, float]
    formatted_metrics: List[MetricState]
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
        },
        demographics={
            "demo_1": 50.0,
            "demo_2": 50.0,
            "demo_3": 50.0,
        },
        system={
            "volatility": 15.0,
            "fear_index": 0.0,
            "provocation": 15.0,
        }
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
    mappings = scenario_config.get("mappings", {}).get("metrics", {})
    
    for mid, val in state.metrics.items():
        formatted_metrics.append(MetricState(
            id=mid,
            label=mappings.get(mid, mid),
            value=val,
            volatility=state.system.get("volatility", 0.0),
            trend=[] # In the future, this would be sliced from state_history
        ))
        
    return GameStateSnapshot(
        turn_id=len(state_history),
        current_date=state.current_date.isoformat(),
        metrics=state.metrics,
        formatted_metrics=formatted_metrics,
        active_scenario=SCENARIO,
        ui_context=scenario_config.get("assets", {}).get("ui_context"),
        audio_texture=scenario_config.get("assets", {}).get("audio_texture")
    )

@app.get("/api/state", response_model=GameStateSnapshot)
def get_state():
    if not state_history:
        raise HTTPException(status_code=500, detail="State history empty")
    return format_state(state_history[-1])

@app.get("/api/config")
def get_config():
    return scenario_config

@app.post("/api/action")
def submit_action(req: ActionRequest):
    global state_history
    current_state = state_history[-1]
    
    action = {"type": req.action_type, "target": req.target, "amount": req.amount}
    new_state = apply_action(current_state, action)
    
    # In a real action, we might push to history, but usually turns push to history
    # For now, we update the head of the current turn
    state_history[-1] = new_state
    return {"status": "success", "new_state": format_state(new_state)}

@app.post("/api/turn")
def next_turn():
    global state_history
    new_state = update_turn(state_history[-1])
    state_history.append(new_state)
    
    # Cap history at 50 snapshots (Manifesto Requirement)
    if len(state_history) > 50:
        state_history.pop(0)
        
    return {"status": "success", "new_state": format_state(new_state)}

@app.post("/api/rewind")
async def rewind_simulation():
    global state_history
    if len(state_history) > 1:
        state_history.pop()
        return {"status": "rewound", "new_state": format_state(state_history[-1])}
    return {"status": "at_origin", "new_state": format_state(state_history[-1])}

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
        
    outcome_key, actions, narrative = processor.resolve_event(option, current_state)
    
    new_state = current_state
    for action in actions:
        new_state = apply_action(new_state, action)
    
    state_history[-1] = new_state
    return {
        "status": "success",
        "outcome": outcome_key,
        "narrative": narrative,
        "state": format_state(new_state)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
