import combatJson from "./combat.json";

/** Battle stamina / block — canonical from `combat.json` */
export const BATTLE_STAMINA = combatJson.battleStamina;

export const DEFAULT_MAX_COMBO_TIMER_SEC = combatJson.comboTimer.defaultSec;
export const UPGRADED_MAX_COMBO_TIMER_SEC = combatJson.comboTimer.upgradedSec;

export const PLAYER_DODGE = combatJson.playerDodge;

export const FUSION_SYNERGY_THRESHOLD = combatJson.fusion.synergyThresholdPercent;
export const FUSION_TRANSFORM_INTRO_MS = combatJson.fusion.transformIntroMs;
export const FUSION_HEAL_ON_FUSION = combatJson.fusion.healOnFusion;
export const ULTIMATE_SUPER_ARMOR_SEC = combatJson.fusion.ultimateSuperArmorSec;

export const COMBAT_TUNING = combatJson;
