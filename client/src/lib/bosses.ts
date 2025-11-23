// SUPER SMASH GRAND SAGA - BOSS SYSTEM

export interface BossAttack {
  id: string;
  name: string;
  description: string;
  damage: number;
  windupFrames: number; // Time player has to dodge
  cooldown: number; // Frames between attacks
  pattern: 'linear' | 'aoe' | 'tracking' | 'combo' | 'grab';
  dodgeRequirement: string; // How to avoid
}

export interface BossPhase {
  phaseNumber: number;
  healthPercentage: number; // When phase starts (100-0)
  attacks: BossAttack[];
  specialMechanic: string; // Unique phase mechanic
  description: string;
  damageMultiplier: number; // How much damage boss deals this phase
  speedMultiplier: number; // Attack speed multiplier
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  description: string;
  healthPool: number;
  phases: BossPhase[];
  learningAI: boolean; // Boss adapts to player strategy
  weaknesses: {
    element?: string;
    strategy?: string;
    character?: string[];
  };
  rewards: {
    xp: number;
    currency: number;
    loot: string[];
    character?: string; // Unlocks a character
  };
  cinematic: {
    introScene: string;
    defeatScene: string;
    phaseChangeScene?: string;
  };
}

// ============ ACT I BOSSES ============
export const VOID_GORGON: Boss = {
  id: 'void_gorgon',
  name: 'Void-Gorgon',
  title: 'First Rift General',
  description: 'A corrupted being born from the Rift. Teleports between dimensions and strikes without warning.',
  healthPool: 800,
  phases: [
    {
      phaseNumber: 1,
      healthPercentage: 100,
      description: 'Learning Phase - Boss tests your defenses',
      attacks: [
        {
          id: 'gorgon_gaze',
          name: 'Gorgon Gaze',
          description: 'Stares at you, slowing movement',
          damage: 40,
          windupFrames: 45,
          cooldown: 60,
          pattern: 'linear',
          dodgeRequirement: 'Shield or dodge sideways'
        },
        {
          id: 'void_spike',
          name: 'Void Spike',
          description: 'Launches energy spike from ground',
          damage: 50,
          windupFrames: 30,
          cooldown: 45,
          pattern: 'linear',
          dodgeRequirement: 'Jump over spike'
        }
      ],
      specialMechanic: 'Boss learns your dodge patterns',
      damageMultiplier: 1.0,
      speedMultiplier: 1.0
    },
    {
      phaseNumber: 2,
      healthPercentage: 60,
      description: 'Rift Mutation - Boss adapts and attacks more aggressively',
      attacks: [
        {
          id: 'rift_rupture',
          name: 'Rift Rupture',
          description: 'Tears open dimensions',
          damage: 80,
          windupFrames: 60,
          cooldown: 90,
          pattern: 'aoe',
          dodgeRequirement: 'Stay at range or use shield'
        },
        {
          id: 'dimensional_slash',
          name: 'Dimensional Slash',
          description: 'Slashes across dimensions',
          damage: 70,
          windupFrames: 40,
          cooldown: 50,
          pattern: 'tracking',
          dodgeRequirement: 'Dodge roll towards boss'
        }
      ],
      specialMechanic: 'Boss counters your previous attacks',
      damageMultiplier: 1.3,
      speedMultiplier: 1.2
    },
    {
      phaseNumber: 3,
      healthPercentage: 20,
      description: 'Anti-Power - Boss nullifies transformations',
      attacks: [
        {
          id: 'void_nova',
          name: 'Void Nova',
          description: 'Explosive burst of void energy',
          damage: 100,
          windupFrames: 80,
          cooldown: 120,
          pattern: 'aoe',
          dodgeRequirement: 'Maximum distance or perfect dodge'
        },
        {
          id: 'endless_assault',
          name: 'Endless Assault',
          description: 'Rapid combo attack',
          damage: 60,
          windupFrames: 20,
          cooldown: 30,
          pattern: 'combo',
          dodgeRequirement: 'Parry or block multiple times'
        }
      ],
      specialMechanic: 'Transformation effects reduced by 50%',
      damageMultiplier: 1.5,
      speedMultiplier: 1.4
    }
  ],
  learningAI: true,
  weaknesses: {
    element: 'Light/Holy',
    strategy: 'Exploit during windup frames',
    character: ['zelda', 'link', 'palutena']
  },
  rewards: {
    xp: 500,
    currency: 300,
    loot: ['General Seal I', 'Rift Shard', 'Void Core'],
    character: undefined
  },
  cinematic: {
    introScene: 'void_gorgon_intro',
    defeatScene: 'void_gorgon_defeat',
    phaseChangeScene: 'gorgon_mutation'
  }
};

