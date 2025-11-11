import { useBattle } from "../../lib/stores/useBattle";
import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { getFighterById } from "../../lib/characters";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

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
  
  const handleReturnToMenu = () => {
    // Save score
    addScore(battleScore);
    // Stop battle music
    returnToMenu();
    // Return to menu
    end();
    setGameState('menu');
  };
  
  const handleRematch = () => {
    resetRound();
  };
  
  if (!playerFighter || !opponentFighter) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD - Health Bars and Timer */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-1 sm:gap-2 md:gap-4">
            {/* Player Health */}
            <div className="flex-1 min-w-0 animate-[slideInLeft_0.5s_ease-out]">
              <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-1.5 sm:p-3 border-2 sm:border-4 ${playerHealth < 30 ? 'border-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]'} transition-all duration-300`}>
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg md:text-2xl flex-shrink-0 shadow-lg ${playerHealth < 30 ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: playerFighter.color, boxShadow: `0 0 20px ${playerFighter.color}80` }}
                  >
                    {playerFighter.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm md:text-lg truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{playerFighter.displayName}</h3>
                    <p className="text-yellow-300 text-xs font-bold hidden sm:block drop-shadow-[0_0_6px_rgba(253,224,71,0.5)]">{playerWins} Wins</p>
                  </div>
                </div>
                <div className={`relative h-4 sm:h-6 md:h-8 bg-gray-800 rounded-full overflow-hidden border border-white sm:border-2 ${playerHealth < 30 ? 'shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'shadow-[0_0_10px_rgba(34,197,94,0.6)]'}`}>
                  <div 
                    className={`absolute inset-0 transition-all duration-300 ${playerHealth < 30 ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' : 'bg-gradient-to-r from-green-500 via-lime-400 to-yellow-400'}`}
                    style={{ width: `${(playerHealth / maxHealth) * 100}%`, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)' }}
                  />
                  {playerHealth > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(0,0,0,1)]" style={{ textShadow: '0 0 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)' }}>
                    {playerHealth}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className={`bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-4 border-2 sm:border-4 min-w-[60px] sm:min-w-[120px] animate-[fadeInDown_0.5s_ease-out_0.2s_both] ${roundTime < 10 ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)]' : 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)]'} transition-all duration-300`}>
              <div className="text-center">
                <div className={`text-2xl sm:text-4xl md:text-5xl font-extrabold ${roundTime < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`} style={{ textShadow: roundTime < 10 ? '0 0 20px rgba(248,113,113,0.9), 0 0 40px rgba(239,68,68,0.7)' : '0 0 15px rgba(255,255,255,0.5)' }}>
                  {Math.ceil(roundTime)}
                </div>
                <div className="text-yellow-300 text-xs font-bold mt-0.5 sm:mt-1 hidden sm:block drop-shadow-[0_0_6px_rgba(253,224,71,0.7)]">TIME</div>
              </div>
            </div>
            
            {/* Opponent Health */}
            <div className="flex-1 min-w-0 animate-[slideInRight_0.5s_ease-out]">
              <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-1.5 sm:p-3 border-2 sm:border-4 ${opponentHealth < 30 ? 'border-orange-500 animate-pulse shadow-[0_0_30px_rgba(249,115,22,0.6)]' : 'border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.5)]'} transition-all duration-300`}>
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 justify-end">
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm md:text-lg text-right truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{opponentFighter.displayName}</h3>
                    <p className="text-yellow-300 text-xs font-bold text-right hidden sm:block drop-shadow-[0_0_6px_rgba(253,224,71,0.5)]">{opponentWins} Wins</p>
                  </div>
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg md:text-2xl flex-shrink-0 shadow-lg ${opponentHealth < 30 ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: opponentFighter.color, boxShadow: `0 0 20px ${opponentFighter.color}80` }}
                  >
                    {opponentFighter.name.charAt(0)}
                  </div>
                </div>
                <div className={`relative h-4 sm:h-6 md:h-8 bg-gray-800 rounded-full overflow-hidden border border-white sm:border-2 ${opponentHealth < 30 ? 'shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`}>
                  <div 
                    className={`absolute inset-0 transition-all duration-300 ${opponentHealth < 30 ? 'bg-gradient-to-r from-orange-600 to-orange-400 animate-pulse' : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500'}`}
                    style={{ width: `${(opponentHealth / maxHealth) * 100}%`, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)' }}
                  />
                  {opponentHealth > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(0,0,0,1)]" style={{ textShadow: '0 0 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)' }}>
                    {opponentHealth}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Controls Guide - Desktop only */}
      {battlePhase === 'fighting' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 border-2 border-cyan-400">
            <div className="flex gap-6 text-white text-sm">
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 px-2 py-1 rounded">←→</kbd>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 px-2 py-1 rounded">Space</kbd>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 px-2 py-1 rounded">J</kbd>
                <span>Punch</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 px-2 py-1 rounded">K</kbd>
                <span>Kick</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 px-2 py-1 rounded">L</kbd>
                <span>Special</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pre-Round Countdown */}
      {battlePhase === 'preRound' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,0,1)] animate-pulse">
              GET READY!
            </h1>
          </div>
        </div>
      )}
      
      {/* KO Animation */}
      {battlePhase === 'ko' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="text-center px-4">
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,1)] animate-bounce mb-2 sm:mb-4">
              K.O.!
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300">
              {winner === 'player' ? playerFighter.displayName : opponentFighter.displayName} WINS!
            </p>
          </div>
        </div>
      )}
      
      {/* Results Screen */}
      {battlePhase === 'results' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm pointer-events-auto p-4">
          <Card className="bg-black/40 backdrop-blur-lg border-2 sm:border-4 border-yellow-400 p-4 sm:p-8 max-w-2xl w-full">
            <div className="text-center">
              {winner === 'player' ? (
                <>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-yellow-300 mb-2 sm:mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,1)]">
                    🏆 VICTORY! 🏆
                  </h1>
                  <p className="text-xl sm:text-2xl md:text-3xl text-white mb-4 sm:mb-6">You defeated {opponentFighter.displayName}!</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-red-400 mb-2 sm:mb-4">
                    TRY AGAIN!
                  </h1>
                  <p className="text-xl sm:text-2xl md:text-3xl text-white mb-4 sm:mb-6">{opponentFighter.displayName} won this time!</p>
                </>
              )}
              
              <div className="bg-white/10 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-white">
                  <div>
                    <p className="text-sm sm:text-xl font-bold text-cyan-400">Your Score</p>
                    <p className="text-2xl sm:text-4xl font-bold">{battleScore}</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-xl font-bold text-pink-400">Record</p>
                    <p className="text-2xl sm:text-4xl font-bold">{playerWins}W - {opponentWins}L</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={handleRematch}
                  className="text-lg sm:text-xl md:text-2xl py-4 sm:py-6 px-6 sm:px-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold border-2 sm:border-4 border-yellow-400"
                >
                  🔄 Rematch
                </Button>
                <Button
                  onClick={handleReturnToMenu}
                  className="text-lg sm:text-xl md:text-2xl py-4 sm:py-6 px-6 sm:px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 sm:border-4 border-cyan-400"
                >
                  🏠 Main Menu
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
