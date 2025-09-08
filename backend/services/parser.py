"""
Parser service - Core logic for natural language parsing
Implements patterns identified in Next.js codebase
"""

import re
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import os

class ActivityParser:
    """Parse natural language into structured activity data"""
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
    async def parse(
        self, 
        text: str, 
        type_override: Optional[str] = None,
        occurred_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parse text into structured activity
        Logic ported from Next.js /api/parse/route.ts
        """
        
        # Detect type from keywords (same logic as Next.js)
        detected_type = self._detect_type(text, type_override)
        
        # Parse based on type
        if detected_type == "weight":
            result = self._parse_weight(text)
        elif detected_type == "nutrition":
            result = await self._parse_food(text)
        elif detected_type in ["cardio", "strength"]:
            result = await self._parse_exercise(text, detected_type)
        else:
            result = self._parse_mood(text)
            
        # Add timestamp
        if occurred_at:
            result["timestamp"] = occurred_at
        else:
            result["timestamp"] = datetime.now(timezone.utc).isoformat()
            
        return result
    
    def _detect_type(self, text: str, override: Optional[str]) -> str:
        """Detect activity type from text"""
        lower_text = text.lower()
        
        # Type override validation
        if override and self._validate_override(text, override):
            return override
            
        # Keyword detection (same as Next.js)
        food_keywords = ['ate', 'eaten', 'breakfast', 'lunch', 'dinner', 
                        'eggs', 'toast', 'chicken', 'salad', 'coffee']
        strength_keywords = ['bench', 'squat', 'press', 'deadlift', 'curl', 'sets', 'reps']
        cardio_keywords = ['ran', 'run', 'walked', 'cardio', 'km', 'miles', 'jog', 'bike']
        exercise_keywords = ['gym', 'workout', 'exercise']
        weight_keywords = ['weight', 'weigh', 'kg', 'kilos']
        weight_with_lbs = ['weight', 'weigh']  # Special handling for 'lbs' which can be exercise weight
        mood_keywords = ['feeling', 'feel', 'mood', 'energy']
        
        # Check for strength exercises first (more specific)
        if any(kw in lower_text for kw in strength_keywords):
            # If it has 'reps' or 'sets', it's definitely strength training
            if 'reps' in lower_text or 'sets' in lower_text:
                return "strength"
            # If it has exercise weight (e.g., "135 lbs"), it's strength
            if re.search(r'\d+\s*(lbs?|pounds?|kg)', lower_text) and any(kw in lower_text for kw in ['bench', 'squat', 'press', 'deadlift', 'curl']):
                return "strength"
        
        # Check for body weight measurements
        if any(kw in lower_text for kw in weight_with_lbs) and not any(kw in lower_text for kw in strength_keywords):
            return "weight"
        elif 'lbs' in lower_text and not any(kw in lower_text for kw in strength_keywords + cardio_keywords):
            return "weight"
        
        # Check for food
        elif any(kw in lower_text for kw in food_keywords):
            return "nutrition"
        
        # Check for cardio
        elif any(kw in lower_text for kw in cardio_keywords):
            return "cardio"
        
        # Check for general exercise
        elif any(kw in lower_text for kw in exercise_keywords):
            return "cardio"  # Default to cardio for general exercise
        elif any(kw in lower_text for kw in mood_keywords):
            return "mood"
        else:
            return "mood"  # Default fallback
    
    def _parse_weight(self, text: str) -> Dict[str, Any]:
        """Parse weight from text"""
        # Pattern to match weight values with units
        pattern = r'(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?|kilos?)?'
        match = re.search(pattern, text, re.IGNORECASE)
        
        if match:
            value = float(match.group(1))
            unit = "lbs"  # Default to lbs
            if match.group(2):
                if "kg" in match.group(2).lower() or "kilo" in match.group(2).lower():
                    unit = "kg"
                else:
                    unit = "lbs"
            
            return {
                "type": "weight",
                "confidence": 95.0,
                "fields": {
                    "weight": value,
                    "unit": unit
                },
                "message": f"Weight logged: {value} {unit}"
            }
        
        # Try parsing just numbers
        number_match = re.search(r'(\d+(?:\.\d+)?)', text)
        if number_match:
            value = float(number_match.group(1))
            return {
                "type": "weight",
                "confidence": 80.0,
                "fields": {
                    "weight": value,
                    "unit": "lbs"
                },
                "message": f"Weight logged: {value} lbs"
            }
            
        raise ValueError("Could not parse weight from text")
    
    async def _parse_food(self, text: str) -> Dict[str, Any]:
        """Parse food/nutrition from text"""
        # Simplified version for MVP
        foods = []
        
        # Split by common separators
        parts = re.split(r',|and|with|\+', text, flags=re.IGNORECASE)
        
        for part in parts:
            part = part.strip()
            if part and not part.lower() in ['breakfast', 'lunch', 'dinner', 'snack']:
                foods.append({"name": part})
        
        return {
            "type": "nutrition",
            "confidence": 85.0,
            "fields": {
                "foods": foods if foods else [{"name": text}],
                "meal": text
            },
            "message": f"Food logged: {text}"
        }
    
    async def _parse_exercise(self, text: str, exercise_type: str) -> Dict[str, Any]:
        """Parse exercise from text"""
        fields = {"activity": text}
        
        # Parse distance
        distance_match = re.search(r'(\d+(?:\.\d+)?)\s*(k|km|mi|mile)', text, re.I)
        if distance_match:
            fields["distance"] = float(distance_match.group(1))
            fields["unit"] = "km" if "k" in distance_match.group(2).lower() else "miles"
        
        # Parse duration
        duration_match = re.search(r'(\d+)\s*(min|minute|hour)', text, re.I)
        if duration_match:
            duration = int(duration_match.group(1))
            if "hour" in duration_match.group(2):
                duration *= 60
            fields["duration_minutes"] = duration
        
        # For strength exercises, look for reps and sets
        if exercise_type == "strength":
            reps_match = re.search(r'(\d+)\s*reps?', text, re.I)
            if reps_match:
                fields["reps"] = int(reps_match.group(1))
                
            sets_match = re.search(r'(\d+)\s*sets?', text, re.I)
            if sets_match:
                fields["sets"] = int(sets_match.group(1))
                
            weight_match = re.search(r'(\d+)\s*(lbs?|kg)', text, re.I)
            if weight_match:
                fields["weight"] = float(weight_match.group(1))
                fields["weight_unit"] = weight_match.group(2).lower()
        
        return {
            "type": exercise_type,
            "confidence": 90.0,
            "fields": fields,
            "message": f"{exercise_type.title()} workout logged"
        }
    
    def _parse_mood(self, text: str) -> Dict[str, Any]:
        """Parse mood/general text"""
        return {
            "type": "mood",
            "confidence": 60.0,
            "fields": {
                "mood": text,
                "notes": text
            },
            "message": "Mood logged"
        }
    
    def _validate_override(self, text: str, override: str) -> bool:
        """Validate if type override makes sense"""
        lower_text = text.lower()
        
        # Don't allow overriding obvious food as weight
        if override == "weight":
            food_indicators = ['ate', 'breakfast', 'lunch', 'dinner', 'food', 'meal']
            if any(word in lower_text for word in food_indicators):
                return False
        
        # Don't allow overriding obvious exercise as weight
        if override == "weight":
            exercise_indicators = ['ran', 'run', 'workout', 'gym', 'exercise']
            if any(word in lower_text for word in exercise_indicators):
                return False
        
        return True