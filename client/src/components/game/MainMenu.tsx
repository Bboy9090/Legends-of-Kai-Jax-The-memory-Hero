import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Play, Settings, Volume2, VolumeX, Sparkles, Star, Swords, Users } from "lucide-react";
import { useState } from "react";

export default function MainMenu() {
  const { setGameState } = useRunner();
  const { isMuted, toggleMute } = useAudio();
  const [showNarration, setShowNarration] = useState(true);
  
  const startGame = () => {
    setGameState("character-select");
  };

  const openNexusHaven = () => {
    setGameState("nexus-haven");
  };

  const openStoryMode = () => {
    setGameState("story-mode-select");
  };

  const openVersusMode = () => {
    setGameState("versus-select");
  };

  const openFighters = () => {
    setGameState("character-select");
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background - Dark apocalyptic with fire/ice split */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, 
              rgba(139, 69, 19, 0.8) 0%, 
              rgba(0, 0, 0, 0.9) 50%, 
              rgba(30, 60, 114, 0.8) 100%
            ),
            radial-gradient(ellipse at 20% 30%, rgba(255, 100, 0, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 30%, rgba(0, 150, 255, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(255, 100, 0, 0.3) 0%, transparent 40%),
            linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%)
          `
        }}
      />
      
      {/* Fire particles left side */}
      <div className="absolute left-0 top-0 w-1/3 h-full pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={`fire-${i}`}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: `radial-gradient(circle, #ff6600 0%, #ff3300 50%, transparent 100%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.6 + Math.random() * 0.4,
              animationDuration: `${1 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 10px #ff6600'
            }}
          />
        ))}
      </div>
      
      {/* Lightning particles right side */}
      <div className="absolute right-0 top-0 w-1/3 h-full pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={`lightning-${i}`}
            className="absolute animate-pulse"
            style={{
              width: '2px',
              height: `${20 + Math.random() * 60}px`,
              background: `linear-gradient(to bottom, transparent, #00bfff, #ffffff, #00bfff, transparent)`,
              right: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4 + Math.random() * 0.6,
              animationDuration: `${0.5 + Math.random() * 1}s`,
              animationDelay: `${Math.random() * 3}s`,
              transform: `rotate(${-20 + Math.random() * 40}deg)`,
              boxShadow: '0 0 15px #00bfff'
            }}
          />
        ))}
      </div>
      
      {/* Pyraxis - Fire Tiger (top left) */}
      <div 
        className="absolute top-4 left-4 w-40 h-40 sm:w-56 sm:h-56 opacity-90"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,100,0,0.3) 0%, transparent 70%)',
          filter: 'drop-shadow(0 0 30px rgba(255,100,0,0.8))'
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-7xl sm:text-8xl">
          🐯
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-orange-400 font-black text-xs sm:text-sm tracking-widest" style={{textShadow: '0 0 10px #ff6600'}}>
            PYRAXIS
          </span>
        </div>
      </div>
      
      {/* Thryxen - Ice Lion (top right) */}
      <div 
        className="absolute top-4 right-4 w-40 h-40 sm:w-56 sm:h-56 opacity-90"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,150,255,0.3) 0%, transparent 70%)',
          filter: 'drop-shadow(0 0 30px rgba(0,150,255,0.8))'
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-7xl sm:text-8xl">
          🦁
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-cyan-400 font-black text-xs sm:text-sm tracking-widest" style={{textShadow: '0 0 10px #00bfff'}}>
            THRYXEN
          </span>
        </div>
      </div>
      
      {/* Mythic Opening Narration Overlay */}
      {showNarration && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-8 animate-in fade-in duration-1000">
          <div className="max-w-3xl text-center">
            <div className="mb-8 animate-in zoom-in duration-700">
              <Sparkles className="w-16 h-16 mx-auto text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-6 text-white animate-in slide-in-from-bottom duration-1000">
              <p className="text-lg sm:text-xl italic leading-relaxed text-orange-300">
                "It was not a sundering of one world, but of all."
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-gray-300">
                The Weave of Reality, the cosmic thread that bound every legend, every hero, 
                every kingdom into a chorus of light… has been silenced. In its place, a wound. A Void.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-gray-300">
                From that emptiness, the Echoes poured forth—twisted memories of fallen champions. 
                Worlds bled into one another. A throne of nothingness has risen.
              </p>
              <p className="text-lg sm:text-xl font-bold text-cyan-400 leading-relaxed">
                But even in the final dusk, there is a spark. A Nexus. A haven where the last true heroes gather.
              </p>
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-cyan-500 mt-8">
                Choose your hero. Build your squad. Become everything.
              </p>
            </div>
            <Button
              onClick={() => setShowNarration(false)}
              className="mt-12 px-8 py-6 text-xl font-black bg-gradient-to-r from-orange-600 to-cyan-600 hover:from-orange-700 hover:to-cyan-700 text-white border-2 border-white shadow-2xl"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
            >
              ENTER THE MULTIVERSE
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 w-full max-w-lg">
        
        {/* Title */}
        <div className="text-center mb-2">
          <p className="text-gray-400 text-sm tracking-[0.3em] mb-1">LEGENDS OF</p>
          <h1 
            className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(180deg, #e0e0e0 0%, #a0a0a0 50%, #606060 100%)',
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              letterSpacing: '0.05em',
              textShadow: '0 0 30px rgba(255,255,255,0.3)',
              WebkitTextStroke: '1px rgba(255,255,255,0.2)'
            }}
          >
            KAI-JAX
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <p 
              className="text-cyan-400 text-sm sm:text-base tracking-[0.2em] font-bold"
              style={{ textShadow: '0 0 10px rgba(0,191,255,0.5)' }}
            >
              THE MEMORY KING
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          </div>
          <p className="text-gray-500 text-xs mt-2 tracking-widest">
            Forged in the Raging City - Crowned by memory
          </p>
        </div>
        
        {/* Main Buttons */}
        <div className="w-full space-y-3 mt-6">
          {/* Story Mode */}
          <button
            onClick={openStoryMode}
            className="w-full relative group"
          >
            <div 
              className="w-full py-4 px-6 rounded-sm text-white font-bold text-lg tracking-wider flex items-center justify-center gap-3 transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
                fontFamily: "'Arial Black', 'Impact', sans-serif"
              }}
            >
              <Star className="w-5 h-5 text-cyan-400" />
              <span>STORY MODE</span>
              <Star className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
          </button>
          
          {/* Versus Mode */}
          <button
            onClick={openVersusMode}
            className="w-full relative group"
          >
            <div 
              className="w-full py-4 px-6 rounded-sm text-white font-bold text-lg tracking-wider flex items-center justify-center gap-3 transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
                fontFamily: "'Arial Black', 'Impact', sans-serif"
              }}
            >
              <Swords className="w-5 h-5 text-orange-400" />
              <span>VERSUS MODE</span>
              <Swords className="w-5 h-5 text-orange-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
          </button>
          
          {/* Quick Battle */}
          <button
            onClick={startGame}
            className="w-full relative group"
          >
            <div 
              className="w-full py-4 px-6 rounded-sm text-white font-bold text-lg tracking-wider flex items-center justify-center gap-3 transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
                fontFamily: "'Arial Black', 'Impact', sans-serif"
              }}
            >
              <Play className="w-5 h-5 text-gray-400" />
              <span>QUICK BATTLE</span>
              <Play className="w-5 h-5 text-gray-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
          </button>
        </div>
        
        {/* Side Options */}
        <div className="absolute left-4 bottom-1/4 space-y-4 text-left">
          <button 
            onClick={openFighters}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <Star className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold tracking-wider" style={{fontFamily: "'Arial Black', 'Impact', sans-serif"}}>FIGHTERS</span>
          </button>
          <button 
            onClick={toggleMute}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <Star className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-bold tracking-wider" style={{fontFamily: "'Arial Black', 'Impact', sans-serif"}}>SETTINGS</span>
          </button>
          <button 
            onClick={openNexusHaven}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span className="text-xs tracking-wider">EVERYTHING ELSE</span>
          </button>
        </div>
        
        {/* Kai-Jax Fusion at bottom */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255,100,0,0.5)) drop-shadow(0 -10px 30px rgba(0,150,255,0.3))'
          }}
        >
          <div className="text-6xl sm:text-7xl">
            🐺
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span 
              className="text-xs font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-cyan-500"
              style={{fontFamily: "'Arial Black', 'Impact', sans-serif"}}
            >
              KAI-JAX
            </span>
          </div>
        </div>
        
        {/* Controls hint */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-gray-600 text-xs tracking-wider">
            WASD MOVE • SPACE JUMP • J PUNCH • K KICK
          </p>
        </div>
      </div>
    </div>
  );
}
