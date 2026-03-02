import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'engine'))
from state_manager import StateManager

def run_stress_test():
    sm = StateManager()
    # Hardcode stability to 15
    sm.state["global_stability"] = 15
    
    print("=" * 60)
    print("STRESS TEST: GLOBAL STABILITY LOCKED AT 15 (10 TURNS)")
    print("-" * 60)
    print(f"{'Turn':<6} | {'CPI (CPI)':<25} | {'CPI Velocity (+)'}")
    print("-" * 60)
    
    previous_cpi = sm.state["consumer_price_index"]
    print(f"{0:<6} | {previous_cpi:<25.2f} | 0")
    
    for turn in range(1, 11):
        # Force stability to stay at 15
        sm.state["global_stability"] = 15
        sm.update_turn()
        
        current_cpi = sm.state["consumer_price_index"]
        velocity = current_cpi - previous_cpi
        
        print(f"{turn:<6} | {current_cpi:<25.2f} | +{velocity:.2f}")
        previous_cpi = current_cpi
        
    print("=" * 60)

if __name__ == "__main__":
    run_stress_test()
