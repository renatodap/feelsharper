# FeelSharper API Configuration Guide

## AI Provider Setup

### 1. OpenAI (Starter Tier - $4.99/month)

#### Get API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create new secret key
5. Copy and save securely

#### Configuration
```env
OPENAI_API_KEY=sk-proj-...
```

#### Cost Management
- Model: `gpt-3.5-turbo`
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- Monthly budget: $5.00 max

### 2. Anthropic Claude (Pro Tier - $14.99/month)

#### Get API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account
3. Navigate to API Keys
4. Generate new key
5. Copy and save securely

#### Configuration
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### Cost Management
- Model: `claude-3-haiku-20240307`
- Input: $0.00025 per 1K tokens
- Output: $0.00125 per 1K tokens
- Monthly budget: $15.00 max

### 3. Groq (Free Tier - Optional)

#### Get API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Navigate to API Keys
4. Create new key
5. Copy and save

#### Configuration
```env
GROQ_API_KEY=gsk_...
```

#### Rate Limits
- Free tier: 30 requests/minute
- Model: `mixtral-8x7b-32768`
- No cost (free tier)

## API Endpoints

### Authentication

#### Check Auth Status
```http
GET /api/auth/check
```

Response:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tier": "free"
  }
}
```

### Food Tracking

#### Search Foods
```http
GET /api/food/search?q=chicken
```

Response:
```json
{
  "foods": [
    {
      "id": "uuid",
      "name": "Chicken Breast",
      "brand": null,
      "unit": "100g",
      "kcal": 165,
      "protein_g": 31,
      "carbs_g": 0,
      "fat_g": 3.6
    }
  ]
}
```

#### Log Food
```http
POST /api/food/log
Content-Type: application/json

{
  "food_id": "uuid",
  "meal_type": "lunch",
  "quantity": 1.5,
  "logged_at": "2024-01-15T12:00:00Z"
}
```

#### Get Daily Food Logs
```http
GET /api/food/log?date=2024-01-15
```

Response:
```json
{
  "foodLogs": [...],
  "totals": {
    "kcal": 1850,
    "protein_g": 120,
    "carbs_g": 200,
    "fat_g": 65
  }
}
```

### Weight Tracking

#### Log Weight
```http
POST /api/weight
Content-Type: application/json

{
  "weight": 75.5,
  "unit": "kg",
  "logged_at": "2024-01-15T08:00:00Z"
}
```

#### Get Weight History
```http
GET /api/weight?days=30
```

Response:
```json
{
  "weightLogs": [...],
  "stats": {
    "current": 75.5,
    "starting": 77.0,
    "lowest": 75.0,
    "highest": 77.5,
    "change": -1.5,
    "changePercent": -1.95,
    "trend": "down"
  }
}
```

### AI Chat

#### Send Message
```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "What should I eat for lunch?",
  "context": [
    {
      "role": "user",
      "content": "I want to lose weight"
    },
    {
      "role": "assistant",
      "content": "I can help you with healthy meal suggestions..."
    }
  ]
}
```

Response:
```json
{
  "message": "Based on your weight loss goal, here are some healthy lunch options...",
  "usage": {
    "inputTokens": 45,
    "outputTokens": 120,
    "cost": "0.000195",
    "tier": "free"
  }
}
```

#### Rate Limiting
- Free: 10 requests/hour, 100/month
- Starter: 50 requests/hour, 1000/month
- Pro: 100 requests/hour, unlimited/month

### Stripe Payments

#### Create Checkout Session
```http
POST /api/stripe/checkout
Content-Type: application/json

{
  "priceId": "price_starter_monthly",
  "tier": "starter",
  "successUrl": "https://app.feelsharper.com/dashboard?subscription=success",
  "cancelUrl": "https://app.feelsharper.com/pricing"
}
```

Response:
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

## Rate Limiting

### Implementation
```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map();

function checkRateLimit(userId: string, tier: string): boolean {
  const limit = tier === 'free' ? 10 : tier === 'starter' ? 50 : 100;
  const window = 60 * 60 * 1000; // 1 hour
  
  // Check and update counter
  // Return false if limit exceeded
}
```

### Headers
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1705335600
```

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional information",
  "statusCode": 400
}
```

### Common Error Codes
- `AUTH_REQUIRED` - 401: Authentication required
- `RATE_LIMIT_EXCEEDED` - 429: Too many requests
- `QUOTA_EXCEEDED` - 403: Monthly limit reached
- `INVALID_INPUT` - 400: Bad request data
- `NOT_FOUND` - 404: Resource not found
- `SERVER_ERROR` - 500: Internal error

## Testing

### Local Testing with cURL

#### Test Food Search
```bash
curl -X GET "http://localhost:3000/api/food/search?q=apple" \
  -H "Cookie: [auth-cookies]"
```

#### Test AI Chat
```bash
curl -X POST "http://localhost:3000/api/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookies]" \
  -d '{"message": "Hello"}'
```

### Postman Collection
Import the included `feelsharper-api.postman_collection.json` for complete API testing.

## Security Best Practices

1. **API Keys**
   - Never commit to version control
   - Use environment variables
   - Rotate regularly
   - Monitor usage

2. **Rate Limiting**
   - Implement per-user limits
   - Use sliding windows
   - Return proper headers
   - Log violations

3. **Input Validation**
   - Sanitize all inputs
   - Validate data types
   - Check boundaries
   - Prevent injection

4. **Authentication**
   - Verify JWT tokens
   - Check user permissions
   - Log auth failures
   - Implement refresh tokens

## Monitoring

### Metrics to Track
- API response times
- Error rates by endpoint
- AI token usage
- Rate limit violations
- Authentication failures

### Logging
```typescript
// Log all API calls
console.log({
  timestamp: new Date().toISOString(),
  method: request.method,
  path: request.url,
  userId: user?.id,
  statusCode: response.status,
  duration: responseTime
});
```

## Webhook Configuration

### Stripe Webhooks
```typescript
// Verify webhook signature
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Handle events
switch (event.type) {
  case 'customer.subscription.created':
    // Update user tier
    break;
  case 'customer.subscription.deleted':
    // Downgrade to free
    break;
}
```

## Performance Optimization

1. **Caching**
   - Cache food search results (5 min)
   - Cache user profile (1 min)
   - Cache AI responses (optional)

2. **Database**
   - Use connection pooling
   - Optimize queries with indexes
   - Batch operations when possible

3. **API Response**
   - Implement pagination
   - Use field filtering
   - Compress responses
   - Stream large data

## Troubleshooting

### Common Issues

1. **"API key invalid"**
   - Check environment variables
   - Verify key format
   - Check account status

2. **"Rate limit exceeded"**
   - Check tier limits
   - Implement backoff
   - Upgrade plan if needed

3. **"Database connection failed"**
   - Check Supabase status
   - Verify credentials
   - Check connection pool

4. **"AI not responding"**
   - Check API key validity
   - Monitor provider status
   - Check usage quotas

---

For additional support, refer to provider documentation or contact support.