/**
 * LEGENDARY BOSS DESIGNS - BEYOND BEYOND LEGENDARY
 * 
 * World-class boss designs with:
 * - Epic visual designs
 * - Advanced attack patterns
 * - Phase transitions
 * - Cinematic moments
 * - Unique mechanics
 */

import type { BossConfig, BossPhaseData, BossAttack } from '../types/boss.types';
import { BossPhase, BossState } from '../types/boss.types';

/**
 * ENHANCED VOID KING - Ultimate Final Boss
 */
export const LEGENDARY_VOID_KING: BossConfig = {
  id: 'void_king_legendary',
  name: 'The Void King',
  maxHealth: 10000, // Massive health pool
  position: { x: 0, y: 0 },
  facing: 1,
  utilities: {
    hunger: 0.9, // Very aggressive
    aggression: 0.95, // Extremely aggressive
    selfPreservation: 0.3, // Low self-preservation (desperate)
  },
  learningEnabled: true,
  phases: [
    {
      phaseNumber: BossPhase.PHASE_1_PATTERN_LEARNING,
      healthThreshold: 100,
      damageMultiplier: 1.5,
      speedMultiplier: 1.2,
      attacks: [
        {
          id: 'void_strike_legendary',
          name: 'Void Strike',
          damage: 150,
          windupFrames: 60,
          activeFrames: 10,
          recoveryFrames: 30,
          cooldown: 80,
          pattern: 'linear',
          telegraphDuration: 60,
          telegraphVisual: 'void_energy',
          range: 10,
          knockback: 50,
        },
        {
          id: 'dimensional_tear',
          name: 'Dimensional Tear',
          damage: 200,
          windupFrames: 90,
          activeFrames: 30,
          recoveryFrames: 40,
          cooldown: 120,
          pattern: 'aoe',
          telegraphDuration: 90,
          telegraphVisual: 'rift_expansion',
          range: 15,
          knockback: 80,
        },
        {
          id: 'reality_collapse',
          name: 'Reality Collapse',
          damage: 300,
          windupFrames: 120,
          activeFrames: 60,
          recoveryFrames: 60,
          cooldown: 180,
          pattern: 'aoe',
          telegraphDuration: 120,
          telegraphVisual: 'screen_distortion',
          range: 20,
          knockback: 100,
        },
      ],
      specialMechanic: 'Void King learns player patterns and adapts',
      arenaChanges: ['void_particles', 'dimensional_rifts'],
    },
    {
      phaseNumber: BossPhase.PHASE_2_ENVIRONMENTAL_THREAT,
      healthThreshold: 60,
      damageMultiplier: 2.0,
      speedMultiplier: 1.5,
      attacks: [
        {
          id: 'void_nova',
          name: 'Void Nova',
          damage: 400,
          windupFrames: 150,
          activeFrames: 90,
          recoveryFrames: 80,
          cooldown: 200,
          pattern: 'aoe',
          telegraphDuration: 150,
          telegraphVisual: 'void_implosion',
          range: 25,
          knockback: 150,
        },
        {
          id: 'multiverse_strike',
          name: 'Multiverse Strike',
          damage: 350,
          windupFrames: 100,
          activeFrames: 20,
          recoveryFrames: 50,
          cooldown: 150,
          pattern: 'tracking',
          telegraphDuration: 100,
          telegraphVisual: 'parallel_reality',
          range: 12,
          knockback: 100,
        },
      ],
      specialMechanic: 'Arena becomes unstable - platforms shift and collapse',
      arenaChanges: ['platform_destruction', 'void_storms', 'gravity_shifts'],
    },
    {
      phaseNumber: BossPhase.PHASE_3_DESPERATION,
      healthThreshold: 20,
      damageMultiplier: 3.0,
      speedMultiplier: 2.0,
      attacks: [
        {
          id: 'void_apocalypse',
          name: 'Void Apocalypse',
          damage: 500,
          windupFrames: 180,
          activeFrames: 120,
          recoveryFrames: 100,
          cooldown: 300,
          pattern: 'aoe',
          telegraphDuration: 180,
          telegraphVisual: 'reality_break',
          range: 30,
          knockback: 200,
        },
        {
          id: 'final_void',
          name: 'Final Void',
          damage: 600,
          windupFrames: 200,
          activeFrames: 150,
          recoveryFrames: 120,
          cooldown: 400,
          pattern: 'aoe',
          telegraphDuration: 200,
          telegraphVisual: 'existence_erasure',
          range: 35,
          knockback: 250,
        },
      ],
      specialMechanic: 'All four heroes must attack simultaneously to break void shield',
      arenaChanges: ['void_dominance', 'reality_fragments', 'final_stand'],
    },
    {
      phaseNumber: BossPhase.PHASE_4_SECRET,
      healthThreshold: 0,
      damageMultiplier: 5.0,
      speedMultiplier: 3.0,
      attacks: [
        {
          id: 'transcendent_void',
          name: 'Transcendent Void',
          damage: 1000,
          windupFrames: 300,
          activeFrames: 200,
          recoveryFrames: 150,
          cooldown: 500,
          pattern: 'aoe',
          telegraphDuration: 300,
          telegraphVisual: 'transcendence',
          range: 40,
          knockback: 300,
        },
      ],
      specialMechanic: 'Secret phase - Only accessible in Hard/Paradox mode',
      arenaChanges: ['transcendent_void', 'reality_override'],
    },
  ],
};

