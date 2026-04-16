/**
 * Mission Schema
 * JSON-driven mission definition per architecture doctrine
 */

import type { EnemyType } from './WaveDirector';

export interface MissionWave {
  delay: number;
  enemies: Array<{
    type: EnemyType;
    count: number;
  }>;
}

export interface MissionBoss {
  delayAfterWaves: number;
  type: EnemyType;
}

export interface MissionSchema {
  id: string;
  name: string;
  spawn: {
    playerStart: [number, number];
  };
  waves: MissionWave[];
  boss: MissionBoss;
  win: {
    type: 'defeatBoss' | 'killAll' | 'timer';
  };
  fail: {
    type: 'playerDead' | 'timer';
  };
}

/**
 * Example mission: Ironvein Ward - First Blood
 */
export const IRONVEIN_WARD_01: MissionSchema = {
  id: 'ironvein_ward_01',
  name: 'Ironvein Ward: First Blood',
  spawn: {
    playerStart: [0, 0],
  },
  waves: [
    {
      delay: 0,
      enemies: [{ type: 'fang_grunt', count: 5 }],
    },
    {
      delay: 5,
      enemies: [
        { type: 'fang_grunt', count: 6 },
        { type: 'covenant_scout', count: 2 },
      ],
    },
  ],
  boss: {
    delayAfterWaves: 3,
    type: 'covenant_enforcer',
  },
  win: {
    type: 'defeatBoss',
  },
  fail: {
    type: 'playerDead',
  },
};

/**
 * Mission 02: Null Forge — Specialist Assault
 * Introduces Rusher, Defender, and Sniper enemy archetypes + warlord boss.
 */
export const NULL_FORGE_02: MissionSchema = {
  id: 'null_forge_02',
  name: 'Null Forge: Specialist Assault',
  spawn: {
    playerStart: [0, 0],
  },
  waves: [
    {
      delay: 0,
      enemies: [
        { type: 'fang_rusher', count: 3 },
        { type: 'null_defender', count: 2 },
      ],
    },
    {
      delay: 4,
      enemies: [
        { type: 'covenant_sniper', count: 2 },
        { type: 'null_defender', count: 2 },
        { type: 'fang_rusher', count: 2 },
      ],
    },
  ],
  boss: {
    delayAfterWaves: 3,
    type: 'fang_warlord',
  },
  win: {
    type: 'defeatBoss',
  },
  fail: {
    type: 'playerDead',
  },
};

export const MISSION_LIBRARY: Record<string, MissionSchema> = {
  ironvein_ward_01: IRONVEIN_WARD_01,
  null_forge_02: NULL_FORGE_02,
};
