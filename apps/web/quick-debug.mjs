import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const info = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const parent = canvas?.parentElement;
      const grandParent = parent?.parentElement;
      
      return {
        canvas: {
          width: canvas?.width,
          height: canvas?.height,
          offsetWidth: canvas?.offsetWidth,
          offsetHeight: canvas?.offsetHeight,
          style: {
            width: canvas?.style.width,
            height: canvas?.style.height,
            display: canvas?.style.display,
            position: canvas?.style.position,
          }
        },
        parent: {
          className: parent?.className,
          offsetWidth: parent?.offsetWidth,
          offsetHeight: parent?.offsetHeight,
          clientWidth: parent?.clientWidth,
          clientHeight: parent?.clientHeight,
          style: {
            width: parent?.style.width,
            height: parent?.style.height,
            position: parent?.style.position,
          }
        },
        grandParent: {
          className: grandParent?.className,
          offsetWidth: grandParent?.offsetWidth,
          offsetHeight: grandParent?.offsetHeight,
          style: {
            width: grandParent?.style.width,
            height: grandParent?.style.height,
            position: grandParent?.style.position,
          }
        },
        windowSize: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }
      };
    });

    console.log('Canvas & Parent Debug Info:');
    console.log(JSON.stringify(info, null, 2));

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
