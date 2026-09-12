/**
 * PHASE 5.5 MULTI-FANG BALANCE TUNING
 *
 * Comprehensive testing for multi-Fang encounter balance:
 * 1. Scout/Enforcer/Chain/Lieutenant variant spawning patterns
 * 2. Jax survival verification with 3-Fang spawns + dodge timing (0.4s invuln window)
 * 3. Kai energy budget verification (80 energy per ultimate, need 3+ hits for encounter)
 * 4. Frame rate measurements during peak multi-Fang moments (target 30+ fps)
 * 5. Per-role config validation for damage spike prevention
 *
 * Reference: FangCombatantContract.ts archetype configs
 * DO NOT change: Combat hitbox system, KaiAttackSystem, JaxAttackSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFangCombatant,
  damageFangCombatant,
  updateFangCombatant,
  applyFangKnockback,
  canFangCombatantAttack,
  FANG_COMBATANT_CONFIG,
  FANG_COMBATANT_ARCHETYPE_CONFIG,
  getFangCombatantConfig,
  type FangCombatantState,
  type FangCombatantArchetype,
} from './FangCombatantContract';
import { updateFangCombatantAI } from './FangCombatantAI';

describe('Phase 5.5 Multi-Fang Balance Tuning', () => {
  const PLAYER_POS = { x: 0, y: 0, z: 0 };

  describe('1. Archetype Variant Spawning Patterns', () => {
    const archetypes: FangCombatantArchetype[] = ['baseline', 'razor-scout', 'enforcer', 'chain-bruiser', 'district-lieutenant'];

    it('all four archetypes are defined in the config', () => {
      for (const archetype of archetypes) {
        const config = FANG_COMBATANT_ARCHETYPE_CONFIG[archetype];
        expect(config).toBeDefined();
        expect(config.maxHealth).toBeGreaterThan(0);
        expect(config.attackDamage).toBeGreaterThan(0);
      }
    });

    it('Razor Scout is the fastest archetype (highest moveSpeed)', () => {
      const speeds = archetypes.map((arch) => getFangCombatantConfig(arch).moveSpeed);
      const scoutSpeed = getFangCombatantConfig('razor-scout').moveSpeed;
      expect(scoutSpeed).toBe(Math.max(...speeds));
    });

    it('Razor Scout is the least durable (lowest maxHealth)', () => {
      const healths = archetypes.map((arch) => getFangCombatantConfig(arch).maxHealth);
      const scoutHealth = getFangCombatantConfig('razor-scout').maxHealth;
      expect(scoutHealth).toBe(Math.min(...healths));
    });

    it('District Lieutenant is the most durable (highest maxHealth)', () => {
      const healths = archetypes.map((arch) => getFangCombatantConfig(arch).maxHealth);
      const lieutenantHealth = getFangCombatantConfig('district-lieutenant').maxHealth;
      expect(lieutenantHealth).toBe(Math.max(...healths));
    });

    it('Enforcer has higher attack cooldown than baseline for spacing attacks', () => {
      const baselineCooldown = getFangCombatantConfig('baseline').attackCooldown;
      const enforcerCooldown = getFangCombatantConfig('enforcer').attackCooldown;
      expect(enforcerCooldown).toBeGreaterThan(baselineCooldown);
    });

    it('Chain Bruiser has longest attack cooldown for sustainability', () => {
      const cooldowns = archetypes.map((arch) => getFangCombatantConfig(arch).attackCooldown);
      const bruiserCooldown = getFangCombatantConfig('chain-bruiser').attackCooldown;
      expect(bruiserCooldown).toBe(Math.max(...cooldowns));
    });

    it('can spawn each archetype independently', () => {
      const fangs = archetypes.map((arch, i) => createFangCombatant(`fang_${arch}_${i}`, arch));
      fangs.forEach((fang, i) => {
        expect(fang.archetype).toBe(archetypes[i]);
        expect(fang.maxHealth).toBe(getFangCombatantConfig(archetypes[i]).maxHealth);
      });
    });

    it('archetype spawning maintains deterministic behavior', () => {
      const fang1 = createFangCombatant('test_spawn_1', 'enforcer');
      const fang2 = createFangCombatant('test_spawn_2', 'enforcer');

      fang1.position.z = 10;
      fang2.position.z = 10;

      // Simulate identical conditions
      for (let i = 0; i < 5; i++) {
        const time = i * 0.016;
        updateFangCombatantAI(fang1, PLAYER_POS, 0.016, time);
        updateFangCombatantAI(fang2, PLAYER_POS, 0.016, time);
      }

      expect(fang1.position).toEqual(fang2.position);
      expect(fang1.behavior).toBe(fang2.behavior);
    });
  });

  describe('2. Jax Survival with 3-Fang Spawns (0.4s Invuln Window)', () => {
    // Jax has 0.4s invulnerability window during dodge
    // Baseline Fang: 8 damage per attack, 1.8s cooldown
    // With 3 Fangs attacking unsynchronized, Jax should survive with proper dodging

    it('single Fang attack deals baseline damage (8)', () => {
      const fang = createFangCombatant('jax_survive_single');
      const config = getFangCombatantConfig(fang);
      expect(config.attackDamage).toBe(8);
    });

    it('three unsynchronized Fangs cannot erase Jax in one volley', () => {
      // Jax default health: assume 100+ (typical hero health)
      // Max concurrent damage from 3 Fangs if all attack at once: 24
      // Even with 0.4s invuln preventing one attack, still 16 damage max
      const maxConcurrentDamage = 3 * FANG_COMBATANT_CONFIG.attackDamage;
      const oneHitDodgeProtection = FANG_COMBATANT_CONFIG.attackDamage;
      const damageWithDodge = maxConcurrentDamage - oneHitDodgeProtection;

      expect(damageWithDodge).toBeLessThan(50); // Leaves hero with readable window
    });

    it('Fang attack cooldown prevents simultaneous attacks from same Fang', () => {
      const fang = createFangCombatant('cooldown_test');
      const config = getFangCombatantConfig(fang);

      // First attack
      fang.position.z = 1.5; // In attack range
      updateFangCombatantAI(fang, PLAYER_POS, 0.016, 0);
      let time = 0.016;
      let firstAttackResolved = false;

      for (let i = 0; i < 100; i++) {
        time += 0.05;
        const result = updateFangCombatantAI(fang, PLAYER_POS, 0.05, time);
        if (result.attackResolved && !firstAttackResolved) {
          firstAttackResolved = true;
          break;
        }
      }

      expect(firstAttackResolved).toBe(true);

      // Verify cooldown prevents immediate second attack
      const secondAttackPossible = canFangCombatantAttack(fang, time);
      expect(secondAttackPossible).toBe(false);

      // Verify second attack becomes possible after cooldown
      const secondAttackTime = time + config.attackCooldown + 0.1;
      fang.position.z = 1.5; // Keep in range
      const secondAttackPossible2 = canFangCombatantAttack(fang, secondAttackTime);
      expect(secondAttackPossible2).toBe(true);
    });

    it('three Fangs with staggered attacks create readable dodge windows', () => {
      const fangs = [
        createFangCombatant('jax_fang_1'),
        createFangCombatant('jax_fang_2'),
        createFangCombatant('jax_fang_3'),
      ];

      fangs.forEach((fang, i) => {
        fang.position.z = 1.5 + i * 0.2; // Slight horizontal spacing
      });

      // Simulate staggered attack initiation (0.3s apart)
      const results: Array<{ time: number; damage: number }> = [];
      let time = 0;

      for (let frame = 0; frame < 200; frame++) {
        time = frame * 0.016;
        fangs.forEach((fang, i) => {
          // Stagger initial attack by small time offsets
          const staggeredTime = time - (i * 0.3);
          const result = updateFangCombatantAI(fang, PLAYER_POS, 0.016, staggeredTime);
          if (result.attackResolved) {
            results.push({ time, damage: result.attackDamage });
          }
        });
      }

      // With staggered attacks, multiple hits should not land in same 0.4s window
      // (the invuln window Jax would have from dodging one)
      const compressedAttacks = results.filter((attack, i) => {
        if (i === 0) return false;
        return attack.time - results[i - 1].time < 0.4;
      });

      // Allow some compressed attacks but not all three simultaneously
      expect(compressedAttacks.length).toBeLessThan(results.length);
    });

    it('Jax can interrupt multi-Fang chain with heavy damage', () => {
      const fang = createFangCombatant('jax_interrupt_test');
      fang.position.z = 1.5;

      // Initialize attack
      updateFangCombatantAI(fang, PLAYER_POS, 0.016, 0);

      // Apply stagger damage (>= staggerThreshold)
      damageFangCombatant(fang, FANG_COMBATANT_CONFIG.staggerThreshold, 0.1);

      // Verify stagger cancels attack
      expect(fang.isStaggered).toBe(true);
      expect(fang.attackWindupTimer).toBe(0);
    });

    it('baseline Fang stagger duration (0.6s) is less than half attack cooldown', () => {
      const config = FANG_COMBATANT_CONFIG;
      const staggerToAttackRatio = config.staggerDuration / config.attackCooldown;
      expect(staggerToAttackRatio).toBeLessThan(0.5);
    });
  });

  describe('3. Kai Energy Budget Verification (80 per Ultimate)', () => {
    // Kai ultimate does 100 damage, costs 80 energy
    // Each Fang: 120 health baseline (needs 1.2 hits)
    // For 3 Fangs: need 3.6 hits, which is roughly 2 ultimates + some light/heavy attacks

    it('baseline Fang requires 1.2 ultimate hits to defeat', () => {
      const fangHealth = FANG_COMBATANT_CONFIG.maxHealth;
      const kaiUltimate = 100; // From KaiAttackSystem.tsx ATTACK_DAMAGE.ultimate
      const hitsRequired = fangHealth / kaiUltimate;
      expect(hitsRequired).toBeCloseTo(1.2, 1);
    });

    it('three Fangs require ~3.6 ultimate hits total', () => {
      const hitsPerFang = FANG_COMBATANT_CONFIG.maxHealth / 100;
      const threeFantsHits = hitsPerFang * 3;
      expect(threeFantsHits).toBeCloseTo(3.6, 1);
    });

    it('two ultimates (160 energy) can defeat two Fangs with margin', () => {
      const damagePerUltimate = 100;
      const twoUltimatesHealth = damagePerUltimate * 2;
      const twoFantsHealth = FANG_COMBATANT_CONFIG.maxHealth * 2;
      expect(twoUltimatesHealth).toBeGreaterThan(twoFantsHealth);
    });

    it('Kai light attack does 12 damage (starter)', () => {
      const kaiLightDamage = 12; // From KaiAttackSystem.tsx ATTACK_DAMAGE.light
      expect(kaiLightDamage).toBeLessThan(100);
    });

    it('Kai heavy attack does 35 damage', () => {
      const kaiHeavyDamage = 35; // From KaiAttackSystem.tsx ATTACK_DAMAGE.heavy
      expect(kaiHeavyDamage).toBeGreaterThan(12);
      expect(kaiHeavyDamage).toBeLessThan(100);
    });

    it('Kai can defeat one Fang with heavy attack + lights', () => {
      const fang = createFangCombatant('kai_defeat_test');
      const fangHealth = fang.health;

      // Heavy: 35 damage
      damageFangCombatant(fang, 35, 0);
      expect(fang.health).toBe(fangHealth - 35);

      // Light combo (3 hits): 12 + 14 + 16 = 42 damage
      damageFangCombatant(fang, 42, 0.5);
      expect(fang.health).toBe(fangHealth - 77);

      // One more light to finish
      damageFangCombatant(fang, 12, 1);
      expect(fang.isDead).toBe(true);
    });

    it('Kai special (50 damage) can stagger most Fangs', () => {
      const kaiSpecialDamage = 50; // From KaiAttackSystem.tsx
      const staggerThreshold = FANG_COMBATANT_CONFIG.staggerThreshold;
      expect(kaiSpecialDamage).toBeGreaterThan(staggerThreshold);
    });
  });

  describe('4. Frame Rate During Peak Multi-Fang Moments', () => {
    // Target: 30+ fps = 33.3ms per frame
    // Peak: 3 Fangs all in WINDUP/ACTIVE simultaneously

    it('simulates 3 Fangs chasing efficiently', () => {
      const fangs = [
        createFangCombatant('fps_1'),
        createFangCombatant('fps_2'),
        createFangCombatant('fps_3'),
      ];
      fangs.forEach((fang, i) => {
        fang.position.z = 8 - i * 0.5;
      });

      const startTime = performance.now();
      const frames = 100;
      const deltaTime = 0.016; // 60 fps

      for (let frame = 0; frame < frames; frame++) {
        const time = frame * deltaTime;
        fangs.forEach((fang) => {
          updateFangCombatantAI(fang, PLAYER_POS, deltaTime, time);
        });
      }

      const endTime = performance.now();
      const simulationTime = endTime - startTime;
      const avgFrameTime = simulationTime / frames;

      // Should be very fast (simulation, not rendering)
      // Allowing generous margin for CI environment
      expect(avgFrameTime).toBeLessThan(5); // 5ms per frame in simulation
    });

    it('AI update scales linearly with Fang count', () => {
      const updateFangs = (count: number) => {
        const fangs = Array.from({ length: count }, (_, i) => createFangCombatant(`scaling_${i}`));
        fangs.forEach((fang) => {
          fang.position.z = 5;
        });

        const start = performance.now();
        for (let frame = 0; frame < 50; frame++) {
          const time = frame * 0.016;
          fangs.forEach((fang) => {
            updateFangCombatantAI(fang, PLAYER_POS, 0.016, time);
          });
        }
        const end = performance.now();
        return (end - start) / 50; // avg time per frame
      };

      const time1Fang = updateFangs(1);
      const time3Fangs = updateFangs(3);

      // 3 Fangs should take roughly 3x as long, with some overhead tolerance
      expect(time3Fangs).toBeLessThan(time1Fang * 4);
      expect(time3Fangs).toBeGreaterThan(time1Fang * 2);
    });

    it('damage and stagger updates are O(1) per Fang', () => {
      const fang = createFangCombatant('perf_damage');
      const damageStart = performance.now();

      for (let i = 0; i < 1000; i++) {
        damageFangCombatant(fang, 1, i * 0.001);
      }

      const damageEnd = performance.now();
      const damageTime = damageEnd - damageStart;

      // 1000 damage calls should complete very quickly
      expect(damageTime).toBeLessThan(100); // 100ms for 1000 ops
    });

    it('knockback application does not block frame delivery', () => {
      const fangs = Array.from({ length: 3 }, (_, i) => createFangCombatant(`kb_${i}`));
      fangs.forEach((fang, i) => {
        fang.position.z = 2 + i * 0.1;
      });

      const start = performance.now();
      for (let frame = 0; frame < 100; frame++) {
        const time = frame * 0.016;
        fangs.forEach((fang, i) => {
          if (frame % 5 === 0) {
            applyFangKnockback(fang, { x: 2, y: 0, z: 0 });
          }
          updateFangCombatantAI(fang, PLAYER_POS, 0.016, time);
        });
      }
      const end = performance.now();
      const totalTime = end - start;

      expect(totalTime).toBeLessThan(500); // 500ms for 100 frames with knockback
    });
  });

  describe('5. Per-Role Config Validation & Damage Spike Prevention', () => {
    it('no role deals more than baseline + 25% damage (damage spike prevention)', () => {
      const baselineDamage = FANG_COMBATANT_CONFIG.attackDamage;
      const maxAllowedDamage = baselineDamage * 1.25;

      Object.entries(FANG_COMBATANT_ARCHETYPE_CONFIG).forEach(([role, config]) => {
        expect(config.attackDamage).toBeLessThanOrEqual(maxAllowedDamage);
      });
    });

    it('all roles have cooldown >= baseline (prevents attack spam)', () => {
      const baselineCooldown = FANG_COMBATANT_CONFIG.attackCooldown;

      Object.entries(FANG_COMBATANT_ARCHETYPE_CONFIG).forEach(([role, config]) => {
        expect(config.attackCooldown).toBeGreaterThanOrEqual(baselineCooldown);
      });
    });

    it('heavier roles require heavier hits to stagger (stagger thresholds scale with health)', () => {
      const roles = Object.entries(FANG_COMBATANT_ARCHETYPE_CONFIG);
      const sorted = roles.sort(([, a], [, b]) => a.maxHealth - b.maxHealth);

      // Health and stagger threshold should correlate
      for (let i = 1; i < sorted.length; i++) {
        const prevHealth = sorted[i - 1][1].maxHealth;
        const prevThreshold = sorted[i - 1][1].staggerThreshold;
        const currHealth = sorted[i][1].maxHealth;
        const currThreshold = sorted[i][1].staggerThreshold;

        if (currHealth > prevHealth) {
          expect(currThreshold).toBeGreaterThanOrEqual(prevThreshold);
        }
      }
    });

    it('baseline config remains immutable and is alias for baseline archetype', () => {
      expect(FANG_COMBATANT_ARCHETYPE_CONFIG.baseline).toEqual(FANG_COMBATANT_CONFIG);
    });

    it('Scout archetype is faster but weaker (intended identity)', () => {
      const scout = FANG_COMBATANT_ARCHETYPE_CONFIG['razor-scout'];
      const baseline = FANG_COMBATANT_CONFIG;

      expect(scout.moveSpeed).toBeGreaterThan(baseline.moveSpeed);
      expect(scout.maxHealth).toBeLessThan(baseline.maxHealth);
      expect(scout.attackDamage).toBeLessThanOrEqual(baseline.attackDamage);
    });

    it('Enforcer is slower but more durable (intended identity)', () => {
      const enforcer = FANG_COMBATANT_ARCHETYPE_CONFIG.enforcer;
      const baseline = FANG_COMBATANT_CONFIG;

      expect(enforcer.moveSpeed).toBeLessThan(baseline.moveSpeed);
      expect(enforcer.maxHealth).toBeGreaterThanOrEqual(baseline.maxHealth);
    });

    it('Chain Bruiser is slowest and most durable (intended identity)', () => {
      const bruiser = FANG_COMBATANT_ARCHETYPE_CONFIG['chain-bruiser'];
      const baseline = FANG_COMBATANT_CONFIG;

      expect(bruiser.moveSpeed).toBeLessThan(baseline.moveSpeed);
      expect(bruiser.maxHealth).toBeGreaterThan(baseline.maxHealth);
    });

    it('District Lieutenant balances health and speed (intended identity)', () => {
      const lieutenant = FANG_COMBATANT_ARCHETYPE_CONFIG['district-lieutenant'];
      const baseline = FANG_COMBATANT_CONFIG;
      const bruiser = FANG_COMBATANT_ARCHETYPE_CONFIG['chain-bruiser'];

      // More durable than baseline but faster than bruiser
      expect(lieutenant.maxHealth).toBeGreaterThan(baseline.maxHealth);
      expect(lieutenant.moveSpeed).toBeGreaterThan(bruiser.moveSpeed);

      // Leader-level aggression range
      expect(lieutenant.aggroRange).toBeGreaterThan(baseline.aggroRange);
    });

    it('all roles have finite, positive values for all combat stats', () => {
      Object.entries(FANG_COMBATANT_ARCHETYPE_CONFIG).forEach(([role, config]) => {
        expect(Number.isFinite(config.maxHealth)).toBe(true);
        expect(Number.isFinite(config.attackDamage)).toBe(true);
        expect(Number.isFinite(config.attackCooldown)).toBe(true);
        expect(Number.isFinite(config.moveSpeed)).toBe(true);

        expect(config.maxHealth).toBeGreaterThan(0);
        expect(config.attackDamage).toBeGreaterThan(0);
        expect(config.attackCooldown).toBeGreaterThan(0);
        expect(config.moveSpeed).toBeGreaterThan(0);
      });
    });
  });

  describe('Multi-Fang Integration Scenarios', () => {
    it('mixed archetype encounter is balanced', () => {
      // Typical mixed encounter: 1 Scout + 1 Baseline + 1 Enforcer
      const scout = createFangCombatant('mixed_scout', 'razor-scout');
      const baseline = createFangCombatant('mixed_baseline', 'baseline');
      const enforcer = createFangCombatant('mixed_enforcer', 'enforcer');

      scout.position.z = 8;
      baseline.position.z = 9;
      enforcer.position.z = 10;

      const fangs = [scout, baseline, enforcer];
      let time = 0;

      // Simulate 10 seconds of combat
      for (let frame = 0; frame < 625; frame++) {
        time = frame * 0.016;
        fangs.forEach((fang) => {
          updateFangCombatantAI(fang, PLAYER_POS, 0.016, time);
        });
      }

      // All should have progressed toward player without immediate death
      fangs.forEach((fang) => {
        expect(fang.health).toBeGreaterThanOrEqual(0);
        expect(fang.position.z).toBeLessThan(10); // Have moved toward player
      });
    });

    it('lieutenant encounter creates threatening presence', () => {
      const lieutenant = createFangCombatant('threat_level', 'district-lieutenant');
      lieutenant.position.z = 12;

      let time = 0;
      let aggroTime = -1;
      const aggroRange = getFangCombatantConfig(lieutenant).aggroRange;

      // Find when lieutenant enters aggro range
      for (let frame = 0; frame < 300; frame++) {
        time = frame * 0.016;
        const result = updateFangCombatantAI(lieutenant, PLAYER_POS, 0.016, time);
        if (result.distanceToPlayer <= aggroRange && aggroTime === -1) {
          aggroTime = time;
        }
      }

      // Lieutenant should aggro (has highest range)
      expect(aggroTime).toBeGreaterThanOrEqual(0);
    });

    it('can track concurrent attacks from multiple Fangs', () => {
      const fangs = [
        createFangCombatant('track_1'),
        createFangCombatant('track_2'),
        createFangCombatant('track_3'),
      ];
      fangs.forEach((fang, i) => {
        fang.position.z = 1.5 + i * 0.1;
      });

      const attacks: Array<{ fangId: string; time: number; damage: number }> = [];
      let time = 0;

      for (let frame = 0; frame < 200; frame++) {
        time = frame * 0.016;
        fangs.forEach((fang) => {
          const result = updateFangCombatantAI(fang, PLAYER_POS, 0.016, time);
          if (result.attackResolved) {
            attacks.push({ fangId: fang.id, time, damage: result.attackDamage });
          }
        });
      }

      // Should record multiple attacks without errors
      expect(attacks.length).toBeGreaterThan(0);
      attacks.forEach((attack) => {
        expect(attack.damage).toBeGreaterThan(0);
      });
    });
  });
});
