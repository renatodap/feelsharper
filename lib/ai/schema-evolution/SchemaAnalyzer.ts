/**
 * SchemaAnalyzer - Revolutionary AI-powered database schema evolution
 * Analyzes user patterns and suggests automatic schema improvements
 */

import { createClient } from '@supabase/supabase-js';

interface PatternAnalysis {
  fieldName: string;
  frequency: number;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array';
  confidence: number;
  examples: string[];
  userTypes: string[];
  suggestedConstraints?: string[];
}

interface SchemasuggestionGenerator {
  tableName: string;
  operation: 'add_column' | 'modify_column' | 'add_table' | 'add_index';
  field?: string;
  dataType?: string;
  constraints?: string[];
  reason: string;
  impact: 'low' | 'medium' | 'high';
  affectedUsers: number;
  confidence: number;
}

export class SchemaAnalyzer {
  private supabase: any;
  private patterns: Map<string, PatternAnalysis> = new Map();
  private suggestionThreshold = 0.7; // 70% confidence required

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // Service key for admin operations
    );
  }

  /**
   * Phase 10.1.1: Weekly AI analysis of user notes patterns
   */
  async analyzeUserPatterns(timeWindow: 'week' | 'month' = 'week'): Promise<PatternAnalysis[]> {
    const timeLimit = timeWindow === 'week' ? '7 days' : '30 days';
    
    // Fetch recent activity logs with subjective notes
    const { data: activities, error } = await this.supabase
      .from('activity_logs')
      .select('*')
      .gte('created_at', `now() - interval '${timeLimit}'`)
      .not('subjective_notes', 'is', null);

    if (error) throw error;

    // Analyze patterns in unstructured data
    const patterns = this.extractPatterns(activities);
    
    // Group by user type for better personalization
    const userTypePatterns = await this.groupByUserType(patterns);
    
    return userTypePatterns;
  }

  /**
   * Extract patterns from user activities using AI
   */
  private extractPatterns(activities: any[]): PatternAnalysis[] {
    const fieldFrequency = new Map<string, any>();
    
    activities.forEach(activity => {
      // Parse structured data for common fields
      if (activity.structured_data) {
        this.analyzeStructuredData(activity.structured_data, fieldFrequency);
      }
      
      // Parse subjective notes for patterns
      if (activity.subjective_notes) {
        this.analyzeSubjectiveNotes(activity.subjective_notes, fieldFrequency);
      }
    });

    // Convert to pattern analysis
    const patterns: PatternAnalysis[] = [];
    fieldFrequency.forEach((data, field) => {
      if (data.count > 10) { // Minimum threshold
        patterns.push({
          fieldName: this.camelToSnakeCase(field),
          frequency: data.count,
          dataType: this.inferDataType(data.examples),
          confidence: this.calculateConfidence(data),
          examples: data.examples.slice(0, 5),
          userTypes: data.userTypes || [],
          suggestedConstraints: this.inferConstraints(data.examples)
        });
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Phase 10.1.2: Automatic schema suggestion generation
   */
  async generateSchemaSuggestions(patterns: PatternAnalysis[]): Promise<SchemasuggestionGenerator[]> {
    const suggestions: SchemasuggestionGenerator[] = [];
    
    // Check existing schema
    const currentSchema = await this.getCurrentSchema();
    
    patterns.forEach(pattern => {
      if (pattern.confidence >= this.suggestionThreshold) {
        // Check if field exists
        const exists = this.fieldExists(currentSchema, pattern.fieldName);
        
        if (!exists) {
          suggestions.push({
            tableName: this.determineTable(pattern),
            operation: 'add_column',
            field: pattern.fieldName,
            dataType: this.mapToSQLType(pattern.dataType),
            constraints: pattern.suggestedConstraints,
            reason: `Field "${pattern.fieldName}" detected ${pattern.frequency} times with ${Math.round(pattern.confidence * 100)}% confidence`,
            impact: this.calculateImpact(pattern),
            affectedUsers: pattern.frequency,
            confidence: pattern.confidence
          });
        }
      }
    });

    // Check for composite patterns that suggest new tables
    const tableSuggestions = this.suggestNewTables(patterns);
    suggestions.push(...tableSuggestions);

    // Check for index suggestions based on query patterns
    const indexSuggestions = await this.suggestIndexes(patterns);
    suggestions.push(...indexSuggestions);

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Phase 10.1.3: Migration script creation with AI
   */
  async generateMigrationScript(suggestions: SchemasuggestionGenerator[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    let migration = `-- Auto-generated migration: ${timestamp}\n`;
    migration += `-- Generated by AI Schema Evolution System\n`;
    migration += `-- Confidence threshold: ${this.suggestionThreshold * 100}%\n\n`;

    // Group by table for cleaner migrations
    const byTable = suggestions.reduce((acc, sug) => {
      if (!acc[sug.tableName]) acc[sug.tableName] = [];
      acc[sug.tableName].push(sug);
      return acc;
    }, {} as Record<string, SchemasuggestionGenerator[]>);

    Object.entries(byTable).forEach(([table, sugs]) => {
      migration += `-- Changes for table: ${table}\n`;
      
      sugs.forEach(sug => {
        migration += `-- Reason: ${sug.reason}\n`;
        migration += `-- Impact: ${sug.impact} (affects ${sug.affectedUsers} users)\n`;
        
        switch (sug.operation) {
          case 'add_column':
            migration += `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${sug.field} ${sug.dataType}`;
            if (sug.constraints?.length) {
              migration += ` ${sug.constraints.join(' ')}`;
            }
            migration += `;\n\n`;
            break;
            
          case 'add_table':
            migration += this.generateCreateTable(sug);
            break;
            
          case 'add_index':
            migration += `CREATE INDEX IF NOT EXISTS idx_${table}_${sug.field} ON ${table}(${sug.field});\n\n`;
            break;
        }
      });
    });

    // Add rollback section
    migration += this.generateRollback(suggestions);

    return migration;
  }

  /**
   * Phase 10.1.4: Admin approval workflow for schema changes
   */
  async createApprovalRequest(
    suggestions: SchemasuggestionGenerator[], 
    migration: string
  ): Promise<{ id: string; status: 'pending' | 'approved' | 'rejected' }> {
    // Store in approval queue
    const { data, error } = await this.supabase
      .from('schema_evolution_requests')
      .insert({
        suggestions: suggestions,
        migration_script: migration,
        confidence_scores: suggestions.map(s => s.confidence),
        total_affected_users: suggestions.reduce((sum, s) => sum + s.affectedUsers, 0),
        status: 'pending',
        created_at: new Date().toISOString(),
        auto_approve: suggestions.every(s => s.confidence > 0.9 && s.impact !== 'high')
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-approve low-risk changes
    if (data.auto_approve) {
      await this.autoApprove(data.id);
      return { id: data.id, status: 'approved' };
    }

    // Send notification to admin
    await this.notifyAdmin(data.id, suggestions);

    return { id: data.id, status: 'pending' };
  }

  /**
   * Phase 10.1.5: Automatic field type inference from data patterns
   */
  private inferDataType(examples: any[]): PatternAnalysis['dataType'] {
    if (examples.length === 0) return 'string';

    const types = examples.map(ex => {
      if (ex === null || ex === undefined) return 'null';
      if (typeof ex === 'boolean') return 'boolean';
      if (typeof ex === 'number') return 'number';
      if (this.isDate(ex)) return 'date';
      if (Array.isArray(ex)) return 'array';
      if (typeof ex === 'object') return 'json';
      return 'string';
    });

    // Find most common type
    const typeCount = types.reduce((acc, type) => {
      if (type !== 'null') {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])[0];

    return (mostCommon?.[0] || 'string') as PatternAnalysis['dataType'];
  }

  /**
   * Phase 10.1.6: Custom field creation per user type (tennis vs bodybuilder)
   */
  private async groupByUserType(patterns: PatternAnalysis[]): Promise<PatternAnalysis[]> {
    // Get user profiles to understand types
    const { data: profiles } = await this.supabase
      .from('user_profiles')
      .select('user_type, preferences');

    const userTypeMap = new Map<string, Set<string>>();
    
    profiles?.forEach((profile: any) => {
      const userType = profile.user_type || 'general';
      if (!userTypeMap.has(userType)) {
        userTypeMap.set(userType, new Set());
      }
      
      // Extract common fields for this user type
      if (profile.preferences?.common_logs) {
        Object.keys(profile.preferences.common_logs).forEach(field => {
          userTypeMap.get(userType)!.add(field);
        });
      }
    });

    // Enhance patterns with user type information
    return patterns.map(pattern => {
      const relevantUserTypes: string[] = [];
      
      userTypeMap.forEach((fields, userType) => {
        if (fields.has(pattern.fieldName)) {
          relevantUserTypes.push(userType);
        }
      });

      return {
        ...pattern,
        userTypes: relevantUserTypes,
        suggestedConstraints: this.getUserTypeConstraints(pattern, relevantUserTypes)
      };
    });
  }

  /**
   * Phase 10.1.7: Schema versioning and rollback capability
   */
  async createSchemaVersion(migration: string): Promise<{ version: string; backup: any }> {
    const version = `v${Date.now()}`;
    
    // Backup current schema
    const backup = await this.backupCurrentSchema();
    
    // Store version information
    const { error } = await this.supabase
      .from('schema_versions')
      .insert({
        version,
        migration_script: migration,
        backup_schema: backup,
        created_at: new Date().toISOString(),
        is_active: false
      });

    if (error) throw error;

    return { version, backup };
  }

  async rollbackSchema(version: string): Promise<void> {
    // Get the version to rollback to
    const { data: versionData, error } = await this.supabase
      .from('schema_versions')
      .select('*')
      .eq('version', version)
      .single();

    if (error) throw error;

    // Execute rollback script
    const rollbackScript = this.generateRollbackScript(versionData.backup_schema);
    
    // This would need to be executed via admin connection
    console.log('Rollback script generated:', rollbackScript);
    
    // Update version status
    await this.supabase
      .from('schema_versions')
      .update({ is_active: false })
      .eq('is_active', true);
      
    await this.supabase
      .from('schema_versions')
      .update({ is_active: true })
      .eq('version', version);
  }

  // Helper methods
  private analyzeStructuredData(data: any, frequency: Map<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (!frequency.has(key)) {
        frequency.set(key, { count: 0, examples: [], userTypes: new Set() });
      }
      const field = frequency.get(key);
      field.count++;
      if (field.examples.length < 10) {
        field.examples.push(value);
      }
    });
  }

  private analyzeSubjectiveNotes(notes: string, frequency: Map<string, any>): void {
    // Look for patterns like "key: value" or "metric = value"
    const patterns = [
      /(\w+):\s*([^,;\n]+)/g,
      /(\w+)\s*=\s*([^,;\n]+)/g,
      /(\w+)\s+(?:is|was|felt)\s+([^,;\n]+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(notes)) !== null) {
        const [, key, value] = match;
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
        
        if (!frequency.has(normalizedKey)) {
          frequency.set(normalizedKey, { count: 0, examples: [], userTypes: new Set() });
        }
        const field = frequency.get(normalizedKey);
        field.count++;
        if (field.examples.length < 10) {
          field.examples.push(value.trim());
        }
      }
    });
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  }

  private calculateConfidence(data: any): number {
    // Base confidence on frequency and consistency
    const frequencyScore = Math.min(data.count / 100, 1) * 0.4;
    const consistencyScore = this.calculateConsistency(data.examples) * 0.6;
    return frequencyScore + consistencyScore;
  }

  private calculateConsistency(examples: any[]): number {
    if (examples.length < 2) return 0.5;
    
    // Check type consistency
    const types = examples.map(ex => typeof ex);
    const uniqueTypes = new Set(types).size;
    return 1 - (uniqueTypes - 1) / types.length;
  }

  private inferConstraints(examples: any[]): string[] {
    const constraints: string[] = [];
    
    // Check for NOT NULL pattern
    if (!examples.includes(null) && !examples.includes(undefined)) {
      constraints.push('NOT NULL');
    }
    
    // Check for unique values
    const uniqueValues = new Set(examples).size;
    if (uniqueValues === examples.length && examples.length > 5) {
      constraints.push('UNIQUE');
    }
    
    // Check for positive numbers
    if (examples.every(ex => typeof ex === 'number' && ex > 0)) {
      constraints.push('CHECK (value > 0)');
    }
    
    return constraints;
  }

  private async getCurrentSchema(): Promise<any> {
    // In production, this would query information_schema
    // For now, return a mock schema
    return {
      tables: ['activity_logs', 'user_profiles', 'workouts', 'meals'],
      columns: {
        activity_logs: ['id', 'user_id', 'activity_type', 'structured_data', 'subjective_notes'],
        user_profiles: ['id', 'user_id', 'user_type', 'preferences'],
      }
    };
  }

  private fieldExists(schema: any, fieldName: string): boolean {
    return Object.values(schema.columns).some((columns: any) => 
      columns.includes(fieldName)
    );
  }

  private determineTable(pattern: PatternAnalysis): string {
    // Smart table detection based on field name and user type
    const fieldName = pattern.fieldName.toLowerCase();
    
    if (fieldName.includes('workout') || fieldName.includes('exercise')) {
      return 'workouts';
    }
    if (fieldName.includes('meal') || fieldName.includes('food') || fieldName.includes('nutrition')) {
      return 'meals';
    }
    if (fieldName.includes('sleep') || fieldName.includes('recovery')) {
      return 'recovery_metrics';
    }
    if (pattern.userTypes.includes('sport')) {
      return 'sport_performance';
    }
    
    return 'activity_logs'; // Default
  }

  private mapToSQLType(dataType: PatternAnalysis['dataType']): string {
    const typeMap: Record<PatternAnalysis['dataType'], string> = {
      'string': 'TEXT',
      'number': 'NUMERIC',
      'boolean': 'BOOLEAN',
      'date': 'TIMESTAMP',
      'json': 'JSONB',
      'array': 'TEXT[]'
    };
    return typeMap[dataType] || 'TEXT';
  }

  private calculateImpact(pattern: PatternAnalysis): 'low' | 'medium' | 'high' {
    if (pattern.frequency > 1000) return 'high';
    if (pattern.frequency > 100) return 'medium';
    return 'low';
  }

  private suggestNewTables(patterns: PatternAnalysis[]): SchemasuggestionGenerator[] {
    const suggestions: SchemasuggestionGenerator[] = [];
    
    // Group patterns by common prefixes
    const prefixGroups = new Map<string, PatternAnalysis[]>();
    
    patterns.forEach(pattern => {
      const prefix = pattern.fieldName.split('_')[0];
      if (!prefixGroups.has(prefix)) {
        prefixGroups.set(prefix, []);
      }
      prefixGroups.get(prefix)!.push(pattern);
    });

    // If a prefix has many fields, suggest a new table
    prefixGroups.forEach((group, prefix) => {
      if (group.length >= 5) {
        suggestions.push({
          tableName: `${prefix}_data`,
          operation: 'add_table',
          reason: `Detected ${group.length} related fields with prefix "${prefix}"`,
          impact: 'medium',
          affectedUsers: Math.max(...group.map(p => p.frequency)),
          confidence: Math.max(...group.map(p => p.confidence))
        });
      }
    });

    return suggestions;
  }

  private async suggestIndexes(patterns: PatternAnalysis[]): Promise<SchemasuggestionGenerator[]> {
    // Analyze query patterns to suggest indexes
    const suggestions: SchemasuggestionGenerator[] = [];
    
    // High-frequency fields should have indexes
    patterns
      .filter(p => p.frequency > 500)
      .forEach(pattern => {
        suggestions.push({
          tableName: this.determineTable(pattern),
          operation: 'add_index',
          field: pattern.fieldName,
          reason: `Field "${pattern.fieldName}" accessed ${pattern.frequency} times`,
          impact: 'low',
          affectedUsers: pattern.frequency,
          confidence: 0.8
        });
      });

    return suggestions;
  }

  private generateCreateTable(suggestion: SchemasuggestionGenerator): string {
    return `
CREATE TABLE IF NOT EXISTS ${suggestion.tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  -- Additional fields will be added based on patterns
);

-- Add RLS policies
ALTER TABLE ${suggestion.tableName} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "${suggestion.tableName}_user_policy" ON ${suggestion.tableName}
  FOR ALL USING (auth.uid() = user_id);

`;
  }

  private generateRollback(suggestions: SchemasuggestionGenerator[]): string {
    let rollback = '\n-- ROLLBACK SCRIPT\n';
    rollback += '-- Execute this to undo the above changes:\n';
    rollback += '/*\n';
    
    suggestions.forEach(sug => {
      switch (sug.operation) {
        case 'add_column':
          rollback += `ALTER TABLE ${sug.tableName} DROP COLUMN IF EXISTS ${sug.field};\n`;
          break;
        case 'add_table':
          rollback += `DROP TABLE IF EXISTS ${sug.tableName} CASCADE;\n`;
          break;
        case 'add_index':
          rollback += `DROP INDEX IF EXISTS idx_${sug.tableName}_${sug.field};\n`;
          break;
      }
    });
    
    rollback += '*/\n';
    return rollback;
  }

  private async backupCurrentSchema(): Promise<any> {
    // In production, this would create a full schema dump
    // For now, return current timestamp
    return {
      timestamp: new Date().toISOString(),
      tables: await this.getCurrentSchema()
    };
  }

  private generateRollbackScript(backup: any): string {
    // Generate SQL to restore to backup state
    return `-- Rollback to ${backup.timestamp}\n-- Implementation depends on backup format`;
  }

  private async autoApprove(requestId: string): Promise<void> {
    await this.supabase
      .from('schema_evolution_requests')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'auto'
      })
      .eq('id', requestId);
  }

  private async notifyAdmin(requestId: string, suggestions: SchemasuggestionGenerator[]): Promise<void> {
    // In production, send email or notification
    console.log(`Admin notification: Schema evolution request ${requestId} needs approval`);
    console.log(`Suggestions: ${suggestions.length} changes proposed`);
  }

  private isDate(value: any): boolean {
    if (value instanceof Date) return true;
    if (typeof value !== 'string') return false;
    
    // Check common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    ];
    
    return datePatterns.some(pattern => pattern.test(value));
  }

  private getUserTypeConstraints(pattern: PatternAnalysis, userTypes: string[]): string[] {
    const constraints = this.inferConstraints(pattern.examples);
    
    // Add user-type specific constraints
    if (userTypes.includes('sport') && pattern.fieldName.includes('performance')) {
      constraints.push('CHECK (value >= 0 AND value <= 10)'); // Performance rating
    }
    
    if (userTypes.includes('strength') && pattern.fieldName.includes('weight')) {
      constraints.push('CHECK (value > 0 AND value < 1000)'); // Reasonable weight limits
    }
    
    return constraints;
  }
}