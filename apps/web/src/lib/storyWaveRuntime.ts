import type { StoryMission } from "./story_missions";

type StoryWaveEnemySpec = {
  fighterId: string;
};

const WAVE_TYPE_TO_FIGHTER_ID: Record<string, string> = {
  grunt: "hyena-scout",
  "void-grunt": "rift-drone",
  "void-scout": "hyena-scout",
  "void-elite": "neon-wraith",
  "void-legion": "rift-drone",
  "void-stalker-minion": "neon-wraith",
  "void-wraith": "neon-wraith",
  "void-brute": "void-stalker",
  "void-god-guard": "rift-general-prime",
  "void-stalker": "void-stalker",
  "rift-general": "rift-general",
};

export function normalizeWaveEnemies(mission: StoryMission, waveIndex: number): StoryWaveEnemySpec[] {
  const wave = mission.enemyWaves[waveIndex] as any;
  if (!wave) return [];

  if (Array.isArray(wave.enemies)) {
    return wave.enemies
      .filter((enemy: any) => typeof enemy?.fighterId === "string")
      .map((enemy: any) => ({ fighterId: enemy.fighterId }));
  }

  const count = Math.max(1, Number(wave.count ?? 1));
  const isFinalBossWave = Boolean(mission.bossId) && waveIndex === mission.enemyWaves.length - 1;
  const fighterId = WAVE_TYPE_TO_FIGHTER_ID[String(wave.type)] ?? "rift-drone";
  const minions = Array.from({ length: count }, () => ({ fighterId }));
  return isFinalBossWave ? [...minions, { fighterId: mission.bossId! }] : minions;
}

export function getWaveDelaySeconds(mission: StoryMission, waveIndex: number): number {
  const wave = mission.enemyWaves[waveIndex] as any;
  const delay = Number(wave?.spawnDelay ?? wave?.delay ?? 2);
  return Number.isFinite(delay) && delay >= 0 ? delay : 2;
}

