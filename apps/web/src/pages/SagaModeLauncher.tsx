// Saga Mode Chapter Launcher with STORY INTEGRATION 🔥
// Path: apps/web/src/pages/SagaModeLauncher.tsx

import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameStateContext } from '@web/router/gameRouter';
import { StoryProgressManager } from '@game/managers/StoryProgressManager';
import { BookId } from '@game/core/SagaEngine';
import '@web/styles/bronx_grit.css';

interface Chapter {
  id: number;
  book: BookId;
  number: number;
  title: string;
  opponent: string;
  difficulty: 'NORMAL' | 'HARD' | 'LEGENDARY' | 'BOSS';
  description: string;
}

// Extended chapter list (54 chapters total across 9 books)
const ALL_SAGA_CHAPTERS: Chapter[] = [
  // BOOK 1: THE FATHER'S FALL
  { id: 1, book: BookId.BOOK_1, number: 1, title: 'The Source Awakens', opponent: 'chronos-sere', difficulty: 'NORMAL', description: 'Begin your journey in the Memory Nexus' },
  { id: 2, book: BookId.BOOK_1, number: 2, title: 'Memory Shards', opponent: 'verdant-talon', difficulty: 'NORMAL', description: 'Collect fragments of forgotten power' },
  { id: 3, book: BookId.BOOK_1, number: 3, title: 'Nexus Convergence', opponent: 'umbra-flux', difficulty: 'HARD', description: 'Face the shadow master' },
  { id: 4, book: BookId.BOOK_1, number: 4, title: 'Forge District Run', opponent: 'boryx-zenith', difficulty: 'NORMAL', description: 'Navigate the industrial heart' },
  { id: 5, book: BookId.BOOK_1, number: 5, title: 'The Breaking Point', opponent: 'sentinel-vox', difficulty: 'HARD', description: 'Witness the legendary sacrifice' },
  { id: 6, book: BookId.BOOK_1, number: 6, title: 'Star-Forge Fusion', opponent: 'malakor-phase1', difficulty: 'BOSS', description: 'BOSS: The birth of Kai-Jax' },
  
  // BOOK 2: THE BROTHERS' ECHO
  { id: 7, book: BookId.BOOK_2, number: 1, title: 'Echoes Begin', opponent: 'kiro-kong', difficulty: 'NORMAL', description: 'The legacy continues' },
  { id: 8, book: BookId.BOOK_2, number: 2, title: 'Twin Resonance', opponent: 'lunara-solis', difficulty: 'NORMAL', description: 'Harness dual powers' },
  { id: 9, book: BookId.BOOK_2, number: 3, title: 'Memory Matrix', opponent: 'captain-blaze', difficulty: 'HARD', description: 'Navigate the memory labyrinth' },
  { id: 10, book: BookId.BOOK_2, number: 4, title: 'Shadow Dance', opponent: 'umbra-flux', difficulty: 'HARD', description: 'Master the darkness' },
  { id: 11, book: BookId.BOOK_2, number: 5, title: 'Resonance Peak', opponent: 'boryx-zenith', difficulty: 'HARD', description: 'Reach maximum power' },
  { id: 12, book: BookId.BOOK_2, number: 6, title: 'The Void Rises', opponent: 'void-king-phase1', difficulty: 'BOSS', description: 'BOSS: Confront the Architect of Oblivion' },
  
  // Add more chapters for books 3-9 (simplified for now)
  ...Array.from({ length: 42 }, (_, i) => ({
    id: 13 + i,
    book: (Math.floor(i / 6) + 3) as BookId,
    number: (i % 6) + 1,
    title: `Chapter ${(i % 6) + 1}`,
    opponent: 'training-dummy',
    difficulty: (i % 6 === 5 ? 'BOSS' : i % 3 === 2 ? 'HARD' : 'NORMAL') as 'NORMAL' | 'HARD' | 'BOSS',
    description: `Book ${Math.floor(i / 6) + 3} adventure continues...`,
  })),
];

