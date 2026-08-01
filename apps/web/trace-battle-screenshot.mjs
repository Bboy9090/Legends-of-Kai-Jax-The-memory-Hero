import { chromium } from 'playwright';
const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
page.setDefaultTimeout(10000);

try {
  await page.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // Click Play Game
  const playBtn = page.locator('button').filter({ hasText: /Play Game/i }).first();
  if (await playBtn.isVisible()) {
    await playBtn.click();
    await page.waitForTimeout(1500);
  }
  
  // Click VERSUS
  const versusBtn = page.locator('button').filter({ hasText: 'VERSUS' }).first();
  if (await versusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await versusBtn.click();
    await page.waitForTimeout(2000);
  }
  
  // Click FIGHT
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fightBtn = buttons.find(b => b.textContent.trim().includes('FIGHT') && b.textContent.length < 20);
    if (fightBtn) {
      const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      fightBtn.dispatchEvent(evt);
    }
  });
  
  await page.waitForTimeout(5000);
  
  // Capture battle arena
  const screenshotPath = '/tmp/versus-arena-loaded.png';
  await page.screenshot({ path: screenshotPath });
  console.log('✅ Screenshot saved to:', screenshotPath);
  
} catch (e) {
  console.error('❌', e.message);
} finally {
  await browser.close();
}
