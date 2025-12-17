import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useBattle } from "../../lib/stores/useBattle";
import BattleArena from "./BattleArena";
import BattlePlayer from "./BattlePlayer";
import Opponent from "./Opponent";
import ParticleManager from "./ParticleManager";
import CameraEffects from "./CameraEffects";
import AttackTrails from "./AttackTrails";
import EffectManager from "./EffectManager";
import { RimLight } from "./EnhancedGraphics";

export default function BattleScene() {
  const { startBattle, updateRoundTimer, battlePhase, playerX, opponentX } = useBattle();
  
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
      <RimLight intensity={1.0} />
      
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
      <fog attach="fog" args={['#87CEEB', 20, 50]} />
    </>
  );
}
