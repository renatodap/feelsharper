// Simple test to verify pattern matching logic
const text = 'ran 5k in 25 minutes';
const normalizedText = text.toLowerCase().trim();

console.log('Testing text:', text);
console.log('Normalized:', normalizedText);

// Test workout detection
const hasWorkoutKeyword = normalizedText.includes('ran') || normalizedText.includes('run') || 
                          normalizedText.includes('walked') || normalizedText.includes('cycled');
console.log('Has workout keyword:', hasWorkoutKeyword);

// Test distance pattern
const distanceMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(k|km|mi|miles?|meters?|m)\b/i);
console.log('Distance match:', distanceMatch);

// Test duration pattern  
const durationMatch = normalizedText.match(/(?:in\s+|for\s+)?(\d+(?:\.\d+)?)\s*(mins?|minutes?|hours?|hrs?)/i);
console.log('Duration match:', durationMatch);

// Test water pattern
const waterText = 'drank 64 oz water';
const waterMatch = waterText.match(/(?:drank|had|drink|water)?\s*(\d+(?:\.\d+)?)\s*(oz|ml|cups?|liters?|l)\s*(?:of\s*)?(?:water)?/i);
console.log('Water match for "drank 64 oz water":', waterMatch);

// Test food pattern
const foodText = 'had eggs and toast for breakfast';
const hasMealKeyword = ['breakfast', 'lunch', 'dinner', 'snack'].some(keyword => foodText.includes(keyword));
console.log('Has meal keyword for "had eggs and toast for breakfast":', hasMealKeyword);