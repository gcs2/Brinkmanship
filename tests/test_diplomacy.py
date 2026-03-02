import unittest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../engine'))
from state_manager import StateManager

class TestDiplomacy(unittest.TestCase):
    def test_china_embargo(self):
        sm = StateManager()
        # Force Esc level >= 2 to allow China Embargo (GFI >= 70)
        sm.state["stock_market_volatility"] = 200
        # Oil price > 120 triggers the embargo thresholds
        sm.state["oil_price"] = 130
        
        sm.update_turn()
        
        # Event queue should contain CHINA_EMBARGO_001
        events = [ev["id"] for ev in sm.event_queue if ev.get("type") == "BLACK_SWAN"]
        self.assertIn("CHINA_EMBARGO_001", events)

if __name__ == '__main__':
    unittest.main()
