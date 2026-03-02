import unittest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../engine'))
from state_manager import StateManager

class TestEscalation(unittest.TestCase):
    def test_active_sabotage(self):
        sm = StateManager()
        # Force GFI to > 90
        sm.state["stock_market_volatility"] = 100
        sm.state["leader_provocation"] = 100
        # GFI = 100*0.4 + 100*0.6 = 100 > 90 (Level 3)
        
        initial_stability = sm.state["global_stability"]
        
        # update_turn will calculate GFI, set escalation level to 3, and apply effects (-10 stability)
        sm.update_turn()
        
        self.assertEqual(sm.escalation_manager.escalation_level, 3)
        self.assertLess(sm.state["global_stability"], initial_stability)

if __name__ == '__main__':
    unittest.main()
