/**
 * Cinematic Player Component
 * Displays story dialogue sequences with character names, emotions, and transitions
 */

import React, { useState, useEffect } from 'react';
import type { StoryDialogue } from '../../lib/story_missions';

interface CinematicPlayerProps {
  dialogues: StoryDialogue[];
  onComplete: () => void;
  autoProgress?: boolean;
  autoProgressDelay?: number;
}

const EMOTION_COLORS: Record<string, string> = {
  neutral: '#94a3b8',
  angry: '#ef4444',
  sad: '#64748b',
  determined: '#f59e0b',
  happy: '#84cc16',
};

export default function CinematicPlayer({
  dialogues,
  onComplete,
  autoProgress = false,
  autoProgressDelay = 2500,
}: CinematicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentDialogue = dialogues[currentIndex];

  useEffect(() => {
    if (!autoProgress) return;

    const timer = setTimeout(() => {
      if (currentIndex < dialogues.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, autoProgressDelay);

    return () => clearTimeout(timer);
  }, [currentIndex, autoProgress, autoProgressDelay, dialogues.length]);

  const handleNext = () => {
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleSkip = () => {
    setIsComplete(true);
  };

  if (isComplete) {
    onComplete();
    return null;
  }

  if (!currentDialogue) {
    return null;
  }

  const emotionColor = EMOTION_COLORS[currentDialogue.emotion ?? 'neutral'];
  const isLeftSide = currentDialogue.side === 'left';

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-auto z-50">
      {/* Cinematic letterbox with dialogue */}
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Speaker name and emotion indicator */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="h-1 w-8 rounded-full"
              style={{ backgroundColor: emotionColor }}
            />
            <h3
              className="text-xl font-black tracking-wider uppercase"
              style={{ color: emotionColor }}
            >
              {currentDialogue.speaker}
            </h3>
            {currentDialogue.emotion && (
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/10">
                {currentDialogue.emotion}
              </span>
            )}
          </div>

          {/* Dialogue text with emotional coloring */}
          <div
            className="bg-black/80 border-2 rounded-lg p-6 text-lg leading-relaxed font-medium"
            style={{
              borderColor: emotionColor,
              boxShadow: `0 0 20px ${emotionColor}33`,
            }}
          >
            <p className="text-white/90">{currentDialogue.text}</p>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex gap-1">
              {dialogues.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: idx <= currentIndex ? emotionColor : 'rgba(148, 163, 184, 0.2)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${emotionColor}44, ${emotionColor}22)`,
                border: `2px solid ${emotionColor}`,
                color: emotionColor,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {currentIndex === dialogues.length - 1 ? 'Complete' : 'Next'}
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-slate-400 border border-slate-600 hover:border-slate-400 hover:text-slate-300 transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
