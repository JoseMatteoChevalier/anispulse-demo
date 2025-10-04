from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AnisPulse Demo API",
    description="Portfolio demonstration - Advanced analytics available upon request",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://anispulse-demo.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "AnisPulse Demo API",
        "version": "1.0.0",
        "note": "Portfolio demonstration - Proprietary algorithms not included"
    }

@app.post("/api/calculate-project")
def calculate_basic_timeline(project_data: Dict[str, Any]):
    """Demo timeline calculation"""
    tasks = project_data.get("tasks", [])
    
    demo_tasks = []
    for i, task in enumerate(tasks):
        demo_tasks.append({
            "id": task.get("id"),
            "name": task.get("name"),
            "scheduled_start_day": i * 2,
            "scheduled_finish_day": i * 2 + task.get("duration_days", 5),
            "is_critical": i < 2,
            "risk_level": "Medium"
        })
    
    return {
        "success": True,
        "demo_mode": True,
        "tasks": demo_tasks,
        "message": "Basic timeline - Advanced algorithms available upon request"
    }

@app.post("/api/{endpoint:path}")
def analytics_gateway(endpoint: str):
    return {
        "success": False,
        "message": f"Advanced {endpoint.replace('-', ' ')} available in full version",
        "contact": "jose.e.matteo.chevalier@gmail.com"
    }