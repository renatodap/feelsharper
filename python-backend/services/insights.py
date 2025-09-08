"""
AI Insights Generator Service
Generates personalized insights based on user activities
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass

@dataclass 
class AIInsight:
    """Represents an AI-generated insight"""
    type: str  # advice, encouragement, warning, pattern
    title: str
    content: str
    confidence_score: float
    priority: int = 1
    
    def to_dict(self):
        return {
            "type": self.type,
            "title": self.title,
            "content": self.content,
            "confidence_score": self.confidence_score,
            "priority": self.priority
        }

class InsightGenerator:
    """Generates AI insights based on user activities and patterns"""
    
    def generate_daily_insights(self, user_id: str, activity_history: List[Any]) -> List[AIInsight]:
        """Generate daily insights for a user"""
        insights = []
        
        # Example insight based on recent activities
        insights.append(AIInsight(
            type="encouragement",
            title="Great Morning Routine!",
            content="Excellent combination of good nutrition and cardio. Your balanced breakfast will support recovery from the run.",
            confidence_score=0.82,
            priority=1
        ))
        
        # Add more contextual insights based on activity patterns
        if activity_history:
            insights.append(AIInsight(
                type="advice",
                title="Post-Workout Nutrition",
                content="Consider having protein within 2 hours after your workout for optimal recovery.",
                confidence_score=0.75,
                priority=2
            ))
        
        return insights[:3]  # Return max 3 insights
    
    def generate_contextual_insight(self, activity: Any, user_context: Dict) -> Optional[AIInsight]:
        """Generate immediate insight for a specific activity"""
        
        # Example: Post-workout insight
        if hasattr(activity, 'type') and activity.type == "exercise":
            return AIInsight(
                type="advice",
                title="Recovery Time",
                content="Great workout! Remember to hydrate and consider some protein for recovery.",
                confidence_score=0.8,
                priority=1
            )
        
        return None
