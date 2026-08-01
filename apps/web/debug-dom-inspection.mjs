import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

page.on('console', msg => {
  if (msg.text().includes('[Blocker') || msg.text().includes('gameState')) {
    console.log(`[${msg.type()}] ${msg.text().substring(0, 80)}`);
  }
});

try {
  console.log('Navigate to app and go to menu...');
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Click Play Game
  await page.click('button:has-text("Play Game")');
  console.log('Clicked Play Game, waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  // Inspect DOM directly via JavaScript
  console.log('\nInspecting DOM via JavaScript:');
  
  const domInfo = await page.evaluate(() => {
    // Get all elements
    const allElements = document.querySelectorAll('*');
    const buttons = document.querySelectorAll('button');
    const divs = document.querySelectorAll('div');
    
    // Check root
    const root = document.getElementById('root');
    const gameCanvas = document.getElementById('gameCanvas');
    
    // Get all text content
    const bodyText = document.body.innerText;
    
    // Try to find buttons and their classes
    const buttonInfo = Array.from(buttons).map(btn => ({
      text: btn.textContent?.substring(0, 30),
      classes: btn.className,
      visible: btn.offsetParent !== null,
      disabled: btn.disabled
    }));
    
    return {
      totalElements: allElements.length,
      buttonCount: buttons.length,
      divCount: divs.length,
      rootExists: !!root,
      canvasExists: !!gameCanvas,
      bodyHasText: bodyText.length > 0,
      bodyStartsWith: bodyText.substring(0, 100),
      buttons: buttonInfo,
      hasVersusText: bodyText.includes('VERSUS'),
      hasTrainingText: bodyText.includes('TRAINING'),
      rootInnerHTML: root ? root.innerHTML.substring(0, 200) : 'no root'
    };
  });
  
  console.log(`Total elements: ${domInfo.totalElements}`);
  console.log(`Button count: ${domInfo.buttonCount}`);
  console.log(`Div count: ${domInfo.divCount}`);
  console.log(`Root exists: ${domInfo.rootExists}`);
  console.log(`Canvas exists: ${domInfo.canvasExists}`);
  console.log(`Body text exists: ${domInfo.bodyHasText}`);
  console.log(`Has VERSUS: ${domInfo.hasVersusText}`);
  console.log(`Has TRAINING: ${domInfo.hasTrainingText}`);
  console.log(`Body starts with: "${domInfo.bodyStartsWith}"`);
  
  if (domInfo.buttonCount > 0) {
    console.log(`\nButtons found:`);
    domInfo.buttons.forEach((btn, i) => {
      console.log(`  [${i}] "${btn.text}" (visible: ${btn.visible}, classes: ${btn.classes?.substring(0, 50)})`);
    });
  } else {
    console.log('\n⚠️ No buttons found in DOM!');
  }
  
  // Try to get gameState from React store
  console.log('\nChecking React component state:');
  const storeInfo = await page.evaluate(() => {
    // Try to access React internals (this is fragile but might work)
    const root = document.getElementById('root');
    if (!root) return { error: 'no root' };
    
    // Check for React keys in props
    const keys = Object.keys(root);
    const reactKey = keys.find(k => k.startsWith('__react'));
    
    // Also check window for exposed state
    const hasGameState = typeof window.__gameState !== 'undefined';
    const hasStore = typeof window.__store !== 'undefined';
    
    return {
      rootChildCount: root.children.length,
      hasReactKey: !!reactKey,
      hasGameState: hasGameState,
      hasStore: hasStore
    };
  });
  
  console.log(`Root children: ${storeInfo.rootChildCount}`);
  console.log(`Has React internals: ${storeInfo.hasReactKey}`);
  
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await browser.close();
}
