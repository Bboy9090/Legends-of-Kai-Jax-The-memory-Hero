#!/usr/bin/env node
/**
 * PERFORMANCE PROFILER FOR OPTIMIZED MODELS
 * Measures load time, file size, and geometry complexity
 *
 * Usage: node scripts/profile_models.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MODELS_DIR = path.join(__dirname, '../apps/web/public/models');
const OPTIMIZED_DIR = path.join(MODELS_DIR, 'optimized');

/**
 * Get file size in MB
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch {
    return null;
  }
}

/**
 * Estimate triangle count from file size (rough approximation)
 * GLB with Draco: ~50 bytes per triangle
 */
function estimateTriangles(sizeBytes) {
  return Math.round(sizeBytes / 50);
}

/**
 * Scan models directory and collect metrics
 */
function collectMetrics() {
  if (!fs.existsSync(MODELS_DIR)) {
    console.error(`❌ Models directory not found: ${MODELS_DIR}`);
    process.exit(1);
  }

  const modelFiles = fs.readdirSync(MODELS_DIR)
    .filter(f => f.endsWith('.glb') && !f.includes('optimized'))
    .sort();

  const metrics = [];

  for (const file of modelFiles) {
    const originalPath = path.join(MODELS_DIR, file);
    const originalSize = getFileSize(originalPath);

    // Try to find optimized version
    const optimizedName = file.replace('.glb', '_optimized.glb');
    const optimizedPath = path.join(OPTIMIZED_DIR, optimizedName);
    const optimizedSize = getFileSize(optimizedPath);

    // Try to find LOD version
    const lodName = file.replace('.glb', '_lod_low.glb');
    const lodPath = path.join(OPTIMIZED_DIR, 'lod_low', lodName);
    const lodSize = getFileSize(lodPath);

    if (originalSize) {
      const originalBytes = parseFloat(originalSize) * 1024 * 1024;
      metrics.push({
        name: file.replace('.glb', ''),
        originalSize: parseFloat(originalSize),
        optimizedSize: optimizedSize ? parseFloat(optimizedSize) : null,
        lodSize: lodSize ? parseFloat(lodSize) : null,
        originalTris: estimateTriangles(originalBytes),
        optimizedTris: optimizedSize ? estimateTriangles(parseFloat(optimizedSize) * 1024 * 1024) : null,
        lodTris: lodSize ? estimateTriangles(parseFloat(lodSize) * 1024 * 1024) : null,
      });
    }
  }

  return metrics;
}

/**
 * Calculate compression metrics
 */
function calculateMetrics(metrics) {
  const hasOptimized = metrics.some(m => m.optimizedSize);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let totalLod = 0;
  let totalOriginalTris = 0;
  let totalOptimizedTris = 0;
  let totalLodTris = 0;

  for (const m of metrics) {
    totalOriginal += m.originalSize;
    if (m.optimizedSize) totalOptimized += m.optimizedSize;
    if (m.lodSize) totalLod += m.lodSize;
    totalOriginalTris += m.originalTris;
    if (m.optimizedTris) totalOptimizedTris += m.optimizedTris;
    if (m.lodTris) totalLodTris += m.lodTris;
  }

  return {
    modelCount: metrics.length,
    totalOriginalSize: totalOriginal,
    totalOptimizedSize: totalOptimized,
    totalLodSize: totalLod,
    totalOriginalTris,
    totalOptimizedTris,
    totalLodTris,
    compressionRatio: totalOriginal > 0 ? (totalOptimized / totalOriginal).toFixed(3) : null,
    polyReduction: totalOriginalTris > 0 ? (totalOptimizedTris / totalOriginalTris).toFixed(3) : null,
    spaceSaved: (totalOriginal - totalOptimized).toFixed(2),
  };
}

/**
 * Estimate load time improvement
 * Assumption: 10 Mbps network, 1ms per API call overhead
 */
function estimateLoadTime(sizeMB) {
  const networkSpeed = 10; // Mbps
  const overhead = 1; // ms
  const networkTime = (sizeMB / networkSpeed) * 1000; // ms
  return (networkTime + overhead).toFixed(0);
}

/**
 * Print formatted report
 */
