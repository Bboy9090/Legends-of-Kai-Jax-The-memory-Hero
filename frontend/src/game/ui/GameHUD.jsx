import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { Zap, Flame, Wind, Shield, Heart, Battery, Swords } from 'lucide-react';

// Health Bar Component
const HealthBar = ({ current, max, color = '#FF3B30' }) => {
  const percent = (current / max) * 100;
  
  return (
    <div className="relative w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/20">
      <div 
        className="h-full transition-all duration-300 ease-out"
        style={{ 
          width: `${percent}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
        {current} / {max}
      </div>
    </div>
  );
};

// Tail Ability Button
const TailAbility = ({ tailId, tail, cooldown, isEquipped, onUse }) => {
  const isOnCooldown = cooldown > 0;
  
  const icons = {
    4: <Wind className="w-6 h-6" />,
    5: <Flame className="w-6 h-6" />,
    6: <Zap className="w-6 h-6" />,
  };

  return (
    <button
      onClick={() => !isOnCooldown && onUse(tailId)}
      disabled={isOnCooldown}
      className={`
        relative w-16 h-16 rounded-xl border-2 transition-all duration-200
        flex flex-col items-center justify-center gap-1
        ${isEquipped 
          ? 'border-white/60 bg-white/10' 
          : 'border-white/20 bg-black/40'}
        ${isOnCooldown 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 hover:border-white/80 cursor-pointer'}
      `}
      style={{ 
        boxShadow: isEquipped ? `0 0 15px ${tail.color}40` : 'none',
      }}
    >
      <div style={{ color: tail.color }}>
        {icons[tailId]}
      </div>
      <span className="text-[10px] text-white/60 font-bold">{tailId}</span>
      
      {/* Cooldown overlay */}
      {isOnCooldown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <span className="text-lg font-bold text-white">{Math.ceil(cooldown)}</span>
        </div>
      )}
      
      {/* Keybind hint */}
      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/80 border border-white/30 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{tailId - 3}</span>
      </div>
    </button>
  );
};

// Combo Counter
const ComboCounter = ({ combo }) => {
  if (combo < 2) return null;
  
  return (
    <div className="absolute top-1/3 right-8 animate-pulse">
      <div className="text-6xl font-black text-white drop-shadow-lg" style={{
        textShadow: '0 0 20px #FFD60A, 0 0 40px #FF3B30',
      }}>
        {combo}x
      </div>
      <div className="text-lg font-bold text-primary text-center">COMBO</div>
    </div>
  );
};

// Damage Indicator
const DamageIndicator = ({ damage, position }) => {
  return (
    <div 
      className="absolute text-2xl font-black text-red-500 animate-bounce"
      style={{ 
        left: position.x, 
        top: position.y,
        animation: 'float-up 1s ease-out forwards',
      }}
    >
      -{damage}
    </div>
  );
};

// Main Game HUD
export const GameHUD = () => {
  const { 
    player, 
    tails, 
    tailData, 
    combat,
    gameState,
    memoryFragments,
    useTailAbility,
    setGameState,
  } = useGameStore();

  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="text-center">
          <h1 className="text-6xl font-black text-white mb-2" style={{
            textShadow: '0 0 30px #FFD60A',
          }}>
            LEGENDS OF KAI-JAX
          </h1>
          <p className="text-2xl text-primary mb-8">THE MEMORY KING</p>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Phase 2: Ironvein Wards<br/>
            "The world pushes back."
          </p>
          
          <button
            onClick={() => setGameState('playing')}
            className="px-8 py-4 bg-primary text-black font-black text-xl rounded-lg hover:scale-105 transition-transform"
            style={{ boxShadow: '0 0 30px #2E2EFE' }}
          >
            BEGIN
          </button>
          
          <div className="mt-8 text-white/40 text-sm">
            <p>WASD - Move | SPACE - Jump | SHIFT - Dodge</p>
            <p>LEFT CLICK / J - Attack | 1,2,3 - Tail Abilities</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'paused') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-8">PAUSED</h2>
          <div className="space-y-4">
            <button
              onClick={() => setGameState('playing')}
              className="block w-48 mx-auto px-6 py-3 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform"
            >
              RESUME
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="block w-48 mx-auto px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'dead') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
        <div className="text-center">
          <h2 className="text-5xl font-black text-red-500 mb-4">ERASED</h2>
          <p className="text-white/60 mb-8">"Memory fades. But it never truly dies."</p>
          <button
            onClick={() => {
              useGameStore.getState().resetGame();
              setGameState('playing');
            }}
            className="px-8 py-4 bg-fire text-white font-black text-xl rounded-lg hover:scale-105 transition-transform"
          >
            REMEMBER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Top Left - Player Stats */}
      <div className="absolute top-4 left-4 w-72 space-y-2 pointer-events-auto">
        {/* Health */}
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <HealthBar current={player.health} max={player.maxHealth} color="#FF3B30" />
          </div>
        </div>
        
        {/* Stamina */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <HealthBar current={player.stamina} max={player.maxStamina} color="#64D2FF" />
          </div>
        </div>
        
        {/* Tail Energy */}
        <div className="flex items-center gap-2">
          <Battery className="w-5 h-5 text-purple-500" />
          <div className="flex-1">
            <HealthBar current={tails.energy} max={tails.maxEnergy} color="#BF5AF2" />
          </div>
        </div>
      </div>

      {/* Top Right - Memory Fragments */}
      <div className="absolute top-4 right-4 bg-black/40 rounded-lg px-4 py-2 border border-white/10">
        <div className="flex items-center gap-2 text-white/80">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-bold">{memoryFragments.collected} / {memoryFragments.total}</span>
          <span className="text-xs text-white/40">Fragments</span>
        </div>
      </div>

      {/* Bottom Center - Tail Abilities */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex gap-3 bg-black/40 rounded-2xl p-3 border border-white/10">
          {tails.active.map((tailId) => (
            <TailAbility
              key={tailId}
              tailId={tailId}
              tail={tailData[tailId]}
              cooldown={tails.cooldowns[tailId]}
              isEquipped={tails.equipped.includes(tailId)}
              onUse={useTailAbility}
            />
          ))}
        </div>
        
        {/* Ability names */}
        <div className="flex justify-around mt-2 text-xs text-white/40">
          {tails.active.map((tailId) => (
            <span key={tailId} style={{ color: tailData[tailId].color }}>
              {tailData[tailId].name}
            </span>
          ))}
        </div>
      </div>

      {/* Combat indicator */}
      {combat.inCombat && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500/20 rounded-full px-4 py-1 border border-red-500/40">
          <Swords className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold text-red-500">IN COMBAT</span>
        </div>
      )}

      {/* Combo Counter */}
      <ComboCounter combo={player.combo} />

      {/* Bottom Left - Controls reminder */}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs">
        <p>ESC - Pause</p>
      </div>
    </div>
  );
};

export default GameHUD;
