import { useEffect, useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useRunner } from "../../lib/stores/useRunner";
import { TouchManager, hapticFeedback, isTouchDevice } from "../../lib/touchUtils";

enum Controls {
  jump = 'jump',
  slide = 'slide',
  left = 'left',
  right = 'right',
  pause = 'pause',
  punch = 'punch',
  kick = 'kick',
  special = 'special',
  dash = 'dash'
}

export default function TouchControls() {
  const { movePlayer, jumpPlayer, slidePlayer, attackEnemy, dashPlayer, gameState } = useRunner();
  const [, get] = useKeyboardControls<Controls>();
  const touchManagerRef = useRef<TouchManager | null>(null);
  
  // Handle touch gestures
  const handleTap = () => {
    if (gameState === "playing") {
      jumpPlayer();
      hapticFeedback('light');
    }
  };
  
  const handleSwipe = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== "playing") return;
    
    switch (direction) {
      case 'up':
        jumpPlayer();
        hapticFeedback('medium');
        break;
      case 'down':
        slidePlayer();
        hapticFeedback('medium');
        break;
      case 'left':
        movePlayer('left');
        hapticFeedback('light');
        break;
      case 'right':
        movePlayer('right');
        hapticFeedback('light');
        break;
    }
  };
  
  // Initialize touch manager
  useEffect(() => {
    if (isTouchDevice()) {
      touchManagerRef.current = new TouchManager(handleTap, handleSwipe);
      
      const element = document.body;
      element.addEventListener('touchstart', touchManagerRef.current.handleTouchStart, { passive: false });
      element.addEventListener('touchend', touchManagerRef.current.handleTouchEnd, { passive: false });
      element.addEventListener('touchmove', touchManagerRef.current.handleTouchMove, { passive: false });
      
      return () => {
        if (touchManagerRef.current) {
          element.removeEventListener('touchstart', touchManagerRef.current.handleTouchStart);
          element.removeEventListener('touchend', touchManagerRef.current.handleTouchEnd);
          element.removeEventListener('touchmove', touchManagerRef.current.handleTouchMove);
        }
      };
    }
  }, [gameState]);
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyboardControls = () => {
      if (gameState !== "playing") return;
      
      const controls = get();
      
      if (controls.jump) {
        jumpPlayer();
      }
      if (controls.slide) {
        slidePlayer();
      }
      if (controls.left) {
        movePlayer('left');
      }
      if (controls.right) {
        movePlayer('right');
      }
      
      // Combat Controls
      if (controls.punch) {
        attackEnemy('punch');
      }
      if (controls.kick) {
        attackEnemy('kick');
      }
      if (controls.special) {
        attackEnemy('special');
      }
      if (controls.dash) {
        dashPlayer();
      }
    };
    
    const interval = setInterval(handleKeyboardControls, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [gameState]); // Removed dependencies that cause unnecessary re-renders
  
  // Touch control UI for mobile devices
  if (!isTouchDevice() || gameState !== "playing") {
    return null;
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Invisible touch areas for better control */}
      <div className="absolute top-0 left-0 w-full h-1/3 pointer-events-auto" 
           onTouchStart={(e) => { e.preventDefault(); jumpPlayer(); hapticFeedback('light'); }} />
      
      <div className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-auto"
           onTouchStart={(e) => { e.preventDefault(); slidePlayer(); hapticFeedback('medium'); }} />
      
      <div className="absolute top-1/3 left-0 w-1/2 h-1/3 pointer-events-auto"
           onTouchStart={(e) => { e.preventDefault(); movePlayer('left'); hapticFeedback('light'); }} />
      
      <div className="absolute top-1/3 right-0 w-1/2 h-1/3 pointer-events-auto"
           onTouchStart={(e) => { e.preventDefault(); movePlayer('right'); hapticFeedback('light'); }} />
      
      {/* Visual hints */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold bg-black bg-opacity-50 px-3 py-1 rounded-full">
        TAP TO JUMP
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold bg-black bg-opacity-50 px-3 py-1 rounded-full">
        SWIPE DOWN TO SLIDE
      </div>
      
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded-full rotate-90">
        ← SWIPE
      </div>
      
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded-full rotate-90">
        SWIPE →
      </div>
    </div>
  );
}
