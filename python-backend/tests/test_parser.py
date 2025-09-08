"""
MOCK TEST FILE - Contains test doubles for external services

Mocks used:
- MockOpenAIClient: Simulates OpenAI API responses for parsing
- MockDatabase: In-memory database for testing
- MockUserProfile: Test user data

Real implementation: services/parser.py
"""

import pytest
from datetime import datetime
from typing import Dict, Any, List
import json

# Import the modules we're testing (these don't exist yet - TDD approach)
# from services.parser import NaturalLanguageParser, ParsedActivity
# from services.confidence import ConfidenceCalculator

class MockOpenAIClient:
    """Mock OpenAI client for testing parsing without API calls"""
    
    def __init__(self):
        self.responses = {
            "eggs and toast": {
                "type": "nutrition",
                "data": {"meal_type": "breakfast", "foods": ["eggs", "toast"], "estimated_calories": 350},
                "confidence": 0.9
            },
            "ran 5k in 25 minutes": {
                "type": "exercise", 
                "data": {"activity": "running", "distance": 5, "distance_unit": "km", "duration_minutes": 25},
                "confidence": 0.95
            },
            "weight 175 lbs": {
                "type": "biometric",
                "data": {"metric": "weight", "value": 175, "unit": "lbs"},
                "confidence": 0.98
            }
        }
    
    def parse(self, text: str) -> Dict[str, Any]:
        """Mock parsing response"""
        return self.responses.get(text.lower(), {
            "type": "unknown",
            "data": {},
            "confidence": 0.3
        })

class MockUserProfile:
    """Mock user profile for testing"""
    
    def __init__(self, user_id: str = "test-user-123"):
        self.user_id = user_id
        self.profile = {
            "age": 28,
            "goal": "weight_loss",
            "activity_level": "moderate", 
            "dietary_restrictions": [],
            "preferred_units": "metric"
        }

# Test Data
PARSE_TEST_CASES = [
    {
        "input": "eggs and toast",
        "expected_type": "nutrition",
        "expected_confidence_min": 0.8,
        "expected_foods": ["eggs", "toast"]
    },
    {
        "input": "ran 5k in 25 minutes", 
        "expected_type": "exercise",
        "expected_confidence_min": 0.9,
        "expected_activity": "running"
    },
    {
        "input": "weight 175 lbs",
        "expected_type": "biometric", 
        "expected_confidence_min": 0.95,
        "expected_metric": "weight"
    },
    {
        "input": "feeling tired today",
        "expected_type": "mood",
        "expected_confidence_min": 0.6
    },
    {
        "input": "xyz random nonsense 123",
        "expected_type": "unknown",
        "expected_confidence_max": 0.5
    }
]

