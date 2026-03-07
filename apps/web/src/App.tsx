import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import "@fontsource/bebas-neue";

import BattleScene from "./components/game/BattleScene";
import MobileControls from "./components/game/MobileControls";
import BattleUI from "./components/game/BattleUI";
import MainMenu from "./components/game/MainMenu";
import AdventureModeSelect from "./components/game/AdventureModeSelect";
import VersusCharacterSelect from "./components/game/VersusCharacterSelect";
import BeastPreview from "./components/game/BeastPreview";
import CampaignMap from "./components/game/CampaignMap";
import TransformationOverlay from "./components/game/TransformationOverlay";
import ScreenEffects from "./components/game/ScreenEffects";
import LegendaryFinishOverlay from "./components/game/LegendaryFinishOverlay";
import { GameIntro, LoadingView } from "./components/game/LoadingScreen";
import CustomizationMenu from "./components/game/CustomizationMenu";
import LoreHub from "./components/game/LoreHub";
import MissionSelectHub from "./components/game/MissionSelectHub";
import ShopView from "./components/game/ShopView";
import TutorialOverlay from "./components/game/TutorialOverlay";
import TrainingOverlay from "./components/game/TrainingOverlay";
import AdventureArena from "./components/game/adventure/AdventureArena";
import AdventureHUD from "./components/game/adventure/AdventureHUD";
import StoryAdventure from "./components/game/StoryAdventure";
import { useGame } from "./lib/stores/useGame";
import { useLoadingProgress } from "./lib/stores/useLoadingProgress";
import { useOnline } from "./lib/useOnline";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { useMissions } from "./lib/stores/useMissions";
import { useTutorial } from "./lib/stores/useTutorial";
import { useSettings, UI_SCALE_VALUES } from "./lib/stores/useSettings";
import { getFighterById } from "./lib/characters";
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
  const { progress, isReady, startLoading } = useLoadingProgress();
  const online = useOnline();
  const [offlineBannerDismissed, setOfflineBannerDismissed] = useState(false);
  useEffect(() => {
    if (online) setOfflineBannerDismissed(false);
  }, [online]);
  const { gameState, selectedCharacter, activeStoryMissionId, activeAdventureMissionId } = useRunner();
  const { setPlayerFighter, screenShake } = useBattle();
  const { 
    setBackgroundMusic, 
    setBattleMusic, 
    setHitSound, 
    setSuccessSound,
    backgroundMusic,
    battleMusic,
    isMuted,
    masterVolume,
    musicVolume,
  } = useAudio();
  const hasTutorialBeenSeen = useTutorial((s) => s.hasSeenTutorial);
  const uiScale = useSettings((s) => s.uiScale);
  
  // Sync --ui-scale to root for UI scaling
  useEffect(() => {
    document.documentElement.style.setProperty("--ui-scale", String(UI_SCALE_VALUES[uiScale]));
  }, [uiScale]);
  
  // ⚡ LEGENDARY INTRO SYSTEM
  const [showIntro, setShowIntro] = useState(true);

  // Loading: preload assets, then transition to LoreHub
  useEffect(() => {
    startLoading();
  }, [startLoading]);

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

  // Apply volume to music elements when volume or mute changes
  useEffect(() => {
    if (!backgroundMusic || !battleMusic) return;
    const vol = isMuted ? 0 : masterVolume * musicVolume;
    backgroundMusic.volume = 0.3 * vol;
    battleMusic.volume = 0.4 * vol;
  }, [backgroundMusic, battleMusic, isMuted, masterVolume, musicVolume]);

  // Play background music in menu states
  useEffect(() => {
    if (!backgroundMusic || isMuted) return;

    if (gameState === 'menu' || gameState === 'character-select') {
      backgroundMusic.volume = 0.3 * masterVolume * musicVolume;
      backgroundMusic.play().catch(() => {
        console.log("Background music autoplay blocked - waiting for user interaction");
      });
    } else {
      backgroundMusic.pause();
    }
  }, [gameState, backgroundMusic, isMuted, masterVolume, musicVolume]);

  // Sync player fighter when character is selected (opponent/personality set by VersusCharacterSelect or MissionSelectHub)
  useEffect(() => {
    if (selectedCharacter && phase === 'playing') {
      setPlayerFighter(selectedCharacter);
    }
  }, [selectedCharacter, phase, setPlayerFighter]);

  // Handle intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    useRunner.getState().unlockLore("catalyst-event");
  };

  // Calculate screen shake transform
  const shakeTransform = screenShake > 0 
    ? `translate(${(Math.random() - 0.5) * screenShake * 5}px, ${(Math.random() - 0.5) * screenShake * 5}px)`
    : 'none';

  // Show loading screen until assets are ready
  if (!isReady) {
    return <LoadingView progress={progress} />;
  }

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
      {/* Offline banner - auto-hides when back online, dismissible */}
      {!online && !offlineBannerDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-center gap-2 px-4 py-2 bg-amber-900/95 text-amber-100 text-sm">
          <span>You&apos;re offline. Some features may be limited.</span>
          <button
            type="button"
            onClick={() => setOfflineBannerDismissed(true)}
            aria-label="Dismiss"
            className="text-amber-300/80 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Lore Hub - Landing Page */}
      {gameState === "lore-hub" && <LoreHub />}

      {/* First-run tutorial (versus-select or campaign-map) */}
      {(gameState === "versus-select" || gameState === "campaign-map") && !hasTutorialBeenSeen && (
        <TutorialOverlay onComplete={() => {}} />
      )}

      {/* ⚡ LEGENDARY INTRO SEQUENCE */}
      {showIntro && gameState !== "lore-hub" && <GameIntro onComplete={handleIntroComplete} />}
      
      <KeyboardControls map={controls}>
        {/* Main Menu */}
        {phase === "ready" && gameState === "menu" && !showIntro && <MainMenu />}

        {/* Campaign: RPG adventure — map, waves, bosses, progression to big bad */}
        {phase === "ready" && gameState === "campaign-map" && <CampaignMap />}

        {/* Challenge Mode - Story + UEE missions */}
        {phase === "ready" && gameState === "mission-select" && <MissionSelectHub />}

        {/* Versus Mode - full 3D beast model character select */}
        {phase === 'ready' && gameState === 'versus-select' && (
          <VersusCharacterSelect />
        )}
        
        {/* Beast Preview - inspect the layered rendering system */}
        {phase === 'ready' && gameState === 'beast-preview' && <BeastPreview />}
        
        {/* Customization Menu */}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}

        {/* Adventure Mode Select - pick Free Arena or mission */}
        {phase === "ready" && gameState === "adventure-select" && <AdventureModeSelect />}

        {/* Shop / Unlocks */}
        {phase === "ready" && gameState === "shop" && <ShopView />}
        
        {/* ⚡ ADVENTURE MODE - Open World 3D Arena */}
        {gameState === 'adventure' && (() => {
          const charId = selectedCharacter || "kai-jax";
          const fighter = getFighterById(charId);
          const missionId = activeAdventureMissionId || "free-arena";
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
                    gl.shadowMap.enabled = q.shadowsEnabled;
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
                      adventureMissionId={missionId}
                    />
                  </Suspense>
                </Canvas>
                <AdventureHUD adventureMissionId={missionId} />
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
                    gl.shadowMap.enabled = q.shadowsEnabled;
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
                      adventureMissionId="story-mode"
                    />
                  </Suspense>
                </Canvas>
                <AdventureHUD adventureMissionId="story-mode" />
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
        {(phase === 'playing' || phase === 'ended') && (gameState === 'playing' || gameState === 'training') && (
          <>
            <div className="relative w-full h-screen">
              <Canvas
                shadows
                camera={{
                  position: [0, 5.5, 8],
                  fov: 62,
                  near: 0.1,
                  far: 1000
                }}
                onCreated={({ gl }) => {
                  const q = getQualitySettings();
                  gl.setPixelRatio(q.pixelRatio);
                  gl.outputColorSpace = THREE.SRGBColorSpace;
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 0.98;
                  gl.shadowMap.enabled = q.shadowsEnabled;
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
              <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-sm pointer-events-none hidden md:block">
                ← → move · Space jump · J punch · K kick · L special · T transform
              </div>
            </div>
            
            {/* ⚡ LEGENDARY UI OVERLAYS (scaled by --ui-scale) */}
            <div
              className="fixed inset-0 pointer-events-none z-[100]"
              style={{ transform: "scale(var(--ui-scale))", transformOrigin: "center center" }}
            >
              <BattleUI />
              <TransformationOverlay />
              <LegendaryFinishOverlay />
              <ScreenEffects />
              <MobileControls />
              {gameState === 'training' && <TrainingOverlay />}
            </div>
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;
