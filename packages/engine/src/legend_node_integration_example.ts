/**
 * Legend Node System Integration Example
 * 
 * Demonstrates how the Legend Node system components work together.
 * This is a validation example, not part of the production code.
 */

import { LegendNodeManager } from './progression/LegendNodeManager';
import { QuillTrial } from './trials/QuillTrial';
import { WorldState } from './world/WorldState';

// Example: Load and complete the Quill Trial

// 1. Load the Quill Trial node data
const quillNodeData = {
  node_id: 'legend_node_quill',
  tail_unlocked: 4,
  name: 'Trial of the Quill',
  location: 'Resonance Sanctum',
  unlock_conditions: {
    starting_tail_count_required: 3,
    no_skip_allowed: true,
  },
  trial_rules: {
    healing_disabled: true,
    revives_disabled: true,
    environmental_kills_allowed: false,
    difficulty_scaling: 'fixed',
  },
  victory_conditions: {
    perfect_dodges_required: 5,
    posture_breaks_required: 3,
    damage_taken_threshold: 0.35,
    enemies_defeated_required: 1,
  },
  failure_conditions: {
    health_depleted: true,
    excessive_damage_taken: true,
  },
  reward: {
    tail: 'quill',
    visual_change: 'Quill shadows ripple along spine, solidifying into the fourth tail.',
    combat_unlocks: ['retaliation_spikes', 'posture_shred_on_dodge'],
  },
};

// 2. Initialize systems
const manager = new LegendNodeManager();
const worldState = WorldState.create();

// 3. Load the node
manager.loadLegendNode(quillNodeData);
console.log('✅ Quill Trial node loaded successfully');

// 4. Check if player can attempt
const playerTailCount = worldState.getCurrentTailCount();
console.log(`Current tail count: ${playerTailCount}`);

const canAttempt = manager.canAttemptNode('legend_node_quill', playerTailCount);
console.log(`Can attempt Quill Trial: ${canAttempt}`);

if (!canAttempt) {
  console.log('❌ Cannot attempt trial - requires exactly 3 tails');
  process.exit(1);
}

// 5. Create and start trial
const trial = new QuillTrial(
  manager.getNode('legend_node_quill')!,
  manager
);

trial.start(100); // Player has 100 max health
console.log('✅ Trial started');

// 6. Simulate trial completion
console.log('\nSimulating trial...');

// Simulate perfect dodges
for (let i = 0; i < 5; i++) {
  trial.onDodge();
  for (let j = 0; j < 20; j++) {
    trial.onDodgeFrame();
  }
  console.log(`  Perfect dodge ${i + 1}/5 completed`);
}

// Simulate posture breaks
for (let i = 0; i < 3; i++) {
  trial.onPostureBreak();
  console.log(`  Posture break ${i + 1}/3 completed`);
}

// Simulate enemy defeat
trial.onEnemyDefeated();
console.log('  Enemy defeated');

// Simulate damage taken (under threshold)
trial.onDamageTaken(30); // 30% of 100 = 30, under 35% threshold
console.log('  Damage taken: 30 (under 35% threshold)');

// 7. Update trial to check victory
trial.update(0.016);

// 8. Check results
const state = trial.getState();
console.log(`\n✅ Trial state: ${state}`);

if (state === 'COMPLETE') {
  console.log('✅ Trial completed successfully!');
  console.log(`✅ Tail 4 (Quill) unlocked!`);
  console.log(`✅ Combat unlocks: ${trial.getReward().combatUnlocks.join(', ')}`);
  
  // Verify manager state
  console.log(`\n✅ Manager tail count: ${manager.getUnlockedTails()}`);
  console.log(`✅ Tail 4 unlocked: ${manager.isTailUnlocked(4)}`);
  console.log(`✅ Node completed: ${manager.isNodeCompleted('legend_node_quill')}`);
  
  // Update world state
  worldState.completeNode('legend_node_quill', 4);
  console.log(`✅ World state tail count: ${worldState.getCurrentTailCount()}`);
  
  // Try to complete again (should fail)
  try {
    manager.completeNode('legend_node_quill');
    console.log('❌ ERROR: Node completed twice (should be impossible!)');
    process.exit(1);
  } catch (error) {
    console.log('✅ Correctly prevented duplicate completion');
  }
  
  console.log('\n🎉 Legend Node system validation complete!');
} else {
  console.log('❌ Trial did not complete successfully');
  console.log(`Stats: ${JSON.stringify(trial.getStats(), null, 2)}`);
  process.exit(1);
}
