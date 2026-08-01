import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  if (msg.text().includes('[Blocker A Trace]')) {
    console.log(`[TRACE] ${msg.text()}`);
  }
});

try {
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  await page.click('button:has-text("Play Game")');
  await page.waitForTimeout(1000);
  
  for (let i = 0; i < 15; i++) {
    if (await page.locator('button').count() > 0) break;
    await page.waitForTimeout(500);
  }
  
  await page.click('button:has-text("VERSUS")');
  await page.waitForTimeout(1500);
  await page.waitForTimeout(2000);
  
  console.log('=== TEST 1: Normal Playwright click (should fail) ===');
  const btn1 = page.locator('button:has-text("FIGHT")').first();
  await btn1.click().catch(() => null);
  await page.waitForTimeout(500);
  let content = await page.content();
  console.log(`Result: beginMatch invoked = ${content.includes('beginMatch invoked')}`);
  
  // Reload to reset
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Play Game")');
  await page.waitForTimeout(1000);
  for (let i = 0; i < 15; i++) {
    if (await page.locator('button').count() > 0) break;
    await page.waitForTimeout(500);
  }
  await page.click('button:has-text("VERSUS")');
  await page.waitForTimeout(1500);
  await page.waitForTimeout(2000);
  
  console.log('\n=== TEST 2: Hide Canvas then click ===');
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.style.display = 'none';
  });
  await page.waitForTimeout(500);
  
  const btn2 = page.locator('button:has-text("FIGHT")').first();
  await btn2.click().catch(() => null);
  await page.waitForTimeout(500);
  content = await page.content();
  console.log(`Result: beginMatch invoked = ${content.includes('beginMatch invoked')}`);
  
  // Reload
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Play Game")');
  await page.waitForTimeout(1000);
  for (let i = 0; i < 15; i++) {
    if (await page.locator('button').count() > 0) break;
    await page.waitForTimeout(500);
  }
  await page.click('button:has-text("VERSUS")');
  await page.waitForTimeout(1500);
  await page.waitForTimeout(2000);
  
  console.log('\n=== TEST 3: Set Canvas pointer-events: none ===');
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.style.pointerEvents = 'none';
  });
  await page.waitForTimeout(500);
  
  const btn3 = page.locator('button:has-text("FIGHT")').first();
  await btn3.click().catch(() => null);
  await page.waitForTimeout(500);
  content = await page.content();
  console.log(`Result: beginMatch invoked = ${content.includes('beginMatch invoked')}`);
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
