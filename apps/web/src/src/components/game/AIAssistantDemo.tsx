import { AIAssistant } from "../ui/ai-assistant";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useRunner } from "../../lib/stores/useRunner";

export default function AIAssistantDemo() {
  const { setGameState } = useRunner();

  const goBackToMenu = () => {
    setGameState("menu");
  };

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              onClick={goBackToMenu}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Assistant Demo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Connect and chat with your AI assistant, get text summaries, and analyze sentiment
          </p>
        </div>
        <AIAssistant />
      </div>
    </div>
  );
}