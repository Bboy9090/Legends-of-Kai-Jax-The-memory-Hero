import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface VirtualJoystickProps {
  onMove?: (x: number, y: number) => void;
  onButton?: (button: 'A' | 'B' | 'X' | 'Y' | 'L' | 'R') => void;
  className?: string;
  disabled?: boolean;
}

interface TouchState {
  identifier: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onButton,
  className = '',
  disabled = false,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickTouch, setJoystickTouch] = useState<TouchState | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !joystickRef.current) return;

    Array.from(e.changedTouches).forEach((touch) => {
      const rect = joystickRef.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

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
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!joystickTouch) return;

    Array.from(e.changedTouches).forEach((touch) => {
      if (touch.identifier === joystickTouch.identifier) {
        const deltaX = touch.clientX - joystickTouch.startX;
        const deltaY = touch.clientY - joystickTouch.startY;
        
        const maxDistance = 50;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 0) {
          const clampedDistance = Math.min(distance, maxDistance);
          const normalizedX = (deltaX / distance) * (clampedDistance / maxDistance);
          const normalizedY = (deltaY / distance) * (clampedDistance / maxDistance);

          setJoystickTouch({
            ...joystickTouch,
            currentX: touch.clientX,
            currentY: touch.clientY,
          });

          onMove?.(normalizedX, normalizedY);
        }
      }
    });
  }, [joystickTouch, onMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!joystickTouch) return;

    Array.from(e.changedTouches).forEach((touch) => {
      if (touch.identifier === joystickTouch.identifier) {
        setJoystickTouch(null);
        onMove?.(0, 0);
      }
    });
  }, [joystickTouch, onMove]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const joystickPosition = joystickTouch
    ? {
        x: Math.max(-50, Math.min(50, joystickTouch.currentX - joystickTouch.startX)),
        y: Math.max(-50, Math.min(50, joystickTouch.currentY - joystickTouch.startY)),
      }
    : { x: 0, y: 0 };

  if (disabled) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-32 h-32 bg-gray-800/50 rounded-full border-4 border-gray-600/50 backdrop-blur-sm"
        >
          <div
            className="absolute w-12 h-12 bg-blue-500/80 rounded-full top-1/2 left-1/2 shadow-lg shadow-blue-500/30 transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <div className="relative w-48 h-48">
          <button
            onTouchStart={() => onButton?.('A')}
            className="absolute bottom-12 right-0 w-16 h-16 bg-green-500/80 rounded-full font-bold text-white text-xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform"
          >
            A
          </button>
          
          <button
            onTouchStart={() => onButton?.('B')}
            className="absolute bottom-0 right-12 w-16 h-16 bg-red-500/80 rounded-full font-bold text-white text-xl shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
          >
            B
          </button>
          
          <button
            onTouchStart={() => onButton?.('X')}
            className="absolute bottom-24 right-16 w-14 h-14 bg-blue-500/80 rounded-full font-bold text-white text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
          >
            X
          </button>
          
          <button
            onTouchStart={() => onButton?.('Y')}
            className="absolute top-0 right-20 w-14 h-14 bg-yellow-500/80 rounded-full font-bold text-white text-lg shadow-lg shadow-yellow-500/30 active:scale-95 transition-transform"
          >
            Y
          </button>
          
          <button
            onTouchStart={() => onButton?.('L')}
            className="absolute top-8 right-0 w-12 h-12 bg-purple-500/80 rounded-full font-bold text-white text-sm shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
          >
            L
          </button>
          
          <button
            onTouchStart={() => onButton?.('R')}
            className="absolute bottom-0 right-32 w-12 h-12 bg-orange-500/80 rounded-full font-bold text-white text-sm shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
          >
            R
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
