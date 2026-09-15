import { test } from '@playwright/test';

test('inspect three.js scene content during character rendering', async ({ page }) => {
  // Load the story hero select page
  await page.goto('http://localhost:3001/story/character-select', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  
  // Once there, inspect the THREE scene directly
  const sceneInfo = await page.evaluate(() => {
    const previewEl = document.querySelector('[data-testid="character-preview-3d"]');
    if (!previewEl) return { error: 'Preview element not found' };
    
    const canvas = previewEl.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'Canvas not found' };
    
    // Try to access the renderer via the WebGL context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'WebGL context not found' };
    
    // Get canvas rendering info
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    return {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      },
      webgl: {
        renderer,
        vendor: gl.getParameter(gl.VENDOR),
        drawingBufferWidth: gl.drawingBufferWidth,
        drawingBufferHeight: gl.drawingBufferHeight,
      },
      viewport: {
        rect: canvas.getBoundingClientRect(),
      },
    };
  });
  
  console.log('Scene Info:', JSON.stringify(sceneInfo, null, 2));
  
  // Take a screenshot and also try pixel-reading from canvas
  await page.screenshot({ path: '/tmp/inspect-three-scene.png', fullPage: true });
  console.log('Screenshot: /tmp/inspect-three-scene.png');
});
