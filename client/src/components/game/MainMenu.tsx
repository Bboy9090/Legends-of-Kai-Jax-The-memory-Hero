import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Play, Settings, Volume2, VolumeX, Shirt } from "lucide-react";
import logoImage from "@assets/generated_images/bright_vibrant_nintendo_smash_heroes_logo.png";
import backgroundImage from "@assets/generated_images/bright_colorful_nintendo-style_futuristic_menu_background.png";

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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Bright overlay for menu card visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      {/* Animated neon elements */}
      <div className="absolute inset-0">
        {/* Floating colorful particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${30 + i * 20}px`,
              height: `${30 + i * 20}px`,
              background: ["#FF1493", "#00FF00", "#FFD700", "#00FFFF", "#FF6B35", "#4D5DFF", "#FFD700", "#00FF88"][i],
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
            src={logoImage} 
            alt="SMASH HEROES Logo" 
            className="max-w-sm w-full h-auto drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 30px rgba(255, 20, 147, 0.6)) drop-shadow(0 0 60px rgba(0, 255, 255, 0.4))"
            }}
          />
        </div>
        
        <Card className="bg-white bg-opacity-98 backdrop-blur-md shadow-2xl border-4 border-yellow-400">
          <CardHeader className="p-4 sm:p-8 bg-gradient-to-b from-yellow-200 to-white">
            <CardTitle className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 mb-3">
              SMASH HEROES
            </CardTitle>
            <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-lime-500">
              Adventures of Kaison & Jaxon
            </p>
            <p className="text-lg sm:text-xl text-green-600 font-bold mt-3">
              Hyper Files Rewrite
            </p>
            <p className="text-sm sm:text-base text-gray-700 mt-4">
              Battle epic heroes in wild arenas! Choose your fighter and become a legend!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-8 bg-gradient-to-b from-blue-50 to-white">
            {/* Character icons - VIBRANT */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center transform hover:scale-110 transition-transform">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-cyan-300">
                  <span className="text-white text-3xl font-black">J</span>
                </div>
                <p className="text-base font-bold text-cyan-600">JAXON</p>
                <p className="text-xs font-semibold text-cyan-500">Cyan Legend</p>
              </div>
              
              <div className="text-center transform hover:scale-110 transition-transform">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-red-300">
                  <span className="text-white text-3xl font-black">K</span>
                </div>
                <p className="text-base font-bold text-red-600">KAISON</p>
                <p className="text-xs font-semibold text-red-500">Crimson Hero</p>
              </div>
            </div>
            
            {/* Play button - NEON BRIGHT */}
            <Button 
              onClick={startGame}
              className="w-full text-2xl py-7 bg-gradient-to-r from-lime-400 via-yellow-400 to-orange-500 hover:from-lime-500 hover:via-yellow-500 hover:to-orange-600 text-black font-black shadow-xl border-4 border-yellow-300 transform hover:scale-105 transition-transform"
            >
              <Play className="w-7 h-7 mr-3" />
              START GAME!
            </Button>

            {/* Customize Characters button */}
            <Button 
              onClick={openCustomization}
              className="w-full text-xl py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-black shadow-xl border-2 border-purple-300 transform hover:scale-105 transition-transform"
            >
              <Shirt className="w-6 h-6 mr-2" />
              UNLOCK FIGHTERS
            </Button>
            
            {/* Settings */}
            <div className="flex gap-3">
              <Button
                onClick={toggleMute}
                className="flex-1 text-lg py-5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold shadow-lg border-2 border-cyan-300"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="ml-2">{isMuted ? "UNMUTE" : "MUTE"}</span>
              </Button>
              
              <Button 
                className="px-6 text-lg py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold shadow-lg border-2 border-yellow-300"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Game features - VIBRANT */}
            <div className="text-left text-sm font-bold text-gray-800 bg-gradient-to-r from-yellow-200 via-green-200 to-cyan-200 p-5 rounded-xl border-3 border-yellow-400 shadow-lg">
              <h4 className="text-lg font-black mb-3 text-purple-700">⚡ GAME FEATURES:</h4>
              <ul className="space-y-2">
                <li>✨ 13 LEGENDARY FIGHTERS!</li>
                <li>⚡ EPIC PUNCH, KICK & JUMP!</li>
                <li>🏆 BATTLE IN WILD ARENAS!</li>
                <li>🎮 EASY FOR ALL AGES!</li>
                <li>🌟 UNLOCK MORE HEROES!</li>
              </ul>
            </div>
            
            {/* Instructions */}
            <div className="text-sm font-bold text-white text-center bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg border-2 border-purple-400">
              <p>← ARROW KEYS or WASD → MOVE • SPACE JUMP • J PUNCH • K KICK</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
