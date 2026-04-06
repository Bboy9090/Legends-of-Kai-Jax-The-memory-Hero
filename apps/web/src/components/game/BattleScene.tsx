import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import BattleArena from "./BattleArena";
import BattlePlayer from "./BattlePlayer";
import Opponent from "./Opponent";
import ParticleManager from "./ParticleManager";
import CameraEffects from "./CameraEffects";
import AttackTrails from "./AttackTrails";
import EffectManager from "./EffectManager";
import { RimLight } from "./EnhancedGraphics";
import { Environment } from "@react-three/drei";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";

export default function BattleScene() {
  const {
    startBattle,
    updateRoundTimer,
    battlePhase,
    playerX,
    opponentX,
    playerFighterId,
    screenShake,
    hitStop,
    screenFlash,
    playerAttacking,
    playerAttackType,
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
        (playerAttacking && (playerAttackType === "special" || playerAttackType === "ultimate") ? 0.25 : 0)
    ) || 0;
  
  // Start battle on mount
  useEffect(() => {
    console.log("[BattleScene] Initializing battle");
    setTimeout(() => {
      startBattle();
    }, 1000);
  }, [startBattle]);
  
  // Update round timer every frame
  useFrame((state, delta) => {
    if (battlePhase === 'fighting') {
      updateRoundTimer(delta);
    }
  });
  
  // MOBILE-OPTIMIZED camera - fills the screen!
  const cameraX = (playerX + opponentX) / 2;
  const cameraY = 5;  // Lowered from 8 to center action vertically
  const cameraZ = 10; // Zoomed in from 15 to fill screen!
  
  return (
    <>
      {/* Camera follows the action - CENTERED for mobile! */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        target={[cameraX, 2, 0]}  // Lowered from 3 to center fighters on screen
      />
      
      {/* Enhanced Lighting System for better character definition */}
      <RimLight intensity={0.3} />
      {/* Lift ambient so arena + shadows don’t crush to black */}
      <ambientLight intensity={0.12} />
      <hemisphereLight intensity={0.15} color={"#ffffff"} groundColor={"#1a1530"} />
      <LegendaryLightingRig />
      <Environment preset="city" />
      <CinematicPostFX grade={grade} accent={accent} punch={punch} center={[0.5, 0.44]} />

      {/* Scene background/fog grade (pushes full-frame “poster” mood) */}
      <color attach="background" args={[bgColor]} />
      
      {/* Battle Arena */}
      <BattleArena />
      
      {/* Player Fighter */}
      <BattlePlayer />
      
      {/* Opponent Fighter */}
      <Opponent />
      
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
