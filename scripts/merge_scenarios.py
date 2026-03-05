import json
import os

def merge_scenario(theme_dir, config_name, event_lib_name, output_name="scenario.json"):
    config_path = os.path.join(theme_dir, config_name)
    event_path = os.path.join(theme_dir, event_lib_name)
    
    # Try to load config
    scenario_data = {}
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            scenario_data = json.load(f)
            
    # Restructure mappings
    if "metrics" in scenario_data and "mappings" not in scenario_data:
        mappings = {
            "metrics": scenario_data.pop("metrics", {}),
            "demographics": scenario_data.pop("demographics", {}),
            "system": scenario_data.pop("system", {})
        }
        scenario_data["mappings"] = mappings

    # Try to load events (fallback to engine/event_library.json if it's modern)
    if not os.path.exists(event_path):
        event_path = os.path.join(os.path.dirname(__file__), 'engine', event_lib_name)
        
    events = []
    if os.path.exists(event_path):
        with open(event_path, 'r') as f:
            data = json.load(f)
            events = data.get("events", data) if isinstance(data, dict) else data
            
    scenario_data["events"] = events
    
    out_path = os.path.join(theme_dir, output_name)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(scenario_data, f, indent=2)
    print(f"Created {out_path}")

if __name__ == '__main__':
    base = os.path.join(os.path.dirname(__file__), 'scenarios')
    merge_scenario(os.path.join(base, 'modern_geopolitics'), 'config.json', 'event_library.json')
    merge_scenario(os.path.join(base, 'high_fantasy_cartel'), 'config.json', 'event_library.json')
    merge_scenario(os.path.join(base, 'cyberpunk_syndicate'), 'config.json', 'event_library.json')
