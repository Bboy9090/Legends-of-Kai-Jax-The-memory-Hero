import { useBattle } from "../../lib/stores/useBattle";
import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { getFighterById } from "../../lib/characters";
import { useState, useEffect, useRef } from "react";
import { Zap, Shield, Flame, Crown, RotateCcw, Home, Star, Sparkles, Swords } from "lucide-react";

// ⚡ LEGENDARY SYNERGY METER
function SynergyMeter({ 
  value, 
  maxValue = 100, 
  fighterColor,
  side = 'left' 
}: { 
  value: number; 
  maxValue?: number;
  fighterColor: string;
  side?: 'left' | 'right';
}) {
  const percentage = (value / maxValue) * 100;
  const isFull = percentage >= 100;
  const isCharging = percentage >= 50;
  
  return (
    <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      {/* Synergy Icon */}
      <div 
        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isFull ? 'animate-pulse' : ''}`}
        style={{
          background: isFull 
            ? 'linear-gradient(135deg, #FFD700, #FF6B6B)' 
            : isCharging 
              ? `linear-gradient(135deg, ${fighterColor}, #A855F7)` 
              : '#374151',
          boxShadow: isFull 
            ? '0 0 20px #FFD700, 0 0 40px #FFD70080' 
            : isCharging 
              ? `0 0 15px ${fighterColor}` 
              : 'none',
        }}
      >
        <Zap className={`w-4 h-4 ${isFull ? 'text-white animate-bounce' : isCharging ? 'text-white' : 'text-gray-500'}`} />
      </div>
      
      {/* Synergy Bar */}
      <div className="relative w-24 h-3 bg-gray-800/80 rounded-full overflow-hidden border border-gray-600">
        <div 
          className={`absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} transition-all duration-300`}
          style={{
            width: `${percentage}%`,
            background: isFull 
              ? 'linear-gradient(90deg, #FFD700, #FF6B6B, #A855F7)' 
              : `linear-gradient(90deg, ${fighterColor}, #A855F7)`,
            boxShadow: isFull ? 'inset 0 0 10px rgba(255,255,255,0.5)' : 'none',
          }}
        />
        {isFull && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1s_infinite]" />
        )}
      </div>
      
      {/* Transform Ready Text */}
      {isFull && (
        <span className="text-xs font-bold text-yellow-400 animate-pulse whitespace-nowrap">
          FUSION READY!
        </span>
      )}
    </div>
  );
}

// 🔥 LEGENDARY COMBO COUNTER
function ComboCounter({ 
  combo, 
  maxCombo,
  damage 
}: { 
  combo: number; 
  maxCombo: number;
  damage: number;
}) {
  const [displayCombo, setDisplayCombo] = useState(combo);
  const [isPopping, setIsPopping] = useState(false);
  const prevComboRef = useRef(combo);
  
  useEffect(() => {
    if (combo > prevComboRef.current) {
      setIsPopping(true);
      setDisplayCombo(combo);
      setTimeout(() => setIsPopping(false), 200);
    } else if (combo === 0 && prevComboRef.current > 0) {
      // Combo dropped
      setTimeout(() => setDisplayCombo(0), 500);
    }
    prevComboRef.current = combo;
  }, [combo]);
  
  if (displayCombo === 0) return null;
  
  const comboLevel = displayCombo >= 20 ? 'LEGENDARY' : displayCombo >= 10 ? 'SUPER' : displayCombo >= 5 ? 'GREAT' : '';
  const glowColor = displayCombo >= 20 ? '#FFD700' : displayCombo >= 10 ? '#A855F7' : displayCombo >= 5 ? '#3B82F6' : '#10B981';
  
  return (
    <div 
      className={`fixed left-8 top-1/3 text-center transition-all duration-200 ${isPopping ? 'scale-125' : 'scale-100'}`}
      style={{
        filter: `drop-shadow(0 0 20px ${glowColor})`,
      }}
    >
      {/* Combo Level Label */}
      {comboLevel && (
        <div 
          className="text-sm font-black tracking-wider mb-1 animate-pulse"
          style={{ color: glowColor, textShadow: `0 0 10px ${glowColor}` }}
        >
          {comboLevel}!
        </div>
      )}
      
      {/* Combo Number */}
      <div 
        className={`text-6xl font-black ${isPopping ? 'animate-bounce' : ''}`}
        style={{
          background: `linear-gradient(180deg, ${glowColor}, #FFFFFF)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 0 30px ${glowColor}`,
        }}
      >
        {displayCombo}
      </div>
      
      {/* Combo Label */}
      <div className="text-lg font-bold text-white/80 tracking-widest">
        COMBO
      </div>
      
      {/* Damage */}
      <div className="text-sm text-red-400 font-bold mt-1">
        {damage}% DMG
      </div>
    </div>
  );
}

