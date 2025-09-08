"""
Confidence Scoring Service
Calculates and calibrates confidence scores for parsed activities
"""

from typing import Dict, Any, List
import re
from datetime import datetime

class ConfidenceCalculator:
    """Calculates confidence scores for parsed activities"""
    
    def __init__(self):
        """Initialize confidence calculator with scoring factors"""
        self.factors = {
            "data_source": {
                "device": 0.9,
                "photo": 0.7, 
                "voice": 0.8,
                "manual": 0.6
            },
            "specificity_bonuses": {
                "exact_numbers": 0.2,
                "units_specified": 0.1,
                "time_specific": 0.1,
            },
            "specificity_penalties": {
                "vague_terms": -0.3,
                "very_short": -0.2,
                "no_details": -0.1
            }
        }
    
    def calculate(self, text: str, parsed_data: Dict[str, Any], source: str = "manual") -> float:
        """Calculate confidence score for parsed activity"""
        
        # Start with base confidence based on data source
        confidence = self.factors["data_source"].get(source, 0.6)
        
        # Apply specificity bonuses
        confidence += self._calculate_specificity_bonus(text, parsed_data)
        
        # Apply consistency checks
        confidence += self._calculate_consistency_bonus(parsed_data)
        
        # Apply penalties for vague input
        confidence += self._calculate_specificity_penalties(text, parsed_data)
        
        # Ensure confidence stays within valid range
        return max(0.0, min(1.0, confidence))
    
    def _calculate_specificity_bonus(self, text: str, parsed_data: Dict[str, Any]) -> float:
        """Calculate bonus points for specific, detailed input"""
        bonus = 0.0
        
        # Exact numbers bonus
        if re.search(r"\d+\.?\d+", text):  # Decimal numbers
            bonus += self.factors["specificity_bonuses"]["exact_numbers"]
        elif re.search(r"\d+", text):  # Integer numbers
            bonus += self.factors["specificity_bonuses"]["exact_numbers"] * 0.7
        
        # Units specified bonus
        units = ["kg", "lbs", "pounds", "km", "miles", "minutes", "hours", "calories"]
        if any(unit in text.lower() for unit in units):
            bonus += self.factors["specificity_bonuses"]["units_specified"]
        
        # Time-specific bonus
        time_indicators = ["am", "pm", "morning", "afternoon", "evening", "at", "around"]
        if any(indicator in text.lower() for indicator in time_indicators):
            bonus += self.factors["specificity_bonuses"]["time_specific"]
        
        return bonus
    
    def _calculate_consistency_bonus(self, parsed_data: Dict[str, Any]) -> float:
        """Calculate bonus for biologically plausible and consistent data"""
        bonus = 0.0
        
        # Check for reasonable values in different categories
        if "value" in parsed_data and parsed_data.get("metric") == "weight":
            weight_value = parsed_data["value"]
            unit = parsed_data.get("unit", "").lower()
            
            # Convert to kg for consistency check
            if "lb" in unit or "pound" in unit:
                weight_kg = weight_value * 0.453592
            else:
                weight_kg = weight_value
            
            # Reasonable human weight range: 40-200 kg
            if 40 <= weight_kg <= 200:
                bonus += 0.1
            else:
                bonus -= 0.2  # Penalty for unreasonable values
        
        # Exercise duration reasonableness
        if "duration_minutes" in parsed_data:
            duration = parsed_data["duration_minutes"]
            if 5 <= duration <= 240:  # 5 minutes to 4 hours
                bonus += 0.1
            else:
                bonus -= 0.1
        
        # Exercise distance reasonableness
        if "distance" in parsed_data:
            distance = parsed_data["distance"]
            activity = parsed_data.get("activity", "")
            
            # Reasonable distances for different activities
            if activity == "running" and 0.5 <= distance <= 50:  # 0.5 to 50 km
                bonus += 0.1
            elif activity == "walking" and 0.1 <= distance <= 30:  # 0.1 to 30 km
                bonus += 0.1
        
        return bonus
    
    def _calculate_specificity_penalties(self, text: str, parsed_data: Dict[str, Any]) -> float:
        """Calculate penalties for vague or unclear input"""
        penalty = 0.0
        
        # Very short input penalty
        word_count = len(text.split())
        if word_count < 3:
            penalty += self.factors["specificity_penalties"]["very_short"]
        
        # Vague terms penalty
        vague_terms = ["some", "a little", "kinda", "maybe", "about", "around", "stuff"]
        vague_count = sum(1 for term in vague_terms if term in text.lower())
        if vague_count > 0:
            penalty += self.factors["specificity_penalties"]["vague_terms"] * min(vague_count, 2)
        
        # No specific details penalty
        activity_type = parsed_data.get("type", "unknown")
        if activity_type == "nutrition" and not parsed_data.get("foods"):
            penalty += self.factors["specificity_penalties"]["no_details"]
        elif activity_type == "exercise" and parsed_data.get("activity") == "unknown":
            penalty += self.factors["specificity_penalties"]["no_details"]
        elif activity_type == "biometric" and not parsed_data.get("value"):
            penalty += self.factors["specificity_penalties"]["no_details"]
        
        return penalty
    
    def calibrate_from_feedback(self, original_confidence: float, user_rating: int, was_accurate: bool) -> float:
        """Adjust confidence calculation based on user feedback"""
        
        # User rating is 1-5 scale
        # was_accurate is boolean for whether parsing was correct
        
        if user_rating >= 4 and was_accurate:
            # High rating and accurate - confidence was appropriate or conservative
            return min(1.0, original_confidence + 0.05)
        elif user_rating <= 2 or not was_accurate:
            # Low rating or inaccurate - confidence was too high
            return max(0.0, original_confidence - 0.1)
        else:
            # Neutral feedback - confidence was reasonable
            return original_confidence
    
    def get_confidence_explanation(self, confidence: float, text: str, parsed_data: Dict[str, Any]) -> str:
        """Generate human-readable explanation of confidence score"""
        
        if confidence >= 0.9:
            return "Very confident - clear, specific input with detailed information"
        elif confidence >= 0.7:
            return "Confident - good details provided, minor ambiguities"
        elif confidence >= 0.5:
            return "Moderate confidence - some details missing or unclear"
        elif confidence >= 0.3:
            return "Low confidence - input is vague or ambiguous"
        else:
            return "Very low confidence - please provide more specific information"
    
    def should_ask_clarifying_questions(self, confidence: float) -> bool:
        """Determine if clarifying questions should be asked"""
        return confidence < 0.7
    
    def get_minimum_confidence_threshold(self, activity_type: str) -> float:
        """Get minimum confidence required for different activity types"""
        thresholds = {
            "biometric": 0.8,  # High accuracy needed for health metrics
            "exercise": 0.6,   # Some ambiguity acceptable
            "nutrition": 0.6,  # Some ambiguity acceptable
            "mood": 0.4,       # Subjective, lower threshold
            "unknown": 0.0     # No threshold for unknown activities
        }
        
        return thresholds.get(activity_type, 0.5)