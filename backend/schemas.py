from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SensorInput(BaseModel):
    temperature: float
    humidity: float
    co2: float
    energy: float
    occupancy: int
    lift_trips: int

class PredictionRequest(BaseModel):
    building: str
    features: SensorInput
    target_column: str

class PredictionResponse(BaseModel):
    prediction: str
    risk_score: float
    risk_label: str
    recommendations: List[str]

class ClusterRequest(BaseModel):
    building: str
    data: List[Dict[str, Any]] # Historical data for clustering

class ClusterResponse(BaseModel):
    cluster_label: str
    interpretation: str
    metrics: Dict[str, Any]

class AutomationResponse(BaseModel):
    triggered_rules: List[str]
    actions: List[str]

class SecurityLog(BaseModel):
    id: int
    user: str
    door: str
    timestamp: str
    status: str

class SecurityAnalytics(BaseModel):
    busiest_hour: str
    high_risk_users: List[Dict[str, Any]]
    total_denials: int

class StressTestRequest(BaseModel):
    scenario: str
    building: str

class StressTestResponse(BaseModel):
    system_reaction: str
    severity_update: int
    risk_label: str
    automation_triggers: List[str]
    failure_analysis: str
