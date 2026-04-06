import { useState, useEffect, useCallback } from 'react';
import { type NPCDialogue } from '../../lib/worldDialogue';

interface DialogueBoxProps {
  dialogue: NPCDialogue;
  onComplete: () => void;
  onHintReceived?: (hint: { direction: string; description: string }) => void;
}

export default function DialogueBox({ dialogue, onComplete, onHintReceived }: DialogueBoxProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const currentLine = dialogue.lines[currentLineIndex];
  
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    
    let charIndex = 0;
    const typingSpeed = 30;
    
    const typeInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setDisplayedText(currentLine.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typingSpeed);
    
    return () => clearInterval(typeInterval);
  }, [currentLineIndex, currentLine]);
  
  const handleClick = useCallback(() => {
    if (isTyping) {
      setDisplayedText(currentLine);
      setIsTyping(false);
    } else if (currentLineIndex < dialogue.lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      if (dialogue.hint && onHintReceived) {
        onHintReceived(dialogue.hint);
      }
      onComplete();
    }
  }, [isTyping, currentLine, currentLineIndex, dialogue.lines.length, dialogue.hint, onHintReceived, onComplete]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      handleClick();
    }
  }, [handleClick]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
      onClick={handleClick}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/90 backdrop-blur-sm rounded-t-lg p-4 border-t border-x border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-400 font-bold text-lg">
              {dialogue.npcName}
            </span>
            <span className="text-gray-500 text-sm">
              — {dialogue.npcDescription}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-b-lg p-6 border border-gray-700/50 min-h-[100px]">
          <p className="text-white text-lg leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-500 text-xs">
              {currentLineIndex + 1} / {dialogue.lines.length}
            </span>
            
            {!isTyping && (
              <span className="text-gray-400 text-sm animate-pulse">
                {currentLineIndex < dialogue.lines.length - 1 
                  ? "Click or press Space to continue..." 
                  : "Click or press Space to close..."}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
