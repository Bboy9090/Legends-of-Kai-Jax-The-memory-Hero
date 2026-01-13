import { useEffect, useState, useRef } from "react";
import { useBattle } from "../../lib/stores/useBattle";

// ⚡ LEGENDARY SCREEN EFFECTS
// Handles screen shake, flashes, and visual juice for that AAA feel!

export default function ScreenEffects() {
  const { screenShake, screenFlash, hitStop, comboCount, playerHealth, maxHealth } = useBattle();
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [showComboFlash, setShowComboFlash] = useState(false);
  const [lowHealthPulse, setLowHealthPulse] = useState(false);
  const prevComboRef = useRef(0);
  
  // Screen shake effect
  useEffect(() => {
    if (screenShake <= 0) {
      setShakeOffset({ x: 0, y: 0 });
      return;
    }
    
    const interval = setInterval(() => {
      const intensity = screenShake;
      setShakeOffset({
        x: (Math.random() - 0.5) * intensity * 10,
        y: (Math.random() - 0.5) * intensity * 10,
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [screenShake]);
  
  // Screen flash effect
  useEffect(() => {
    if (screenFlash) {
      setFlashOpacity(0.8);
      const fadeOut = setInterval(() => {
        setFlashOpacity(prev => {
          if (prev <= 0.1) {
            clearInterval(fadeOut);
            return 0;
          }
          return prev - 0.1;
        });
      }, 30);
      
      return () => clearInterval(fadeOut);
    }
  }, [screenFlash]);
  
  // Combo flash on big combos
  useEffect(() => {
    if (comboCount > prevComboRef.current && comboCount >= 5 && comboCount % 5 === 0) {
      setShowComboFlash(true);
      setTimeout(() => setShowComboFlash(false), 300);
    }
    prevComboRef.current = comboCount;
  }, [comboCount]);
  
  // Low health pulse
  useEffect(() => {
    if (playerHealth <= maxHealth * 0.25 && playerHealth > 0) {
      setLowHealthPulse(true);
    } else {
      setLowHealthPulse(false);
    }
  }, [playerHealth, maxHealth]);
  
  return (
    <>
      {/* Screen Shake Container */}
      <div 
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        }}
      />
      
      {/* Screen Flash */}
      {flashOpacity > 0 && screenFlash && (
        <div 
          className="fixed inset-0 pointer-events-none z-[90]"
          style={{
            backgroundColor: screenFlash,
            opacity: flashOpacity,
            transition: 'opacity 0.05s ease-out',
          }}
        />
      )}
      
      {/* Combo Flash */}
      {showComboFlash && (
        <div 
          className="fixed inset-0 pointer-events-none z-[80]"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
            animation: 'comboFlash 0.3s ease-out',
          }}
        />
      )}
      
      {/* Low Health Vignette */}
      {lowHealthPulse && (
        <div 
          className="fixed inset-0 pointer-events-none z-[70] animate-pulse"
          style={{
            boxShadow: 'inset 0 0 100px 50px rgba(255, 0, 0, 0.4)',
          }}
        />
      )}
      
      {/* Hit Stop Overlay (brief freeze indicator) */}
      {hitStop > 0 && (
        <div 
          className="fixed inset-0 pointer-events-none z-[60]"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
      )}
      
      {/* Cinematic Bars for KO/Transformation */}
      <style>{`
        @keyframes comboFlash {
          0% { opacity: 0.8; transform: scale(0.8); }
          100% { opacity: 0; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}
