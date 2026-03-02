from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import json
import datetime
from pydantic import BaseModel
from typing import Dict, Any, Optional

# Add engine path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'engine'))
from state_manager import State, update_turn, apply_action
from event_processor import EventProcessor

app = FastAPI(title="Sovereign API Bridge")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Management
SCENARIO = "modern_geopolitics"
state_history = []
current_state = None
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
    global current_state, processor, scenario_config, state_history
    processor = EventProcessor(SCENARIO)
    
    config_path = os.path.join(os.path.dirname(__file__), '..', 'scenarios', SCENARIO, 'scenario.json')
    try:
        with open(config_path, 'r') as f:
            scenario_config = json.load(f)
    except FileNotFoundError:
        scenario_config = {}
        
    current_state = get_initial_state()
    state_history = [current_state]

load_system()

# Request Models
class ActionRequest(BaseModel):
    action_type: str
    target: str
    amount: float

class EventDecisionRequest(BaseModel):
    event_id: str
    option_id: str

@app.get("/api/state")
def get_state():
    if current_state is None:
        raise HTTPException(status_code=500, detail="State not initialized")
    return {
        "current_date": current_state.current_date.isoformat(),
        "metrics": current_state.metrics,
        "demographics": current_state.demographics,
        "system": current_state.system,
        "turn": len(state_history)
    }

@app.get("/api/config")
def get_config():
    return scenario_config

@app.post("/api/action")
def submit_action(req: ActionRequest):
    global current_state
    
    action = {"type": req.action_type, "target": req.target, "amount": req.amount}
    current_state = apply_action(current_state, action)
    
    return {"status": "success", "new_state": get_state()}

@app.post("/api/turn")
def next_turn():
    global current_state
    current_state = update_turn(current_state)
    state_history.append(current_state)
    return {"status": "success", "new_state": get_state()}

@app.post("/api/resolve_event")
def resolve_event(req: EventDecisionRequest):
    global current_state
    event = processor.load_event_from_json(req.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    option = next((opt for opt in event.get("options", []) if opt["id"] == req.option_id), None)
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
        
    outcome_key, actions, narrative = processor.resolve_event(option, current_state)
    
    for action in actions:
        current_state = apply_action(current_state, action)
        
    return {
        "status": "success",
        "outcome": outcome_key,
        "narrative": narrative,
        "state": get_state()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
