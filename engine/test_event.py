import unittest
from event_processor import EventProcessor

class TestEventProcessor(unittest.TestCase):
    def test_transactional_disrupter_modifier(self):
        ep = EventProcessor()
        # Mock option with 50 threshold
        option = {
            "category": "military",
            "threshold": 50,
            "outcomes": {
                "SUCCESS": {"description": "Strike successful."},
                "FAILURE": {"description": "Strike failed."}
            }
        }
        # Leader trait with +100 modifier to guarantee success
        leader_traits = {"military": 100}
        
        result = ep.resolve_event(option, leader_traits)
        self.assertEqual(result["result_type"], "SUCCESS")

if __name__ == '__main__':
    unittest.main()
