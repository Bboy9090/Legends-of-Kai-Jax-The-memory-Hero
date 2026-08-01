#!/usr/bin/env node
/**
 * TASK E: Exact 404 Resource Audit
 * Captures all failed requests during gameplay modes
 */

import { chromium } from 'playwright';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';

async function audit404s(modeName) {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const failedRequests = [];
  const allRequests = [];

  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();
    const request = response.request();

    allRequests.push({
      url,
      status,
      method: request.method(),
      initiator: request.resourceType()
    });

    if (status >= 400) {
      failedRequests.push({
        url,
        status,
        method: request.method(),
        resource_type: request.resourceType(),
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    console.log(`\n🔍 TASK E: 404 Audit - ${modeName}`);
    console.log(`${'='.repeat(80)}`);

    // Navigate
    console.log(`[1/4] Navigate...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // PLAY GAME
    console.log(`[2/4] Menu...`);
    await page.locator('button').filter({ hasText: /PLAY|Play/i }).first().click();
    await page.waitForTimeout(5000);

    if (modeName === 'training') {
      console.log(`[3/4] Training...`);
      await page.locator('button').filter({ hasText: /Training/i }).first().click();
      await page.waitForTimeout(4000);

    } else if (modeName === 'versus') {
      console.log(`[3/4] Versus...`);
      await page.locator('button').filter({ hasText: /Versus|Battle/i }).first().click();
      await page.waitForTimeout(3000);

    } else if (modeName === 'story') {
      console.log(`[3/4] Story...`);
      await page.locator('button').filter({ hasText: /START|Story/i }).first().click();
      await page.waitForTimeout(3000);
    }

    console.log(`[4/4] Capture requests...`);
    await page.waitForTimeout(2000);

    // Report
    console.log(`\n📊 RESULTS:\n`);
    console.log(`Total requests: ${allRequests.length}`);
    console.log(`Failed requests (4xx/5xx): ${failedRequests.length}`);

    if (failedRequests.length > 0) {
      console.log(`\n❌ Failed Requests:\n`);
      console.log(`| Status | Resource Type | URL |`);
      console.log(`|--------|---|---|`);

      for (const req of failedRequests) {
        const url = req.url.length > 60 ? req.url.substring(0, 57) + '...' : req.url;
        console.log(`| ${req.status} | ${req.resource_type} | ${url} |`);
      }

      console.log(`\n📋 Detailed Failed Requests:\n`);
      for (const req of failedRequests) {
        console.log(`URL: ${req.url}`);
        console.log(`Status: ${req.status}`);
        console.log(`Type: ${req.resource_type}`);
        console.log(`Method: ${req.method}`);
        console.log(`---`);
      }
    } else {
      console.log(`\n✅ No 404 errors detected`);
    }

    return {
      mode: modeName,
      total_requests: allRequests.length,
      failed_count: failedRequests.length,
      failed_requests: failedRequests,
      all_requests: allRequests.slice(0, 50) // Sample
    };

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    return { mode: modeName, error: err.message };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🔧 TASK E: 404 Resource Audit\n');

  const trainingResults = await audit404s('training');
  const versusResults = await audit404s('versus');
  const storyResults = await audit404s('story');

  const summary = {
    timestamp: new Date().toISOString(),
    training: trainingResults,
    versus: versusResults,
    story: storyResults,
    summary: {
      total_404s: [trainingResults, versusResults, storyResults]
        .filter(r => !r.error)
        .reduce((sum, r) => sum + r.failed_count, 0)
    }
  };

  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n📊 SUMMARY: ${summary.summary.total_404s} total failed requests across all modes`);
  console.log(`\n✅ Audit complete`);

  // Write JSON report
  const fs = await import('fs');
  fs.writeFileSync('/tmp/task-e-404-audit.json', JSON.stringify(summary, null, 2));
  console.log(`📁 Full report: /tmp/task-e-404-audit.json`);
}

main().catch(console.error);
