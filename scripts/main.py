import sys
import os
import random
import time
import datetime
import json
from typing import List

sys.path.append(os.path.join(os.path.dirname(__file__), 'engine'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'cli'))

from state_manager import State, update_turn, apply_action
from event_processor import EventProcessor
from terminal_view import TerminalView

def load_scenario_config(scenario_name: str) -> dict:
    config_path = os.path.join(os.path.dirname(__file__), 'scenarios', scenario_name, 'config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[!] Scenario config '{scenario_name}' not found. Falling back to default Modern Geopolitics.")
        return {} # Should ideally return a hardcoded default

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
            "provocation": 15.0,  # Transactional Disrupter base
        }
    )

def main():
    ui = TerminalView()
    ui.clear_screen()
    
    print("Select Scenario Architecture:")
    print("1. Modern Geopolitics")
    print("2. High Fantasy Cartel")
    print("3. Cyberpunk Syndicate")
    
    choice = input("\nEnter choice (1-3): ")
    if choice == '2':
        scenario_key = 'high_fantasy_cartel'
    elif choice == '3':
        scenario_key = 'cyberpunk_syndicate'
    else:
        scenario_key = 'modern_geopolitics'
        
    config = load_scenario_config(scenario_key)
    processor = EventProcessor(scenario_key)
    
    # State History persistence loop
    state_history: List[State] = []
    
    # Boot the Chronos engine
    current_state = get_initial_state()
    state_history.append(current_state)

    ui.clear_screen()
    theme_title = config.get("theme_name", "GENERIC STRATEGY ENGINE")
    ui.print_header(f"BRINKMANSHIP: {theme_title.upper()}")

    # We will run a loop, but without proper event dicts loaded we'll just simulate passing time
    turn = 1
    while True:
        # Check fail state on primary metric (e.g. stability/mana)
        if current_state.metrics.get("metric_1", 100) <= 0:
            print(f"\n>> CRITICAL SYSTEM FAILURE: {config.get('metrics', {}).get('metric_1', 'Metric 1')} has collapsed. Sequence Terminated. <<")
            break

        # Display abstract state mapped through config
        print(f"\n--- DATE: {current_state.current_date.strftime('%B %d, %Y')} ---")
        
        # Pull random event (since we don't have diplomacy plugged in the generic way yet)
        if processor.event_library:
             active_event = random.choice(processor.event_library)
             ui.display_event(active_event.get("title", "Unknown Event"), active_event.get("description", ""))
             
             for idx, opt in enumerate(active_event.get("options", [])):
                 print(f"[{idx+1}] {opt.get('text')}")
                 
             try:
                 user_input = int(input("\nSelect Option: ")) - 1
                 selected_option = active_event["options"][user_input]
             except (ValueError, IndexError):
                 selected_option = active_event["options"][0]
                 
             outcome_key, actions, narrative = processor.resolve_event(selected_option, current_state)
             print(f"\n>> {outcome_key}: {narrative}")
             
             # Apply Action List via Pure Functions
             for act in actions:
                 current_state = apply_action(current_state, act)

        else:
             print("\n[!] No events available for this scenario. Time passes...")
             time.sleep(1)

        # Decay through Chronos loop
        current_state = update_turn(current_state)
        state_history.append(current_state)
        
        print(f"\n{ui.colors.DARK_GRAY}--- [End of Day] - Press Enter to proceed to the next day ---{ui.colors.ENDC}")
        input()
        ui.clear_screen()
        turn += 1

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSimulation terminated by user.")
        sys.exit(0)
