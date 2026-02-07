import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import "@fontsource/bebas-neue";

import BattleScene from "./components/game/BattleScene";
import MobileControls from "./components/game/MobileControls";
import BattleUI from "./components/game/BattleUI";
import DialogueDisplay from "./components/game/DialogueDisplay";
import MainMenu from "./components/game/MainMenu";
import CharacterSelect from "./components/game/CharacterSelect";
import MissionSelectHub from "./components/game/MissionSelectHub";
import CampaignMap from "./components/game/CampaignMap";
import TransformationOverlay from "./components/game/TransformationOverlay";
import ScreenEffects from "./components/game/ScreenEffects";
import { GameIntro } from "./components/game/LoadingScreen";
import CustomizationMenu from "./components/game/CustomizationMenu";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { FIGHTERS } from "./lib/characters";
import { useEffect } from "react";
import * as THREE from "three";
import { getQualitySettings } from "./lib/threejs/PerformanceOptimizer";

// Define control keys for the game
enum Controls {
  jump = 'jump',
  slide = 'slide',
  left = 'left',
  right = 'right',
  pause = 'pause',
  punch = 'punch',
  kick = 'kick',
  special = 'special',
  dash = 'dash',
  webSwing = 'webSwing',
  chargeKick = 'chargeKick',
  transform = 'transform',
  energyBlast = 'energyBlast',
  ultimate = 'ultimate'
}

const controls = [
  { name: Controls.jump, keys: ["Space", "ArrowUp", "KeyW"] },
  { name: Controls.slide, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.pause, keys: ["Escape", "KeyP"] },
  { name: Controls.punch, keys: ["KeyJ", "KeyX"] },
  { name: Controls.kick, keys: ["KeyK", "KeyZ"] },
  { name: Controls.special, keys: ["KeyL", "KeyC"] },
  { name: Controls.dash, keys: ["ShiftLeft", "KeyV"] },
  { name: Controls.webSwing, keys: ["ControlLeft", "ControlRight"] },
  { name: Controls.chargeKick, keys: ["KeyF"] },
  { name: Controls.transform, keys: ["KeyT"] },
  { name: Controls.energyBlast, keys: ["KeyE"] },
  { name: Controls.ultimate, keys: ["KeyR"] },
];

function App() {
  const { phase } = useGame();
  const { gameState, selectedCharacter } = useRunner();
  const { setPlayerFighter, setOpponentFighter, screenShake } = useBattle();
  const { 
    setBackgroundMusic, 
    setBattleMusic, 
    setHitSound, 
    setSuccessSound,
    backgroundMusic,
    isMuted
  } = useAudio();
  
  // ⚡ LEGENDARY INTRO SYSTEM
  const [showIntro, setShowIntro] = useState(true);

  // Initialize audio on mount (non-fatal if files missing)
  useEffect(() => {
    try {
      const bgMusic = new Audio("/sounds/background.mp3");
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      setBackgroundMusic(bgMusic);
      const battleMusic = new Audio("/sounds/background.mp3");
      battleMusic.loop = true;
      battleMusic.volume = 0.4;
      setBattleMusic(battleMusic);
      setHitSound(new Audio("/sounds/hit.mp3"));
      setSuccessSound(new Audio("/sounds/success.mp3"));
    } catch (e) {
      console.warn("Audio init skipped:", e);
    }
  }, [setBackgroundMusic, setBattleMusic, setHitSound, setSuccessSound]);

  // Play background music in menu states
  useEffect(() => {
    if (!backgroundMusic || isMuted) return;

    if (gameState === 'menu' || gameState === 'character-select') {
      backgroundMusic.play().catch(() => {
        console.log("Background music autoplay blocked - waiting for user interaction");
      });
    } else {
      backgroundMusic.pause();
    }
  }, [gameState, backgroundMusic, isMuted]);

  // Set up battle fighters when character is selected
  useEffect(() => {
    if (selectedCharacter && phase === 'playing') {
      setPlayerFighter(selectedCharacter);
      const opponents = FIGHTERS.map(f => f.id).filter(id => id !== selectedCharacter);
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)] || selectedCharacter;
      setOpponentFighter(randomOpponent);
    }
  }, [selectedCharacter, phase, setPlayerFighter, setOpponentFighter]);

  // Handle intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Calculate screen shake transform
  const shakeTransform = screenShake > 0 
    ? `translate(${(Math.random() - 0.5) * screenShake * 5}px, ${(Math.random() - 0.5) * screenShake * 5}px)`
    : 'none';

  return (
    <div 
      style={{ 
        width: '100vw', 
        minHeight: '100vh', 
        position: 'relative', 
        overflow: 'auto',
        background: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
        transform: shakeTransform,
      }}
    >
      {/* ⚡ LEGENDARY INTRO SEQUENCE */}
      {showIntro && <GameIntro onComplete={handleIntroComplete} />}
      
      <KeyboardControls map={controls}>
        {/* Main Menu */}
        {phase === "ready" && gameState === "menu" && !showIntro && <MainMenu />}

        {/* Campaign: RPG adventure — map, waves, bosses, progression to big bad */}
        {phase === "ready" && gameState === "campaign-map" && <CampaignMap />}

        {/* Missions / Trials (optional challenge list) */}
        {phase === "ready" && (gameState === "story-mode-select" || gameState === "mission-select") && (
          <MissionSelectHub />
        )}
        
        {/* Versus Mode - redirect to character select for now */}
        {phase === 'ready' && gameState === 'versus-select' && (
          <CharacterSelect />
        )}
        
        {/* Character Selection */}
        {phase === 'ready' && gameState === 'character-select' && <CharacterSelect />}
        
        {/* Customization Menu */}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}
        
        {/* ⚡ BATTLE CANVAS - THE MAIN EVENT! */}
        {(phase === 'playing' || phase === 'ended') && (
          <>
            <div className="relative w-full h-full min-h-[200px]">
              <Canvas
                shadows
                camera={{
                  position: [0, 5, 10],
                  fov: 60,
                  near: 0.1,
                  far: 1000
                }}
                onCreated={({ gl }) => {
                  const q = getQualitySettings();
                  gl.setPixelRatio(q.pixelRatio);
                  gl.outputColorSpace = THREE.SRGBColorSpace;
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 0.98;
                  gl.shadowMap.enabled = true;
                  gl.shadowMap.type = q.shadowMap.type as THREE.ShadowMapType;
                }}
                gl={{
                  antialias: getQualitySettings().antialias,
                  powerPreference: "high-performance"
                }}
              >
                <Suspense fallback={null}>
                  <BattleScene />
                </Suspense>
              </Canvas>
              <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-sm pointer-events-none">
                ← → move · Space jump · J punch · K kick · L special · T transform
              </div>
            </div>
            
            {/* ⚡ LEGENDARY UI OVERLAYS */}
            <BattleUI />
            <TransformationOverlay />
            <ScreenEffects />
            <DialogueDisplay />
            <MobileControls />
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;
