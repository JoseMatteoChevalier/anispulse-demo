# backend/api/main.py
from dotenv import load_dotenv
load_dotenv()  # Load environment variables FIRST
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import numpy as np
import pandas as pd
import uuid
from fastapi import BackgroundTasks, HTTPException
from typing import Dict, Any
from bson import ObjectId
from datetime import datetime
import os
from google import genai
import time

# Add parent directory to path so we can import engines
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engines.foundation_engine import FoundationEngine



# Create Save Folder


os.makedirs("data/projects", exist_ok=True)

from pydantic import BaseModel, ValidationError
from typing import List

# FastAPI request models (different from your dataclass models)
class TaskRequest(BaseModel):
    id: str  # Note: your tasks use string IDs
    name: str
    duration_days: float
    predecessors: List[str] = []
    user_risk_rating: float = 0

class CalculationRequest(BaseModel):
    project_name: str
    tasks: List[TaskRequest]



# Create FastAPI app
app = FastAPI(
    title="Ani's Pulse Demo-API",
    description="Mobile-first project management with risk intelligence",
    version="0.1.0"
)

# CORS middleware for Angular development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://anispulse-demo.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Foundation Engine
engine = FoundationEngine()


# Helper Functions

def build_adjacency_from_tasks(tasks: list[TaskRequest]) -> tuple[np.ndarray, str | None]:
    """Build adjacency matrix from task list"""
    try:
        num_tasks = len(tasks)
        adjacency = np.zeros((num_tasks, num_tasks), dtype=int)

        # Create ID to index mapping
        id_to_idx = {task.id: idx for idx, task in enumerate(tasks)}

        for idx, task in enumerate(tasks):
            for pred_id in task.predecessors:
                if pred_id not in id_to_idx:
                    return None, f"Task {task.id} references non-existent predecessor {pred_id}"
                pred_idx = id_to_idx[pred_id]
                adjacency[pred_idx, idx] = 1

        return adjacency, None
    except Exception as e:
        return None, str(e)


def calculate_actual_date(start_date_str: str, day_number: float, use_business_days: bool = False) -> str:
    """
    Convert day number to actual calendar date

    Args:
        start_date_str: Project start date "YYYY-MM-DD"
        day_number: Relative day number from engine
        use_business_days: If True, skip weekends

    Returns:
        Date string "YYYY-MM-DD"
    """
    from datetime import datetime, timedelta
    import pandas as pd

    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")

    if use_business_days:
        # Use pandas for business day calculation
        start = pd.Timestamp(start_date)
        end = start + pd.offsets.BDay(int(day_number))
        return end.strftime("%Y-%m-%d")
    else:
        # Simple calendar days
        end_date = start_date + timedelta(days=int(day_number))
        return end_date.strftime("%Y-%m-%d")

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "AnisPulse Demo API",
        "version": "1.0.0",
        "documentation": "/docs",
        "contact": "Available for technical discussions",
        "note": "This demonstrates API architecture. Proprietary algorithms not included."
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": "foundation_ready",
        "endpoints": ["/", "/health", "/api/calculate-project"]
    }




