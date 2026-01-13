import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { ArrowLeft, Lock, Zap, Shield, Flame, Wind, Sparkles, Crown, Swords, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FIGHTERS, Fighter, getFighterById } from "../../lib/characters";
import CharacterPreview3D from "./CharacterPreview3D";

// ⚡ LEGENDARY PARTICLES
function SelectParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#00FFFF', '#A855F7', '#3B82F6', '#10B981', '#FF6B6B'];
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF',
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `floatParticle ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// 🎮 FIGHTER CARD
function FighterCard({ 
  fighter, 
  selected, 
  locked, 
  onSelect, 
  onHover,
  onLeave,
}: { 
  fighter: Fighter; 
  selected: boolean; 
  locked: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-300 
        ${locked ? 'opacity-50 cursor-not-allowed' : ''}
        ${selected ? 'scale-105 z-10' : 'hover:scale-105 hover:z-10'}
        ${isPressed && !locked ? 'scale-95' : ''}
      `}
      onClick={() => !locked && onSelect()}
      onMouseEnter={() => !locked && onHover()}
      onMouseLeave={onLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* Card Container */}
      <div 
        className={`
          relative rounded-xl overflow-hidden
          border-3 transition-all duration-300
          ${selected 
            ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)]' 
            : 'border-white/20 hover:border-white/50'
          }
          ${locked ? 'grayscale' : ''}
        `}
        style={{
          background: selected 
            ? `linear-gradient(135deg, ${fighter.color}40, ${fighter.accentColor}40)`
            : 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(30,30,30,0.6))',
        }}
      >
        {/* Fighter Avatar */}
        <div className="relative p-3 sm:p-4">
          <div 
            className={`
              w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
              rounded-full mx-auto 
              flex items-center justify-center 
              shadow-xl
              transition-all duration-300
              ${selected ? 'scale-110' : ''}
            `}
            style={{ 
              background: `linear-gradient(135deg, ${fighter.color}, ${fighter.accentColor})`,
              boxShadow: selected 
                ? `0 0 40px ${fighter.accentColor}, inset 0 0 20px rgba(255,255,255,0.3)` 
                : `0 0 20px ${fighter.color}50`,
            }}
          >
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg">
              {fighter.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Lock Overlay */}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
              <div className="text-center">
                <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
                <span className="text-xs text-yellow-400 font-bold">
                  {fighter.unlockRequirement} PTS
                </span>
              </div>
            </div>
          )}
          
          {/* Selected Badge */}
          {selected && !locked && (
            <div 
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center animate-bounce"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 0 15px rgba(255,215,0,0.8)',
              }}
            >
              <span className="text-black font-black">✓</span>
            </div>
          )}
        </div>
        
        {/* Fighter Info */}
        <div className="p-2 sm:p-3 text-center bg-black/40">
          <h3 
            className={`font-bold text-sm sm:text-base truncate ${selected ? 'text-yellow-300' : 'text-white'}`}
          >
            {fighter.displayName}
          </h3>
          {!locked && (
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block truncate">
              {fighter.category.toUpperCase()}
            </p>
          )}
        </div>
        
        {/* Glow Effect */}
        {selected && (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
            style={{
              boxShadow: `inset 0 0 30px ${fighter.accentColor}50`,
            }}
          />
        )}
      </div>
    </div>
  );
}