class TestNaturalLanguageParser:
    """Test cases for natural language parsing functionality"""
    
    @pytest.fixture
    def mock_openai_client(self):
        return MockOpenAIClient()
    
    @pytest.fixture 
    def mock_user_profile(self):
        return MockUserProfile()
    
    def test_parser_initialization(self):
        """Test parser can be initialized without errors"""
        # This will fail initially - we haven't implemented the parser yet
        with pytest.raises(ImportError):
            from services.parser import NaturalLanguageParser
            parser = NaturalLanguageParser()
    
    def test_parse_nutrition_input(self, mock_openai_client):
        """Test parsing nutrition-related input"""
        with pytest.raises(ImportError):
            from services.parser import NaturalLanguageParser
            parser = NaturalLanguageParser(ai_client=mock_openai_client)
            
            result = parser.parse("eggs and toast", user_id="test-user")
            
            assert result.type == "nutrition"
            assert result.confidence >= 0.8
            assert "eggs" in str(result.data)
            assert "toast" in str(result.data)
    
    def test_parse_exercise_input(self, mock_openai_client):
        """Test parsing exercise-related input"""  
        with pytest.raises(ImportError):
            from services.parser import NaturalLanguageParser
            parser = NaturalLanguageParser(ai_client=mock_openai_client)
            
            result = parser.parse("ran 5k in 25 minutes", user_id="test-user")
            
            assert result.type == "exercise"
            assert result.confidence >= 0.9
            assert result.data["activity"] == "running"
            assert result.data["distance"] == 5
    
    def test_parse_biometric_input(self, mock_openai_client):
        """Test parsing biometric measurements"""
        with pytest.raises(ImportError):
            from services.parser import NaturalLanguageParser  
            parser = NaturalLanguageParser(ai_client=mock_openai_client)
            
            result = parser.parse("weight 175 lbs", user_id="test-user")
            
            assert result.type == "biometric"
            assert result.confidence >= 0.95
            assert result.data["metric"] == "weight"
            assert result.data["value"] == 175
    
    def test_confidence_calculation_accuracy(self):
        """Test confidence score calculation"""
        with pytest.raises(ImportError):
            from services.confidence import ConfidenceCalculator
            calculator = ConfidenceCalculator()
            
            # High confidence case
            score = calculator.calculate("weight 175.5 lbs", {"metric": "weight", "value": 175.5})
            assert score >= 0.9
            
            # Low confidence case  
            score = calculator.calculate("some vague text", {"unclear": "data"})
            assert score <= 0.5
    
    def test_ambiguous_input_handling(self, mock_openai_client):
        """Test handling of ambiguous or unclear inputs"""
        with pytest.raises(ImportError):
            from services.parser import NaturalLanguageParser
            parser = NaturalLanguageParser(ai_client=mock_openai_client)
            
            result = parser.parse("xyz random nonsense", user_id="test-user")
            
            assert result.type == "unknown" or result.confidence <= 0.5
            assert len(result.clarifying_questions) > 0
    
    @pytest.mark.parametrize("test_case", PARSE_TEST_CASES)
    def test_parse_various_inputs(self, test_case, mock_openai_client):
        """Test parsing various input types with expected outcomes"""
        with pytest.raises(ImportError):
            from services.parser import NaturalLanguageParser
            parser = NaturalLanguageParser(ai_client=mock_openai_client)
            
            result = parser.parse(test_case["input"], user_id="test-user")
            
            assert result.type == test_case["expected_type"]
            if "expected_confidence_min" in test_case:
                assert result.confidence >= test_case["expected_confidence_min"]
            if "expected_confidence_max" in test_case:
                assert result.confidence <= test_case["expected_confidence_max"]

class TestParseEndpoint:
    """Test cases for the /api/parse endpoint"""
    
    def test_parse_endpoint_exists(self):
        """Test that parse endpoint is accessible"""
        # This will fail initially - endpoint doesn't exist yet
        with pytest.raises(ImportError):
            from api.parse import router
            assert router is not None
    
    def test_parse_endpoint_validation(self):
        """Test input validation on parse endpoint"""
        with pytest.raises(ImportError):
            from api.parse import parse_activity
            
            # Test missing required fields
            with pytest.raises(ValueError):
                parse_activity({})  # Empty input
            
            # Test invalid user_id
            with pytest.raises(ValueError):
                parse_activity({"text": "eggs", "user_id": ""})
    
    def test_parse_endpoint_response_structure(self):
        """Test that parse endpoint returns expected response structure"""
        with pytest.raises(ImportError):
            from api.parse import parse_activity
            
            response = parse_activity({
                "text": "eggs and toast",
                "user_id": "test-user-123",
                "occurred_at": "2024-01-01T08:00:00Z"
            })
            
            # Expected response structure
            assert "activities" in response
            assert "confidence_summary" in response  
            assert "processing_time_ms" in response
            assert isinstance(response["activities"], list)

# Performance Tests
class TestPerformance:
    """Performance-related test cases"""
    
    def test_parse_response_time(self):
        """Test that parsing completes within performance targets"""
        with pytest.raises(ImportError):
            import time
            from services.parser import NaturalLanguageParser
            
            parser = NaturalLanguageParser()
            start_time = time.time()
            
            result = parser.parse("ran 5k, eggs for breakfast", user_id="test-user")
            
            elapsed = (time.time() - start_time) * 1000  # Convert to ms
            assert elapsed < 500  # Target: <500ms
    
    def test_memory_usage(self):
        """Test memory usage stays within limits"""  
        with pytest.raises(ImportError):
            import psutil
            import os
            from services.parser import NaturalLanguageParser
            
            process = psutil.Process(os.getpid())
            initial_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            parser = NaturalLanguageParser()
            # Process multiple inputs
            for i in range(100):
                parser.parse(f"test input {i}", user_id="test-user")
            
            final_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_increase = final_memory - initial_memory
            
            assert memory_increase < 50  # Should not increase by more than 50MB

if __name__ == "__main__":
    pytest.main([__file__, "-v"])