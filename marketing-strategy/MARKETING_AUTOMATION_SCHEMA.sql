-- 🚀 MARKETING AUTOMATION EMPIRE - COMPLETE DATABASE SCHEMA
-- Created: 2025-08-21
-- Purpose: Fully automated marketing system for FeelSharper & Automation Empire
-- Architecture: Multi-tenant, scalable, AI-powered marketing automation

-- ============================================================================
-- CORE BUSINESS & CLIENT MANAGEMENT
-- ============================================================================

-- Companies/Brands being marketed (FeelSharper, client brands, etc.)
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    brand_voice JSONB, -- tone, personality, values, keywords
    visual_identity JSONB, -- colors, fonts, logo_urls, style_guide
    target_market TEXT,
    pricing_strategy JSONB, -- tiers, justification_messaging, competition
    unique_value_props TEXT[],
    competitive_differentiators JSONB,
    brand_guidelines TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing campaigns (product launches, seasonal, ongoing)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- launch, seasonal, evergreen, retention
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed
    start_date DATE,
    end_date DATE,
    budget_allocated DECIMAL(10,2),
    budget_spent DECIMAL(10,2) DEFAULT 0,
    objectives JSONB, -- awareness, conversion, engagement targets
    target_personas UUID[], -- array of persona IDs
    messaging_themes TEXT[],
    success_metrics JSONB,
    results JSONB, -- final campaign results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIENCE & PERSONA MANAGEMENT
-- ============================================================================

-- Target audience personas (endurance athletes, busy professionals, etc.)
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL, -- "Busy Professionals", "Endurance Athletes"
    description TEXT,
    demographics JSONB, -- age, income, location, occupation
    psychographics JSONB, -- values, interests, motivations, pain_points
    behavior_patterns JSONB, -- platform usage, content preferences, purchase behavior
    messaging_preferences JSONB, -- tone, format, frequency, topics
    content_preferences JSONB, -- video vs text, short vs long, humor level
    conversion_triggers TEXT[], -- what motivates action
    objections TEXT[], -- common hesitations
    success_stories TEXT[], -- testimonials, case studies
    primary_platforms VARCHAR(100)[], -- instagram, linkedin, tiktok
    estimated_size INTEGER,
    conversion_rate DECIMAL(5,4) DEFAULT 0, -- historical conversion rate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform-specific audience segments
CREATE TABLE audience_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    persona_id UUID REFERENCES personas(id),
    platform VARCHAR(50), -- instagram, linkedin, youtube, tiktok, twitter
    segment_name VARCHAR(255),
    targeting_criteria JSONB, -- platform-specific targeting options
    audience_size INTEGER,
    engagement_rate DECIMAL(5,4),
    cost_per_engagement DECIMAL(8,4),
    best_posting_times TIME[],
    optimal_frequency VARCHAR(100), -- daily, 3x/week, etc.
    hashtag_strategy TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONTENT STRATEGY & CREATION
-- ============================================================================

-- Content pillars and themes
CREATE TABLE content_pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL, -- "Educational", "Behind the Scenes", "User Stories"
    description TEXT,
    content_percentage INTEGER, -- what % of content should be this pillar
    messaging_angles TEXT[], -- different ways to approach this pillar
    target_personas UUID[], -- which personas this pillar targets
    platforms VARCHAR(50)[], -- which platforms this works best on
    content_types VARCHAR(100)[], -- video, image, carousel, story
    examples TEXT[],
    performance_metrics JSONB, -- historical performance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content templates and formats
CREATE TABLE content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    pillar_id UUID REFERENCES content_pillars(id),
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50),
    content_type VARCHAR(100), -- reel, post, story, youtube_short, linkedin_article
    template_structure JSONB, -- hook, body, cta, visual_elements
    copy_templates TEXT[], -- multiple variations
    visual_guidelines JSONB, -- colors, fonts, layout, imagery_style
    hashtag_templates TEXT[],
    cta_options TEXT[],
    success_rate DECIMAL(5,4), -- how often this template performs well
    last_used TIMESTAMP,
    usage_frequency VARCHAR(50), -- daily, weekly, monthly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-generated content queue
