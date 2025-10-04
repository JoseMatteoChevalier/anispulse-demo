from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Dict, Any, Optional
import json

load_dotenv()

# Configure Gemini
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

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
            "duration_days": task.get("duration_days", 5),
            "predecessors": task.get("predecessors", []),
            "scheduled_start_day": i * 3,
            "scheduled_finish_day": i * 3 + task.get("duration_days", 5),
            "is_critical": i < 2,
            "risk_level": "Medium",
            "risk_score": 35,
            "float_days": 0 if i < 2 else 2,
            "blocks_tasks": [],
            "blocked_by_tasks": task.get("predecessors", [])
        })
    
    return {
        "success": True,
        "project_name": project_data.get("project_name", "Demo Project"),
        "project_start_date": project_data.get("project_start_date"),
        "project_metrics": {
            "total_duration_days": len(tasks) * 3 + max([task.get("duration_days", 5) for task in tasks], default=5),
            "overall_risk_level": "Medium",
            "critical_path_ids": [tasks[i].get("id") for i in range(min(2, len(tasks)))],
            "total_tasks": len(tasks)
        },
        "tasks": demo_tasks,
        "demo_mode": True
    }    """Demo timeline calculation"""
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


@app.post("/api/{endpoint:path}")
def analytics_gateway(endpoint: str):
    return {
        "success": False,
        "message": f"Advanced {endpoint.replace('-', ' ')} available in full version",
        "contact": "jose.e.matteo.chevalier@gmail.com"
    }