# Main project calculation endpoint
@app.post("/api/calculate-project")
async def calculate_project(project_data: Dict[str, Any]):
    """
    Calculate project schedule and risk analysis

    Expected input:
    {
        "project_name": "My Project",
        "project_start_date": "2024-11-01"
        "mode": "baseline" #baseline or current_status
        "use_business_days": false
        "tasks": [
            {
                "id": "1",
                "name": "Task 1",
                "duration_days": 5,
                "predecessors": [],
                "user_risk_rating": 1,
                "completion_pct": 0  // NEW - Optional, default 0
            },
            ...
        ]
    }
    """
    try:
        # Validate input
        if "tasks" not in project_data:
            raise HTTPException(status_code=400, detail="Missing 'tasks' in request")

        if not project_data["tasks"]:
            raise HTTPException(status_code=400, detail="Tasks list cannot be empty")

        analysis_mode = project_data.get("mode", "baseline")
        project_start_date = project_data.get("project_start_date", None)
        use_business_days = project_data.get("use_business_days", False)

        # Convert to TaskInput objects
        tasks = []
        for task_data in project_data["tasks"]:
            try:
                # NEW: Handle completion percentage
                completion_pct = float(task_data.get("completion_pct", 0))
                original_duration = float(task_data.get("duration_days", 1.0))

                # Calculate effective duration based on mode
                if analysis_mode == "current_status" and completion_pct > 0:
                    effective_duration = original_duration * (100 - completion_pct) / 100
                else:
                    effective_duration = original_duration

                task = TaskInput(
                    id=str(task_data["id"]),
                    name=str(task_data["name"]),
                    duration_days=effective_duration,
                    predecessors=task_data.get("predecessors", []),
                    user_risk_rating=int(task_data.get("user_risk_rating", 0))
                )
                tasks.append(task)
            except (KeyError, ValueError, TypeError) as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid task data: {str(e)}"
                )

        # Run Foundation Engine calculation
        result = engine.calculate_project(tasks)

        # Convert to JSON-serializable response
        response = {
            "success": True,
            "project_name": project_data.get("project_name", "Untitled Project"),
            "project_start_date": project_start_date,
            "analysis_mode": analysis_mode,
            "use_business_days": use_business_days,
            "calculation_timestamp": "2024-12-14T10:00:00Z",  # Could use datetime.now()

            # Project-level metrics
            "project_metrics": {
                "total_duration_days": result.total_duration_days,
                "overall_risk_level": result.overall_risk_level,
                "high_risk_task_count": result.high_risk_task_count,
                "critical_path_ids": result.critical_path_ids,
                "total_tasks": len(result.tasks)
            },

            # Individual task results
            "tasks": []
        }

        for task in result.tasks:
            task_response = {
                "id": task.id,
                "name": task.name,
                "duration_days": task.duration_days,
                "predecessors": task.predecessors,

                # Calculated scheduling (day numbers)
                "scheduled_start_day": round(task.scheduled_start_day, 1),
                "scheduled_finish_day": round(task.scheduled_finish_day, 1),

                # Risk analysis
                "risk_level": task.risk_level,
                "risk_score": round(task.risk_score, 1),

                # Critical path analysis
                "is_critical": task.is_critical,
                "float_days": round(task.float_days, 1),

                # Dependencies
                "blocks_tasks": task.blocks_tasks,
                "blocked_by_tasks": task.blocked_by_tasks
            }


            if project_start_date:
                        task_response["actual_start_date"] = calculate_actual_date(
                            project_start_date,
                            task.scheduled_start_day,
                            use_business_days
                        )
                        task_response["actual_end_date"] = calculate_actual_date(
                            project_start_date,
                            task.scheduled_finish_day,
                            use_business_days
                        )

            response["tasks"].append(task_response)


        # Metadata
        response.update({
                "calculation_method": "Foundation Engine v1.0",
                "algorithms_used": ["CPM", "Basic Risk Analysis"],
                "confidence_level": 0.85})

        return response

    except HTTPException:
            raise
    except Exception as e:
        # Handle unexpected errors
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during calculation: {str(e)}"
        )


@app.post("/api/enhanced-pde-analysis")
async def enhanced_pde_analysis(request_data: Dict[str, Any]):
    """Enhanced PDE analysis endpoint"""
     return{"success": False,
        "message": "Advanced PDE analysis available in full version",
        "contact": "Schedule demo: jose.e.matteo.chevalier@gmail.com"}


# Add parameter defaults endpoint
@app.get("/api/pde-parameters/defaults")
async def get_pde_parameter_defaults():
    """Get default PDE parameters"""
    defaults = PDEParameters()
    return {"success": False,
        "message": "Advanced PDE analysis available in full version",
        "contact": "Schedule demo: jose.e.matteo.chevalier@gmail.com
    }


@app.post("/api/monte-carlo-analysis")
async def monte_carlo_analysis(request_data: Dict[str, Any]):
   return{"success": False,
        "message": "Advanced Monte Carlo analysis available in full version",
        "contact": "Schedule demo: jose.e.matteo.chevalier@gmail.com"}

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"Monte Carlo error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Monte Carlo calculation failed: {str(e)}")



@app.post("/api/test-background")
async def test_background(background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())

    def test_task(job_id: str):
        import time
        job_results[job_id] = {"status": "processing", "progress": "Working..."}
        time.sleep(3)  # Simulate work
        job_results[job_id] = {"status": "completed", "result": {"message": "Background task success!"}}

    job_results[job_id] = {"status": "processing", "progress": "Starting test..."}
    background_tasks.add_task(test_task, job_id)
    return {"job_id": job_id, "status": "processing"}

job_results = {}

def run_sde_calculation(job_id: str, request_data: Dict[str, Any]):
    """Background task that runs the SDE calculation"""
    return{"success": False,
        "message": "Advanced SDE analysis available in full version",
        "contact": "Schedule demo: jose.e.matteo.chevalier@gmail.com"}
   


