import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Play, Settings, Volume2, VolumeX, MessageCircle, Shirt } from "lucide-react";

export default function MainMenu() {
  const { setGameState } = useRunner();
  const { isMuted, toggleMute } = useAudio();
  
  const startGame = () => {
    setGameState("character-select");
  };

  const openAIAssistant = () => {
    setGameState("ai-assistant");
  };
  
  const openCustomization = () => {
    setGameState("customization");
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating clouds */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white bg-opacity-20 rounded-full animate-pulse"
            style={{
              width: `${100 + i * 30}px`,
              height: `${60 + i * 18}px`,
              left: `${i * 20 + 10}%`,
              top: `${i * 15 + 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
        
        {/* City silhouette */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-800 to-transparent" />
      </div>
      
      {/* Main menu content */}
      <div className="relative z-10 text-center max-w-md mx-4">
        <Card className="bg-white bg-opacity-95 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
              Hyper Sonic Heroes
            </CardTitle>
            <p className="text-xl text-blue-600 font-semibold">
              Kindness Quest
            </p>
            <p className="text-gray-600 mt-2">
              Race through the city and show that kindness is the greatest superpower!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Character icons */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">J</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Jaxon</p>
                <p className="text-xs text-gray-500">Electric Blue</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">K</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Kaison</p>
                <p className="text-xs text-gray-500">Solar Red</p>
              </div>
            </div>
            
            {/* Play button */}
            <Button 
              onClick={startGame}
              className="w-full text-xl py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Adventure
            </Button>

            {/* Customize Characters button */}
            <Button 
              onClick={openCustomization}
              className="w-full text-lg py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold"
            >
              <Shirt className="w-5 h-5 mr-2" />
              Customize Heroes
            </Button>
            
            {/* AI Assistant button */}
            <Button 
              onClick={openAIAssistant}
              className="w-full text-lg py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Assistant
            </Button>
            
            {/* Settings */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={toggleMute}
                className="flex-1"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="ml-2">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              
              <Button variant="outline" className="px-4">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Game features */}
            <div className="text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Game Features:</h4>
              <ul className="space-y-1">
                <li>• Fast-paced endless running action</li>
                <li>• Battle Grumble-Bots throughout the city</li>
                <li>• Make kindness choices to help citizens</li>
                <li>• Collect coins and help tokens</li>
                <li>• Mobile-optimized touch controls</li>
              </ul>
            </div>
            
            {/* Instructions */}
            <div className="text-xs text-gray-500 text-center">
              <p>Tap to jump • Swipe down to slide • Swipe left/right to change lanes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
