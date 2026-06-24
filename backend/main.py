# backend/main.py
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from datetime import datetime, timedelta

# Import custom modules
from backend.ml_pipeline import MLPipeline
from backend.risk_engine import RiskEngine
from backend.mitre_mapper import MitreMapper
from backend.incident_clusterer import IncidentClusterer
from backend.copilot import SecurityCopilot
from backend.threat_intel import ThreatIntelligenceCenter
from backend.generator import TrafficGenerator
from backend.live_monitor import LiveMonitor

# Initialize FastAPI app
app = FastAPI(
    title="BankShield AI Platform APIs",
    description="Explainable Intrusion Detection & Threat Intelligence REST Services",
    version="2.0.0"
)

# Setup templates directory
templates_path = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_path)

# Initialize engines
ml_pipeline = MLPipeline()
incident_clusterer = IncidentClusterer(temporal_window_seconds=20)
live_monitor = LiveMonitor()

# In-memory database simulation (stores active state)
alerts_db: List[Dict[str, Any]] = []
incidents_db: List[Dict[str, Any]] = []
model_stats: Dict[str, Any] = {}

class CopilotQuery(BaseModel):
    incident_id: str
    question: str

class SimulatePayload(BaseModel):
    attack_class: str

@app.on_event("startup")
def startup_event():
    """
    Executes model training and generates starting security database entries on system boot.
    """
    global model_stats, alerts_db, incidents_db
    
    # Start live packet sniffer
    live_monitor.start()
    
    # 1. Train models
    model_stats = ml_pipeline.train()
    
    # 2. Pre-populate database with historical traffic (50 flows over the past hour)
    start_time = datetime.now() - timedelta(hours=1)
    
    for i in range(60):
        # Stagger timestamps
        ts = start_time + timedelta(seconds=i * 60)
        
        # Generate raw network flow statistics
        flow = TrafficGenerator.generate_flow()
        flow["timestamp"] = ts.isoformat()
        
        # Run ML predictions
        ml_res = ml_pipeline.predict_flow(flow)
        
        # Calculate Advanced Risk Engine outputs
        risk_res = RiskEngine.calculate_risk(
            attack_class=ml_res["prediction"],
            rf_confidence=ml_res["confidence"],
            anomaly_score=ml_res["anomaly_score"],
            dest_ip=flow["dest_ip"]
        )
        
        # Fetch MITRE ATT&CK codes
        mitre_res = MitreMapper.get_mitre_mapping(ml_res["prediction"])
        
        # Build alert record
        alert_record = {
            "id": f"alert-{i}",
            "timestamp": flow["timestamp"],
            "source_ip": flow["source_ip"],
            "dest_ip": flow["dest_ip"],
            "src_port": flow["src_port"],
            "dst_port": flow["dst_port"],
            "protocol": flow["protocol"],
            "attack_class": ml_res["prediction"],
            "confidence": ml_res["confidence"],
            "anomaly_score": ml_res["anomaly_score"],
            "risk_score": risk_res["risk_score"],
            "severity": risk_res["category"],
            "risk_components": risk_res["components"],
            "asset_context": risk_res["asset_context"],
            "business_impact_translation": risk_res["business_impact_translation"],
            "mitre_tactic": mitre_res["tactic"],
            "mitre_technique": f"{mitre_res['technique_id']} ({mitre_res['technique']})",
            "shap_explanation": ml_res["shap_explanation"]
        }
        
        alerts_db.append(alert_record)

    # 3. Perform alert clustering to populate incidents
    # Sort alerts by timestamp ascending for clusterer
    alerts_sorted = sorted(alerts_db, key=lambda x: x["timestamp"])
    incident_clusterer.cluster_alerts(alerts_sorted)
    incidents_db = incident_clusterer.get_clustered_incidents_for_api()

@app.get("/", response_class=HTMLResponse)
def get_dashboard():
    return HTMLResponse("""
    <html>
    <head>
        <title>BankShield AI</title>
    </head>
    <body style="font-family:Arial;padding:40px;">
        <h1>🛡️ BankShield AI</h1>
        <h2>System Status: Running</h2>
        <p>Random Forest IDS: Active</p>
        <p>Isolation Forest: Active</p>
        <p>MITRE Mapping: Active</p>
        <p>SHAP Explainability: Active</p>

        <h3>API Endpoints</h3>
        <ul>
            <li>/docs</li>
            <li>/api/v1/alerts</li>
            <li>/api/v1/incidents</li>
            <li>/api/v1/threat-intel</li>
        </ul>
    </body>
    </html>
    """)

@app.get("/api/v1/model-stats")
def get_model_stats():
    """
    Returns accuracy and feature importance metadata for model verification.
    """
    return JSONResponse(content=model_stats)

