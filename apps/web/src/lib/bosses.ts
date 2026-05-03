// LEGENDS OF KAI-JAX: BOSS REGISTRY
// PRODUCTION VERSION - ALL PLACEHOLDERS REMOVED

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
  damageMultiplier: number;
  speedMultiplier: number;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  description: string;
  healthPool: number;
  phases: BossPhase[];
  learningAI: boolean;
  weaknesses: {
    element?: string;
    strategy?: string;
    character?: string[];
  };
  rewards: {
    xp: number;
    currency: number;
    loot: string[];
    character?: string;
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
    }
  ],
  learningAI: true,
  weaknesses: {
    element: 'Memory Light',
    strategy: 'Exploit during windup frames',
    character: ['kai-jax', 'lunara']
  },
  rewards: {
    xp: 500,
    currency: 300,
    loot: ['General Seal I', 'Rift Shard', 'Void Core'],
  },
  cinematic: {
    introScene: 'void_gorgon_intro',
    defeatScene: 'void_gorgon_defeat',
  }
};

export const JAXON_ECHO: Boss = {
  id: 'jaxon_echo',
  name: 'Echo of Jaxon',
  title: 'Rift Reflection',
  description: 'A twisted mirror image of Jaxon Swift from a timeline consumed by the Void.',
  healthPool: 600,
  phases: [
    {
      phaseNumber: 1,
      healthPercentage: 100,
      description: 'Speed Phase - Echo matches your velocity',
      attacks: [
        {
          id: 'static_dash',
          name: 'Static Dash',
          description: 'Rapid lightning-fast tackle',
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
    }
  ],
  learningAI: true,
  weaknesses: {
    element: 'Time/Gravity',
    strategy: 'Hit during transition phases',
    character: ['silver', 'kai-jax']
  },
  rewards: {
    xp: 400,
    currency: 250,
    loot: ['Echo Essence', 'Rift Key I'],
  },
  cinematic: {
    introScene: 'jaxon_echo_intro',
    defeatScene: 'jaxon_echo_defeat'
  }
};

// ============ FINAL BOSS ============
export const VOID_KING: Boss = {
  id: 'void_king',
  name: 'The Void King',
  title: 'Architect of Entropy',
  description: 'The entity responsible for the collapse of the Memory Weave. True final boss.',
  healthPool: 2500,
  phases: [
    {
      phaseNumber: 1,
      healthPercentage: 100,
      description: 'Void Form - The King materializes',
      attacks: [
        {
          id: 'oblivion_strike',
          name: 'Oblivion Strike',
          description: 'Piercing attack from the zero-dimension',
          damage: 120,
          windupFrames: 70,
          cooldown: 100,
          pattern: 'linear',
          dodgeRequirement: 'Perfect dodge or parry'
        }
      ],
      specialMechanic: 'Requires active Memory Synchronization',
      damageMultiplier: 1.2,
      speedMultiplier: 1.0
    }
  ],
  learningAI: true,
  weaknesses: {
    element: 'Zenith Energy',
    strategy: 'Use team fusion ultimates',
    character: ['kai-jax']
  },
  rewards: {
    xp: 5000,
    currency: 2000,
    loot: ['Void Core', 'Infinity Strand'],
    character: 'lunara'
  },
  cinematic: {
    introScene: 'void_king_intro',
    defeatScene: 'void_king_defeat',
  }
};

export function getBossById(id: string): Boss | undefined {
  const allBosses = [VOID_GORGON, JAXON_ECHO, VOID_KING];
  return allBosses.find(b => b.id === id);
}
