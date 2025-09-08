"""
FastAPI backend for FeelSharper - TDD Implementation
Tests written first, implementation follows
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="FeelSharper Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://feelsharper.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ParseRequest(BaseModel):
    text: str
    type: Optional[str] = None
    occurred_at: Optional[str] = None
    source: str = "api"

class ParseResponse(BaseModel):
    type: str
    confidence: float
    fields: Dict[str, Any]
    timestamp: str
    message: str

@app.post("/api/parse", response_model=ParseResponse)
async def parse_activity(request: ParseRequest):
    """
    Parse natural language input into structured activity data
    Implementation driven by tests defined in test_parse.py
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text input is required")
    
    # Import parser service
    from services.parser import ActivityParser
    
    parser = ActivityParser()
    result = await parser.parse(
        text=request.text,
        type_override=request.type,
        occurred_at=request.occurred_at
    )
    
    return result

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}