import React, { useState, useEffect } from 'react';
import '../../styles/bronx_grit.css';
import '../../styles/legendary-effects.css';
import { useRunner } from '../../lib/stores/useRunner';
import { ALL_STORY_MISSIONS } from '../../lib/story_missions';


/**
 * ⚡ LEGENDS OF KAI-JAX: THE MEMORY KING ⚡
 * MEMORY KING / RAGING CITY MAIN MENU
 *
 * Production goals:
 * - cinematic city-first composition
 * - ornate gold / violet interface hierarchy
 * - controller, keyboard and pointer navigation
 * - real profile/save behavior preserved
 * - no fake loading delay or decorative prototype canvas competing with the approved visual direction
 */

interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  legendary?: boolean;
}

const LegendaryMainMenu: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0); // Continue is the primary Raging City path
  const compactMenu = typeof window !== 'undefined' && window.innerWidth < 1024;
  const [memoryShards, setMemoryShards] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    type: 'velocity' | 'shield' | 'ghost';
  }>>([]);
  const [showProfileSelect, setShowProfileSelect] = useState(false);

  const profiles = useRunner((s) => s.profiles);
  const activeProfileIndex = useRunner((s) => s.activeProfileIndex);
  const switchProfile = useRunner((s) => s.switchProfile);
  const setGameState = useRunner((s) => s.setGameState);
  const setTrainingSession = useRunner((s) => s.setTrainingSession);

  // Safety guard for hydration
  if (!profiles || !profiles.length) {
    return <div className="bg-[#050508] w-full h-screen flex items-center justify-center text-white/20 font-mono">HYDRATING ARCHIVE...</div>;
  }


  // Required Main Menu items
  const menuItems: MenuItem[] = [
    {
      id: 'continue',
      label: 'CONTINUE',
      sublabel: 'Resume last saga save',
      action: () => {
        const profile = profiles[activeProfileIndex];
        const hasProgress =
          profile.completedStoryMissionIds.length > 0 ||
          profile.campaignCompletedNodes.length > 0 ||
          profile.totalScore > 0;
        setGameState(hasProgress ? 'campaign-map' : 'story-hub');
      },
      legendary: true
    },
    {
      id: 'story',
      label: 'STORY',
      sublabel: 'The Raging City Campaign Map',
      action: () => setGameState('story-hub')
    },
    {
      id: 'missions',
      label: 'MISSIONS',
      sublabel: 'Browse the canonical campaign',
      action: () => setGameState('campaign-map')
    },
    {
      id: 'training',
      label: 'TRAINING',
      sublabel: 'Practice moves & combos',
      action: () => {
        setTrainingSession(true);
        setGameState('adventure');
      }
    },
    {
      id: 'versus',
      label: 'COMBAT ARENA',
      sublabel: '1v1 Versus battle mode',
      action: () => setGameState('versus-select')
    },
    {
      id: 'codex',
      label: 'LEGENDS ARCHIVE',
      sublabel: 'Lore, Factions & Codex',
      action: () => setGameState('lore-hub')
    },
    {
      id: 'customize',
      label: 'CUSTOMIZE',
      sublabel: 'Character outfits & variants',
      action: () => setGameState('customization')
    },
    {
      id: 'options',
      label: 'OPTIONS',
      sublabel: 'Audio, Video & Controls',
      action: () => setGameState('settings')
    },
    {
      id: 'abilities',
      label: 'EXTRAS',
      sublabel: 'Memory Weave skill tree',
      action: () => setGameState('abilities')
    },
    {
      id: 'credits',
      label: 'CREDITS',
      sublabel: 'Development team',
      action: () => setGameState('credits')
    },
    {
      id: 'quit',
      label: 'EXIT GAME',
      sublabel: 'Exit to title screen',
      action: () => setGameState('title')
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedIndex(prev => {
          let newIndex = prev - 1;
          if (newIndex < 0) newIndex = menuItems.length - 1;
          // Skip disabled items
          while (menuItems[newIndex].disabled && newIndex !== prev) {
            newIndex = newIndex - 1;
            if (newIndex < 0) newIndex = menuItems.length - 1;
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedIndex(prev => {
          let newIndex = (prev + 1) % menuItems.length;
          // Skip disabled items
          while (menuItems[newIndex].disabled && newIndex !== prev) {
            newIndex = (newIndex + 1) % menuItems.length;
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = menuItems[selectedIndex];
        if (item && !item.disabled) {
          item.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, menuItems]);

  const renderProfileSelect = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-4xl w-full p-8">
        <h3 className="text-god-tier text-3xl mb-8 text-center">SELECT MEMORY PROFILE</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile, i) => (
            <button
              key={i}
              onClick={() => {
                switchProfile(i);
                setShowProfileSelect(false);
                setGameState('story-hub');
              }}
              className={`group relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                i === activeProfileIndex ? 'border-legendary-gold bg-legendary-gold/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="text-xs font-mono mb-2 opacity-50 uppercase">Slot 0{i + 1}</div>
              <div className="text-2xl font-black mb-4 group-hover:text-legendary-cyan">
                {profile.totalScore > 0 ? `LEVEL ${Math.floor(profile.totalScore / 1000) + 1}` : 'EMPTY ECHO'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Story: {profile.completedStoryMissionIds.length} / {ALL_STORY_MISSIONS.length}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-legendary-gold opacity-0 group-hover:opacity-100 transition-opacity">
                LOAD MEMORY →
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowProfileSelect(false)}
          className="mt-12 block mx-auto text-xs uppercase tracking-[0.4em] opacity-50 hover:opacity-100 transition-opacity"
        >
          [ ESCAPE TO MENU ]
        </button>
      </div>
    </div>
  );


  return (
    <div className="kj-vision-shell kj-vision-city-vignette kj-safe-screen relative h-[100dvh] w-full overflow-y-auto sm:overflow-hidden">
      {showProfileSelect && renderProfileSelect()}
      
      {!compactMenu && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[58%] overflow-hidden" aria-hidden="true">
          <img
            src="/images/lore/hero-kaijax.png"
            alt=""
            className="absolute bottom-[-8%] right-[3%] h-[100%] w-[74%] object-cover object-[center_28%] opacity-88 mix-blend-screen [mask-image:linear-gradient(to_left,black_58%,transparent_100%)]"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(157,78,221,.16),transparent_28%),linear-gradient(90deg,rgba(2,3,7,.92),rgba(2,3,7,.08)_50%,rgba(2,3,7,.3))]" />
          <div className="kj-vision-panel absolute bottom-[8%] right-[4%] w-[min(360px,32vw)] p-4 text-left">
            <div className="text-[9px] uppercase tracking-[0.28em] text-[#a58a61]">Chapter I · Ashblock Heights</div>
            <div className="mt-2 text-base uppercase tracking-[0.12em] text-[#efe3cc]">The City Bites Back</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-purple-300/80">Current Form · Kai-Jax</div>
            <div className="mt-3 flex items-center gap-3 text-[9px] uppercase tracking-[0.16em] text-[#817666]">
              <span className="text-[#c69b55]">Memory King</span>
              <span>•</span>
              <span>Raging City</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex min-h-full w-full max-w-[760px] flex-col items-start gap-4 px-4 pb-6 pt-2 sm:h-full sm:justify-between sm:p-8 lg:w-[46%] lg:min-w-[650px] lg:p-12">
        
        {/* Logo - Top Center with Legendary Effects */}
        <div className="w-full text-left sm:mt-8 lg:mt-10">
          <h1 
            className="kj-vision-title mb-2 max-w-full text-[clamp(2.15rem,10vw,3.35rem)] leading-[0.92] tracking-[0.06em] sm:text-5xl sm:leading-none sm:tracking-[0.13em] lg:text-7xl"
          >
            LEGENDS OF KAI-JAX
          </h1>
          <h2 className="text-transformation mb-3 text-lg tracking-[0.18em] text-white sm:text-2xl lg:text-4xl">
            THE MEMORY KING
          </h2>
          <div className="mt-3 flex max-w-[680px] items-center gap-2 sm:mt-6 sm:gap-3">
            <div className="hidden h-0.5 w-12 bg-gradient-to-r from-transparent via-legendary-gold to-transparent sm:block lg:w-24" />
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-legendary-purple animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-legendary-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-legendary-gold animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="max-w-[30rem] text-[9px] font-bold uppercase leading-relaxed tracking-[0.18em] text-legendary-gold sm:text-xs sm:tracking-[0.3em] lg:text-sm">
              FORGED IN THE RAGING CITY. CROWNED BY MEMORY.
            </p>
            <div className="hidden sm:flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-legendary-gold animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="w-2 h-2 rounded-full bg-legendary-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-legendary-purple animate-pulse" />
            </div>
            <div className="hidden h-0.5 w-12 bg-gradient-to-r from-transparent via-legendary-gold to-transparent sm:block lg:w-24" />
          </div>

          {/* Profile Quick Switcher */}
          <div className="kj-vision-panel mt-3 flex w-full max-w-md flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 sm:mt-4 sm:inline-flex sm:w-auto sm:px-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Profile:</span>
            <button 
              onClick={() => setShowProfileSelect(true)}
              className="text-[10px] font-bold text-cyan-400 hover:text-white transition-colors flex items-center gap-2"
            >
              SLOT 0{activeProfileIndex + 1} • {profiles[activeProfileIndex].totalScore > 0 ? `LVL ${Math.floor(profiles[activeProfileIndex].totalScore / 1000) + 1}` : 'EMPTY'}
              <span className="text-slate-600">[CHANGE]</span>
            </button>
          </div>
        </div>

        {/* Menu Items - Center Vertical */}
        <div className="kj-vision-panel flex w-full max-w-md flex-col gap-0.5 p-1.5 sm:mb-10 sm:gap-1 sm:p-2 lg:mb-16">
          {menuItems.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && item.action()}
                onMouseEnter={() => !item.disabled && setSelectedIndex(index)}
                disabled={item.disabled}
                className={`kj-vision-button relative w-full px-3 py-2 text-left group sm:px-5 sm:py-3 ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                data-active={isSelected}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r"
                    style={{
                      background: item.legendary 
                        ? 'linear-gradient(180deg, #ffd700, #00d9ff)'
                        : '#00d9ff',
                      boxShadow: item.legendary
                        ? '0 0 10px rgba(255, 215, 0, 0.8)'
                        : '0 0 10px rgba(0, 217, 255, 0.8)',
                    }}
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-sm font-bold uppercase tracking-[0.08em] sm:text-base sm:tracking-wider lg:text-lg"
                      style={{
                        color: item.legendary && isSelected ? '#ffd700' : '#ffffff',
                        textShadow: item.legendary && isSelected
                          ? '0 0 10px rgba(255, 215, 0, 0.5)'
                          : '0 1px 3px rgba(0, 0, 0, 0.9)',
                      }}
                    >
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <p className="mt-0.5 text-[10px] leading-tight tracking-wide sm:text-xs" style={{ color: '#cbd5e1', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {item.sublabel}
                      </p>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div 
                      className="text-xl lg:text-2xl"
                      style={{
                        color: item.legendary ? '#ffd700' : '#00d9ff',
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="hidden text-center sm:mb-6 sm:block lg:mb-8">
          <p className="text-mono-small text-neutral-600 uppercase tracking-[0.2em] text-xs">
            WE TAKE. WE HOLD. WE HUNT. THIS IS OUR CITY.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <button 
              onClick={() => window.open('https://legendsofkaijax.com/privacy', '_blank')}
              className="text-neutral-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => window.open('https://legendsofkaijax.com/terms', '_blank')}
              className="text-neutral-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest"
            >
              Terms of Service
            </button>
          </div>
          <p className="text-neutral-700 text-[10px] mt-4 uppercase tracking-widest">
            THE MEMORY KING — RELEASE VISION
          </p>
        </div>
      </div>

      {/* Grit Filter Overlay */}
      <div className="grit-filter" style={{ zIndex: 50 }} />

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 z-40 hidden sm:block">
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded px-3 py-1.5 border border-white/10">
          <p className="text-neutral-500 text-xs">
            ↑↓ Navigate • Enter Select
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegendaryMainMenu;
