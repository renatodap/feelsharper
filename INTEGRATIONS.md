# Feel Sharper Integrations

## Overview

This document outlines the integration strategy, technical implementation, and operational considerations for Feel Sharper's ecosystem of connected apps and devices.

## Integration Philosophy

Every integration must serve at least one of our core objectives:
1. **Habit Loop**: Enable logging → coach insight → action in <90 seconds
2. **Distribution**: Drive viral growth through squads, shares, and challenges
3. **Defensibility**: Create unique data advantages and switching costs

## Provider Matrix

### MUST-SHIP (0-90 days)

#### Apple HealthKit + Apple Watch
- **Scopes**: `HKQuantityTypeIdentifierActiveEnergyBurned`, `HKQuantityTypeIdentifierHeartRate`, `HKCategoryTypeIdentifierSleepAnalysis`, `HKQuantityTypeIdentifierStepCount`
- **Rate Limits**: Device-limited, no API calls
- **Auth**: HealthKit authorization (local)
- **Webhooks**: None (local data)
- **SDK**: HealthKit framework
- **ToS**: Requires usage description in Info.plist

#### Google Fit (Android)
- **Scopes**: `https://www.googleapis.com/auth/fitness.activity.read`, `https://www.googleapis.com/auth/fitness.sleep.read`
- **Rate Limits**: 1,000 requests/day per user
- **Auth**: OAuth 2.0 with PKCE
- **Webhooks**: Yes, via Pub/Sub
- **SDK**: Google Fit REST API
- **ToS**: Standard OAuth compliance

#### Strava
- **Scopes**: `read`, `activity:read_all`
- **Rate Limits**: 600 requests per 15 minutes, 30,000 per day
- **Auth**: OAuth 2.0 with PKCE
- **Webhooks**: Yes, activity updates
- **SDK**: Strava API v3
- **ToS**: No auto-posting without explicit approval

#### Garmin Connect
- **Scopes**: `read` (activities, sleep, stress)
- **Rate Limits**: 200 requests per minute
- **Auth**: OAuth 1.0a (legacy) or OAuth 2.0
- **Webhooks**: Yes, real-time activity updates
- **SDK**: Garmin Connect IQ API
- **ToS**: Requires developer approval for production access

#### Discord
- **Scopes**: Webhook URL only
- **Rate Limits**: 50 requests per second per webhook
- **Auth**: Webhook URL (no OAuth needed)
- **Webhooks**: Outbound only
- **SDK**: Discord.js or direct HTTP
- **ToS**: Bot approval required for >100 servers

### HIGH-ROI NEXT (90-180 days)

#### Oura Cloud
- **Scopes**: `daily`, `heartrate`, `sleep`, `tag`
- **Rate Limits**: 5,000 requests per day
- **Auth**: OAuth 2.0
- **Webhooks**: Yes, data updates
- **SDK**: Oura API v2
- **ToS**: Health data sensitivity requirements

#### Fitbit Web API
- **Scopes**: `activity`, `heartrate`, `sleep`
- **Rate Limits**: 150 requests per hour per user
- **Auth**: OAuth 2.0
- **Webhooks**: Yes, subscription notifications
- **SDK**: Fitbit Web API
- **ToS**: Intraday data requires special approval

#### Open Food Facts
- **Scopes**: Public API (no auth required)
- **Rate Limits**: Reasonable use policy
- **Auth**: API key (optional)
- **Webhooks**: None
- **SDK**: REST API
- **ToS**: Open database, attribution required

## Architecture

### Data Flow

```
External APIs → Ingestion Layer → Normalization → Coach Engine → User Interface
     ↓              ↓               ↓              ↓            ↓
  Raw Events → IngestionEvent → MetricsWorkout → Insights → Dashboard
                    ↓               ↓              ↓
               IdempotencyKey → MetricsSleep → Adaptations
                                   ↓
                              MetricsBiometrics
```

### Security Model

#### OAuth Implementation
- **PKCE**: All OAuth flows use Proof Key for Code Exchange
- **State Parameter**: CSRF protection with timestamp validation
- **Token Storage**: AES-256-GCM encryption at rest
- **Refresh Strategy**: Automatic token refresh with exponential backoff
- **Scope Minimization**: Request only necessary permissions

#### Webhook Security
- **Signature Verification**: HMAC-SHA256 for all webhooks
- **Replay Protection**: Nonce + 5-minute TTL
- **Rate Limiting**: Per-provider limits with exponential backoff
- **Idempotency**: Duplicate event detection via external_id

#### Data Classification
- **PII**: Email, name → encrypted, audit logged
- **Health Data**: Biometrics, sleep → encrypted, retention policy
- **Usage Data**: App interactions → anonymized analytics

### Database Schema

#### Core Tables
- `integration_accounts`: OAuth tokens and provider metadata
- `ingestion_events`: Raw webhook/sync data with deduplication
- `metrics_workouts`: Normalized workout data
- `metrics_sleep`: Normalized sleep data
- `metrics_biometrics`: Normalized biometric data (HR, HRV, etc.)

#### Operational Tables
- `sync_jobs`: Background sync tracking and deduplication
- `webhook_deliveries`: Outbound webhook delivery and retry
- `rate_limits`: Per-provider rate limit tracking

