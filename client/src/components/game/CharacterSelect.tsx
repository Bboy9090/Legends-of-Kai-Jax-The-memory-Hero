import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { ArrowLeft, Lock, Zap, Crown, Flame, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { FIGHTERS, Fighter, getFighterById } from "../../lib/characters";
import { getBioForHero } from "../../lib/characterBios";
import CharacterPreview3D from "./CharacterPreview3D";

const particlePositions = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37 + 13) % 100,
  top: (i * 23 + 7) % 100,
  opacity: 0.3 + ((i * 17) % 40) / 100,
  delay: (i * 11) % 30 / 10,
  duration: 2 + ((i * 13) % 20) / 10
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particlePositions.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}

export default function CharacterSelect() {
  const { selectedCharacter, setCharacter, setGameState, stats } = useRunner();
  const { start } = useGame();
  const [hoveredFighter, setHoveredFighter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const startGame = () => {
    console.log("Starting battle with fighter:", selectedCharacter);
    start();
    setGameState("playing");
  };
  
  const goBack = () => {
    setGameState("menu");
  };
  
  const handleFighterSelect = (fighter: Fighter) => {
    if (!fighter.unlocked && fighter.unlockRequirement && stats.score < fighter.unlockRequirement) {
      return;
    }
    setCharacter(fighter.id as any);
  };
  
  const isLocked = (fighter: Fighter) => {
    return !fighter.unlocked && fighter.unlockRequirement && stats.score < fighter.unlockRequirement;
  };
  
  const categories = [
    { name: 'ALL', id: 'all', color: '#ffffff' },
    { name: 'HEROES', id: 'heroes', color: '#00bfff' },
    { name: 'SPEEDSTERS', id: 'speedsters', color: '#ff6600' },
    { name: 'WARRIORS', id: 'warriors', color: '#00ff88' },
    { name: 'LEGENDS', id: 'legends', color: '#ff00ff' }
  ];
  
  const filteredFighters = useMemo(() => {
    if (selectedCategory === 'all') return FIGHTERS;
    return FIGHTERS.filter(f => f.category === selectedCategory);
  }, [selectedCategory]);
  
  const previewFighter = hoveredFighter 
    ? getFighterById(hoveredFighter) 
    : selectedCharacter 
      ? getFighterById(selectedCharacter)
      : FIGHTERS.find(f => f.unlocked);

  const previewBio = previewFighter ? getBioForHero(previewFighter.id) : null;
  
  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(20,10,30,0.95) 0%, rgba(10,20,40,0.95) 100%),
          url(/kai-jax-fusion.png)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      
      <ParticleField />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-cyan-500/20">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider">BACK</span>
          </button>
          
          <div className="text-center">
            <h1 
              className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-cyan-500"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
            >
              SELECT YOUR FIGHTER
            </h1>
            <p className="text-gray-500 text-xs tracking-widest mt-1">
              SECTOR-7 • RAGING CITY ARENA
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-cyan-400 font-bold text-sm">
              {FIGHTERS.filter(f => !isLocked(f)).length}/{FIGHTERS.length}
            </p>
            <p className="text-gray-500 text-xs">UNLOCKED</p>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
          <div className="lg:w-2/3 flex flex-col">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-sm text-xs font-bold tracking-wider whitespace-nowrap transition-all ${
                    selectedCategory === cat.id 
                      ? 'text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    background: selectedCategory === cat.id 
                      ? `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}88 100%)`
                      : 'rgba(30,30,30,0.8)',
                    border: `1px solid ${selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            
            <div 
              className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 overflow-y-auto max-h-[400px] lg:max-h-[500px] p-2 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(0,191,255,0.2)'
              }}
            >
              {filteredFighters.map(fighter => {
                const locked = isLocked(fighter);
                const selected = selectedCharacter === fighter.id;
                const hovered = hoveredFighter === fighter.id;
                
                return (
                  <button
                    key={fighter.id}
                    onClick={() => !locked && handleFighterSelect(fighter)}
                    onMouseEnter={() => !locked && setHoveredFighter(fighter.id)}
                    onMouseLeave={() => setHoveredFighter(null)}
                    disabled={!!locked}
                    className={`relative aspect-square rounded-sm overflow-hidden transition-all duration-200 ${
                      locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    } ${selected ? 'ring-2 ring-cyan-400' : ''}`}
                    style={{
                      background: hovered || selected
                        ? `linear-gradient(135deg, ${fighter.color}44 0%, rgba(0,0,0,0.9) 100%)`
                        : 'linear-gradient(135deg, rgba(40,40,40,0.8) 0%, rgba(20,20,20,0.9) 100%)',
                      border: selected 
                        ? `2px solid ${fighter.accentColor}` 
                        : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: selected ? `0 0 20px ${fighter.accentColor}44` : 'none'
                    }}
                  >
                    <div 
                      className="absolute inset-2 rounded-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle, ${fighter.color}88 0%, ${fighter.color}22 100%)`
                      }}
                    >
                      <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                        {fighter.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {locked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    
                    {selected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                      <p className="text-white text-[10px] font-bold truncate text-center">
                        {fighter.displayName.split(' ')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4">
              <button
                onClick={startGame}
                disabled={!selectedCharacter}
                className={`w-full py-4 rounded-sm text-lg font-black tracking-wider transition-all ${
                  selectedCharacter 
                    ? 'hover:scale-[1.02] active:scale-[0.98]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  background: selectedCharacter 
                    ? 'linear-gradient(90deg, #ff6600 0%, #00bfff 100%)'
                    : 'linear-gradient(90deg, #333 0%, #222 100%)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: selectedCharacter ? '0 0 30px rgba(255,100,0,0.3), 0 0 60px rgba(0,191,255,0.2)' : 'none',
                  fontFamily: "'Arial Black', 'Impact', sans-serif"
                }}
              >
                <Star className="inline w-5 h-5 mr-2" />
                ENTER THE ARENA
                <Star className="inline w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/3 flex flex-col gap-4">
            <div 
              className="rounded-lg overflow-hidden h-64 lg:h-80"
              style={{
                background: 'linear-gradient(135deg, rgba(20,20,40,0.9) 0%, rgba(10,10,20,0.95) 100%)',
                border: '1px solid rgba(0,191,255,0.3)',
                boxShadow: '0 0 30px rgba(0,191,255,0.1)'
              }}
            >
              {previewFighter ? (
                <CharacterPreview3D fighter={previewFighter} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Select a fighter
                </div>
              )}
            </div>
            
            {previewFighter && (
              <div 
                className="flex-1 p-4 rounded-lg overflow-y-auto max-h-[300px]"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${previewFighter.color} 0%, ${previewFighter.color}88 100%)`,
                      boxShadow: `0 0 15px ${previewFighter.accentColor}88`
                    }}
                  >
                    <span className="text-xl font-black text-white">
                      {previewFighter.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {previewFighter.displayName}
                    </h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {previewFighter.category}
                    </p>
                  </div>
                </div>
                
                {previewBio && (
                  <div className="space-y-3 text-xs">
                    <p className="text-cyan-300 italic">"{previewBio.title}"</p>
                    <p className="text-gray-300 leading-relaxed">{previewBio.shortBio}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-900/30 p-2 rounded">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-400 font-bold">SPECIALTY</span>
                        </div>
                        <p className="text-white">{previewBio.specialty}</p>
                      </div>
                      <div className="bg-purple-900/30 p-2 rounded">
                        <div className="flex items-center gap-1 mb-1">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-400 font-bold">ULTIMATE</span>
                        </div>
                        <p className="text-white">{previewBio.ultimateAttack}</p>
                      </div>
                    </div>
                    
                    <div className="bg-orange-900/30 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400 font-bold">BATTLE CRY</span>
                      </div>
                      <p className="text-white italic">
                        "{previewBio.battleQuotes[0]}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <footer className="p-4 border-t border-cyan-500/20 text-center">
          <p className="text-gray-600 text-xs tracking-wider">
            WASD MOVE • SPACE JUMP • J PUNCH • K KICK • L SPECIAL
          </p>
        </footer>
      </div>
    </div>
  );
}
