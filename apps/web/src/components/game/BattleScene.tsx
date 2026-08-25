import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAudio } from "../../lib/stores/useAudio";
import BattleCamera from "./BattleCamera";
import { getFighterById } from "../../lib/characters";
import BattleArena from "./BattleArena";
import BattlePlayer from "./BattlePlayer";
import Opponent from "./Opponent";
import PlayerController from "./PlayerController";
import OpponentAI from "./OpponentAI";
import ParticleManager from "./ParticleManager";
import CameraEffects from "./CameraEffects";
import AttackTrails from "./AttackTrails";
import EffectManager from "./EffectManager";
import BattleReadabilityOverlay from "./BattleReadabilityOverlay";
import SceneEnvironment from "./graphics/SceneEnvironment";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { useAccessibility } from "../../lib/stores/useAccessibility";

/* eslint-disable react/no-unknown-property */
export default function BattleScene() {
  const {
    updateRoundTimer,
    battlePhase,
    playerFighterId,
    screenShake,
    hitStop,
    screenFlash,
    playerAttacking,
    playerAttackType,
    opponentAttacking,
    comboCount,
    maxCombo,
    playerHealth,
    opponentHealth,
    maxHealth,
    playerCombatState,
  } = useBattle();
  const reduceMotion = useAccessibility((s) => s.reduceMotion);
  const playerFighter = getFighterById(playerFighterId);
  const grade =
    playerFighterId === "kai-jax" ? "cosmic" : playerFighterId === "jaxon" ? "ice" : playerFighterId === "kaison" ? "ember" : "neutral";
  const accent = playerFighter?.accentColor || "#00f2ff";
  const bgColor = grade === "cosmic" ? "#0b0b18" : grade === "ice" ? "#0b1d34" : grade === "ember" ? "#2a0d0d" : "#121224";
  const fogColor = grade === "cosmic" ? "#111128" : grade === "ice" ? "#11384a" : grade === "ember" ? "#3a1410" : "#14142a";
  const chaos =
    (playerAttacking ? 0.12 : 0) +
    (opponentAttacking ? 0.12 : 0) +
    (comboCount >= 5 ? Math.min(0.2, (comboCount - 5) * 0.02) : 0) +
    (playerCombatState === "BLOCKING" || playerCombatState === "PARRY_WINDOW" ? 0.15 : 0);

  const rawPunch =
    screenShake * 1.6 +
    (hitStop > 0 ? 0.65 : 0) +
    (screenFlash ? 0.35 : 0) +
    (playerAttacking && playerAttackType === "ultimate"
      ? 0.55
      : playerAttacking && playerAttackType === "special"
        ? 0.25
        : 0);

  const punch =
    Math.min(1, rawPunch * Math.max(0.45, 1 - chaos * 0.85) * (reduceMotion ? 0.38 : 1)) || 0;

  useEffect(() => {
    const delayMs = 400;
    const timer = setTimeout(() => {
      const s = useBattle.getState();
      if (s.battlePhase !== "fighting" && s.battlePhase !== "transforming") {
        s.startBattle();
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, []);

  useFrame((_state, delta) => {
    if (battlePhase === 'fighting') {
      updateRoundTimer(delta);
      const comboIntensity = Math.min(1, (comboCount + (maxCombo > 0 ? maxCombo * 0.2 : 0)) / 8);
      const healthIntensity = 1 - Math.min(playerHealth, opponentHealth) / maxHealth;
      const intensity = comboIntensity * 0.6 + healthIntensity * 0.4;
      useAudio.getState().setBattleIntensity(intensity);
    }
  });

  return (
    <>
      <BattleCamera />
      <BattleReadabilityOverlay />

      <LegendaryLightingRig />
      <SceneEnvironment mode="night" environmentIntensity={0.45} />
      <CinematicPostFX grade={grade} accent={accent} punch={punch} center={[0.5, 0.44]} />

      <color attach="background" args={[bgColor]} />

      <BattleArena />
      <BattlePlayer />
      <Opponent />
      <PlayerController />
      <OpponentAI />
      <ParticleManager />
      <AttackTrails />
      <EffectManager />
      <CameraEffects />

      <fog attach="fog" args={[fogColor, 18, 55]} />
    </>
  );
}