export const TOURNAMENT_CHAMPION_CLONE: Boss = {
  id: 'tournament_champion',
  name: 'Tournament Champion Clone',
  title: 'Rift Echo - Sonic',
  description: 'A twisted echo of Sonic from an alternate timeline. Faster and more vicious.',
  healthPool: 600,
  phases: [
    {
      phaseNumber: 1,
      healthPercentage: 100,
      description: 'Speed Phase - Echo matches your speed',
      attacks: [
        {
          id: 'chaos_control',
          name: 'Chaos Control',
          description: 'Freezes time temporarily',
          damage: 60,
          windupFrames: 50,
          cooldown: 80,
          pattern: 'linear',
          dodgeRequirement: 'Activate shield before freeze'
        },
        {
          id: 'spin_attack',
          name: 'Spin Attack',
          description: 'Rapid spinning tackle',
          damage: 55,
          windupFrames: 25,
          cooldown: 40,
          pattern: 'tracking',
          dodgeRequirement: 'Jump and counter-attack'
        }
      ],
      specialMechanic: 'Echo predicts your movement',
      damageMultiplier: 1.0,
      speedMultiplier: 1.1
    },
    {
      phaseNumber: 2,
      healthPercentage: 40,
      description: 'Corruption - Rift energy corrupts the echo',
      attacks: [
        {
          id: 'void_sonic',
          name: 'Void Sonic Boom',
          description: 'Sonic boom empowered by void',
          damage: 90,
          windupFrames: 60,
          cooldown: 100,
          pattern: 'aoe',
          dodgeRequirement: 'Perfect dodge or invincibility frame'
        }
      ],
      specialMechanic: 'Takes reduced damage during transformation',
      damageMultiplier: 1.4,
      speedMultiplier: 1.3
    }
  ],
  learningAI: true,
  weaknesses: {
    element: 'Heavy/Power',
    strategy: 'Hit during transition phases',
    character: ['donkeykong', 'link', 'mario']
  },
  rewards: {
    xp: 400,
    currency: 250,
    loot: ['Champion Seal', 'Rift Key I'],
    character: undefined
  },
  cinematic: {
    introScene: 'champion_clone_intro',
    defeatScene: 'champion_clone_defeat'
  }
};

// ============ SECRET BOSS ============
export const VOID_KING: Boss = {
  id: 'void_king',
  name: 'The Void King',
  title: 'Ultimate Antagonist',
  description: 'The entity responsible for breaking the Weave of Reality. True final boss.',
  healthPool: 2000,
  phases: [
    {
      phaseNumber: 1,
      healthPercentage: 100,
      description: 'Void Form - The Void King materializes',
      attacks: [
        {
          id: 'void_strike',
          name: 'Void Strike',
          description: 'Piercing attack from another dimension',
          damage: 120,
          windupFrames: 70,
          cooldown: 100,
          pattern: 'linear',
          dodgeRequirement: 'Perfect dodge or parry'
        }
      ],
      specialMechanic: 'Each phase requires a different team synergy',
      damageMultiplier: 1.2,
      speedMultiplier: 1.0
    },
    {
      phaseNumber: 2,
      healthPercentage: 60,
      description: 'Rift Collapse - Reality warps around the king',
      attacks: [],
      specialMechanic: 'Stage hazards increase',
      damageMultiplier: 1.5,
      speedMultiplier: 1.2
    },
    {
      phaseNumber: 3,
      healthPercentage: 20,
      description: 'Final Form - All power unleashed',
      attacks: [],
      specialMechanic: 'All four heroes must attack simultaneously',
      damageMultiplier: 2.0,
      speedMultiplier: 2.0
    }
  ],
  learningAI: true,
  weaknesses: {
    element: 'All elements combined',
    strategy: 'Use team ultimates',
    character: []
  },
  rewards: {
    xp: 5000,
    currency: 2000,
    loot: ['Void Core', 'Reality Fragment', 'Infinity Stone'],
    character: 'lunara'
  },
  cinematic: {
    introScene: 'void_king_intro',
    defeatScene: 'void_king_defeat',
    phaseChangeScene: 'void_king_evolution'
  }
};

// ============ HELPER FUNCTIONS ============
export function getBossById(id: string): Boss | undefined {
  const allBosses = [VOID_GORGON, TOURNAMENT_CHAMPION_CLONE, VOID_KING];
  return allBosses.find(b => b.id === id);
}

export function calculateBossDifficulty(boss: Boss): number {
  const avgDamage = boss.phases.reduce((sum, p) => sum + (p.attacks.reduce((s, a) => s + a.damage, 0) / p.attacks.length), 0) / boss.phases.length;
  return Math.ceil((avgDamage / 10) + (boss.phases.length * 2));
}
