import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  console.log(`[${msg.type()}] ${msg.text()}`);
});

try {
  console.log('Navigate to app...');
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('\n📋 PAGE CONTENT CHECK:');
  const content = await page.content();
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`\nTotal buttons found: ${buttons.length}`);
  
  for (let i = 0; i < Math.min(buttons.length, 15); i++) {
    const text = await buttons[i].textContent();
    const isVisible = await buttons[i].isVisible();
    console.log(`  [${i}] "${text}" (visible: ${isVisible})`);
  }
  
  // Check for specific text patterns
  console.log('\nSearching for VERSUS text...');
  const versusElements = await page.locator('text=/VERSUS/i').all();
  console.log(`Elements containing "VERSUS": ${versusElements.length}`);
  
  console.log('\nSearching for TRAINING text...');
  const trainingElements = await page.locator('text=/TRAINING/i').all();
  console.log(`Elements containing "TRAINING": ${trainingElements.length}`);
  
  console.log('\nSearching for STORY text...');
  const storyElements = await page.locator('text=/STORY/i').all();
  console.log(`Elements containing "STORY": ${storyElements.length}`);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/debug-page.png', fullPage: true });
  console.log('\n📸 Screenshot saved: /tmp/debug-page.png');
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
