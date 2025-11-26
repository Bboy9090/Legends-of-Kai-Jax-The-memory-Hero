import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";

import BattleScene from "./components/game/BattleScene";
import TouchControls from "./components/game/TouchControls";
import MobileControls from "./components/game/MobileControls";
import BattleUI from "./components/game/BattleUI";
import DialogueDisplay from "./components/game/DialogueDisplay";
import MainMenu from "./components/game/MainMenu";
import CharacterSelect from "./components/game/CharacterSelect";
import MVCCharacterSelect from "./components/game/MVCCharacterSelect";
import CustomizationMenu from "./components/game/CustomizationMenu";
import NexusHaven from "./components/game/world/NexusHaven";
import SquadSelection from "./components/game/SquadSelection";
import StoryModeSelect from "./components/game/StoryModeSelect";
import GameModesMenu from "./components/game/GameModesMenu";
import MissionSelect from "./components/game/MissionSelect";
import MissionGameplay from "./components/game/MissionGameplay";
import TeamBattleArena from "./components/game/TeamBattleArena";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { useEffect, useState } from "react";

// Define control keys for the game (also works with touch)
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
  webSwing = 'webSwing', // Hold to attach web, release to launch
  chargeKick = 'chargeKick', // Hold to charge kick while web-swinging
  transform = 'transform', // Activate transformation
  energyBlast = 'energyBlast' // Fire energy blast (Jaxon only)
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
  { name: Controls.webSwing, keys: ["ControlLeft", "ControlRight"] }, // Hold Ctrl for web
  { name: Controls.chargeKick, keys: ["KeyF"] }, // F to charge kick
  { name: Controls.transform, keys: ["KeyT"] }, // T to transform
  { name: Controls.energyBlast, keys: ["KeyE"] }, // E for energy blast
];

