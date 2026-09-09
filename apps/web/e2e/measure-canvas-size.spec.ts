import { test } from '@playwright/test';

test('measure canvas and container dimensions', async ({ page }) => {
  // Use the exact same navigation as capture-characters-v2.spec.ts
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click Enter Game button (same as the working test)
  const enterGameBtn = page.locator('button').filter({ hasText: /Enter Game/i });
  await enterGameBtn.click();
  await page.waitForTimeout(3000);
  
  // Measure canvases now
  const measurements = await page.evaluate(() => {
    const results: any[] = [];
    
    document.querySelectorAll('canvas').forEach((canvas, idx) => {
      const rect = canvas.getBoundingClientRect();
      results.push({
        index: idx,
        internalSize: { width: canvas.width, height: canvas.height },
        displaySize: { width: canvas.clientWidth, height: canvas.clientHeight },
        viewport: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
        visible: rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0,
      });
    });
    
    return results;
  });
  
  console.log('\n=== CANVAS ELEMENTS ===');
  measurements.forEach(m => {
    console.log(JSON.stringify(m, null, 2));
  });
  
  // Check for character preview
  const previewCount = await page.locator('[data-testid="character-preview-3d"]').count();
  console.log(`\nFound ${previewCount} character preview elements`);
  
  if (previewCount > 0) {
    const preview = page.locator('[data-testid="character-preview-3d"]').first();
    const previewCanvas = await preview.locator('canvas').count();
    console.log(`Character preview has ${previewCanvas} canvas elements`);
    
    const previewInfo = await preview.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const canvas = el.querySelector('canvas') as HTMLCanvasElement | null;
      return {
        displaySize: { width: Math.round(rect.width), height: Math.round(rect.height) },
        viewport: { top: Math.round(rect.top), left: Math.round(rect.left) },
        visible: rect.top < window.innerHeight && rect.bottom > 0,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height, clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight } : null,
        modelStatus: el.getAttribute('data-model-status'),
        modelFighter: el.getAttribute('data-model-fighter'),
      };
    });
    console.log('\n=== CHARACTER PREVIEW 3D ===');
    console.log(JSON.stringify(previewInfo, null, 2));
  }
});
