/**
 * THE AETERNA COVENANT - SAGA MODE LAUNCHER
 * 
 * 54-Chapter Navigator with Bronx-grit styling.
 * The 9-Book Cycle interface.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bus } from '../../core/EventBus';
import { Events } from '../../core/EventBus';
import { saveManager } from '../../systems/SaveManager';

interface Chapter {
  id: string;
  title: string;
  book: number;
  chapter: number;
  status: 'locked' | 'available' | 'completed';
  resonance: number;
  checkpoint?: string;
}

interface SagaModeLauncherProps {
  onSelectChapter?: (chapterId: string) => void;
}

export const SagaModeLauncher: React.FC<SagaModeLauncherProps> = ({ onSelectChapter }) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Load chapters (9 books × 6 chapters = 54 total)
  useEffect(() => {
    const loadedChapters: Chapter[] = [];
    
    for (let book = 1; book <= 9; book++) {
      for (let chapter = 1; chapter <= 6; chapter++) {
        const chapterId = `book_${book}_chapter_${chapter}`;
        const saved = saveManager.load();
        
        let status: 'locked' | 'available' | 'completed' = 'locked';
        if (book === 1 && chapter === 1) {
          status = 'available';
        } else if (saved && saved.chapterId === chapterId) {
          status = 'completed';
        } else if (saved && saved.chapterId) {
          // Check if previous chapter completed
          const [prevBook, prevChapter] = getPreviousChapter(book, chapter);
          if (prevBook && prevChapter) {
            const prevId = `book_${prevBook}_chapter_${prevChapter}`;
            if (saved.chapterId === prevId || saved.chapterId > prevId) {
              status = 'available';
            }
          }
        }

        loadedChapters.push({
          id: chapterId,
          title: `Book ${book}, Chapter ${chapter}`,
          book,
          chapter,
          status,
          resonance: saved?.resonance || 0,
          checkpoint: saved?.checkpoint
        });
      }
    }

    setChapters(loadedChapters);
  }, []);

  const getPreviousChapter = (book: number, chapter: number): [number | null, number | null] => {
    if (chapter > 1) {
      return [book, chapter - 1];
    } else if (book > 1) {
      return [book - 1, 6];
    }
    return [null, null];
  };

  const handleChapterSelect = (chapter: Chapter) => {
    if (chapter.status === 'locked') return;

    setSelectedChapter(chapter.id);
    
    if (onSelectChapter) {
      onSelectChapter(chapter.id);
    }

    bus.emit(Events.CHAPTER_START, { chapterId: chapter.id });
    
    // Navigate to match/battle scene
    navigate('/match', { state: { chapterId: chapter.id, checkpoint: chapter.checkpoint } });
  };

  const getBookChapters = (bookNum: number): Chapter[] => {
    return chapters.filter(c => c.book === bookNum);
  };

  return (
    <div className="saga-container matte-mythic-bg">
      <div className="saga-header">
        <h1 className="matte-mythic-text text-legendary">THE 9-BOOK CYCLE</h1>
        <p className="text-grit">54 Chapters. One Memory. The Aeterna Awaits.</p>
      </div>

      {/* Book Selector */}
      <div className="book-selector">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(bookNum => (
          <button
            key={bookNum}
            className={`book-tab ${selectedBook === bookNum ? 'active' : ''}`}
            onClick={() => setSelectedBook(bookNum)}
          >
            BOOK {bookNum}
          </button>
        ))}
      </div>

      {/* Chapter Grid */}
      <div className="chapter-grid">
        {getBookChapters(selectedBook).map(chapter => (
          <div
            key={chapter.id}
            className={`chapter-card ${chapter.status} ${selectedChapter === chapter.id ? 'selected' : ''}`}
            onClick={() => handleChapterSelect(chapter)}
          >
            <div className="chapter-header">
              <h3 className="chapter-title">{chapter.title}</h3>
              <span className={`chapter-status ${chapter.status}`}>
                {chapter.status.toUpperCase()}
              </span>
            </div>
            
            {chapter.status !== 'locked' && (
              <div className="chapter-info">
                <div className="resonance-display">
                  <span className="label">Resonance:</span>
                  <span className="value">{chapter.resonance}</span>
                </div>
                {chapter.checkpoint && (
                  <div className="checkpoint-indicator">
                    Checkpoint: {chapter.checkpoint}
                  </div>
                )}
              </div>
            )}

            {chapter.status === 'locked' && (
              <div className="locked-overlay">
                <span className="lock-icon">🔒</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="saga-footer">
        <p className="text-grit text-xs">
          THE SOURCE REMEMBERS UNITY • FORGED IN THE BRONX
        </p>
      </div>
    </div>
  );
};

export default SagaModeLauncher;
