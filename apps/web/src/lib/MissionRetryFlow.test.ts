import { describe, it, expect, beforeEach } from "vitest";
import { useAdventure } from "./stores/useAdventure";
import { evaluateCampaignProgressionGating } from "./adventureEvaluator";

describe("Mission Retry Flow", () => {
  beforeEach(() => {
    useAdventure.getState().reset();
  });

  describe("Mission 4 Victory -> Retry", () => {
    it("should show victory when all conditions met (final wave + stalker intercepted + no live enemies)", () => {
      const store = useAdventure.getState();
      store.initAdventure("kai-jax", "story_act1_m4", "ashblock-mission-4");

      // Get updated state after init
      let state = useAdventure.getState();

      // Simulate final wave (waveCount must be at final wave threshold)
      // Set it to a high wave number to trigger final wave check
      const setState = useAdventure.setState;
      setState({ waveCount: 5 }); // Assume 5 is final wave

      state = useAdventure.getState();

      // Simulate final wave with all enemies defeated
      state.spawnEnemies([
        {
          id: "stalker_final",
          fighterId: "void-stalker",
          tier: "boss2",
          posX: 15,
          posY: 0,
          posZ: 15,
          rotY: 0,
          health: 0,
          maxHealth: 400,
          isAggro: true,
          isAttacking: false,
          isDead: true,
          aiState: "retreat",
          telegraphTimer: 0,
          patrolTargetX: 0,
          patrolTargetZ: 0,
          stunTimer: 0,
        },
      ]);

      state = useAdventure.getState();
      state.objectives.milestones.stalkerIntercepted = true;

      const result = evaluateCampaignProgressionGating({
        missionId: useAdventure.getState().missionId,
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });
      expect(result).toBe("VICTORY");
    });

    it("should allow retry which resets player and enemies but keeps mission", () => {
      const store = useAdventure.getState();
      store.initAdventure("kai-jax", "story_act1_m4", "ashblock-mission-4");

      let state = useAdventure.getState();
      const missionIdBefore = state.missionId;
      const arenaIdBefore = state.arenaId;

      state.spawnEnemies([
        {
          id: "enemy1",
          fighterId: "fang_minion",
          tier: "minion1",
          posX: 10,
          posY: 0,
          posZ: 10,
          rotY: 0,
          health: 0,
          maxHealth: 40,
          isAggro: true,
          isAttacking: false,
          isDead: true,
          aiState: "idle",
          telegraphTimer: 0,
          patrolTargetX: 0,
          patrolTargetZ: 0,
          stunTimer: 0,
        },
      ]);

      // Trigger retry
      state.retryMission();

      const retryState = useAdventure.getState();
      expect(retryState.missionId).toBe(missionIdBefore);
      expect(retryState.arenaId).toBe(arenaIdBefore);
      expect(retryState.enemies).toHaveLength(0);
      expect(retryState.player.health).toBe(100);
      expect(retryState.player.stamina).toBe(retryState.player.maxStamina);
      expect(retryState.waveCount).toBe(1);
      expect(retryState.objectives.status).toBe("ACTIVE");
    });
  });

  describe("Mission 5 Failure -> Retry", () => {
    it("should trigger FAILED when all civilians die (precedence over victory)", () => {
      const store = useAdventure.getState();
      store.initAdventure("kai-jax", "story_act1_m5", "rift-mission-5");

      // Get updated state after init to verify civilians
      let state = useAdventure.getState();
      expect(state.objectives.civilianRegistry).toHaveLength(2);

      // Kill all civilians
      state.damageCivilian("civ_01", 100);
      state.damageCivilian("civ_02", 100);

      const currentState = useAdventure.getState();
      expect(currentState.objectives.civilianRegistry[0].health).toBeLessThanOrEqual(0);
      expect(currentState.objectives.civilianRegistry[1].health).toBeLessThanOrEqual(0);

      const result = evaluateCampaignProgressionGating({
        missionId: currentState.missionId,
        enemies: currentState.enemies,
        objectives: currentState.objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });
      expect(result).toBe("FAILED");
    });

    it("should allow retry which resets civilians to full health", () => {
      const store = useAdventure.getState();
      store.initAdventure("kai-jax", "story_act1_m5", "rift-mission-5");

      let state = useAdventure.getState();
      // Damage civilians
      state.damageCivilian("civ_01", 50);
      state.damageCivilian("civ_02", 75);

      const beforeRetry = useAdventure.getState();
      expect(beforeRetry.objectives.civilianRegistry[0].health).toBe(50);
      expect(beforeRetry.objectives.civilianRegistry[1].health).toBe(25);

      // Retry
      state.retryMission();

      const afterRetry = useAdventure.getState();
      expect(afterRetry.objectives.civilianRegistry[0].health).toBe(100);
      expect(afterRetry.objectives.civilianRegistry[1].health).toBe(100);
      expect(afterRetry.objectives.status).toBe("ACTIVE");
    });
  });

  describe("Retry Wave Reset", () => {
    it("should reset wave counter to 1 on retry", () => {
      const store = useAdventure.getState();
      store.initAdventure("kai-jax", "story_act1_m4", "ashblock-mission-4");

      let state = useAdventure.getState();
      // Simulate wave progression - spawn multiple enemies
      for (let i = 0; i < 5; i++) {
        state.spawnEnemies([
          {
            id: `enemy_wave${i}`,
            fighterId: "minion",
            tier: "minion1",
            posX: 0,
            posY: 0,
            posZ: 0,
            rotY: 0,
            health: 10,
            maxHealth: 40,
            isAggro: false,
            isAttacking: false,
            isDead: false,
            aiState: "idle",
            telegraphTimer: 0,
            patrolTargetX: 0,
            patrolTargetZ: 0,
            stunTimer: 0,
          },
        ]);
      }

      const stateBeforeRetry = useAdventure.getState();
      expect(stateBeforeRetry.enemies.length).toBeGreaterThan(0);

      state.retryMission();

      const retryState = useAdventure.getState();
      expect(retryState.waveCount).toBe(1);
      expect(retryState.enemies).toHaveLength(0);
    });
  });
});