function App() {
  const { phase } = useGame();
  const { gameState, selectedCharacter, setGameState } = useRunner();
  const { setPlayerFighter, setOpponentFighter } = useBattle();
  const { 
    setBackgroundMusic, 
    setBattleMusic, 
    setHitSound, 
    setSuccessSound,
    backgroundMusic,
    isMuted
  } = useAudio();
  const [currentActNumber, setCurrentActNumber] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [completedActs, setCompletedActs] = useState<(1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [battleMode, setBattleMode] = useState<'story' | 'versus' | 'mission'>('story');

  // Initialize audio on mount
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Use background music as battle music too for now
    const battleMusic = new Audio('/sounds/background.mp3');
    battleMusic.loop = true;
    battleMusic.volume = 0.4;
    setBattleMusic(battleMusic);

    const hit = new Audio('/sounds/hit.mp3');
    setHitSound(hit);

    const success = new Audio('/sounds/success.mp3');
    setSuccessSound(success);

    console.log("Audio initialized");
  }, [setBackgroundMusic, setBattleMusic, setHitSound, setSuccessSound]);

  // Play background music in menu/hub states
  useEffect(() => {
    if (!backgroundMusic || isMuted) return;

    if (gameState === 'menu' || gameState === 'nexus-haven' || gameState === 'character-select' || gameState === 'squad-select') {
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
      // Set random opponent
      const opponents = ['speedy', 'marlo', 'leonardo', 'midnight', 'flynn'];
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
      setOpponentFighter(randomOpponent);
    }
  }, [selectedCharacter, phase, setPlayerFighter, setOpponentFighter]);

  // Debug logging
  console.log("App render - phase:", phase, "gameState:", gameState);

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      position: 'relative', 
      overflow: 'auto',
      background: 'linear-gradient(to bottom, #87CEEB, #98FB98)'
    }}>
      <KeyboardControls map={controls}>
        {/* Main Menu */}
        {phase === 'ready' && gameState === 'menu' && <MainMenu />}
        
        {/* Story Mode Selection */}
        {phase === 'ready' && gameState === 'story-mode-select' && !currentMissionId && (
          <StoryModeSelect 
            onSelectAct={(actNumber) => {
              setCurrentActNumber(actNumber);
              setGameState('mission-select');
            }}
            onBack={() => setGameState('menu')}
            completedActs={completedActs}
          />
        )}
        
        {/* Mission Selection */}
        {phase === 'ready' && gameState === 'mission-select' && !currentMissionId && (
          <MissionSelect
            actNumber={currentActNumber}
            onSelectMission={(missionId) => {
              setCurrentMissionId(missionId);
              setGameState('mission-team-select');
            }}
            onBack={() => setGameState('story-mode-select')}
            completedMissions={completedMissions}
          />
        )}
        
        {/* Mission Team Select - Choose heroes before mission */}
        {phase === 'ready' && gameState === 'mission-team-select' && currentMissionId && (
          <MVCCharacterSelect
            mode="mission"
            maxTeamSize={4}
            onTeamComplete={(team) => {
              setSelectedTeam(team);
              setGameState('mission-gameplay');
            }}
            onBack={() => {
              setCurrentMissionId(null);
              setGameState('mission-select');
            }}
          />
        )}
        
        {/* Mission Gameplay */}
        {phase === 'ready' && gameState === 'mission-gameplay' && currentMissionId && (
          <TeamBattleArena
            missionId={currentMissionId}
            playerTeam={selectedTeam}
            onBattleComplete={(success: boolean) => {
              if (success) {
                setCompletedMissions([...completedMissions, currentMissionId]);
              }
              setCurrentMissionId(null);
              setSelectedTeam([]);
              setGameState('mission-select');
            }}
            onBack={() => {
              setCurrentMissionId(null);
              setSelectedTeam([]);
              setGameState('mission-select');
            }}
          />
        )}
        
        {/* Versus Mode Character Select */}
        {phase === 'ready' && gameState === 'versus-select' && (
          <MVCCharacterSelect
            mode="battle"
            maxTeamSize={4}
            onTeamComplete={(team) => {
              setSelectedTeam(team);
              setBattleMode('versus');
              setGameState('versus-battle');
            }}
            onBack={() => setGameState('menu')}
          />
        )}
        
        {/* Versus Battle */}
        {phase === 'ready' && gameState === 'versus-battle' && (
          <TeamBattleArena
            missionId={null}
            playerTeam={selectedTeam}
            onBattleComplete={() => {
              setSelectedTeam([]);
              setGameState('menu');
            }}
            onBack={() => {
              setSelectedTeam([]);
              setGameState('versus-select');
            }}
          />
        )}
        
        {/* Game Modes Menu */}
        {phase === 'ready' && gameState === 'game-modes-menu' && (
          <GameModesMenu 
            onSelectMode={(mode) => {
              // TODO: Start game mode
              console.log("Starting Game Mode:", mode);
            }}
            onBack={() => setGameState('menu')}
            unlockedModes={['legacy']}
          />
        )}
        
        {/* Nexus Haven Hub */}
        {phase === 'ready' && gameState === 'nexus-haven' && <NexusHaven />}
        
        {/* Squad Selection */}
        {phase === 'ready' && gameState === 'squad-select' && <SquadSelection />}
        
        {/* Character Selection */}
        {phase === 'ready' && gameState === 'character-select' && <CharacterSelect />}
        
        {/* Customization Menu */}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}
        
        {/* Game Canvas */}
        {(phase === 'playing' || phase === 'ended') && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 5, 10],  // Adjusted for better mobile zoom
                fov: 60,  // Narrower FOV = more zoom to fill screen!
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
            >
              <color attach="background" args={["#87CEEB"]} />
              
              <Suspense fallback={null}>
                <BattleScene />
              </Suspense>
            </Canvas>
            
            {/* Battle UI Overlay */}
            <BattleUI />
            
            {/* Dialogue/Banter Display */}
            <DialogueDisplay />
            
            {/* Mobile Touch Controls */}
            <MobileControls />
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;
