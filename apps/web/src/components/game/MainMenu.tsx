import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Zap, Swords, Users, Trophy, Settings, Sparkles, Crown, Gamepad2, BookOpen } from "lucide-react";

// ⚡ LEGENDARY PARTICLE SYSTEM
function LegendaryParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#00FFFF', '#FF6B6B', '#A855F7', '#3B82F6', '#10B981'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 20 + 10,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF',
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `float ${p.speed}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          25% { transform: translateY(-20px) translateX(10px) scale(1.2); }
          50% { transform: translateY(-10px) translateX(-10px) scale(0.8); }
          75% { transform: translateY(-30px) translateX(5px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

// ⚡ LEGENDARY ENERGY RING
function EnergyRing({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping"
      style={{ 
        animationDuration: '3s',
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// 🔥 LEGENDARY LOGO COMPONENT
function LegendaryLogo() {
  const [glowIntensity, setGlowIntensity] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const glow = Math.sin(glowIntensity) * 0.5 + 0.5;

  return (
    <div className="relative flex flex-col items-center mb-8">
      {/* Energy Rings */}
      <div className="absolute w-80 h-80 -top-10">
        <EnergyRing delay={0} />
        <EnergyRing delay={1} />
        <EnergyRing delay={2} />
      </div>
      
      {/* Main Title */}
      <div className="relative z-10">
        <h1 
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter"
          style={{
            background: `linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #A855F7 50%, #3B82F6 75%, #00FFFF 100%)`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 ${20 + glow * 20}px rgba(168, 85, 247, ${0.5 + glow * 0.3}))`,
            textShadow: `0 0 40px rgba(168, 85, 247, 0.8)`,
          }}
        >
          SMASH
        </h1>
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-wider -mt-4"
          style={{
            background: `linear-gradient(135deg, #00FFFF 0%, #3B82F6 25%, #A855F7 50%, #FF6B6B 75%, #FFD700 100%)`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite reverse',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 ${15 + glow * 15}px rgba(0, 255, 255, ${0.5 + glow * 0.3}))`,
          }}
        >
          HEROES
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-1 w-12 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full" />
          <span 
            className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
            }}
          >
            ULTIMATE
          </span>
          <div className="h-1 w-12 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full" />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-cyan-300 mt-4 font-medium tracking-wide animate-pulse">
        ⚡ THE LEGENDARY TOURNAMENT AWAITS ⚡
      </p>

      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

// 🎮 LEGENDARY MENU BUTTON
function LegendaryButton({ 
  onClick, 
  children, 
  icon: Icon, 
  variant = 'primary',
  size = 'large',
  disabled = false,
}: { 
  onClick: () => void; 
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const variants = {
    primary: 'from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500',
    secondary: 'from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600',
    gold: 'from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400',
    danger: 'from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400',
  };

  const sizes = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6 text-base',
    large: 'py-4 px-8 text-xl',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-xl font-bold text-white
        transition-all duration-300 transform
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-1 active:scale-95'}
        bg-gradient-to-r ${variants[variant]}
        ${sizes[size]}
        shadow-lg hover:shadow-2xl
        border border-white/20
        group
      `}
      style={{
        boxShadow: isHovered 
          ? `0 0 40px rgba(168, 85, 247, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4)`
          : `0 10px 30px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: isHovered ? 'shimmer 1.5s infinite' : 'none',
        }}
      />
      
      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {Icon && <Icon className={`${size === 'large' ? 'w-7 h-7' : size === 'medium' ? 'w-5 h-5' : 'w-4 h-4'} ${isHovered ? 'animate-bounce' : ''}`} />}
        <span className="drop-shadow-lg">{children}</span>
      </div>

      {/* Glow Border */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)',
          }}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
}