/**
 * ENHANCED RIFT GENERALS - Epic Mid-Bosses
 */
export const LEGENDARY_RIFT_GENERALS: BossConfig[] = [
  {
    id: 'void_tower_warden',
    name: 'Void Tower Warden',
    maxHealth: 5000,
    position: { x: 0, y: 0 },
    facing: 1,
    utilities: {
      hunger: 0.7,
      aggression: 0.6,
      selfPreservation: 0.8, // Defensive boss
    },
    learningEnabled: true,
    phases: [
      {
        phaseNumber: BossPhase.PHASE_1_PATTERN_LEARNING,
        healthThreshold: 100,
        damageMultiplier: 1.2,
        speedMultiplier: 1.0,
        attacks: [
          {
            id: 'shield_bash',
            name: 'Shield Bash',
            damage: 100,
            windupFrames: 40,
            activeFrames: 8,
            recoveryFrames: 25,
            cooldown: 60,
            pattern: 'linear',
            telegraphDuration: 40,
            telegraphVisual: 'shield_glow',
            range: 5,
            knockback: 30,
          },
          {
            id: 'fortress_defense',
            name: 'Fortress Defense',
            damage: 80,
            windupFrames: 60,
            activeFrames: 20,
            recoveryFrames: 30,
            cooldown: 80,
            pattern: 'aoe',
            telegraphDuration: 60,
            telegraphVisual: 'barrier_expansion',
            range: 8,
            knockback: 20,
          },
        ],
        specialMechanic: 'Shield blocks all frontal attacks - must attack from behind',
        arenaChanges: ['fortress_walls', 'defensive_barriers'],
      },
      {
        phaseNumber: BossPhase.PHASE_2_ENVIRONMENTAL_THREAT,
        healthThreshold: 50,
        damageMultiplier: 1.5,
        speedMultiplier: 1.3,
        attacks: [
          {
            id: 'tower_collapse',
            name: 'Tower Collapse',
            damage: 200,
            windupFrames: 100,
            activeFrames: 40,
            recoveryFrames: 50,
            cooldown: 120,
            pattern: 'aoe',
            telegraphDuration: 100,
            telegraphVisual: 'structure_destruction',
            range: 12,
            knockback: 60,
          },
        ],
        specialMechanic: 'Tower structure collapses - creates new platforms',
        arenaChanges: ['falling_debris', 'new_platforms', 'destruction'],
      },
    ],
  },
  {
    id: 'rift_harvester',
    name: 'Rift Harvester',
    maxHealth: 4000,
    position: { x: 0, y: 0 },
    facing: 1,
    utilities: {
      hunger: 0.9, // Very hungry
      aggression: 0.8,
      selfPreservation: 0.5,
    },
    learningEnabled: true,
    phases: [
      {
        phaseNumber: BossPhase.PHASE_1_PATTERN_LEARNING,
        healthThreshold: 100,
        damageMultiplier: 1.3,
        speedMultiplier: 1.1,
        attacks: [
          {
            id: 'life_drain',
            name: 'Life Drain',
            damage: 120,
            windupFrames: 50,
            activeFrames: 15,
            recoveryFrames: 30,
            cooldown: 70,
            pattern: 'tracking',
            telegraphDuration: 50,
            telegraphVisual: 'soul_siphon',
            range: 10,
            knockback: 10, // Pulls instead
          },
          {
            id: 'harvest_beam',
            name: 'Harvest Beam',
            damage: 150,
            windupFrames: 80,
            activeFrames: 30,
            recoveryFrames: 40,
            cooldown: 100,
            pattern: 'beam',
            telegraphDuration: 80,
            telegraphVisual: 'energy_beam',
            range: 15,
            knockback: 40,
          },
        ],
        specialMechanic: 'Drains health over time - must break connection',
        arenaChanges: ['life_drain_zones', 'harvest_fields'],
      },
    ],
  },
  {
    id: 'prophesied_devourer',
    name: 'Prophesied Devourer',
    maxHealth: 6000,
    position: { x: 0, y: 0 },
    facing: 1,
    utilities: {
      hunger: 1.0, // Maximum hunger
      aggression: 0.9,
      selfPreservation: 0.4,
    },
    learningEnabled: true,
    phases: [
      {
        phaseNumber: BossPhase.PHASE_1_PATTERN_LEARNING,
        healthThreshold: 100,
        damageMultiplier: 1.4,
        speedMultiplier: 1.2,
        attacks: [
          {
            id: 'devour',
            name: 'Devour',
            damage: 200,
            windupFrames: 70,
            activeFrames: 20,
            recoveryFrames: 50,
            cooldown: 90,
            pattern: 'grab',
            telegraphDuration: 70,
            telegraphVisual: 'maw_opening',
            range: 6,
            knockback: 0, // Grabs instead
          },
          {
            id: 'shell_armor',
            name: 'Shell Armor',
            damage: 0, // Defensive
            windupFrames: 30,
            activeFrames: 60,
            recoveryFrames: 20,
            cooldown: 120,
            pattern: 'aoe',
            telegraphDuration: 30,
            telegraphVisual: 'armor_activation',
            range: 8,
            knockback: 0,
          },
        ],
        specialMechanic: 'Shell armor reduces damage by 75% - must break shell first',
        arenaChanges: ['jungle_terrain', 'shell_fragments'],
      },
    ],
  },
];