## Implementation Guidelines

### Error Handling
- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s for retries
- **Circuit Breaker**: Disable provider after 5 consecutive failures
- **Graceful Degradation**: App functions without integrations
- **User Communication**: Clear error messages and resolution steps

### Monitoring & Observability
- **Metrics**: Sync success rate, latency, error rate per provider
- **Alerts**: Failed syncs, token expiration, rate limit exceeded
- **Logging**: Structured logs with request IDs and user context
- **Dashboards**: Provider health, user adoption, data volume

### Testing Strategy
- **Contract Tests**: Mock provider responses with fixtures
- **Integration Tests**: Real API calls in staging environment
- **Webhook Tests**: Signature verification and replay protection
- **Load Tests**: Rate limit handling and concurrent users

## Provider-Specific Notes

### Apple HealthKit
- **iOS Only**: Requires native iOS implementation
- **Privacy**: Data never leaves device without explicit user consent
- **Background Sync**: Use HealthKit background delivery
- **Permissions**: Request minimal set, explain usage clearly

### Strava
- **Rate Limits**: Very strict, implement careful queuing
- **Webhooks**: Required for real-time updates
- **Auto-Share**: Must be explicitly opt-in, respect user preferences
- **API Changes**: Monitor developer updates closely

### Garmin
- **Developer Access**: Requires approval for production
- **OAuth 1.0a**: Legacy auth flow, more complex implementation
- **Webhooks**: Most reliable for real-time data
- **Device Variety**: Handle different data formats per device

### Discord
- **Webhook Only**: No OAuth needed for basic functionality
- **Rate Limits**: Generous but enforce to avoid bans
- **Message Format**: Rich embeds for better engagement
- **Server Management**: Handle webhook URL changes gracefully

## Rollout Strategy

### Phase 1: Foundation (Weeks 1-3)
- [ ] Database schema and migrations
- [ ] OAuth utilities and webhook verification
- [ ] Integrations Hub UI
- [ ] Feature flags per provider

### Phase 2: Core Health (Weeks 3-6)
- [ ] HealthKit integration (iOS)
- [ ] Google Fit integration (Android)
- [ ] Background sync jobs
- [ ] Basic error handling and retry logic

### Phase 3: Social & Fitness (Weeks 6-9)
- [ ] Strava OAuth and webhooks
- [ ] Discord webhook delivery
- [ ] Auto-share toggles and preferences
- [ ] Squad integration with Discord

### Phase 4: Advanced (Weeks 9-12)
- [ ] Garmin Connect integration
- [ ] Oura Cloud integration
- [ ] Open Food Facts barcode scanning
- [ ] Advanced analytics and insights

## Success Metrics

### Technical KPIs
- **Sync Success Rate**: >99% for active integrations
- **Sync Latency**: <30 seconds for real-time providers
- **Error Rate**: <1% for API calls
- **Token Refresh Success**: >99.5%

### Business KPIs
- **Integration Adoption**: >60% of users connect at least one device
- **Daily Active Users**: +25% lift from seamless logging
- **Retention**: +15% D7 retention for integrated users
- **Coach Engagement**: +40% insight utilization with rich data

### User Experience KPIs
- **Connection Success**: >95% OAuth completion rate
- **Time to First Sync**: <60 seconds after connection
- **User Satisfaction**: >4.5/5 for integration experience
- **Support Tickets**: <2% of users need integration help

## Compliance & Privacy

### Data Retention
- **Raw Events**: 90 days for debugging, then deleted
- **Normalized Metrics**: Retained per user preference (default 2 years)
- **Tokens**: Deleted immediately upon disconnection
- **Logs**: 30 days for operational, 1 year for security

### User Rights
- **Data Export**: Full integration data in JSON format
- **Data Deletion**: Complete removal within 30 days
- **Consent Management**: Granular permissions per data type
- **Audit Trail**: All data access logged and available to user

### Platform Requirements
- **iOS**: HealthKit usage descriptions in Info.plist
- **Android**: Health Connect permissions and data types
- **GDPR**: Data processing agreements with EU users
- **HIPAA**: Business associate agreements if applicable

## Troubleshooting

### Common Issues
1. **Token Expiration**: Automatic refresh with user notification fallback
2. **Rate Limiting**: Exponential backoff with user-visible sync delays
3. **Webhook Failures**: Retry queue with manual intervention after 24 hours
4. **Data Inconsistencies**: Reconciliation jobs and user data review tools

### Support Runbook
1. **Connection Issues**: Check OAuth flow, verify credentials
2. **Sync Delays**: Review rate limits, check background job status
3. **Missing Data**: Verify provider permissions, check sync cursors
4. **Webhook Problems**: Validate signatures, check endpoint availability

## Future Considerations

### Emerging Platforms
- **Apple Health Records**: Medical data integration (requires special approval)
- **Google Health**: Unified health platform integration
- **Samsung Health**: Android alternative to Google Fit
- **Fitbit Premium**: Enhanced metrics and insights

### Advanced Features
- **Predictive Sync**: ML-based sync scheduling
- **Cross-Platform Correlation**: Insights from multiple data sources
- **Real-Time Coaching**: Live workout adjustments
- **Community Challenges**: Multi-platform competition tracking
