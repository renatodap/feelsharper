# FeelSharper Python Backend

FastAPI backend service for natural language parsing and AI insights generation.

## Overview

This Python backend provides:
- Natural language parsing for health and fitness activities
- AI-generated insights based on user activities
- Rule-based coaching recommendations
- Confidence scoring for all predictions

## Setup

### 1. Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Run the Backend Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check with service status

### Activity Parsing
- `POST /api/parse` - Parse natural language input

Example:
```json
{
  "text": "eggs and toast, ran 5k, feeling great",
  "user_id": "user123",
  "source": "manual"
}
```

Response:
```json
{
  "activities": [
    {
      "type": "nutrition",
      "structured_data": {"foods": [{"name": "eggs", "quantity": "2"}]},
      "confidence_score": 0.7
    },
    {
      "type": "exercise",
      "structured_data": {"activity": "running", "distance": 5.0, "distance_unit": "km"},
      "confidence_score": 0.85
    },
    {
      "type": "mood",
      "structured_data": {"mood": "positive", "energy_level": "high"},
      "confidence_score": 0.75
    }
  ],
  "confidence_summary": {"overall": 0.77, "by_activity": [0.7, 0.85, 0.75]},
  "processing_time_ms": 45.2
}
```

### AI Insights
- `GET /api/insights/daily/{user_id}` - Get daily personalized insights
- `POST /api/insights/{insight_id}/feedback` - Submit feedback on insight quality

## Architecture

```
python-backend/
├── main.py                 # FastAPI application
├── services/               # Business logic services
│   ├── parser.py          # Natural language parsing
│   ├── insights.py        # AI insight generation
│   └── rule_engine.py     # Rule-based logic
├── models/                # Data models
├── api/                   # API route handlers
└── tests/                 # Test suite
```

## Services

### Parser Service
- Parses natural language text into structured activities
- Handles multiple activity types: nutrition, exercise, mood, biometrics
- Provides confidence scores for each parsed activity
- Supports multi-activity parsing from single input

### Insights Service
- Generates personalized daily insights (2-3 per day)
- Creates contextual insights based on recent activities
- Provides different insight types: advice, encouragement, warnings, patterns

### Rule Engine
- Manages rule-based coaching logic
- Evaluates conditions to trigger specific insights
- Prioritizes insights based on relevance
- Core rules: pre-workout fuel, post-workout recovery, hydration

## Integration with Next.js Frontend

The frontend communicates with this backend via the `/api/parse-python` endpoint which proxies requests to this service.

Frontend configuration:
```typescript
// lib/api/python-client.ts
const API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
```

## Testing

Run tests with coverage:
```bash
pytest --cov=. --cov-report=html
```

## Development

The backend follows TDD methodology with:
- Feature design documents in `docs/design/`
- Test specifications in `docs/testing/`
- Minimum 80% test coverage requirement
- Mock data prefixed with "Mock" for testing

## Performance Targets

- Parse endpoint: <500ms response time
- Insights generation: <2s for daily insights
- Support for 100+ concurrent users
- Memory usage: <512MB per worker

## Next Steps

1. Database integration with Supabase
2. Enhanced multi-activity parsing
3. User context integration for better personalization
4. Additional rule cards for comprehensive coaching
5. Machine learning integration for pattern detection