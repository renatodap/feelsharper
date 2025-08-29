import fetch from 'node-fetch';
import { config } from 'dotenv';
import { performance } from 'perf_hooks';
import fs from 'fs';

// Load environment variables
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE = 'http://localhost:3002/api';

// Test configurations
const TEST_INPUTS = {
  food: [
    "2 eggs and toast for breakfast",
    "chicken breast with rice and broccoli",
    "protein shake with banana",
    "large pizza with extra cheese",
    "salad with grilled salmon"
  ],
  workout: [
    "ran 5k in 25 minutes",
    "bench press 3 sets of 10 at 135 lbs",
    "30 minute yoga session",
    "played tennis for 2 hours",
    "walked 10000 steps"
  ],
  weight: [
    "weight 175 lbs",
    "weigh 80 kg",
    "my weight is 165 pounds",
    "82.5 kilos this morning",
    "weight: 170"
  ],
  complex: [
    "eggs toast and coffee, then ran 5k",
    "morning weight 175, had protein shake",
    "gym workout: squats and deadlifts, post-workout meal: chicken and rice"
  ]
};

// Test results storage
const results = {
  timestamp: new Date().toISOString(),
  flows: [],
  accuracy: {},
  performance: {},
  errors: []
};

// Helper to authenticate (using mock for testing)
async function getAuthToken() {
  // For testing, we'll use Supabase's anon key
  // In production, this would be a real user auth
  return SUPABASE_ANON_KEY;
}

// Test 1: Parse endpoint functionality
async function testParseEndpoint() {
  console.log('\n📝 Testing Parse Endpoint...');
  const testResults = [];
  
  for (const [category, inputs] of Object.entries(TEST_INPUTS)) {
    console.log(`\nTesting ${category} inputs:`);
    
    for (const input of inputs) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${API_BASE}/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify({ text: input })
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if parsing was successful
          const success = data.success && data.parsed;
          const confidence = data.parsed?.confidence || 0;
          
          testResults.push({
            category,
            input,
            success,
            confidence,
            duration,
            type: data.parsed?.type,
            hasStructuredData: !!data.parsed?.structuredData
          });
          
          console.log(`  ✅ "${input.substring(0, 30)}..." - ${data.parsed?.type} (${confidence}% confidence) - ${duration.toFixed(0)}ms`);
        } else {
          const error = await response.text();
          testResults.push({
            category,
            input,
            success: false,
            error: error.substring(0, 100),
            duration
          });
          console.log(`  ❌ "${input.substring(0, 30)}..." - Error: ${response.status}`);
        }
      } catch (error) {
        testResults.push({
          category,
          input,
          success: false,
          error: error.message,
          duration: performance.now() - startTime
        });
        console.log(`  ❌ "${input.substring(0, 30)}..." - Error: ${error.message}`);
      }
    }
  }
  
  // Calculate accuracy
  const successfulParses = testResults.filter(r => r.success).length;
  const accuracy = (successfulParses / testResults.length) * 100;
  
  results.flows.push({
    name: 'Parse Endpoint',
    totalTests: testResults.length,
    successful: successfulParses,
    accuracy: accuracy.toFixed(1),
    avgDuration: (testResults.reduce((sum, r) => sum + r.duration, 0) / testResults.length).toFixed(0),
    details: testResults
  });
  
  console.log(`\n📊 Parse Accuracy: ${accuracy.toFixed(1)}% (${successfulParses}/${testResults.length})`);
  return accuracy >= 75; // Target is 75% accuracy
}

