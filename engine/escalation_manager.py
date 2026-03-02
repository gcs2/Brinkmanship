class EscalationManager:
    def __init__(self):
        self.escalation_level = 0
        
    def get_escalation_level(self, gfi):
        """Maps the GFI to an escalation level."""
        if gfi >= 90:
            return 3
        elif gfi >= 70:
            return 2
        elif gfi >= 50:
            return 1
        else:
            return 0
            
    def apply_escalation_effects(self, state):
        """
        Applies mechanical effects of the escalation ladder directly to the state.
        Level 0: +2% Stock Market growth.
        Level 1: Diplomatic Ledger events start appearing (handled in diplomacy manager).
        Level 2: Target tariffs (+1.5% CPI growth).
        Level 3: Active Sabotage (-10 Stability per turn).
        """
        gfi = state.get("global_fear_index", 0)
        self.escalation_level = self.get_escalation_level(gfi)
        
        if self.escalation_level == 0:
            # +2% Stock Market growth
            old_market = state.get("stock_market_index", 35000)
            state["stock_market_index"] = old_market * 1.02
        elif self.escalation_level == 2:
            # +1.5% CPI (CPI) growth
            old_cpi = state.get("consumer_price_index", 100)
            state["consumer_price_index"] = old_cpi * 1.015
        elif self.escalation_level == 3:
            # Apply all effects from Level 2 as well, assuming it escalates
            # Or just Level 3 distinct: -10 Stability per turn
            old_cpi = state.get("consumer_price_index", 100)
            state["consumer_price_index"] = old_cpi * 1.015
            state["global_stability"] = max(0, state.get("global_stability", 50) - 10)
            
        return self.escalation_level
