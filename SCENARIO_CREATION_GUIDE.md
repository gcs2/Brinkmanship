# SCENARIO CREATION GUIDE

Brinkmanship uses a **Theme-Agnostic Functional State Engine**. This means you can create entirely new games (Modern Geopolitics, Sci-Fi, High Fantasy) by simply writing a single JSON file. 

## The `scenario.json` Blueprint
To create a new game, make a new folder in `/scenarios/your_scenario_name/` and create a `scenario.json` file inside it. 

The `scenario.json` file contains **everything** the game needs to run:
1. **Theme Name:** The title of your game.
2. **Assets:** Links/paths to background images, tactical maps, and thematic visual elements.
3. **Abstract Mappings:** How the engine's generic math variables (`metric_1`, `demo_1`) map to your story's flavor text (e.g., "Mana Pool", "Working Class").
4. **Event Library:** The list of events, decisions, and their impacts on the abstract variables.

### Example Structure: `scenario.json`
```json
{
  "theme_name": "Cyberpunk Syndicate",
  
  "assets": {
    "background_image": "/assets/cyberpunk/neon_city_rain.webp",
    "dossier_modal_bg": "/assets/cyberpunk/hacker_terminal.webp",
    "tactical_map_tint": "#00FFCC"
  },
  
  "mappings": {
    "metrics": {
      "metric_1": "Grid Stability",
      "metric_2": "Street Cred",
      "metric_3": "CredChip Inflation"
    },
    "demographics": {
      "demo_1": "Street Punks & Edgerunners",
      "demo_2": "Corp Execs"
    },
    "system": {
      "volatility": "Data Maelstrom",
      "fear_index": "Corporate Paranoia",
      "provocation": "Runner Audacity"
    }
  },

  "events": [
    {
      "event_id": "CYBER_001",
      "title": "Netrunner Breach",
      "description": "A rogue runner has exposed Arasaka's black ICE.",
      "options": [
        {
          "id": "OPT_A",
          "text": "Hire them.",
          "category": "espionage",
          "threshold": 50,
          "outcomes": {
            "SUCCESS": {
              "description": "They join your crew.",
              "effects": { "metric_2": 15.0, "volatility": 5.0 }
            },
            "FAILURE": {
              "description": "They sell you out to Militech.",
              "effects": { "metric_2": -20.0, "fear_index": 10.0 }
            }
          }
        }
      ]
    }
  ]
}
```

## How The Math Works
When designing events, remember that the Backend Engine uses **Fractional Gaussian Calculus**. 
If you write `"metric_2": 15.0` in your event effect:
1. The engine checks the current `volatility` of your scenario.
2. It rolls a Bell Curve (Gaussian) probability.
3. The actual output applied to `metric_2` will be fractional (e.g., `+13.4921` or `+16.1204`), depending on how chaotic your `volatility` currently is! 

This ensures that your story always feels organic and unpredictable.
