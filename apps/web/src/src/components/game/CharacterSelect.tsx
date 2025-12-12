import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Lock } from "lucide-react";
import { useState } from "react";
import { FIGHTERS, Fighter, getFighterById } from "../../lib/characters";
import CharacterPreview3D from "./CharacterPreview3D";

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
  
  // Determine which fighter to preview
  const previewFighter = hoveredFighter 
    ? getFighterById(hoveredFighter) 
    : selectedCharacter 
      ? getFighterById(selectedCharacter)
      : FIGHTERS.find(f => f.unlocked); // Default to first unlocked fighter
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-2 sm:p-4">
      <div className="w-full max-w-7xl mx-auto pb-8 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main character selection panel */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-lg border-2 sm:border-4 border-yellow-400">
          <CardHeader className="text-center relative border-b-2 sm:border-b-4 border-yellow-400/30 p-3 sm:p-6">
            <Button 
              variant="outline" 
              onClick={goBack}
              className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 hover:bg-red-600 text-white border-none text-sm sm:text-base p-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
            
            <CardTitle className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] px-12 sm:px-0">
              Choose Fighter!
            </CardTitle>
            <p className="text-yellow-300 text-sm sm:text-xl mt-1 sm:mt-2 font-bold">
              {FIGHTERS.filter(f => !isLocked(f)).length} / {FIGHTERS.length} Unlocked
            </p>
          </CardHeader>
          
          <CardContent className="p-2 sm:p-4 md:p-6">
            {/* Fighter Categories */}
            {categories.map(category => {
              const categoryFighters = FIGHTERS.filter(f => f.category === category.id);
              
              return (
                <div key={category.id} className="mb-4 sm:mb-8">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.name}
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                    {categoryFighters.map(fighter => {
                      const locked = isLocked(fighter);
                      const selected = selectedCharacter === fighter.id;
                      
                      return (
                        <div
                          key={fighter.id}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            locked ? 'opacity-50' : 'active:scale-95'
                          }`}
                          onClick={() => !locked && handleFighterSelect(fighter)}
                          onMouseEnter={() => !locked && setHoveredFighter(fighter.id)}
                          onMouseLeave={() => setHoveredFighter(null)}
                        >
                          <Card className={`
                            ${selected ? 'ring-2 sm:ring-4 ring-yellow-400 bg-yellow-400/20' : 'bg-gray-800/50'}
                            ${locked ? 'grayscale' : ''}
                            border-2 overflow-hidden
                          `} style={{ borderColor: fighter.accentColor }}>
                            <CardContent className="p-2 sm:p-4 text-center">
                              {/* Fighter Avatar */}
                              <div 
                                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-lg relative"
                                style={{ 
                                  backgroundColor: fighter.color,
                                  boxShadow: `0 0 20px ${fighter.accentColor}`
                                }}
                              >
                                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                                  {fighter.name.charAt(0).toUpperCase()}
                                </span>
                                
                                {locked && (
                                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-400" />
                                  </div>
                                )}
                                
                                {selected && !locked && (
                                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                    <span className="text-black font-bold text-sm sm:text-base">✓</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Fighter Name */}
                              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 line-clamp-1">
                                {fighter.displayName}
                              </h3>
                              
                              {/* Description or Lock Info */}
                              {locked ? (
                                <p className="text-xs text-yellow-400 font-semibold">
                                  🔒 {fighter.unlockRequirement}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-300 line-clamp-2 hidden sm:block">
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
            <div className="mt-4 sm:mt-8 mb-4 sm:mb-6">
              <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 sm:border-4 border-cyan-400">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-6">
                    {selectedCharacter && (() => {
                      const fighter = getFighterById(selectedCharacter);
                      if (!fighter) return null;
                      
                      return (
                        <>
                          <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl flex-shrink-0"
                            style={{ 
                              backgroundColor: fighter.color,
                              boxShadow: `0 0 30px ${fighter.accentColor}`
                            }}
                          >
                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                              {fighter.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                              {fighter.displayName}
                            </h3>
                            <p className="text-cyan-300 text-sm sm:text-base md:text-lg line-clamp-2">
                              {fighter.description}
                            </p>
                            <div className="mt-1 sm:mt-2">
                              <span className="inline-block px-2 sm:px-3 py-1 bg-yellow-400 text-black rounded-full text-xs sm:text-sm font-bold">
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
                className="w-full max-w-md text-lg sm:text-xl md:text-2xl py-4 sm:py-6 md:py-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 hover:from-green-600 hover:via-yellow-600 hover:to-red-600 text-white font-bold border-2 sm:border-4 border-yellow-400 shadow-[0_0_30px_rgba(255,255,0,0.5)]"
              >
                🥊 START BATTLE! 🥊
              </Button>
            </div>
            
            {/* Game Info */}
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-300 bg-black/30 p-3 sm:p-4 rounded-lg">
              <p className="font-bold text-yellow-300 mb-1 sm:mb-2">🎮 Controls:</p>
              <p className="hidden sm:block">Arrow Keys = Move • Space = Jump • J = Punch • K = Kick • L = Special</p>
              <p className="sm:hidden">Touch controls on screen</p>
              <p className="mt-1 sm:mt-2 text-xs text-gray-400">Win battles to unlock more fighters!</p>
            </div>
          </CardContent>
        </Card>
        </div>
        
        {/* 3D Character Preview Panel - Mortal Kombat Style! */}
          <div className="lg:col-span-1">
            <Card className="bg-black/50 backdrop-blur-lg border-2 sm:border-4 border-cyan-400 h-full min-h-[400px] lg:min-h-[600px] sticky top-4">
              <CardHeader className="text-center border-b-2 border-cyan-400/30 p-3">
                <CardTitle className="text-xl sm:text-2xl font-bold text-cyan-300">
                  {previewFighter ? previewFighter.displayName : 'Select Fighter'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[350px] lg:h-[500px]">
                {previewFighter && <CharacterPreview3D fighter={previewFighter} />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
