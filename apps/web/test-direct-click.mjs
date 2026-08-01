import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  if (msg.text().includes('[Blocker A Trace]') || msg.text().includes('Fighter')) {
    console.log(`[${msg.type()}] ${msg.text().substring(0, 90)}`);
  }
});

try {
  console.log('Navigate and setup...');
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Play Game
  await page.click('button:has-text("Play Game")');
  await page.waitForTimeout(1000);
  
  // Wait for menu
  for (let i = 0; i < 15; i++) {
    if (await page.locator('button').count() > 0) break;
    await page.waitForTimeout(500);
  }
  
  // Click VERSUS
  await page.click('button:has-text("VERSUS")');
  await page.waitForTimeout(1500);
  await page.waitForTimeout(2000);
  
  console.log('\n=== ATTEMPTING DIRECT JAVASCRIPT CLICK ===');
  
  // Try to find and click the FIGHT button using JavaScript
  const result = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fightBtn = buttons.find(b => b.textContent.trim().includes('FIGHT') && b.textContent.length < 20);
    
    if (!fightBtn) {
      return { found: false, buttonCount: buttons.length };
    }
    
    // Try to dispatch click event directly to the button
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    fightBtn.dispatchEvent(clickEvent);
    
    return { 
      found: true, 
      dispatched: true,
      text: fightBtn.textContent.substring(0, 30)
    };
  });
  
  console.log(`JavaScript click result:`, result);
  
  if (result.dispatched) {
    console.log('  ✓ Click event dispatched to button');
  } else if (!result.found) {
    console.log(`  ❌ FIGHT button not found (${result.buttonCount} buttons on page)`);
  }
  
  // Wait for state transitions
  console.log('\nWaiting 3 seconds for state transitions...');
  await page.waitForTimeout(3000);
  
  console.log('\n=== CHECKING RESULTS ===');
  const content = await page.content();
  console.log(`beginMatch invoked: ${content.includes('beginMatch invoked')}`);
  console.log(`After resetPhase: ${content.includes('After resetPhase')}`);
  console.log(`After start(): ${content.includes('After start()')}`);
  console.log(`setGameState("playing"): ${content.includes('setGameState("playing")')}`);
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
