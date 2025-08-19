const { OpenAIParser } = require('./lib/ai/services/openai-parser');

async function test() {
  const parser = new OpenAIParser('test-key');
  
  // Test without actual API call - just pattern matching
  const text = 'ran 5k in 25 minutes';
  console.log('Testing:', text);
  
  // Call the private quickPatternMatch via the public parse method
  const result = await parser.parse(text);
  console.log('Result:', result);
}

test().catch(console.error);