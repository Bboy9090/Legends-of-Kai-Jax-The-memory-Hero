import { useRunner } from "../../lib/stores/useRunner";
import { useChoices } from "../../lib/stores/useChoices";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Heart, Star } from "lucide-react";

export default function ChoiceMode() {
  const { currentChoice, resolveChoice } = useRunner();
  const { setCurrentScenario } = useChoices();
  
  if (!currentChoice) return null;
  
  const handleChoice = (choice: any) => {
    resolveChoice(choice.isKind);
    setCurrentScenario(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 p-4">
      <Card className="w-full max-w-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">
            A Citizen Needs Help!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Scenario Description */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-lg text-gray-800">
              {currentChoice.scenario}
            </p>
          </div>
          
          {/* Choice Instructions */}
          <div className="text-center">
            <p className="text-gray-600">
              What will you do? Your choice shows what kind of hero you are!
            </p>
          </div>
          
          {/* Choice Buttons */}
          <div className="space-y-3">
            {currentChoice.choices.map((choice: any, index: number) => (
              <Button
                key={index}
                onClick={() => handleChoice(choice)}
                className={`w-full p-4 h-auto text-left flex items-center gap-3 ${
                  choice.type === "heart" 
                    ? "bg-pink-500 hover:bg-pink-600 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <div className="flex-shrink-0">
                  {choice.type === "heart" ? (
                    <Heart className="w-8 h-8" />
                  ) : (
                    <Star className="w-8 h-8" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="text-lg font-semibold">
                    {choice.text}
                  </div>
                  <div className="text-sm opacity-90">
                    {choice.type === "heart" 
                      ? "Show kindness and empathy" 
                      : "Take brave action"
                    }
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          {/* Helper Text */}
          <div className="text-center text-sm text-gray-500">
            <p>
              <Heart className="w-4 h-4 inline mr-1 text-pink-500" />
              Heart choices show empathy and care
            </p>
            <p>
              <Star className="w-4 h-4 inline mr-1 text-blue-500" />
              Star choices show courage and leadership
            </p>
          </div>
          
          {/* Audio Support */}
          <div className="text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Simple text-to-speech for accessibility
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(currentChoice.scenario);
                  utterance.rate = 0.8;
                  speechSynthesis.speak(utterance);
                }
              }}
            >
              🔊 Read Aloud
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
