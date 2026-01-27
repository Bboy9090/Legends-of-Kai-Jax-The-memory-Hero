#!/usr/bin/env node
/**
 * Validate Shade Trial System Data Files
 * Checks all data files for correct structure and canon compliance.
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function loadJSON(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to load ${filepath}: ${error.message}`);
  }
}

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(message) {
  results.passed.push(message);
  log(colors.green, '✓', message);
}

function fail(message) {
  results.failed.push(message);
  log(colors.red, '✗', message);
}

function warn(message) {
  results.warnings.push(message);
  log(colors.yellow, '⚠', message);
}

console.log(colors.blue, '\n=== Shade Trial System Validation ===\n', colors.reset);

// 1. Validate Shade Trial Legend Node
console.log(colors.blue, '\n1. Validating Shade Trial Legend Node...', colors.reset);
try {
  const shadeTrial = loadJSON('data/legend_nodes/shade_trial.node.json');
  
  if (shadeTrial.node_id === 'legend_node_shade') pass('Node ID is correct');
  else fail('Node ID should be "legend_node_shade"');
  
  if (shadeTrial.tail_unlocked === 5) pass('Unlocks tail 5');
  else fail('Should unlock tail 5');
  
  if (shadeTrial.starting_tail_count_required === 4) pass('Requires 4 tails to start');
  else fail('Should require 4 tails');
  
  if (shadeTrial.location === 'Blackreach Underpass') pass('Located in Blackreach Underpass');
  else fail('Should be in Blackreach Underpass');
  
  if (shadeTrial.trial_rules.minimap_disabled === true) pass('Minimap disabled');
  else fail('Minimap should be disabled');
  
  if (shadeTrial.trial_rules.lock_on_disabled === true) pass('Lock-on disabled');
  else fail('Lock-on should be disabled');
  
  if (shadeTrial.trial_rules.healing_disabled === true) pass('Healing disabled');
  else fail('Healing should be disabled');
  
  if (shadeTrial.victory_conditions.stealth_strikes_required === 6) pass('Requires 6 stealth strikes');
  else fail('Should require 6 stealth strikes');
  
  if (shadeTrial.victory_conditions.threat_resets_required === 3) pass('Requires 3 threat resets');
  else fail('Should require 3 threat resets');
  
  if (shadeTrial.victory_conditions.detected_time_seconds_max === 18) pass('Max 18 seconds detected');
  else fail('Max detected time should be 18 seconds');
  
  if (shadeTrial.reward.tail_name === 'shade') pass('Rewards shade tail');
  else fail('Should reward shade tail');
  
} catch (error) {
  fail(`Shade Trial validation failed: ${error.message}`);
}

// 2. Validate Biome Rules
console.log(colors.blue, '\n2. Validating Biome Rules...', colors.reset);
try {
  const biomeRules = loadJSON('data/biomes/biome_rules.json');
  
  if (biomeRules.biomes.blackreach_underpass) pass('Blackreach Underpass biome defined');
  else fail('Blackreach Underpass biome missing');
  
  const blackreach = biomeRules.biomes.blackreach_underpass;
  
  if (blackreach.verticality === 'high') pass('Blackreach has high verticality');
  else fail('Blackreach should have high verticality');
  
  if (blackreach.visibility === 'low_dynamic') pass('Blackreach has low_dynamic visibility');
  else fail('Blackreach should have low_dynamic visibility');
  
  if (blackreach.enemy_density === 'high_but_queued') pass('Blackreach has high_but_queued density');
  else fail('Blackreach should have high_but_queued density (no swarm spam)');
  
  if (blackreach.systems_enabled?.includes('stealth')) pass('Stealth system enabled');
  else fail('Stealth system should be enabled');
  
  if (blackreach.systems_enabled?.includes('threat_reset')) pass('Threat reset system enabled');
  else fail('Threat reset system should be enabled');
  
} catch (error) {
  fail(`Biome Rules validation failed: ${error.message}`);
}

// 3. Validate Boss Design Bible
console.log(colors.blue, '\n3. Validating Boss Design Bible...', colors.reset);
try {
  const bossDesign = loadJSON('data/bosses/boss_design_bible.json');
  
  if (bossDesign.design_law) pass('Design law defined');
  else fail('Design law missing');
  
  const hasTier5 = Object.keys(bossDesign.boss_tiers).some(key => {
    const tier = bossDesign.boss_tiers[key];
    return tier.tail_range && tier.tail_range[0] <= 5 && tier.tail_range[1] >= 5;
  });
  
  if (hasTier5) pass('Tier 5 boss defined');
  else fail('Tier 5 boss missing');
  
  // Find tier 5
  let tier5 = null;
  for (const key of Object.keys(bossDesign.boss_tiers)) {
    const tier = bossDesign.boss_tiers[key];
    if (tier.tail_range && tier.tail_range[0] <= 5 && tier.tail_range[1] >= 5) {
      tier5 = tier;
      break;
    }
  }
  
  if (tier5) {
    if (tier5.expects?.length > 0) pass('Tier 5 has expects array');
    else fail('Tier 5 expects array missing');
    
    if (tier5.punishes?.length > 0) pass('Tier 5 has punishes array');
    else fail('Tier 5 punishes array missing');
    
    if (tier5.weak_to?.length > 0) pass('Tier 5 has weak_to array');
    else fail('Tier 5 weak_to array missing');
  }
  
} catch (error) {
  fail(`Boss Design Bible validation failed: ${error.message}`);
}

// 4. Validate Blackreach Descent Vertical Slice
console.log(colors.blue, '\n4. Validating Blackreach Descent Vertical Slice...', colors.reset);
try {
  const slice = loadJSON('data/vertical_slices/blackreach_descent.slice.json');
  
  if (slice.slice_id === 'vertical_slice_blackreach') pass('Slice ID is correct');
  else fail('Slice ID should be "vertical_slice_blackreach"');
  
  if (slice.playtime_target_minutes === 30) pass('30-minute playtime target');
  else fail('Playtime target should be 30 minutes');
  
  if (slice.player_state.starting_tails === 4) pass('Starts with 4 tails');
  else fail('Should start with 4 tails');
  
  if (slice.mission_flow.length === 4) pass('Has 4 mission phases');
  else fail('Should have 4 mission phases');
  
  const types = slice.mission_flow.map(p => p.type);
  const expectedTypes = ['stealth_exploration', 'hybrid_combat', 'elite_duel', 'legend_node'];
  const typesMatch = types.every((t, i) => t === expectedTypes[i]);
  
  if (typesMatch) pass('Mission phase types in correct order');
  else fail('Mission phase types incorrect');
  
  if (slice.end_state.tail_unlocked === 5) pass('Unlocks tail 5 at end');
  else fail('Should unlock tail 5');
  
  // Check phase durations sum to 30
  const totalDuration = slice.mission_flow.reduce((sum, p) => sum + (p.duration_minutes || 0), 0);
  if (totalDuration === 30) pass('Phase durations sum to 30 minutes');
  else warn(`Phase durations sum to ${totalDuration} minutes (target: 30)`);
  
} catch (error) {
  fail(`Blackreach Descent validation failed: ${error.message}`);
}

// 5. Cross-validate with character data
console.log(colors.blue, '\n5. Cross-validating with character data...', colors.reset);
try {
  const character = loadJSON('kai_jax.character.json');
  
  if (character.evolution.starting_tail_count === 3) pass('Character starts with 3 tails');
  else fail('Character should start with 3 tails');
  
  if (character.evolution.final_tail_count === 9) pass('Character ends with 9 tails');
  else fail('Character should end with 9 tails');
  
  // Check tail 5 is defined
  const tail5 = character.tail_roles.find(t => t.index === 5);
  if (tail5 && tail5.name === 'shade') pass('Tail 5 (shade) defined in character');
  else fail('Tail 5 (shade) missing from character');
  
} catch (error) {
  fail(`Character data validation failed: ${error.message}`);
}

// Print summary
console.log(colors.blue, '\n=== Validation Summary ===\n', colors.reset);
log(colors.green, `Passed: ${results.passed.length}`);
if (results.warnings.length > 0) {
  log(colors.yellow, `Warnings: ${results.warnings.length}`);
}
if (results.failed.length > 0) {
  log(colors.red, `Failed: ${results.failed.length}`);
}

if (results.failed.length > 0) {
  console.log(colors.red, '\n✗ Validation failed\n', colors.reset);
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log(colors.yellow, '\n⚠ Validation passed with warnings\n', colors.reset);
} else {
  console.log(colors.green, '\n✓ All validations passed\n', colors.reset);
}
