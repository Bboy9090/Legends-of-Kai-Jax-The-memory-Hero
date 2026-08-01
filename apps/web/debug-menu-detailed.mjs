import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

const consoleLogs = [];
page.on('console', msg => {
  consoleLogs.push(msg.text());
  if (msg.text().includes('[Blocker A Trace]') || msg.text().includes('menu')) {
    console.log(`[${msg.type()}] ${msg.text()}`);
  }
});

try {
  console.log('Step 1: Navigate to app');
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('\nStep 2: Click Play Game');
  const playGameBtn = page.locator('button:has-text("Play Game")');
  const isPlayGameVisible = await playGameBtn.isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`Play Game visible: ${isPlayGameVisible}`);
  
  if (isPlayGameVisible) {
    await playGameBtn.click();
    console.log('Clicked Play Game, waiting 3 seconds...');
    await page.waitForTimeout(3000);
    
    console.log('\nStep 3: Check menu screen');
    const content = await page.content();
    
    // Count various elements
    const buttonCount = await page.locator('button').count();
    const divCount = await page.locator('div').count();
    console.log(`Buttons on page: ${buttonCount}`);
    console.log(`Divs on page: ${divCount}`);
    
    // Check for text content
    const hasVersus = content.includes('VERSUS');
    const hasTraining = content.includes('TRAINING');
    const hasMenu = content.includes('menu');
    console.log(`Page contains VERSUS text: ${hasVersus}`);
    console.log(`Page contains TRAINING text: ${hasTraining}`);
    console.log(`Page contains "menu" text: ${hasMenu}`);
    
    // Try to find interactive elements
    console.log('\nSearching for interactive elements...');
    const allSelectable = await page.locator('[role="button"], button, [tabindex]').count();
    console.log(`Elements with role=button or tabindex: ${allSelectable}`);
    
    // Get all span/div/p text content  
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('VERSUS MODE')) {
      console.log('✓ Found "VERSUS MODE" text in body');
    }
    if (bodyText.includes('TRAINING')) {
      console.log('✓ Found "TRAINING" text in body');
    }
    
    // Try keyboard navigation instead
    console.log('\nAttempting keyboard navigation: ArrowDown + Enter');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check state after keyboard nav
    const newContent = await page.content();
    const newGameState = newContent.match(/gameState["\']?\s*[=:]\s*["\']?([a-z-]+)/i);
    console.log(`Game state after keyboard nav: ${newGameState ? newGameState[1] : 'unknown'}`);
    
    // Take screenshots at key moments
    await page.screenshot({ path: '/tmp/debug-menu-after-play-game.png', fullPage: true });
    await page.screenshot({ path: '/tmp/debug-menu-after-keyboard.png', fullPage: true });
    console.log('\nScreenshots saved');
  }
  
} catch (err) {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
} finally {
  await browser.close();
}
