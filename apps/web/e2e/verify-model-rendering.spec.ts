import { test } from '@playwright/test';

test('verify Kai model pixels are rendering to canvas', async ({ page }) => {
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    if (msg.text().includes('ProductionCharacterVisual')) {
      consoleLogs.push(msg.text());
    }
  });
  
  // Navigate to character-select
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('button').filter({ hasText: /Enter Game/i }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('button').filter({ hasText: /story/i }).nth(1).click();
  await page.waitForTimeout(2000);
  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).first().click();
  await page.waitForTimeout(2000);
  
  // Analyze canvas pixels
  const canvasAnalysis = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'No canvas found' };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return { error: 'Could not get 2D context' };
    
    // Get pixel data from middle of canvas
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Count non-black, non-transparent pixels (rendered content)
    let renderedPixels = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Count pixels that are not fully transparent and not pure black background
      if (a > 200 && (r > 30 || g > 30 || b > 30)) {
        renderedPixels++;
      }
    }
    
    return {
      canvasSize: { width, height },
      pixelAnalysis: {
        totalPixels,
        renderedPixels,
        percentRendered: ((renderedPixels / totalPixels) * 100).toFixed(2),
      },
      verdict: renderedPixels > (totalPixels * 0.05) ? 'MODEL VISIBLE' : 'MODEL INVISIBLE OR EMPTY SCENE',
    };
  });
  
  console.log('Canvas Analysis:', JSON.stringify(canvasAnalysis, null, 2));
  console.log('\nProductionCharacterVisual logs:');
  consoleLogs.forEach(log => console.log('  ' + log));
  
  if ('pixelAnalysis' in canvasAnalysis) {
    console.log('\n' + (canvasAnalysis.verdict === 'MODEL VISIBLE' ? '✓' : '❌') + ' ' + canvasAnalysis.verdict);
  }
  
  // Screenshot
  await page.screenshot({ path: '/tmp/verify-model-rendering.png', maxWidth: 1280, maxHeight: 720 });
});