@app.get("/api/v1/alerts")
def get_alerts(limit: int = 100, severity: Optional[str] = None):
    """
    Returns lists of raw alerts.
    """
    results = alerts_db
    if severity:
        results = [a for a in results if a["severity"] == severity]
    
    # Sort descending (newest first)
    results = sorted(results, key=lambda x: x["timestamp"], reverse=True)
    return JSONResponse(content=results[:limit])

@app.get("/api/v1/incidents")
def get_incidents():
    """
    Returns incident clusters (alert fatigue reduction).
    """
    return JSONResponse(content=incidents_db)

@app.get("/api/v1/threat-intel")
def get_threat_intel():
    """
    Compiles threat intelligence center charts, matrices, and metrics.
    """
    intel_data = ThreatIntelligenceCenter.compile_threat_intel_report(alerts_db)
    return JSONResponse(content=intel_data)

@app.get("/api/v1/threat-intel/report/{report_type}")
def get_text_report(report_type: str):
    """
    Generates downloadable daily or weekly threat summary reports.
    """
    intel_data = ThreatIntelligenceCenter.compile_threat_intel_report(alerts_db)
    if report_type.lower() == "daily":
        report_md = ThreatIntelligenceCenter.generate_daily_report(intel_data)
    elif report_type.lower() == "weekly":
        report_md = ThreatIntelligenceCenter.generate_weekly_report(intel_data)
    else:
        raise HTTPException(status_code=400, detail="Invalid report type. Use 'daily' or 'weekly'.")
        
    return JSONResponse(content={"report": report_md})

@app.get("/api/v1/live-packets")
def get_live_packets():
    """
    Exposes real-time packet metadata capture.
    """
    return JSONResponse(content={
        "packets": live_monitor.get_packets(),
        "stats": live_monitor.get_stats()
    })

@app.post("/api/v1/copilot/ask")
def ask_copilot(query: CopilotQuery):
    """
    Queries Security Copilot 2.0 regarding a specific incident.
    """
    # Find incident
    matched = None
    for inc in incidents_db:
        if inc["id"] == query.incident_id:
            matched = inc
            break
            
    if not matched:
        raise HTTPException(status_code=404, detail="Incident not found in active cache.")
        
    explanation = SecurityCopilot.generate_explanation(matched, query.question)
    return JSONResponse(content=explanation)

@app.post("/api/v1/alerts/simulate")
def simulate_attack(payload: SimulatePayload):
    """
    Interactive API. Inject a custom attack vector directly into the stream
    to observe real-time risk score calculations, MITRE mapping, and clustering.
    """
    global incidents_db
    
    # Generate flow corresponding to requested vector
    flow = TrafficGenerator.generate_flow(force_class=payload.attack_class)
    flow["timestamp"] = datetime.now().isoformat()
    
    # Run ML Classifier & Anomaly Detector
    ml_res = ml_pipeline.predict_flow(flow)
    
    # Risk Engine evaluation
    risk_res = RiskEngine.calculate_risk(
        attack_class=ml_res["prediction"],
        rf_confidence=ml_res["confidence"],
        anomaly_score=ml_res["anomaly_score"],
        dest_ip=flow["dest_ip"]
    )
    
    # MITRE ATT&CK mapper lookup
    mitre_res = MitreMapper.get_mitre_mapping(ml_res["prediction"])
    
    # Compile alert record
    alert_record = {
        "id": f"alert-sim-{len(alerts_db) + 1}",
        "timestamp": flow["timestamp"],
        "source_ip": flow["source_ip"],
        "dest_ip": flow["dest_ip"],
        "src_port": flow["src_port"],
        "dst_port": flow["dst_port"],
        "protocol": flow["protocol"],
        "attack_class": ml_res["prediction"],
        "confidence": ml_res["confidence"],
        "anomaly_score": ml_res["anomaly_score"],
        "risk_score": risk_res["risk_score"],
        "severity": risk_res["category"],
        "risk_components": risk_res["components"],
        "asset_context": risk_res["asset_context"],
        "business_impact_translation": risk_res["business_impact_translation"],
        "mitre_tactic": mitre_res["tactic"],
        "mitre_technique": f"{mitre_res['technique_id']} ({mitre_res['technique']})",
        "shap_explanation": ml_res["shap_explanation"]
    }
    
    # Insert at top of database
    alerts_db.insert(0, alert_record)
    
    # Re-cluster alerts database
    alerts_sorted = sorted(alerts_db, key=lambda x: x["timestamp"])
    incident_clusterer.cluster_alerts(alerts_sorted)
    incidents_db = incident_clusterer.get_clustered_incidents_for_api()
    
    return JSONResponse(content={
        "status": "Injected successfully",
        "injected_alert": alert_record
    })

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
