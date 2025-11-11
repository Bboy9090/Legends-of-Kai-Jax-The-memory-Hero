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
  
  // Calculate camera position to keep both fighters in view
  const cameraX = (playerX + opponentX) / 2;
  const cameraY = 8;
  const cameraZ = 15;
  
  return (
    <>
      {/* Camera follows the action */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        target={[cameraX, 3, 0]}
      />
      
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
      
      {/* Screen Shake & Slow-Motion! 🎬 */}
      <CameraEffects />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#87CEEB', 20, 50]} />
    </>
  );
}
