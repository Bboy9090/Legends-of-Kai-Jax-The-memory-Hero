import { useMemo } from "react";
import { useRunner } from "../../lib/stores/useRunner";
import { FIGHTERS } from "../../lib/characters";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowLeft, Lock, Brain, Crown, Shield, Zap } from "lucide-react";

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

  const particles = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      size: 3 + (i % 4) * 1.2,
      color: ["#FFD700", "#9333EA", "#06B6D4"][i % 3],
      left: (i * 8 + 5) % 100,
      top: (i * 11 + 3) % 100,
      delay: i * 0.2,
      duration: 2 + (i % 3)
    })), []
  );
  
  const categories = [
    { name: 'Memory Masters', id: 'heroes' as const, color: 'from-purple-500 to-violet-600', icon: Brain },
    { name: 'Velocity Warriors', id: 'speedsters' as const, color: 'from-cyan-500 to-blue-600', icon: Zap },
    { name: 'Guardian Kings', id: 'warriors' as const, color: 'from-emerald-500 to-green-600', icon: Shield },
    { name: 'Legendary Beasts', id: 'legends' as const, color: 'from-yellow-500 to-orange-600', icon: Crown }
  ];
  
  return (
    <div 
      className="min-h-screen w-full text-white overflow-auto"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0d1f3c 50%, #1a0a2e 75%, #0a0a1a 100%)"
      }}
    >
      {/* Animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: 0.3,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b-2 p-4 sm:p-6"
        style={{
          background: "linear-gradient(180deg, rgba(10, 10, 26, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)",
          borderColor: "rgba(147, 51, 234, 0.5)"
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Beast-Kin Collection
            </h1>
            <p className="text-sm sm:text-base mt-1"
              style={{
                background: "linear-gradient(90deg, #06B6D4, #9333EA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Memory Points: <span className="font-bold">{stats.score}</span>
            </p>
          </div>
          <Button
            onClick={() => setGameState('menu')}
            className="font-bold text-white border"
            style={{
              background: "linear-gradient(90deg, #9333EA, #7C3AED)",
              borderColor: "rgba(255, 215, 0, 0.5)"
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-8 relative z-10">
        {/* Fighter Categories */}
        {categories.map(category => {
          const categoryFighters = FIGHTERS.filter(f => f.category === category.id);
          const CategoryIcon = category.icon;
          
          return (
            <div key={category.id} className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4">
                <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8"
                  style={{ 
                    color: category.color.includes('purple') ? '#A855F7' : 
                           category.color.includes('cyan') ? '#06B6D4' :
                           category.color.includes('emerald') ? '#10B981' : '#F59E0B'
                  }}
                />
                <h2 className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                  {category.name}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {categoryFighters.map(fighter => {
                  const unlocked = isUnlocked(fighter);
                  
                  return (
                    <Card
                      key={fighter.id}
                      className={`border-2 transition-all duration-300 ${
                        unlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60'
                      }`}
                      style={{ 
                        background: unlocked 
                          ? "linear-gradient(180deg, rgba(26, 10, 46, 0.9) 0%, rgba(13, 31, 60, 0.9) 100%)"
                          : "rgba(31, 41, 55, 0.5)",
                        borderColor: unlocked ? fighter.accentColor : "rgba(107, 114, 128, 0.5)"
                      }}
                    >
                      <CardContent className="p-3 sm:p-4 text-center">
                        <div 
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center relative"
                          style={{ 
                            backgroundColor: fighter.color,
                            boxShadow: unlocked ? `0 0 20px ${fighter.accentColor}` : 'none'
                          }}
                        >
                          <span className="text-2xl sm:text-4xl font-black text-white">
                            {fighter.name.charAt(0).toUpperCase()}
                          </span>
                          
                          {!unlocked && (
                            <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-sm sm:text-base font-black text-white mb-1 truncate">
                          {fighter.displayName}
                        </h3>
                        
                        {unlocked ? (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {fighter.description}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <p className="text-xs font-bold"
                              style={{ color: "#FFD700" }}
                            >
                              {fighter.unlockRequirement} pts
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Need {Math.max(0, (fighter.unlockRequirement || 0) - stats.score)} more
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
        <Card className="border-2 mt-8"
          style={{
            background: "linear-gradient(180deg, rgba(26, 10, 46, 0.95) 0%, rgba(13, 31, 60, 0.95) 100%)",
            borderColor: "#FFD700"
          }}
        >
          <CardContent className="p-6 sm:p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                <h3 className="text-xl sm:text-2xl font-black"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Beast-Kin Unlocked
                </h3>
              </div>
              
              <p className="text-4xl sm:text-5xl font-black text-white mb-4">
                {FIGHTERS.filter(isUnlocked).length} / {FIGHTERS.length}
              </p>
              
              <div className="w-full max-w-md mx-auto h-4 rounded-full overflow-hidden"
                style={{ background: "rgba(55, 65, 81, 0.8)" }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(FIGHTERS.filter(isUnlocked).length / FIGHTERS.length) * 100}%`,
                    background: "linear-gradient(90deg, #9333EA, #06B6D4, #FFD700)"
                  }}
                />
              </div>
              
              <p className="text-sm sm:text-base text-gray-300 mt-4">
                Win battles and complete story missions to earn Memory Points!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
