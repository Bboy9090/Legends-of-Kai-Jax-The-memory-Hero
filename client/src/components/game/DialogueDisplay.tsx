import { useEffect, useState, useRef } from "react";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import { getPreFightTaunt, getPreFightResponse, getVictoryQuote, getDefeatQuote } from "../../lib/dialogue";

export default function DialogueDisplay() {
  const { battlePhase, playerFighterId, opponentFighterId, winner } = useBattle();
  const [playerDialogue, setPlayerDialogue] = useState("");
  const [opponentDialogue, setOpponentDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  
  // FIXED: Track timers to prevent race conditions
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const lastSequenceKeyRef = useRef<string>("");

  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);
  
  // Helper: Clear all timers
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };
  
  // Helper: Queue a timer
  const queueTimer = (callback: () => void, delay: number) => {
    const id = setTimeout(callback, delay);
    timersRef.current.push(id);
  };

  useEffect(() => {
    // FIXED: Composite sequence key prevents duplicates while allowing mid-phase fighter swaps
    const sequenceKey = `${battlePhase}:${playerFighterId}:${opponentFighterId}:${winner ?? ''}`;
    
    // Only run sequence when key changes
    if (sequenceKey === lastSequenceKeyRef.current) return;
    lastSequenceKeyRef.current = sequenceKey;
    
    // FIXED: Clear timers and reset state immediately
    clearAllTimers();
    setPlayerDialogue("");
    setOpponentDialogue("");
    setShowDialogue(false);
    
    // PRE-FIGHT BANTER
    if (battlePhase === 'preRound') {
      setShowDialogue(true);
      
      // Show taunts sequentially using helper
      queueTimer(() => {
        setOpponentDialogue(getPreFightTaunt(opponentFighterId));
      }, 500);
      
      queueTimer(() => {
        setPlayerDialogue(getPreFightResponse(playerFighterId));
      }, 2000);
      
      queueTimer(() => {
        setShowDialogue(false);
      }, 3500);
    }
    
    // POST-FIGHT DIALOGUE
    if (battlePhase === 'results') {
      setShowDialogue(true);
      
      if (winner === 'player') {
        setPlayerDialogue(getVictoryQuote(playerFighterId));
        setOpponentDialogue(getDefeatQuote(opponentFighterId));
      } else if (winner === 'opponent') {
        setPlayerDialogue(getDefeatQuote(playerFighterId));
        setOpponentDialogue(getVictoryQuote(opponentFighterId));
      }
      
      queueTimer(() => {
        setShowDialogue(false);
      }, 4000);
    }
    
    // FIXED: Cleanup function
    return () => {
      clearAllTimers();
    };
  }, [battlePhase, playerFighterId, opponentFighterId, winner]);

  if (!showDialogue) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-end p-4 pb-32">
      {/* PLAYER DIALOGUE - Bottom Left */}
      {playerDialogue && playerFighter && (
        <div
          className="mb-4 ml-4 max-w-md animate-in slide-in-from-left duration-300"
          style={{
            animation: 'slideInFromLeft 0.3s ease-out'
          }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 shadow-2xl border-4 border-white/30">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: playerFighter.accentColor }}
              />
              <span className="text-white font-bold text-lg uppercase tracking-wide">
                {playerFighter.name}
              </span>
            </div>
            <p className="text-white text-xl font-bold leading-relaxed">
              {playerDialogue}
            </p>
          </div>
        </div>
      )}

      {/* OPPONENT DIALOGUE - Bottom Right */}
      {opponentDialogue && opponentFighter && (
        <div
          className="mb-4 mr-4 ml-auto max-w-md animate-in slide-in-from-right duration-300"
          style={{
            animation: 'slideInFromRight 0.3s ease-out'
          }}
        >
          <div className="bg-gradient-to-l from-red-600 to-red-500 rounded-2xl p-4 shadow-2xl border-4 border-white/30">
            <div className="flex items-center gap-3 mb-2 justify-end">
              <span className="text-white font-bold text-lg uppercase tracking-wide">
                {opponentFighter.name}
              </span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: opponentFighter.accentColor }}
              />
            </div>
            <p className="text-white text-xl font-bold leading-relaxed text-right">
              {opponentDialogue}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
