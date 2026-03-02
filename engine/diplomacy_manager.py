import random

class DiplomacyManager:
    def __init__(self):
        # Data structure for Global Actors
        self.actors = {
            "CHINA": {
                "base_aggression": 40,
                "stance": "Competitive",
                "thresholds": {"oil_price": 120}  # Triggers China Embargo
            },
            "IRGC": {
                "base_aggression": 60,
                "stance": "Hostile",
                "thresholds": {"approval": 70}
            },
            "EU": {
                "base_aggression": 10,
                "stance": "Allied",
                "thresholds": {"global_stability": 30}
            }
        }
    
    def process_diplomacy(self, state, escalation_level):
        """
        Rolls aggression for each actor. If Aggression > 80, actor can inject a Black Swan event.
        Also checks threshold triggers.
        Returns a list of generated event IDs or actions.
        """
        injected_events = []
        
        # Diplomatic events only start appearing at Escalation Level 1+
        if escalation_level < 1:
            return injected_events

        provocation = state.get("leader_provocation", 0)
        stability = state.get("global_stability", 50)
        
        for actor_name, data in self.actors.items():
            # Aggression Roll = Base_Aggression + Player_Provocation - Global_Stability
            # (Note: Math can go negative, we floor at 0)
            aggression_roll = data["base_aggression"] + provocation - stability
            # Add some RNG
            aggression_roll += random.randint(-10, 10)
            
            if aggression_roll > 80:
                # Potential Black Swan event injection based on actor
                pass # Can inject generic events here

            # Specific Threshold Triggers
            if actor_name == "CHINA" and escalation_level >= 2:
                # Unlocks China Embargo at Level 2+
                if state.get("oil_price", 0) > data["thresholds"]["oil_price"]:
                    injected_events.append("CHINA_EMBARGO_001")
            
            if actor_name == "IRGC":
                if state.get("approval", 0) > data["thresholds"]["approval"]:
                    # Inject asymmetric cyber strike
                    # Using a placeholder event ID or directly applying state effects if no event needed
                    injected_events.append("IRGC_CYBER_STRIKE")
                    
            if actor_name == "EU":
                if state.get("global_stability", 100) < data["thresholds"]["global_stability"]:
                    injected_events.append("EU_REGULATORY_DECOUPLING")
                    
        return injected_events
