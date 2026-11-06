import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Loading game...');
    await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try clicking through to story mode quickly
    console.log('Navigating to story mode...');
    
    // Click any available button to progress
    try {
      await page.locator('button').first().click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('Could not click first button');
    }

    // Check if we're in story mode by looking for the Canvas rendering state
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { exists: false };
      return {
        exists: true,
        width: canvas.width,
        height: canvas.height,
        offsetWidth: canvas.offsetWidth,
        offsetHeight: canvas.offsetHeight,
        parentHeight: canvas.parentElement?.clientHeight,
      };
    });

    console.log('\nCurrent canvas info:');
    console.log(JSON.stringify(canvasInfo, null, 2));

    if (canvasInfo.width > 300) {
      console.log('\n✅ FIXED! Canvas is now at proper size:', canvasInfo.width, 'x', canvasInfo.height);
    } else if (canvasInfo.parentHeight && canvasInfo.parentHeight > 200) {
      console.log('\n⚠️  Canvas still small, but container is larger - fix may be pending');
    }

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
