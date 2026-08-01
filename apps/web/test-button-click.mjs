import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  if (msg.text().includes('[Blocker') || msg.text().includes('Fighter')) {
    console.log(`[${msg.type()}] ${msg.text().substring(0, 80)}`);
  }
});

try {
  console.log('Navigate to Versus character select...');
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Navigate to menu
  await page.click('button:has-text("Play Game")');
  await page.waitForTimeout(1000);
  
  // Wait for menu buttons
  let found = false;
  for (let i = 0; i < 15; i++) {
    const count = await page.locator('button').count();
    if (count > 0) {
      found = true;
      break;
    }
    await page.waitForTimeout(500);
  }
  
  if (!found) {
    console.log('Menu never rendered');
    process.exit(1);
  }
  
  // Click VERSUS
  await page.click('button:has-text("VERSUS")');
  await page.waitForTimeout(1500);
  
  // Wait for character select
  await page.waitForTimeout(2000);
  
  console.log('\n=== CHECKING FIGHT BUTTON ===');
  
  // Get button info before click
  const buttonInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fightBtn = buttons.find(b => b.textContent.includes('FIGHT'));
    
    if (!fightBtn) {
      return { found: false, count: buttons.length };
    }
    
    return {
      found: true,
      text: fightBtn.textContent?.substring(0, 30),
      classes: fightBtn.className.substring(0, 60),
      visible: fightBtn.offsetParent !== null,
      pointerEvents: window.getComputedStyle(fightBtn).pointerEvents,
      parentPointerEvents: window.getComputedStyle(fightBtn.parentElement).pointerEvents,
      x: Math.round(fightBtn.getBoundingClientRect().x),
      y: Math.round(fightBtn.getBoundingClientRect().y),
      w: Math.round(fightBtn.getBoundingClientRect().width),
      h: Math.round(fightBtn.getBoundingClientRect().height)
    };
  });
  
  console.log(`Button found: ${buttonInfo.found}`);
  if (buttonInfo.found) {
    console.log(`  Text: "${buttonInfo.text}"`);
    console.log(`  Visible: ${buttonInfo.visible}`);
    console.log(`  Pointer events: ${buttonInfo.pointerEvents}`);
    console.log(`  Parent pointer events: ${buttonInfo.parentPointerEvents}`);
    console.log(`  Position: x=${buttonInfo.x} y=${buttonInfo.y} w=${buttonInfo.w} h=${buttonInfo.h}`);
  } else {
    console.log(`  Total buttons on page: ${buttonInfo.count}`);
  }
  
  // Try clicking multiple ways
  console.log('\n=== TESTING CLICKS ===');
  
  const fightBtn = page.locator('button:has-text("FIGHT")').first();
  
  // Check if button is actually clickable
  const isClickable = await fightBtn.isEnabled().catch(() => false);
  console.log(`Button enabled: ${isClickable}`);
  
  // Try different click methods
  console.log('Attempting click()...');
  await fightBtn.click().catch(e => console.log(`  Error: ${e.message}`));
  
  console.log('Attempting click({ force: true })...');
  await fightBtn.click({ force: true }).catch(e => console.log(`  Error: ${e.message}`));
  
  // Wait and check for handler
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  const hasBeginMatch = content.includes('beginMatch invoked');
  const hasStart = content.includes('After start()');
  const hasSetGameState = content.includes('setGameState("playing")');
  
  console.log(`\n=== HANDLER EXECUTION CHECK ===`);
  console.log(`Handler invoked: ${hasBeginMatch}`);
  console.log(`start() called: ${hasStart}`);
  console.log(`setGameState called: ${hasSetGameState}`);
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
