# Python Backend Test Design - FeelSharper MVP

## Test Coverage Strategy

### Unit Tests (60% of coverage)
Test individual functions and classes in isolation

#### services/parser.py Tests
- `test_parse_nutrition_input()` - "eggs and toast" → nutrition data
- `test_parse_exercise_input()` - "ran 5k" → exercise data  
- `test_parse_biometric_input()` - "weight 175 lbs" → biometric data
- `test_parse_multi_activity()` - Combined inputs
- `test_confidence_calculation()` - Confidence scoring accuracy
- `test_ambiguous_input_handling()` - Edge cases and unclear inputs

#### services/rule_engine.py Tests  
- `test_rule_matching()` - Correct rule selection for activities
- `test_confidence_thresholds()` - Rules only fire above threshold
- `test_context_awareness()` - Rules consider user history
- `test_rule_prioritization()` - Most relevant rules selected first

#### services/insights.py Tests
- `test_daily_insight_generation()` - 2-3 insights per user
- `test_insight_personalization()` - Insights match user profile
- `test_feedback_integration()` - Learning from user ratings
- `test_insight_expiration()` - Old insights cleaned up

### Integration Tests (25% of coverage)
Test API endpoints with real database interactions

#### API Endpoint Tests
- `test_parse_endpoint()` - POST /api/parse with valid input
- `test_parse_validation()` - Invalid input handling
- `test_daily_insights_endpoint()` - GET /api/insights/daily/{user_id}
- `test_feedback_endpoint()` - POST /api/insights/{id}/feedback
- `test_user_isolation()` - Users can't access others' data

### End-to-End Tests (15% of coverage)
Test complete user workflows

#### User Journey Tests
- `test_new_user_first_parse()` - Complete flow from input to insight
- `test_returning_user_daily_flow()` - Check insights → log activity → new insights
- `test_voice_input_workflow()` - Voice → text → parse → insights
- `test_feedback_learning()` - Feedback improves future insights

## Mock Strategy

### External Dependencies to Mock
- **OpenAI API calls** → `MockOpenAIClient`
- **Claude API calls** → `MockClaudeClient`  
- **Database operations** → `MockDatabase`
- **User authentication** → `MockAuth`

### Mock Naming Convention
All mocks prefixed with "Mock" for clarity:
- `MockOpenAIClient` - AI parsing service
- `MockRuleEngine` - For testing insights without rules
- `MockUserProfile` - User data for testing
- `MockActivityHistory` - User activity data

### Mock Documentation Headers
```python
"""
MOCK TEST FILE - Contains test doubles for external services

Mocks used:
- MockOpenAIClient: Simulates OpenAI API responses for parsing
- MockDatabase: In-memory database for testing
- MockUserProfile: Test user data

Real implementation: services/parser.py
"""
```

## Test Data Sets

### Parsing Test Cases
```python
PARSE_TEST_CASES = [
    {
        "input": "eggs and toast for breakfast",
        "expected_type": "nutrition", 
        "expected_confidence": 0.9,
        "expected_data": {"meal_type": "breakfast", "foods": ["eggs", "toast"]}
    },
    {
        "input": "ran 5k in 25 minutes",
        "expected_type": "exercise",
        "expected_confidence": 0.95,
        "expected_data": {"activity": "running", "distance": 5, "duration_minutes": 25}
    },
    {
        "input": "feeling tired, weight 175",  
        "expected_type": "mixed",
        "expected_confidence": 0.8,
        "expected_activities": 2
    }
]
```

### Rule Engine Test Scenarios
```python
RULE_TEST_SCENARIOS = [
    {
        "name": "pre_workout_fuel",
        "user_activities": ["workout planned in 2 hours"],
        "should_trigger": True,
        "expected_confidence": 0.85
    },
    {
        "name": "post_workout_recovery", 
        "user_activities": ["intense workout 1 hour ago"],
        "should_trigger": True,
        "expected_advice": "Recovery window is open"
    }
]
```

## Performance Test Targets

### Response Time Tests
- Parse endpoint: <500ms (target <100ms)
- Daily insights: <2s (target <1s)  
- Feedback submission: <200ms
- Database queries: <100ms average

### Load Tests
- 100 concurrent parse requests
- 1000 daily insight generations
- Memory usage <512MB per worker
- CPU usage <70% under load

## Test Environment Setup

### Dependencies
```python
# test_requirements.txt
pytest==7.4.0
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.24.1
faker==19.3.0
```

### Test Database
- SQLite in-memory for unit tests
- Docker PostgreSQL for integration tests
- Isolated test data - no production contamination

### Mock API Responses
Pre-configured responses for consistent testing:
- OpenAI parsing responses
- User profile data
- Activity history samples
- Rule engine outputs

## Coverage Requirements

### Minimum Coverage Targets
- Overall: 80% minimum
- Critical paths (parsing, insights): 95%
- API endpoints: 90%
- Error handling: 80%

### Coverage Exclusions
- Configuration files
- Database migration scripts
- Third-party library code
- Development utilities

## Test Automation

### Pre-commit Hooks
- Run all unit tests
- Check coverage thresholds
- Lint code with flake8
- Type checking with mypy

### CI/CD Pipeline
- Run full test suite on PR
- Generate coverage reports
- Performance regression tests
- Integration tests with real APIs (staging)

## Test Data Management

### Fixtures
- `user_profiles.json` - Test user data
- `activity_samples.json` - Sample activities
- `rule_responses.json` - Expected rule outputs
- `api_responses.json` - Mock API responses

### Data Privacy
- No real user data in tests
- Anonymized/synthetic test data only
- Clear separation of test vs production data
- Automatic cleanup of test data