// Navigation Router Setup
// Path: apps/web/src/router/gameRouter.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import AeternaMainMenu from '@web/pages/AeternaMainMenu';
import CharacterSelect from '@web/pages/CharacterSelect';
import SagaModeLauncher from '@web/pages/SagaModeLauncher';
import VersusModeLauncher from '@web/pages/VersusModeLauncher';
import Match from '@web/pages/Match';

// Context for game state persistence
interface GameNavigationState {
  selectedCharacter?: string;
  selectedMode?: 'saga' | 'versus';
  selectedChapter?: number;
  opponent?: string;
}

export const GameStateContext = React.createContext<{
  state: GameNavigationState;
  setState: (state: GameNavigationState) => void;
}>({
  state: {},
  setState: () => {},
});

/**
 * Main game router component
 * Flow: MainMenu → CharacterSelect → ModeSelection → Match
 */
export const GameRouter: React.FC = () => {
  const [gameState, setGameState] = React.useState<GameNavigationState>({});

  return (
    <GameStateContext.Provider value={{ state: gameState, setState: setGameState }}>
      <Router>
        <Routes>
          {/* Main Entry Point */}
          <Route path="/" element={<AeternaMainMenu />} />

          {/* Character Selection */}
          <Route path="/character-select" element={<CharacterSelect />} />

          {/* Mode Selection & Chapter Selection */}
          <Route path="/saga-mode" element={<SagaModeLauncher />} />
          <Route path="/versus-mode" element={<VersusModeLauncher />} />

          {/* Match Screen */}
          <Route path="/match" element={<Match />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GameStateContext.Provider>
  );
};

export default GameRouter;
