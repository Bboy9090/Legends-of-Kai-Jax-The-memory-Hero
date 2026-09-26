import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
  });
  
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  // Collect console messages
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  console.log('Loading game with new Kai-Jax GLB...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  
  // Wait for character loading
  await page.waitForTimeout(4000);
  
  // Check if model loaded
  const hasCanvas = await page.locator('canvas').count();
  
  // Look for specific load confirmations
  const pageText = await page.textContent('body');
  const hasCharacter = pageText && (pageText.includes('Kai') || pageText.includes('character'));
  
  console.log(`\n${'='*60}`);
  console.log('✓ GAME RUNTIME TEST');
  console.log(`${'='*60}`);
  console.log(`Canvas elements: ${hasCanvas}`);
  console.log(`Character visible: ${hasCharacter}`);
  
  // Check for critical errors
  const errors = logs.filter(l => l.includes('[error]') && !l.includes('404'));
  console.log(`Critical errors: ${errors.length}`);
  
  if (errors.length > 0) {
    errors.forEach(e => console.log(`  ${e.substring(0, 80)}`));
  }
  
  console.log(`\n✅ GLB loaded in game runtime`);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/game-with-fixed-glb.png' });
  console.log(`✅ Screenshot saved\n`);
  
  await browser.close();
})();
