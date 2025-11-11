import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Lock } from "lucide-react";
import { useState } from "react";
import { FIGHTERS, Fighter, getFighterById } from "../../lib/characters";

export default function CharacterSelect() {
  const { selectedCharacter, setCharacter, setGameState, stats } = useRunner();
  const { start } = useGame();
  const [hoveredFighter, setHoveredFighter] = useState<string | null>(null);
  
  const startGame = () => {
    console.log("Starting battle with fighter:", selectedCharacter);
    start();
    setGameState("playing");
  };
  
  const goBack = () => {
    setGameState("menu");
  };
  
  const handleFighterSelect = (fighter: Fighter) => {
    // Check if fighter is unlocked
    if (!fighter.unlocked && fighter.unlockRequirement && stats.score < fighter.unlockRequirement) {
      console.log("Fighter locked:", fighter.id);
      return;
    }
    
    console.log("Fighter selected:", fighter.id);
    setCharacter(fighter.id as any);
  };
  
  const isLocked = (fighter: Fighter) => {
    return !fighter.unlocked && fighter.unlockRequirement && stats.score < fighter.unlockRequirement;
  };
  
  const categories = [
    { name: 'Heroes', id: 'heroes' as const, color: 'from-blue-500 to-cyan-500' },
    { name: 'Speedsters', id: 'speedsters' as const, color: 'from-yellow-500 to-orange-500' },
    { name: 'Warriors', id: 'warriors' as const, color: 'from-green-500 to-emerald-500' },
    { name: 'Legends', id: 'legends' as const, color: 'from-purple-500 to-pink-500' }
  ];
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 overflow-auto">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-black/40 backdrop-blur-lg border-4 border-yellow-400">
          <CardHeader className="text-center relative border-b-4 border-yellow-400/30">
            <Button 
              variant="outline" 
              onClick={goBack}
              className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white border-none"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <CardTitle className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              Choose Your Fighter!
            </CardTitle>
            <p className="text-yellow-300 text-xl mt-2 font-bold">
              {FIGHTERS.filter(f => !isLocked(f)).length} / {FIGHTERS.length} Fighters Unlocked
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Fighter Categories */}
            {categories.map(category => {
              const categoryFighters = FIGHTERS.filter(f => f.category === category.id);
              
              return (
                <div key={category.id} className="mb-8">
                  <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.name}
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryFighters.map(fighter => {
                      const locked = isLocked(fighter);
                      const selected = selectedCharacter === fighter.id;
                      
                      return (
                        <div
                          key={fighter.id}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            locked ? 'opacity-50' : 'hover:scale-105'
                          }`}
                          onClick={() => !locked && handleFighterSelect(fighter)}
                          onMouseEnter={() => setHoveredFighter(fighter.id)}
                          onMouseLeave={() => setHoveredFighter(null)}
                        >
                          <Card className={`
                            ${selected ? 'ring-4 ring-yellow-400 bg-yellow-400/20' : 'bg-gray-800/50'}
                            ${locked ? 'grayscale' : ''}
                            border-2 overflow-hidden
                          `} style={{ borderColor: fighter.accentColor }}>
                            <CardContent className="p-4 text-center">
                              {/* Fighter Avatar */}
                              <div 
                                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg relative"
                                style={{ 
                                  backgroundColor: fighter.color,
                                  boxShadow: `0 0 20px ${fighter.accentColor}`
                                }}
                              >
                                <span className="text-4xl font-bold text-white">
                                  {fighter.name.charAt(0).toUpperCase()}
                                </span>
                                
                                {locked && (
                                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-yellow-400" />
                                  </div>
                                )}
                                
                                {selected && !locked && (
                                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center">
                                    <span className="text-black font-bold">✓</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Fighter Name */}
                              <h3 className="text-lg font-bold text-white mb-1">
                                {fighter.displayName}
                              </h3>
                              
                              {/* Description or Lock Info */}
                              {locked ? (
                                <p className="text-xs text-yellow-400 font-semibold">
                                  🔒 {fighter.unlockRequirement} pts
                                </p>
                              ) : (
                                <p className="text-xs text-gray-300">
                                  {fighter.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Selected Fighter Preview */}
            <div className="mt-8 mb-6">
              <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-4 border-cyan-400">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {selectedCharacter && (() => {
                      const fighter = getFighterById(selectedCharacter);
                      if (!fighter) return null;
                      
                      return (
                        <>
                          <div 
                            className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                            style={{ 
                              backgroundColor: fighter.color,
                              boxShadow: `0 0 30px ${fighter.accentColor}`
                            }}
                          >
                            <span className="text-5xl font-bold text-white">
                              {fighter.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold text-white mb-2">
                              {fighter.displayName}
                            </h3>
                            <p className="text-cyan-300 text-lg">
                              {fighter.description}
                            </p>
                            <div className="mt-2">
                              <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold">
                                {fighter.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Start Battle Button */}
            <div className="text-center">
              <Button 
                onClick={startGame}
                className="w-full max-w-md text-2xl py-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 hover:from-green-600 hover:via-yellow-600 hover:to-red-600 text-white font-bold border-4 border-yellow-400 shadow-[0_0_30px_rgba(255,255,0,0.5)]"
              >
                🥊 START BATTLE! 🥊
              </Button>
            </div>
            
            {/* Game Info */}
            <div className="mt-6 text-center text-sm text-gray-300 bg-black/30 p-4 rounded-lg">
              <p className="font-bold text-yellow-300 mb-2">🎮 Controls:</p>
              <p>Arrow Keys = Move • Space = Jump • J = Punch • K = Kick • L = Special</p>
              <p className="mt-2 text-xs text-gray-400">Win battles to earn points and unlock more fighters!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
