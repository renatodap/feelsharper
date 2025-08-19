// Test the API endpoint locally
import fetch from 'node-fetch';

async function testEndpoint() {
  const testCases = [
    'weight 175',
    'had eggs for breakfast',
    'ran 5k in 25 minutes',
    'feeling great today',
    'energy 8/10'
  ];
  
  console.log('Testing API Endpoint:');
  console.log('====================\n');
  
  for (const text of testCases) {
    try {
      const response = await fetch('http://localhost:3000/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        console.log(`Input: "${text}"`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText.substring(0, 200)}`);
      } else {
        const result = await response.json();
        console.log(`Input: "${text}"`);
        console.log('Result:', JSON.stringify(result, null, 2));
      }
      console.log('---');
      
    } catch (error) {
      console.log(`Input: "${text}"`);
      console.log('Error:', error.message);
      console.log('---');
    }
  }
}

// Check if server is running
fetch('http://localhost:3000')
  .then(() => {
    console.log('Server is running. Testing endpoint...\n');
    return testEndpoint();
  })
  .catch(() => {
    console.log('Server is not running. Start it with: npm run dev');
  });