@app.post("/api/sde-analysis")
async def sde_analysis_async(request_data: Dict[str, Any], background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    job_results[job_id] = {"status": "processing"}
    background_tasks.add_task(run_sde_calculation, job_id, request_data)
    return {"job_id": job_id, "status": "processing"}

@app.get("/api/sde-status/{job_id}")
async def check_status(job_id: str):
    return job_results.get(job_id, {"status": "not_found"})



# Replace your current project endpoints with:
@app.post("/api/projects")
async def save_project(project_data: Dict[str, Any]):
    print("DEBUG: Validating required fields...")
    try:
        # Validate required fields
        if "name" not in project_data or "tasks" not in project_data:
            raise HTTPException(status_code=400, detail="Missing required fields")

        print("DEBUG: Validating tasks...")

        # Validate tasks
        for task_data in project_data["tasks"]:
            TaskInput(**task_data)

        print("DEBUG: Preparing for MongoDB...")

        # Prepare for MongoDB
        project_id = project_data.get("id", str(ObjectId()))
        project_data["id"] = project_id
        project_data["lastModified"] = datetime.now().isoformat()

        if "foundationResults" in project_data:
            print(
                f"DEBUG: Storing foundation results with {len(project_data['foundationResults'].get('tasks', []))} calculated tasks")

        print(f"DEBUG: Saving project {project_id} to MongoDB...")


        # Save to MongoDB
        collection = db["projects"]
        result = await collection.replace_one(
            {"id": project_id},
            project_data,
            upsert=True
        )
        print(f"DEBUG: MongoDB save result - matched: {result.matched_count}, modified: {result.modified_count}")

        return {"success": True, "id": project_id}
    except ValidationError as ve:
        print(f"ERROR: Validation failed: {str(ve)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(ve)}")
    except Exception as e:
        print(f"ERROR: Save failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects")
async def load_projects():
    try:
        collection = db["projects"]
        cursor = collection.find({})
        projects = await cursor.to_list(length=100)

        # Clean up MongoDB internal fields
        for project in projects:
            if "_id" in project:
                del project["_id"]

        return {"projects": sorted(projects, key=lambda p: p.get("lastModified", ""), reverse=True)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    # MongoDB deletion
    result = await projects_collection.delete_one({"id": project_id})
    if result.deleted_count:
        return {"message": "Project deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Project not found")





# Add to your FastAPI backend

import google.generativeai as genai
from typing import Dict, Any, Optional
import json

# Configure Gemini (add your API key)
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


# Gemini analysis functions
class GeminiProjectAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_project_risks(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project for potential risks and recommendations"""

        # Prepare project context for Gemini
        project_context = self._format_project_context(project_data)

        prompt = f"""
Analyze this project management data and provide insights:

{project_context}

Please provide a JSON response with:
1. "risk_assessment": Overall risk level (Low/Medium/High) with brief reasoning
2. "key_risks": List of 3-4 main risks identified
3. "recommendations": List of 3-4 actionable recommendations
4. "timeline_assessment": Analysis of timeline feasibility
5. "resource_insights": Comments on resource allocation and task distribution

Focus on practical project management insights that would help a PM make better decisions.

Respond only with valid JSON.
"""

        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            analysis = json.loads(response.text)
            return {
                "success": True,
                "analysis": analysis,
                "model_used": "gemini-2.5-flash"
            }
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "success": True,
                "analysis": {
                    "risk_assessment": "Analysis generated",
                    "key_risks": ["Check task dependencies", "Monitor high-risk tasks", "Review timeline assumptions"],
                    "recommendations": ["Regular status updates", "Risk mitigation planning",
                                        "Resource buffer allocation"],
                    "timeline_assessment": response.text[:200] + "..." if len(response.text) > 200 else response.text,
                    "resource_insights": "Analysis completed with AI assistance"
                },
                "model_used": "gemini-2.5-flash"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": "gemini-2.5-flash"
            }

    def generate_executive_summary(self, project_data: Dict[str, Any], analysis_results: Optional[Dict] = None) -> Dict[
        str, Any]:
        """Generate executive summary for stakeholders"""

        project_context = self._format_project_context(project_data)
        analysis_context = ""

        if analysis_results:
            analysis_context = f"""
Previous Analysis Results:
- Monte Carlo Mean Duration: {analysis_results.get('monte_carlo', {}).get('mean_duration', 'N/A')} days
- SDE Risk Analysis: {analysis_results.get('sde', {}).get('mean_duration', 'N/A')} days  
- PDE Completion: {analysis_results.get('pde', {}).get('completion_status', 'N/A')}
"""

        prompt = f"""
Create an executive summary for this project:

{project_context}
{analysis_context}

Generate a JSON response with:
1. "executive_summary": 2-3 sentence high-level status
2. "key_metrics": Important numbers and percentages
3. "action_items": 3-4 immediate actions needed
4. "stakeholder_message": Brief message suitable for executive communication
5. "confidence_level": Your confidence in the timeline (High/Medium/Low)

Write for busy executives who need quick, actionable insights.
CRITICAL: Respond with ONLY valid JSON. Do not use markdown formatting, code blocks, or any text outside the JSON structure. Your entire response must be parseable JSON.
"""


        try:
            response = self.model.generate_content(prompt)
            analysis = json.loads(response.text)
            return {
                "success": True,
                "summary": analysis,
                "model_used": "gemini-2.5-flash"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": "gemini-2.5-flash"
            }

    def _format_project_context(self, project_data: Dict[str, Any]) -> str:
        """Format project data for Gemini analysis"""

        tasks = project_data.get('tasks', [])
        total_duration = sum(task.get('duration_days', 0) for task in tasks)
        avg_risk = sum(task.get('user_risk_rating', 0) for task in tasks) / len(tasks) if tasks else 0
        high_risk_tasks = [task for task in tasks if task.get('user_risk_rating', 0) >= 4]

        context = f"""
Project: {project_data.get('name', 'Untitled Project')}
Total Tasks: {len(tasks)}
Total Duration: {total_duration} days
Average Risk Rating: {avg_risk:.1f}/5
High Risk Tasks: {len(high_risk_tasks)}

Tasks Detail:
"""

        for i, task in enumerate(tasks[:10]):  # Limit to first 10 tasks to avoid token limits
            predecessors = task.get('predecessors', [])
            completion = task.get('completion_pct', 0)
            context += f"""
{i + 1}. {task.get('name', f'Task {i + 1}')}
   - Duration: {task.get('duration_days', 0)} days
   - Risk Level: {task.get('user_risk_rating', 0)}/5
   - Dependencies: {len(predecessors)} tasks
   - Completion: {completion}%
"""

        if len(tasks) > 10:
            context += f"\n... and {len(tasks) - 10} more tasks"

        return context


# Initialize analyzer
gemini_analyzer = GeminiProjectAnalyzer()


# API Endpoints
@app.post("/api/gemini-risk-analysis")
async def gemini_risk_analysis(project_data: Dict[str, Any]):
    """Analyze project risks using Gemini AI"""
    try:
        result = gemini_analyzer.analyze_project_risks(project_data)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/gemini-executive-summary")
async def gemini_executive_summary(request_data: Dict[str, Any]):
    """Generate executive summary using Gemini AI"""
    try:
        project_data = request_data.get('project_data', {})
        analysis_results = request_data.get('analysis_results', None)

        result = gemini_analyzer.generate_executive_summary(project_data, analysis_results)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/gemini-quick-insights")
async def gemini_quick_insights(project_data: Dict[str, Any]):
    """Quick AI insights for card back display"""
    try:
        # Shorter, faster analysis for card display

        analyzer = GeminiProjectAnalyzer()

        # Call the method on the instance (not using the global gemini_analyzer)
        project_context = analyzer._format_project_context(project_data)

        prompt = f"""
Provide quick project insights for this data:

{project_context}

Return JSON with:
1. "risk_score": Number 1-10 (10 = highest risk)
2. "timeline_confidence": "High"/"Medium"/"Low" 
3. "top_concern": One sentence about biggest risk
4. "quick_win": One actionable recommendation
5. "status_emoji": Single emoji that represents project status

Keep responses concise for dashboard display.

Respond only with valid JSON.
"""

        try:
            response = analyzer.model.generate_content(prompt)

            # Clean the response text before parsing
            response_text = response.text
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            response_text = response_text.replace('```json\n', '').replace('\n```', '').strip()

            # Remove any leading/trailing whitespace and newlines
            response_text = response_text.strip()

            analysis = json.loads(response_text)
            return {
                "success": True,
                "insights": analysis,
                "model_used": "gemini-2.5-flash"
            }
        except json.JSONDecodeError as e:
            print(f"JSON parsing failed: {e}")
            print(f"Raw response: {response.text}")

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "fallback_insights": {
                "risk_score": 5,
                "timeline_confidence": "Medium",
                "top_concern": "Monitor task dependencies and completion rates",
                "quick_win": "Focus on highest risk tasks first",
                "status_emoji": "⚠️"
            }
        }



# For development: Run with `python -m uvicorn api.main:app --reload`
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
