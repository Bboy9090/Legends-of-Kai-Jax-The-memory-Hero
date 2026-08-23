import combatJson from "./combat.json";

/** Battle stamina / block — canonical from `combat.json`. */
export const BATTLE_STAMINA = combatJson.battleStamina;

/** Combo retention windows. */
export const DEFAULT_MAX_COMBO_TIMER_SEC = combatJson.comboTimer.defaultSec;
export const UPGRADED_MAX_COMBO_TIMER_SEC = combatJson.comboTimer.upgradedSec;

/** Input responsiveness and duplicate-intent suppression. */
export const COMBAT_INPUT = combatJson.input;

/** Shared impact / knockback / post-hit presentation rules. */
export const COMBAT_IMPACT = combatJson.impact;

/** Player evasive movement. */
export const PLAYER_DODGE = combatJson.playerDodge;

/** Fusion / overdrive-adjacent transformation tuning. */
export const FUSION_SYNERGY_THRESHOLD = combatJson.fusion.synergyThresholdPercent;
export const FUSION_TRANSFORM_INTRO_MS = combatJson.fusion.transformIntroMs;
export const FUSION_HEAL_ON_FUSION = combatJson.fusion.healOnFusion;
export const ULTIMATE_SUPER_ARMOR_SEC = combatJson.fusion.ultimateSuperArmorSec;

/** Full immutable-style read model for systems that need grouped tuning. */
export const COMBAT_TUNING = combatJson;