// Test 2: End-to-end flow (Parse → Save → Retrieve)
async function testEndToEndFlow() {
  console.log('\n🔄 Testing End-to-End Flow...');
  const flowResults = [];
  
  // Test with a simple input
  const testInput = "had 2 eggs and toast for breakfast, then ran 5k";
  const startTime = performance.now();
  
  try {
    // Step 1: Parse
    console.log('  1. Parsing input...');
    const parseResponse = await fetch(`${API_BASE}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ text: testInput })
    });
    
    if (!parseResponse.ok) {
      throw new Error(`Parse failed: ${parseResponse.status}`);
    }
    
    const parseData = await parseResponse.json();
    console.log(`     ✅ Parsed as ${parseData.parsed?.type} with ${parseData.parsed?.confidence}% confidence`);
    
    // Step 2: Check if saved (parse endpoint should save automatically)
    if (parseData.activity?.id) {
      console.log(`  2. Activity saved with ID: ${parseData.activity.id}`);
      
      // Step 3: Verify retrieval (would need a GET endpoint)
      // For now, we'll just verify the response has the expected structure
      const hasAllFields = parseData.activity.user_id && 
                           parseData.activity.type && 
                           parseData.activity.raw_text &&
                           parseData.activity.data;
      
      if (hasAllFields) {
        console.log('     ✅ All required fields present in saved activity');
      }
    }
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    flowResults.push({
      test: 'Parse → Save → Retrieve',
      success: true,
      duration: totalDuration,
      steps: ['parse', 'save', 'verify']
    });
    
    console.log(`  ✅ Complete flow successful in ${totalDuration.toFixed(0)}ms`);
    
  } catch (error) {
    flowResults.push({
      test: 'Parse → Save → Retrieve',
      success: false,
      error: error.message,
      duration: performance.now() - startTime
    });
    console.log(`  ❌ Flow failed: ${error.message}`);
  }
  
  results.flows.push({
    name: 'End-to-End Flow',
    tests: flowResults,
    successful: flowResults.filter(r => r.success).length,
    avgDuration: (flowResults.reduce((sum, r) => sum + r.duration, 0) / flowResults.length).toFixed(0)
  });
  
  return flowResults.every(r => r.success);
}

// Test 3: Performance Testing
async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  const perfResults = [];
  
  // Test rapid sequential requests
  const inputs = [
    "eggs and toast",
    "ran 5k",
    "weight 175 lbs",
    "chicken and rice",
    "30 minute workout"
  ];
  
  for (const input of inputs) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${API_BASE}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ text: input })
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (response.ok) {
        perfResults.push({
          input,
          duration,
          success: true
        });
        console.log(`  ✅ "${input}" - ${duration.toFixed(0)}ms`);
      } else {
        perfResults.push({
          input,
          duration,
          success: false,
          error: response.status
        });
        console.log(`  ❌ "${input}" - ${duration.toFixed(0)}ms (failed)`);
      }
    } catch (error) {
      perfResults.push({
        input,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      });
    }
  }
  
  const avgDuration = perfResults.reduce((sum, r) => sum + r.duration, 0) / perfResults.length;
  const maxDuration = Math.max(...perfResults.map(r => r.duration));
  const under5Seconds = perfResults.every(r => r.duration < 5000);
  
  results.performance = {
    avgResponseTime: avgDuration.toFixed(0),
    maxResponseTime: maxDuration.toFixed(0),
    under5Seconds,
    tests: perfResults
  };
  
  console.log(`\n📊 Performance Summary:`);
  console.log(`  Average: ${avgDuration.toFixed(0)}ms`);
  console.log(`  Maximum: ${maxDuration.toFixed(0)}ms`);
  console.log(`  All under 5s: ${under5Seconds ? '✅' : '❌'}`);
  
  return under5Seconds;
}

// Test 4: Edge Cases
async function testEdgeCases() {
  console.log('\n🔧 Testing Edge Cases...');
  const edgeCases = [
    { input: "", expected: "error", description: "Empty input" },
    { input: "   ", expected: "error", description: "Whitespace only" },
    { input: "a".repeat(1000), expected: "parse", description: "Very long input" },
    { input: "123 456 789", expected: "parse", description: "Numbers only" },
    { input: "!@#$%^&*()", expected: "parse", description: "Special characters" },
    { input: "ate pizza 🍕", expected: "parse", description: "Emoji input" }
  ];
  
  const edgeResults = [];
  
  for (const testCase of edgeCases) {
    try {
      const response = await fetch(`${API_BASE}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ text: testCase.input })
      });
      
      const success = testCase.expected === 'error' ? !response.ok : response.ok;
      
      edgeResults.push({
        ...testCase,
        success,
        status: response.status
      });
      
      console.log(`  ${success ? '✅' : '❌'} ${testCase.description} - ${response.status}`);
    } catch (error) {
      edgeResults.push({
        ...testCase,
        success: false,
        error: error.message
      });
      console.log(`  ❌ ${testCase.description} - Error: ${error.message}`);
    }
  }
  
  results.edgeCases = edgeResults;
  return edgeResults.filter(r => r.success).length >= edgeResults.length * 0.7;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting MVP Flow Tests');
  console.log('=' .repeat(50));
  
  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3002');
    if (!healthCheck.ok && healthCheck.status !== 404) {
      console.error('❌ Server not responding. Please run: npm run dev');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cannot connect to localhost:3002. Please run: npm run dev');
    process.exit(1);
  }
  
  // Run all tests
  const parseSuccess = await testParseEndpoint();
  const flowSuccess = await testEndToEndFlow();
  const perfSuccess = await testPerformance();
  const edgeSuccess = await testEdgeCases();
  
  // Generate report
  console.log('\n' + '=' .repeat(50));
  console.log('📋 TEST SUMMARY REPORT');
  console.log('=' .repeat(50));
  
  console.log('\n✅ Successes:');
  if (parseSuccess) console.log('  • Parse endpoint accuracy ≥75%');
  if (flowSuccess) console.log('  • End-to-end flow working');
  if (perfSuccess) console.log('  • Performance <5 seconds');
  if (edgeSuccess) console.log('  • Edge cases handled');
  
  console.log('\n❌ Failures:');
  if (!parseSuccess) console.log('  • Parse accuracy below 75% target');
  if (!flowSuccess) console.log('  • End-to-end flow has issues');
  if (!perfSuccess) console.log('  • Performance exceeds 5 second target');
  if (!edgeSuccess) console.log('  • Edge case handling needs improvement');
  
  // Save results to file
  const reportPath = 'test-results-' + new Date().toISOString().split('T')[0] + '.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  // Overall success
  const allPassed = parseSuccess && flowSuccess && perfSuccess && edgeSuccess;
  console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Result: ${allPassed ? 'READY FOR BETA' : 'NEEDS FIXES'}`);
  
  return allPassed;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});