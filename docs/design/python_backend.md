# Python Backend Design - FeelSharper MVP

## Overview
Python FastAPI backend to handle natural language parsing, rule engine, and AI insights generation for FeelSharper MVP.

## Core Requirements

### 1. Natural Language Parsing
- **Input**: Raw text from user ("eggs and toast, ran 5k, feeling great")
- **Output**: Structured activity data with confidence scores
- **Performance**: <500ms response time
- **Accuracy**: 80%+ parsing accuracy target

### 2. Rule Engine System  
- **Rules**: 5 core coaching rules (pre-workout fuel, post-workout recovery, etc.)
- **Matching**: Context-aware rule selection based on user activities
- **Confidence**: Only return insights with >70% confidence
- **Personalization**: Rules adapt based on user profile and preferences

### 3. Insights Generation
- **Daily Insights**: 2-3 personalized recommendations per user
- **Categories**: Advice, encouragement, warnings, patterns
- **Context**: Based on recent activities, user profile, upcoming events
- **Feedback**: User rating system to improve insight quality

## API Endpoints

### POST /api/parse
Parse natural language input into structured data
```python
{
    "text": "eggs and toast, ran 5k in 25 minutes",
    "user_id": "uuid",
    "occurred_at": "2024-01-01T08:00:00Z"
}
```

### GET /api/insights/daily/{user_id}
Get daily insights for user
```python
{
    "insights": [
        {
            "type": "advice",
            "title": "Great cardio session!",
            "content": "Your 5k time is improving. Consider adding strength training 2x/week.",
            "confidence": 0.85,
            "rule_card": "cardio_progression"
        }
    ]
}
```

### POST /api/insights/{insight_id}/feedback
Submit feedback on insight quality
```python
{
    "helpful": true,
    "followed": false,
    "rating": 4,
    "notes": "Good advice but too generic"
}
```

## Architecture

### Services Layer
- `services/parser.py` - Natural language parsing logic
- `services/rule_engine.py` - Rule matching and insight generation
- `services/confidence.py` - Confidence scoring algorithms
- `services/insights.py` - Daily insight generation and management

### Models Layer
- `models/activity.py` - Activity data models  
- `models/insight.py` - Insight data models
- `models/user.py` - User profile models

### API Layer
- `api/parse.py` - Parsing endpoints
- `api/insights.py` - Insights endpoints  
- `api/user.py` - User profile endpoints

## Data Models

### ParsedActivity
```python
@dataclass
class ParsedActivity:
    type: str  # 'nutrition', 'exercise', 'biometric'
    data: Dict[str, Any]
    confidence: float  # 0.0 - 1.0
    raw_text: str
    parsed_at: datetime
    clarifying_questions: List[str] = None
```

### AIInsight
```python
@dataclass
class AIInsight:
    id: str
    user_id: str
    type: str  # 'advice', 'encouragement', 'warning', 'pattern'
    title: str
    content: str
    confidence: float
    rule_card: str
    created_at: datetime
    expires_at: datetime = None
```

## Performance Targets
- Parse endpoint: <500ms response time
- Insights generation: <2s for daily insights
- Database queries: <100ms average
- Memory usage: <512MB per worker

## Testing Strategy
- Unit tests for all service functions
- Integration tests for API endpoints  
- End-to-end tests for complete workflows
- Performance tests for response times
- Coverage target: 80% minimum

## Security Considerations
- Input validation on all endpoints
- Rate limiting for parsing requests
- User isolation - no cross-user data access
- Sanitize all user inputs before processing
- Secure API key handling for AI services