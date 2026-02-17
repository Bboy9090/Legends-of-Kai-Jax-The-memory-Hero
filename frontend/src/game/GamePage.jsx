import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Loader2 } from 'lucide-react';

// Lazy load the heavy game component
const Game = lazy(() => import('./Game'));

// Loading screen while game loads
const GameLoadingScreen = () => (
  <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
    <div className="text-center">
      <Gamepad2 className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
      <h1 className="text-4xl font-black text-white mb-2">LOADING</h1>
      <p className="text-white/60 mb-8">Initializing Ironvein Wards...</p>
      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
    </div>
    
    <div className="absolute bottom-8 text-white/30 text-sm">
      <p>Loading 3D models and physics engine...</p>
    </div>
  </div>
);

// Error boundary for game crashes
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-black text-red-500 mb-4">MEMORY CORRUPTED</h1>
            <p className="text-white/60 mb-6">
              The game encountered an error. This might be due to WebGL compatibility or memory constraints.
            </p>
            <pre className="text-xs text-red-400 bg-red-500/10 p-4 rounded mb-6 overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="block w-full px-6 py-3 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform"
              >
                TRY AGAIN
              </button>
              <Link
                to="/"
                className="block w-full px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-center"
              >
                RETURN TO HUB
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Game Page Component
const GamePage = () => {
  return (
    <div className="relative">
      {/* Back button overlay */}
      <Link 
        to="/"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/60 rounded-lg text-white/80 hover:text-white hover:bg-black/80 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">EXIT GAME</span>
      </Link>

      {/* Game container */}
      <GameErrorBoundary>
        <Suspense fallback={<GameLoadingScreen />}>
          <Game />
        </Suspense>
      </GameErrorBoundary>
    </div>
  );
};

export default GamePage;