/**
 * ENHANCED ALL-HIGH BOSS
 */
export const LEGENDARY_ALL_HIGH: BossConfig = {
  id: 'all_high_legendary',
  name: 'The All-High',
  maxHealth: 8000,
  position: { x: 0, y: 0 },
  facing: 1,
  utilities: {
    hunger: 0.5, // Judgmental, not hungry
    aggression: 0.6,
    selfPreservation: 0.9, // High self-preservation
  },
  learningEnabled: true,
  phases: [
    {
      phaseNumber: BossPhase.PHASE_1_PATTERN_LEARNING,
      healthThreshold: 100,
      damageMultiplier: 1.3,
      speedMultiplier: 1.1,
      attacks: [
        {
          id: 'divine_judgment',
          name: 'Divine Judgment',
          damage: 180,
          windupFrames: 90,
          activeFrames: 25,
          recoveryFrames: 40,
          cooldown: 110,
          pattern: 'aoe',
          telegraphDuration: 90,
          telegraphVisual: 'divine_light',
          range: 12,
          knockback: 70,
        },
        {
          id: 'multiverse_gauntlet',
          name: 'Multiverse Gauntlet',
          damage: 250,
          windupFrames: 120,
          activeFrames: 40,
          recoveryFrames: 60,
          cooldown: 150,
          pattern: 'combo',
          telegraphDuration: 120,
          telegraphVisual: 'reality_trials',
          range: 15,
          knockback: 90,
        },
      ],
      specialMechanic: 'Five divine trials - must pass all to damage',
      arenaChanges: ['divine_arena', 'trial_platforms'],
    },
  ],
};
