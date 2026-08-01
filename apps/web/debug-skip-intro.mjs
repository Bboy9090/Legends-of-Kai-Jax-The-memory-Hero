import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  if (msg.text().includes('[Blocker') || msg.text().includes('battleCanvas')) {
    console.log(`[${msg.type()}] ${msg.text().substring(0, 80)}`);
  }
});

try {
  console.log('Step 1: Navigate to app');
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('Step 2: Click Play Game');
  await page.click('button:has-text("Play Game")');
  await page.waitForTimeout(1000);
  
  console.log('Step 3: Wait for menu to render (checking every 500ms for buttons)');
  let buttonsFound = false;
  let attempts = 0;
  const maxAttempts = 12; // 6 seconds max
  
  while (!buttonsFound && attempts < maxAttempts) {
    const count = await page.locator('button').count();
    console.log(`  Attempt ${attempts + 1}: ${count} buttons found`);
    
    if (count > 0) {
      buttonsFound = true;
      break;
    }
    
    // Try pressing keys to dismiss intro
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await page.keyboard.press('Escape');
    
    await page.waitForTimeout(500);
    attempts++;
  }
  
  if (!buttonsFound) {
    console.log('❌ No buttons found even after waiting');
    // Take screenshot
    await page.screenshot({ path: '/tmp/debug-no-menu.png', fullPage: true });
    
    // Check page content
    const text = await page.locator('body').textContent();
    console.log(`Body text: "${text.substring(0, 100)}"`);
  } else {
    console.log('✓ Buttons found! Menu rendered');
    
    // Now try to find and click VERSUS
    const versusBtn = page.locator('button').filter({ hasText: /VERSUS/ }).first();
    const isVisible = await versusBtn.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (isVisible) {
      console.log('✓ VERSUS button found and visible');
      await versusBtn.click();
      await page.waitForTimeout(1500);
      console.log('✓ VERSUS clicked');
      
      // Check if we're in versus-select
      const content = await page.content();
      const hasCharSelect = content.includes('CHOOSE') || content.includes('Fighter') || content.includes('FIGHT');
      console.log(`Character select visible: ${hasCharSelect}`);
    } else {
      console.log('❌ VERSUS button not visible');
      const allButtons = await page.locator('button').all();
      console.log(`All buttons (${allButtons.length}):`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        console.log(`  [${i}] "${text?.substring(0, 40)}"`);
      }
    }
  }
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
