import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Zap, Flame } from "lucide-react";

export default function CharacterSelect() {
  const { selectedCharacter, setCharacter, setGameState } = useRunner();
  const { start } = useGame();
  
  const startGame = () => {
    console.log("Starting game with character:", selectedCharacter);
    start(); // First change phase to "playing"
    setGameState("playing"); // Then set game state to "playing"
  };
  
  const goBack = () => {
    setGameState("menu");
  };
  
  const characters = [
    {
      id: "jaxon" as const,
      name: "Hyper Sonic Jaxon",
      description: "The energetic twin with lightning-fast reflexes",
      color: "bg-blue-500",
      accent: "text-blue-600",
      icon: Zap,
      traits: ["Quick thinking", "High energy", "Impulsive but brave"],
      power: "Lightning Speed"
    },
    {
      id: "kaison" as const,
      name: "Super Sonic Kaison",
      description: "The strategic twin with solar-powered strength",
      color: "bg-red-500",
      accent: "text-red-600",
      icon: Flame,
      traits: ["Strategic mind", "Thoughtful planning", "Steady and reliable"],
      power: "Solar Energy"
    }
  ];
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-purple-400 via-pink-400 to-red-400 p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white bg-opacity-95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center relative">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                console.log("Back button clicked");
                goBack();
              }}
              className="absolute top-4 left-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <CardTitle className="text-3xl font-bold text-gray-900">
              Choose Your Hero
            </CardTitle>
            <p className="text-gray-600">
              Select which twin hero you want to play as in your kindness quest!
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {characters.map((character) => (
                <Card 
                  key={character.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCharacter === character.id 
                      ? 'ring-4 ring-yellow-400 bg-yellow-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Character selected:", character.id);
                    setCharacter(character.id);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    {/* Character Avatar */}
                    <div className={`w-24 h-24 ${character.color} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                      <character.icon className="w-12 h-12 text-white" />
                    </div>
                    
                    {/* Character Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {character.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {character.description}
                    </p>
                    
                    {/* Character Power */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${character.accent} bg-gray-100`}>
                        {character.power}
                      </span>
                    </div>
                    
                    {/* Character Traits */}
                    <div className="text-left">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Special Traits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {character.traits.map((trait, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                            {trait}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedCharacter === character.id && (
                      <div className="mt-4 p-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold">
                        ✓ Selected
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Character Preview */}
            <div className="text-center mb-6">
              <Card className="bg-gray-50 p-4 inline-block">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${
                    selectedCharacter === "jaxon" ? "bg-blue-500" : "bg-red-500"
                  } flex items-center justify-center`}>
                    <span className="text-white text-2xl font-bold">
                      {selectedCharacter === "jaxon" ? "J" : "K"}
                    </span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">
                      {selectedCharacter === "jaxon" ? "Hyper Sonic Jaxon" : "Super Sonic Kaison"}
                    </h4>
                    <p className="text-sm text-gray-600">Ready for adventure!</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Start Game Button */}
            <div className="text-center">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Start Running clicked!");
                  startGame();
                }}
                className="w-full max-w-md text-xl py-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold"
              >
                Start Running!
              </Button>
            </div>
            
            {/* Game Info */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Both heroes have the same abilities - choose based on who you like more!</p>
              <p className="mt-2">Your hero will help citizens and battle Grumble-Bots throughout Aurelia City.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
