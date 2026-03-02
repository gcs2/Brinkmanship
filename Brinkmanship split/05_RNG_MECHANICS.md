# **PRD ADDENDUM: THE "DICE ROLL" LOGIC (CONTINUED)**

To give Antigravity the "nitty-gritty" it needs for Phase 1, we are adding the **Stochastic Resolution Function**. This prevents the game from being a "Visual Novel" by introducing a true RNG (Random Number Generator) system influenced by your character's traits.

### **The Probability Function (Logic for Antigravity)**

Python  
import random

def resolve\_event(option, leader\_traits):  
    \# Base success is pulled from our JSON schema  
    roll \= random.randint(1, 100\)  
      
    \# Apply leader modifiers (e.g., Transactional Disrupter \+15 on military)  
    modifier \= leader\_traits.get(option\['category'\], 0\)  
    final\_score \= roll \+ modifier  
      
    \# Determine result based on outcome weights  
    \# Success if final\_score \> threshold (usually 50\)  
    if final\_score \>= 50:  
        return option\['outcomes'\]\['SUCCESS'\]  
    else:  
        return option\['outcomes'\]\['FAILURE'\]

---

