import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useMemo, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import "@fontsource/bebas-neue";

import BattleScene from "./components/game/BattleScene";
import MobileControls from "./components/game/MobileControls";
import BattleUI from "./components/game/BattleUI";
import DialogueDisplay from "./components/game/DialogueDisplay";
import LegendaryMainMenu from "./components/game/LegendaryMainMenu";

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
import { JaxTestScene } from "./components/game/characters/jax/JaxTestScene";
import RagingCityVerticalSliceScene from "./components/game/RagingCityVerticalSliceScene";
import AdventureArena from "./components/game/adventure/AdventureArena";
import AdventureHUD from "./components/game/adventure/AdventureHUD";
import AdventureTouchControls from "./components/game/adventure/AdventureTouchControls";
import SettingsMenu from "./components/game/SettingsMenu";
import TitleScreen from "./components/game/TitleScreen";
import SaveSlotScreen from "./components/game/SaveSlotScreen";
import BootAccessibilityScreen from "./components/game/BootAccessibilityScreen";
import StoryHubScreen from "./components/game/StoryHubScreen";
import StoryHeroSelect from "./components/game/StoryHeroSelect";
import MissionSelectScreen from "./components/game/MissionSelectScreen";
import CharacterAbilityScreen from "./components/game/CharacterAbilityScreen";
import MissionCompleteScreen from "./components/game/MissionCompleteScreen";
import DevFrameHud from "./components/game/DevFrameHud";
import GameOverlays from "./components/game/GameOverlays";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { useProgression } from "./lib/stores/useProgression";
import { registerServiceWorker } from "./lib/offlineModeSystem";
import { getFighterById } from "./lib/characters";
import {
  VERSUS_ROSTER,
  getCombatProfileId,
  getVersusRosterEntry,
} from "./lib/versusRoster";
import { initializeVoiceSystem, preloadVoices } from "./lib/voiceActing";
import * as THREE from "three";
import { getQualitySettings } from "./lib/threejs/PerformanceOptimizer";

const QUALITY = getQualitySettings();

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

function resolvePublicCombatId(publicId: string | null | undefined): string {
  if (!publicId) return "kai";
  const entry = getVersusRosterEntry(publicId);
  return entry ? getCombatProfileId(entry) : "kai";
}

function resolveArenaOpponentCombatId(playerPublicId: string | null | undefined): string {
  const playerCombatId = resolvePublicCombatId(playerPublicId);
  const opponent = VERSUS_ROSTER.find((entry) => {
    if (!entry.defaultUnlocked) return false;
    const combatId = getCombatProfileId(entry);
    return combatId !== playerCombatId && Boolean(getFighterById(combatId));
  });
  return opponent ? getCombatProfileId(opponent) : playerCombatId;
}

function App() {
  const { phase } = useGame();
  const { gameState, selectedCharacter } = useRunner();
  const battleCanvasActive =
    (phase === "playing" || phase === "ended") && gameState === "playing";

  useEffect(() => {
    console.log('[Blocker A Trace] App render', { phase, gameState, battleCanvasActive });
  }, [phase, gameState, battleCanvasActive]);

  useEffect(() => {
    const menuLike =
      gameState === "menu" ||
      gameState === "versus-select" ||
      gameState === "campaign-map" ||
      gameState === "district-select" ||
      gameState === "beast-preview" ||
      gameState === "customization" ||
      gameState === "character-select";
    if (phase === "ended" && menuLike) {
      useGame.getState().reset();
    }
  }, [phase, gameState]);

  const { setPlayerFighter, setOpponentFighter, screenShake } = useBattle();
  const {
    setBackgroundMusic,
    setBattleMusic,
    setHitSound,
    setSuccessSound,
    backgroundMusic,
    isMuted
  } = useAudio();

  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    void useProgression.getState();
    registerServiceWorker().catch(() => {
      /* offline support is best-effort; non-fatal if unavailable */
    });
    initializeVoiceSystem();
    preloadVoices();
  }, []);

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

  // Public roster ids stay in runner/profile state. Only the battle renderer receives
  // the temporary legacy combat-profile id where a migration bridge is still needed.
  useEffect(() => {
    if (selectedCharacter && phase === 'playing') {
      setPlayerFighter(resolvePublicCombatId(selectedCharacter));
      setOpponentFighter(resolveArenaOpponentCombatId(selectedCharacter));
    }
  }, [selectedCharacter, phase, setPlayerFighter, setOpponentFighter]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

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
      <GameOverlays />

      {(gameState === "lore-hub" || gameState === "codex") && <LoreHub />}
      {gameState === "settings" && <SettingsMenu />}
      {showIntro && gameState !== "lore-hub" && <GameIntro onComplete={handleIntroComplete} />}

      <KeyboardControls map={controls}>
        {phase === "ready" && gameState === "title" && !showIntro && <TitleScreen />}
        {phase === "ready" && gameState === "menu" && !showIntro && <LegendaryMainMenu />}
        {phase === "ready" && gameState === "save-slots" && <SaveSlotScreen />}
        {phase === "ready" && gameState === "story-hub" && <StoryHubScreen />}
        {phase === "ready" && gameState === "character-select" && <StoryHeroSelect />}
        {phase === "ready" && gameState === "mission-select" && <MissionSelectScreen />}
        {phase === "ready" && gameState === "abilities" && <CharacterAbilityScreen />}
        {phase === "ready" && gameState === "mission-complete" && <MissionCompleteScreen />}
        {phase === "ready" && gameState === "campaign-map" && <CampaignMap />}
        {phase === "ready" && gameState === "district-select" && <DistrictSelectScreen />}

        {phase === 'ready' && gameState === 'versus-select' && (
          <VersusCharacterSelect />
        )}

        {phase === 'ready' && gameState === 'beast-preview' && <BeastPreview />}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}
        {gameState === 'controller-test' && <ControllerTestScene />}
        {gameState === 'jax-test' && <JaxTestScene />}
        {gameState === 'vertical-slice' && <RagingCityVerticalSliceScene />}

        {gameState === 'adventure' && (() => {
          const charId = resolvePublicCombatId(selectedCharacter);
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
              <AdventureTouchControls />
            </>
          );
        })()}

        {/* Legacy multiverse StoryAdventure data is quarantined. Keep this route on
            the Bloodward-safe mission briefing until current story missions replace it. */}
        {gameState === 'story-mode' && <MissionSelectScreen />}

        {battleCanvasActive && (
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
                ← → move · Space jump · J punch · K kick · L special · Q/E dodge · Alt block · R ultimate · T fusion when story-unlocked
              </div>
            </div>

            <BattleUI />
            <TransformationOverlay />
            <ScreenEffects />
            <DialogueDisplay />
            <MobileControls />
            <DevFrameHud active={battleCanvasActive} />
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;
