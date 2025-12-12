import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Heart, Star, Coins, Trophy, Volume2, VolumeX, Pause, Play, Zap, Flame, RefreshCw, Users } from "lucide-react";

export default function GameUI() {
  const { 
    stats, 
    gameState, 
    setGameState, 
    resetGame, 
    selectedCharacter,
    activeCharacter,
    switchCharacter,
    reunionMode,
    player,
    toyChaseActive,
    dogZoomiesActive,
    pillowMountainHeight,
    activateRuleBreaking,
    activateMasterPlan,
    buildPillowMountain,
    startToyChase,
    triggerDogZoomies
  } = useRunner();
  const { phase, restart } = useGame();
  const { isMuted, toggleMute } = useAudio();
  
  const handlePause = () => {
    if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  };
  
  const handleRestart = () => {
    resetGame();
    restart();
  };
  
  // Game Over Screen
  if (phase === "ended") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
        <Card className="w-full max-w-md mx-4 bg-white">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Game Over!</h2>
            
            <div className="space-y-2 mb-6 text-lg">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Score:
                </span>
                <span className="font-bold">{stats.score.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Coins:
                </span>
                <span className="font-bold">{stats.coinsCollected}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Kindness:
                </span>
                <span className="font-bold">{stats.kindnessPoints}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Distance:</span>
                <span className="font-bold">{Math.floor(stats.distance)}m</span>
              </div>
            </div>
            
            <Button onClick={handleRestart} className="w-full text-lg py-3">
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // In-Game UI
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Score and Stats */}
        <div className="pointer-events-auto">
          <Card className="bg-black bg-opacity-60 text-white border-none">
            <CardContent className="p-3">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold">{stats.score.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>{stats.coinsCollected}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>{stats.helpTokens}/3</span>
                </div>
                
                {/* Bond Meter */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <div className="w-16 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-full bg-purple-400 rounded-full transition-all"
                      style={{ width: `${stats.bondMeter}%` }}
                    />
                  </div>
                </div>
                
                {/* Volume Meter */}
                {stats.volumeLevel > 0 && (
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-yellow-400" />
                    <div className="w-16 h-2 bg-gray-600 rounded-full">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          stats.volumeLevel > 80 ? 'bg-red-400' : 
                          stats.volumeLevel > 50 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${stats.volumeLevel}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Energy Meter for Transformation */}
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${player.energyMeter >= 100 ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`} />
                  <div className="w-16 h-2 bg-gray-600 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        player.energyMeter >= 100 ? 'bg-yellow-400 animate-pulse' : 
                        selectedCharacter === 'kaison' ? 'bg-cyan-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${player.energyMeter}%` }}
                    />
                  </div>
                </div>
                
                {/* Health Bar */}
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <div className="w-16 h-2 bg-gray-600 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        player.health > 50 ? 'bg-green-400' : 
                        player.health > 25 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${player.health}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Control Buttons */}
        <div className="flex gap-2 pointer-events-auto">
          {/* Transformation Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => useRunner.getState().transformHero()}
            disabled={player.energyMeter < 100 || player.powerLevel > 0}
            className={`bg-black bg-opacity-60 text-white border-gray-600 hover:bg-opacity-80 ${
              player.energyMeter >= 100 && player.powerLevel === 0 
                ? 'border-yellow-400 animate-pulse' 
                : 'opacity-50'
            }`}
          >
            {player.powerLevel > 0 ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </Button>
          
          {/* Character Switch Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={switchCharacter}
            className={`bg-black bg-opacity-60 text-white border-gray-600 hover:bg-opacity-80 ${
              activeCharacter === "jaxon" ? "border-blue-400" : "border-red-400"
            }`}
          >
            {activeCharacter === "jaxon" ? <Zap className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className="bg-black bg-opacity-60 text-white border-gray-600 hover:bg-opacity-80"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            className="bg-black bg-opacity-60 text-white border-gray-600 hover:bg-opacity-80"
          >
            {gameState === "paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Distance Counter */}
      <div className="absolute top-20 right-4 pointer-events-auto">
        <Card className="bg-black bg-opacity-60 text-white border-none">
          <CardContent className="p-2">
            <div className="text-lg font-bold">
              {Math.floor(stats.distance)}m
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Creative Chaos Panel */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="bg-black bg-opacity-60 text-white border-none">
          <CardContent className="p-3">
            <div className="flex flex-col gap-2 text-sm">
              {/* Active Character Display */}
              <div className="flex items-center gap-2 mb-2">
                {activeCharacter === "jaxon" ? <Zap className="w-4 h-4 text-blue-400" /> : <Flame className="w-4 h-4 text-red-400" />}
                <span className="font-bold">
                  {activeCharacter === "jaxon" ? "Fearless Jaxon" : "Strategic Kaison"}
                </span>
              </div>
              
              {/* Reunion Mode Indicator */}
              {reunionMode !== "normal" && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="capitalize">{reunionMode} Reunion!</span>
                </div>
              )}
              
              {/* Active Chaos Indicators */}
              {toyChaseActive && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>I got the toy!</span>
                </div>
              )}
              
              {dogZoomiesActive && (
                <div className="flex items-center gap-2 text-green-400">
                  <RefreshCw className="w-4 h-4 animate-bounce" />
                  <span>Dog Zoomies!</span>
                </div>
              )}
              
              {pillowMountainHeight > 0 && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Star className="w-4 h-4" />
                  <span>Mountain Level: {pillowMountainHeight}</span>
                </div>
              )}
              
              {/* Player Special States */}
              {player.isRuleBreaking && (
                <div className="flex items-center gap-2 text-blue-300 animate-pulse">
                  <Zap className="w-4 h-4" />
                  <span>Rule Breaking Mode!</span>
                </div>
              )}
              
              {/* Transformation State */}
              {player.powerLevel > 0 && (
                <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                  <Star className="w-4 h-4" />
                  <span>
                    {selectedCharacter === 'kaison' ? 'Super Kaison!' : 'Hyper Jaxon!'}
                  </span>
                  <span className="text-xs">
                    ({Math.ceil(player.transformDuration / 60)}s)
                  </span>
                </div>
              )}
              
              {/* Web Kick Charge Indicator */}
              {player.webAttached && player.kickChargeTimer > 0 && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-4 h-4 animate-bounce" />
                  <span>Kick Power: {Math.floor(player.kickPower)}</span>
                  <div className="w-20 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all"
                      style={{ width: `${(player.kickChargeTimer / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.isMasterPlanning && (
                <div className="flex items-center gap-2 text-red-300 animate-pulse">
                  <Flame className="w-4 h-4" />
                  <span>Master Planning...</span>
                </div>
              )}
              
              {/* Kindness Points */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-600">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Kindness: {stats.kindnessPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Special Abilities Panel */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <Card className="bg-black bg-opacity-60 text-white border-none">
          <CardContent className="p-3">
            <div className="flex gap-2">
              {/* Pillow Mountain Builder */}
              <Button
                variant="outline"
                size="sm"
                onClick={buildPillowMountain}
                className="bg-blue-600 bg-opacity-40 text-white border-blue-400 hover:bg-opacity-60"
                title="Build Pillow Mountain!"
              >
                🏔️
              </Button>
              
              {/* Toy Chase */}
              <Button
                variant="outline"
                size="sm"
                onClick={startToyChase}
                disabled={toyChaseActive}
                className="bg-yellow-600 bg-opacity-40 text-white border-yellow-400 hover:bg-opacity-60 disabled:opacity-50"
                title="I got the toy!"
              >
                🧸
              </Button>
              
              {/* Dog Zoomies */}
              <Button
                variant="outline"
                size="sm"
                onClick={triggerDogZoomies}
                disabled={dogZoomiesActive}
                className="bg-green-600 bg-opacity-40 text-white border-green-400 hover:bg-opacity-60 disabled:opacity-50"
                title="Trigger Dog Zoomies!"
              >
                🐕
              </Button>
              
              {/* Character Special Abilities */}
              {activeCharacter === "jaxon" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={activateRuleBreaking}
                  disabled={player.isRuleBreaking}
                  className="bg-blue-600 bg-opacity-40 text-white border-blue-400 hover:bg-opacity-60 disabled:opacity-50"
                  title="Jaxon's Rule Breaking!"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              )}
              
              {activeCharacter === "kaison" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={activateMasterPlan}
                  disabled={player.isMasterPlanning}
                  className="bg-red-600 bg-opacity-40 text-white border-red-400 hover:bg-opacity-60 disabled:opacity-50"
                  title="Kaison's Master Plan!"
                >
                  <Flame className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Paused Overlay */}
      {gameState === "paused" && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto">
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <h3 className="text-2xl font-bold mb-4">Game Paused</h3>
              <div className="flex gap-3">
                <Button onClick={handlePause}>Resume</Button>
                <Button variant="outline" onClick={handleRestart}>Restart</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Mobile Instructions */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none md:hidden">
        <div className="text-white text-center text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full">
          Swipe or tap to control your hero!
        </div>
      </div>
    </div>
  );
}
