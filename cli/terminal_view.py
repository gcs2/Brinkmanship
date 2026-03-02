import time

class TerminalColors:
    # Brutalist Minimalism / War Room Aesthetic Dark Grays and Neon Ambers
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    AMBER = '\033[33m'  # Standard text
    BRIGHT_AMBER = '\033[93m'
    RED = '\033[91m'    # Critical/Epic Fury
    BRIGHT_RED = '\033[1;31m'
    DARK_GRAY = '\033[90m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class TerminalView:
    def __init__(self):
        self.colors = TerminalColors()

    def clear_screen(self):
        print("\033[H\033[J", end="")

    def print_header(self, title):
        print(f"\n{self.colors.DARK_GRAY}=" * 50)
        print(f"{self.colors.BRIGHT_AMBER}{self.colors.BOLD}{title.center(50)}{self.colors.ENDC}")
        print(f"{self.colors.DARK_GRAY}=" * 50 + f"{self.colors.ENDC}\n")

    def display_state(self, state_dict):
        """Displays the 'Kitchen Table' metrics."""
        print(f"{self.colors.AMBER}--- SITUATION ROOM METRICS ---{self.colors.ENDC}")
        
        # Color code stability based on danger
        stab = state_dict.get('global_stability', 0)
        stab_color = self.colors.RED if stab < 50 else self.colors.AMBER
        
        cpi = state_dict.get('consumer_price_index', 0)
        cpi_color = self.colors.RED if cpi > 120 else self.colors.AMBER

        print(f"Global Stability:      {stab_color}{stab}{self.colors.ENDC}")
        print(f"Consumer Price Index:  {cpi_color}{cpi}{self.colors.ENDC}")
        print(f"Approval Rating:       {self.colors.AMBER}{state_dict.get('approval', 0)}{self.colors.ENDC}")
        print(f"Institutional Trust:   {self.colors.AMBER}{state_dict.get('institutional_trust', 0)}{self.colors.ENDC}")
        print("\n")

    def display_event(self, event_title, event_desc, is_global=False):
        if is_global:
            print(f"{self.colors.BRIGHT_RED}>> GLOBAL ALERT: {event_title}{self.colors.ENDC}")
        else:
            print(f"{self.colors.CYAN}>> INTERNAL NEWS: {event_title}{self.colors.ENDC}")
            
        # simulated typewriter effect
        for line in event_desc.split('\n'):
            print(f"{self.colors.DARK_GRAY}{line}{self.colors.ENDC}")
            time.sleep(0.01)
        print("\n")

    def display_options(self, options):
        for idx, opt in enumerate(options, 1):
            print(f"{self.colors.BOLD}[{idx}]{self.colors.ENDC} {self.colors.AMBER}{opt['text']}{self.colors.ENDC}")
        print("\n")

    def get_user_choice(self, num_options):
        while True:
            try:
                choice = input(f"{self.colors.BRIGHT_AMBER}Awaiting Executive Order (1-{num_options}): {self.colors.ENDC}")
                choice_idx = int(choice) - 1
                if 0 <= choice_idx < num_options:
                    return choice_idx
                print(f"{self.colors.RED}Invalid parameter. Try again.{self.colors.ENDC}")
            except ValueError:
                print(f"{self.colors.RED}Invalid input. Numbers only.{self.colors.ENDC}")

    def display_result(self, outcome):
        print(f"\n{self.colors.DARK_GRAY}=" * 50 + self.colors.ENDC)
        if outcome.get('result_type') == 'SUCCESS':
            print(f"{self.colors.CYAN}>> OPERATION STATUS: SUCCESS <<{self.colors.ENDC}")
        else:
            print(f"{self.colors.BRIGHT_RED}>> OPERATION STATUS: FAILURE <<{self.colors.ENDC}")
        
        print(f"{self.colors.DARK_GRAY}Log: {outcome.get('roll_details', '')}{self.colors.ENDC}")
        print(f"{self.colors.AMBER}{outcome.get('description', '')}{self.colors.ENDC}")
        print(f"{self.colors.DARK_GRAY}=" * 50 + self.colors.ENDC + "\n")
