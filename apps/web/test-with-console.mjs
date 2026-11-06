import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  let logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    logs.push(`[ERROR] ${err}`);
  });

  try {
    await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('Browser console logs:');
    logs.forEach(log => console.log('  ', log));

    const canvasSize = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return { width: canvas?.width, height: canvas?.height };
    });

    console.log('\nCanvas size:', canvasSize);

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Logs before error:', logs);
    await browser.close();
    process.exit(1);
  }
})();
