import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  if (msg.text().includes('[Blocker A Trace]') || msg.text().includes('gameState')) {
    console.log(`[${msg.type()}] ${msg.text()}`);
  }
});

try {
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Click Play Game
  console.log('Clicking Play Game button...');
  const playGameBtn = page.locator('button').filter({ hasText: /Play Game/i }).first();
  if (await playGameBtn.isVisible()) {
    await playGameBtn.click();
    await page.waitForTimeout(1500);
  }
  
  console.log('\n📋 MENU SCREEN - All buttons:');
  const buttons = await page.locator('button').all();
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    const isVisible = await buttons[i].isVisible();
    const role = await buttons[i].getAttribute('role');
    console.log(`  [${i}] "${text?.trim()}" (visible: ${isVisible}, role: ${role})`);
  }
  
  console.log('\nSearching for text content with VERSUS, TRAINING, FIGHT patterns...');
  const allText = await page.locator('*').first().textContent();
  if (allText.includes('VERSUS')) {
    console.log('✓ VERSUS text found in page');
  } else {
    console.log('✗ VERSUS text NOT found in page');
  }
  
  if (allText.includes('TRAINING')) {
    console.log('✓ TRAINING text found in page');
  } else {
    console.log('✗ TRAINING text NOT found in page');
  }
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/debug-menu.png', fullPage: true });
  console.log('\n📸 Screenshot saved: /tmp/debug-menu.png');
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
