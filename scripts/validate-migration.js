#!/usr/bin/env node

/**
 * Migration Validation Script for FeelSharper MVP Schema Enhancement
 * Validates that the migration SQL is syntactically correct and follows TDD
 * This runs offline validation before applying to the database
 */

const fs = require('fs');
const path = require('path');

/**
 * Validate SQL syntax and structure
 */
function validateSqlSyntax(sqlContent) {
    const issues = [];
    
    // Check for basic SQL syntax issues
    const lines = sqlContent.split('\n');
    let inBlockComment = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;
        
        // Handle block comments
        if (line.includes('/*')) inBlockComment = true;
        if (line.includes('*/')) inBlockComment = false;
        if (inBlockComment || line.startsWith('--') || line.length === 0) continue;
        
        // Check for common SQL issues
        if (line.includes('DROP TABLE') && !line.includes('IF EXISTS')) {
            issues.push(`Line ${lineNum}: DROP TABLE without IF EXISTS may cause errors`);
        }
        
        if (line.includes('ALTER TABLE') && !line.includes('IF NOT EXISTS') && line.includes('ADD COLUMN')) {
            issues.push(`Line ${lineNum}: ALTER TABLE ADD COLUMN without IF NOT EXISTS may cause errors`);
        }
        
        // Check for proper semicolon endings on statements
        if (line.match(/^(CREATE|ALTER|INSERT|UPDATE|DELETE)/i) && !line.includes(';') && !line.endsWith(',')) {
            // Look ahead to see if semicolon is on next few lines
            let foundSemicolon = false;
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                if (lines[j].includes(';')) {
                    foundSemicolon = true;
                    break;
                }
            }
            if (!foundSemicolon) {
                issues.push(`Line ${lineNum}: SQL statement may be missing semicolon`);
            }
        }
    }
    
    return issues;
}

/**
 * Validate TDD compliance
 */
function validateTddCompliance() {
    const issues = [];
    
    // Check if design documents exist
    const designPath = path.join(__dirname, '..', 'docs', 'design', 'database_schema.md');
    if (!fs.existsSync(designPath)) {
        issues.push('Missing TDD design document: docs/design/database_schema.md');
    }
    
    // Check if test documents exist
    const testDesignPath = path.join(__dirname, '..', 'docs', 'testing', 'database_test.md');
    if (!fs.existsSync(testDesignPath)) {
        issues.push('Missing TDD test design: docs/testing/database_test.md');
    }
    
    // Check if test implementation exists
    const testImplPath = path.join(__dirname, '..', 'tests', 'database', 'schema_enhancement_test.sql');
    if (!fs.existsSync(testImplPath)) {
        issues.push('Missing TDD test implementation: tests/database/schema_enhancement_test.sql');
    }
    
    return issues;
}

/**
 * Validate migration file structure
 */
function validateMigrationStructure(sqlContent) {
    const issues = [];
    const requiredSections = [
        'ENHANCED PROFILES TABLE',
        'ENHANCED ACTIVITY LOGS TABLE',
        'NEW INSIGHTS TABLE', 
        'NEW RULE CARDS TABLE',
        'RLS (Row Level Security) POLICIES',
        'INITIAL DATA - CORE RULE CARDS'
    ];
    
    for (const section of requiredSections) {
        if (!sqlContent.includes(section)) {
            issues.push(`Missing required section: ${section}`);
        }
    }
    
    // Check for backward compatibility
    if (!sqlContent.includes('IF NOT EXISTS') && !sqlContent.includes('ADD COLUMN IF NOT EXISTS')) {
        issues.push('Migration may not be backward compatible - missing IF NOT EXISTS checks');
    }
    
    // Check for proper indexing
    if (!sqlContent.includes('CREATE INDEX')) {
        issues.push('Missing performance indexes in migration');
    }
    
    // Check for RLS policies
    if (!sqlContent.includes('ENABLE ROW LEVEL SECURITY')) {
        issues.push('Missing row level security setup');
    }
    
    return issues;
}

