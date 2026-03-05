import json
import os

base = os.path.join(os.path.dirname(__file__), 'scenarios')
for d in ['modern_geopolitics', 'high_fantasy_cartel', 'cyberpunk_syndicate']:
    p = os.path.join(base, d, 'scenario.json')
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'assets' not in data:
            data['assets'] = {
                "background_image": f"/assets/{d}/bg.webp",
                "dossier_modal_bg": f"/assets/{d}/modal.webp"
            }
            
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
print("Updated scenario configs with assets.")
