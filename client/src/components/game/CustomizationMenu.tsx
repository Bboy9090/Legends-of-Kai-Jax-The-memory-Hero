import { useRunner } from "../../lib/stores/useRunner";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Lock } from "lucide-react";

export default function CustomizationMenu() {
  const { 
    stats,
    setGameState 
  } = useRunner();

  
  const isUnlocked = (fighter: typeof FIGHTERS[0]) => {
    if (fighter.unlocked) return true;
    if (!fighter.unlockRequirement) return true;
    return stats.score >= fighter.unlockRequirement;
  };
  
  const categories = [
    { name: 'Heroes', id: 'heroes' as const, color: 'from-blue-500 to-cyan-500' },
    { name: 'Speedsters', id: 'speedsters' as const, color: 'from-yellow-500 to-orange-500' },
    { name: 'Warriors', id: 'warriors' as const, color: 'from-green-500 to-emerald-500' },
    { name: 'Legends', id: 'legends' as const, color: 'from-purple-500 to-pink-500' }
  ];
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 text-white overflow-auto">
      {/* Header */}
      <div className="bg-black/40 border-b-4 border-cyan-400 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Unlock Fighters
            </h1>
            <p className="text-gray-300 mt-1">Your Score: {stats.score} points</p>
          </div>
          <Button
            onClick={() => setGameState('menu')}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 text-white font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto p-6">
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
                  const unlocked = isUnlocked(fighter);
                  
                  return (
                    <Card
                      key={fighter.id}
                      className={`${
                        unlocked ? 'bg-gray-800/50' : 'bg-gray-900/70 opacity-60'
                      } border-2`}
                      style={{ borderColor: fighter.accentColor }}
                    >
                      <CardContent className="p-4 text-center">
                        <div 
                          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg relative"
                          style={{ 
                            backgroundColor: fighter.color,
                            boxShadow: unlocked ? `0 0 20px ${fighter.accentColor}` : 'none'
                          }}
                        >
                          <span className="text-4xl font-bold text-white">
                            {fighter.name.charAt(0).toUpperCase()}
                          </span>
                          
                          {!unlocked && (
                            <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                              <Lock className="w-8 h-8 text-yellow-400" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">
                          {fighter.displayName}
                        </h3>
                        
                        {unlocked ? (
                          <p className="text-xs text-gray-300">
                            {fighter.description}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <p className="text-xs text-yellow-400 font-semibold">
                              🔒 {fighter.unlockRequirement} pts
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Need {(fighter.unlockRequirement || 0) - stats.score} more
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Progress Summary */}
        <Card className="bg-black/40 border-4 border-yellow-400 mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-300 mb-2">
                Unlocked Fighters
              </h3>
              <p className="text-5xl font-bold text-white mb-4">
                {FIGHTERS.filter(isUnlocked).length} / {FIGHTERS.length}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4 max-w-md mx-auto">
                <div 
                  className="bg-gradient-to-r from-green-400 via-yellow-400 to-cyan-400 h-4 rounded-full transition-all"
                  style={{ width: `${(FIGHTERS.filter(isUnlocked).length / FIGHTERS.length) * 100}%` }}
                />
              </div>
              <p className="text-gray-300 mt-4">
                Win battles to earn points and unlock more fighters!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