// ⚡ LEGENDARY HEALTH BAR
function LegendaryHealthBar({
  health,
  maxHealth,
  fighter,
  side,
  wins,
  synergy = 0,
  isTransformed = false,
}: {
  health: number;
  maxHealth: number;
  fighter: { name: string; displayName: string; color: string; accentColor: string };
  side: 'left' | 'right';
  wins: number;
  synergy?: number;
  isTransformed?: boolean;
}) {
  const percentage = (health / maxHealth) * 100;
  const isLow = percentage < 30;
  const isCritical = percentage < 15;
  
  return (
    <div 
      className={`flex-1 min-w-0 animate-[${side === 'left' ? 'slideInLeft' : 'slideInRight'}_0.5s_ease-out]`}
    >
      <div 
        className={`
          relative bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-md 
          rounded-xl p-2 sm:p-3 
          border-2 sm:border-3 
          transition-all duration-300
          ${isCritical 
            ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse' 
            : isLow 
              ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.6)]' 
              : `shadow-[0_0_25px_${fighter.accentColor}60]`
          }
          ${isTransformed ? 'border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,0.8)]' : ''}
        `}
        style={{ borderColor: !isLow && !isCritical && !isTransformed ? fighter.accentColor : undefined }}
      >
        {/* Fighter Info Row */}
        <div className={`flex items-center gap-2 mb-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
          {/* Fighter Avatar */}
          <div 
            className={`
              relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
              rounded-full flex items-center justify-center 
              font-black text-lg sm:text-xl md:text-2xl text-white
              flex-shrink-0 border-2 border-white/30
              ${isCritical ? 'animate-pulse' : ''}
            `}
            style={{ 
              background: `linear-gradient(135deg, ${fighter.color}, ${fighter.accentColor})`,
              boxShadow: `0 0 20px ${fighter.color}80, inset 0 0 15px rgba(255,255,255,0.3)`,
            }}
          >
            {fighter.name.charAt(0)}
            
            {/* Transform Indicator */}
            {isTransformed && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-3 h-3 text-yellow-900" />
              </div>
            )}
          </div>
          
          {/* Fighter Name & Wins */}
          <div className={`min-w-0 ${side === 'right' ? 'text-right' : ''}`}>
            <h3 
              className="text-white font-bold text-sm sm:text-base md:text-lg truncate"
              style={{ textShadow: `0 0 10px ${fighter.accentColor}` }}
            >
              {fighter.displayName}
              {isTransformed && <span className="text-yellow-400 ml-1">⚡</span>}
            </h3>
            
            {/* Win Stars */}
            <div className={`flex gap-0.5 ${side === 'right' ? 'justify-end' : ''}`}>
              {[...Array(3)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${i < wins ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Health Bar */}
        <div 
          className={`
            relative h-5 sm:h-6 md:h-8 
            bg-gradient-to-b from-gray-700 to-gray-900 
            rounded-full overflow-hidden 
            border-2 border-white/20
            ${isCritical ? 'shadow-[0_0_20px_rgba(239,68,68,0.9)_inset]' : ''}
          `}
        >
          {/* Health Fill */}
          <div 
            className={`
              absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'}
              transition-all duration-300 ease-out
              ${isCritical 
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-400' 
                : isLow 
                  ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500' 
                  : 'bg-gradient-to-r from-green-600 via-lime-500 to-yellow-400'
              }
            `}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Shimmer Effect */}
          {health > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          )}
          
          {/* Damage Flash */}
          <div className="absolute inset-0 bg-white/50 opacity-0 transition-opacity" />
          
          {/* Health Text */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-white font-black text-sm sm:text-base md:text-lg"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' }}
          >
            {Math.ceil(health)}
          </div>
        </div>
        
        {/* Synergy Meter */}
        <div className={`mt-2 ${side === 'right' ? 'flex justify-end' : ''}`}>
          <SynergyMeter value={synergy} fighterColor={fighter.color} side={side} />
        </div>
      </div>
    </div>
  );
}

// ⏱️ LEGENDARY TIMER
function LegendaryTimer({ time }: { time: number }) {
  const isCritical = time < 10;
  const isUrgent = time < 5;
  
  return (
    <div 
      className={`
        relative bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-md 
        rounded-xl p-2 sm:p-4 
        min-w-[70px] sm:min-w-[100px]
        border-3 
        transition-all duration-300
        ${isUrgent 
          ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,1)] animate-pulse' 
          : isCritical 
            ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.8)]' 
            : 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]'
        }
      `}
    >
      {/* Timer Display */}
      <div className="text-center">
        <div 
          className={`
            text-3xl sm:text-4xl md:text-5xl font-black 
            ${isUrgent ? 'text-red-400 animate-bounce' : isCritical ? 'text-orange-400' : 'text-white'}
          `}
          style={{
            textShadow: isUrgent 
              ? '0 0 30px rgba(248,113,113,1), 0 0 60px rgba(239,68,68,0.8)'
              : isCritical 
                ? '0 0 20px rgba(251,146,60,0.9)'
                : '0 0 15px rgba(255,255,255,0.5)',
          }}
        >
          {Math.ceil(time)}
        </div>
        <div className="text-xs font-bold text-yellow-400/80 tracking-widest mt-1">
          TIME
        </div>
      </div>
      
      {/* Urgency Ring */}
      {isUrgent && (
        <div className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping opacity-50" />
      )}
    </div>
  );
}

// 🎮 ROUND ANNOUNCER
function RoundAnnouncer({ 
  phase, 
  winner, 
  playerName, 
  opponentName 
}: { 
  phase: string; 
  winner: string | null;
  playerName: string;
  opponentName: string;
}) {
  const [showText, setShowText] = useState(true);
  
  useEffect(() => {
    if (phase === 'preRound' || phase === 'ko') {
      setShowText(true);
    }
  }, [phase]);
  
  if (phase === 'preRound') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-50">
        <div className="text-center animate-[zoomIn_0.5s_ease-out]">
          {/* VS Splash */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
            <span className="text-3xl sm:text-5xl font-black text-cyan-400 animate-[slideInLeft_0.5s_ease-out]">
              {playerName}
            </span>
            <div 
              className="text-5xl sm:text-7xl font-black text-yellow-400 animate-pulse"
              style={{ textShadow: '0 0 30px rgba(250,204,21,0.8)' }}
            >
              VS
            </div>
            <span className="text-3xl sm:text-5xl font-black text-red-400 animate-[slideInRight_0.5s_ease-out]">
              {opponentName}
            </span>
          </div>
          
          {/* Ready Text */}
          <h1 
            className="text-5xl sm:text-7xl md:text-8xl font-black text-white animate-pulse"
            style={{
              textShadow: '0 0 40px rgba(255,215,0,1), 0 0 80px rgba(255,215,0,0.6)',
            }}
          >
            GET READY!
          </h1>
          
          {/* Fight Subtitle */}
          <p className="text-xl sm:text-2xl text-cyan-300 mt-4 tracking-widest">
            ⚔️ ROUND START ⚔️
          </p>
        </div>
        
        <style>{`
          @keyframes zoomIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
  
  if (phase === 'ko') {
    const isPlayerWin = winner === 'player';
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 pointer-events-none z-50">
        <div className="text-center">
          {/* KO Text */}
          <h1 
            className="text-7xl sm:text-8xl md:text-9xl font-black text-red-500 mb-4 animate-[koSlam_0.5s_ease-out]"
            style={{
              textShadow: '0 0 50px rgba(239,68,68,1), 0 0 100px rgba(239,68,68,0.7)',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
            }}
          >
            K.O.!
          </h1>
          
          {/* Winner */}
          <div className="animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
            <p 
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isPlayerWin ? 'text-yellow-300' : 'text-red-300'}`}
              style={{ textShadow: `0 0 20px ${isPlayerWin ? 'rgba(253,224,71,0.8)' : 'rgba(252,165,165,0.8)'}` }}
            >
              {isPlayerWin ? playerName : opponentName}
            </p>
            <p className="text-2xl sm:text-3xl text-white mt-2 tracking-wider">
              WINS!
            </p>
          </div>
        </div>
        
        <style>{`
          @keyframes koSlam {
            0% { transform: scale(3) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }
  
  return null;
}

