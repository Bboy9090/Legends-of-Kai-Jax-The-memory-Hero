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
