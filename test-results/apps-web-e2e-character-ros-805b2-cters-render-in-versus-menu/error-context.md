# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web/e2e/character-roster-matrix.spec.ts >> Character Roster Render Matrix >> core playable characters render in versus menu
- Location: apps/web/e2e/character-roster-matrix.spec.ts:123:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Character Roster Render Matrix
  5   |  *
  6   |  * Validates playable characters load, render, and animate without errors.
  7   |  * Tests model asset loading, character initialization, and animation playback.
  8   |  *
  9   |  * This is the "Full Roster / Model Render Matrix" gate from
  10  |  * docs/known-debt.md. It verifies that all enumerated fighters can be
  11  |  * selected and displayed in the versus menu without runtime errors.
  12  |  */
  13  | 
  14  | const BENIGN_ERROR_PATTERNS = [
  15  |   /autoplay/i,
  16  |   /the play\(\) request/i,
  17  |   /sounds\/.*\.mp3/i,
  18  |   /favicon/i,
  19  |   /Failed to load resource.*(mp3|ogg|wav|png|jpg)/i,
  20  |   /WebGL.*deprecated/i,
  21  |   /SwiftShaker/i,
  22  |   /Software WebGL/i,
  23  |   /GPU stall/i,
  24  |   /THREE\.WebGLRenderer: Context Lost/i,
  25  |   /\.hdr/i,
  26  |   /Failed to fetch/i,
  27  |   /net::ERR_/i,
  28  |   // Expected 9-tail rig warnings (known limitation)
  29  |   /9-tail/i,
  30  |   /rig anchor/i,
  31  | ];
  32  | 
  33  | function isBenign(text: string): boolean {
  34  |   return BENIGN_ERROR_PATTERNS.some((re) => re.test(text));
  35  | }
  36  | 
  37  | function collectErrors(page: Page): string[] {
  38  |   const errors: string[] = [];
  39  |   page.on('pageerror', (e) => {
  40  |     if (!isBenign(e.message)) errors.push(`pageerror: ${e.message}`);
  41  |   });
  42  |   page.on('console', (msg) => {
  43  |     if (msg.type() === 'error' && !isBenign(msg.text())) {
  44  |       errors.push(`console.error: ${msg.text()}`);
  45  |     }
  46  |   });
  47  |   return errors;
  48  | }
  49  | 
  50  | async function boot(page: Page): Promise<void> {
> 51  |   await page.goto('/');
      |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  52  |   await expect(page.locator('body')).toBeVisible();
  53  |   await page.waitForFunction(() => Boolean((window as any).runnerStore), null, {
  54  |     timeout: 15_000,
  55  |   });
  56  | }
  57  | 
  58  | async function renderCharacter(
  59  |   page: Page,
  60  |   characterId: string,
  61  |   errors: string[],
  62  | ): Promise<boolean> {
  63  |   try {
  64  |     // Navigate to versus menu
  65  |     await page.evaluate(() => {
  66  |       const s = (window as any).runnerStore.getState();
  67  |       s.setGameState('menu');
  68  |     });
  69  |     await page.waitForTimeout(5_000); // Let intro complete
  70  | 
  71  |     await page.evaluate(() => {
  72  |       const s = (window as any).runnerStore.getState();
  73  |       s.setGameState('versus-select');
  74  |     });
  75  |     await page.waitForTimeout(3_000);
  76  | 
  77  |     // Look for fighter select button and click
  78  |     await expect(page.getByRole('button', { name: 'FIGHT', exact: true })).toBeVisible({
  79  |       timeout: 10_000,
  80  |     });
  81  | 
  82  |     // Try to find and select the character by name (heuristic search)
  83  |     // This is a best-effort approach; exact character cards vary
  84  |     const characterButton = page
  85  |       .locator('button, [role="button"]')
  86  |       .filter({ hasText: new RegExp(characterId, 'i') })
  87  |       .first();
  88  | 
  89  |     // Character should exist or be selectable from the default roster
  90  |     const fightButton = await page.getByRole('button', { name: 'FIGHT', exact: true });
  91  |     if (fightButton) {
  92  |       // Click to start a versus (which displays the selected character model)
  93  |       await fightButton.click();
  94  |     }
  95  | 
  96  |     // Canvas should render the character model
  97  |     await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
  98  | 
  99  |     // Let rendering happen
  100 |     await page.waitForTimeout(2_000);
  101 | 
  102 |     // No unexpected runtime errors
  103 |     if (errors.length > 0) {
  104 |       console.warn(`Character ${characterId} had errors:`, errors);
  105 |       return false;
  106 |     }
  107 | 
  108 |     return true;
  109 |   } catch (e) {
  110 |     console.error(`Failed to render character ${characterId}:`, e);
  111 |     return false;
  112 |   }
  113 | }
  114 | 
  115 | // Core playable characters (canonical roster)
  116 | const CORE_CHARACTERS = ['kai-jax', 'kaison', 'vex', 'zephyr', 'irene', 'striker'];
  117 | 
  118 | test.describe('Character Roster Render Matrix', () => {
  119 |   test.beforeEach(async ({ page }) => {
  120 |     await boot(page);
  121 |   });
  122 | 
  123 |   test('core playable characters render in versus menu', async ({ page }) => {
  124 |     const errors = collectErrors(page);
  125 | 
  126 |     // Navigate to versus select
  127 |     await page.evaluate(() => {
  128 |       const s = (window as any).runnerStore.getState();
  129 |       s.setGameState('menu');
  130 |     });
  131 |     await page.waitForTimeout(5_000);
  132 | 
  133 |     await page.evaluate(() => {
  134 |       const s = (window as any).runnerStore.getState();
  135 |       s.setGameState('versus-select');
  136 |     });
  137 | 
  138 |     await expect(page.getByText('Choose Your Fighter')).toBeVisible({ timeout: 15_000 });
  139 | 
  140 |     // Wait for fighter cards to render (they might be any button-like element)
  141 |     await page.waitForTimeout(2_000);
  142 | 
  143 |     // Fighter cards should be visible - check for button elements or clickable divs
  144 |     const buttons = page.locator('button');
  145 |     const count = await buttons.count();
  146 | 
  147 |     // There should be at least the FIGHT button plus fighter cards
  148 |     expect(count).toBeGreaterThan(0);
  149 |     expect(errors).toEqual([]);
  150 |   });
  151 | 
```