// 📊 FIGHTER STATS
function FighterStats({ fighter }: { fighter: Fighter }) {
  const stats = {
    speed: fighter.id === 'speedy' ? 95 : fighter.id === 'jaxon' ? 85 : fighter.id === 'kaison' ? 88 : 70,
    power: fighter.id === 'kingspike' ? 95 : fighter.id === 'jaxon' ? 80 : 75,
    defense: fighter.id === 'novaknight' ? 90 : fighter.id === 'kingspike' ? 85 : 65,
    technique: fighter.id === 'kaison' ? 90 : fighter.id === 'flynn' ? 88 : 70,
  };

  const StatBar = ({ label, value, color, icon: Icon }: { 
    label: string; 
    value: number; 
    color: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }) => (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3" style={{ color }} />
          <span className="text-xs font-bold text-gray-300">{label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${value}%`, 
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 10px ${color}50`,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-black/40 rounded-lg p-3 mt-4">
      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        FIGHTER STATS
      </h4>
      <StatBar label="SPEED" value={stats.speed} color="#00FFFF" icon={Wind} />
      <StatBar label="POWER" value={stats.power} color="#FF6B6B" icon={Flame} />
      <StatBar label="DEFENSE" value={stats.defense} color="#10B981" icon={Shield} />
      <StatBar label="TECHNIQUE" value={stats.technique} color="#A855F7" icon={Star} />
    </div>
  );
}

// 🎮 MAIN CHARACTER SELECT
export default function CharacterSelect() {
  const { selectedCharacter, setCharacter, setGameState, stats } = useRunner();
  const { start } = useGame();
  const [hoveredFighter, setHoveredFighter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  
  const startGame = () => {
    if (!selectedCharacter) return;
    setIsStarting(true);
    setTimeout(() => {
      start();
      setGameState("playing");
    }, 500);
  };
  
  const goBack = () => {
    setGameState("menu");
  };
  
  const handleFighterSelect = (fighter: Fighter) => {
    if (isLocked(fighter)) return;
    setCharacter(fighter.id as any);
  };
  
  const isLocked = (fighter: Fighter): boolean => {
    return !fighter.unlocked && !!fighter.unlockRequirement && stats.score < fighter.unlockRequirement;
  };
  
  const categories = [
    { name: 'ALL', id: null, color: 'from-gray-500 to-gray-600', icon: Swords },
    { name: 'HEROES', id: 'heroes', color: 'from-blue-500 to-cyan-500', icon: Crown },
    { name: 'SPEEDSTERS', id: 'speedsters', color: 'from-yellow-500 to-orange-500', icon: Zap },
    { name: 'WARRIORS', id: 'warriors', color: 'from-green-500 to-emerald-500', icon: Shield },
    { name: 'LEGENDS', id: 'legends', color: 'from-purple-500 to-pink-500', icon: Star },
  ];
  
  const filteredFighters = categoryFilter 
    ? FIGHTERS.filter(f => f.category === categoryFilter)
    : FIGHTERS;
  
  const previewFighter = hoveredFighter 
    ? getFighterById(hoveredFighter) 
    : selectedCharacter 
      ? getFighterById(selectedCharacter)
      : FIGHTERS.find(f => f.unlocked);
  
  return (
    <div 
      className={`
        min-h-screen w-full p-2 sm:p-4 relative overflow-hidden
        transition-all duration-500
        ${isStarting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
      `}
      style={{
        background: `
          radial-gradient(ellipse at top left, rgba(59,130,246,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168,85,247,0.2) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a3e 100%)
        `,
      }}
    >
      {/* Particles */}
      <SelectParticles />
      
      {/* Header */}
      <div className="relative z-10 text-center mb-4 sm:mb-6">
        <button
          onClick={goBack}
          className="
            absolute left-2 top-0 
            flex items-center gap-2 
            px-4 py-2 rounded-lg
            bg-gradient-to-r from-red-600 to-red-500
            hover:from-red-500 hover:to-red-400
            text-white font-bold
            transition-all duration-300 hover:scale-105
            border border-red-400/50
          "
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">BACK</span>
        </button>
        
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-black"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF6B6B, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))',
          }}
        >
          CHOOSE YOUR FIGHTER
        </h1>
        <p className="text-cyan-400 text-lg mt-2 font-medium">
          {FIGHTERS.filter(f => !isLocked(f)).length} / {FIGHTERS.length} Fighters Unlocked
        </p>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Fighter Grid */}
        <div className="lg:col-span-2">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {categories.map(cat => (
              <button
                key={cat.id || 'all'}
                onClick={() => setCategoryFilter(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm
                  transition-all duration-300
                  ${categoryFilter === cat.id 
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105` 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }
                `}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
          
          {/* Fighter Grid */}
          <div 
            className="
              grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 
              gap-2 sm:gap-3 
              bg-black/30 backdrop-blur-sm 
              rounded-xl p-3 sm:p-4 
              border border-white/10
              max-h-[60vh] overflow-y-auto
            "
          >
            {filteredFighters.map(fighter => (
              <FighterCard
                key={fighter.id}
                fighter={fighter}
                selected={selectedCharacter === fighter.id}
                locked={isLocked(fighter)}
                onSelect={() => handleFighterSelect(fighter)}
                onHover={() => setHoveredFighter(fighter.id)}
                onLeave={() => setHoveredFighter(null)}
              />
            ))}
          </div>
          
          {/* Start Battle Button */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={startGame}
              disabled={!selectedCharacter}
              className={`
                relative px-12 py-4 sm:py-5 rounded-xl 
                font-black text-xl sm:text-2xl text-white
                transition-all duration-300
                ${selectedCharacter 
                  ? 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 hover:from-green-400 hover:via-yellow-400 hover:to-red-400 hover:scale-105 shadow-[0_0_40px_rgba(255,215,0,0.5)]' 
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
                }
                border-3 border-yellow-400
                overflow-hidden
              `}
            >
              {/* Shimmer */}
              {selectedCharacter && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Swords className="w-7 h-7" />
                START BATTLE!
                <Swords className="w-7 h-7" />
              </span>
            </button>
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div 
            className="
              bg-gradient-to-b from-black/60 to-black/80 
              backdrop-blur-xl rounded-xl 
              border-2 border-cyan-400/50
              overflow-hidden
              h-full min-h-[500px]
              shadow-[0_0_30px_rgba(0,255,255,0.2)]
            "
          >
            {/* Preview Header */}
            <div 
              className="p-4 border-b border-cyan-400/30 text-center"
              style={{
                background: previewFighter 
                  ? `linear-gradient(135deg, ${previewFighter.color}30, ${previewFighter.accentColor}30)`
                  : 'transparent',
              }}
            >
              <h2 className="text-2xl font-black text-white">
                {previewFighter?.displayName || 'SELECT FIGHTER'}
              </h2>
              {previewFighter && (
                <span 
                  className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: `linear-gradient(90deg, ${previewFighter.color}, ${previewFighter.accentColor})`,
                    color: 'white',
                  }}
                >
                  {previewFighter.category.toUpperCase()}
                </span>
              )}
            </div>
            
            {/* 3D Preview */}
            <div className="h-[300px] lg:h-[350px]">
              {previewFighter && <CharacterPreview3D fighter={previewFighter} />}
            </div>
            
            {/* Fighter Description & Stats */}
            {previewFighter && (
              <div className="p-4">
                <p className="text-gray-300 text-sm mb-3 text-center">
                  {previewFighter.description}
                </p>
                <FighterStats fighter={previewFighter} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 text-xs text-gray-500">
        <span>Click to select • Hover for preview • Unlock fighters by earning points!</span>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
