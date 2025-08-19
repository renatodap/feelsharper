// Comprehensive End-to-End Testing for FeelSharper MVP
const fs = require('fs');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  criticalIssues: [],
  performanceMetrics: {}
};

async function testEndpoint(name, url, options = {}) {
  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✅ ${name}${colors.reset} (${responseTime}ms)`);
      testResults.passed++;
      return { success: true, data, responseTime };
    } else {
      console.log(`${colors.red}❌ ${name}: ${response.status} ${response.statusText}${colors.reset}`);
      testResults.failed++;
      testResults.criticalIssues.push(`${name}: HTTP ${response.status}`);
      return { success: false, status: response.status, responseTime };
    }
  } catch (error) {
    console.log(`${colors.red}❌ ${name}: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.criticalIssues.push(`${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}   FeelSharper MVP Comprehensive Testing Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  // 1. HEALTH & INFRASTRUCTURE
  console.log(`${colors.magenta}📡 Infrastructure Tests${colors.reset}`);
  console.log('-'.repeat(40));
  
  await testEndpoint('Health Check', 'http://localhost:3000/api/health');
  
  // 2. NATURAL LANGUAGE PARSING (Core MVP Feature)
  console.log(`\n${colors.magenta}🧠 Natural Language Parsing Tests${colors.reset}`);
  console.log('-'.repeat(40));
  
  // Weight parsing
  const weightTests = [
    { text: 'weight 175', expected: 'weight' },
    { text: '180 lbs', expected: 'weight' },
    { text: 'I weigh 165 pounds today', expected: 'weight' },
    { text: '72kg', expected: 'weight' }
  ];
  
  for (const test of weightTests) {
    const result = await testEndpoint(
      `Weight: "${test.text}"`,
      'http://localhost:3000/api/ai/parse',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: test.text, demo: true })
      }
    );
    
    if (result.success && result.data.parsed?.type !== test.expected) {
      console.log(`  ${colors.yellow}⚠️  Parsed as ${result.data.parsed?.type} instead of ${test.expected}${colors.reset}`);
      testResults.warnings++;
    }
  }
  
  // Food parsing
  const foodTests = [
    { text: 'had chicken salad for lunch', expected: 'food' },
    { text: 'ate 2 eggs and toast', expected: 'food' },
    { text: 'protein shake', expected: 'food' },
    { text: 'pizza for dinner', expected: 'food' }
  ];
  
  for (const test of foodTests) {
    const result = await testEndpoint(
      `Food: "${test.text}"`,
      'http://localhost:3000/api/ai/parse',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: test.text, demo: true })
      }
    );
    
    if (result.success && result.data.parsed?.type !== test.expected) {
      console.log(`  ${colors.yellow}⚠️  Parsed as ${result.data.parsed?.type} instead of ${test.expected}${colors.reset}`);
      testResults.warnings++;
    }
  }
  
  // Exercise parsing
  const exerciseTests = [
    { text: 'ran 5k in 25 minutes', expected: 'exercise' },
    { text: 'bench press 3x10 @135', expected: 'exercise' },
    { text: '30 minute yoga session', expected: 'exercise' },
    { text: 'walked 10000 steps', expected: 'exercise' }
  ];
  
  for (const test of exerciseTests) {
    const result = await testEndpoint(
      `Exercise: "${test.text}"`,
      'http://localhost:3000/api/ai/parse',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: test.text, demo: true })
      }
    );
    
    if (result.success && result.data.parsed?.type !== test.expected) {
      console.log(`  ${colors.yellow}⚠️  Parsed as ${result.data.parsed?.type} instead of ${test.expected}${colors.reset}`);
      testResults.warnings++;
    }
  }
  
  // 3. DATABASE CONNECTION TEST
  console.log(`\n${colors.magenta}🗄️  Database Connection Tests${colors.reset}`);
  console.log('-'.repeat(40));
  
  // Check if we can access Supabase endpoints
  await testEndpoint('Body Measurements API', 'http://localhost:3000/api/body-measurements');
  await testEndpoint('Body Goals API', 'http://localhost:3000/api/body-goals');
  
  // 4. AUTHENTICATION FLOW
  console.log(`\n${colors.magenta}🔐 Authentication Tests${colors.reset}`);
  console.log('-'.repeat(40));
  
  // Test auth endpoints exist
  const authResult = await testEndpoint(
    'Sign In Page',
    'http://localhost:3000/sign-in',
    { method: 'GET' }
  );
  
  // 5. PAYMENT/SUBSCRIPTION FLOW
  console.log(`\n${colors.magenta}💳 Payment System Tests${colors.reset}`);
  console.log('-'.repeat(40));
  
  await testEndpoint('Checkout API', 'http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: true })
  });
  
  // 6. PERFORMANCE METRICS
  console.log(`\n${colors.magenta}⚡ Performance Metrics${colors.reset}`);
  console.log('-'.repeat(40));
  
  // Test response times for critical endpoints
  const perfTests = [];
  for (let i = 0; i < 5; i++) {
    const result = await testEndpoint(
      `Parse Performance Test ${i + 1}`,
      'http://localhost:3000/api/ai/parse',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'weight 175', demo: true })
      }
    );
    if (result.responseTime) {
      perfTests.push(result.responseTime);
    }
  }
  
  if (perfTests.length > 0) {
    const avgTime = perfTests.reduce((a, b) => a + b, 0) / perfTests.length;
    const maxTime = Math.max(...perfTests);
    const minTime = Math.min(...perfTests);
    
    console.log(`  Average response time: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min/Max: ${minTime}ms / ${maxTime}ms`);
    
    if (avgTime > 1000) {
      console.log(`  ${colors.yellow}⚠️  Response times are slow (>1s average)${colors.reset}`);
      testResults.warnings++;
    }
  }
  
  // 7. CRITICAL USER FLOWS
  console.log(`\n${colors.magenta}🎯 Critical User Flow Tests${colors.reset}`);
  console.log('-'.repeat(40));
  
  // Test the "One Test That Matters" from MVP_TRUTH.md
  const ultimateTest = await testEndpoint(
    'Ultimate Test: Multi-activity parsing',
    'http://localhost:3000/api/ai/parse',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: 'Weight 175, ran 5k, had eggs for breakfast',
        demo: true 
      })
    }
  );
  
  if (ultimateTest.success) {
    console.log(`  ${colors.green}✨ The One Test That Matters: PASSED${colors.reset}`);
  } else {
    console.log(`  ${colors.red}💔 The One Test That Matters: FAILED${colors.reset}`);
    testResults.criticalIssues.push('Ultimate test failed - MVP not ready');
  }
  
  // 8. TEST SUMMARY
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}   Test Results Summary${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  const total = testResults.passed + testResults.failed;
  const passRate = ((testResults.passed / total) * 100).toFixed(1);
  
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings}${colors.reset}`);
  console.log(`📊 Pass Rate: ${passRate}%\n`);
  
  if (testResults.criticalIssues.length > 0) {
    console.log(`${colors.red}🚨 CRITICAL ISSUES FOUND:${colors.reset}`);
    testResults.criticalIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log();
  }
  
  // 9. DEPLOYMENT READINESS
  console.log(`${colors.magenta}🚀 Deployment Readiness Assessment${colors.reset}`);
  console.log('-'.repeat(40));
  
  const readinessScore = calculateReadiness();
  
  if (readinessScore >= 90) {
    console.log(`${colors.green}✅ READY FOR PRODUCTION (${readinessScore}%)${colors.reset}`);
  } else if (readinessScore >= 70) {
    console.log(`${colors.yellow}⚠️  NEEDS MINOR FIXES (${readinessScore}%)${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ NOT READY FOR PRODUCTION (${readinessScore}%)${colors.reset}`);
  }
  
  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    results: testResults,
    readinessScore,
    recommendation: getRecommendation(readinessScore)
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to test-report.json`);
}

function calculateReadiness() {
  const total = testResults.passed + testResults.failed;
  if (total === 0) return 0;
  
  let score = (testResults.passed / total) * 100;
  
  // Deduct points for critical issues
  score -= testResults.criticalIssues.length * 10;
  
  // Deduct points for warnings
  score -= testResults.warnings * 2;
  
  return Math.max(0, Math.min(100, score));
}

function getRecommendation(score) {
  if (score >= 90) {
    return 'Ship it! The MVP is ready for production deployment.';
  } else if (score >= 70) {
    return 'Close to ready. Fix the critical issues and re-test before deploying.';
  } else if (score >= 50) {
    return 'Significant issues found. Needs 1-2 days of focused debugging.';
  } else {
    return 'Major problems detected. The app needs substantial work before production.';
  }
}

// Run the tests
runTests().catch(console.error);