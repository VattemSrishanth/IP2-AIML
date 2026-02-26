import random

def run_stress_test(scenario: str, building: str):
    """Simulate stress scenarios and their impact on systems."""
    
    scenarios = {
        "Normal Operations": {
            "occupancy": random.randint(10, 30),
            "energy": random.randint(100, 300),
            "temp": random.randint(22, 26),
            "unauthorized": 0,
            "reaction": "System operating within healthy parameters.",
            "analysis": "No immediate risk detected."
        },
        "HVAC Failure (Extreme Heat)": {
            "occupancy": 25,
            "energy": 450,
            "temp": 42, 
            "unauthorized": 1,
            "reaction": "Safety systems triggered; emergency cooling protocols initiated.",
            "analysis": "Critical temperature threshold exceeded due to HVAC compressor failure."
        },
        "Unauthorized Access Spike": {
            "occupancy": 15,
            "energy": 120,
            "temp": 24,
            "unauthorized": 12, # Denial spike
            "reaction": "Building locked down; security protocols active.",
            "analysis": "Potential security breach at South Wing Entrance; multiple ID failures."
        },
        "Energy Demand Surge": {
            "occupancy": 40,
            "energy": 1200, # Surge
            "temp": 28,
            "unauthorized": 0,
            "reaction": "Load shedding activated for non-essential systems.",
            "analysis": "Primary power grid overload; backup generators on standby."
        },
        "Occupancy Spike": {
            "occupancy": 95, 
            "energy": 550,
            "temp": 27,
            "unauthorized": 2,
            "reaction": "Ventilation speed increased; crowding alerts sent to facilities manager.",
            "analysis": "Building density near safety capacity; risk of reduced air quality."
        }
    }
    
    # Get or default to normal
    result = scenarios.get(scenario, scenarios["Normal Operations"])
    
    return {
        "scenario": scenario,
        "building": building,
        "sensor_data": {
            "occupancy": result["occupancy"],
            "energy": result["energy"],
            "temp": result["temp"],
            "unauthorized": result["unauthorized"]
        },
        "reaction": result["reaction"],
        "analysis": result["analysis"]
    }
