import { expect, test, type Page } from '@playwright/test';

/**
 * Text contrast audit at phone size. For every visible text element on each screen it hides all text, screenshots the
 * background, samples the pixels under the text and compares them with the painted text colour. Fails when text falls
 * below WCAG AA (4.5:1, or 3:1 for large text). Gradient-clipped headings and decorative bullets are skipped.
 */
type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any; setState: (fn: (s: any) => object) => void };
};

const SCREENS = ['title', 'menu', 'lore-hub', 'codex', 'save-slots', 'story-hub', 'campaign-map', 'district-select', 'mission-select', 'versus-select', 'character-select', 'abilities', 'mission-complete', 'settings', 'credits', 'beast-preview'];

const collect = (): any[] => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const toRgba = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const items = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; const text = (t.textContent || '').trim(); if (!text) continue;
    const el = t.parentElement; if (!el || seen.has(el) || ['SCRIPT','STYLE','NOSCRIPT','OPTION'].includes(el.tagName)) continue; seen.add(el);
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') continue;
    let op = 1; for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
    if (op < 0.05) continue;
    const range = document.createRange(); range.selectNodeContents(t); const r = range.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue;
    // Skip anything not actually on top at its centre (covered by another layer).
    const mx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), my = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(mx, my); if (top && !(el.contains(top) || top.contains(el))) continue;
    const clip = st.webkitBackgroundClip === 'text' || st.backgroundClip === 'text';
    const [rr, gg, bb, aa] = toRgba(st.color);
    const px = parseFloat(st.fontSize); const bold = parseInt(st.fontWeight) >= 700;
    items.push({ text: text.slice(0, 36), rect: [r.left, r.top, r.width, r.height], fg: [rr, gg, bb, aa * op], gradientText: clip && aa === 0, large: px >= 24 || (px >= 18.66 && bold), px, tag: el.tagName.toLowerCase(), cls: (el.className && el.className.toString().slice(0, 50)) || '' });
  }
  return items;
};


const HIDE = `*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}input::placeholder{color:transparent!important}`;

const score = (items: any[], bg: { w: number; h: number; d: number[] }) => items.filter(i => !i.gradientText).map((i: any) => {
  const [x, y, w, h] = i.rect; const ratios = [];
  const lin = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  for (let gx = 0; gx < 7; gx++) for (let gy = 0; gy < 3; gy++) {
    const px = Math.min(bg.w - 1, Math.max(0, Math.round(x + (gx + 0.5) * w / 7))), py = Math.min(bg.h - 1, Math.max(0, Math.round(y + (gy + 0.5) * h / 3)));
    const o = (py * bg.w + px) * 4; const b = [bg.d[o], bg.d[o+1], bg.d[o+2]];
    const a = i.fg[3]; const eff = [0,1,2].map(k => i.fg[k] * a + b[k] * (1 - a));
    const l1 = L(eff), l2 = L(b); ratios.push((Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05));
  }
  ratios.sort((p,q)=>p-q);
  return { ...i, median: +ratios[Math.floor(ratios.length/2)].toFixed(2), worst: +ratios[0].toFixed(2) };
});


async function offenders(page: Page) {
  const items = await page.evaluate(collect);
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const png = await page.screenshot();
  await page.evaluate(() => { document.querySelectorAll('style').forEach((s) => { if (s.textContent?.startsWith('*{color:transparent')) s.remove(); }); });
  const bg = await page.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d')!; x.drawImage(img, 0, 0);
    return { w: img.width, h: img.height, d: Array.from(x.getImageData(0, 0, img.width, img.height).data) };
  }, png.toString('base64'));
  const scored = score(items, bg);
  return { checked: scored.length, bad: scored.filter((i: any) => i.text !== '\u2022' && i.median < (i.large ? 3 : 4.5)).map((i: any) => `"${i.text}" ${i.median}:1 (${i.px}px)`) };
}

test.use({ deviceScaleFactor: 1 });

test('every screen keeps text at WCAG AA contrast on a phone', async ({ page }) => {
  test.setTimeout(420_000);
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => (window as Win).runnerStore.setState({ completedStoryMissionIds: ['story_act1_m1', 'story_act1_m2', 'story_act1_m3'] }));

  const failures: string[] = [];
  let checked = 0;
  for (const screen of SCREENS) {
    await page.evaluate((s) => (window as Win).runnerStore.setState({ gameState: s }), screen);
    await page.waitForTimeout(['character-select', 'beast-preview'].includes(screen) ? 4000 : 3000);
    const r = await offenders(page);
    checked += r.checked;
    if (r.bad.length) failures.push(`${screen}: ${r.bad.join('; ')}`);
  }

  // Mission briefing, story dialogue and the in-mission HUD.
  await page.evaluate(() => { const r = (window as Win).runnerStore.getState(); r.setCharacter('kai'); r.setActiveStoryMission('story_act4_m20'); r.setGameState('story-mode'); });
  await page.waitForTimeout(2500);
  for (const [name, setup] of [
    ['mission-briefing', async () => {}],
    ['mission-dialogue', async () => { await page.getByRole('button', { name: 'Engage Mission' }).click({ timeout: 30_000 }); await page.waitForTimeout(2500); }],
    ['mission-hud', async () => {
      const dialogue = page.getByTestId('dialogue-overlay');
      for (let i = 0; i < 60 && (await dialogue.isVisible().catch(() => false)); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(100); }
      await page.waitForTimeout(3000);
    }],
    ['pause-menu', async () => { await page.evaluate(() => (window as Win).adventureStore.getState().togglePause()); await page.waitForTimeout(800); }],
  ] as Array<[string, () => Promise<void>]>) {
    await setup();
    const r = await offenders(page);
    checked += r.checked;
    if (r.bad.length) failures.push(`${name}: ${r.bad.join('; ')}`);
  }

  expect(checked).toBeGreaterThan(300); // the audit really looked at text
  expect(failures, failures.join('\n')).toEqual([]);
});
