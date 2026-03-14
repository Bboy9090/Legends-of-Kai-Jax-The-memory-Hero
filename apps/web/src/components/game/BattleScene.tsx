import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
<<<<<<< Current (Your changes)
import { useAudio } from "../../lib/stores/useAudio";
=======
<<<<<<< HEAD
>>>>>>> Incoming (Background Agent changes)
import BattleCamera from "./BattleCamera";
=======
import { useAudio } from "../../lib/stores/useAudio";
>>>>>>> origin
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
import { Environment } from "@react-three/drei";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";

/* eslint-disable react/no-unknown-property */
export default function BattleScene() {
  const {
    startBattle,
    updateRoundTimer,
    battlePhase,
    playerFighterId,
    screenShake,
    hitStop,
    screenFlash,
    playerAttacking,
    playerAttackType,
    comboCount,
    maxCombo,
    playerHealth,
    opponentHealth,
    maxHealth,
  } = useBattle();
  const playerFighter = getFighterById(playerFighterId);
  const grade =
    playerFighterId === "kai-jax" ? "cosmic" : playerFighterId === "jaxon" ? "ice" : playerFighterId === "kaison" ? "ember" : "neutral";
  const accent = playerFighter?.accentColor || "#00f2ff";
  // Lift the “poster grade” blacks so the arena isn’t swallowed.
  const bgColor = grade === "cosmic" ? "#0b0b18" : grade === "ice" ? "#0b1d34" : grade === "ember" ? "#2a0d0d" : "#121224";
  const fogColor = grade === "cosmic" ? "#111128" : grade === "ice" ? "#11384a" : grade === "ember" ? "#3a1410" : "#14142a";
  const punch =
    Math.min(
      1,
      screenShake * 1.6 +
        (hitStop > 0 ? 0.65 : 0) +
        (screenFlash ? 0.35 : 0) +
        (playerAttacking && playerAttackType === "ultimate" ? 0.55 : playerAttacking && playerAttackType === "special" ? 0.25 : 0) // Ultimate: camera zoom + arena dim
    ) || 0;
  
  useEffect(() => {
    console.log("[BattleScene] Initializing battle");
    const timer = setTimeout(() => {
      const phase = useBattle.getState().battlePhase;
      if (phase === "preRound") {
        startBattle();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [startBattle]);
  
  // Update round timer and adaptive music intensity
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
      {/* Smooth follow camera - wide view so both fighters stay visible */}
      <BattleCamera />
      
      {/* Enhanced Lighting System for better character definition */}
      <LegendaryLightingRig />
      {/* "city" can read very bright; night keeps the arena readable */}
      <Environment preset="night" environmentIntensity={0.45} />
      <CinematicPostFX profile="battle" grade={grade} accent={accent} punch={punch} center={[0.5, 0.44]} />

      {/* Scene background/fog grade (pushes full-frame “poster” mood) */}
      <color attach="background" args={[bgColor]} />
      
      {/* Battle Arena */}
      <BattleArena />
      
      {/* Player Fighter */}
      <BattlePlayer />
      
      {/* Opponent Fighter */}
      <Opponent />
      
      {/* Player Input Controller */}
      <PlayerController />
      
      {/* Opponent AI */}
      <OpponentAI />
      
      {/* EPIC Particle Effects! ✨💥 */}
      <ParticleManager />
      
      {/* BLAZING Attack Trails! 🔥⚡ */}
      <AttackTrails />
      
      {/* IMPACT Effects - Screen flash & shake! 💥⚡ */}
      <EffectManager />
      
      {/* Screen Shake & Slow-Motion! 🎬 */}
      <CameraEffects />
      
      {/* Fog for depth */}
      <fog attach="fog" args={[fogColor, 18, 55]} />
    </>
  );
}
