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
import TransformationOverlay from "./components/game/TransformationOverlay";
import ScreenEffects from "./components/game/ScreenEffects";
import { GameIntro } from "./components/game/LoadingScreen";
import CustomizationMenu from "./components/game/CustomizationMenu";
import AdventureArena from "./components/game/AdventureArena";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { FIGHTERS } from "./lib/characters";
import { BRAND } from "./lib/brand";
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

const ADVENTURE_CHARACTERS = [
  { id: 'kai_jax_beast', name: 'KAI-JAX', subtitle: 'The Memory King', color: '#8B5CF6' },
  { id: 'kaison_beast', name: 'KAISON', subtitle: 'Twin of Law', color: '#3B82F6' },
  { id: 'jaxon_beast', name: 'JAXON', subtitle: 'Twin of Sacrifice', color: '#EF4444' },
  { id: 'boryx_zenith_beast', name: 'BORYX ZENITH', subtitle: 'Guardian King', color: '#F59E0B' },
  { id: 'lunara_solis_beast', name: 'LUNARA SOLIS', subtitle: 'Oracle Sentinel', color: '#EC4899' },
  { id: 'phoenix_warrior', name: 'PHOENIX WARRIOR', subtitle: 'Flame Reborn', color: '#F97316' },
  { id: 'frost_wolf', name: 'FROST WOLF', subtitle: 'Ice Stalker', color: '#06B6D4' },
  { id: 'thunder_lion', name: 'THUNDER LION', subtitle: 'Storm Sovereign', color: '#FBBF24' },
  { id: 'jade_serpent', name: 'JADE SERPENT', subtitle: 'Venom Sage', color: '#10B981' },
  { id: 'shadow_panther', name: 'SHADOW PANTHER', subtitle: 'Void Hunter', color: '#6366F1' },
  { id: 'earth_turtle', name: 'EARTH TURTLE', subtitle: 'Ancient Guardian', color: '#84CC16' },
  { id: 'voidonus_beast', name: 'VOIDONUS', subtitle: 'The Final Darkness', color: '#991B1B' },
];

function AdventureCharacterSelect({ onSelect, onBack }: { onSelect: (id: string) => void; onBack: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'auto', padding: '2rem',
    }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px',
          cursor: 'pointer', fontSize: '0.9rem',
        }}
      >
        BACK
      </button>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '3rem', color: 'white', letterSpacing: '0.15em',
        marginBottom: '0.5rem', textAlign: 'center',
      }}>
        CHOOSE YOUR <span style={{ color: '#8B5CF6' }}>BEAST-KIN</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', textAlign: 'center' }}>
        Select a warrior to enter the open world
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem', maxWidth: '900px', width: '100%',
      }}>
        {ADVENTURE_CHARACTERS.map((char) => {
          const isHovered = hoveredId === char.id;
          return (
            <button
              key={char.id}
              onClick={() => onSelect(char.id)}
              onMouseEnter={() => setHoveredId(char.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, ${char.color}30, ${char.color}10)`
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isHovered ? char.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', padding: '1.5rem', cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none',
                boxShadow: isHovered ? `0 8px 32px ${char.color}40` : 'none',
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: `radial-gradient(circle, ${char.color}60, ${char.color}20)`,
                margin: '0 auto 0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${char.color}80`,
              }}>
                <span style={{ fontSize: '1.5rem', color: char.color, fontWeight: 'bold' }}>
                  {char.name[0]}
                </span>
              </div>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.2rem', color: 'white', letterSpacing: '0.1em',
                margin: 0,
              }}>
                {char.name}
              </p>
              <p style={{
                fontSize: '0.7rem', color: char.color,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                margin: '0.25rem 0 0',
              }}>
                {char.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  const { phase } = useGame();
  const { gameState, selectedCharacter, setGameState } = useRunner();
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
  const [adventureCharacter, setAdventureCharacter] = useState('kai_jax_beast');

  // Initialize audio on mount
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const battleMusic = new Audio('/sounds/background.mp3');
    battleMusic.loop = true;
    battleMusic.volume = 0.4;
    setBattleMusic(battleMusic);

    const hit = new Audio('/sounds/hit.mp3');
    setHitSound(hit);

    const success = new Audio('/sounds/success.mp3');
    setSuccessSound(success);

    console.log(`⚡ ${BRAND.title} - Audio initialized`);
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
        {phase === 'ready' && gameState === 'menu' && !showIntro && <MainMenu />}
        
        {/* Story Mode - redirect to character select for now */}
        {phase === 'ready' && gameState === 'story-mode-select' && (
          <CharacterSelect />
        )}
        
        {/* Versus Mode - redirect to character select for now */}
        {phase === 'ready' && gameState === 'versus-select' && (
          <CharacterSelect />
        )}
        
        {/* Character Selection */}
        {phase === 'ready' && gameState === 'character-select' && <CharacterSelect />}
        
        {/* Customization Menu */}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}

        {/* Adventure Character Select */}
        {phase === 'ready' && gameState === 'adventure-select' && (
          <AdventureCharacterSelect
            onSelect={(id: string) => {
              setAdventureCharacter(id);
              setGameState('adventure');
            }}
            onBack={() => setGameState('menu')}
          />
        )}

        {/* Open World Adventure Mode */}
        {gameState === 'adventure' && (
          <AdventureArena
            characterId={adventureCharacter}
            onBack={() => setGameState('menu')}
          />
        )}
        
        {/* BATTLE CANVAS */}
        {(phase === 'playing' || phase === 'ended') && (
          <>
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
                gl.toneMappingExposure = 1.15;
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = q.shadowMap.type;
              }}
              gl={{
                antialias: getQualitySettings().antialias,
                powerPreference: "high-performance"
              }}
            >
              <color attach="background" args={["#1a1a2e"]} />
              
              <Suspense fallback={null}>
                <BattleScene />
              </Suspense>
            </Canvas>
            
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
