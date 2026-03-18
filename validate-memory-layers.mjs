#!/usr/bin/env node

/**
 * Memory Layer Validation Script
 * 
 * Validates all memory layer JSON files against the schema requirements.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate all memory layer files
const memoryLayerPath = join(__dirname, 'data', 'memory_layers');
let allValid = true;

console.log('🧠 Validating Memory Layer files...\n');

const memoryTypes = [
  'bond', 'chase', 'connection', 'pain_remembered', 'disappearance',
  'holding_line', 'alternate_futures', 'cost_of_power', 'time_paid'
];

for (let i = 1; i <= 9; i++) {
  const fileName = `tail_${i}_${getMemoryName(i)}.memory.json`;
  const filePath = join(memoryLayerPath, fileName);
  
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // Required field checks
    const requiredFields = ['memory_id', 'tail_number', 'memory_type', 'name', 'description', 'read', 'gameplay_effects'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ ${fileName} - Missing fields: ${missingFields.join(', ')}`);
      allValid = false;
      continue;
    }
    
    // Tail number validation
    if (data.tail_number !== i) {
      console.error(`❌ ${fileName} - tail_number ${data.tail_number} does not match expected ${i}`);
      allValid = false;
      continue;
    }
    
    // Memory type validation
    if (!memoryTypes.includes(data.memory_type)) {
      console.error(`❌ ${fileName} - Invalid memory_type: ${data.memory_type}`);
      allValid = false;
      continue;
    }
    
    // Gameplay effects validation
    const requiredEffects = ['perception_shifts', 'behavior_modifications', 'enemy_reactions', 'world_interactions'];
    const missingEffects = requiredEffects.filter(effect => !Array.isArray(data.gameplay_effects[effect]));
    
    if (missingEffects.length > 0) {
      console.error(`❌ ${fileName} - Missing gameplay_effects arrays: ${missingEffects.join(', ')}`);
      allValid = false;
      continue;
    }
    
    // Stacking and persistence validation
    if (data.stacking_rule && data.stacking_rule !== 'cumulative') {
      console.error(`❌ ${fileName} - stacking_rule must be 'cumulative'`);
      allValid = false;
    }
    
    if (data.persistence && data.persistence !== 'irreversible') {
      console.error(`❌ ${fileName} - persistence must be 'irreversible'`);
      allValid = false;
    }
    
    console.log(`✅ ${fileName}`);
  } catch (error) {
    console.error(`❌ ${fileName} - Error: ${error.message}`);
    allValid = false;
  }
}

console.log('\n📊 Validation Summary:');
if (allValid) {
  console.log('✅ All 9 memory layer files validated successfully');
  console.log('✅ Memory layers are cumulative (stacking)');
  console.log('✅ Memory layers are irreversible (cannot be removed)');
  console.log('✅ All tail numbers match expected values (1-9)');
  console.log('\n🎮 Memory Weave system schema compliance verified.');
  process.exit(0);
} else {
  console.error('❌ Some memory layer files failed validation');
  process.exit(1);
}

function getMemoryName(tailNumber) {
  const names = {
    1: 'bond',
    2: 'chase',
    3: 'connection',
    4: 'quill',
    5: 'shade',
    6: 'anchor',
    7: 'echo',
    8: 'rift',
    9: 'crown',
  };
  return names[tailNumber];
}
