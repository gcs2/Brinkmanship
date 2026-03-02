import unittest
from state_manager import StateManager

class TestStateManager(unittest.TestCase):
    def test_initial_state(self):
        sm = StateManager()
        self.assertEqual(sm.state["consumer_price_index"], 100)
    
    def test_decay(self):
        sm = StateManager()
        sm.state["global_stability"] = 30
        sm.update_turn()
        # decay factor = (50 - 30) // 10 = 2. CPI should be 102
        self.assertEqual(sm.state["consumer_price_index"], 102)

if __name__ == '__main__':
    unittest.main()
