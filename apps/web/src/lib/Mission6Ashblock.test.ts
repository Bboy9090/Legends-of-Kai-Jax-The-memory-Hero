import { beforeEach, describe, expect, it } from "vitest";
import { getStoryMissionById } from "./story_missions";
import { getArenaConfig } from "../assets/arenaRegistry";
import { getModelConfig } from "../assets/modelRegistry";
import { ENEMY_TIERS } from "../game/tuning/enemyTuning";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { normalizeWaveEnemies, getWaveDelaySeconds } from "./storyWaveRuntime";
import { MISSION6_ID } from "./mission6";
import { evaluateCampaignProgressionGating } from "./adventureEvaluator";
import { useAdventure, type AdventureEnemy } from "./stores/useAdventure";

function enemy(id: string, fighterId = "rift-drone"): AdventureEnemy {
  return {
    id, fighterId, tier: "minion1", posX: 0, posY: 0, posZ: 0,
    rotY: 0, health: 100, maxHealth: 100, isAggro: false,
    isAttacking: false, isDead: false, aiState: "idle",
    telegraphTimer: 0, patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
  };
}
function outcome(wave = 1) {
  return evaluateCampaignProgressionGating({
    ...useAdventure.getState(), currentWaveIndex: wave, totalWavesCount: 2,
  });
}
function defeatFirstWave() {
  const store = useAdventure.getState();
  store.spawnEnemies(Array.from({ length: 6 }, (_, i) => enemy("w0-" + i)));
  for (let i = 0; i < 6; i++) useAdventure.getState().damageEnemy("w0-" + i, 100);
}
function rescueAll() {
  for (const node of useAdventure.getState().objectives.memoryRescues) {
    useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);
    expect(useAdventure.getState().rescueMemory(node.id)).toBe(true);
  }
}

