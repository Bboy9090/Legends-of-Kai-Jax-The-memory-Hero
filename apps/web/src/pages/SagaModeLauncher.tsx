// Saga Mode Chapter Launcher
// Path: apps/web/src/pages/SagaModeLauncher.tsx

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameStateContext } from '@web/router/gameRouter';
import '@web/styles/bronx_grit.css';

interface Chapter {
  id: number;
  book: number;
  number: number;
  title: string;
  opponent: string;
  difficulty: 'NORMAL' | 'HARD' | 'LEGENDARY';
  locked: boolean;
}

const SAGA_CHAPTERS: Chapter[] = [
  { id: 1, book: 1, number: 1, title: 'The Source Awakens', opponent: 'Chronos Sere', difficulty: 'NORMAL', locked: false },
  { id: 2, book: 1, number: 2, title: 'Memory Shards', opponent: 'Verdant Talon', difficulty: 'NORMAL', locked: false },
  { id: 3, book: 1, number: 3, title: 'Nexus Convergence', opponent: 'Umbra-Flux', difficulty: 'HARD', locked: false },
  // More chapters would go here (18 per book, 3 books = 54 total for Genesis)
  { id: 4, book: 1, number: 4, title: 'Locked Chapter', opponent: '???', difficulty: 'NORMAL', locked: true },
];

const SagaModeLauncher: React.FC = () => {
  const navigate = useNavigate();
  const { state, setState } = useContext(GameStateContext);
  const [selectedChapter, setSelectedChapter] = useState(0);

  const handleStartChapter = () => {
    const chapter = SAGA_CHAPTERS[selectedChapter];
    if (!chapter.locked) {
      setState({
        ...state,
        selectedChapter: chapter.id,
        opponent: chapter.opponent,
      });
      navigate('/match');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setSelectedChapter(Math.max(0, selectedChapter - 1));
        break;
      case 'ArrowDown':
        setSelectedChapter(Math.min(SAGA_CHAPTERS.length - 1, selectedChapter + 1));
        break;
      case 'Enter':
      case ' ':
        handleStartChapter();
        break;
      case 'Escape':
        navigate('/character-select');
        break;
    }
  };

  const chapter = SAGA_CHAPTERS[selectedChapter];

  return (
    <div
      className="w-full h-screen bg-black flex flex-col relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="grit-filter" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-legendary text-5xl mb-4">SAGA MODE</h1>
        <p className="text-mono-small text-amber-400 mb-12">
          BOOK 1: ECHOES OF MEMORY
        </p>

        <div className="w-96 space-y-8">
          {/* Chapter display */}
          <div className={`p-6 border-2 rounded ${chapter.locked ? 'border-gray-600 opacity-50' : 'border-amber-400'}`}>
            <div className="text-mono-small mb-2">
              BOOK {chapter.book} - CHAPTER {chapter.number}
            </div>
            <h2 className="text-legendary text-2xl mb-4">{chapter.title}</h2>
            <div className="space-y-2 text-grit text-sm">
              <p>OPPONENT: {chapter.opponent}</p>
              <p>DIFFICULTY: {chapter.difficulty}</p>
              {chapter.locked && <p className="text-gray-500">CHAPTER LOCKED</p>}
            </div>
          </div>

          {/* Chapter list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {SAGA_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(idx)}
                disabled={ch.locked}
                className={`
                  w-full px-4 py-3 text-left text-mono-small rounded transition-all
                  ${
                    idx === selectedChapter
                      ? 'bg-amber-400 text-black'
                      : ch.locked
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                      : 'bg-matte text-amber-400 hover:bg-gray-900'
                  }
                `}
              >
                {ch.locked ? '🔒' : '▶'} CHAPTER {ch.number}: {ch.title}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="text-mono-small text-amber-400 text-sm">
            <p>↑ ↓ SELECT CHAPTER</p>
            <p>ENTER TO START</p>
            <p>ESC TO RETURN</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SagaModeLauncher;
