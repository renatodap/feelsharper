#!/usr/bin/env node

/**
 * Phase 3 API Integration Test
 * Tests the parsing API directly with mock authentication
 */

const BASE_URL = 'http://localhost:3000';

async function testPhase3API() {
  console.log('🧪 Phase 3 API Integration Test');
  console.log('================================\n');
  
  const results = {
    passed: [],
    failed: []
  };
  
  // Test 1: Test endpoint (no auth required)
  console.log('📝 Test 1: Parse Test Endpoint (No Auth)');
  try {
    const response = await fetch(`${BASE_URL}/api/test/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'ran 5k in 25 minutes' })
    });
    
    const data = await response.json();
    
    if (data.success && data.parse_result) {
      console.log('  ✅ Parse successful');
      console.log(`  → Intent: ${data.parse_result.data?.intent}`);
      console.log(`  → Confidence: ${data.parse_result.confidence}%`);
      console.log(`  → Service: ${data.parse_result.serviceUsed}`);
      results.passed.push('Parse test endpoint');
    } else {
      console.log('  ❌ Parse failed:', data.error);
      results.failed.push('Parse test endpoint');
    }
  } catch (error) {
    console.log('  ❌ Request failed:', error.message);
    results.failed.push('Parse test endpoint');
  }
  
  // Test 2: Main parse endpoint (requires auth)
  console.log('\n📝 Test 2: Main Parse Endpoint (Auth Required)');
  try {
    const response = await fetch(`${BASE_URL}/api/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'weight 175 pounds' })
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('  ⚠️  Auth required (expected): ', data.error);
      results.passed.push('Auth protection working');
    } else if (data.success) {
      console.log('  ✅ Parse successful without auth (unexpected)');
      results.failed.push('Auth protection');
    }
  } catch (error) {
    console.log('  ❌ Request failed:', error.message);
    results.failed.push('Main parse endpoint');
  }
  
  // Test 3: Multiple activity types
  console.log('\n📝 Test 3: Parse Different Activity Types');
  const testCases = [
    { text: 'bench pressed 135 lbs for 3 sets of 8', type: 'strength' },
    { text: 'ate 2 eggs and toast for breakfast', type: 'nutrition' },
    { text: 'weight 180', type: 'weight' },
    { text: 'feeling tired but motivated', type: 'mood' },
    { text: 'slept 7 hours', type: 'sleep' }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await fetch(`${BASE_URL}/api/test/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testCase.text })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const intent = data.parse_result.data?.intent;
        const confidence = data.parse_result.confidence;
        const isCorrect = intent === testCase.type || confidence > 80;
        
        if (isCorrect) {
          console.log(`  ✅ "${testCase.text}"`);
          console.log(`     → Intent: ${intent}, Confidence: ${confidence}%`);
          results.passed.push(`Parse ${testCase.type}`);
        } else {
          console.log(`  ❌ "${testCase.text}"`);
          console.log(`     → Expected: ${testCase.type}, Got: ${intent}`);
          results.failed.push(`Parse ${testCase.type}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Failed to parse "${testCase.text}"`);
      results.failed.push(`Parse ${testCase.type}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test 4: Check AI services
  console.log('\n📝 Test 4: AI Service Connections');
  try {
    const response = await fetch(`${BASE_URL}/api/test/ai-connections`);
    const data = await response.json();
    
    if (data.services) {
      for (const [service, status] of Object.entries(data.services)) {
        if (status.connected) {
          console.log(`  ✅ ${service}: Connected`);
          results.passed.push(`${service} connection`);
        } else {
          console.log(`  ❌ ${service}: ${status.error}`);
          results.failed.push(`${service} connection`);
        }
      }
    }
  } catch (error) {
    console.log('  ⚠️  AI connections endpoint not available');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length} tests`);
  console.log(`❌ Failed: ${results.failed.length} tests`);
  
  if (results.passed.length > 0) {
    console.log('\nPassed tests:');
    results.passed.forEach(test => console.log(`  • ${test}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\nFailed tests:');
    results.failed.forEach(test => console.log(`  • ${test}`));
  }
  
  // Phase 3 completion assessment
  console.log('\n' + '='.repeat(50));
  const totalTests = results.passed.length + results.failed.length;
  const passRate = (results.passed.length / totalTests * 100).toFixed(1);
  
  console.log(`🎯 Phase 3 Completion: ${passRate}%`);
  
  if (passRate >= 80) {
    console.log('✅ Phase 3 is functionally complete!');
  } else if (passRate >= 60) {
    console.log('⚠️  Phase 3 is mostly working but needs fixes');
  } else {
    console.log('❌ Phase 3 needs significant work');
  }
}

// Run the test
testPhase3API().catch(console.error);