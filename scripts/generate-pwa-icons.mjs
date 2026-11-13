// Renders apps/web/public/icon.svg to the PNG icons the web manifest needs.
//   node scripts/generate-pwa-icons.mjs   (run from the repo root; uses the installed Playwright Chromium)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('apps/web/package.json'));
const { chromium } = require('playwright');

const pub = path.resolve('apps/web/public');
const svg = fs.readFileSync(path.join(pub, 'icon.svg'), 'utf8');
const sizes = [
  { file: 'pwa-192x192.png', size: 192, pad: 0 },
  { file: 'pwa-512x512.png', size: 512, pad: 0 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
  // Maskable icons keep their art inside the central 80% "safe zone" on a full-bleed background.
  { file: 'pwa-maskable-512x512.png', size: 512, pad: 0.1, bg: '#050505' },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
for (const { file, size, pad, bg } of sizes) {
  await page.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - pad * 2));
  await page.setContent(
    `<body style="margin:0;background:${bg ?? 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">` +
      `<div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`,
  );
  await page.screenshot({ path: path.join(pub, file), omitBackground: !bg });
  console.log('wrote', file, `${size}x${size}`);
}
await browser.close();
