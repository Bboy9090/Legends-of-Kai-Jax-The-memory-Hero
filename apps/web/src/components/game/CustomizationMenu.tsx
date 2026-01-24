import { useRunner } from "../../lib/stores/useRunner";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft } from "lucide-react";

export default function CustomizationMenu() {
  const { 
    stats,
    setGameState 
  } = useRunner();

  
  const isUnlocked = (fighter: typeof FIGHTERS[0]) => {
    // All characters are free/unlocked in Beast Wars mode
    return true;
  };
  
  const categories = [
    { name: 'Heroes', id: 'heroes' as const, color: 'from-blue-500 to-cyan-500' },
    { name: 'Speedsters', id: 'speedsters' as const, color: 'from-yellow-500 to-orange-500' },
    { name: 'Warriors', id: 'warriors' as const, color: 'from-green-500 to-emerald-500' },
    { name: 'Legends', id: 'legends' as const, color: 'from-purple-500 to-pink-500' }
  ];
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 text-white">
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

      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-8 sm:pb-24">
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
                  const unlocked = true;
                  
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
                          className="w-20 h-20 mx-auto mb-3 flex items-center justify-center shadow-lg relative"
                          style={{ 
                            backgroundColor: fighter.color,
                            clipPath: 'polygon(25% 6%, 75% 6%, 96% 50%, 75% 94%, 25% 94%, 4% 50%)',
                            boxShadow: unlocked ? `0 0 20px ${fighter.accentColor}` : 'none'
                          }}
                        >
                          <div className="text-center px-2">
                            <div className="text-[10px] font-black tracking-widest text-white/95">
                              {fighter.name}
                            </div>
                            <div className="text-[9px] font-bold text-white/70">
                              {fighter.category.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">
                          {fighter.displayName}
                        </h3>
                        
                        <p className="text-xs text-gray-300">
                          {fighter.description}
                        </p>
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
                {FIGHTERS.length} / {FIGHTERS.length}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4 max-w-md mx-auto">
                <div 
                  className="bg-gradient-to-r from-green-400 via-yellow-400 to-cyan-400 h-4 rounded-full transition-all"
                  style={{ width: `100%` }}
                />
              </div>
              <p className="text-gray-300 mt-4">
                All fighters are unlocked and ready.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