CREATE TABLE content_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    campaign_id UUID REFERENCES campaigns(id),
    template_id UUID REFERENCES content_templates(id),
    persona_id UUID REFERENCES personas(id),
    platform VARCHAR(50),
    content_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'generated', -- generated, approved, scheduled, published, failed
    
    -- Content Data
    title VARCHAR(500),
    copy_text TEXT,
    hashtags TEXT[],
    call_to_action VARCHAR(500),
    visual_description TEXT, -- for AI image generation
    video_script TEXT,
    music_mood VARCHAR(100),
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP,
    
    -- AI Metadata
    ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    generation_prompt TEXT,
    ai_model_used VARCHAR(100),
    generation_cost DECIMAL(8,4),
    
    -- Performance Tracking
    impressions INTEGER DEFAULT 0,
    engagements INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media assets (images, videos, audio)
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_type VARCHAR(50), -- image, video, audio
    file_size INTEGER,
    mime_type VARCHAR(100),
    dimensions JSONB, -- width, height, duration
    
    -- AI Metadata
    ai_generated BOOLEAN DEFAULT false,
    ai_description TEXT,
    ai_tags TEXT[],
    generation_prompt TEXT,
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    performance_score DECIMAL(5,4), -- how well content with this asset performs
    
    -- Organization
    category VARCHAR(100), -- stock, custom, user_generated
    tags TEXT[],
    brand_compliant BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PLATFORM MANAGEMENT & PUBLISHING
-- ============================================================================

-- Social media accounts and platform connections
CREATE TABLE platform_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    platform VARCHAR(50), -- instagram, linkedin, youtube, tiktok, twitter
    account_handle VARCHAR(255),
    account_id VARCHAR(255), -- platform-specific ID
    
    -- API Access
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    api_permissions TEXT[],
    connection_status VARCHAR(50) DEFAULT 'connected',
    
    -- Account Metrics
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    posting_frequency VARCHAR(100),
    best_posting_times TIME[],
    
    -- Platform-Specific Settings
    platform_settings JSONB, -- hashtag limits, character limits, etc.
    auto_publish BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publishing schedule and automation rules
CREATE TABLE publishing_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    platform_account_id UUID REFERENCES platform_accounts(id),
    
    -- Scheduling Rules
    days_of_week INTEGER[], -- 1-7 for Mon-Sun
    posting_times TIME[],
    frequency_per_day INTEGER DEFAULT 1,
    content_pillar_rotation UUID[], -- ordered rotation of pillar IDs
    
    -- Automation Settings
    auto_schedule BOOLEAN DEFAULT true,
    lead_time_hours INTEGER DEFAULT 24, -- how far in advance to schedule
    avoid_conflicts BOOLEAN DEFAULT true,
    optimal_timing BOOLEAN DEFAULT true, -- use AI to optimize timing
    
    -- Content Rules
    min_time_between_posts INTERVAL DEFAULT '4 hours',
    max_daily_posts INTEGER DEFAULT 3,
    content_type_limits JSONB, -- max reels per day, etc.
    
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AI & AUTOMATION MANAGEMENT
-- ============================================================================

