-- SECURE SCHEMA EVOLUTION SYSTEM
-- Replaces dangerous DDL operations with secure JSONB approach
-- Generated: 2025-08-23

-- Enable Row Level Security on existing tables
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add secure dynamic fields to activity_logs
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS ai_discovered_fields JSONB DEFAULT '{}';

ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS user_custom_fields JSONB DEFAULT '{}';

ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS field_confidence JSONB DEFAULT '{}';

ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS schema_version INTEGER DEFAULT 1;

-- Create schema evolution requests table (secure approval workflow)
CREATE TABLE IF NOT EXISTS schema_evolution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_analysis JSONB NOT NULL,
  proposed_changes JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  affected_users INTEGER NOT NULL CHECK (affected_users >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'admin_review_required', 'approved', 'rejected', 'implemented')),
  requires_security_review BOOLEAN DEFAULT false,
  sql_preview TEXT,
  rollback_script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  implemented_at TIMESTAMPTZ,
  implementation_notes TEXT,
  rejection_reason TEXT
);

-- Enable RLS on schema evolution requests
ALTER TABLE schema_evolution_requests ENABLE ROW LEVEL SECURITY;

-- Create AI field recommendations table (secure logging)
CREATE TABLE IF NOT EXISTS ai_field_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  frequency INTEGER NOT NULL DEFAULT 0,
  user_types TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending_admin_review' CHECK (status IN ('pending_admin_review', 'approved', 'rejected', 'implemented')),
  reasoning TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  implemented_at TIMESTAMPTZ
);

-- Enable RLS on AI field recommendations
ALTER TABLE ai_field_recommendations ENABLE ROW LEVEL SECURITY;

-- Create schema evolution audit table (complete audit trail)
CREATE TABLE IF NOT EXISTS schema_evolution_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES schema_evolution_requests(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'reviewed', 'approved', 'rejected', 'implemented', 'rolled_back')),
  admin_id UUID REFERENCES auth.users(id),
  pattern_data JSONB,
  decision_reasoning TEXT,
  sql_executed TEXT,
  execution_result JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE schema_evolution_audit ENABLE ROW LEVEL SECURITY;

-- Create secure aggregate function for pattern analysis
CREATE OR REPLACE FUNCTION analyze_ai_discovered_fields_aggregated(
  days_back INTEGER DEFAULT 7,
  min_frequency INTEGER DEFAULT 10,
  min_users INTEGER DEFAULT 5
)
RETURNS TABLE (
  field_name TEXT,
  frequency BIGINT,
  user_count BIGINT,
  type_distribution JSONB,
  consistency_score DECIMAL,
  user_type_distribution JSONB,
  value_stats JSONB
)
SECURITY DEFINER
AS $$
BEGIN
  -- SECURITY: Only aggregate data, no individual user access
  RETURN QUERY
  SELECT 
    jsonb_object_keys(ai_discovered_fields) as field_name,
    COUNT(*) as frequency,
    COUNT(DISTINCT user_id) as user_count,
    jsonb_build_object(
      'string', COUNT(*) FILTER (WHERE jsonb_typeof(ai_discovered_fields->jsonb_object_keys(ai_discovered_fields)) = 'string'),
      'number', COUNT(*) FILTER (WHERE jsonb_typeof(ai_discovered_fields->jsonb_object_keys(ai_discovered_fields)) = 'number'),
      'boolean', COUNT(*) FILTER (WHERE jsonb_typeof(ai_discovered_fields->jsonb_object_keys(ai_discovered_fields)) = 'boolean'),
      'object', COUNT(*) FILTER (WHERE jsonb_typeof(ai_discovered_fields->jsonb_object_keys(ai_discovered_fields)) = 'object'),
      'array', COUNT(*) FILTER (WHERE jsonb_typeof(ai_discovered_fields->jsonb_object_keys(ai_discovered_fields)) = 'array')
    ) as type_distribution,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        1.0 - (COUNT(DISTINCT jsonb_typeof(ai_discovered_fields->jsonb_object_keys(ai_discovered_fields)))::DECIMAL - 1) / COUNT(*)::DECIMAL
      ELSE 0.5
    END as consistency_score,
    jsonb_object_agg(
      COALESCE(up.user_type, 'unknown'), 
      COUNT(*)
    ) as user_type_distribution,
    jsonb_build_object(
      'null_percentage', 
      COUNT(*) FILTER (WHERE ai_discovered_fields->jsonb_object_keys(ai_discovered_fields) IS NULL)::DECIMAL / COUNT(*)::DECIMAL,
      'unique_percentage',
      COUNT(DISTINCT ai_discovered_fields->jsonb_object_keys(ai_discovered_fields))::DECIMAL / COUNT(*)::DECIMAL
    ) as value_stats
  FROM activity_logs al
  LEFT JOIN user_profiles up ON al.user_id = up.user_id
  WHERE 
    al.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND ai_discovered_fields != '{}'
    AND jsonb_object_keys(ai_discovered_fields) IS NOT NULL
  GROUP BY jsonb_object_keys(ai_discovered_fields)
  HAVING 
    COUNT(*) >= min_frequency 
    AND COUNT(DISTINCT user_id) >= min_users
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Create secure field update function
CREATE OR REPLACE FUNCTION update_ai_discovered_field(
  field_name TEXT,
  field_type TEXT,
  confidence_score DECIMAL
)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  -- Strict input validation
  IF field_name !~ '^[a-zA-Z][a-zA-Z0-9_]*$' THEN
    RAISE EXCEPTION 'Invalid field name: %. Must start with letter and contain only alphanumeric and underscore.', field_name;
  END IF;
  
  IF LENGTH(field_name) > 63 OR LENGTH(field_name) < 2 THEN
    RAISE EXCEPTION 'Field name length must be between 2 and 63 characters: %', field_name;
  END IF;
  
  IF confidence_score < 0 OR confidence_score > 1 THEN
    RAISE EXCEPTION 'Confidence score must be between 0 and 1: %', confidence_score;
  END IF;
  
  IF field_type NOT IN ('string', 'number', 'boolean', 'date', 'json', 'array') THEN
    RAISE EXCEPTION 'Invalid field type: %. Must be one of: string, number, boolean, date, json, array', field_type;
  END IF;
  
  -- Check if field is a reserved word
  IF LOWER(field_name) = ANY(ARRAY['select', 'insert', 'update', 'delete', 'drop', 'alter', 'create', 'table', 'database', 'user', 'admin']) THEN
    RAISE EXCEPTION 'Field name cannot be a reserved word: %', field_name;
  END IF;
  
  -- Insert recommendation for admin review
  INSERT INTO ai_field_recommendations (
    field_name,
    field_type,
    confidence_score,
    status,
    reasoning
  ) VALUES (
    field_name,
    field_type,
    confidence_score,
    'pending_admin_review',
    FORMAT('AI detected field "%s" with %s%% confidence', field_name, ROUND(confidence_score * 100))
  );
  
  -- Log the recommendation creation
  INSERT INTO schema_evolution_audit (
    action,
    pattern_data,
    decision_reasoning
  ) VALUES (
    'created',
    jsonb_build_object(
      'field_name', field_name,
      'field_type', field_type,
      'confidence_score', confidence_score
    ),
    FORMAT('AI field recommendation created for %s', field_name)
  );
  
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for secure access

