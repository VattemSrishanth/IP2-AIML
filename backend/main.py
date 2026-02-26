from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
from datetime import datetime
from starlette.responses import StreamingResponse
from contextlib import asynccontextmanager

from database.db import get_db, init_db
from database.access_control import simulate_access_attempt, get_recent_logs, get_security_analytics
from schemas import (
    PredictionRequest, PredictionResponse, ClusterRequest, 
    ClusterResponse, AutomationResponse, SecurityAnalytics, 
    StressTestRequest, StressTestResponse, SensorInput
)
from models.ml_models import run_classification_comparison, run_regression_comparison
from models.clustering import run_clustering_engine
from models.severity_engine import calculate_severity_score
from models.automation_rules import run_automation_engine
from models.stress_test import run_stress_test as simulate_stress
from models.report_generator import generate_building_report

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Smart Building AI Gateway", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "system": "AI Smart Building Command Center"}

@app.post("/predict_comparison")
async def predict_comparison(file: UploadFile = File(...), target_col: str = Form("")):
    """Run model comparison on an uploaded dataset."""
    try:
        print(f"Received file: {file.filename}, target: {target_col}")
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Case-insensitive column matching
        target = None
        for col in df.columns:
            if col.strip().lower() == target_col.strip().lower():
                target = col
                break
        
        if not target:
            print(f"Error: Column '{target_col}' not found. Available: {list(df.columns)}")
            raise HTTPException(status_code=400, detail=f"Column '{target_col}' not found. Available: {list(df.columns)}")
            
        # Clean data: drop rows with NaN in target
        df = df.dropna(subset=[target])
        
        # Auto-detection for classification vs regression
        is_numeric = pd.api.types.is_numeric_dtype(df[target])
        unique_count = df[target].nunique()
        
        print(f"Target '{target}' is_numeric: {is_numeric}, unique_count: {unique_count}")
        
        if is_numeric and unique_count > 10:
            results = run_regression_comparison(df, target)
        else:
            results = run_classification_comparison(df, target)
            
        print(f"Benchmarking complete. Found {len(results)} models.")
        return results
    except Exception as e:
        print(f"Backend Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster")
async def cluster_data(file: UploadFile = File(...)):
    """Run clustering on uploaded data."""
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    return run_clustering_engine(df)

@app.post("/automation-check")
def automation_check(sensor_data: SensorInput):
    """Check automation rules against current sensors."""
    return run_automation_engine(sensor_data.dict(), {"energy_threshold": 400})

@app.get("/security-analytics", response_model=SecurityAnalytics)
def get_security_data(db: Session = Depends(get_db)):
    """Retrieve security performance and incidents."""
    return get_security_analytics(db)

@app.post("/simulate-access")
def post_simulate_access(db: Session = Depends(get_db)):
    """Simulate a security door access attempt."""
    simulate_access_attempt(db)
    return get_recent_logs(db, limit=1)

@app.get("/recent-access-logs")
def get_recent_access(db: Session = Depends(get_db)):
    """Retrieve the 10 most recent logs."""
    return get_recent_logs(db, limit=10)

@app.post("/severity-calc")
def post_severity_calc(data: dict):
    """Hybrid Severity Scoring for UI display."""
    return calculate_severity_score(
        data.get("prediction", "Healthy"),
        data.get("sensor_data", {}),
        data.get("access_denials", 0)
    )

@app.post("/stress-test", response_model=StressTestResponse)
def stress_test(req: StressTestRequest):
    """Trigger a system stress scenario."""
    result = simulate_stress(req.scenario, req.building)
    
    # Map result keys to sensor_data for calculate_severity_score
    sensor_data = {
        "temp": result.get("temp", 24),
        "energy": result.get("energy", 300),
        "occupancy": result.get("occupancy", 20),
        "unauthorized": result.get("unauthorized", 0)
    }

    # Calculate impact
    sev = calculate_severity_score(
        "Warning" if sensor_data['temp'] > 32 else "Normal", 
        sensor_data, 
        sensor_data['unauthorized']
    )
    
    auto = run_automation_engine(sensor_data, {"energy_threshold": 400})
    
    return {
        "system_reaction": result.get("reaction", "Steady state"),
        "severity_update": sev["severity_score"],
        "risk_label": sev["risk_label"],
        "automation_triggers": auto["actions"],
        "failure_analysis": result.get("analysis", "Baseline")
    }

@app.post("/generate-report")
def generate_report(data: dict):
    """Generates and returns PDF diagnostic report."""
    pdf_buffer = generate_building_report(data)
    filename = f"Building_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
