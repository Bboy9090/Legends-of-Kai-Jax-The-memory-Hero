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
  dash = 'dash',
  webSwing = 'webSwing', // Hold to attach web, release to launch
  chargeKick = 'chargeKick', // Hold to charge kick while web-swinging
  transform = 'transform', // Activate transformation
  energyBlast = 'energyBlast' // Fire energy blast (Jaxon only)
}

export default function TouchControls() {
  const { 
    movePlayer, 
    jumpPlayer, 
    slidePlayer, 
    attackEnemy, 
    dashPlayer, 
    gameState,
    player,
    setWebButtonPressed,
    chargeWebKick,
    releaseWebKick,
    transformHero,
    fireEnergyBlast
  } = useRunner();
  const [, get] = useKeyboardControls<Controls>();
  const touchManagerRef = useRef<TouchManager | null>(null);
  const kickChargeInterval = useRef<NodeJS.Timeout | null>(null);
  
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
    let lastWebState = false;
    let lastChargeState = false;
    
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
      
      // Web-Swinging Controls (hold-based)
      if (controls.webSwing !== lastWebState) {
        setWebButtonPressed(controls.webSwing);
        lastWebState = controls.webSwing;
        console.log("Web button:", controls.webSwing ? "PRESSED" : "RELEASED");
      }
      
      // Charged Kick Controls (hold while web-swinging)
      if (controls.chargeKick && player.webAttached) {
        if (!lastChargeState) {
          // Start charging
          kickChargeInterval.current = setInterval(() => {
            chargeWebKick(0.016); // ~60fps delta
          }, 16);
          lastChargeState = true;
          console.log("Started charging web kick!");
        }
      } else if (lastChargeState) {
        // Release kick
        if (kickChargeInterval.current) {
          clearInterval(kickChargeInterval.current);
          kickChargeInterval.current = null;
        }
        if (player.kickChargeTimer > 0) {
          releaseWebKick();
          console.log("Released web kick!");
        }
        lastChargeState = false;
      }
      
      // Transformation Control (press to activate)
      if (controls.transform && player.energyMeter >= 100 && player.powerLevel === 0) {
        transformHero();
        console.log("Transformation activated!");
      }
      
      // Energy Blast Control (Jaxon only)
      if (controls.energyBlast && !player.isAttacking) {
        // Fire in direction based on mouse or default forward
        fireEnergyBlast([1, 0]); // Forward direction
        console.log("Energy blast fired!");
      }
    };
    
    const interval = setInterval(handleKeyboardControls, 16); // ~60fps
    
    return () => {
      clearInterval(interval);
      if (kickChargeInterval.current) {
        clearInterval(kickChargeInterval.current);
      }
    };
  }, [gameState, player.webAttached, player.kickChargeTimer, player.energyMeter, player.powerLevel, player.isAttacking]);
  
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