-- AI model configurations and prompts
CREATE TABLE ai_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    purpose VARCHAR(100), -- content_generation, image_creation, optimization
    
    -- AI Model Settings
    ai_provider VARCHAR(50), -- openai, anthropic, elevenlabs
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    
    -- Prompts and Instructions
    system_prompt TEXT,
    user_prompt_template TEXT,
    few_shot_examples JSONB,
    
    -- Performance Settings
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER,
    top_p DECIMAL(3,2),
    frequency_penalty DECIMAL(3,2),
    presence_penalty DECIMAL(3,2),
    
    -- Cost and Usage
    cost_per_request DECIMAL(8,4),
    monthly_usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    
    -- Quality Control
    confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
    requires_human_review BOOLEAN DEFAULT false,
    
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation workflows (n8n-style)
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100), -- content_creation, publishing, engagement, analytics
    
    -- Workflow Definition
    trigger_conditions JSONB, -- what starts this workflow
    workflow_steps JSONB, -- ordered array of steps
    error_handling JSONB, -- what to do when steps fail
    
    -- Execution Settings
    schedule_cron VARCHAR(100), -- cron expression for scheduled workflows
    is_active BOOLEAN DEFAULT true,
    max_executions_per_day INTEGER,
    
    -- Performance Tracking
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    avg_execution_time INTERVAL,
    last_executed TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow execution logs
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES automation_workflows(id),
    execution_id VARCHAR(255), -- external system execution ID
    
    status VARCHAR(50), -- running, completed, failed, cancelled
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    execution_time INTERVAL,
    
    -- Execution Details
    input_data JSONB,
    output_data JSONB,
    steps_executed JSONB, -- which steps ran and their results
    error_details JSONB,
    
    -- Resource Usage
    ai_calls_made INTEGER DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    cost_incurred DECIMAL(8,4) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE ANALYTICS & OPTIMIZATION
-- ============================================================================

-- Performance metrics aggregation
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    platform VARCHAR(50),
    metric_date DATE,
    metric_type VARCHAR(100), -- daily, weekly, monthly
    
    -- Engagement Metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagements INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Growth Metrics
    follower_growth INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    unfollows INTEGER DEFAULT 0,
    
    -- Content Performance
    posts_published INTEGER DEFAULT 0,
    avg_likes_per_post DECIMAL(8,2) DEFAULT 0,
    avg_comments_per_post DECIMAL(8,2) DEFAULT 0,
    avg_shares_per_post DECIMAL(8,2) DEFAULT 0,
    top_performing_content_type VARCHAR(100),
    
    -- Business Metrics
    website_traffic INTEGER DEFAULT 0,
    lead_generation INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    revenue_attributed DECIMAL(10,2) DEFAULT 0,
    
    -- Cost Metrics
    ad_spend DECIMAL(10,2) DEFAULT 0,
    organic_reach INTEGER DEFAULT 0,
    paid_reach INTEGER DEFAULT 0,
    cost_per_engagement DECIMAL(8,4) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A/B testing experiments
CREATE TABLE ab_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    campaign_id UUID REFERENCES campaigns(id),
    
    name VARCHAR(255) NOT NULL,
    hypothesis TEXT,
    variable_tested VARCHAR(100), -- copy, visual, timing, cta, hashtags
    
    -- Experiment Setup
    control_version JSONB,
    variant_versions JSONB, -- array of test variants
    traffic_split JSONB, -- percentage allocation
    
    -- Execution
    status VARCHAR(50) DEFAULT 'draft', -- draft, running, completed, cancelled
    start_date DATE,
    end_date DATE,
    min_sample_size INTEGER,
    confidence_level DECIMAL(3,2) DEFAULT 0.95,
    
    -- Results
    results JSONB,
    winning_variant VARCHAR(100),
    statistical_significance BOOLEAN,
    lift_percentage DECIMAL(5,2),
    
    -- Implementation
    implemented BOOLEAN DEFAULT false,
    implementation_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content performance analysis
CREATE TABLE content_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content_queue(id),
    brand_id UUID REFERENCES brands(id),
    platform VARCHAR(50),
    
    -- Performance Data
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagements INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    
    -- Engagement Quality
    positive_sentiment_score DECIMAL(3,2), -- 0-1 scale
    comment_sentiment JSONB, -- breakdown of comment sentiment
    engagement_velocity DECIMAL(8,4), -- engagements per hour
    viral_coefficient DECIMAL(8,4), -- shares/impressions
    
    -- Audience Response
    demographic_performance JSONB, -- performance by age, gender, location
    device_performance JSONB, -- mobile vs desktop
    time_based_performance JSONB, -- performance by hour/day
    
    -- Business Impact
    website_clicks INTEGER DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_attributed DECIMAL(10,2) DEFAULT 0,
    
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMPETITOR & MARKET INTELLIGENCE
-- ============================================================================

