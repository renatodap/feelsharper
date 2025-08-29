# Unified Parse Endpoint Test Design

## Test Requirements

The unified `/api/parse` endpoint must:
1. Accept raw text input and return parsed structured data
2. Support type override and backdating via `occurred_at` field
3. Route to appropriate parser based on content detection
4. Return consistent response format with type, fields, and confidence

## Test Coverage Requirements

### 1. Basic Parsing Tests
- **Test Weight Parsing**
  - Input: "weight 175 lbs"
  - Expected: type='weight', weight=175, unit='lbs', confidence>90

- **Test Food Parsing**  
  - Input: "ate 2 eggs and toast for breakfast"
  - Expected: type='nutrition', foods array with items, confidence>80

- **Test Workout Parsing**
  - Input: "ran 5k in 25 minutes"
  - Expected: type='cardio', activity='ran', distance/duration fields, confidence>80

- **Test Strength Training**
  - Input: "bench press 3 sets of 10 reps at 135 lbs"
  - Expected: type='strength', exercise details, confidence>80

### 2. Type Override Tests
- **Test Manual Type Override**
  - Input: { raw: "175", type: "weight" }
  - Expected: Parses as weight despite ambiguous input

- **Test Override Validation**
  - Input: { raw: "ate pizza", type: "weight" }
  - Expected: Rejects invalid override, parses as food

### 3. Backdating Tests
- **Test occurred_at Field**
  - Input: { raw: "ran 5k", occurred_at: "2024-01-01T10:00:00Z" }
  - Expected: Activity logged with specified timestamp

- **Test Future Date Rejection**
  - Input: { raw: "ran 5k", occurred_at: future date }
  - Expected: Rejects future dates, uses current time

### 4. Mixed Content Tests
- **Test Multiple Activities**
  - Input: "weight 175, ran 5k, ate chicken salad"
  - Expected: Returns array of parsed activities

- **Test Ambiguous Input**
  - Input: "feeling good after workout"
  - Expected: Low confidence, requests clarification

### 5. Error Handling Tests
- **Test Empty Input**
  - Input: ""
  - Expected: 400 error, "Text required"

- **Test Malformed JSON**
  - Input: Invalid JSON
  - Expected: 400 error, proper error message

- **Test Parser Failures**
  - Mock parser failure
  - Expected: 500 error with graceful fallback

## Response Format Specification

```typescript
interface ParseRequest {
  raw: string;           // Required: raw text to parse
  type?: string;         // Optional: force parse as specific type
  occurred_at?: string;  // Optional: ISO timestamp for backdating
}

interface ParseResponse {
  success: boolean;
  type: 'weight' | 'nutrition' | 'cardio' | 'strength' | 'sport' | 'mood' | 'unknown';
  fields: {
    // Type-specific fields
    [key: string]: any;
  };
  confidence: number;  // 0-100
  timestamp: string;   // ISO timestamp (occurred_at or now)
  message?: string;    // User-friendly confirmation
}

interface MultiParseResponse {
  success: boolean;
  activities: ParseResponse[];
}
```

## Mock Requirements

For testing without external dependencies:
- Mock OpenAI API calls
- Mock Supabase database operations
- Mock authentication (test both auth and no-auth modes)

## Test File Structure

```
__tests__/
├── api/
│   └── parse.test.ts         # Main endpoint tests
├── lib/
│   └── parsers/
│       ├── unified.test.ts   # Unified parser logic
│       ├── food.test.ts      # Food parser tests
│       └── workout.test.ts   # Workout parser tests
└── integration/
    └── parse-flow.test.ts    # E2E parsing flow
```

## Coverage Targets
- Line coverage: ≥80%
- Branch coverage: ≥75%
- Function coverage: ≥90%
- All edge cases documented and tested