import random
import json
import os
from typing import Dict, Any, List, Tuple

class EventProcessor:
    def __init__(self, scenario_path="modern_geopolitics"):
        self.event_library = []
        try:
            # First try loading from scenarios
            library_path = os.path.join(os.path.dirname(__file__), '..', 'scenarios', scenario_path, 'scenario.json')
            if not os.path.exists(library_path):
                 # Fallback to engine dir for tests
                 library_path = os.path.join(os.path.dirname(__file__), 'event_library.json')
            with open(library_path, 'r') as f:
                data = json.load(f)
                self.event_library = data.get("events", []) if isinstance(data, dict) else data
        except FileNotFoundError:
            self.event_library = []

    def load_event_from_json(self, event_id: str) -> Dict:
        return next((ev for ev in self.event_library if ev["event_id"] == event_id), None)

    def resolve_event(self, option: Dict, current_state) -> Tuple[str, List[Dict[str, Any]], str]:
        """
        Calculates outcome using a Gaussian Distribution.
        Returns (Status, Actions_List, Narrative)
        """
        volatility = current_state.system.get("volatility", 15.0)
        chaos_modifier = 0.0
        
        # If leader is a wild card wrapper, apply the chaos offset
        # We look for simple provocation baseline to act as Chaos modifier
        if current_state.system.get("provocation", 0.0) >= 10.0:
             chaos_modifier = 15.0
        
        # Determine base success chance. 
        # For prototype, we use the option 'threshold' to decide baseline
        base_threshold = option.get("threshold", 50)
        
        # We roll a Gaussian curve centered at 50 + chaos offset, with StdDev = Volatility
        roll = random.gauss(50 + chaos_modifier, volatility)
        
        # Determine Success or Failure
        outcome_key = "SUCCESS" if roll >= base_threshold else "FAILURE"
        outcomes = option.get("outcomes", {})
        
        if outcome_key not in outcomes:
            return ("ERROR", [], "Outcome key missing in JSON.")
            
        selected_outcome = outcomes[outcome_key]
        narrative = selected_outcome.get("description", "")
        effects = selected_outcome.get("effects", {})
        
        actions = []
        
        # The new Gaussian calculus creates fractional adjustments instead of fixed ints
        # If an effect is supposed to be '15', we scale it based on how far from the threshold the roll was
        magnitude_scalar = max(0.1, abs(roll - base_threshold) / 10.0)
        
        for key, value in effects.items():
            # Translate legacy string keys to pure actions
            # Determine if it's a metric, demo, or system
            target_type = "metric"
            if "demo" in key: target_type = "demographic"
            elif key in ("volatility", "fear_index", "provocation"): target_type = "system"
            
            # Apply fractional gaussian scalar and round it
            final_amount = round(float(value) * magnitude_scalar, 4)
            actions.append({"target": key, "type": target_type, "amount": final_amount})
            
        return (outcome_key, actions, narrative)
