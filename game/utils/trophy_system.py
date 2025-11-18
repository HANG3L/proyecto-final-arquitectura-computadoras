class TrophySystem:
    @staticmethod
    def calculate_trophies(difficulty, lives_left, time_taken):
        # Base trophies by difficulty
        base_trophies = {
            'basic': 10,
            'medium': 20,
            'advanced': 30
        }
        
        # Multiplier by lives left (0-3 lives possible)
        life_multiplier = {
            0: 1.0,  # Won with 0 lives (shouldn't happen, but just in case)
            1: 1.0,
            2: 1.5,
            3: 2.0
        }
        
        # Time bonus (faster completion = more trophies)
        max_time = 60  # seconds
        time_bonus = max(0, (max_time - time_taken) / max_time * 10)
        
        base = base_trophies.get(difficulty, 10)
        multiplier = life_multiplier.get(lives_left, 1.0)
        
        trophies = int((base + time_bonus) * multiplier)
        
        return max(1, trophies)  # Minimum 1 trophy