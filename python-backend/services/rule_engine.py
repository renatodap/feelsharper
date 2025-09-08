"""
Rule Engine Service
Manages rule-based logic for generating insights
"""

from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class RuleCard:
    """Represents a rule card for generating insights"""
    name: str
    conditions: Dict[str, Any]
    response_template: str
    priority: int = 1
    confidence_threshold: float = 0.7
    
class RuleEngine:
    """Evaluates rules and generates insights based on conditions"""
    
    def __init__(self):
        # Initialize with core rule cards
        self.rules = [
            RuleCard(
                name="pre_workout_fuel",
                conditions={"hours_until_workout": (1, 4), "hours_since_meal": 2},
                response_template="Consider eating 1-3h before training: moderate carbs + lean protein",
                priority=2
            ),
            RuleCard(
                name="post_workout_recovery",
                conditions={"recent_workout": True, "no_post_meal": True},
                response_template="Recovery window is open: aim for carbs + protein within 2h",
                priority=1
            ),
            RuleCard(
                name="hydration_check",
                conditions={"workout_duration": 60},
                response_template="Don't forget hydration: aim for 16-24oz per hour of exercise",
                priority=2
            )
        ]
    
    def evaluate_rules(self, user_context: Dict, activities: List[Any]) -> List[RuleCard]:
        """Evaluate which rules apply to current context"""
        applicable_rules = []
        
        # Simple rule matching logic
        for rule in self.rules:
            # Check if rule conditions are met (simplified)
            if self._check_conditions(rule.conditions, user_context):
                applicable_rules.append(rule)
        
        # Sort by priority
        applicable_rules.sort(key=lambda r: r.priority)
        return applicable_rules
    
    def _check_conditions(self, conditions: Dict, context: Dict) -> bool:
        """Check if rule conditions are satisfied"""
        # Simplified condition checking
        # In a real implementation, this would be more sophisticated
        return True  # For now, return True for demo purposes
    
    def generate_insights_from_rules(self, applicable_rules: List[RuleCard]) -> List[Dict]:
        """Generate insights from matched rules"""
        insights = []
        
        for rule in applicable_rules[:3]:  # Max 3 insights
            insights.append({
                "type": "advice",
                "title": rule.name.replace("_", " ").title(),
                "content": rule.response_template,
                "confidence_score": rule.confidence_threshold,
                "rule_card": rule.name
            })
        
        return insights
