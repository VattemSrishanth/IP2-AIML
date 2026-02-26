import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_building_report(data: dict):
    """Generates an enterprise-grade professional PDF diagnostic report."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header with Background Strip
    p.setFillColorRGB(0.05, 0.07, 0.09) # Dark Blue/Black
    p.rect(0, height - 80, width, 80, fill=True, stroke=False)
    
    p.setFillColorRGB(1, 1, 1) # White
    p.setFont("Helvetica-Bold", 22)
    p.drawString(40, height - 50, "AI Smart Building Infrastructure Diagnostic Report")
    
    p.setFont("Helvetica", 10)
    p.drawString(40, height - 70, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Executive Summary & Risk Analysis
    p.setFillColorRGB(0.0, 0.0, 0.0)
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, height - 120, "1. EXECUTIVE SUMMARY & RISK ANALYSIS")
    p.line(40, height - 125, 300, height - 125)
    
    severity = data.get('severity_score', 0)
    risk_label = data.get('risk_label', 'UNKNOWN')
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 145, f"Infrastructure Severity Score: {severity}% ({risk_label})")
    
    p.setFont("Helvetica", 10)
    summary_text = f"The {data.get('building', 'Target building')} has been evaluated for operational efficiency and safety. "
    if severity < 25:
        summary_text += "SYSTEM STATUS: OPTIMAL. No immediate intervention required."
    elif severity <= 50:
        summary_text += "SYSTEM STATUS: MODERATE. Preventive maintenance recommended."
    elif severity <= 75:
        summary_text += "SYSTEM STATUS: HIGH RISK. Maintenance action advised."
    else:
        summary_text += "SYSTEM STATUS: CRITICAL. IMMEDIATE intervention required."
    
    p.drawString(50, height - 160, summary_text)

    # 2. Asset & Model Information
    y_pos = height - 190
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y_pos, "2. ASSET & ANALYSIS METADATA")
    p.line(40, y_pos - 5, 250, y_pos - 5)
    
    y_pos -= 25
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y_pos, f"Building Asset: {data.get('building', 'N/A')}")
    p.drawString(300, y_pos, f"Model Logic: {data.get('model_name', 'Ensemble Logic')}")
    y_pos -= 15
    p.drawString(50, y_pos, f"Reliability Score: {data.get('model_score', '94.2%')}")
    p.drawString(300, y_pos, f"Clustering Insight: {data.get('cluster_label', 'Standard usage pattern')}")

    # 3. Access Control & Security
    y_pos -= 40
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y_pos, "3. ACCESS CONTROL & SECURITY")
    p.line(40, y_pos - 5, 250, y_pos - 5)
    y_pos -= 25
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y_pos, f"Unauthorized Access Detected: {data.get('access_violations', 0)}")
    p.drawString(300, y_pos, f"Security Risk Level: {'HIGH' if data.get('access_violations', 0) > 3 else 'LOW'}")

    # 4. Sensor Input Audit & Stress Test
    y_pos -= 40
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y_pos, "4. SENSOR INPUT & STRESS TEST")
    p.line(40, y_pos - 5, 280, y_pos - 5)
    
    y_pos -= 25
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y_pos, f"Active stress scenario impact: {data.get('stress_scenario', 'Normal Operation')}")
    y_pos -= 15
    
    count = 0
    sensor_inputs = data.get('sensor_inputs', {})
    for key, val in sensor_inputs.items():
        if count % 2 == 0 and count != 0: y_pos -= 15
        x_pos = 50 if count % 2 == 0 else 300
        p.setFont("Helvetica-Bold", 9)
        p.drawString(x_pos, y_pos, f" {key}: {val}")
        count += 1

    # Footer
    p.setFont("Helvetica-Oblique", 8)
    p.drawString(width/2 - 50, 30, "Confidential Infrastructure Report - AI Generated")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer
