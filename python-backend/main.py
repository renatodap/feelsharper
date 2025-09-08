"""
FeelSharper FastAPI Backend - MVP Implementation
Natural language parsing and AI insights for health tracking
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import time
import uvicorn

# Import services
from services.parser import NaturalLanguageParser, ParsedActivity
from services.insights import InsightGenerator  
from services.rule_engine import RuleEngine

app = FastAPI(
    title="FeelSharper MVP Backend",
    description="Natural language parsing and AI insights for health tracking",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://feelsharper.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ParseRequest(BaseModel):
    text: str
    user_id: str
    occurred_at: Optional[str] = None
    source: Optional[str] = "manual"
    
class ParseResponse(BaseModel):
    activities: List[Dict[str, Any]]
    confidence_summary: Dict[str, float]
    processing_time_ms: float
    clarifying_questions: List[str] = []

class InsightFeedback(BaseModel):
    helpful: bool
    followed: Optional[bool] = None
    rating: Optional[int] = None
    notes: Optional[str] = None

# Global services (will be initialized properly once services are implemented)
parser = None
insight_generator = None
rule_engine = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global parser, insight_generator, rule_engine
    
    try:
        # Initialize services
        parser = NaturalLanguageParser()
        insight_generator = InsightGenerator()
        rule_engine = RuleEngine()
        print("✅ Backend services initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing services: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "FeelSharper MVP Backend",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "parser": parser is not None,
            "insights": insight_generator is not None,  
            "rules": rule_engine is not None
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/parse", response_model=ParseResponse)
async def parse_activity(request: ParseRequest):
    """
    Parse natural language input into structured activity data
    
    Example inputs:
    - "eggs and toast for breakfast" 
    - "ran 5k in 25 minutes"
    - "weight 175 lbs, feeling good"
    """
    start_time = time.time()
    
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text input is required")
        
        if not request.user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # Use the actual parser service
        if parser:
            parsed_activities = parser.parse_activities(request.text)
            
            # Convert to dict format for response
            activities = [activity.to_dict() for activity in parsed_activities]
            
            # Calculate confidence summary
            confidence_scores = [a.confidence_score for a in parsed_activities]
            confidence_summary = {
                "overall": sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0,
                "by_activity": confidence_scores
            }
            
            # Generate insights if available
            insights = []
            if insight_generator and parsed_activities:
                for activity in parsed_activities:
                    insight = insight_generator.generate_contextual_insight(activity, {})
                    if insight:
                        insights.append(insight.to_dict())
        else:
            # Fallback to mock data if parser not available
            activities = [{
                "type": "unknown",
                "structured_data": {"raw_text": request.text},
                "confidence_score": 0.5,
                "source": request.source,
                "raw_text": request.text
            }]
            confidence_summary = {"overall": 0.5}
            insights = []
        
        processing_time = (time.time() - start_time) * 1000
        
        # Add insights to response if any were generated
        response = {
            "activities": activities,
            "confidence_summary": confidence_summary,
            "processing_time_ms": processing_time,
            "clarifying_questions": []
        }
        
        if insights:
            response["insights"] = insights
        
        return ParseResponse(**response)
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        raise HTTPException(
            status_code=500, 
            detail=f"Parsing failed: {str(e)}"
        )

@app.get("/api/insights/daily/{user_id}")
async def get_daily_insights(user_id: str):
    """Get daily insights for a user"""
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    # Use actual insight generator
    if insight_generator:
        # In a real app, we'd fetch activity history from database
        # For now, pass empty history
        generated_insights = insight_generator.generate_daily_insights(user_id, [])
        insights = [insight.to_dict() for insight in generated_insights]
    else:
        # Fallback to mock
        insights = [{
            "type": "advice",
            "title": "Service Unavailable",
            "content": "Insights service is being initialized.",
            "confidence_score": 0.5,
            "priority": 1
        }]
    
    return {"insights": insights, "user_id": user_id}

@app.post("/api/insights/{insight_id}/feedback")
async def submit_insight_feedback(insight_id: str, feedback: InsightFeedback):
    """Submit feedback on insight quality for learning"""
    
    if not insight_id:
        raise HTTPException(status_code=400, detail="Insight ID is required")
    
    # Mock response until feedback system is implemented  
    return {
        "message": "Feedback recorded",
        "insight_id": insight_id,
        "feedback": feedback.dict()
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Endpoint not found", "path": str(request.url)}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal server error", "message": str(exc)}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )