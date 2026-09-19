#!/usr/bin/env node

/**
 * GLB Structure Validator
 * Uses Three.js to inspect bone structure of Kai-Jax GLB assets
 * Run: node validate-glb-structure.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async () => {
  try {

    const loader = new GLTFLoader();
    const modelsDir = path.join(__dirname, 'apps/web/public/models');

    const models = [
      'Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb',
      'Meshy_AI_Meshy_Merged_Animations4KAI.glb',
      'Meshy_AI_Meshy_Merged_AnimationsSHADOWSONIC JAX.glb',
    ];

    console.log('\n' + '='.repeat(70));
    console.log('🎮 KAI-JAX GLB STRUCTURE VALIDATOR');
    console.log('='.repeat(70) + '\n');

    for (const modelName of models) {
      const modelPath = path.join(modelsDir, modelName);

      if (!fs.existsSync(modelPath)) {
        console.log(`⚠️  SKIPPED: ${modelName} (file not found)`);
        continue;
      }

      try {
        console.log(`📦 Analyzing: ${modelName}`);
        const stats = fs.statSync(modelPath);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);

        // Load the GLB with file:// URL
        const fileUrl = `file://${modelPath}`;
        const gltf = await new Promise((resolve, reject) => {
          loader.load(fileUrl, resolve, undefined, reject);
        });

        // Analyze skeleton
        const bones = new Set();
        const tailBones = new Set();

        gltf.scene.traverse((obj) => {
          if (obj.name) {
            bones.add(obj.name);

            // Check for tail bones
            if (obj.name.match(/tail_\d{2}/i)) {
              tailBones.add(obj.name);
            }
          }
        });

        console.log(`   🦴 Total objects: ${bones.size}`);

        // Check for canonical bones
        const canonical = ['root', 'spine', 'head'];
        const found = {};

        for (const target of canonical) {
          const match = Array.from(bones).find(name =>
            name.toLowerCase() === target.toLowerCase() ||
            name.toLowerCase().includes(target.toLowerCase())
          );
          found[target] = match || null;
        }

        console.log(`   📊 Canonical bones:`);
        for (const [name, matched] of Object.entries(found)) {
          const status = matched ? '✅' : '❌';
          console.log(`      ${status} ${name}${matched && matched !== name ? ` (as "${matched}")` : ''}`);
        }

        console.log(`   🐈 Tail bones: ${tailBones.size}/9`);
        if (tailBones.size > 0) {
          Array.from(tailBones).sort().slice(0, 3).forEach(name => {
            console.log(`      ✅ ${name}`);
          });
          if (tailBones.size > 3) {
            console.log(`      ... and ${tailBones.size - 3} more`);
          }
        }

        // Check for animations
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`   🎬 Animations: ${gltf.animations.length}`);
          gltf.animations.slice(0, 3).forEach(clip => {
            console.log(`      - ${clip.name}`);
          });
        }

        console.log();

      } catch (err) {
        console.log(`   ❌ Error loading: ${err.message}\n`);
      }
    }

    console.log('='.repeat(70));
    console.log('✅ Validation complete\n');

  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
};

main();