-- Competitor tracking
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50), -- startup, small, medium, enterprise
    
    -- Social Presence
    social_handles JSONB, -- platform -> handle mapping
    estimated_followers JSONB, -- platform -> count mapping
    
    -- Competitive Intelligence
    strengths TEXT[],
    weaknesses TEXT[],
    unique_value_props TEXT[],
    pricing_strategy JSONB,
    target_audience TEXT,
    
    -- Monitoring Settings
    track_content BOOLEAN DEFAULT true,
    track_performance BOOLEAN DEFAULT true,
    alert_on_campaigns BOOLEAN DEFAULT false,
    
    last_analyzed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitor content analysis
CREATE TABLE competitor_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID REFERENCES competitors(id),
    platform VARCHAR(50),
    content_url VARCHAR(500),
    content_type VARCHAR(100),
    
    -- Content Details
    title VARCHAR(500),
    description TEXT,
    hashtags TEXT[],
    posting_time TIMESTAMP,
    
    -- Performance (if available)
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    estimated_reach INTEGER,
    
    -- Analysis
    content_themes TEXT[],
    messaging_tone VARCHAR(100),
    call_to_action VARCHAR(500),
    visual_style JSONB,
    
    -- Competitive Intelligence
    innovation_score DECIMAL(3,2), -- how innovative/unique is this content
    threat_level VARCHAR(50), -- low, medium, high
    learnings TEXT, -- what we can learn from this
    
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BUSINESS INTELLIGENCE & REPORTING
-- ============================================================================

-- Custom dashboards and reports
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    dashboard_type VARCHAR(100), -- executive, marketing, content, performance
    
    -- Dashboard Configuration
    widgets JSONB, -- array of widget configurations
    filters JSONB, -- default filters
    date_range VARCHAR(100), -- default date range
    refresh_frequency VARCHAR(50), -- real-time, hourly, daily
    
    -- Access Control
    is_public BOOLEAN DEFAULT false,
    allowed_users UUID[],
    password_protected BOOLEAN DEFAULT false,
    
    -- Automation
    auto_email BOOLEAN DEFAULT false,
    email_schedule VARCHAR(100), -- cron expression
    email_recipients TEXT[],
    
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business goals and KPI tracking
CREATE TABLE business_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- growth, engagement, revenue, brand_awareness
    
    -- Goal Definition
    description TEXT,
    target_value DECIMAL(15,4),
    current_value DECIMAL(15,4) DEFAULT 0,
    unit VARCHAR(50), -- followers, %, dollars, leads
    
    -- Timeline
    start_date DATE,
    target_date DATE,
    
    -- Tracking
    metric_source VARCHAR(100), -- which table/calculation feeds this goal
    calculation_method TEXT, -- how to calculate current value
    update_frequency VARCHAR(50), -- daily, weekly, monthly
    
    -- Progress
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    on_track BOOLEAN DEFAULT true,
    last_updated TIMESTAMP,
    
    -- Alerts
    alert_thresholds JSONB, -- when to send alerts
    stakeholder_emails TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CLIENT MANAGEMENT (FOR AUTOMATION EMPIRE)
-- ============================================================================

-- Automation Empire clients
CREATE TABLE automation_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id), -- links to their brand in main system
    
    -- Client Details
    client_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    
    -- Service Agreement
    service_level VARCHAR(100), -- basic, premium, enterprise
    monthly_fee DECIMAL(10,2),
    setup_fee DECIMAL(10,2),
    contract_start_date DATE,
    contract_end_date DATE,
    payment_status VARCHAR(50) DEFAULT 'active',
    
    -- Service Configuration
    platforms TEXT[], -- which platforms we manage
    content_frequency INTEGER, -- posts per week
    content_types TEXT[], -- reels, posts, stories, etc.
    approval_required BOOLEAN DEFAULT true,
    
    -- Client Preferences
    brand_voice_notes TEXT,
    content_restrictions TEXT[],
    preferred_posting_times TIME[],
    prohibited_topics TEXT[],
    
    -- Performance Commitments
    guaranteed_engagement_rate DECIMAL(5,4),
    guaranteed_growth_rate DECIMAL(5,4),
    
    client_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client billing and invoicing
