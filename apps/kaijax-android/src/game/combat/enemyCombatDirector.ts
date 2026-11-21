import * as THREE from 'three';
import { EnemyArchetype } from '../types';

export interface ArchetypeConfig {
  kind: EnemyArchetype;
  maxHp: number;
  maxArmor: number;
  maxShieldHp: number;
  attackPower: number;
  speed: number;
  preferredRange: number;
  windupSeconds: number;
  recoverSeconds: number;
  xpReward: number;
  unblockableEveryN: number; // 0 = never unblockable, >0 = every Nth attack is unblockable
  evadesRepeatedLightAfter: number; // 0 = never, >0 = sidesteps light mash
  countersRepeatedLightAfter: number; // 0 = never, >0 = parries repetitive light mash
}

export const ARCHETYPE_CONFIGS: Record<EnemyArchetype, ArchetypeConfig> = {
  brawler: {
    kind: 'brawler',
    maxHp: 135,
    maxArmor: 35,
    maxShieldHp: 0,
    attackPower: 14,
    speed: 4.3,
    preferredRange: 2.15,
    windupSeconds: 0.62,
    recoverSeconds: 0.72,
    xpReward: 45,
    unblockableEveryN: 0,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 0,
  },
  stalker: {
    kind: 'stalker',
    maxHp: 100,
    maxArmor: 0,
    maxShieldHp: 0,
    attackPower: 12,
    speed: 5.5,
    preferredRange: 2.1,
    windupSeconds: 0.56,
    recoverSeconds: 0.68,
    xpReward: 40,
    unblockableEveryN: 0,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 0,
  },
  dodger: {
    kind: 'dodger',
    maxHp: 98,
    maxArmor: 0,
    maxShieldHp: 0,
    attackPower: 12,
    speed: 5.9,
    preferredRange: 2.25,
    windupSeconds: 0.54,
    recoverSeconds: 0.62,
    xpReward: 48,
    unblockableEveryN: 0,
    evadesRepeatedLightAfter: 3,
    countersRepeatedLightAfter: 0,
  },
  bruiser: {
    kind: 'bruiser',
    maxHp: 215,
    maxArmor: 85,
    maxShieldHp: 0,
    attackPower: 20,
    speed: 3.4,
    preferredRange: 2.55,
    windupSeconds: 0.84,
    recoverSeconds: 0.92,
    xpReward: 68,
    unblockableEveryN: 2,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 0,
  },
  marksman: {
    kind: 'marksman',
    maxHp: 88,
    maxArmor: 0,
    maxShieldHp: 0,
    attackPower: 12,
    speed: 3.3,
    preferredRange: 9.8,
    windupSeconds: 0.68,
    recoverSeconds: 0.85,
    xpReward: 42,
    unblockableEveryN: 0,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 0,
  },
  shield: {
    kind: 'shield',
    maxHp: 145,
    maxArmor: 25,
    maxShieldHp: 90,
    attackPower: 15,
    speed: 3.7,
    preferredRange: 2.2,
    windupSeconds: 0.66,
    recoverSeconds: 0.78,
    xpReward: 58,
    unblockableEveryN: 0,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 0,
  },
  assassin: {
    kind: 'assassin',
    maxHp: 120,
    maxArmor: 20,
    maxShieldHp: 0,
    attackPower: 17,
    speed: 6.2,
    preferredRange: 2.15,
    windupSeconds: 0.48,
    recoverSeconds: 0.58,
    xpReward: 65,
    unblockableEveryN: 3,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 4,
  },
  boss: {
    kind: 'boss',
    maxHp: 780,
    maxArmor: 190,
    maxShieldHp: 0,
    attackPower: 24,
    speed: 4.0,
    preferredRange: 3.2,
    windupSeconds: 0.9,
    recoverSeconds: 0.85,
    xpReward: 260,
    unblockableEveryN: 2,
    evadesRepeatedLightAfter: 0,
    countersRepeatedLightAfter: 0,
  },
};

export interface DirectorEnemyView {
  id: string;
  kind: EnemyArchetype;
  pos: THREE.Vector3;
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'recover' | 'stagger' | 'dead';
  snareTimer: number;
  stunTimer: number;
  wallPinnedTimer?: number;
  shieldHp?: number;
}