// 🏆 CHARACTER PREVIEW ICONS
function CharacterPreviews() {
  const characters = [
    { name: 'Jaxon', color: '#DC143C', accent: '#FF4500', symbol: '🦔' },
    { name: 'Kaison', color: '#0066FF', accent: '#00E5FF', symbol: '🦊' },
    { name: 'Kai-Jax', color: '#FFD700', accent: '#A855F7', symbol: '⚡' },
  ];

  return (
    <div className="flex justify-center gap-6 mb-8">
      {characters.map((char, i) => (
        <div 
          key={char.name}
          className="relative group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-2"
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {/* Character Circle */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-4 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${char.color}, ${char.accent})`,
              borderColor: char.accent,
              boxShadow: `0 0 30px ${char.accent}50, inset 0 0 20px rgba(255,255,255,0.2)`,
            }}
          >
            {char.symbol}
          </div>
          
          {/* Character Name */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center">
            <span className="text-sm font-bold text-white drop-shadow-lg whitespace-nowrap">
              {char.name}
            </span>
          </div>

          {/* Glow Ring on Hover */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `0 0 40px ${char.accent}, 0 0 60px ${char.accent}50`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// 📊 STATS TICKER
function StatsTicker() {
  const stats = [
    { label: 'FIGHTERS', value: '12+', icon: Users },
    { label: 'ARENAS', value: '8', icon: Swords },
    { label: 'MISSIONS', value: '100+', icon: BookOpen },
    { label: 'COMBOS', value: '∞', icon: Zap },
  ];

  return (
    <div className="flex justify-center gap-4 sm:gap-8 mb-8">
      {stats.map((stat, i) => (
        <div 
          key={stat.label}
          className="text-center group"
          style={{ animation: `fadeInUp 0.5s ease forwards`, animationDelay: `${i * 0.1}s` }}
        >
          <stat.icon className="w-6 h-6 mx-auto text-cyan-400 mb-1 group-hover:text-yellow-400 transition-colors" />
          <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg group-hover:text-yellow-400 transition-colors">
            {stat.value}
          </div>
          <div className="text-xs text-gray-300 tracking-wider">{stat.label}</div>
        </div>
      ))}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// 🎮 MAIN MENU COMPONENT
export default function MainMenu() {
  const { setGameState } = useRunner();
  const { isMuted, toggleMute } = useAudio();
  const [showSettings, setShowSettings] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intro animation
  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`
        min-h-screen w-full flex flex-col items-center justify-center 
        relative overflow-hidden p-4 sm:p-6
        transition-opacity duration-1000
        ${introComplete ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        background: `
          radial-gradient(ellipse at top, #1a1a2e 0%, transparent 50%),
          radial-gradient(ellipse at bottom, #0f0f1a 0%, transparent 50%),
          linear-gradient(180deg, #0a0a15 0%, #1a0a2e 50%, #0a1a2e 100%)
        `,
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Particles */}
      <LegendaryParticles />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">
        
        {/* Logo */}
        <LegendaryLogo />

        {/* Character Previews */}
        <CharacterPreviews />

        {/* Stats */}
        <StatsTicker />

        {/* Main Menu Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-md mb-8">
          {/* Story Mode - Primary CTA */}
          <LegendaryButton 
            onClick={() => setGameState("story-mode-select")}
            icon={BookOpen}
            variant="gold"
          >
            STORY MODE
          </LegendaryButton>

          {/* Versus Mode */}
          <LegendaryButton 
            onClick={() => setGameState("versus-select")}
            icon={Swords}
            variant="primary"
          >
            VERSUS BATTLE
          </LegendaryButton>

          {/* Quick Battle */}
          <LegendaryButton 
            onClick={() => setGameState("character-select")}
            icon={Zap}
            variant="primary"
          >
            QUICK BATTLE
          </LegendaryButton>

          {/* Secondary Buttons Row */}
          <div className="flex gap-3 mt-2">
            <LegendaryButton 
              onClick={() => setGameState("customization")}
              icon={Crown}
              variant="secondary"
              size="medium"
            >
              FIGHTERS
            </LegendaryButton>

            <LegendaryButton 
              onClick={() => setGameState("nexus-haven")}
              icon={Sparkles}
              variant="secondary"
              size="medium"
            >
              HUB WORLD
            </LegendaryButton>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-gray-400" />
            ) : (
              <Volume2 className="w-6 h-6 text-cyan-400" />
            )}
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
          >
            <Settings className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
          </button>

          <button
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
          >
            <Gamepad2 className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Version & Copyright */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            v2.0 LEGENDARY EDITION • © 2024 SMASH HEROES ULTIMATE
          </p>
          <p className="text-xs text-gray-600 mt-1">
            "When two become one, the Memory Hero wakes."
          </p>
        </div>
      </div>

      {/* Keyboard Controls Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">WASD</kbd>
          Move
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">SPACE</kbd>
          Jump
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">J</kbd>
          Punch
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">K</kbd>
          Kick
        </span>
      </div>
    </div>
  );
}
