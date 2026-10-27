import { beforeEach, describe, expect, it } from "vitest";
import { useAdventure, type AdventureEnemy } from "./stores/useAdventure";
import { useMissions } from "./stores/useMissions";
import { useRunner } from "./stores/useRunner";
import { MISSION6_ID } from "./mission6";
import { normalizeWaveEnemies } from "./storyWaveRuntime";
import { getStoryMissionById } from "./story_missions";
import { evaluateCampaignProgressionGating } from "./adventureEvaluator";

const mission = getStoryMissionById(MISSION6_ID)!;
const enemy = (id: string, fighterId: string): AdventureEnemy => ({
  id, fighterId, tier: fighterId === "hyena-scout" ? "minion2" : "minion1",
  posX: 0, posY: 0, posZ: 0, rotY: 0, health: 100, maxHealth: 100,
  isAggro: false, isAttacking: false, isDead: false, aiState: "idle",
  telegraphTimer: 0, patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
});

function progression(wave: number) {
  const s = useAdventure.getState();
  return evaluateCampaignProgressionGating({
    missionId: s.missionId, enemies: s.enemies, objectives: s.objectives,
    currentWaveIndex: wave, totalWavesCount: mission.enemyWaves.length,
  });
}

function clearM6ThroughActions() {
  useAdventure.getState().initAdventure("kai-jax", MISSION6_ID, "rift_frontier");
  useMissions.getState().startMission("story", MISSION6_ID);
  const first = normalizeWaveEnemies(mission, 0).map((spec, i) => enemy(`w0-${i}`, spec.fighterId));
  expect(first).toHaveLength(6);
  useAdventure.getState().spawnEnemies(first);
  first.forEach(e => useAdventure.getState().damageEnemy(e.id, 100));
  expect(useAdventure.getState().enemiesDefeated).toBe(6);
  expect(progression(0)).toBe("CONTINUE");

  const second = normalizeWaveEnemies(mission, 1).map((spec, i) => enemy(`w1-${i}`, spec.fighterId));
  expect(second).toHaveLength(8);
  useAdventure.getState().spawnEnemies([...useAdventure.getState().enemies, ...second]);
  second.forEach(e => useAdventure.getState().damageEnemy(e.id, 100));
  expect(useAdventure.getState().enemiesDefeated).toBe(14);
  expect(progression(1)).toBe("CONTINUE");

  // No automatic recovery on a kill: physically approach and rescue each node.
  const nodes = useAdventure.getState().objectives.memoryRescues;
  expect(nodes.filter(n => n.rescued)).toHaveLength(0);
  for (const node of nodes) {
    useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);
    expect(useAdventure.getState().rescueMemory(node.id)).toBe(true);
  }
  expect(progression(1)).toBe("VICTORY");
}

describe("M6-C Ashblock first-clear reward settlement", () => {
  beforeEach(() => {
    for (let i = 0; i < 3; i++) useRunner.getState().resetProfile(i);
    useRunner.getState().switchProfile(0);
    useMissions.setState({ active: null, objectives: [], completedKeys: [], result: null, lastReward: null });
    useAdventure.getState().reset();
  });

  it("settles a full 14-enemy clear and three interactive rescues, once", () => {
    clearM6ThroughActions();
    useMissions.getState().completeMission(true);
    expect(useMissions.getState().lastReward).toEqual({
      xp: 500, currency: 350, loot: ["Ashblock Memory"], totalPoints: 850, granted: true,
    });
    expect(useRunner.getState().totalScore).toBe(850);
    expect(useRunner.getState().storyLoot).toEqual(["Ashblock Memory"]);
    expect(useRunner.getState().profiles[0].storyLoot).toEqual(["Ashblock Memory"]);
    expect(useRunner.getState().completedStoryMissionIds).toContain(MISSION6_ID);
    expect(useMissions.getState().completedKeys).toContain(`story:${MISSION6_ID}`);

    useMissions.getState().startMission("story", MISSION6_ID);
    useMissions.getState().completeMission(true);
    expect(useMissions.getState().lastReward?.granted).toBe(false);
    expect(useRunner.getState().totalScore).toBe(850);
    expect(useRunner.getState().storyLoot).toEqual(["Ashblock Memory"]);
  });

  it("restores unique loot when switching save profiles, without leaking into another slot", () => {
    clearM6ThroughActions();
    useMissions.getState().completeMission(true);
    useRunner.getState().switchProfile(1);
    expect(useRunner.getState().storyLoot).toEqual([]);
    expect(useRunner.getState().totalScore).toBe(0);
    useRunner.getState().switchProfile(0);
    expect(useRunner.getState().storyLoot).toEqual(["Ashblock Memory"]);
    expect(useRunner.getState().profiles[0].storyLoot).toEqual(["Ashblock Memory"]);
  });

  it("rejects unearned rewards on failed or incomplete runs", () => {
    useMissions.getState().startMission("story", MISSION6_ID);
    useMissions.getState().completeMission(false);
    expect(useMissions.getState().lastReward).toBeNull();
    expect(useRunner.getState().storyLoot).toEqual([]);
    expect(useRunner.getState().totalScore).toBe(0);
    useRunner.getState().grantStoryLoot(["Ashblock Memory", "Ashblock Memory"]);
    expect(useRunner.getState().storyLoot).toEqual(["Ashblock Memory"]);
    useRunner.getState().grantStoryLoot(["Ashblock Memory"]);
    expect(useRunner.getState().storyLoot).toHaveLength(1);
  });

  it("normalizes older save profiles without a loot field", () => {
    useRunner.getState().switchProfile(2);
    expect(useRunner.getState().storyLoot).toEqual([]);
    expect(useRunner.getState().profiles[2].storyLoot).toEqual([]);
  });
});
