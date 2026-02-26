def run_automation_engine(sensor_data: dict, thresholds: dict) -> dict:
    """Rule-based automation engine implementation."""
    actions = []
    triggered_rules = []
    
    occupancy = sensor_data.get('occupancy', 0)
    energy = sensor_data.get('energy', 0)
    lift_trips = sensor_data.get('lift_trips', 0)
    
    threshold_energy = thresholds.get('energy_threshold', 400)
    
    if occupancy == 0:
        triggered_rules.append("IF Occupancy = 0")
        actions.append("💡 Lights: OFF (No Occupancy Detected)")
    elif occupancy < 5:
        triggered_rules.append("IF Occupancy < 5")
        actions.append("🌡️ AC: LOW POWER (Low Occupancy Mode)")
    elif occupancy > 20:
        triggered_rules.append("IF Occupancy > 20")
        actions.append("⚠️ Alert: Overcrowding Detected")

    if energy > threshold_energy:
        triggered_rules.append(f"IF Energy > {threshold_energy}")
        actions.append("⚡ Action: Reduce Lighting Intensity (Energy Saving Mode)")
        
    if lift_trips > 500:
        triggered_rules.append("IF Lift Trips > 500")
        actions.append("🛠️ Alert: Maintenance Required (Lift Usage Overflow)")
        
    return {
        "triggered_rules": triggered_rules,
        "actions": actions
    }
