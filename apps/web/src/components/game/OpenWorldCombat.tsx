/**
 * Open-World RPG Combat Mode
 * - Supports multiple enemies (1vN)
 * - Mission-based objectives
 * - Seamless RPG adventure experience
 * - NOT arcade-style 1v1
 */

import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useBattle } from "../../lib/stores/useBattle";
import { useRunner } from "../../lib/stores/useRunner";
import { getFighterById } from "../../lib/characters";
import BattleArena from "./BattleArena";
import BattlePlayer from "./BattlePlayer";
import ParticleManager from "./ParticleManager";
import CameraEffects from "./CameraEffects";
import AttackTrails from "./AttackTrails";
import EffectManager from "./EffectManager";
import { RimLight } from "./EnhancedGraphics";
import { Environment } from "@react-three/drei";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";

interface Enemy {
  id: string;
  fighterId: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  isActive: boolean;
}

export default function OpenWorldCombat({ missionId }: { missionId?: string }) {
  const {
    startBattle,
    updateRoundTimer,
    battlePhase,
    playerX,
    screenShake,
    hitStop,
    screenFlash,
    playerAttacking,
    playerAttackType,
    playerFighterId,
  } = useBattle();
  
  const { gameState } = useRunner();
  
  // Track multiple enemies for open-world combat
  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 'enemy_1',
      fighterId: 'umbra-flux',
      position: [5, 0, 0],
      health: 100,
      maxHealth: 100,
      isActive: true,
    },
    {
      id: 'enemy_2',
      fighterId: 'boryx-zenith',
      position: [8, 0, -2],
      health: 100,
      maxHealth: 100,
      isActive: true,
    },
  ]);
  
  const playerFighter = getFighterById(playerFighterId);
  const grade =
    playerFighterId === "kai-jax" ? "cosmic" : playerFighterId === "jaxon" ? "ice" : playerFighterId === "kaison" ? "ember" : "neutral";
  const accent = playerFighter?.accentColor || "#00f2ff";
  
  // Open-world appropriate colors (not as dark as arcade mode)
  const bgColor = grade === "cosmic" ? "#1a1a2e" : grade === "ice" ? "#1a2d44" : grade === "ember" ? "#3a1d1d" : "#1a1a2e";
  const fogColor = grade === "cosmic" ? "#2a2a3e" : grade === "ice" ? "#2a3d5a" : grade === "ember" ? "#4a2d2d" : "#2a2a3e";
  
  const punch =
    Math.min(
      1,
      screenShake * 1.6 +
        (hitStop > 0 ? 0.65 : 0) +
        (screenFlash ? 0.35 : 0) +
        (playerAttacking && (playerAttackType === "special" || playerAttackType === "ultimate") ? 0.25 : 0)
    ) || 0;
  
  // Start open-world combat on mount
  useEffect(() => {
    console.log("[OpenWorldCombat] Initializing open-world combat mode for mission:", missionId);
    setTimeout(() => {
      startBattle();
    }, 1000);
  }, [startBattle, missionId]);
  
  // Update combat timer every frame
  useFrame((state, delta) => {
    if (battlePhase === 'fighting') {
      updateRoundTimer(delta);
    }
  });
  
  // Open-world camera - wider view to see multiple enemies and environment
  const activeEnemies = enemies.filter(e => e.isActive);
  const avgEnemyX = activeEnemies.length > 0 
    ? activeEnemies.reduce((sum, e) => sum + e.position[0], 0) / activeEnemies.length 
    : 5;
  const cameraX = (playerX + avgEnemyX) / 2;
  const cameraY = 7;  // Higher to see more of the battlefield
  const cameraZ = 18; // Further back for open-world view
  
  return (
    <>
      {/* Camera - Open-world view (wider than arcade) */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        target={[cameraX, 2, 0]}
      />
      
      {/* Enhanced Lighting System */}
      <RimLight intensity={1.0} />
      <ambientLight intensity={0.35} />
      <hemisphereLight intensity={0.4} color={"#ffffff"} groundColor={"#2a2540"} />
      <LegendaryLightingRig />
      <Environment preset="city" />
      <CinematicPostFX grade={grade} accent={accent} punch={punch} center={[0.5, 0.44]} />

      {/* Open-world environment background */}
      <color attach="background" args={[bgColor]} />
      
      {/* Larger Arena for open-world combat */}
      <BattleArena />
      
      {/* Player Fighter */}
      <BattlePlayer />
      
      {/* Multiple Enemies - Open-world RPG style */}
      {activeEnemies.map((enemy) => (
        <group key={enemy.id} position={enemy.position}>
          {/* Simplified enemy representation - in a full impl, use actual models */}
          <mesh castShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#ff3333" />
          </mesh>
          {/* Health bar above enemy */}
          <mesh position={[0, 2.5, 0]}>
            <planeGeometry args={[2, 0.2]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[-(1 - enemy.health / enemy.maxHealth), 2.5, 0.01]}>
            <planeGeometry args={[2 * (enemy.health / enemy.maxHealth), 0.2]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      ))}
      
      {/* EPIC Particle Effects! ✨💥 */}
      <ParticleManager />
      
      {/* BLAZING Attack Trails! 🔥⚡ */}
      <AttackTrails />
      
      {/* IMPACT Effects - Screen flash & shake! 💥⚡ */}
      <EffectManager />
      
      {/* Screen Shake & Slow-Motion! 🎬 */}
      <CameraEffects />
      
      {/* Fog for depth - lighter than arcade mode */}
      <fog attach="fog" args={[fogColor, 25, 70]} />
    </>
  );
}
