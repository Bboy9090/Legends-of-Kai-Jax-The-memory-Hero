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
    resetRound
  } = useBattle();
  
  const { end } = useGame();
  const { setGameState, addScore } = useRunner();
  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);
  
  const handleReturnToMenu = () => {
    // Save score
    addScore(battleScore);
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
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            {/* Player Health */}
            <div className="flex-1">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl"
                    style={{ backgroundColor: playerFighter.color }}
                  >
                    {playerFighter.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{playerFighter.displayName}</h3>
                    <p className="text-yellow-300 text-sm font-bold">{playerWins} Wins</p>
                  </div>
                </div>
                <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden border-2 border-white">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {playerHealth} HP
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border-4 border-yellow-400 min-w-[120px]">
              <div className="text-center">
                <div className={`text-5xl font-bold ${roundTime < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {Math.ceil(roundTime)}
                </div>
                <div className="text-yellow-300 text-xs font-bold mt-1">TIME</div>
              </div>
            </div>
            
            {/* Opponent Health */}
            <div className="flex-1">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border-4 border-red-400">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <div>
                    <h3 className="text-white font-bold text-lg text-right">{opponentFighter.displayName}</h3>
                    <p className="text-yellow-300 text-sm font-bold text-right">{opponentWins} Wins</p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl"
                    style={{ backgroundColor: opponentFighter.color }}
                  >
                    {opponentFighter.name.charAt(0)}
                  </div>
                </div>
                <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden border-2 border-white">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300"
                    style={{ width: `${(opponentHealth / maxHealth) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {opponentHealth} HP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Controls Guide */}
      {battlePhase === 'fighting' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
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
          <div className="text-center">
            <h1 className="text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,0,1)] animate-pulse">
              GET READY!
            </h1>
          </div>
        </div>
      )}
      
      {/* KO Animation */}
      {battlePhase === 'ko' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,1)] animate-bounce mb-4">
              K.O.!
            </h1>
            <p className="text-4xl font-bold text-yellow-300">
              {winner === 'player' ? playerFighter.displayName : opponentFighter.displayName} WINS!
            </p>
          </div>
        </div>
      )}
      
      {/* Results Screen */}
      {battlePhase === 'results' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm pointer-events-auto">
          <Card className="bg-black/40 backdrop-blur-lg border-4 border-yellow-400 p-8 max-w-2xl">
            <div className="text-center">
              {winner === 'player' ? (
                <>
                  <h1 className="text-7xl font-bold text-yellow-300 mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,1)]">
                    🏆 VICTORY! 🏆
                  </h1>
                  <p className="text-3xl text-white mb-6">You defeated {opponentFighter.displayName}!</p>
                </>
              ) : (
                <>
                  <h1 className="text-6xl font-bold text-red-400 mb-4">
                    TRY AGAIN!
                  </h1>
                  <p className="text-3xl text-white mb-6">{opponentFighter.displayName} won this time!</p>
                </>
              )}
              
              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-xl font-bold text-cyan-400">Your Score</p>
                    <p className="text-4xl font-bold">{battleScore}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-pink-400">Record</p>
                    <p className="text-4xl font-bold">{playerWins}W - {opponentWins}L</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleRematch}
                  className="text-2xl py-6 px-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold border-4 border-yellow-400"
                >
                  🔄 Rematch
                </Button>
                <Button
                  onClick={handleReturnToMenu}
                  className="text-2xl py-6 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-4 border-cyan-400"
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
