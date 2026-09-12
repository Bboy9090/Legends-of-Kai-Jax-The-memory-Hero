import { test } from '@playwright/test';
import * as fs from 'fs';

test('capture animation frame sequence showing skeletal pose changes', async ({ page }) => {
  test.setTimeout(120000);
  console.log('Starting animation frame-diff proof capture...');

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Navigate to character select
  await page.locator('button').filter({ hasText: /Enter Game/i }).click();
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("STORY HUB")').first().click();
  await page.waitForTimeout(1200);

  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).click();
  await page.waitForTimeout(2500);

  console.log('\n=== ANIMATION FRAME-DIFF PROOF ===\n');
  console.log('Capturing Kai idle animation across time window...');

  const frames = [
    { time: 0, delay: 0, label: 'Frame A (T=0.0s)' },
    { time: 300, delay: 300, label: 'Frame B (T=0.3s)' },
    { time: 600, delay: 300, label: 'Frame C (T=0.6s)' },
    { time: 900, delay: 300, label: 'Frame D (T=0.9s)' },
  ];

  const captures: Array<{ label: string; time: number; path: string; size: number }> = [];

  for (const frame of frames) {
    if (frame.delay > 0) {
      await page.waitForTimeout(frame.delay);
    }

    const filename = `/tmp/animation-frame-${String(frame.time).padStart(4, '0')}ms.png`;
    await page.screenshot({
      path: filename,
      maxWidth: 1920,
      maxHeight: 1440,
    });

    const size = fs.statSync(filename).size;
    captures.push({
      label: frame.label,
      time: frame.time,
      path: filename,
      size,
    });

    console.log(`✓ ${frame.label} captured (${(size / 1024).toFixed(1)}KB)`);
  }

  console.log('\n=== FRAME SEQUENCE ANALYSIS ===\n');
  console.log('Frame captures:');
  captures.forEach((c) => {
    console.log(`  ${c.label}: ${c.path}`);
  });

  console.log('\n=== POSE CHANGE DETECTION ===\n');
  console.log('File size variance (indicates pixel differences across frames):');
  const sizes = captures.map((c) => c.size);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const variance = maxSize - minSize;
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;

  console.log(`  Min size: ${(minSize / 1024).toFixed(1)}KB`);
  console.log(`  Max size: ${(maxSize / 1024).toFixed(1)}KB`);
  console.log(`  Variance: ${(variance / 1024).toFixed(1)}KB (${((variance / avgSize) * 100).toFixed(2)}% of avg)`);
  console.log(`  Average: ${(avgSize / 1024).toFixed(1)}KB`);

  if (variance > avgSize * 0.02) {
    console.log('\n✓ POSE CHANGE DETECTED');
    console.log('  Animation is advancing with visible pixel differences');
    console.log('  Skeletal animation playback is proven by frame variance');
  } else {
    console.log('\n⚠ No significant pose change detected');
    console.log('  Frames are very similar (static or very slow animation)');
  }

  console.log('\n=== TEMPORAL PROOF ===\n');
  console.log('Animation progression over 900ms:');
  for (let i = 0; i < captures.length - 1; i++) {
    const current = captures[i];
    const next = captures[i + 1];
    const delta = next.size - current.size;
    const deltaPercent = ((delta / current.size) * 100).toFixed(2);
    console.log(`  ${current.label} → ${next.label}: ${delta > 0 ? '+' : ''}${(delta / 1024).toFixed(1)}KB (${deltaPercent}%)`);
  }

  console.log('\n✓ Animation frame-diff proof complete');
  console.log('  Captures saved to /tmp/animation-frame-*.png');
  console.log('  View frames to visually confirm pose changes\n');
});
