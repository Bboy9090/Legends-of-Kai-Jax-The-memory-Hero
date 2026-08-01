import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
page.setDefaultTimeout(15000);

const resultsDir = '/tmp/blocker-b-ab-after';
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

const logs = [];
page.on('console', msg => {
  const text = msg.text();
  logs.push({ type: msg.type(), text, time: new Date().toISOString() });
  
  if (text.includes('[OptimizedBeastModel] A/B EXPERIMENT')) {
    console.log(`[FORENSIC] ${text}`);
  } else if (text.includes('[OptimizedBeastModel]')) {
    console.log(`[OBM] ${text}`);
  }
});

try {
  console.log('Loading app...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  console.log('Clicking Play Game...');
  const playBtn = page.locator('button').filter({ hasText: /Play Game/i }).first();
  if (await playBtn.isVisible()) {
    await playBtn.click();
    await page.waitForTimeout(1500);
  }
  
  console.log('Waiting for menu...');
  for (let i = 0; i < 10; i++) {
    if (await page.locator('button').filter({ hasText: 'TRAINING' }).isVisible({ timeout: 500 }).catch(() => false)) {
      break;
    }
    await page.waitForTimeout(500);
  }
  
  console.log('Clicking TRAINING...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const trainingBtn = buttons.find(b => b.textContent.includes('TRAINING'));
    if (trainingBtn) {
      const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      trainingBtn.dispatchEvent(evt);
    }
  });
  
  console.log('Waiting for Training arena to load (10 seconds)...');
  await page.waitForTimeout(10000);
  
  console.log('Capturing screenshot...');
  await page.screenshot({ path: `${resultsDir}/training-arena-with-clone.png` });
  console.log('✓ Screenshot saved');
  
  console.log('Capturing console logs...');
  fs.writeFileSync(`${resultsDir}/console-logs.json`, JSON.stringify(logs, null, 2));
  console.log(`✓ Logs saved (${logs.length} messages)`);
  
  const forensicLogs = logs.filter(l => l.text.includes('A/B EXPERIMENT'));
  if (forensicLogs.length > 0) {
    console.log('\n✓ FORENSIC DATA CAPTURED:');
    forensicLogs.forEach(l => console.log(l.text));
  } else {
    console.log('\n⚠ No forensic logs found');
  }
  
} catch (e) {
  console.error('❌ Error:', e.message);
} finally {
  await browser.close();
}