// 🏆 RESULTS SCREEN
function ResultsScreen({
  winner,
  playerFighter,
  opponentFighter,
  playerWins,
  opponentWins,
  score,
  onRematch,
  onMenu,
}: {
  winner: string | null;
  playerFighter: { displayName: string; color: string; accentColor: string };
  opponentFighter: { displayName: string };
  playerWins: number;
  opponentWins: number;
  score: number;
  onRematch: () => void;
  onMenu: () => void;
}) {
  const isPlayerWin = winner === 'player';
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center pointer-events-auto z-50 p-4"
      style={{
        background: isPlayerWin 
          ? 'linear-gradient(135deg, rgba(79,70,229,0.95), rgba(67,56,202,0.95), rgba(59,130,246,0.95))'
          : 'linear-gradient(135deg, rgba(127,29,29,0.95), rgba(153,27,27,0.95), rgba(185,28,28,0.95))',
      }}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isPlayerWin && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          >
            {['🏆', '⭐', '✨', '🎉'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>
      
      <div 
        className="relative bg-black/40 backdrop-blur-xl rounded-2xl border-4 p-6 sm:p-10 max-w-xl w-full text-center"
        style={{ 
          borderColor: isPlayerWin ? '#FFD700' : '#EF4444',
          boxShadow: isPlayerWin 
            ? '0 0 60px rgba(255,215,0,0.5), inset 0 0 30px rgba(255,215,0,0.1)' 
            : '0 0 60px rgba(239,68,68,0.5), inset 0 0 30px rgba(239,68,68,0.1)',
        }}
      >
        {/* Result Header */}
        <div className="mb-6">
          {isPlayerWin ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h1 
                className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                  WebkitBackgroundClip: 'text',
                  textShadow: '0 0 40px rgba(255,215,0,0.8)',
                }}
              >
                VICTORY!
              </h1>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💔</div>
              <h1 className="text-4xl sm:text-5xl font-black text-red-400">
                DEFEATED
              </h1>
            </>
          )}
        </div>
        
        {/* Match Result */}
        <p className="text-xl sm:text-2xl text-white/90 mb-6">
          {isPlayerWin 
            ? `You defeated ${opponentFighter.displayName}!` 
            : `${opponentFighter.displayName} won this time!`}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 bg-white/10 rounded-xl p-4 mb-6">
          <div>
            <p className="text-sm text-cyan-400 font-bold mb-1">BATTLE SCORE</p>
            <p className="text-4xl font-black text-white">{score}</p>
          </div>
          <div>
            <p className="text-sm text-pink-400 font-bold mb-1">RECORD</p>
            <p className="text-4xl font-black text-white">{playerWins}W - {opponentWins}L</p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRematch}
            className="
              flex items-center justify-center gap-2 
              px-8 py-4 rounded-xl 
              font-bold text-lg text-white
              bg-gradient-to-r from-green-500 to-emerald-600
              hover:from-green-400 hover:to-emerald-500
              transform hover:scale-105 transition-all duration-300
              border-2 border-white/30
              shadow-lg hover:shadow-xl
            "
          >
            <RotateCcw className="w-5 h-5" />
            REMATCH
          </button>
          
          <button
            onClick={onMenu}
            className="
              flex items-center justify-center gap-2 
              px-8 py-4 rounded-xl 
              font-bold text-lg text-white
              bg-gradient-to-r from-purple-500 to-pink-600
              hover:from-purple-400 hover:to-pink-500
              transform hover:scale-105 transition-all duration-300
              border-2 border-white/30
              shadow-lg hover:shadow-xl
            "
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎮 MAIN BATTLE UI
export default function BattleUI() {
  const { 
    playerFighterId, 
    opponentFighterId,
    playerHealth, 
    opponentHealth, 
    maxHealth,
    roundTime,
    battlePhase,
    winner,
    playerWins,
    opponentWins,
    battleScore,
    resetRound,
    returnToMenu
  } = useBattle();
  
  const { end } = useGame();
  const { setGameState, addScore } = useRunner();
  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);
  
  // Get actual synergy and combo from battle store
  const { 
    playerSynergy, 
    playerTransformed, 
    comboCount, 
    comboDamage,
    maxSynergy 
  } = useBattle();
  
  const handleReturnToMenu = () => {
    addScore(battleScore);
    returnToMenu();
    end();
    setGameState('menu');
  };
  
  const handleRematch = () => {
    resetRound();
  };
  
  if (!playerFighter || !opponentFighter) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            {/* Player Health */}
            <LegendaryHealthBar
              health={playerHealth}
              maxHealth={maxHealth}
              fighter={playerFighter}
              side="left"
              wins={playerWins}
              synergy={playerSynergy}
              isTransformed={playerTransformed}
            />
            
            {/* Timer */}
            <LegendaryTimer time={roundTime} />
            
            {/* Opponent Health */}
            <LegendaryHealthBar
              health={opponentHealth}
              maxHealth={maxHealth}
              fighter={opponentFighter}
              side="right"
              wins={opponentWins}
              synergy={0}
            />
          </div>
        </div>
      </div>
      
      {/* Combo Counter */}
      <ComboCounter combo={comboCount} maxCombo={50} damage={comboDamage} />
      
      {/* Controls Guide (Desktop) */}
      {battlePhase === 'fighting' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-400/50">
            <div className="flex gap-4 text-white text-sm">
              <div className="flex items-center gap-1">
                <kbd className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">←→</kbd>
                <span className="text-gray-300">Move</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">SPACE</kbd>
                <span className="text-gray-300">Jump</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-cyan-500/40 px-2 py-0.5 rounded text-xs font-bold">J</kbd>
                <span className="text-cyan-300">Punch</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-orange-500/40 px-2 py-0.5 rounded text-xs font-bold">K</kbd>
                <span className="text-orange-300">Kick</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-purple-500/40 px-2 py-0.5 rounded text-xs font-bold">L</kbd>
                <span className="text-purple-300">Special</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-yellow-500/40 px-2 py-0.5 rounded text-xs font-bold">T</kbd>
                <span className="text-yellow-300">Transform</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Round Announcer */}
      <RoundAnnouncer 
        phase={battlePhase}
        winner={winner}
        playerName={playerFighter.displayName}
        opponentName={opponentFighter.displayName}
      />
      
      {/* Results Screen */}
      {battlePhase === 'results' && (
        <ResultsScreen
          winner={winner}
          playerFighter={playerFighter}
          opponentFighter={opponentFighter}
          playerWins={playerWins}
          opponentWins={opponentWins}
          score={battleScore}
          onRematch={handleRematch}
          onMenu={handleReturnToMenu}
        />
      )}
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
