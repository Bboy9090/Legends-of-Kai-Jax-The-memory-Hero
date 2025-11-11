import { useState, useEffect } from "react";
import { useBattle } from "../../lib/stores/useBattle";

type Orientation = 'portrait' | 'landscape';

export default function MobileControls() {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());
  const { playerJump, playerAttack, movePlayer, battlePhase } = useBattle();
  
  // Detect orientation (MUST be before early return to follow Rules of Hooks)
  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  // Only show controls during active fighting (AFTER all hooks)
  if (battlePhase !== 'fighting') {
    return null;
  }

  const handleButtonPress = (action: string) => {
    setActiveButtons(prev => new Set(prev).add(action));
    
    switch(action) {
      case 'left':
        // Move left with continuous velocity
        movePlayer(-5, 0);
        break;
      case 'right':
        // Move right with continuous velocity
        movePlayer(5, 0);
        break;
      case 'jump':
        playerJump();
        break;
      case 'punch':
        playerAttack('punch');
        break;
      case 'kick':
        playerAttack('kick');
        break;
      case 'special':
        playerAttack('special');
        break;
    }
  };

  const handleButtonRelease = (action: string) => {
    setActiveButtons(prev => {
      const newSet = new Set(prev);
      newSet.delete(action);
      return newSet;
    });
    
    if (action === 'left' || action === 'right') {
      movePlayer(0, 0);
    }
  };

  const isActive = (button: string) => activeButtons.has(button);

  const buttonClass = (button: string, baseColor: string) => `
    ${baseColor}
    ${isActive(button) ? 'scale-95 opacity-80' : 'scale-100'}
    font-bold text-white rounded-full shadow-lg 
    active:scale-95 active:opacity-80
    transition-all duration-100
    flex items-center justify-center
    border-4 border-white/30
    select-none
    touch-none
  `;

  // Portrait Layout - buttons stacked
  if (orientation === 'portrait') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Left side - Movement */}
        <div className="absolute left-4 bottom-4 flex flex-col gap-2 pointer-events-auto">
          {/* Jump Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('jump'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('jump'); }}
            className={buttonClass('jump', 'bg-blue-500 w-20 h-20')}
          >
            <span className="text-2xl">⬆️</span>
          </button>
          
          {/* Left/Right Movement */}
          <div className="flex gap-2">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleButtonPress('left'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('left'); }}
              className={buttonClass('left', 'bg-gray-600 w-20 h-20')}
            >
              <span className="text-2xl">⬅️</span>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleButtonPress('right'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('right'); }}
              className={buttonClass('right', 'bg-gray-600 w-20 h-20')}
            >
              <span className="text-2xl">➡️</span>
            </button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-3 pointer-events-auto">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('special'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('special'); }}
            className={buttonClass('special', 'bg-purple-500 w-20 h-20')}
          >
            <div className="text-center">
              <div className="text-2xl">⚡</div>
              <div className="text-xs">SPECIAL</div>
            </div>
          </button>
          
          <div className="flex gap-3">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleButtonPress('punch'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('punch'); }}
              className={buttonClass('punch', 'bg-red-500 w-20 h-20')}
            >
              <div className="text-center">
                <div className="text-2xl">👊</div>
                <div className="text-xs">PUNCH</div>
              </div>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleButtonPress('kick'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('kick'); }}
              className={buttonClass('kick', 'bg-orange-500 w-20 h-20')}
            >
              <div className="text-center">
                <div className="text-2xl">🦶</div>
                <div className="text-xs">KICK</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landscape Layout - buttons on sides
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Left side - Movement Controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Jump */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleButtonPress('jump'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('jump'); }}
          className={buttonClass('jump', 'bg-blue-500 w-16 h-16')}
        >
          <span className="text-xl">⬆️</span>
        </button>
        
        {/* D-Pad */}
        <div className="flex gap-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('left'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('left'); }}
            className={buttonClass('left', 'bg-gray-600 w-16 h-16')}
          >
            <span className="text-xl">⬅️</span>
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('right'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('right'); }}
            className={buttonClass('right', 'bg-gray-600 w-16 h-16')}
          >
            <span className="text-xl">➡️</span>
          </button>
        </div>
      </div>

      {/* Right side - Action Buttons */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2 pointer-events-auto">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleButtonPress('punch'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('punch'); }}
          className={buttonClass('punch', 'bg-red-500 w-16 h-16')}
        >
          <div className="text-center">
            <div className="text-lg">👊</div>
            <div className="text-xs">PUNCH</div>
          </div>
        </button>
        
        <button
          onTouchStart={(e) => { e.preventDefault(); handleButtonPress('kick'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('kick'); }}
          className={buttonClass('kick', 'bg-orange-500 w-16 h-16')}
        >
          <div className="text-center">
            <div className="text-lg">🦶</div>
            <div className="text-xs">KICK</div>
          </div>
        </button>
        
        <button
          onTouchStart={(e) => { e.preventDefault(); handleButtonPress('special'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('special'); }}
          className={buttonClass('special', 'bg-purple-500 w-16 h-16 col-span-2')}
        >
          <div className="text-center">
            <div className="text-lg">⚡</div>
            <div className="text-xs">SPECIAL</div>
          </div>
        </button>
      </div>
    </div>
  );
}
