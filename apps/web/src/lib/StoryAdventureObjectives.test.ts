import { beforeEach, describe, expect, it } from "vitest";
import { useAdventure, type AdventureEnemy } from "./stores/useAdventure";
import { evaluateCampaignProgressionGating } from "./adventureEvaluator";

const enemy = (id: string, fighterId: string, tier: AdventureEnemy["tier"], hp = 100): AdventureEnemy => ({
  id, fighterId, tier, health: hp, maxHealth: hp, isDead: false,
  posX: 0, posY: 0, posZ: 0, rotY: 0,
  isAggro: false, isAttacking: false, aiState: "idle",
  telegraphTimer: 0, patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
});
const outcome = (wave = 1, total = 2) => evaluateCampaignProgressionGating({
  ...useAdventure.getState(), currentWaveIndex: wave, totalWavesCount: total,
});
describe("StoryAdventure mission objective actions", () => {
  beforeEach(() => useAdventure.getState().reset());
  it("resets objectives without corrupting player initialization", () => {
    useAdventure.getState().initAdventure("kai-jax", "story_act1_m5", "memory_vault");
    expect(useAdventure.getState().objectives.civilianRegistry).toHaveLength(2);
    useAdventure.getState().reset();
    expect(useAdventure.getState().objectives.status).toBe("UNINITIALIZED");
    expect(useAdventure.getState().objectives.civilianRegistry).toEqual([]);
    expect(useAdventure.getState().player.fighterId).toBe("kai-jax");
  });
  it("tracks the stalker retreat at 10% and retains the milestone across waves", () => {
    useAdventure.getState().initAdventure("kai-jax", "story_act1_m4", "memory_vault");
    useAdventure.getState().spawnEnemies([enemy("stalker", "void-stalker", "boss1", 2000), enemy("guard", "neon-wraith", "minion1")]);
    useAdventure.getState().damageEnemy("stalker", 1799);
    expect(useAdventure.getState().objectives.milestones.stalkerIntercepted).toBe(false);
    useAdventure.getState().damageEnemy("stalker", 1);
    expect(useAdventure.getState().objectives.milestones.stalkerIntercepted).toBe(true);
    expect(outcome()).toBe("CONTINUE");
    useAdventure.getState().damageEnemy("guard", 100);
    expect(outcome()).toBe("VICTORY");
    useAdventure.getState().spawnEnemies([enemy("next", "neon-wraith", "minion1")]);
    expect(useAdventure.getState().objectives.milestones.stalkerIntercepted).toBe(true);
    expect(outcome()).toBe("CONTINUE");
  });
  it("fails when the chase target escapes", () => {
    useAdventure.getState().initAdventure("kai-jax", "story_act1_m4", "memory_vault");
    useAdventure.getState().markChaseTargetEscaped();
    expect(outcome()).toBe("FAILED");
  });
  it("protects civilians independently of hostile enemies and fails when none survive", () => {
    useAdventure.getState().initAdventure("kai-jax", "story_act1_m5", "memory_vault");
    useAdventure.getState().spawnEnemies([enemy("general", "rift-general", "boss2", 1200)]);
    expect(outcome()).toBe("CONTINUE");
    useAdventure.getState().damageCivilian("civ_01", 100);
    expect(outcome()).toBe("CONTINUE");
    useAdventure.getState().damageCivilian("civ_02", 100);
    expect(outcome()).toBe("FAILED");
  });
  it("requires the Rift General defeat milestone even when all minions are gone", () => {
    useAdventure.getState().initAdventure("kai-jax", "story_act1_m5", "memory_vault");
    useAdventure.getState().spawnEnemies([enemy("general", "rift-general", "boss2", 1200)]);
    useAdventure.getState().damageEnemy("general", 1200);
    expect(useAdventure.getState().objectives.milestones.generalDefeated).toBe(true);
    expect(outcome()).toBe("VICTORY");
    useAdventure.getState().reset();
    expect(useAdventure.getState().objectives.milestones.generalDefeated).toBe(false);
  });
});
