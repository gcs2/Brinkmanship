import unittest
import requests
import time
import subprocess
import os
import signal

class TestSovereignAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Start the API server in a background process
        cls.api_process = subprocess.Popen(
            ["python", "api/main.py"],
            cwd=r"c:\Users\zephy\Documents\Brinkmanship",
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )
        # Give the server a moment to start
        time.sleep(3)

    @classmethod
    def tearDownClass(cls):
        # Terminate the API server
        os.kill(cls.api_process.pid, signal.CTRL_BREAK_EVENT)
        cls.api_process.wait()

    def test_get_state(self):
        response = requests.get("http://localhost:8000/api/state")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("metrics", data)
        self.assertIn("current_date", data)

    def test_get_config(self):
        response = requests.get("http://localhost:8000/api/config")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("theme_name", data)
        self.assertIn("mappings", data)

    def test_next_turn(self):
        # Get initial state
        initial_res = requests.get("http://localhost:8000/api/state")
        initial_date = initial_res.json()["current_date"]
        
        # Advance turn
        response = requests.post("http://localhost:8000/api/turn")
        self.assertEqual(response.status_code, 200)
        
        # Verify date changed
        new_res = requests.get("http://localhost:8000/api/state")
        new_date = new_res.json()["current_date"]
        self.assertNotEqual(initial_date, new_date)

if __name__ == "__main__":
    unittest.main()
