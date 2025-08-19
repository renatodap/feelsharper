// Test script for API endpoints
const testEndpoints = async () => {
  console.log('Testing FeelSharper API endpoints...\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthRes = await fetch('http://localhost:3000/api/health');
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Natural language parsing (weight)
  console.log('\n2. Testing weight parsing...');
  try {
    const parseRes = await fetch('http://localhost:3000/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'weight 175' })
    });
    
    if (parseRes.ok) {
      const parseData = await parseRes.json();
      console.log('✅ Weight parsing:', parseData);
    } else {
      console.log('❌ Parse failed:', parseRes.status, parseRes.statusText);
      const text = await parseRes.text();
      console.log('Response:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }

  // Test 3: Natural language parsing (food)
  console.log('\n3. Testing food parsing...');
  try {
    const foodRes = await fetch('http://localhost:3000/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'had chicken salad for lunch' })
    });
    
    if (foodRes.ok) {
      const foodData = await foodRes.json();
      console.log('✅ Food parsing:', foodData);
    } else {
      console.log('❌ Parse failed:', foodRes.status, foodRes.statusText);
    }
  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }

  // Test 4: Natural language parsing (exercise)
  console.log('\n4. Testing exercise parsing...');
  try {
    const exerciseRes = await fetch('http://localhost:3000/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'ran 5k in 25 minutes' })
    });
    
    if (exerciseRes.ok) {
      const exerciseData = await exerciseRes.json();
      console.log('✅ Exercise parsing:', exerciseData);
    } else {
      console.log('❌ Parse failed:', exerciseRes.status, exerciseRes.statusText);
    }
  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }

  console.log('\n✨ Testing complete!');
};

testEndpoints();