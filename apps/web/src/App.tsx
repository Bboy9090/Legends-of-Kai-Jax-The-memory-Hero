import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useMemo, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import "@fontsource/bebas-neue";

import BattleScene from "./components/game/BattleScene";
import MobileControls from "./components/game/MobileControls";
import BattleUI from "./components/game/BattleUI";
import DialogueDisplay from "./components/game/DialogueDisplay";
import MainMenu from "./components/game/MainMenu";
import VersusCharacterSelect from "./components/game/VersusCharacterSelect";
import BeastPreview from "./components/game/BeastPreview";
import CampaignMap from "./components/game/CampaignMap";
import DistrictSelectScreen from "./components/game/DistrictSelectScreen";
import TransformationOverlay from "./components/game/TransformationOverlay";
import ScreenEffects from "./components/game/ScreenEffects";
import { GameIntro } from "./components/game/LoadingScreen";
import CustomizationMenu from "./components/game/CustomizationMenu";
import LoreHub from "./components/game/LoreHub";
import ControllerTestScene from "./components/game/ControllerTestScene";
import AdventureArena from "./components/game/adventure/AdventureArena";
import AdventureHUD from "./components/game/adventure/AdventureHUD";
import StoryAdventure from "./components/game/StoryAdventure";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { useMissions } from "./lib/stores/useMissions";
import { FIGHTERS, getFighterById } from "./lib/characters";
import * as THREE from "three";
import { getQualitySettings } from "./lib/threejs/PerformanceOptimizer";

// Compute quality settings once (device/pixel-ratio never changes mid-session)
const QUALITY = getQualitySettings();

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
  const { gameState, selectedCharacter, activeStoryMissionId } = useRunner();
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

  // Calculate screen shake transform - stable random offsets per shake intensity change
  const shakeOffsetRef = useRef({ x: 0, y: 0 });
  const shakeTransform = useMemo(() => {
    if (screenShake > 0) {
      shakeOffsetRef.current = {
        x: (Math.random() - 0.5) * screenShake * 5,
        y: (Math.random() - 0.5) * screenShake * 5,
      };
      return `translate(${shakeOffsetRef.current.x}px, ${shakeOffsetRef.current.y}px)`;
    }
    return 'none';
  }, [screenShake]);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative', 
        overflow: gameState === 'lore-hub' ? 'auto' : 'hidden',
        background: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
        transform: shakeTransform,
      }}
    >
      {/* Lore Hub - Landing Page */}
      {gameState === "lore-hub" && <LoreHub />}

      {/* ⚡ LEGENDARY INTRO SEQUENCE */}
      {showIntro && gameState !== "lore-hub" && <GameIntro onComplete={handleIntroComplete} />}
      
      <KeyboardControls map={controls}>
        {/* Main Menu */}
        {phase === "ready" && gameState === "menu" && !showIntro && <MainMenu />}

        {/* Campaign: RPG adventure — map, waves, bosses, progression to big bad */}
        {phase === "ready" && gameState === "campaign-map" && <CampaignMap />}

        {phase === "ready" && gameState === "district-select" && <DistrictSelectScreen />}

        {/* Versus Mode - full 3D beast model character select */}
        {phase === 'ready' && gameState === 'versus-select' && (
          <VersusCharacterSelect />
        )}
        
        {/* Beast Preview - inspect the layered rendering system */}
        {phase === 'ready' && gameState === 'beast-preview' && <BeastPreview />}
        
        {/* Customization Menu */}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}

        {/* Controller Test - movement state foundation */}
        {gameState === 'controller-test' && <ControllerTestScene />}
        
        {/* ⚡ ADVENTURE MODE - Open World 3D Arena */}
        {gameState === 'adventure' && (() => {
          const charId = selectedCharacter || "kai-jax";
          const fighter = getFighterById(charId);
          return (
            <>
              <div className="relative w-full h-screen">
                <Canvas
                  shadows
                  camera={{
                    position: [0, 4, 7],
                    fov: 50,
                    near: 0.1,
                    far: 200,
                  }}
                  onCreated={({ gl }) => {
                    gl.setPixelRatio(QUALITY.pixelRatio);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 0.85;
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = QUALITY.shadowMap.type as THREE.ShadowMapType;
                  }}
                  gl={{
                    antialias: QUALITY.antialias,
                    powerPreference: "high-performance",
                  }}
                >
                  <Suspense fallback={null}>
                    <AdventureArena
                      characterId={charId}
                      accentColor={fighter?.accentColor || "#00f2ff"}
                    />
                  </Suspense>
                </Canvas>
                <AdventureHUD />
              </div>
              <MobileControls />
            </>
          );
        })()}

        {/* ⚡ STORY MODE - Adventure with narrative */}
        {gameState === 'story-mode' && (() => {
          const charId = selectedCharacter || "kai-jax";
          const fighter = getFighterById(charId);
          const storyMissionId = activeStoryMissionId || "act1-1";
          return (
            <>
              <div className="relative w-full h-screen">
                <Canvas
                  shadows
                  camera={{
                    position: [0, 4, 7],
                    fov: 50,
                    near: 0.1,
                    far: 200,
                  }}
                  onCreated={({ gl }) => {
                    const q = getQualitySettings();
                    gl.setPixelRatio(q.pixelRatio);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 0.85;
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = q.shadowMap.type as THREE.ShadowMapType;
                  }}
                  gl={{
                    antialias: getQualitySettings().antialias,
                    powerPreference: "high-performance",
                  }}
                >
                  <Suspense fallback={null}>
                    <AdventureArena
                      characterId={charId}
                      accentColor={fighter?.accentColor || "#00f2ff"}
                    />
                  </Suspense>
                </Canvas>
                <AdventureHUD />
                <StoryAdventure
                  missionId={storyMissionId}
                  characterId={charId}
                  onComplete={(success) => {
                    if (success) {
                      useMissions.getState().startMission("story", storyMissionId);
                      useMissions.getState().completeMission(true);
                    }
                    useRunner.getState().setGameState("campaign-map");
                  }}
                  onBack={() => useRunner.getState().setGameState("campaign-map")}
                />
              </div>
              <MobileControls />
            </>
          );
        })()}

        {/* ⚡ BATTLE CANVAS - THE MAIN EVENT! */}
        {(phase === 'playing' || phase === 'ended') && gameState === 'playing' && (
          <>
            <div className="relative w-full h-screen">
              <Canvas
                shadows
                camera={{
                  position: [0, 3.5, 7],
                  fov: 50,
                  near: 0.1,
                  far: 1000
                }}
                onCreated={({ gl }) => {
                  gl.setPixelRatio(QUALITY.pixelRatio);
                  gl.outputColorSpace = THREE.SRGBColorSpace;
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 0.98;
                  gl.shadowMap.enabled = true;
                  gl.shadowMap.type = QUALITY.shadowMap.type as THREE.ShadowMapType;
                }}
                gl={{
                  antialias: QUALITY.antialias,
                  powerPreference: "high-performance"
                }}
              >
                <Suspense fallback={null}>
                  <BattleScene />
                </Suspense>
              </Canvas>
              <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-sm pointer-events-none hidden md:block">
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
