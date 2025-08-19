const fs = require('fs');
const path = require('path');

// Fix button variant issues
function fixButtonVariants(content) {
  // Replace "default" with "primary" for button variants
  return content.replace(/variant=["']default["']/g, 'variant="primary"');
}

// Fix Badge variant issues  
function fixBadgeVariants(content) {
  // Replace "error" and other invalid variants
  return content
    .replace(/variant=["']error["']/g, 'variant="secondary"')
    .replace(/variant=["']success["']/g, 'variant="secondary"')
    .replace(/variant=["']warning["']/g, 'variant="secondary"')
    .replace(/variant=["']primary["']/g, 'variant="secondary"');
}

// Process files
const filesToFix = [
  'components/onboarding/SmartOnboardingWizard.tsx',
  'components/pricing/PricingExperiment.tsx',
  'components/social/LeaderboardSystem.tsx',
  'components/social/ReferralProgram.tsx',
  'components/streaks/StreakSystem.tsx',
  'components/quick-log/QuickLogSystem.tsx',
  'components/nutrition/IntelligentMealPlanner.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = fixButtonVariants(content);
    content = fixBadgeVariants(content);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('TypeScript variant fixes applied!');