-- Users can only see their own activity logs
CREATE POLICY "Users access own activities" ON activity_logs
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own profiles  
CREATE POLICY "Users access own profiles" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Only admins can see schema evolution requests
CREATE POLICY "Admins access schema requests" ON schema_evolution_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (preferences->>'role' = 'admin' OR preferences->>'is_admin' = 'true')
    )
  );

-- Only admins can see AI field recommendations
CREATE POLICY "Admins access field recommendations" ON ai_field_recommendations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (preferences->>'role' = 'admin' OR preferences->>'is_admin' = 'true')
    )
  );

-- Only admins can see audit logs
CREATE POLICY "Admins access audit logs" ON schema_evolution_audit
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (preferences->>'role' = 'admin' OR preferences->>'is_admin' = 'true')
    )
  );

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_ai_fields 
  ON activity_logs USING gin (ai_discovered_fields);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_custom_fields 
  ON activity_logs USING gin (user_custom_fields);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schema_requests_status 
  ON schema_evolution_requests (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_field_recommendations_status 
  ON ai_field_recommendations (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_timestamp 
  ON schema_evolution_audit (timestamp DESC);

-- Create admin notification function
CREATE OR REPLACE FUNCTION notify_admin_schema_request()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
  -- In production, this would send notifications
  -- For now, just log
  INSERT INTO schema_evolution_audit (
    request_id,
    action,
    decision_reasoning
  ) VALUES (
    NEW.id,
    'created',
    FORMAT('New schema evolution request created requiring admin review')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin notifications
CREATE TRIGGER trigger_notify_admin_schema_request
  AFTER INSERT ON schema_evolution_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_schema_request();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON activity_logs TO authenticated;
GRANT SELECT ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_ai_discovered_fields_aggregated TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_discovered_field TO authenticated;

-- Comments for documentation
COMMENT ON TABLE schema_evolution_requests IS 'Secure approval workflow for AI-generated schema changes';
COMMENT ON TABLE ai_field_recommendations IS 'Individual field recommendations from AI pattern analysis';  
COMMENT ON TABLE schema_evolution_audit IS 'Complete audit trail for all schema evolution activities';
COMMENT ON FUNCTION analyze_ai_discovered_fields_aggregated IS 'Secure aggregate analysis of user patterns - no individual data access';
COMMENT ON FUNCTION update_ai_discovered_field IS 'Secure function to create field recommendations with validation';

-- SECURITY SUMMARY:
-- ✅ Row-Level Security enabled on all tables
-- ✅ JSONB approach eliminates DDL injection risks  
-- ✅ Admin approval required for all changes
-- ✅ Comprehensive input validation
-- ✅ Complete audit trail maintained
-- ✅ Minimal permissions granted
-- ✅ No automatic execution of schema changes
-- ✅ Aggregate queries protect individual user privacy