/**
 * Deterministic Attack-Token Regulator:
 * Prevents unfair off-screen dogpiling by limiting the number of simultaneous non-boss
 * enemies allowed to enter `windup` / `attack` at the same time (default maxTokens = 2).
 * Bosses always retain an independent priority channel.
 */
export function allocateAttackTokens(
  enemies: readonly DirectorEnemyView[],
  playerPos: THREE.Vector3,
  maxTokens = 2
): Set<string> {
  const granted = new Set<string>();
  let used = 0;

  // 1. Keep tokens on enemies already mid-windup or mid-attack so telegraphs never flicker
  for (const e of enemies) {
    if (e.state === 'dead') continue;
    if (e.kind === 'boss') {
      granted.add(e.id);
      continue;
    }
    if ((e.state === 'windup' || e.state === 'attack') && used < maxTokens) {
      granted.add(e.id);
      used += 1;
    }
  }

  if (used >= maxTokens) return granted;

  // 2. Grant remaining tokens to closest ready, non-incapacitated chasers
  const candidates = enemies
    .filter(
      (e) =>
        e.state === 'chase' &&
        e.kind !== 'boss' &&
        !granted.has(e.id) &&
        e.stunTimer <= 0 &&
        (e.wallPinnedTimer ?? 0) <= 0
    )
    .map((e) => ({ id: e.id, dist: e.pos.distanceTo(playerPos) }))
    .sort((a, b) => a.dist - b.dist);

  for (const c of candidates) {
    if (used >= maxTokens) break;
    if (c.dist <= 13.5) {
      granted.add(c.id);
      used += 1;
    }
  }

  return granted;
}

/**
 * Computes a horizontal anti-stacking separation vector so enemies maintain readable spacing
 * around the player rather than overlapping on the exact same coordinate.
 */
export function computeEnemySeparationVector(
  selfId: string,
  selfPos: THREE.Vector3,
  enemies: readonly DirectorEnemyView[],
  minSpacing = 1.45
): THREE.Vector3 {
  const push = new THREE.Vector3();
  for (const other of enemies) {
    if (other.id === selfId || other.state === 'dead') continue;
    const dx = selfPos.x - other.pos.x;
    const dz = selfPos.z - other.pos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < minSpacing * minSpacing) {
      const dist = Math.sqrt(distSq);
      if (dist < 1e-4) {
        push.x += selfId < other.id ? 1 : -1;
      } else {
        const strength = (minSpacing - dist) / minSpacing;
        push.x += (dx / dist) * strength * 4.2;
        push.z += (dz / dist) * strength * 4.2;
      }
    }
  }
  return push;
}

export type EnemyDefensiveReaction =
  | 'none'
  | 'dodger_sidestep'
  | 'assassin_counter'
  | 'shield_block'
  | 'shield_shattered';

/**
 * Evaluates smart archetype defensive counterplay against repetitive mashing or frontal strikes:
 * - `dodger` sidesteps 3+ consecutive light mashing unless snared, stunned, wall-pinned, or hit by web/heavy/counter.
 * - `assassin` parries & counters 4+ consecutive identical light attacks unless mixed up.
 * - `shield` blocks standard frontal strikes until broken by Heavy / Guard Break / Web Pull / Duo Finisher.
 */
export function evaluateEnemyDefensiveReaction(params: {
  kind: EnemyArchetype;
  shieldHp: number;
  incapacitated: boolean;
  isGuardBreakMove: boolean;
  isWebOrAbilityOrCounter: boolean;
  repeatLightCount: number;
}): EnemyDefensiveReaction {
  const { kind, shieldHp, incapacitated, isGuardBreakMove, isWebOrAbilityOrCounter, repeatLightCount } =
    params;

  if (incapacitated) return 'none';

  const cfg = ARCHETYPE_CONFIGS[kind];

  if (kind === 'shield' && shieldHp > 0) {
    return isGuardBreakMove ? 'shield_shattered' : 'shield_block';
  }

  if (!isGuardBreakMove && !isWebOrAbilityOrCounter) {
    if (cfg.evadesRepeatedLightAfter > 0 && repeatLightCount >= cfg.evadesRepeatedLightAfter) {
      return 'dodger_sidestep';
    }
    if (cfg.countersRepeatedLightAfter > 0 && repeatLightCount >= cfg.countersRepeatedLightAfter) {
      return 'assassin_counter';
    }
  }

  return 'none';
}
