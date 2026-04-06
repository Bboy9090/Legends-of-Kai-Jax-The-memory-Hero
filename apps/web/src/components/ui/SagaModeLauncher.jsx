/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING - SAGA MODE LAUNCHER
 * 54-Chapter Navigator with Bronx-Grit Styling
 * The 9-Book Cycle awaits.
 */

import React, { useState, useEffect } from 'react';
import { saveManager } from '../../systems/SaveManager';
import { bus } from '../../core/EventBus';

const SagaModeLauncher = ({ chapters, onSelect }) => {
    const [selectedBook, setSelectedBook] = useState(1);
    const [saveInfo, setSaveInfo] = useState(null);

    useEffect(() => {
        // Load save info
        const info = saveManager.getSaveInfo();
        setSaveInfo(info);

        // Listen for save updates
        const handleSaveUpdate = () => {
            const info = saveManager.getSaveInfo();
            setSaveInfo(info);
        };

        bus.on('MISSION_SAVED', handleSaveUpdate);

        return () => {
            bus.off('MISSION_SAVED', handleSaveUpdate);
        };
    }, []);

    const books = [
        { id: 1, title: 'BOOK 1: GENESIS', chapters: 6 },
        { id: 2, title: 'BOOK 2: THE SILENT YEAR', chapters: 6 },
        { id: 3, title: 'BOOK 3: THE CONVERGENCE CROWN', chapters: 6 },
        { id: 4, title: 'BOOK 4: THE VOID KING RISES', chapters: 6 },
        { id: 5, title: 'BOOK 5: THE MEMORY WAR', chapters: 6 },
        { id: 6, title: 'BOOK 6: THE BRONX ECHO', chapters: 6 },
        { id: 7, title: 'BOOK 7: THE ARCHIVE AWAKENS', chapters: 6 },
        { id: 8, title: 'BOOK 8: THE FINAL RESONANCE', chapters: 6 },
        { id: 9, title: 'BOOK 9: THE MEMORY KING', chapters: 6 }
    ];

    const currentBookChapters = chapters?.filter(c => 
        c.id.startsWith(`book_${selectedBook}_`)
    ) || [];

    const getChapterStatus = (chapterId) => {
        if (!saveInfo || !saveInfo.exists) return 'locked';
        if (saveInfo.chapterId === chapterId) return 'current';
        // Simple comparison - in real implementation, check progression
        return 'unlocked';
    };

    return (
        <div className="saga-container">
            <div className="saga-header">
                <h1 className="matte-mythic-text">THE 9-BOOK CYCLE</h1>
                <p className="saga-subtitle">54 Chapters. One Memory King.</p>
                {saveInfo && saveInfo.exists && (
                    <div className="save-indicator">
                        <span>Last Save: {saveInfo.chapterId}</span>
                        <span>Checkpoint: {saveInfo.checkpoint}</span>
                    </div>
                )}
            </div>

            <div className="book-selector">
                {books.map(book => (
                    <button
                        key={book.id}
                        className={`book-button ${selectedBook === book.id ? 'active' : ''}`}
                        onClick={() => setSelectedBook(book.id)}
                    >
                        {book.title}
                    </button>
                ))}
            </div>

            <div className="chapter-grid">
                {currentBookChapters.length > 0 ? (
                    currentBookChapters.map(chapter => {
                        const status = getChapterStatus(chapter.id);
                        return (
                            <div
                                key={chapter.id}
                                className={`chapter-card ${status}`}
                                onClick={() => {
                                    if (status !== 'locked' && onSelect) {
                                        onSelect(chapter.id);
                                    }
                                }}
                            >
                                <h3>{chapter.title || chapter.id}</h3>
                                <p className="chapter-status">{status.toUpperCase()}</p>
                                {chapter.description && (
                                    <p className="chapter-description">{chapter.description}</p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-chapters">
                        <p>No chapters available for this book.</p>
                    </div>
                )}
            </div>

            <div className="saga-footer">
                <button 
                    className="new-game-button"
                    onClick={() => {
                        if (onSelect && currentBookChapters.length > 0) {
                            onSelect(currentBookChapters[0].id);
                        }
                    }}
                >
                    START NEW GAME
                </button>
                {saveInfo && saveInfo.exists && (
                    <button 
                        className="continue-button"
                        onClick={() => {
                            if (onSelect && saveInfo.chapterId) {
                                onSelect(saveInfo.chapterId);
                            }
                        }}
                    >
                        CONTINUE
                    </button>
                )}
            </div>
        </div>
    );
};

export default SagaModeLauncher;