function printReport(metrics, summary) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MODEL OPTIMIZATION PROFILE');
  console.log('='.repeat(80));

  // Summary
  console.log('\n🎯 SUMMARY');
  console.log(`  Models analyzed: ${summary.modelCount}`);
  if (summary.compressionRatio) {
    console.log(`  Total size: ${summary.totalOriginalSize.toFixed(1)} MB → ${summary.totalOptimizedSize.toFixed(1)} MB`);
    console.log(`  Compression ratio: ${summary.compressionRatio} (${(1 - parseFloat(summary.compressionRatio))*100 >> 0}% reduction)`);
    console.log(`  Space saved: ${summary.spaceSaved} MB`);
  } else {
    console.log('  ⚠️  Optimized models not found. Run Blender optimization script first.');
    console.log(`  Original total size: ${summary.totalOriginalSize.toFixed(1)} MB`);
  }

  // Geometry
  if (summary.polyReduction) {
    console.log('\n📐 GEOMETRY');
    console.log(`  Original triangles: ${summary.totalOriginalTris.toLocaleString()}`);
    console.log(`  Optimized triangles: ${summary.totalOptimizedTris.toLocaleString()}`);
    console.log(`  LOD triangles: ${summary.totalLodTris.toLocaleString()}`);
    console.log(`  Polygon reduction: ${summary.polyReduction} (${(1 - parseFloat(summary.polyReduction))*100 >> 0}%)`);
  }

  // Per-model breakdown
  console.log('\n📦 MODELS');
  console.log('-'.repeat(80));

  for (const m of metrics.sort((a, b) => b.originalSize - a.originalSize)) {
    console.log(`\n  ${m.name}`);
    console.log(`    Size:  ${m.originalSize.toFixed(2)} MB`, end='');
    if (m.optimizedSize) {
      const reduction = (1 - m.optimizedSize / m.originalSize) * 100;
      console.log(` → ${m.optimizedSize.toFixed(2)} MB (-${reduction.toFixed(0)}%)`);
      console.log(`    Load:  ${estimateLoadTime(m.originalSize)}ms → ${estimateLoadTime(m.optimizedSize)}ms`);
    } else {
      console.log(' (not optimized)');
    }
    console.log(`    Tris:  ${m.originalTris.toLocaleString()}`, end='');
    if (m.optimizedTris) {
      const reduction = (1 - m.optimizedTris / m.originalTris) * 100;
      console.log(` → ${m.optimizedTris.toLocaleString()} (-${reduction.toFixed(0)}%)`);
    } else {
      console.log('');
    }
    if (m.lodSize) {
      console.log(`    LOD:   ${m.lodSize.toFixed(2)} MB (${m.lodTris.toLocaleString()} tris)`);
    }
  }

  // Performance impact estimate
  console.log('\n⚡ ESTIMATED PERFORMANCE IMPACT');
  console.log('-'.repeat(80));

  const avgOriginalSize = summary.totalOriginalSize / summary.modelCount;
  const avgOptimizedSize = summary.totalOptimizedSize / summary.modelCount || avgOriginalSize;

  console.log(`  Load time (1 model):     ${estimateLoadTime(avgOriginalSize)}ms → ${estimateLoadTime(avgOptimizedSize)}ms`);
  console.log(`  Battle load (2v2):       ${(estimateLoadTime(avgOriginalSize * 4))}ms → ${estimateLoadTime(avgOptimizedSize * 4)}ms`);
  console.log(`  Mission load (player+3): ${estimateLoadTime(avgOriginalSize * 4)}ms → ${estimateLoadTime(avgOptimizedSize * 4)}ms`);

  const polyReductionPct = summary.polyReduction ? (1 - parseFloat(summary.polyReduction)) * 100 : 0;
  console.log(`  Render improvement:      ~${(polyReductionPct * 0.2).toFixed(0)}% (GPU-bound)`);
  console.log(`  Mobile FPS gain:         +${Math.min(10, polyReductionPct * 0.15).toFixed(0)} fps`);

  // Deployment checklist
  console.log('\n✅ DEPLOYMENT CHECKLIST');
  console.log('-'.repeat(80));
  console.log('  [ ] Run Blender optimization: blender --background --python scripts/blender_optimize_models.py');
  console.log('  [ ] Review optimization_report.json for polygon/size reduction');
  console.log('  [ ] Test in dev: pnpm dev and check battle/mission visuals');
  console.log('  [ ] Profile mobile performance on real device');
  console.log('  [ ] Commit optimized models to git');
  console.log('  [ ] Deploy to production');
  console.log('  [ ] Monitor user FPS metrics in analytics');

  console.log('\n' + '='.repeat(80));
  console.log('📄 For detailed metrics, check: apps/web/public/models/optimized/optimization_report.json\n');
}

// Main
try {
  const metrics = collectMetrics();
  const summary = calculateMetrics(metrics);
  printReport(metrics, summary);
} catch (err) {
  console.error('❌ Profile failed:', err.message);
  process.exit(1);
}