describe("M6-A/B Shadows of the Ashblock playable encounter contract", () => {
  beforeEach(() => useAdventure.getState().reset());

  it("uses canonical encounter order, count and 3-second second-wave delay", () => {
    const mission = getStoryMissionById(MISSION6_ID);
    expect(mission).toBeDefined();
    expect(mission?.arena).toBe("rift_frontier");
    expect(mission?.title).toBe("Shadows of the Ashblock");
    expect(normalizeWaveEnemies(mission!, 0)).toEqual(Array(6).fill({ fighterId: "rift-drone" }));
    expect(normalizeWaveEnemies(mission!, 1)).toEqual(Array(8).fill({ fighterId: "hyena-scout" }));
    expect(getWaveDelaySeconds(mission!, 1)).toBe(3);
    expect(mission?.rewards).toEqual({ xp: 500, currency: 350, loot: ["Ashblock Memory"] });
  });

  it("registers a distinct Rift Frontier environment and real GLB assets for both waves", () => {
    expect(getArenaConfig("rift_frontier").id).toBe("rift_frontier");
    expect(getArenaConfig("rift_frontier").displayName).toMatch(/Ashblock/);
    for (const id of ["rift-drone", "hyena-scout"]) {
      const model = getModelConfig(id);
      expect(model?.path.endsWith(".glb")).toBe(true);
      expect(existsSync(join(process.cwd(), "public", "models", model!.path.split("/").pop()!))).toBe(true);
    }
    expect(ENEMY_TIERS.minion1.aggroRange).toBeGreaterThan(8);
    expect(ENEMY_TIERS.minion2.telegraphDuration).toBeGreaterThan(0);
  });

  it("starts with three separately sealed memories and cannot rescue early or from afar", () => {
    useAdventure.getState().initAdventure("kai-jax", MISSION6_ID, "rift_frontier");
    const nodes = useAdventure.getState().objectives.memoryRescues;
    expect(nodes.map(node => node.id)).toEqual([
      "ashblock_memory_1", "ashblock_memory_2", "ashblock_memory_3",
    ]);
    expect(nodes.every(node => !node.unlocked && !node.rescued)).toBe(true);
    expect(useAdventure.getState().rescueMemory(nodes[0].id)).toBe(false);
    defeatFirstWave();
    expect(useAdventure.getState().rescueMemory(nodes[0].id)).toBe(false);
    expect(outcome()).toBe("CONTINUE");
  });

  it("unlocks 2/4/6 kills progressively, without counting duplicate or partial defeats", () => {
    useAdventure.getState().initAdventure("kai-jax", MISSION6_ID, "rift_frontier");
    const store = useAdventure.getState();
    store.spawnEnemies(Array.from({ length: 6 }, (_, i) => enemy("e" + i)));
    store.damageEnemy("e0", 50);
    expect(useAdventure.getState().enemiesDefeated).toBe(0);
    for (let i = 0; i < 6; i++) {
      useAdventure.getState().damageEnemy("e" + i, 100);
      if (i === 0) useAdventure.getState().damageEnemy("e0", 100);
      const unlocked = useAdventure.getState().objectives.memoryRescues.filter(node => node.unlocked).length;
      expect(unlocked).toBe(Math.floor((i + 1) / 2));
    }
    expect(useAdventure.getState().enemiesDefeated).toBe(6);
  });

  it("rescues are range-, pause- and activity-gated; rescue is idempotent", () => {
    useAdventure.getState().initAdventure("kai-jax", MISSION6_ID, "rift_frontier");
    defeatFirstWave();
    const node = useAdventure.getState().objectives.memoryRescues[0];
    useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);
    useAdventure.getState().togglePause();
    expect(useAdventure.getState().rescueMemory(node.id)).toBe(false);
    useAdventure.getState().togglePause();
    expect(useAdventure.getState().rescueMemory(node.id)).toBe(true);
    expect(useAdventure.getState().rescueMemory(node.id)).toBe(false);
    expect(useAdventure.getState().objectives.memoryRescues.filter(x => x.rescued)).toHaveLength(1);
  });

  it("does not award victory without all three rescues even when both waves are dead", () => {
    useAdventure.getState().initAdventure("kai-jax", MISSION6_ID, "rift_frontier");
    defeatFirstWave();
    useAdventure.getState().spawnEnemies([
      ...useAdventure.getState().enemies,
      ...Array.from({ length: 8 }, (_, i) => enemy("w1-" + i, "hyena-scout")),
    ]);
    for (let i = 0; i < 8; i++) useAdventure.getState().damageEnemy("w1-" + i, 100);
    expect(outcome()).toBe("CONTINUE");
    for (const node of useAdventure.getState().objectives.memoryRescues.slice(0, 2)) {
      useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);
      expect(useAdventure.getState().rescueMemory(node.id)).toBe(true);
      expect(outcome()).toBe("CONTINUE");
    }
    const last = useAdventure.getState().objectives.memoryRescues[2];
    useAdventure.getState().setPlayerPos(last.posX, 0, last.posZ);
    expect(useAdventure.getState().rescueMemory(last.id)).toBe(true);
    expect(outcome()).toBe("VICTORY");
    expect(outcome(0)).toBe("CONTINUE");
  });

  it("retry resets all rescues and kills without mutating other missions", () => {
    useAdventure.getState().initAdventure("kai-jax", MISSION6_ID, "rift_frontier");
    defeatFirstWave();
    rescueAll();
    useAdventure.getState().retryMission();
    expect(useAdventure.getState().enemiesDefeated).toBe(0);
    expect(useAdventure.getState().objectives.memoryRescues.every(x => !x.unlocked && !x.rescued)).toBe(true);
    useAdventure.getState().initAdventure("kai-jax", "story_act1_m5", "memory_vault");
    expect(useAdventure.getState().objectives.memoryRescues).toEqual([]);
    expect(useAdventure.getState().objectives.civilianRegistry).toHaveLength(2);
  });
});
