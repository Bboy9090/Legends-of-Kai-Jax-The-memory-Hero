import React, { useState } from 'react';
import { ChevronRight, Lock, CheckCircle, Circle, BookOpen, Star, Clock } from 'lucide-react';

/**
 * SAGA MODE LAUNCHER — Books 1-3 (Genesis Movie)
 * 
 * Purpose: Chapter select screen for the Genesis arc
 * Aesthetic: Bronx Grit + Obsidian geometry + Dread progression visualization
 * Scope: 54 chapters across 3 books (18 chapters per book)
 * 
 * Features:
 * - Book progression tracker (The Father's Fall → Brothers' Echo → Convergence Crown)
 * - Chapter grid with completion status
 * - Dread meter visualization (0-60% for Genesis)
 * - Estimated play time per chapter
 * - Legendary cinematic polish
 */

const SagaModeLauncher = () => {
  const [selectedBook, setSelectedBook] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [hoveredChapter, setHoveredChapter] = useState(null);

  // Genesis Arc — Books 1-3
  const books = [
    {
      id: 1,
      title: 'THE FATHER\'S FALL',
      subtitle: 'Boryn\'s Sacrifice',
      chapters: 18,
      dreadRange: '0-20%',
      unlocked: true,
      completed: 8, // Example: Player has completed 8/18 chapters
      description: 'Boryn enters the Gauntlet alone. His heart becomes the anchor that binds his sons forever.'
    },
    {
      id: 2,
      title: 'THE BROTHERS\' ECHO',
      subtitle: 'Kaison & Jaxon\'s Trial',
      chapters: 18,
      dreadRange: '21-40%',
      unlocked: true, // Unlocks after completing Book 1
      completed: 3,
      description: 'Memory echoes guide Kai-Jax through dual trials. The past whispers lessons the future demands.'
    },
    {
      id: 3,
      title: 'THE CONVERGENCE CROWN',
      subtitle: 'First Legacy Awakening',
      chapters: 18,
      dreadRange: '41-60%',
      unlocked: false, // Unlocks after completing Book 2
      completed: 0,
      description: 'Six warriors converge. The Architect watches from the shadows. The real war begins.'
    }
  ];

  const selectedBookData = books.find(b => b.id === selectedBook);

  // Generate chapter data for selected book
  const generateChapters = (bookId, totalChapters, completedCount) => {
    return Array.from({ length: totalChapters }, (_, i) => {
      const chapterNum = i + 1;
      const isCompleted = chapterNum <= completedCount;
      const isLocked = bookId > 1 && books[bookId - 2].completed < books[bookId - 2].chapters;
      
      return {
        id: `${bookId}-${chapterNum}`,
        number: chapterNum,
        title: `Chapter ${chapterNum}`,
        completed: isCompleted,
        locked: isLocked,
        playTime: '8-12 min',
        dreadLevel: Math.floor((chapterNum / totalChapters) * 100) // Dread increases throughout book
      };
    });
  };

  const chapters = generateChapters(
    selectedBook,
    selectedBookData.chapters,
    selectedBookData.completed
  );

  const handleChapterSelect = (chapter) => {
    if (!chapter.locked) {
      setSelectedChapter(chapter);
    }
  };

  const handleLaunch = () => {
    if (selectedChapter && !selectedChapter.locked) {
      console.log(`Launching: Book ${selectedBook}, Chapter ${selectedChapter.number}`);
      // Navigate to gameplay
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Bronx Grit Background */}
      <div className="absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-900" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            backgroundSize: '100% 4px'
          }}
        />
      </div>

      {/* Dread Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* HEADER: Saga Mode Title */}
      <div className="absolute top-0 left-0 right-0 z-50 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white uppercase">
              Saga Mode
            </h1>
            <p className="text-sm tracking-[0.3em] text-cyan-400 uppercase font-semibold mt-2">
              Genesis: Books 1-3
            </p>
          </div>
          
          {/* Total Progress */}
          <div className="bg-neutral-900/80 backdrop-blur-md border border-cyan-500/30 px-6 py-4 rounded">
            <p className="text-xs tracking-widest text-neutral-400 uppercase mb-1">Total Progress</p>
            <p className="text-3xl font-bold text-white">
              {books.reduce((sum, b) => sum + b.completed, 0)} / 54
              <span className="text-lg text-neutral-500 ml-2">Chapters</span>
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="absolute inset-0 pt-32 pb-8 px-8 z-10">
        <div className="flex gap-8 h-full">
          {/* LEFT: Book Selection */}
          <div className="w-96 flex flex-col gap-4">
            <div className="bg-neutral-900/50 backdrop-blur-md border border-cyan-500/20 p-4 rounded">
              <h2 className="text-xs tracking-[0.3em] text-neutral-400 uppercase mb-4 font-bold">
                Select Book
              </h2>
              
              <div className="space-y-3">
                {books.map((book) => {
                  const isSelected = selectedBook === book.id;
                  const progress = (book.completed / book.chapters) * 100;
                  
                  return (
                    <button
                      key={book.id}
                      onClick={() => book.unlocked && setSelectedBook(book.id)}
                      disabled={!book.unlocked}
                      className={`
                        w-full text-left p-4 rounded transition-all duration-300
                        ${book.unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                        ${isSelected 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-transparent border-l-4 border-cyan-500 translate-x-2' 
                          : 'bg-neutral-800/30 border-l-4 border-transparent hover:border-neutral-600'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className={isSelected ? 'text-cyan-400' : 'text-neutral-500'} />
                          <span className="text-xs font-bold tracking-widest text-neutral-400">
                            BOOK {book.id}
                          </span>
                        </div>
                        {!book.unlocked && <Lock size={14} className="text-red-500" />}
                      </div>
                      
                      <h3 className={`text-sm font-bold uppercase mb-1 ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                        {book.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mb-3">{book.subtitle}</p>
                      
                      {/* Progress Bar */}
                      <div className="relative h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-xs text-neutral-500">{book.completed}/{book.chapters} chapters</span>
                        <span className="text-xs font-semibold text-cyan-400">Dread: {book.dreadRange}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Book Description */}
            {selectedBookData && (
              <div className="bg-neutral-900/50 backdrop-blur-md border border-cyan-500/20 p-5 rounded flex-1">
                <h2 className="text-xs tracking-[0.3em] text-neutral-400 uppercase mb-3 font-bold">
                  Synopsis
                </h2>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {selectedBookData.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Chapter Grid */}
          <div className="flex-1 bg-neutral-900/50 backdrop-blur-md border border-cyan-500/20 p-6 rounded overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase text-white">
                {selectedBookData?.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={14} className="text-neutral-600" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-red-500" />
                  <span>Locked</span>
                </div>
              </div>
            </div>

            {/* Chapter Grid */}
            <div className="grid grid-cols-6 gap-3">
              {chapters.map((chapter) => {
                const isSelected = selectedChapter?.id === chapter.id;
                const isHovered = hoveredChapter === chapter.id;
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter)}
                    onMouseEnter={() => setHoveredChapter(chapter.id)}
                    onMouseLeave={() => setHoveredChapter(null)}
                    disabled={chapter.locked}
                    className={`
                      relative aspect-square rounded transition-all duration-300
                      ${chapter.locked 
                        ? 'bg-neutral-800/30 cursor-not-allowed opacity-40' 
                        : isSelected
                          ? 'bg-gradient-to-br from-cyan-500/40 to-cyan-600/40 border-2 border-cyan-400 scale-105'
                          : chapter.completed
                            ? 'bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-600/50 hover:scale-105'
                            : 'bg-neutral-800/50 border border-neutral-700/50 hover:border-cyan-500/50 hover:scale-105'
                      }
                    `}
                  >
                    {/* Chapter Number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-black ${
                        chapter.completed ? 'text-green-400' : 
                        chapter.locked ? 'text-neutral-600' : 
                        isSelected ? 'text-cyan-300' : 'text-neutral-400'
                      }`}>
                        {chapter.number}
                      </span>
                    </div>

                    {/* Status Icon */}
                    <div className="absolute top-1 right-1">
                      {chapter.completed ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : chapter.locked ? (
                        <Lock size={12} className="text-red-500" />
                      ) : null}
                    </div>

                    {/* Dread Level Indicator */}
                    {!chapter.locked && (
                      <div className="absolute bottom-1 left-1 right-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-red-500"
                          style={{ width: `${chapter.dreadLevel}%` }}
                        />
                      </div>
                    )}

                    {/* Hover Tooltip */}
                    {isHovered && !chapter.locked && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/95 border border-cyan-500/50 px-3 py-2 rounded whitespace-nowrap z-50">
                        <p className="text-xs font-bold text-white">{chapter.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={10} className="text-neutral-400" />
                          <span className="text-xs text-neutral-400">{chapter.playTime}</span>
                          <span className="text-xs text-cyan-400 ml-2">Dread: {chapter.dreadLevel}%</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Chapter Detail */}
            {selectedChapter && !selectedChapter.locked && (
              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-900/20 to-transparent border-l-4 border-cyan-500 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {selectedChapter.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{selectedChapter.playTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-cyan-400" />
                        <span>Dread Level: {selectedChapter.dreadLevel}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunch}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold px-8 py-3 rounded transition-all duration-300 hover:scale-105"
                  >
                    <span>LAUNCH CHAPTER</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ambient Resonance Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
    </div>
  );
};

export default SagaModeLauncher;