/**
 * Validate test file structure
 */
function validateTestStructure(testContent) {
    const issues = [];
    const requiredTestSections = [
        'SCHEMA STRUCTURE TESTS',
        'CONSTRAINT VALIDATION TESTS',
        'PERFORMANCE TESTS',
        'MOCK DATA SETUP'
    ];
    
    for (const section of requiredTestSections) {
        if (!testContent.includes(section)) {
            issues.push(`Missing required test section: ${section}`);
        }
    }
    
    // Check for mock data compliance
    if (!testContent.includes('Mock')) {
        issues.push('Test file should use Mock prefix for test data as per TDD requirements');
    }
    
    // Check for cleanup
    if (!testContent.includes('TEST CLEANUP')) {
        issues.push('Test file missing cleanup section');
    }
    
    return issues;
}

/**
 * Main validation function
 */
async function validateMigration() {
    console.log('🔍 FeelSharper MVP Migration Validation Starting...');
    console.log('📋 Validating TDD compliance and SQL quality\n');
    
    let totalIssues = 0;
    
    // 1. Validate TDD compliance
    console.log('📋 Step 1: TDD Compliance Check');
    const tddIssues = validateTddCompliance();
    if (tddIssues.length > 0) {
        console.log('❌ TDD Compliance Issues:');
        tddIssues.forEach(issue => console.log(`   - ${issue}`));
        totalIssues += tddIssues.length;
    } else {
        console.log('✅ TDD compliance: All required documents present');
    }
    
    // 2. Validate migration file
    console.log('\n📋 Step 2: Migration File Validation');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240904_mvp_schema_enhancement.sql');
    
    if (!fs.existsSync(migrationPath)) {
        console.log('❌ Migration file not found:', migrationPath);
        totalIssues++;
    } else {
        const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
        
        // SQL syntax validation
        const syntaxIssues = validateSqlSyntax(migrationContent);
        if (syntaxIssues.length > 0) {
            console.log('⚠️  SQL Syntax Warnings:');
            syntaxIssues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        // Migration structure validation
        const structureIssues = validateMigrationStructure(migrationContent);
        if (structureIssues.length > 0) {
            console.log('❌ Migration Structure Issues:');
            structureIssues.forEach(issue => console.log(`   - ${issue}`));
            totalIssues += structureIssues.length;
        } else {
            console.log('✅ Migration structure: All required sections present');
        }
    }
    
    // 3. Validate test file
    console.log('\n📋 Step 3: Test File Validation');
    const testPath = path.join(__dirname, '..', 'tests', 'database', 'schema_enhancement_test.sql');
    
    if (!fs.existsSync(testPath)) {
        console.log('❌ Test file not found:', testPath);
        totalIssues++;
    } else {
        const testContent = fs.readFileSync(testPath, 'utf-8');
        
        const testIssues = validateTestStructure(testContent);
        if (testIssues.length > 0) {
            console.log('❌ Test Structure Issues:');
            testIssues.forEach(issue => console.log(`   - ${issue}`));
            totalIssues += testIssues.length;
        } else {
            console.log('✅ Test structure: All required sections present');
        }
    }
    
    // 4. Final summary
    console.log('\n🎯 Validation Summary');
    if (totalIssues === 0) {
        console.log('✅ Migration validation PASSED');
        console.log('✅ Ready for database application');
        console.log('✅ TDD methodology followed correctly');
        console.log('\n📋 Next steps:');
        console.log('  1. Apply migration to development database');
        console.log('  2. Run comprehensive tests');  
        console.log('  3. Validate schema changes');
        console.log('  4. Test API integration');
        
        return true;
    } else {
        console.log(`❌ Migration validation FAILED: ${totalIssues} issues found`);
        console.log('🔧 Fix the above issues before applying migration');
        
        return false;
    }
}

// Execute validation if called directly
if (require.main === module) {
    validateMigration()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Validation error:', error);
            process.exit(1);
        });
}

module.exports = { validateMigration };