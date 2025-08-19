// Verify the parser works with the required test cases
import { OpenAIParser } from './lib/ai/services/openai-parser.js';

async function verify() {
  const parser = new OpenAIParser('test-key');
  
  const testCases = [
    'weight 175',
    'had eggs for breakfast', 
    'ran 5k',
    'feeling great today',
    'energy 8/10',
    'slept 8 hours',
    'drank 64 oz water'
  ];
  
  console.log('Testing Natural Language Parser:');
  console.log('================================\n');
  
  for (const testCase of testCases) {
    try {
      // Since we're not using actual API, the quickPatternMatch will handle these
      const result = await parser.parse(testCase);
      console.log(`Input: "${testCase}"`);
      console.log(`Type: ${result.type}`);
      console.log(`Data:`, result.data);
      console.log(`Confidence: ${result.confidence}`);
      console.log('---');
    } catch (error) {
      console.log(`Input: "${testCase}"`);
      console.log('Error:', error.message);
      console.log('---');
    }
  }
}

verify().catch(console.error);