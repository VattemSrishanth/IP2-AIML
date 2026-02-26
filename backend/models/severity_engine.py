def calculate_severity_score(ml_pred: str, sensor_data: dict, access_denials: int) -> dict:
    """Hybrid Severity Scoring Engine."""
    score = 0
    
    # 1. ML Prediction impact
    ml_pred = ml_pred.lower()
    if any(kw in ml_pred for kw in ['normal', 'healthy', 'good', 'optimal', 'safe']):
        score += 10
    elif "warning" in ml_pred:
        score += 40
    elif "fault" in ml_pred:
        score += 70
    elif "critical" in ml_pred or "failure" in ml_pred:
        score += 90
    
    # 2. Sensor Threshold Rules
    if sensor_data.get('temp', 0) > 32: score += 15
    if sensor_data.get('humidity', 0) > 75: score += 10
    if sensor_data.get('co2', 0) > 1000: score += 25
    if sensor_data.get('energy', 0) > 400: score += 20
    
    # 3. Access violations
    score += min(access_denials * 5, 20) # 5 points per denial, max 20
    
    # Cap severity at 100
    score = min(score, 100)
    
    # Risk Level classification
    if score <= 25:
        risk_label = "OPTIMAL"
        status_color = "green"
    elif score <= 50:
        risk_label = "MODERATE"
        status_color = "yellow"
    elif score <= 75:
        risk_label = "HIGH RISK"
        status_color = "orange"
    else:
        risk_label = "CRITICAL"
        status_color = "red"
        
    return {
        "severity_score": score,
        "risk_label": risk_label,
        "status_color": status_color
    }
