import { test } from '@playwright/test';

test('navigate to character select and debug rendering', async ({ page }) => {
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[') || text.includes('phase') || text.includes('gameState')) {
      console.log(`[${msg.type()}] ${text}`);
    }
  });
  
  // Navigate to app
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('✓ Page loaded');
  
  // Step 1: Click "STORY HUB" button to navigate to story-hub
  const storyHubBtn = page.locator('button').filter({ hasText: /STORY HUB|CONTINUE/i }).first();
  if (await storyHubBtn.isVisible()) {
    const btnText = await storyHubBtn.textContent();
    console.log(`Step 1: Clicking "${btnText.trim()}" to go to story-hub`);
    await storyHubBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('Step 1: STORY HUB button not found');
  }
  
  // Step 2: Look for "CHANGE HERO" button to navigate to character-select
  await page.waitForTimeout(1000);
  const changeHeroBtn = page.locator('button').filter({ hasText: /CHANGE HERO/i }).first();
  if (await changeHeroBtn.isVisible()) {
    console.log('Step 2: Found "CHANGE HERO" button, clicking...');
    await changeHeroBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('Step 2: "CHANGE HERO" button not found');
  }
  
  // Now we should be in character-select state
  console.log('Checking for character preview...');
  const previewCount = await page.locator('[data-testid="character-preview-3d"]').count();
  console.log(`Found ${previewCount} character preview elements`);
  
  if (previewCount > 0) {
    const preview = page.locator('[data-testid="character-preview-3d"]').first();
    
    const debugInfo = await preview.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const canvas = el.querySelector('canvas') as HTMLCanvasElement | null;
      const parentEl = el.parentElement;
      
      return {
        attributes: {
          modelSource: el.getAttribute('data-model-source'),
          modelStatus: el.getAttribute('data-model-status'),
          modelFighter: el.getAttribute('data-model-fighter'),
          modelPath: el.getAttribute('data-model-path'),
        },
        visibility: {
          inViewport: rect.top < window.innerHeight && rect.bottom > 0,
          isVisible: rect.width > 0 && rect.height > 0,
          size: { width: Math.round(rect.width), height: Math.round(rect.height) },
          position: { top: Math.round(rect.top), left: Math.round(rect.left) },
          display: window.getComputedStyle(el).display,
        },
        canvas: canvas ? {
          found: true,
          displaySize: { width: canvas.clientWidth, height: canvas.clientHeight },
          renderSize: { width: canvas.width, height: canvas.height },
          display: window.getComputedStyle(canvas).display,
        } : { found: false },
        parent: parentEl ? {
          tag: parentEl.tagName,
          size: { width: Math.round(parentEl.clientWidth), height: Math.round(parentEl.clientHeight) },
          display: window.getComputedStyle(parentEl).display,
        } : null,
      };
    });
    
    console.log('Character Preview 3D:');
    console.log(JSON.stringify(debugInfo, null, 2));
    
    // Check if models are loading
    const modelReady = debugInfo.attributes.modelStatus === 'ready';
    if (modelReady) {
      console.log('✓ Model is READY (GLTF loaded)');
    } else {
      console.log(`⚠ Model is ${debugInfo.attributes.modelStatus} (still loading or error)`);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/debug-character-rendering.png', fullPage: true });
  console.log('Screenshot: /tmp/debug-character-rendering.png');
});
