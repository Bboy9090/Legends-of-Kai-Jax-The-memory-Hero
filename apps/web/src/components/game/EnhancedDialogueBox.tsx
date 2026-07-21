/**
 * Enhanced Dialogue Box Component
 * Displays character dialogue with portraits, emotions, and interactions during gameplay
 */

import React, { useState, useEffect } from 'react';
import { fighterDialogue } from '../../lib/dialogue';
import type { Fighter } from '../../lib/characters';

interface DialogueOption {
  text: string;
  action: () => void;
}

interface EnhancedDialogueBoxProps {
  speaker: Fighter;
  text: string;
  emotion?: 'neutral' | 'angry' | 'sad' | 'determined' | 'happy';
  options?: DialogueOption[];
  onDismiss?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  side?: 'left' | 'right';
}

const EMOTION_ANIMATIONS: Record<string, string> = {
  neutral: 'animate-pulse',
  angry: 'animate-bounce',
  sad: '',
  determined: '',
  happy: 'animate-pulse',
};

export default function EnhancedDialogueBox({
  speaker,
  text,
  emotion = 'neutral',
  options,
  onDismiss,
  autoClose = false,
  autoCloseDelay = 3000,
  side = 'left',
}: EnhancedDialogueBoxProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDelay, onDismiss]);

  if (!isVisible) return null;

  const emotionColor = {
    neutral: '#94a3b8',
    angry: '#ef4444',
    sad: '#64748b',
    determined: '#f59e0b',
    happy: '#84cc16',
  }[emotion];

  const emotionLabel = {
    neutral: 'Neutral',
    angry: 'Angry',
    sad: 'Sad',
    determined: 'Determined',
    happy: 'Happy',
  }[emotion];

  const isLeftSide = side === 'left';

  return (
    <div
      className={`fixed bottom-0 ${isLeftSide ? 'left-0' : 'right-0'} w-full md:w-96 bg-gradient-to-t from-black via-black/80 to-transparent p-6 border-t-2 border-l-2 md:border-l-0 z-40`}
      style={{
        borderColor: emotionColor,
        boxShadow: `0 -10px 30px ${emotionColor}22`,
      }}
    >
      {/* Speaker info */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black"
          style={{
            borderColor: emotionColor,
            color: emotionColor,
            backgroundColor: emotionColor + '22',
          }}
        >
          {speaker.name[0]}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">{speaker.displayName}</h4>
          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: emotionColor }}>
            {emotionLabel}
          </span>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          className="ml-auto text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Dialogue text */}
      <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">{text}</p>

      {/* Options */}
      {options && options.length > 0 && (
        <div className="space-y-2 mt-4">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                option.action();
                setIsVisible(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white/90 border border-slate-600 hover:border-cyan-500 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-800/80 transition-all"
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Continue indicator */}
      {!options && (
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent" />
          <span>Click to continue</span>
        </div>
      )}
    </div>
  );
}
