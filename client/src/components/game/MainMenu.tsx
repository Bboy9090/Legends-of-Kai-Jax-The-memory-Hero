import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Play, Settings, Volume2, VolumeX, Shirt, Sparkles, Zap, Gamepad2, Swords, Brain, Crown, Shield } from "lucide-react";
import { useState, useMemo } from "react";

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

  const openCustomization = () => {
    setGameState("customization");
  };

  const openStoryMode = () => {
    setGameState("story-mode-select");
  };

  const openGameModes = () => {
    setGameState("game-modes-menu");
  };

  const openVersusMode = () => {
    setGameState("versus-select");
  };

  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      size: 4 + (i * 0.4),
      color: ["#FFD700", "#9333EA", "#06B6D4", "#EC4899", "#10B981"][i % 5],
      left: (i * 5) % 100,
      top: (i * 7 + 10) % 100,
      opacity: 0.4 + (i % 5) * 0.1,
      delay: i * 0.2,
      duration: 2 + (i % 4)
    })), []
  );

  const streams = useMemo(() => 
    [...Array(5)].map((_, i) => ({
      top: 20 + i * 15,
      duration: 3 + i
    })), []
  );
  
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative p-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0d1f3c 50%, #1a0a2e 75%, #0a0a1a 100%)"
      }}
    >
      {/* Animated memory particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: `0 0 ${10 + i * 2}px currentColor`
            }}
          />
        ))}
      </div>

      {/* Memory stream effect - horizontal lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {streams.map((s, i) => (
          <div
            key={`stream-${i}`}
            className="absolute h-px w-full"
            style={{
              top: `${s.top}%`,
              background: "linear-gradient(90deg, transparent, #FFD700, #9333EA, transparent)",
              animation: `shimmer ${s.duration}s infinite linear`
            }}
          />
        ))}
      </div>

      {/* Mythic Opening Narration Overlay */}
      {showNarration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{
            background: "radial-gradient(ellipse at center, rgba(26, 10, 46, 0.98) 0%, rgba(10, 10, 26, 0.99) 100%)"
          }}
        >
          <div className="max-w-3xl text-center">
            {/* Memory Crown Icon */}
            <div className="mb-6 sm:mb-8 relative">
              <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-purple-400" 
                style={{ filter: "drop-shadow(0 0 20px #9333EA)" }} 
              />
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-yellow-400"
                style={{ filter: "drop-shadow(0 0 10px #FFD700)" }}
              />
            </div>
            
            <div className="space-y-4 sm:space-y-6 text-white">
              <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text"
                style={{ 
                  backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
                  textShadow: "0 0 30px rgba(255, 215, 0, 0.5)"
                }}
              >
                LEGENDS OF KAI-JAX
              </h2>
              
              <p className="text-base sm:text-xl italic leading-relaxed text-purple-200">
                "In the realm where memories become power, one hero rises..."
              </p>
              
              <p className="text-sm sm:text-lg leading-relaxed text-gray-300">
                KAI-JAX, the Memory King, holds dominion over forgotten realms. His mind contains 
                the echoes of a thousand fallen champions. Each memory a weapon. Each thought a shield.
              </p>
              
              <p className="text-sm sm:text-lg leading-relaxed text-gray-300">
                The Aeterna Covenant has shattered. Voidonus Imperion awakens from his eternal slumber.
                Only those who can master the Resonance transformations will survive.
              </p>
              
              <p className="text-lg sm:text-2xl font-black mt-6 sm:mt-8"
                style={{
                  background: "linear-gradient(90deg, #06B6D4, #9333EA, #EC4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Unlock your memories. Claim your legacy. Become the hero.
              </p>
            </div>
            
            <Button
              onClick={() => setShowNarration(false)}
              className="mt-8 sm:mt-12 px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-black text-white border-2"
              style={{ 
                background: "linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6D28D9 100%)",
                borderColor: "#FFD700",
                boxShadow: "0 0 30px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.1)"
              }}
            >
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              AWAKEN THE MEMORIES
            </Button>
          </div>
        </div>
      )}
      
      {/* Main menu content */}
      <div className="relative z-10 text-center w-full max-w-lg px-2">
        {/* Game Title */}
        <div className="mb-6 sm:mb-10">
          <div className="relative inline-block">
            <Brain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-purple-400"
              style={{ filter: "drop-shadow(0 0 20px #9333EA)" }}
            />
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3 leading-tight"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 30%, #FFD700 50%, #FFEC8B 70%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(255, 215, 0, 0.4)"
            }}
          >
            LEGENDS OF KAI-JAX
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(90deg, #06B6D4, #9333EA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            The Memory Hero
          </p>
          
          <p className="text-xs sm:text-sm text-purple-300 font-semibold tracking-widest">
            GENESIS SAGA - BOOK I
          </p>
        </div>

        {/* Main Menu Card */}
        <div className="rounded-2xl p-4 sm:p-6 border-2"
          style={{
            background: "linear-gradient(180deg, rgba(26, 10, 46, 0.95) 0%, rgba(13, 31, 60, 0.95) 100%)",
            borderColor: "rgba(147, 51, 234, 0.5)",
            boxShadow: "0 0 40px rgba(147, 51, 234, 0.2), inset 0 0 60px rgba(6, 182, 212, 0.05)"
          }}
        >
          {/* Hero Icons */}
          <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div className="text-center transform hover:scale-110 transition-transform cursor-pointer">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 flex items-center justify-center border-3"
                style={{
                  background: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
                  borderColor: "#FFD700",
                  boxShadow: "0 0 20px rgba(147, 51, 234, 0.6)"
                }}
              >
                <Brain className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
              </div>
              <p className="text-sm sm:text-base font-black text-purple-300">KAI-JAX</p>
              <p className="text-xs text-yellow-400">Memory King</p>
            </div>
            
            <div className="text-center transform hover:scale-110 transition-transform cursor-pointer">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 flex items-center justify-center border-3"
                style={{
                  background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
                  borderColor: "#FFD700",
                  boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)"
                }}
              >
                <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
              </div>
              <p className="text-sm sm:text-base font-black text-cyan-300">BORYX</p>
              <p className="text-xs text-yellow-400">Guardian King</p>
            </div>
          </div>
          
          {/* Menu Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* Nexus Haven - Primary */}
            <Button 
              onClick={openNexusHaven}
              className="w-full text-base sm:text-xl py-4 sm:py-6 font-black text-white border-2 transform hover:scale-105 transition-all"
              style={{ 
                background: "linear-gradient(90deg, #9333EA 0%, #7C3AED 50%, #6D28D9 100%)",
                borderColor: "#FFD700",
                boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)"
              }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              NEXUS HAVEN
            </Button>

            {/* Story Mode */}
            <Button 
              onClick={openStoryMode}
              className="w-full text-base sm:text-lg py-4 sm:py-5 font-black text-white border transform hover:scale-105 transition-all"
              style={{ 
                background: "linear-gradient(90deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)",
                borderColor: "rgba(255, 255, 255, 0.3)"
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              STORY MODE - 9 ACTS
            </Button>

            {/* Game Modes */}
            <Button 
              onClick={openGameModes}
              className="w-full text-base sm:text-lg py-4 sm:py-5 font-black text-white border transform hover:scale-105 transition-all"
              style={{ 
                background: "linear-gradient(90deg, #0891B2 0%, #0E7490 50%, #155E75 100%)",
                borderColor: "rgba(255, 255, 255, 0.3)"
              }}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              GAME MODES - 12 ADVENTURES
            </Button>

            {/* Versus Mode */}
            <Button 
              onClick={openVersusMode}
              className="w-full text-base sm:text-lg py-4 sm:py-5 font-black text-white border transform hover:scale-105 transition-all"
              style={{ 
                background: "linear-gradient(90deg, #CA8A04 0%, #A16207 50%, #854D0E 100%)",
                borderColor: "rgba(255, 255, 255, 0.3)"
              }}
            >
              <Swords className="w-5 h-5 mr-2" />
              VERSUS MODE - 59 HEROES
            </Button>

            {/* Quick Battle */}
            <Button 
              onClick={startGame}
              className="w-full text-sm sm:text-base py-3 sm:py-4 font-bold text-white border transform hover:scale-105 transition-all"
              style={{ 
                background: "linear-gradient(90deg, #4B5563 0%, #374151 50%, #1F2937 100%)",
                borderColor: "rgba(147, 51, 234, 0.5)"
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              QUICK BATTLE
            </Button>

            {/* Customize */}
            <Button 
              onClick={openCustomization}
              className="w-full text-xs sm:text-sm py-3 font-semibold text-gray-300 border transform hover:scale-105 transition-all"
              style={{ 
                background: "rgba(31, 41, 55, 0.8)",
                borderColor: "rgba(107, 114, 128, 0.5)"
              }}
            >
              <Shirt className="w-4 h-4 mr-2" />
              CUSTOMIZE FIGHTERS
            </Button>
            
            {/* Settings Row */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={toggleMute}
                className="flex-1 py-3 sm:py-4 font-bold text-white"
                style={{ 
                  background: "rgba(55, 65, 81, 0.8)",
                  borderColor: "rgba(107, 114, 128, 0.5)"
                }}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="ml-2 text-sm">{isMuted ? "UNMUTE" : "MUTE"}</span>
              </Button>
              
              <Button 
                className="px-4 sm:px-6 py-3 sm:py-4"
                style={{ 
                  background: "rgba(55, 65, 81, 0.8)",
                  borderColor: "rgba(107, 114, 128, 0.5)"
                }}
              >
                <Settings className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
          
          {/* Game Features */}
          <div className="mt-6 p-3 sm:p-4 rounded-xl text-left text-xs sm:text-sm"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(147, 51, 234, 0.3)"
            }}
          >
            <h4 className="font-black text-purple-300 mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              GENESIS FEATURES
            </h4>
            <ul className="space-y-1 text-gray-300">
              <li>59 LEGENDARY BEAST-KIN WARRIORS</li>
              <li>RESONANCE TRANSFORMATIONS</li>
              <li>4-HERO SQUAD SYSTEM</li>
              <li>EPIC BOSS BATTLES</li>
            </ul>
          </div>
          
          {/* Controls */}
          <div className="mt-4 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-center"
            style={{
              background: "linear-gradient(90deg, rgba(147, 51, 234, 0.3), rgba(6, 182, 212, 0.3))",
              color: "#E5E7EB"
            }}
          >
            WASD MOVE • SPACE JUMP • J ATTACK • K SPECIAL
          </div>
        </div>
        
        {/* Copyright */}
        <p className="mt-4 sm:mt-6 text-xs text-gray-500">
          BEAST-KIN SOVEREIGNTY: GENESIS™ - Original IP
        </p>
      </div>
    </div>
  );
}