CREATE TABLE client_billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES automation_clients(id),
    
    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Amounts
    base_fee DECIMAL(10,2),
    additional_services JSONB, -- breakdown of extra charges
    total_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_date DATE,
    payment_method VARCHAR(100),
    
    -- Service Metrics (for billing justification)
    posts_created INTEGER DEFAULT 0,
    engagement_generated INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM ADMINISTRATION & MONITORING
-- ============================================================================

-- System health and monitoring
CREATE TABLE system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Service Status
    ai_services_status JSONB, -- status of each AI provider
    platform_api_status JSONB, -- status of social platform APIs
    database_performance JSONB, -- query times, connection pool
    workflow_engine_status VARCHAR(50),
    
    -- Performance Metrics
    avg_content_generation_time INTERVAL,
    avg_publishing_time INTERVAL,
    daily_api_calls INTEGER DEFAULT 0,
    daily_ai_costs DECIMAL(10,4) DEFAULT 0,
    
    -- Error Tracking
    error_count INTEGER DEFAULT 0,
    critical_errors INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    
    -- Resource Usage
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    storage_usage DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Error logging and debugging
CREATE TABLE system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Error Classification
    error_type VARCHAR(100), -- api_error, ai_error, workflow_error, etc.
    severity VARCHAR(50), -- low, medium, high, critical
    component VARCHAR(100), -- which part of system
    
    -- Error Details
    error_message TEXT,
    error_code VARCHAR(100),
    stack_trace TEXT,
    
    -- Context
    user_id UUID,
    brand_id UUID REFERENCES brands(id),
    request_data JSONB,
    
    -- Resolution
    status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Brand and campaign indexes
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_campaigns_brand_status ON campaigns(brand_id, status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Content and scheduling indexes
CREATE INDEX idx_content_queue_brand_status ON content_queue(brand_id, status);
CREATE INDEX idx_content_queue_scheduled ON content_queue(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_content_queue_platform_date ON content_queue(platform, scheduled_for);

-- Performance tracking indexes
CREATE INDEX idx_performance_metrics_brand_date ON performance_metrics(brand_id, metric_date);
CREATE INDEX idx_content_performance_content_id ON content_performance(content_id);
CREATE INDEX idx_workflow_executions_workflow_status ON workflow_executions(workflow_id, status);

-- Client management indexes
CREATE INDEX idx_automation_clients_status ON automation_clients(client_status);
CREATE INDEX idx_client_billing_status_due ON client_billing(payment_status, due_date);

-- System monitoring indexes
CREATE INDEX idx_system_health_time ON system_health(check_time);
CREATE INDEX idx_system_errors_severity_status ON system_errors(severity, status);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_queue_updated_at BEFORE UPDATE ON content_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_performance_updated_at BEFORE UPDATE ON content_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
    p_likes INTEGER,
    p_comments INTEGER,
    p_shares INTEGER,
    p_impressions INTEGER
) RETURNS DECIMAL(5,4) AS $$
BEGIN
    IF p_impressions > 0 THEN
        RETURN (p_likes + p_comments + p_shares)::DECIMAL / p_impressions::DECIMAL;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update content performance automatically
CREATE OR REPLACE FUNCTION update_content_engagement_rate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_rate = calculate_engagement_rate(
        COALESCE(NEW.likes, 0) + COALESCE(NEW.comments, 0) + COALESCE(NEW.shares, 0),
        0,
        0,
        COALESCE(NEW.impressions, 0)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_engagement_rate_trigger 
BEFORE UPDATE ON content_performance 
FOR EACH ROW EXECUTE FUNCTION update_content_engagement_rate();

-- ============================================================================
-- SAMPLE DATA INSERTS
-- ============================================================================

-- Insert FeelSharper brand
INSERT INTO brands (name, slug, industry, brand_voice, visual_identity, target_market, pricing_strategy, unique_value_props) VALUES
('FeelSharper', 'feelsharper', 'Fitness Technology', 
 '{"tone": "intelligent but accessible", "personality": "sophisticated coach", "values": ["innovation", "personal growth", "authenticity"], "keywords": ["AI", "natural language", "personalized", "revolutionary"]}',
 '{"primary_color": "#1a202c", "accent_color": "#3182ce", "font_primary": "Inter", "style": "dark, focused, premium"}',
 'Ambitious professionals and serious athletes who value time and precision',
 '{"price": 497, "billing": "monthly", "positioning": "premium", "justification": "Personal AI coach for 1/10th cost of human trainer"}',
 ARRAY['Natural language input', 'Voice-first interface', 'Adaptive AI coaching', 'Zero-form tracking']
);

-- Insert sample personas for FeelSharper
INSERT INTO personas (brand_id, name, description, demographics, behavior_patterns, messaging_preferences, primary_platforms) 
SELECT 
    id,
    'Busy Professionals',
    'Time-strapped executives and professionals who want fitness tracking without friction',
    '{"age_range": "28-45", "income": "100k+", "occupation": "executive/professional", "location": "urban"}',
    '{"platform_usage": "LinkedIn heavy, Instagram moderate", "content_preference": "quick tips, efficiency focus", "posting_times": ["7-9am", "12-1pm", "6-7pm"]}',
    '{"tone": "professional", "format": "concise", "frequency": "3-4x per week", "topics": ["productivity", "time management", "ROI of health"]}',
    ARRAY['linkedin', 'instagram']
FROM brands WHERE slug = 'feelsharper';

INSERT INTO personas (brand_id, name, description, demographics, behavior_patterns, messaging_preferences, primary_platforms)
SELECT 
    id,
    'Endurance Athletes',
    'Serious runners, cyclists, triathletes who track detailed training metrics',
    '{"age_range": "25-55", "income": "60k+", "occupation": "varied", "location": "suburban/urban"}',
    '{"platform_usage": "Instagram stories, YouTube for education", "content_preference": "detailed analysis, data-driven", "posting_times": ["6-8am", "7-9pm"]}',
    '{"tone": "knowledgeable", "format": "detailed", "frequency": "daily", "topics": ["training science", "performance optimization", "recovery"]}',
    ARRAY['instagram', 'youtube', 'strava']
FROM brands WHERE slug = 'feelsharper';

-- Insert content pillars for FeelSharper
INSERT INTO content_pillars (brand_id, name, description, content_percentage, messaging_angles, platforms, content_types)
SELECT 
    id,
    'Educational/How-To',
    'Teaching users about AI fitness tracking and natural language benefits',
    40,
    ARRAY['AI explanation', 'Voice logging demos', 'Comparison with traditional apps', 'Tips and tricks'],
    ARRAY['instagram', 'youtube', 'linkedin', 'tiktok'],
    ARRAY['reel', 'video', 'carousel', 'tutorial']
FROM brands WHERE slug = 'feelsharper';

INSERT INTO content_pillars (brand_id, name, description, content_percentage, messaging_angles, platforms, content_types)
SELECT 
    id,
    'User Stories/Testimonials',
    'Real transformation stories and user testimonials',
    25,
    ARRAY['Before/after transformations', 'Busy professional success', 'Athletic performance gains', 'Time savings testimonials'],
    ARRAY['instagram', 'linkedin', 'youtube'],
    ARRAY['reel', 'post', 'story', 'video']
FROM brands WHERE slug = 'feelsharper';

INSERT INTO content_pillars (brand_id, name, description, content_percentage, messaging_angles, platforms, content_types)
SELECT 
    id,
    'Behind the Scenes/Innovation',
    'AI development, founder story, technology advancement',
    20,
    ARRAY['AI training process', 'Founder journey', 'Technology breakthroughs', 'Product development'],
    ARRAY['linkedin', 'twitter', 'youtube'],
    ARRAY['post', 'video', 'article', 'thread']
FROM brands WHERE slug = 'feelsharper';

INSERT INTO content_pillars (brand_id, name, description, content_percentage, messaging_angles, platforms, content_types)
SELECT 
    id,
    'Industry Insights/Trends',
    'Fitness industry analysis and future predictions',
    15,
    ARRAY['Industry disruption', 'AI in fitness', 'Future of health tracking', 'Market analysis'],
    ARRAY['linkedin', 'twitter', 'youtube'],
    ARRAY['article', 'post', 'thread', 'video']
FROM brands WHERE slug = 'feelsharper';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Content performance summary view
CREATE VIEW content_performance_summary AS
SELECT 
    cq.brand_id,
    cq.platform,
    DATE(cq.published_at) as publish_date,
    COUNT(*) as posts_count,
    AVG(cp.engagement_rate) as avg_engagement_rate,
    SUM(cp.impressions) as total_impressions,
    SUM(cp.engagements) as total_engagements,
    SUM(cp.clicks) as total_clicks,
    AVG(cq.ai_confidence_score) as avg_ai_confidence
FROM content_queue cq
LEFT JOIN content_performance cp ON cq.id = cp.content_id
WHERE cq.status = 'published'
GROUP BY cq.brand_id, cq.platform, DATE(cq.published_at);

-- Brand performance dashboard view
CREATE VIEW brand_dashboard AS
SELECT 
    b.id as brand_id,
    b.name as brand_name,
    COUNT(DISTINCT pa.id) as connected_platforms,
    SUM(pa.follower_count) as total_followers,
    AVG(pm.engagement_rate) as avg_engagement_rate,
    SUM(pm.impressions) as total_impressions,
    COUNT(DISTINCT cq.id) as total_content_published,
    AVG(cq.ai_confidence_score) as avg_content_quality
FROM brands b
LEFT JOIN platform_accounts pa ON b.id = pa.brand_id
LEFT JOIN performance_metrics pm ON b.id = pm.brand_id AND pm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN content_queue cq ON b.id = cq.brand_id AND cq.status = 'published'
GROUP BY b.id, b.name;

-- Client revenue view (for Automation Empire)
CREATE VIEW client_revenue_summary AS
SELECT 
    ac.id as client_id,
    ac.client_name,
    ac.monthly_fee,
    COUNT(cb.id) as invoices_sent,
    SUM(CASE WHEN cb.payment_status = 'paid' THEN cb.total_amount ELSE 0 END) as revenue_collected,
    SUM(CASE WHEN cb.payment_status = 'pending' THEN cb.total_amount ELSE 0 END) as revenue_pending,
    AVG(pm.engagement_rate) as avg_engagement_delivered
FROM automation_clients ac
LEFT JOIN client_billing cb ON ac.id = cb.client_id
LEFT JOIN brands b ON ac.brand_id = b.id
LEFT JOIN performance_metrics pm ON b.id = pm.brand_id AND pm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ac.id, ac.client_name, ac.monthly_fee;

-- System health summary view
CREATE VIEW system_health_summary AS
SELECT 
    DATE(check_time) as check_date,
    AVG((ai_services_status->>'overall_health')::integer) as avg_ai_health,
    AVG((platform_api_status->>'overall_health')::integer) as avg_platform_health,
    SUM(daily_api_calls) as total_api_calls,
    SUM(daily_ai_costs) as total_ai_costs,
    SUM(error_count) as total_errors
FROM system_health
GROUP BY DATE(check_time)
ORDER BY check_date DESC;

-- ============================================================================
-- FINAL NOTES
-- ============================================================================

/*
This schema provides:

1. ✅ COMPLETE MARKETING AUTOMATION: Every aspect of content creation, scheduling, publishing, and analysis
2. ✅ MULTI-TENANT: Supports FeelSharper + unlimited Automation Empire clients
3. ✅ AI-POWERED: Full integration for content generation, optimization, and analysis
4. ✅ PERFORMANCE TRACKING: Comprehensive analytics and ROI measurement
5. ✅ SCALABLE: Handles thousands of clients with automated workflows
6. ✅ BUSINESS INTELLIGENCE: Dashboards, reports, and strategic insights

Key Features:
- Persona-based content generation
- Platform-specific optimization
- Automated scheduling and publishing
- Real-time performance tracking
- A/B testing capabilities
- Competitor monitoring
- Client billing and management
- System health monitoring
- Revenue tracking and forecasting

This database can power a complete marketing automation empire that generates
millions in recurring revenue through intelligent, scalable content automation.
*/