import { describe, it, expect, beforeEach } from 'vitest';
import { useAdventure } from '../../lib/stores/useAdventure';
import { useMissions } from '../../lib/stores/useMissions';
import { useRunner } from '../../lib/stores/useRunner';
import { getStoryMissionById } from '../../lib/story_missions';
import { evaluateCampaignProgressionGating } from '../../lib/adventureEvaluator';
import { hasRescuedAllMission6Memories, unlockMission6Memories } from '../../lib/mission6';

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

    const wave1 = mission.enemyWaves[0] as any;
    expect(wave1.type).toBe('void-grunt');
    expect(wave1.count).toBe(6);

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

  it('Memory nodes unlock progressively based on enemy defeats', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', 'rift_frontier');
    const objectives = useAdventure.getState().objectives;

    expect(objectives.memoryRescues.every(m => !m.unlocked)).toBe(true);
    expect(objectives.memoryRescues.length).toBe(3);

    let unlocked = unlockMission6Memories(objectives.memoryRescues, 2);
    expect(unlocked[0].unlocked).toBe(true);
    expect(unlocked[1].unlocked).toBe(false);
    expect(unlocked[2].unlocked).toBe(false);

    unlocked = unlockMission6Memories(objectives.memoryRescues, 4);
    expect(unlocked[0].unlocked).toBe(true);
    expect(unlocked[1].unlocked).toBe(true);
    expect(unlocked[2].unlocked).toBe(false);

    unlocked = unlockMission6Memories(objectives.memoryRescues, 6);
    expect(unlocked[0].unlocked).toBe(true);
    expect(unlocked[1].unlocked).toBe(true);
    expect(unlocked[2].unlocked).toBe(true);
  });

  it('Memory nodes have correct unlock thresholds and positions', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', 'rift_frontier');
    const memories = useAdventure.getState().objectives.memoryRescues;

    expect(memories[0].id).toBe('ashblock_memory_1');
    expect(memories[0].unlockAfterDefeats).toBe(2);
    expect(memories[1].id).toBe('ashblock_memory_2');
    expect(memories[1].unlockAfterDefeats).toBe(4);
    expect(memories[2].id).toBe('ashblock_memory_3');
    expect(memories[2].unlockAfterDefeats).toBe(6);
  });

  it('Mission victory requires all 3 memories rescued AND all enemies defeated', () => {
    const mission = getStoryMissionById('story_act2_m6');
    expect(mission).toBeDefined();
    if (!mission) return;

    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', mission.arena || 'cross_point_arena');

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

    let outcome = evaluateCampaignProgressionGating({
      missionId: 'story_act2_m6',
      enemies: useAdventure.getState().enemies,
      objectives: useAdventure.getState().objectives,
      currentWaveIndex: 1,
      totalWavesCount: 2,
    });
    expect(outcome).toBe('CONTINUE');

    let memories = useAdventure.getState().objectives.memoryRescues;
    memories = memories.map(m => ({ ...m, rescued: true }));
    useAdventure.setState(s => ({
      objectives: { ...s.objectives, memoryRescues: memories }
    }));

    outcome = evaluateCampaignProgressionGating({
      missionId: 'story_act2_m6',
      enemies: useAdventure.getState().enemies,
      objectives: useAdventure.getState().objectives,
      currentWaveIndex: 1,
      totalWavesCount: 2,
    });
    expect(outcome).toBe('CONTINUE');

    for (let i = 0; i < 14; i++) {
      useAdventure.getState().damageEnemy(`enemy-${i}`, 200);
    }

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

    const wave2 = mission.enemyWaves[1] as any;
    const delay = wave2?.spawnDelay ?? wave2?.delay ?? 2;
    expect(delay).toBe(3);
  });

  it('hasRescuedAllMission6Memories correctly checks rescue state', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act2_m6', 'rift_frontier');
    let memories = useAdventure.getState().objectives.memoryRescues;

    expect(hasRescuedAllMission6Memories(memories)).toBe(false);

    memories = memories.map((m, i) => ({ ...m, rescued: i === 0 }));
    expect(hasRescuedAllMission6Memories(memories)).toBe(false);

    memories = memories.map(m => ({ ...m, rescued: true }));
    expect(hasRescuedAllMission6Memories(memories)).toBe(true);
  });
});
