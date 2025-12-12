import React, { useEffect, useRef, useState } from 'react';

export interface VirtualJoystickProps {
  onMove?: (x: number, y: number) => void;
  onButton?: (button: 'A' | 'B' | 'X' | 'Y' | 'L' | 'R') => void;
  className?: string;
}

interface TouchState {
  identifier: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/**
 * VirtualJoystick - Mobile touch controls for fighting game
 * Left side: Directional joystick
 * Right side: Action buttons (Light, Heavy, Special, etc.)
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onButton,
  className = '',
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickTouch, setJoystickTouch] = useState<TouchState | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!joystickRef.current) return;

      Array.from(e.changedTouches).forEach((touch) => {
        const rect = joystickRef.current!.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Check if touch is on joystick area (left side of screen)
        if (touch.clientX < window.innerWidth / 2) {
          setJoystickTouch({
            identifier: touch.identifier,
            startX: centerX,
            startY: centerY,
            currentX: touch.clientX,
            currentY: touch.clientY,
          });
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickTouch) return;

      Array.from(e.changedTouches).forEach((touch) => {
        if (touch.identifier === joystickTouch.identifier) {
          const deltaX = touch.clientX - joystickTouch.startX;
          const deltaY = touch.clientY - joystickTouch.startY;
          
          // Normalize to -1 to 1 range with max distance of 50px
          const maxDistance = 50;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const clampedDistance = Math.min(distance, maxDistance);
          const normalizedX = (deltaX / maxDistance) * (clampedDistance / distance);
          const normalizedY = (deltaY / maxDistance) * (clampedDistance / distance);

          setJoystickTouch({
            ...joystickTouch,
            currentX: touch.clientX,
            currentY: touch.clientY,
          });

          onMove?.(normalizedX, normalizedY);
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!joystickTouch) return;

      Array.from(e.changedTouches).forEach((touch) => {
        if (touch.identifier === joystickTouch.identifier) {
          setJoystickTouch(null);
          onMove?.(0, 0);
        }
      });
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [joystickTouch, onMove]);

  const joystickPosition = joystickTouch
    ? {
        x: joystickTouch.currentX - joystickTouch.startX,
        y: joystickTouch.currentY - joystickTouch.startY,
      }
    : { x: 0, y: 0 };

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {/* Joystick */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-32 h-32 bg-gray-800/50 rounded-full border-4 border-gray-600/50"
        >
          <div
            className="absolute w-12 h-12 bg-blue-500/80 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform"
            style={{
              transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <div className="relative w-48 h-48">
          {/* Light Attack (A) */}
          <button
            onTouchStart={() => onButton?.('A')}
            className="absolute bottom-12 right-0 w-16 h-16 bg-green-500/80 rounded-full font-bold text-white text-xl shadow-lg active:scale-95 transition-transform"
          >
            A
          </button>
          
          {/* Heavy Attack (B) */}
          <button
            onTouchStart={() => onButton?.('B')}
            className="absolute bottom-0 right-12 w-16 h-16 bg-red-500/80 rounded-full font-bold text-white text-xl shadow-lg active:scale-95 transition-transform"
          >
            B
          </button>
          
          {/* Special (X) */}
          <button
            onTouchStart={() => onButton?.('X')}
            className="absolute bottom-24 right-16 w-14 h-14 bg-blue-500/80 rounded-full font-bold text-white text-lg shadow-lg active:scale-95 transition-transform"
          >
            X
          </button>
          
          {/* Jump (Y) */}
          <button
            onTouchStart={() => onButton?.('Y')}
            className="absolute top-0 right-20 w-14 h-14 bg-yellow-500/80 rounded-full font-bold text-white text-lg shadow-lg active:scale-95 transition-transform"
          >
            Y
          </button>
          
          {/* Shield/Block (L) */}
          <button
            onTouchStart={() => onButton?.('L')}
            className="absolute top-8 right-0 w-12 h-12 bg-purple-500/80 rounded-full font-bold text-white text-sm shadow-lg active:scale-95 transition-transform"
          >
            L
          </button>
          
          {/* Grab (R) */}
          <button
            onTouchStart={() => onButton?.('R')}
            className="absolute bottom-0 right-32 w-12 h-12 bg-orange-500/80 rounded-full font-bold text-white text-sm shadow-lg active:scale-95 transition-transform"
          >
            R
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
