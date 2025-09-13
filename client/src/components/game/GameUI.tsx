import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Heart, Star, Coins, Trophy, Volume2, VolumeX, Pause, Play } from "lucide-react";

export default function GameUI() {
  const { stats, gameState, setGameState, resetGame } = useRunner();
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
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Control Buttons */}
        <div className="flex gap-2 pointer-events-auto">
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
      
      {/* Kindness Points */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="bg-black bg-opacity-60 text-white border-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              <span className="font-bold">Kindness: {stats.kindnessPoints}</span>
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
