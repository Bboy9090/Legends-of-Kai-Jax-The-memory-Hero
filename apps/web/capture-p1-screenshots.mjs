import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('scratch/p1');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureScreenshots() {
  console.log('[Capture] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });

  console.log('[Capture] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);

  // 1. Main Menu
  await page.evaluate(() => window.runnerStore.getState().setGameState('menu'));
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'main-menu.png') });
  console.log('[Capture] Captured main-menu.png');

  // 2. Campaign Map / Story Hub
  await page.evaluate(() => window.runnerStore.getState().setGameState('story-hub'));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'campaign.png') });
  console.log('[Capture] Captured campaign.png');

  // 3. Character Select - Kai-Jax
  await page.evaluate(() => window.runnerStore.getState().setGameState('versus-select'));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'character-select-kai-jax.png') });
  console.log('[Capture] Captured character-select-kai-jax.png');

  // 4. Character Select - Jaxon
  await page.evaluate(() => window.runnerStore.getState().setCharacter('jaxon'));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'character-select-jaxon.png') });
  console.log('[Capture] Captured character-select-jaxon.png');

  // 5. Character Select - Kaison
  await page.evaluate(() => window.runnerStore.getState().setCharacter('kaison'));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'character-select-kaison.png') });
  console.log('[Capture] Captured character-select-kaison.png');

  // 6. Customization Menu
  await page.evaluate(() => window.runnerStore.getState().setGameState('customization'));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'customization.png') });
  console.log('[Capture] Captured customization.png');

  // 7. Mission 1 Gameplay (Kai-Jax + Enemies)
  await page.evaluate(() => {
    const s = window.runnerStore.getState();
    s.setCharacter('kai-jax');
    s.setActiveStoryMission('story_act1_m1');
    s.setGameState('story-mode');
  });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'mission-1-gameplay.png') });
  console.log('[Capture] Captured mission-1-gameplay.png');

  // 8. Victory Screen
  await page.evaluate(() => window.runnerStore.getState().setGameState('mission-complete'));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'victory.png') });
  console.log('[Capture] Captured victory.png');

  await browser.close();
  console.log('[Capture] All screenshots captured successfully in scratch/p1!');
}

captureScreenshots().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