const SagaModeLauncher: React.FC = () => {
  const navigate = useNavigate();
  const { state, setState } = useContext(GameStateContext);
  const [selectedChapterId, setSelectedChapterId] = useState(1);
  const [storyManager] = useState(() => StoryProgressManager.getInstance());
  const [storyProgress, setStoryProgress] = useState(storyManager.getProgress());
  const [selectedBook, setSelectedBook] = useState<BookId>(BookId.BOOK_1);

  // Refresh progress on mount
  useEffect(() => {
    const progress = storyManager.getProgress();
    setStoryProgress(progress);
    setSelectedBook(progress.currentBook);
    
    // Select first unlocked chapter in current book
    const firstChapter = ALL_SAGA_CHAPTERS.find(
      ch => ch.book === progress.currentBook && storyManager.isChapterUnlocked(ch.book, ch.number)
    );
    if (firstChapter) {
      setSelectedChapterId(firstChapter.id);
    }
  }, [storyManager]);

  const handleStartChapter = () => {
    const chapter = ALL_SAGA_CHAPTERS.find(ch => ch.id === selectedChapterId);
    if (!chapter) return;

    // Check if chapter is unlocked
    if (!storyManager.isChapterUnlocked(chapter.book, chapter.number)) {
      console.log('🔒 Chapter locked! Complete previous chapters first.');
      return;
    }

    // Start the chapter - get story data
    const { dialogue, opponent, storyNode } = storyManager.startChapter(chapter.book, chapter.number);

    // Update game state with story context
    setState({
      ...state,
      selectedChapter: chapter.id,
      opponent: opponent || chapter.opponent,
      storyMode: true,
      storyDialogue: dialogue,
      currentBook: chapter.book,
      currentChapterNumber: chapter.number,
    });

    console.log(`🎬 Starting Chapter ${chapter.number} of Book ${chapter.book}`);
    console.log(`📖 Story dialogue:`, dialogue);

    navigate('/match');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const chaptersInBook = ALL_SAGA_CHAPTERS.filter(ch => ch.book === selectedBook);
    const currentIndex = chaptersInBook.findIndex(ch => ch.id === selectedChapterId);

    switch (e.key) {
      case 'ArrowUp':
        if (currentIndex > 0) {
          setSelectedChapterId(chaptersInBook[currentIndex - 1].id);
        }
        break;
      case 'ArrowDown':
        if (currentIndex < chaptersInBook.length - 1) {
          setSelectedChapterId(chaptersInBook[currentIndex + 1].id);
        }
        break;
      case 'ArrowLeft':
        if (selectedBook > BookId.BOOK_1) {
          setSelectedBook((selectedBook - 1) as BookId);
          const firstCh = ALL_SAGA_CHAPTERS.find(ch => ch.book === (selectedBook - 1) as BookId);
          if (firstCh) setSelectedChapterId(firstCh.id);
        }
        break;
      case 'ArrowRight':
        if (selectedBook < BookId.BOOK_9) {
          setSelectedBook((selectedBook + 1) as BookId);
          const firstCh = ALL_SAGA_CHAPTERS.find(ch => ch.book === (selectedBook + 1) as BookId);
          if (firstCh) setSelectedChapterId(firstCh.id);
        }
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

  const selectedChapter = ALL_SAGA_CHAPTERS.find(ch => ch.id === selectedChapterId);
  const chaptersInBook = ALL_SAGA_CHAPTERS.filter(ch => ch.book === selectedBook);
  const completionPercent = storyManager.getCompletionPercentage();

  // Check if chapter is completed
  const isCompleted = (chapterId: number) => {
    const chapter = ALL_SAGA_CHAPTERS.find(ch => ch.id === chapterId);
    if (!chapter) return false;
    return storyProgress.completedChapters.some(
      ch => ch.bookId === chapter.book && ch.chapterId === chapter.number && ch.completed
    );
  };

  // Check if chapter is unlocked
  const isUnlocked = (chapterId: number) => {
    const chapter = ALL_SAGA_CHAPTERS.find(ch => ch.id === chapterId);
    if (!chapter) return false;
    return storyManager.isChapterUnlocked(chapter.book, chapter.number);
  };

  // Get completion rank for a chapter
  const getRank = (chapterId: number): string | null => {
    const chapter = ALL_SAGA_CHAPTERS.find(ch => ch.id === chapterId);
    if (!chapter) return null;
    const completed = storyProgress.completedChapters.find(
      ch => ch.bookId === chapter.book && ch.chapterId === chapter.number
    );
    return completed?.completionRank || null;
  };

  return (
    <div
      className="w-full h-screen bg-black flex flex-col relative overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="grit-filter" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-legendary text-6xl mb-2 drop-shadow-lg">SAGA MODE</h1>
          <p className="text-mono-small text-amber-400 mb-4 tracking-widest">
            THE CHRONICLES OF KAI-JAX
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-64 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-400 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-mono-small text-cyan-400">{completionPercent}% COMPLETE</span>
          </div>
          
          {/* Unlocked characters */}
          <p className="text-xs text-grit">
            {storyProgress.unlockedCharacters.length} Characters Unlocked
          </p>
        </div>

        {/* Book Selection */}
        <div className="flex gap-2 mb-6">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as BookId[]).map((book) => (
            <button
              key={book}
              onClick={() => {
                setSelectedBook(book);
                const firstCh = ALL_SAGA_CHAPTERS.find(ch => ch.book === book);
                if (firstCh) setSelectedChapterId(firstCh.id);
              }}
              className={`
                px-4 py-2 rounded text-mono-small transition-all
                ${book === selectedBook
                  ? 'bg-amber-400 text-black'
                  : book <= storyProgress.currentBook
                  ? 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
                  : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                }
              `}
              disabled={book > storyProgress.currentBook}
            >
              BOOK {book}
            </button>
          ))}
        </div>

        <div className="flex gap-8 max-w-5xl w-full">
          {/* Chapter List */}
          <div className="flex-1 space-y-2 max-h-96 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-amber-400">
            {chaptersInBook.map((ch) => {
              const locked = !isUnlocked(ch.id);
              const completed = isCompleted(ch.id);
              const rank = getRank(ch.id);
              
              return (
                <button
                  key={ch.id}
                  onClick={() => !locked && setSelectedChapterId(ch.id)}
                  disabled={locked}
                  className={`
                    w-full px-4 py-3 text-left rounded transition-all flex items-center justify-between
                    ${ch.id === selectedChapterId && !locked
                      ? 'bg-amber-400 text-black border-2 border-cyan-400'
                      : locked
                      ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                      : 'bg-neutral-800 text-amber-400 hover:bg-neutral-700 border-2 border-transparent'
                    }
                  `}
                >
                  <div>
                    <div className="text-mono-small text-xs mb-1 opacity-70">
                      CHAPTER {ch.number}
                    </div>
                    <div className="font-bold">
                      {locked ? '🔒 ' : completed ? '✓ ' : '▶ '}
                      {ch.title}
                    </div>
                    {ch.difficulty === 'BOSS' && (
                      <span className="text-xs text-red-400 font-bold ml-2">👑 BOSS</span>
                    )}
                  </div>
                  {rank && (
                    <div className={`
                      text-2xl font-bold
                      ${rank === 'S' ? 'text-legendary-gold' :
                        rank === 'A' ? 'text-cyan-400' :
                        rank === 'B' ? 'text-purple-400' :
                        'text-neutral-400'}
                    `}>
                      {rank}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chapter Details */}
          {selectedChapter && (
            <div className="w-96 space-y-4">
              <div className="p-6 border-2 rounded-lg border-amber-400 bg-neutral-900/50 backdrop-blur">
                <div className="text-mono-small text-xs mb-2 text-neutral-400">
                  BOOK {selectedChapter.book} - CHAPTER {selectedChapter.number}
                </div>
                <h2 className="text-legendary text-3xl mb-4 text-amber-400">{selectedChapter.title}</h2>
                <p className="text-grit text-sm mb-4 leading-relaxed">
                  {selectedChapter.description}
                </p>
                <div className="space-y-2 text-grit text-sm">
                  <p>
                    <span className="text-neutral-500">OPPONENT:</span>{' '}
                    <span className="text-cyan-400 font-bold">{selectedChapter.opponent.toUpperCase()}</span>
                  </p>
                  <p>
                    <span className="text-neutral-500">DIFFICULTY:</span>{' '}
                    <span className={`font-bold ${
                      selectedChapter.difficulty === 'BOSS' ? 'text-red-400' :
                      selectedChapter.difficulty === 'LEGENDARY' ? 'text-purple-400' :
                      selectedChapter.difficulty === 'HARD' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {selectedChapter.difficulty}
                    </span>
                  </p>
                </div>
                
                {isUnlocked(selectedChapter.id) ? (
                  <button
                    onClick={handleStartChapter}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all transform hover:scale-105"
                  >
                    ▶ START CHAPTER
                  </button>
                ) : (
                  <div className="w-full mt-6 px-6 py-3 bg-neutral-800 text-neutral-600 font-bold rounded-lg text-center">
                    🔒 LOCKED
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="text-mono-small text-amber-400 text-xs space-y-1 bg-neutral-900/30 p-4 rounded">
                <p>↑ ↓ - SELECT CHAPTER</p>
                <p>← → - CHANGE BOOK</p>
                <p>ENTER - START CHAPTER</p>
                <p>ESC - RETURN TO MENU</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SagaModeLauncher;
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
          <div className="p-6 border-2 rounded border-amber-400">
            <div className="text-mono-small mb-2">
              BOOK {chapter.book} - CHAPTER {chapter.number}
            </div>
            <h2 className="text-legendary text-2xl mb-4">{chapter.title}</h2>
            <div className="space-y-2 text-grit text-sm">
              <p>OPPONENT: {chapter.opponent}</p>
              <p>DIFFICULTY: {chapter.difficulty}</p>
            </div>
          </div>

          {/* Chapter list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {SAGA_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(idx)}
                className={`
                  w-full px-4 py-3 text-left text-mono-small rounded transition-all
                  ${
                    idx === selectedChapter
                      ? 'bg-amber-400 text-black'
                      : 'bg-matte text-amber-400 hover:bg-gray-900'
                  }
                `}
              >
                ▶ CHAPTER {ch.number}: {ch.title}
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
