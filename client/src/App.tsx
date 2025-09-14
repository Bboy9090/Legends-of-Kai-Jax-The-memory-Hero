import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";

import GameScene from "./components/game/GameScene";
import TouchControls from "./components/game/TouchControls";
import GameUI from "./components/game/GameUI";
import MainMenu from "./components/game/MainMenu";
import CharacterSelect from "./components/game/CharacterSelect";
import ChoiceMode from "./components/game/ChoiceMode";
import AIAssistantDemo from "./components/game/AIAssistantDemo";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";

// Define control keys for the game (also works with touch)
enum Controls {
  jump = 'jump',
  slide = 'slide',
  left = 'left',
  right = 'right',
  pause = 'pause'
}

const controls = [
  { name: Controls.jump, keys: ["Space", "ArrowUp", "KeyW"] },
  { name: Controls.slide, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.pause, keys: ["Escape", "KeyP"] },
];

function App() {
  const { phase } = useGame();
  const { gameState, inChoiceMode } = useRunner();

  // Debug logging
  console.log("App render - phase:", phase, "gameState:", gameState);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: 'linear-gradient(to bottom, #87CEEB, #98FB98)'
    }}>
      <KeyboardControls map={controls}>
        {/* Main Menu */}
        {phase === 'ready' && gameState === 'menu' && <MainMenu />}
        
        {/* Character Selection */}
        {phase === 'ready' && gameState === 'character-select' && <CharacterSelect />}
        
        {/* AI Assistant */}
        {phase === 'ready' && gameState === 'ai-assistant' && <AIAssistantDemo />}
        
        {/* Game Canvas */}
        {(phase === 'playing' || phase === 'ended') && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 8, 12],
                fov: 60,
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
                <GameScene />
              </Suspense>
            </Canvas>
            
            {/* Game UI Overlay */}
            <GameUI />
            
            {/* Touch Controls */}
            <TouchControls />
            
            {/* Choice Mode Overlay */}
            {inChoiceMode && <ChoiceMode />}
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;
