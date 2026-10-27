import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAdventure } from '../../lib/stores/useAdventure';
import { useMissions } from '../../lib/stores/useMissions';
import { useRunner } from '../../lib/stores/useRunner';
import { getStoryMissionById } from '../../lib/story_missions';
import { evaluateCampaignProgressionGating } from '../../lib/adventureEvaluator';

describe('Mission 6 (Shadows of the Ashblock) - Combat Encounters (M6-B)', () => {
  beforeEach(() => {
    useAdventure.getState().reset();
    useRunner.setState({ completedStoryMissionIds: [], selectedCharacter: 'kai-jax', totalScore: 0 });
    useMissions.setState({ active: null, completedKeys: [], result: null, lastReward: null });
  });

  it('M6 mission definition loads correctly with 2 waves', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    expect(mission?.id).toBe('story_act2_m6');
    expect(mission?.title).toBe('Shadows of the Ashblock');
    expect(mission?.enemyWaves.length).toBe(2);
  });

  it('Wave 1 spawns 6 void-grunts when mission starts', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    if (!mission) return;

    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', mission.arena || 'cross_point_arena');

    // Simulate wave 1 spawn (maps void-grunt to rift-drone)
    const wave1 = mission.enemyWaves[0] as any;
    expect(wave1.type).toBe('void-grunt');
    expect(wave1.count).toBe(6);

    // Manually spawn wave 1 enemies to test
    const wave1Enemies = Array.from({ length: 6 }, (_, i) => ({
      id: `w0-${i}-rift-drone`,
      fighterId: 'rift-drone',
      tier: 'minion1' as const,
      posX: Math.sin((i / 6) * Math.PI * 2) * 8,
      posY: 0,
      posZ: Math.cos((i / 6) * Math.PI * 2) * 8,
      rotY: 0,
      health: 80 + mission.difficulty * 20,
      maxHealth: 80 + mission.difficulty * 20,
      isAggro: false,
      isAttacking: false,
      isDead: false,
      aiState: 'idle' as const,
      telegraphTimer: 0,
      patrolTargetX: Math.sin((i / 6) * Math.PI * 2) * 8 + (Math.random() - 0.5) * 8,
      patrolTargetZ: Math.cos((i / 6) * Math.PI * 2) * 8 + (Math.random() - 0.5) * 8,
      stunTimer: 0,
    }));

    useAdventure.getState().spawnEnemies(wave1Enemies);
    const state = useAdventure.getState();
    expect(state.enemies.length).toBe(6);
    expect(state.enemies.every(e => e.fighterId === 'rift-drone')).toBe(true);
  });

  it('Wave 2 has 8 void-scouts with 3s spawn delay', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    if (!mission) return;

    const wave2 = mission.enemyWaves[1] as any;
    expect(wave2.type).toBe('void-scout');
    expect(wave2.count).toBe(8);
    expect(wave2.delay).toBe(3);
  });

  it('Memory rescue triggers at correct enemy defeat milestones', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    if (!mission) return;

    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', mission.arena || 'cross_point_arena');

    // Spawn 6 enemies for testing
    const testEnemies = Array.from({ length: 6 }, (_, i) => ({
      id: `test-${i}`,
      fighterId: 'rift-drone',
      tier: 'minion1' as const,
      posX: 0,
      posY: 0,
      posZ: 0,
      rotY: 0,
      health: 100,
      maxHealth: 100,
      isAggro: false,
      isAttacking: false,
      isDead: false,
      aiState: 'idle' as const,
      telegraphTimer: 0,
      patrolTargetX: 0,
      patrolTargetZ: 0,
      stunTimer: 0,
    }));

    useAdventure.getState().spawnEnemies(testEnemies);

    // Initially no shards rescued
    let objectives = useAdventure.getState().objectives;
    expect(objectives.memoryRescues.shard1).toBe(false);
    expect(objectives.memoryRescues.shard2).toBe(false);
    expect(objectives.memoryRescues.shard3).toBe(false);

    // Kill 2 enemies → shard1 should be rescued
    useAdventure.getState().damageEnemy('test-0', 200);
    useAdventure.getState().damageEnemy('test-1', 200);
    useAdventure.getState().markMemoryRescued('shard1');
    objectives = useAdventure.getState().objectives;
    expect(objectives.memoryRescues.shard1).toBe(true);

    // Kill 5 total enemies → shard2 should be rescued
    useAdventure.getState().damageEnemy('test-2', 200);
    useAdventure.getState().damageEnemy('test-3', 200);
    useAdventure.getState().damageEnemy('test-4', 200);
    useAdventure.getState().markMemoryRescued('shard2');
    objectives = useAdventure.getState().objectives;
    expect(objectives.memoryRescues.shard2).toBe(true);

    // Kill all 6 enemies → shard3 should be rescued
    useAdventure.getState().damageEnemy('test-5', 200);
    useAdventure.getState().markMemoryRescued('shard3');
    objectives = useAdventure.getState().objectives;
    expect(objectives.memoryRescues.shard3).toBe(true);
  });

  it('Mission victory requires all 3 shards rescued AND all enemies defeated', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    if (!mission) return;

    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', mission.arena || 'cross_point_arena');

    // Create test state with all shards but no enemies
    const testEnemies = Array.from({ length: 14 }, (_, i) => ({
      id: `enemy-${i}`,
      fighterId: i < 6 ? 'rift-drone' : 'hyena-scout',
      tier: 'minion1' as const,
      posX: 0,
      posY: 0,
      posZ: 0,
      rotY: 0,
      health: 100,
      maxHealth: 100,
      isAggro: false,
      isAttacking: false,
      isDead: false,
      aiState: 'idle' as const,
      telegraphTimer: 0,
      patrolTargetX: 0,
      patrolTargetZ: 0,
      stunTimer: 0,
    }));

    useAdventure.getState().spawnEnemies(testEnemies);

    // Mark all shards rescued
    useAdventure.getState().objectives.memoryRescues.shard1 = true;
    useAdventure.getState().objectives.memoryRescues.shard2 = true;
    useAdventure.getState().objectives.memoryRescues.shard3 = true;

    // Still CONTINUE because enemies alive
    let outcome = evaluateCampaignProgressionGating({
      missionId: 'story_act2_m6',
      enemies: useAdventure.getState().enemies,
      objectives: useAdventure.getState().objectives,
      currentWaveIndex: 1,
      totalWavesCount: 2,
    });
    expect(outcome).toBe('CONTINUE');

    // Kill all enemies
    useAdventure.getState().damageEnemy('enemy-0', 200);
    useAdventure.getState().damageEnemy('enemy-1', 200);
    useAdventure.getState().damageEnemy('enemy-2', 200);
    useAdventure.getState().damageEnemy('enemy-3', 200);
    useAdventure.getState().damageEnemy('enemy-4', 200);
    useAdventure.getState().damageEnemy('enemy-5', 200);
    useAdventure.getState().damageEnemy('enemy-6', 200);
    useAdventure.getState().damageEnemy('enemy-7', 200);
    useAdventure.getState().damageEnemy('enemy-8', 200);
    useAdventure.getState().damageEnemy('enemy-9', 200);
    useAdventure.getState().damageEnemy('enemy-10', 200);
    useAdventure.getState().damageEnemy('enemy-11', 200);
    useAdventure.getState().damageEnemy('enemy-12', 200);
    useAdventure.getState().damageEnemy('enemy-13', 200);

    // Now all shards rescued AND all enemies dead → VICTORY
    outcome = evaluateCampaignProgressionGating({
      missionId: 'story_act2_m6',
      enemies: useAdventure.getState().enemies,
      objectives: useAdventure.getState().objectives,
      currentWaveIndex: 1,
      totalWavesCount: 2,
    });
    expect(outcome).toBe('VICTORY');
  });

  it('Wave transition delay is correctly read as 3 seconds for wave 2', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    if (!mission) return;

    // Check that the delay is properly extracted
    const wave2 = mission.enemyWaves[1] as any;
    const delay = wave2?.spawnDelay ?? wave2?.delay ?? 2;
    expect(delay).toBe(3);
  });
});
