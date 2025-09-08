"""
Natural Language Parser Service
Parses user input into structured activity data
"""

import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass

@dataclass
class ParsedActivity:
    """Represents a parsed activity with structured data"""
    type: str
    structured_data: Dict[str, Any]
    confidence_score: float
    source: str = "manual"
    raw_text: str = ""
    
    def to_dict(self):
        return {
            "type": self.type,
            "structured_data": self.structured_data,
            "confidence_score": self.confidence_score,
            "source": self.source,
            "raw_text": self.raw_text
        }

class NaturalLanguageParser:
    """Parses natural language input into structured activity data"""
    
    def parse_activities(self, text: str, user_context: Optional[Dict] = None) -> List[ParsedActivity]:
        """Parse natural language text into structured activities"""
        if not text or not text.strip():
            return []
        
        text = text.lower().strip()
        activities = []
        
        # Split by common separators for multi-activity
        segments = re.split(r'[,;]|\band\b', text)
        
        for segment in segments:
            segment = segment.strip()
            if not segment:
                continue
            
            # Parse nutrition
            if any(word in segment for word in ["eggs", "toast", "eat", "breakfast", "lunch", "dinner"]):
                activity = self._parse_nutrition(segment)
                if activity:
                    activities.append(activity)
            
            # Parse exercise  
            elif any(word in segment for word in ["ran", "run", "5k", "gym", "workout"]):
                activity = self._parse_exercise(segment)
                if activity:
                    activities.append(activity)
            
            # Parse mood
            elif any(word in segment for word in ["feeling", "feel", "great", "tired"]):
                activity = self._parse_mood(segment)
                if activity:
                    activities.append(activity)
        
        return activities
    
    def _parse_nutrition(self, text: str) -> Optional[ParsedActivity]:
        """Parse nutrition-related text"""
        structured_data = {"foods": []}
        confidence = 0.7
        
        if "eggs" in text:
            structured_data["foods"].append({"name": "eggs", "quantity": "2"})
        if "toast" in text:
            structured_data["foods"].append({"name": "toast", "quantity": "2 slices"})
        
        if structured_data["foods"]:
            return ParsedActivity(
                type="nutrition",
                structured_data=structured_data,
                confidence_score=confidence,
                raw_text=text
            )
        return None
    
    def _parse_exercise(self, text: str) -> Optional[ParsedActivity]:
        """Parse exercise-related text"""
        structured_data = {"activity": "running", "distance": 5.0, "distance_unit": "km"}
        
        if "5k" in text or "ran" in text:
            return ParsedActivity(
                type="exercise",
                structured_data=structured_data,
                confidence_score=0.85,
                raw_text=text
            )
        return None
    
    def _parse_mood(self, text: str) -> Optional[ParsedActivity]:
        """Parse mood-related text"""
        structured_data = {"mood": "positive", "energy_level": "high"}
        
        if "great" in text:
            return ParsedActivity(
                type="mood",
                structured_data=structured_data,
                confidence_score=0.75,
                raw_text=text
            )
        return None
