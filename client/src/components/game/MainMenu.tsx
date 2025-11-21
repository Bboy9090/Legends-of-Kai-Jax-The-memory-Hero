import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Play, Settings, Volume2, VolumeX, Shirt } from "lucide-react";

export default function MainMenu() {
  const { setGameState } = useRunner();
  const { isMuted, toggleMute } = useAudio();
  
  const startGame = () => {
    setGameState("character-select");
  };

  const openCustomization = () => {
    setGameState("customization");
  };
  
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative p-4 overflow-hidden"
      style={{
        backgroundImage: "url(/menu-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay for menu card visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      
      {/* Animated energy elements - RED, BLUE, SILVER, WHITE */}
      <div className="absolute inset-0">
        {/* Floating energy particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${30 + i * 20}px`,
              height: `${30 + i * 20}px`,
              background: ["#DC143C", "#1E90FF", "#C0C0C0", "#FFFFFF", "#FF0000", "#4169E1", "#D3D3D3", "#00BFFF"][i],
              opacity: 0.15,
              left: `${i * 12.5 + 5}%`,
              top: `${Math.sin(i) * 20 + 40}%`,
              filter: "blur(2px)",
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>
      
      {/* Main menu content */}
      <div className="relative z-10 text-center max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logo.png" 
            alt="SMASH HEROES Logo" 
            className="max-w-md w-full h-auto drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 30px rgba(220, 20, 60, 0.8)) drop-shadow(0 0 60px rgba(30, 144, 255, 0.6))"
            }}
          />
        </div>
        
        <Card className="bg-white bg-opacity-98 backdrop-blur-md shadow-2xl border-4 border-blue-500">
          <CardHeader className="p-4 sm:p-8 bg-gradient-to-b from-slate-100 to-white">
            <CardTitle 
              className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-600 to-slate-800 mb-3"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif", letterSpacing: '0.05em' }}
            >
              SMASH HEROES
            </CardTitle>
            <p 
              className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-700"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
            >
              Adventures of Kaison & Jaxon
            </p>
            <p 
              className="text-lg sm:text-xl text-red-600 font-bold mt-3"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
            >
              HYPER FILES REWRITE
            </p>
            <p className="text-sm sm:text-base text-gray-700 mt-4">
              Battle epic heroes in wild arenas! Choose your fighter and become a legend!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-8 bg-gradient-to-b from-slate-50 to-white">
            {/* Character icons - RED, BLUE, SILVER */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center transform hover:scale-110 transition-transform">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-700 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-blue-400">
                  <span className="text-white text-3xl font-black" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>J</span>
                </div>
                <p className="text-base font-bold text-blue-700" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>JAXON</p>
                <p className="text-xs font-semibold text-blue-500">Electric Hero</p>
              </div>
              
              <div className="text-center transform hover:scale-110 transition-transform">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-red-400">
                  <span className="text-white text-3xl font-black" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>K</span>
                </div>
                <p className="text-base font-bold text-red-700" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>KAISON</p>
                <p className="text-xs font-semibold text-red-500">Crimson Legend</p>
              </div>
            </div>
            
            {/* Play button - RED TO BLUE */}
            <Button 
              onClick={startGame}
              className="w-full text-2xl py-7 bg-gradient-to-r from-red-600 via-blue-600 to-blue-700 hover:from-red-700 hover:via-blue-700 hover:to-blue-800 text-white font-black shadow-xl border-4 border-white transform hover:scale-105 transition-transform"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif", letterSpacing: '0.1em' }}
            >
              <Play className="w-7 h-7 mr-3" />
              START GAME!
            </Button>

            {/* Customize Characters button - SILVER TO BLUE */}
            <Button 
              onClick={openCustomization}
              className="w-full text-xl py-6 bg-gradient-to-r from-slate-400 via-blue-500 to-blue-600 hover:from-slate-500 hover:via-blue-600 hover:to-blue-700 text-white font-black shadow-xl border-3 border-slate-300 transform hover:scale-105 transition-transform"
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
            >
              <Shirt className="w-6 h-6 mr-2" />
              UNLOCK FIGHTERS
            </Button>
            
            {/* Settings - RED AND BLUE */}
            <div className="flex gap-3">
              <Button
                onClick={toggleMute}
                className="flex-1 text-lg py-5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold shadow-lg border-2 border-blue-300"
                style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="ml-2">{isMuted ? "UNMUTE" : "MUTE"}</span>
              </Button>
              
              <Button 
                className="px-6 text-lg py-5 bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white font-bold shadow-lg border-2 border-slate-300"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Game features - RED, BLUE, SILVER */}
            <div className="text-left text-sm font-bold text-gray-800 bg-gradient-to-r from-red-100 via-slate-100 to-blue-100 p-5 rounded-xl border-3 border-blue-400 shadow-lg">
              <h4 className="text-lg font-black mb-3 text-red-700" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>⚡ GAME FEATURES:</h4>
              <ul className="space-y-2">
                <li>✨ 13 LEGENDARY FIGHTERS!</li>
                <li>⚡ EPIC PUNCH, KICK & JUMP!</li>
                <li>🏆 BATTLE IN WILD ARENAS!</li>
                <li>🎮 EASY FOR ALL AGES!</li>
                <li>🌟 UNLOCK MORE HEROES!</li>
              </ul>
            </div>
            
            {/* Instructions - BLUE TO RED */}
            <div className="text-sm font-bold text-white text-center bg-gradient-to-r from-blue-700 via-blue-800 to-red-700 p-4 rounded-lg border-2 border-white shadow-lg">
              <p style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>← ARROW KEYS or WASD → MOVE • SPACE JUMP • J PUNCH • K KICK</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
