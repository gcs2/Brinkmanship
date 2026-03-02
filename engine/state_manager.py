import datetime
import math
from dataclasses import dataclass, field
from typing import Dict, Any

@dataclass(frozen=True)
class State:
    current_date: datetime.date
    metrics: Dict[str, float]
    demographics: Dict[str, float]
    system: Dict[str, float]

    def update_metric(self, key: str, value: float) -> 'State':
        """Returns a new state with the updated metric"""
        new_metrics = dict(self.metrics)
        if key in new_metrics:
            new_metrics[key] = round(new_metrics[key] + value, 4)
            # Bounds checking for percentages and specific metrics
            if key in ('metric_1', 'metric_2', 'metric_4', 'metric_9'):
                new_metrics[key] = max(0.0, min(100.0, new_metrics[key]))
        return State(self.current_date, new_metrics, self.demographics, self.system)

    def update_demographic(self, key: str, value: float) -> 'State':
        new_demos = dict(self.demographics)
        if key in new_demos:
            new_demos[key] = round(max(0.0, min(100.0, new_demos[key] + value)), 4)
        return State(self.current_date, self.metrics, new_demos, self.system)

    def update_system(self, key: str, value: float) -> 'State':
        new_sys = dict(self.system)
        if key in new_sys:
            new_sys[key] = round(new_sys[key] + value, 4)
        return State(self.current_date, self.metrics, self.demographics, new_sys)

def update_turn(state: State) -> State:
    """
    Pure function that takes a State, decays its values based on Chronos rules,
    and returns a new State one day later.
    """
    new_date = state.current_date + datetime.timedelta(days=1)
    
    new_metrics = dict(state.metrics)
    new_demos = dict(state.demographics)
    new_sys = dict(state.system)
    
    stability = new_metrics.get("metric_1", 50.0)
    
    # Daily decay calculus based on Chronos requirements
    if stability < 50.0:
        decay_factor = (50.0 - stability) / 100.0
        
        # metric_3 (formerly CPI) goes up factionally
        new_metrics["metric_3"] += (decay_factor * 1.5)
        new_metrics["metric_5"] -= (decay_factor * 15.0)  # Stock Market equivalent
        new_metrics["metric_6"] += (decay_factor * 0.01)  # Bond yield equivalent
        new_metrics["metric_7"] += (decay_factor * 0.005) # Unemployment equivalent
        new_metrics["metric_8"] += (decay_factor * 0.5)   # Oil equivalent
        new_metrics["metric_9"] += (decay_factor * 1.2)   # Scarcity equivalent
        new_sys["volatility"] += (decay_factor * 0.2)

    # GFI Calculation: (Volatility * 0.4) + (Provocation * 0.6)
    new_sys["fear_index"] = (new_sys.get("volatility", 15.0) * 0.4) + (new_sys.get("provocation", 0.0) * 0.6)
    
    # Demographic tensions naturally pull toward a mean or drift based on metrics
    new_demos["demo_1"] -= (new_metrics.get("metric_3", 100) - 100) * 0.01 # Worker class hates inflation
    new_demos["demo_2"] -= (new_sys.get("volatility", 15) - 15) * 0.01 # Elites hate volatility
    new_demos["demo_3"] -= (new_sys.get("fear_index", 0) * 0.01)       # Allies hate fear index
    
    # Ensure precision and bounds
    for k in new_metrics: new_metrics[k] = round(new_metrics[k], 4)
    for k in new_demos: new_demos[k] = round(max(0.0, min(100.0, new_demos[k])), 4)
    for k in new_sys: new_sys[k] = round(new_sys[k], 4)
    
    # Re-calculate average approval (metric_2)
    avg_approval = sum(new_demos.values()) / len(new_demos) if new_demos else 50.0
    new_metrics["metric_2"] = round(avg_approval, 4)

    return State(
        current_date=new_date,
        metrics=new_metrics,
        demographics=new_demos,
        system=new_sys
    )

def apply_action(state: State, action: Dict[str, Any]) -> State:
    """
    Pure function to apply an event 'action' effect onto the state.
    Expected action format: {"target": "metric_1", "type": "metric", "amount": -5.2341}
    """
    if action["type"] == "metric":
        return state.update_metric(action["target"], action["amount"])
    elif action["type"] == "demographic":
        return state.update_demographic(action["target"], action["amount"])
    elif action["type"] == "system":
        return state.update_system(action["target"], action["amount"])
    return state
