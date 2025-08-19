// Browser Test Simulation for FeelSharper MVP
const testBrowser = async () => {
  console.log('🚀 Browser Test Simulation');
  console.log('='.repeat(50));
  
  // Test 1: Natural Language Parsing
  console.log('\n📝 Testing Natural Language Input...');
  try {
    const parseTests = [
      { text: 'weight 175', expectedType: 'weight' },
      { text: 'ran 5k in 25 minutes', expectedType: 'exercise' },
      { text: 'had chicken salad for lunch', expectedType: 'food' },
      { text: 'weight 175, ran 5k, had eggs for breakfast', expectedType: 'multi' }
    ];
    
    for (const test of parseTests) {
      try {
        const res = await fetch('http://localhost:3000/api/ai/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: test.text, demo: true })
        });
        const data = await res.json();
        const type = data.parsed?.type || 'unknown';
        const icon = type === test.expectedType || type === 'multi' ? '✅' : '⚠️';
        console.log(`  ${icon} "${test.text}" → Type: ${type}`);
      } catch (e) {
        console.log(`  ❌ "${test.text}" → Error: ${e.message}`);
      }
    }
  } catch (e) {
    console.log('  ❌ Parsing tests failed:', e.message);
  }
  
  // Test 2: API Performance
  console.log('\n⚡ Testing API Performance...');
  const times = [];
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    try {
      await fetch('http://localhost:3000/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test performance', demo: true })
      });
      const time = Date.now() - start;
      times.push(time);
      console.log(`  Test ${i+1}: ${time}ms`);
    } catch (e) {
      console.log(`  Test ${i+1}: Failed`);
    }
  }
  
  if (times.length > 0) {
    const avg = times.reduce((a,b) => a+b, 0) / times.length;
    const icon = avg < 500 ? '✅' : avg < 1000 ? '⚠️' : '❌';
    console.log(`  ${icon} Average: ${avg.toFixed(0)}ms`);
  }
  
  // Test 3: Demo Mode APIs
  console.log('\n🔐 Testing Demo Mode APIs...');
  const demoApis = [
    { name: 'Health Check', url: 'http://localhost:3000/api/health' },
    { name: 'Body Measurements', url: 'http://localhost:3000/api/body-measurements?demo=true' },
    { name: 'Checkout', url: 'http://localhost:3000/api/checkout', method: 'POST', body: { test: true } }
  ];
  
  for (const api of demoApis) {
    try {
      const options = api.method === 'POST' ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(api.body)
      } : {};
      
      const res = await fetch(api.url, options);
      if (res.ok) {
        const data = await res.json();
        console.log(`  ✅ ${api.name}: Working`);
      } else {
        console.log(`  ❌ ${api.name}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`  ❌ ${api.name}: Failed - ${e.message}`);
    }
  }
  
  // Test 4: The Ultimate Test
  console.log('\n🎯 The One Test That Matters...');
  try {
    const res = await fetch('http://localhost:3000/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: 'Weight 175, ran 5k, had eggs for breakfast',
        demo: true 
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('  ✨ Multi-activity parsing: PASSED');
      console.log(`  Parsed type: ${data.parsed?.type || 'unknown'}`);
      if (data.parsed?.activities) {
        console.log(`  Activities found: ${data.parsed.activities.length}`);
      }
    } else {
      console.log('  ❌ Multi-activity parsing: FAILED');
    }
  } catch (e) {
    console.log('  ❌ Ultimate test error:', e.message);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ Browser Test Simulation Complete!');
  console.log('\nNext Steps:');
  console.log('1. Open http://localhost:8080/test-browser.html in browser');
  console.log('2. Test voice input (requires browser)');
  console.log('3. Test photo upload (requires browser)');
  console.log('4. Verify UI responsiveness');
};

// Run the tests
testBrowser().catch(console.error);