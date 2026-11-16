export type HeroId = 'kai' | 'jax' | 'kaijax';

export type EnemyArchetype =
  | 'brawler'
  | 'stalker'
  | 'marksman'
  | 'dodger'
  | 'bruiser'
  | 'shield'
  | 'assassin'
  | 'boss';

export type TraversalTier =
  | 'Apex Street'
  | 'Web Evade'
  | 'Chain Reposition'
  | 'Web Swing'
  | 'Memory Step';

export type GraphicsQuality = 'low' | 'balanced' | 'high';

export type CharacterModelVersion =
  | 'p1i_reconstructed'
  | 'p1g_mastered'
  | 'meshy_custom'
  | 'procedural_fallback';

export type EnvironmentMode = 'reconstructed' | 'legacy';

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export type ParryTiming = 'standard' | 'generous';

export interface GamepadBindingMap {
  lightAttack: number;
  heavyAttack: number;
  dodge: number;
  jump: number;
  tacticalAbility: number;
  blockParry: number;
  switchPartner: number;
  aimLockOn: number;
}

export interface CombatTelemetryStats {
  parryCount: number;
  evadeCount: number;
  hitsTaken: number;
  maxCombo: number;
  duoFinishersUsed?: number;
  wallPinsCount?: number;
  guardBreaksCount?: number;
  environmentalTakedownsCount?: number;
  styleScoreBest?: number;
}

export interface AbilityDef {
  id: string;
  hero: HeroId;
  slot: 1 | 2 | 3;
  name: string;
  heritage: "Myrr'Kai" | 'Pyraxis' | 'Kar-Voth' | 'Thryxen' | 'Convergence';
  cooldown: number;
  energyCost: number;
  description: string;
  color: string;
  unlockedByDefault: boolean;
}

export interface SkillNode {
  id: string;
  hero: HeroId;
  name: string;
  tier: 1 | 2 | 3;
  cost: number;
  description: string;
  statBoost: {
    attack?: number;
    maxHp?: number;
    maxEnergy?: number;
    critChance?: number;
    abilityPower?: number;
    speed?: number;
  };
  requires?: string;
}

export type EquipSlot = 'weapon' | 'armor' | 'relic';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: 'Common' | 'Rare' | 'Heritage';
  heroRestriction?: HeroId | 'any';
  attackBonus: number;
  defenseBonus: number;
  energyBonus: number;
  description: string;
  craftCost?: Record<string, number>;
}

export interface CosmeticPreset {
  id: string;
  name: string;
  accentHex: string;
  trimHex: string;
  description: string;
  unlocked: boolean;
}

export interface DialogueLine {
  speaker: string;
  role: string;
  portraitHero?: HeroId | 'bovar' | 'enforcer' | 'civilian';
  text: string;
}

export interface MissionStep {
  id: string;
  title: string;
  objective: string;
  hint: string;
  targetPos?: [number, number, number];
  dialogueOnStart?: DialogueLine[];
}

export interface DistrictInfo {
  id: string;
  order: number;
  name: string;
  act: 'Act I — Age of Protection' | 'Act II — Age of Law' | 'Act III — Age of Memory';
  bossName: string;
  heritageFocus: string;
  status: 'playable' | 'upcoming';
  summary: string;
  hazards: string[];
}

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  characterModelVersion?: CharacterModelVersion;
  environmentMode?: EnvironmentMode;
  targetFps: 30 | 60;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  touchSensitivity: number;
  invertCameraY: boolean;
  aimAssist: boolean;
  autoRecenterCamera: boolean;
  hudButtonScale: number;
  hudOpacity: number;
  hudEdgeOffset: number;
  hudVerticalOffset?: number;
  hudCompactMode?: 'auto' | 'compact' | 'expanded';
  subtitlesEnabled: boolean;
  subtitleScale: 'normal' | 'large';
  reducedMotion: boolean;
  reduceCameraShake?: boolean;
  colorblindMode: ColorblindMode;
  hapticsEnabled: boolean;
  parryTiming: ParryTiming;
  gamepadBindings?: GamepadBindingMap;
}

export interface HeroProgression {
  level: number;
  xp: number;
  xpToNext: number;
  skillPoints: number;
  unlockedSkills: string[];
  equipped: Record<EquipSlot, string>;
}

export interface SaveSlotData {
  version: number;
  slotId: string;
  savedAt: string;
  label: string;
  activeHero: 'kai' | 'jax';
  fusionUnlocked: boolean;
  unlockedDomains: string[];
  traversalTier: TraversalTier;
  missionStageIndex: number;
  missionCompleted: boolean;
  checkpointPos: [number, number, number];
  rescuedCivilians: number;
  reconstructedSites: number;
  memoryFragments: number;
  combatMastery: number;
  traversalMastery: number;
  duoSynergySaved?: number;
  combatStats: CombatTelemetryStats;
  heroes: Record<'kai' | 'jax', HeroProgression>;
  inventoryIds: string[];
  materials: Record<string, number>;
  activeCosmeticId: string;
  unlockedCosmeticIds: string[];
}

export interface FloatingDamage {
  id: number;
  x: number;
  y: number;
  amount: number;
  label?: string;
  color: string;
  isCrit?: boolean;
  age: number;
}

export interface HudSnapshot {
  activeHero: HeroId;
  kaiHp: number;
  kaiMaxHp: number;
  kaiEnergy: number;
  kaiMaxEnergy: number;
  jaxHp: number;
  jaxMaxHp: number;
  jaxEnergy: number;
  jaxMaxEnergy: number;
  fusionCharge: number;
  isFused: boolean;
  fusionTimeLeft: number;
  fusionCooldown: number;
  fusionUnlocked: boolean;
  duoSynergy: number;
  duoFinisherReady: boolean;
  activeFinisherName: string | null;
  counterWindowActive: boolean;
  isBlocking: boolean;
  tacticalActionLabel: string;
  tacticalCooldown: number;
  styleScore: number;
  comboCount: number;
  comboTimer: number;
  comboMaxTimer: number;
  comboBrokenSeq: number;
  lastBrokenCombo: number;
  abilityCooldowns: [number, number, number];
  dodgeCooldown: number;
  lockedTargetName: string | null;
  lockedTargetHp: number;
  lockedTargetMaxHp: number;
  lockedTargetScreenX?: number | null;
  lockedTargetScreenY?: number | null;
  lockedTargetArchetype?: EnemyArchetype | null;
  lockedTargetShield?: number;
  bossName: string | null;
  bossHp: number;
  bossMaxHp: number;
  bossArmor: number;
  bossMaxArmor: number;
  bossPhase: 1 | 2;
  bossTelegraph: string | null;
  interactPrompt: string | null;
  canWebSwing: boolean;
  canEnvironmentalTakedown?: boolean;
  environmentalTakedownPrompt?: string | null;
  isWallRunning: boolean;
  isShadowInked: boolean;
  thryxenActive: boolean;
  lightningChanneled: boolean;
  traversalState: string;
  missionStepIndex: number;
  missionStepTitle: string;
  missionObjective: string;
  missionCompleted: boolean;
  rescuedCivilians: number;
  totalCivilians: number;
  memoryFragments: number;
  fpsEstimate: number;
  onePercentLowFps: number;
  drawCalls: number;
  activeTriangles: number;
  isGameOver: boolean;
  isVictory: boolean;
  webglContextLost: boolean;
  parryCount: number;
  evadeCount: number;
  hitsTaken: number;
  floatingDamages: FloatingDamage[];
}
