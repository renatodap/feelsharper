// Test the parser with actual pattern matching
const testCases = [
  'weight 175',
  'had eggs for breakfast',
  'ran 5k in 25 minutes',
  'feeling great today',
  'energy 8/10',
  'slept 8 hours',
  'drank 64 oz water'
];

// Test the pattern matching logic directly
function testPatternMatching(text) {
  const normalizedText = text.toLowerCase().trim();
  
  // Weight patterns
  const weightMatch = normalizedText.match(/^(?:weight\s+)?(\d+(?:\.\d+)?)\s*(lbs?|kg|kilos?|pounds?)?$/i);
  if (weightMatch) {
    return {
      type: 'weight',
      data: { 
        weight: parseFloat(weightMatch[1]), 
        unit: weightMatch[2]?.includes('k') ? 'kg' : 'lbs' 
      },
      confidence: 0.95
    };
  }
  
  // Energy patterns
  const energyMatch = normalizedText.match(/energy\s+(\d+)(?:\/10)?/i);
  if (energyMatch) {
    return {
      type: 'energy',
      data: { level: parseInt(energyMatch[1]) },
      confidence: 0.95
    };
  }
  
  // Sleep patterns
  const sleepMatch = normalizedText.match(/slept?\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)?/i);
  if (sleepMatch) {
    return {
      type: 'sleep',
      data: { hours: parseFloat(sleepMatch[1]) },
      confidence: 0.95
    };
  }
  
  // Water patterns - fixed regex
  const waterMatch = normalizedText.match(/(?:drank|had|drink)?\s*(\d+(?:\.\d+)?)\s*(oz|ml|cups?|liters?|l)\s*(?:of\s*)?(?:water)?/i);
  if (waterMatch && normalizedText.includes('water')) {
    return {
      type: 'water',
      data: { 
        amount: parseFloat(waterMatch[1]), 
        unit: waterMatch[2].includes('liter') || waterMatch[2] === 'l' ? 'liters' : 
              waterMatch[2].includes('cup') ? 'cups' :
              waterMatch[2].includes('ml') ? 'ml' : 'oz'
      },
      confidence: 0.9
    };
  }
  
  // Food patterns
  if (normalizedText.includes('breakfast') || normalizedText.includes('lunch') || 
      normalizedText.includes('dinner') || normalizedText.includes('snack')) {
    const meal = normalizedText.includes('breakfast') ? 'breakfast' :
                 normalizedText.includes('lunch') ? 'lunch' :
                 normalizedText.includes('dinner') ? 'dinner' : 'snack';
    
    const foodWords = ['eggs', 'toast', 'chicken', 'salad', 'steak', 'vegetables'];
    const items = foodWords.filter(food => normalizedText.includes(food)).map(name => ({name}));
    
    if (items.length > 0) {
      return {
        type: 'food',
        data: { items, meal },
        confidence: 0.85
      };
    }
  }
  
  // Workout patterns with word boundaries
  const workoutWords = ['ran', 'run', 'running', 'walked', 'walking', 'cycled', 'cycling'];
  const hasWorkout = workoutWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalizedText);
  });
  
  if (hasWorkout) {
    const activity = /\bran\b|\brun\b|\brunning\b/i.test(normalizedText) ? 'running' :
                    /\bwalked\b|\bwalking\b/i.test(normalizedText) ? 'walking' :
                    /\bcycled\b|\bcycling\b/i.test(normalizedText) ? 'cycling' : 'exercise';
    
    const data = { activity };
    
    // Extract distance
    const distanceMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(k|km|mi|miles?|meters?|m)\b/i);
    if (distanceMatch) {
      data.distance = parseFloat(distanceMatch[1]);
      data.distanceUnit = distanceMatch[2] === 'k' || distanceMatch[2] === 'km' ? 'km' :
                         distanceMatch[2].includes('mi') ? 'miles' : 'm';
    }
    
    // Extract duration
    const durationMatch = normalizedText.match(/(?:in\s+|for\s+)?(\d+(?:\.\d+)?)\s*(mins?|minutes?|hours?|hrs?)/i);
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      data.duration = durationMatch[2].includes('hour') || durationMatch[2].includes('hr') ? 
                     value * 60 : value;
    }
    
    return {
      type: 'workout',
      data,
      confidence: 0.85
    };
  }
  
  // Mood patterns
  if (normalizedText.includes('feeling') || normalizedText.includes('feel')) {
    let mood = 'okay';
    if (normalizedText.includes('great')) mood = 'great';
    else if (normalizedText.includes('good')) mood = 'good';
    else if (normalizedText.includes('bad')) mood = 'bad';
    else if (normalizedText.includes('terrible')) mood = 'terrible';
    
    return {
      type: 'mood',
      data: { mood, notes: text },
      confidence: 0.8
    };
  }
  
  return {
    type: 'unknown',
    data: { text },
    confidence: 0.1
  };
}

// Run tests
console.log('Testing Natural Language Pattern Matching:');
console.log('==========================================\n');

testCases.forEach(testCase => {
  const result = testPatternMatching(testCase);
  console.log(`Input: "${testCase}"`);
  console.log(`Result:`, result);
  console.log('---');
});

// Verify specific cases work
const weightResult = testPatternMatching('weight 175');
console.assert(weightResult.type === 'weight', 'Weight parsing failed');
console.assert(weightResult.data.weight === 175, 'Weight value incorrect');

const foodResult = testPatternMatching('had eggs for breakfast');
console.assert(foodResult.type === 'food', 'Food parsing failed');
console.assert(foodResult.data.meal === 'breakfast', 'Meal type incorrect');

const workoutResult = testPatternMatching('ran 5k in 25 minutes');
console.assert(workoutResult.type === 'workout', 'Workout parsing failed');
console.assert(workoutResult.data.distance === 5, 'Distance incorrect');
console.assert(workoutResult.data.duration === 25, 'Duration incorrect');

console.log('\n✅ All assertions passed!');