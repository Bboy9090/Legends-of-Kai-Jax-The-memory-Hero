import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
page.setDefaultTimeout(15000);

const screenshotDir = '/tmp/blocker-a-evidence';
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

try {
  console.log('Loading app...');
  await page.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  console.log('Clicking Play Game...');
  const playBtn = page.locator('button').filter({ hasText: /Play Game/i }).first();
  if (await playBtn.isVisible()) {
    await playBtn.click();
    await page.waitForTimeout(1500);
  }
  
  console.log('Waiting for VERSUS button...');
  let foundVersus = false;
  for (let i = 0; i < 10; i++) {
    const versusBtn = page.locator('button').filter({ hasText: 'VERSUS' }).first();
    if (await versusBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      foundVersus = true;
      break;
    }
    await page.waitForTimeout(500);
  }
  
  if (!foundVersus) {
    console.error('VERSUS button never appeared');
    process.exit(1);
  }
  
  console.log('Clicking VERSUS...');
  const versusBtn = page.locator('button').filter({ hasText: 'VERSUS' }).first();
  await versusBtn.click();
  await page.waitForTimeout(2500);
  
  // Capture character select
  await page.screenshot({ path: `${screenshotDir}/1-character-select.png` });
  console.log('✅ Character select captured');
  
  console.log('Clicking FIGHT...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fightBtn = buttons.find(b => b.textContent.trim().includes('FIGHT') && b.textContent.length < 20);
    if (fightBtn) {
      const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      fightBtn.dispatchEvent(evt);
    }
  });
  
  console.log('Waiting for canvas scene (10 seconds)...');
  await page.waitForTimeout(10000);
  
  // Capture battle arena
  await page.screenshot({ path: `${screenshotDir}/2-battle-arena.png` });
  console.log('✅ Battle arena captured');
  
} catch (e) {
  console.error('❌ Error:', e.message);
  process.exit(1);
} finally {
  await browser.close();
}
