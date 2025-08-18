#!/usr/bin/env node

/**
 * Quality checks for FeelSharper
 * Run before commits to ensure code quality
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ERRORS: string[] = [];
const WARNINGS: string[] = [];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Check for fake data and testimonials
function checkForFakeData() {
  log('\n📊 Checking for fake data...', colors.blue);
  
  const fakeDataPatterns = [
    /Sarah Chen|Mike Rodriguez|Emma Thompson|James Rodriguez|Lisa Chen|David Park/gi,
    /fake.*data|mock.*user|test.*testimonial/gi,
    /Lorem ipsum|dolor sit amet/gi,
    /example@example\.com|test@test\.com/gi,
  ];

  const excludePaths = ['node_modules', '.next', 'dist', '__tests__', '.git'];
  
  function searchFiles(dir: string) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!excludePaths.some(exclude => filePath.includes(exclude))) {
          searchFiles(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        fakeDataPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            ERRORS.push(`Found fake data in ${filePath}: ${matches[0]}`);
          }
        });
      }
    });
  }

  searchFiles(path.join(process.cwd(), 'app'));
  searchFiles(path.join(process.cwd(), 'components'));
  
  if (ERRORS.length === 0) {
    log('✅ No fake data found', colors.green);
  }
}

// Check for white-on-white button issues
function checkButtonContrast() {
  log('\n🎨 Checking button contrast...', colors.blue);
  
  const problematicPatterns = [
    /bg-white.*text-white(?!\/)/g, // white background with white text (not opacity)
    /text-white.*bg-white(?!\/)/g, // white text with white background (not opacity)
    /className=["'].*white.*white.*["']/g, // classNames with double white
  ];

  const excludePaths = ['node_modules', '.next', 'dist', '__tests__', '.git'];
  
  function searchFiles(dir: string) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!excludePaths.some(exclude => filePath.includes(exclude))) {
          searchFiles(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          problematicPatterns.forEach(pattern => {
            const matches = line.match(pattern);
            if (matches) {
              // Check if it's not a false positive (e.g., white/30 opacity)
              if (!line.includes('white/') && !line.includes('hover:')) {
                ERRORS.push(`Poor contrast in ${filePath}:${index + 1} - ${matches[0]}`);
              }
            }
          });
        });
      }
    });
  }

  searchFiles(path.join(process.cwd(), 'app'));
  searchFiles(path.join(process.cwd(), 'components'));
  
  if (ERRORS.filter(e => e.includes('Poor contrast')).length === 0) {
    log('✅ No contrast issues found', colors.green);
  }
}

// Check for navigation issues
function checkNavigation() {
  log('\n🧭 Checking navigation...', colors.blue);
  
  // Check that all pages have proper navigation
  const pagesDir = path.join(process.cwd(), 'app');
  
  function checkPageNavigation(dir: string) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('(') && !file.startsWith('api')) {
        const pageFile = path.join(filePath, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          const content = fs.readFileSync(pageFile, 'utf-8');
          
          // Check for navigation elements
          const hasBackButton = content.includes('ArrowLeft') || content.includes('router.back()');
          const hasHeader = content.includes('SimpleHeader') || content.includes('Header');
          const hasHomeLink = content.includes('href="/"') || content.includes('href="/today"');
          
          if (!hasBackButton && !hasHeader && !hasHomeLink) {
            WARNINGS.push(`Page ${pageFile} might be missing navigation`);
          }
        }
        
        // Recurse into subdirectories
        checkPageNavigation(filePath);
      }
    });
  }
  
  checkPageNavigation(pagesDir);
  
  if (WARNINGS.filter(w => w.includes('navigation')).length === 0) {
    log('✅ Navigation checks passed', colors.green);
  }
}

// Check TypeScript compilation
function checkTypeScript() {
  log('\n📝 Checking TypeScript...', colors.blue);
  
  try {
    execSync('npm run typecheck', { stdio: 'pipe' });
    log('✅ TypeScript checks passed', colors.green);
  } catch (error: any) {
    ERRORS.push('TypeScript compilation failed. Run "npm run typecheck" for details.');
  }
}

// Check ESLint
function checkLinting() {
  log('\n🔍 Checking ESLint...', colors.blue);
  
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    log('✅ ESLint checks passed', colors.green);
  } catch (error: any) {
    WARNINGS.push('ESLint found issues. Run "npm run lint" for details.');
  }
}

// Check for console.log statements
function checkConsoleLogs() {
  log('\n🔇 Checking for console.log statements...', colors.blue);
  
  const excludePaths = ['node_modules', '.next', 'dist', '__tests__', 'scripts', '.git'];
  let consoleCount = 0;
  
  function searchFiles(dir: string) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!excludePaths.some(exclude => filePath.includes(exclude))) {
          searchFiles(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(/console\.(log|debug|info)/g);
        
        if (matches) {
          consoleCount += matches.length;
          WARNINGS.push(`Found ${matches.length} console statements in ${filePath}`);
        }
      }
    });
  }

  searchFiles(path.join(process.cwd(), 'app'));
  searchFiles(path.join(process.cwd(), 'components'));
  
  if (consoleCount === 0) {
    log('✅ No console.log statements found', colors.green);
  }
}

// Check for TODO comments
function checkTodos() {
  log('\n📋 Checking for TODO comments...', colors.blue);
  
  const excludePaths = ['node_modules', '.next', 'dist', '.git'];
  let todoCount = 0;
  
  function searchFiles(dir: string) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!excludePaths.some(exclude => filePath.includes(exclude))) {
          searchFiles(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(/TODO|FIXME|HACK|XXX/g);
        
        if (matches) {
          todoCount += matches.length;
          WARNINGS.push(`Found ${matches.length} TODO/FIXME comments in ${filePath}`);
        }
      }
    });
  }

  searchFiles(path.join(process.cwd(), 'app'));
  searchFiles(path.join(process.cwd(), 'components'));
  
  if (todoCount === 0) {
    log('✅ No TODO comments found', colors.green);
  } else {
    log(`⚠️  Found ${todoCount} TODO comments`, colors.yellow);
  }
}

// Main execution
function main() {
  log('\n🚀 Running FeelSharper Quality Checks...', colors.magenta);
  log('=' .repeat(50), colors.magenta);
  
  checkForFakeData();
  checkButtonContrast();
  checkNavigation();
  checkTypeScript();
  checkLinting();
  checkConsoleLogs();
  checkTodos();
  
  log('\n' + '=' .repeat(50), colors.magenta);
  log('📊 Quality Check Summary', colors.magenta);
  log('=' .repeat(50), colors.magenta);
  
  if (ERRORS.length > 0) {
    log(`\n❌ ${ERRORS.length} ERRORS found:`, colors.red);
    ERRORS.forEach(error => log(`  • ${error}`, colors.red));
  }
  
  if (WARNINGS.length > 0) {
    log(`\n⚠️  ${WARNINGS.length} WARNINGS found:`, colors.yellow);
    WARNINGS.forEach(warning => log(`  • ${warning}`, colors.yellow));
  }
  
  if (ERRORS.length === 0 && WARNINGS.length === 0) {
    log('\n✅ All quality checks passed!', colors.green);
    process.exit(0);
  } else if (ERRORS.length > 0) {
    log('\n❌ Quality checks failed. Please fix errors before committing.', colors.red);
    process.exit(1);
  } else {
    log('\n⚠️  Quality checks passed with warnings.', colors.yellow);
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { checkForFakeData, checkButtonContrast, checkNavigation };