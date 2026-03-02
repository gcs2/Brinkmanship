import unittest
import sys
import os
import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../engine'))
from state_manager import State, update_turn, apply_action

class TestImmutableState(unittest.TestCase):
    def setUp(self):
        self.initial_state = State(
            current_date=datetime.date(2025, 1, 20),
            metrics={
                "metric_1": 80.0, 
                "metric_2": 50.0,
                "metric_3": 100.0,
                "metric_4": 60.0,
                "metric_5": 35000.0,
                "metric_6": 4.5,
                "metric_7": 4.0,
                "metric_8": 75.0
            },
            demographics={"demo_1": 50.0, "demo_2": 50.0, "demo_3": 50.0},
            system={"volatility": 15.0, "fear_index": 0.0, "provocation": 10.0}
        )

    def test_pure_function_integrity(self):
        """Ensure the apply_action returns a NEW object and doesn't mutate."""
        action = {"target": "metric_1", "type": "metric", "amount": -10.5}
        
        new_state = apply_action(self.initial_state, action)
        
        # Verify original state is untouched
        self.assertEqual(self.initial_state.metrics["metric_1"], 80.0)
        # Verify new state is updated
        self.assertEqual(new_state.metrics["metric_1"], 69.5)
        # Verify they are entirely different objects in memory
        self.assertIsNot(self.initial_state, new_state)

    def test_chronos_decay(self):
        """Ensure date shifts and fractional decay operates normally."""
        # Force low stability
        bad_state = apply_action(self.initial_state, {"target": "metric_1", "type": "metric", "amount": -40.0})
        
        next_day_state = update_turn(bad_state)
        
        self.assertEqual(next_day_state.current_date, datetime.date(2025, 1, 21))
        # metric_3 (formerly CPI) should have increased
        self.assertGreater(next_day_state.metrics["metric_3"], bad_state.metrics["metric_3"])

if __name__ == '__main__':
    unittest.main()
