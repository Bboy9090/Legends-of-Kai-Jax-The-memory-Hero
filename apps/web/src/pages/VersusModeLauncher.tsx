// Versus Mode Opponent Launcher
// Path: apps/web/src/pages/VersusModeLauncher.tsx

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameStateContext } from '@web/router/gameRouter';
import '@web/styles/bronx_grit.css';

const OPPONENTS = [
  'KAI-JAX',
  'LUNARA SOLIS',
  'UMBRA-FLUX',
  'BORYX ZENITH',
  'SENTINEL VOX',
  'KIRO KONG',
];

const VersusModeLauncher: React.FC = () => {
  const navigate = useNavigate();
  const { state, setState } = useContext(GameStateContext);
  const [selectedOpponent, setSelectedOpponent] = useState(0);

  const handleStartMatch = () => {
    setState({
      ...state,
      opponent: OPPONENTS[selectedOpponent].toLowerCase().replace(' ', '-'),
    });
    navigate('/match');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setSelectedOpponent(Math.max(0, selectedOpponent - 1));
        break;
      case 'ArrowDown':
        setSelectedOpponent(Math.min(OPPONENTS.length - 1, selectedOpponent + 1));
        break;
      case 'Enter':
      case ' ':
        handleStartMatch();
        break;
      case 'Escape':
        navigate('/character-select');
        break;
    }
  };

  return (
    <div
      className="w-full h-screen bg-black flex flex-col items-center justify-center relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="grit-filter" />

      <div className="relative z-10 text-center">
        <h1 className="text-legendary text-5xl mb-4">VERSUS MODE</h1>
        <p className="text-mono-small text-amber-400 mb-12">SELECT YOUR OPPONENT</p>

        <div className="space-y-3 w-80">
          {OPPONENTS.map((opponent, idx) => (
            <button
              key={opponent}
              onClick={() => setSelectedOpponent(idx)}
              className={`
                w-full px-6 py-3 text-mono-small rounded transition-all
                ${
                  idx === selectedOpponent
                    ? 'bg-amber-400 text-black scale-105'
                    : 'bg-matte text-amber-400 hover:bg-gray-900'
                }
              `}
            >
              {idx === selectedOpponent ? '▶ ' : ''}{opponent}
            </button>
          ))}
        </div>

        <div className="mt-12 text-mono-small text-amber-400 text-sm space-y-1">
          <p>↑ ↓ SELECT OPPONENT</p>
          <p>ENTER TO START</p>
          <p>ESC TO RETURN</p>
        </div>
      </div>
    </div>
  );
};

export default VersusModeLauncher;
