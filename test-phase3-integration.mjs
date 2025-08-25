#!/usr/bin/env node

/**
 * Phase 3 Integration Test
 * Tests the complete flow: Sign up → Sign in → Parse input → Verify storage
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPhase3() {
  console.log('🧪 Starting Phase 3 Integration Test');
  console.log('================================');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Sign Up
    console.log('\n📝 Test 1: Sign Up Flow');
    await page.goto(`${BASE_URL}/sign-up`);
    await delay(2000);
    
    // Check if sign-up page loaded
    const signUpTitle = await page.$('h1, h2');
    if (signUpTitle) {
      const titleText = await page.evaluate(el => el.textContent, signUpTitle);
      console.log(`  ✓ Sign-up page loaded: "${titleText}"`);
    }
    
    // Fill in sign-up form
    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[type="password"]', TEST_PASSWORD);
    
    // Submit form
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      console.log('  ✓ Sign-up form submitted');
      await delay(3000);
    }
    
    // Check if redirected to dashboard or sign-in
    const currentUrl = page.url();
    console.log(`  → Redirected to: ${currentUrl}`);
    
    // Test 2: Sign In (if needed)
    if (currentUrl.includes('sign-in')) {
      console.log('\n🔐 Test 2: Sign In Flow');
      await page.type('input[type="email"]', TEST_EMAIL);
      await page.type('input[type="password"]', TEST_PASSWORD);
      
      const signInButton = await page.$('button[type="submit"]');
      if (signInButton) {
        await signInButton.click();
        console.log('  ✓ Sign-in form submitted');
        await delay(3000);
      }
    }
    
    // Test 3: Navigate to Today page with natural input
    console.log('\n🎯 Test 3: Natural Language Input');
    await page.goto(`${BASE_URL}/today`);
    await delay(2000);
    
    // Check if natural input component exists
    const inputField = await page.$('input[placeholder*="Type"], textarea[placeholder*="Type"]');
    if (inputField) {
      console.log('  ✓ Natural language input found');
      
      // Type a test input
      await inputField.type('ran 5k in 25 minutes this morning');
      console.log('  ✓ Entered test text: "ran 5k in 25 minutes"');
      
      // Find and click submit button
      const sendButton = await page.$('button svg[class*="Send"], button:has-text("Send"), button:has-text("Log")');
      if (sendButton) {
        await sendButton.click();
        console.log('  ✓ Submitted natural language input');
        await delay(3000);
      }
    } else {
      console.log('  ❌ Natural language input not found');
    }
    
    // Test 4: Check for API calls
    console.log('\n📡 Test 4: API Verification');
    
    // Set up request interception to monitor API calls
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        console.log(`  → API call: ${url} - Status: ${response.status()}`);
      }
    });
    
    // Try another input to see API calls
    const inputField2 = await page.$('input[placeholder*="Type"], textarea[placeholder*="Type"]');
    if (inputField2) {
      await inputField2.type('weight 175 pounds');
      const sendButton2 = await page.$('button svg[class*="Send"], button:has-text("Send"), button:has-text("Log")');
      if (sendButton2) {
        await sendButton2.click();
        await delay(3000);
      }
    }
    
    // Test 5: Check if data appears on page
    console.log('\n📊 Test 5: Data Display Verification');
    const pageContent = await page.content();
    if (pageContent.includes('5k') || pageContent.includes('175')) {
      console.log('  ✓ Parsed data appears on page');
    } else {
      console.log('  ⚠️  Parsed data not visible on page');
    }
    
    console.log('\n✅ Phase 3 Integration Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testPhase3().catch(console.error);