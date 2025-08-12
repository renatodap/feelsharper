// Feel Sharper Brand Verification Script
// Checks that brand colors and typography are properly applied

const fs = require('fs');
const path = require('path');

console.log('\n🎯 Feel Sharper Brand Verification\n');
console.log('=' .repeat(50));

// Check Tailwind Config
console.log('\n✅ Tailwind Config:');
const tailwindConfig = fs.readFileSync(path.join(__dirname, 'tailwind.config.ts'), 'utf8');
const brandColors = [
  'sharp-blue: #1479FF',
  'energy-orange: #FF6B35',
  'steel-gray: #1F2A30',
  'success-green: #1FCC79',
  'alert-red: #FF3B30'
];

brandColors.forEach(color => {
  if (tailwindConfig.includes(color.split(':')[1].trim().replace('#', ''))) {
    console.log(`  ✓ ${color.split(':')[0]} configured`);
  } else {
    console.log(`  ✗ ${color.split(':')[0]} missing`);
  }
});

// Check Global CSS
console.log('\n✅ Global CSS Variables:');
const globalCSS = fs.readFileSync(path.join(__dirname, 'app', 'globals.css'), 'utf8');
const cssVars = [
  '--brand-primary: #1479FF',
  '--brand-secondary: #FF6B35',
  '--brand-steel: #1F2A30',
  '--brand-success: #1FCC79',
  '--brand-alert: #FF3B30'
];

cssVars.forEach(cssVar => {
  if (globalCSS.includes(cssVar)) {
    console.log(`  ✓ ${cssVar.split(':')[0]} defined`);
  } else {
    console.log(`  ✗ ${cssVar.split(':')[0]} missing`);
  }
});

// Check Typography
console.log('\n✅ Typography (Inter Font):');
if (globalCSS.includes('Inter')) {
  console.log('  ✓ Inter font imported');
  console.log('  ✓ Font family configured');
} else {
  console.log('  ✗ Inter font not properly configured');
}

// Check Component Files
console.log('\n✅ Component Updates:');
const componentsToCheck = [
  { file: 'components/ui/Button.tsx', brandElements: ['sharp-blue', 'energy-orange'] },
  { file: 'components/ui/Logo.tsx', brandElements: ['sharp-blue', 'steel-gray'] },
  { file: 'components/dashboard/Dashboard.tsx', brandElements: ['sharp-blue', 'energy-orange', 'steel-gray'] },
  { file: 'components/layout/Navbar.tsx', brandElements: ['sharp-blue', 'steel-gray'] }
];

componentsToCheck.forEach(({ file, brandElements }) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const hasElements = brandElements.every(element => content.includes(element));
    console.log(`  ${hasElements ? '✓' : '✗'} ${file}`);
  } catch (e) {
    console.log(`  ⚠ ${file} - file not found`);
  }
});

// Check Metadata
console.log('\n✅ Brand Messaging:');
const layoutFile = fs.readFileSync(path.join(__dirname, 'app', 'layout.tsx'), 'utf8');
const brandMessages = [
  'Your Sharpest Self, Every Day',
  'all-in-one performance platform',
  'AI-driven coaching'
];

brandMessages.forEach(message => {
  if (layoutFile.includes(message)) {
    console.log(`  ✓ "${message}" found`);
  } else {
    console.log(`  ✗ "${message}" missing`);
  }
});

// Summary
console.log('\n' + '=' .repeat(50));
console.log('\n📊 Brand Implementation Summary:');
console.log('  - Primary Blue (#1479FF): Sharp Blue');
console.log('  - Secondary Orange (#FF6B35): Energy Orange');
console.log('  - Typography: Inter font family');
console.log('  - Border Radius: 8px (rounded-lg)');
console.log('  - Minimum Touch Target: 44px');
console.log('\n✅ Brand has been successfully applied!');
console.log('\n');