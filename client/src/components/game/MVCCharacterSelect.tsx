import { useState, useMemo, useEffect, useCallback } from 'react';
import { CORE_HEROES, SUPPORT_HEROES, LEGACY_KIDS, SECRET_CHARACTERS, Character, CharacterRole, getAllCharacters } from '../../lib/roster';
import { TEAM_SYNERGIES, getActiveTeamBonuses, TeamBonus } from '../../lib/teamSynergy';
import { Button } from '../ui/button';
import { ChevronRight, Users, Zap, Shield, Sword, Star, Crown, Lock } from 'lucide-react';

interface MVCCharacterSelectProps {
  onTeamComplete: (team: string[]) => void;
  onBack: () => void;
  mode: 'battle' | 'mission';
  maxTeamSize?: number;
}

const ALL_CHARACTERS = getAllCharacters();

const ROLE_COLORS: Record<CharacterRole, string> = {
  'Vanguard': '#ef4444',
  'Blitzer': '#3b82f6',
  'Mystic': '#a855f7',
  'Support': '#22c55e',
  'Wildcard': '#f59e0b',
  'Tank': '#6b7280',
  'Sniper': '#ec4899',
  'Controller': '#06b6d4',
};

const ROLE_ICONS: Record<CharacterRole, string> = {
  'Vanguard': '⚔️',
  'Blitzer': '⚡',
  'Mystic': '✨',
  'Support': '💚',
  'Wildcard': '🎲',
  'Tank': '🛡️',
  'Sniper': '🎯',
  'Controller': '🌀',
};

export default function MVCCharacterSelect({
  onTeamComplete,
  onBack,
  mode,
  maxTeamSize = 4
}: MVCCharacterSelectProps) {
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ row: 0, col: 0 });

  const gridCols = 10;
  const gridRows = Math.ceil(ALL_CHARACTERS.length / gridCols);

  const getCharacterAtPosition = useCallback((row: number, col: number): Character | null => {
    const index = row * gridCols + col;
    return ALL_CHARACTERS[index] || null;
  }, [gridCols]);

  const currentHoveredChar = hoveredCharacter 
    ? ALL_CHARACTERS.find(c => c.id === hoveredCharacter)
    : getCharacterAtPosition(cursorPosition.row, cursorPosition.col);

  const isSelected = useCallback((charId: string) => selectedTeam.includes(charId), [selectedTeam]);
  const isTeamFull = selectedTeam.length >= maxTeamSize;

  const handleCharacterClick = useCallback((character: Character) => {
    if (isSelected(character.id)) {
      setSelectedTeam(prev => prev.filter(id => id !== character.id));
    } else if (selectedTeam.length < maxTeamSize) {
      setSelectedTeam(prev => [...prev, character.id]);
    }
  }, [isSelected, selectedTeam.length, maxTeamSize]);

  const getSelectedCharacters = useCallback(() => {
    return selectedTeam.map(id => ALL_CHARACTERS.find(c => c.id === id)).filter(Boolean) as Character[];
  }, [selectedTeam]);

  const teamBonuses = useMemo(() => {
    if (selectedTeam.length < 2) return [];
    return getActiveTeamBonuses(selectedTeam);
  }, [selectedTeam]);

  const handleConfirmTeam = useCallback(() => {
    if (selectedTeam.length > 0) {
      onTeamComplete(selectedTeam);
    }
  }, [selectedTeam, onTeamComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const char = getCharacterAtPosition(cursorPosition.row, cursorPosition.col);
      
      switch (e.key) {
        case 'ArrowUp':
          setCursorPosition(prev => ({ 
            ...prev, 
            row: Math.max(0, prev.row - 1) 
          }));
          break;
        case 'ArrowDown':
          setCursorPosition(prev => ({ 
            ...prev, 
            row: Math.min(gridRows - 1, prev.row + 1) 
          }));
          break;
        case 'ArrowLeft':
          setCursorPosition(prev => ({ 
            ...prev, 
            col: Math.max(0, prev.col - 1) 
          }));
          break;
        case 'ArrowRight':
          setCursorPosition(prev => ({ 
            ...prev, 
            col: Math.min(gridCols - 1, prev.col + 1) 
          }));
          break;
        case 'Enter':
        case ' ':
          if (char && char.unlockLevel === 0) {
            handleCharacterClick(char);
          }
          break;
        case 'Escape':
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPosition, gridRows, gridCols, getCharacterAtPosition, handleCharacterClick, onBack]);

  const starPositions = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      left: (i * 17 + 5) % 100,
      top: (i * 23 + 10) % 100,
      delay: (i * 0.1) % 3,
      opacity: 0.3 + (i % 5) * 0.15
    })), 
  []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden">
      {/* Animated Background Stars - Deterministic positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {starPositions.map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-screen flex flex-col p-2 md:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <Button
            onClick={onBack}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2"
          >
            ← BACK
          </Button>
          
          <h1 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg animate-pulse">
            CHOOSE YOUR HEROES
          </h1>
          
          <div className="text-right">
            <div className="text-yellow-400 font-bold text-sm md:text-lg">TEAM BONUS</div>
            <div className="text-cyan-300 text-xs md:text-sm">
              {teamBonuses.length > 0 ? `${teamBonuses.length} ACTIVE` : 'SELECT HEROES'}
            </div>
          </div>
        </div>

        {/* Main Content: 3-Column Layout */}
        <div className="flex-1 flex gap-2 md:gap-4 min-h-0">
          {/* Left Character Preview (P1 Side) */}
          <div className="w-1/5 hidden lg:flex flex-col">
            {selectedTeam[0] && (() => {
              const char = ALL_CHARACTERS.find(c => c.id === selectedTeam[0]);
              if (!char) return null;
              return (
                <CharacterPortrait character={char} side="left" slot={1} />
              );
            })()}
            {selectedTeam[1] && (() => {
              const char = ALL_CHARACTERS.find(c => c.id === selectedTeam[1]);
              if (!char) return null;
              return (
                <CharacterPortrait character={char} side="left" slot={2} />
              );
            })()}
          </div>

          {/* Center: Character Grid */}
          <div className="flex-1 flex flex-col">
            {/* Character Grid */}
            <div className="flex-1 bg-black/60 rounded-lg border-4 border-yellow-500 p-2 md:p-4 overflow-auto">
              <div 
                className="grid gap-1 md:gap-2"
                style={{ 
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                }}
              >
                {ALL_CHARACTERS.map((character, index) => {
                  const row = Math.floor(index / gridCols);
                  const col = index % gridCols;
                  const isCursorHere = cursorPosition.row === row && cursorPosition.col === col;
                  const isHovered = hoveredCharacter === character.id;
                  const selected = isSelected(character.id);
                  const slotNumber = selected ? selectedTeam.indexOf(character.id) + 1 : null;
                  const locked = character.unlockLevel > 0;

                  return (
                    <div
                      key={character.id}
                      className={`
                        relative aspect-square cursor-pointer transition-all duration-150
                        ${selected ? 'ring-4 ring-yellow-400 scale-105 z-10' : ''}
                        ${isCursorHere && !selected ? 'ring-4 ring-white scale-110 z-20' : ''}
                        ${isHovered && !selected && !isCursorHere ? 'ring-2 ring-cyan-400 scale-105' : ''}
                        ${locked ? 'opacity-50 grayscale' : ''}
                      `}
                      onClick={() => !locked && handleCharacterClick(character)}
                      onMouseEnter={() => setHoveredCharacter(character.id)}
                      onMouseLeave={() => setHoveredCharacter(null)}
                    >
                      {/* Character Cell - LEGENDARY */}
                      <div 
                        className="w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-white/20"
                        style={{ 
                          background: `linear-gradient(135deg, ${ROLE_COLORS[character.role]} 0%, ${ROLE_COLORS[character.role]}88 50%, ${ROLE_COLORS[character.role]}44 100%)`,
                          boxShadow: selected 
                            ? `0 0 25px ${ROLE_COLORS[character.role]}, inset 0 0 15px rgba(255,255,255,0.3)` 
                            : isCursorHere 
                              ? `0 0 15px rgba(255,255,255,0.8), inset 0 0 10px rgba(255,255,255,0.2)`
                              : 'inset 0 -2px 5px rgba(0,0,0,0.3)'
                        }}
                      >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Character Initial/Icon */}
                        <span className="text-white font-black text-lg md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {character.name.charAt(0)}
                        </span>

                        {/* Universe Badge */}
                        <span className="absolute bottom-0 right-0 text-[8px] md:text-[10px] bg-black/60 px-1 rounded-tl text-white/80 truncate max-w-full">
                          {character.universe}
                        </span>

                        {/* Role Icon Badge */}
                        <span className="absolute top-0 right-0 text-xs md:text-sm bg-black/40 rounded-bl px-0.5">
                          {ROLE_ICONS[character.role]}
                        </span>

                        {/* Selected Indicator - Enhanced */}
                        {selected && slotNumber && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black text-center font-black text-xs md:text-sm py-0.5 shadow-[0_-2px_10px_rgba(255,215,0,0.5)]">
                            ★ P{slotNumber} ★
                          </div>
                        )}

                        {/* READY Badge - Enhanced */}
                        {selected && (
                          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-600 to-green-500 text-white text-[8px] md:text-xs font-bold px-1.5 py-0.5 rounded-br shadow-[0_2px_10px_rgba(0,255,0,0.4)]">
                            ✓ READY
                          </div>
                        )}

                        {/* Cursor Indicator */}
                        {isCursorHere && !selected && (
                          <div className="absolute inset-0 border-4 border-white animate-pulse rounded-lg pointer-events-none" />
                        )}

                        {/* Lock Overlay */}
                        {locked && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                            <Lock className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Selected Team Slots */}
            <div className="mt-2 md:mt-4 bg-black/80 rounded-lg border-2 border-cyan-500 p-2 md:p-4">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Team Slots */}
                <div className="flex gap-2 md:gap-4 flex-1">
                  {[...Array(maxTeamSize)].map((_, i) => {
                    const char = getSelectedCharacters()[i];
                    return (
                      <div
                        key={i}
                        className={`
                          flex-1 aspect-[3/4] max-w-[120px] rounded-lg border-4 
                          ${char ? 'border-yellow-400' : 'border-gray-600 border-dashed'}
                          bg-gray-900/50 flex flex-col items-center justify-center overflow-hidden
                          transition-all duration-300
                        `}
                        onClick={() => char && handleCharacterClick(char)}
                      >
                        {char ? (
                          <>
                            <div 
                              className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-1"
                              style={{ backgroundColor: ROLE_COLORS[char.role] }}
                            >
                              <span className="text-white font-black text-xl md:text-2xl">
                                {char.name.charAt(0)}
                              </span>
                            </div>
                            <p className="text-white font-bold text-xs md:text-sm text-center px-1 truncate w-full">
                              {char.name}
                            </p>
                            <p className="text-cyan-400 text-[10px] md:text-xs">{char.role}</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 flex items-center justify-center mb-1">
                              <span className="text-gray-500 text-2xl">?</span>
                            </div>
                            <p className="text-gray-500 text-xs">SLOT {i + 1}</p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Team Bonus Panel */}
                <div className="w-48 md:w-64 bg-gradient-to-b from-purple-900/80 to-indigo-900/80 rounded-lg p-2 md:p-3 border-2 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">TEAM BONUS</span>
                  </div>
                  
                  {teamBonuses.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {teamBonuses.slice(0, 3).map((bonus, i) => (
                        <div key={i} className="bg-black/50 rounded p-1 md:p-2">
                          <p className="text-cyan-300 font-bold text-xs md:text-sm">{bonus.name}</p>
                          <p className="text-gray-400 text-[10px] md:text-xs truncate">{bonus.description}</p>
                        </div>
                      ))}
                      {teamBonuses.length > 3 && (
                        <p className="text-purple-400 text-xs">+{teamBonuses.length - 3} more...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Select heroes to activate bonuses</p>
                  )}
                </div>

                {/* Confirm Button */}
                <Button
                  onClick={handleConfirmTeam}
                  disabled={selectedTeam.length === 0}
                  className={`
                    h-full min-h-[80px] px-6 md:px-8 font-black text-lg md:text-xl
                    ${selectedTeam.length > 0 
                      ? 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 animate-pulse' 
                      : 'bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  {selectedTeam.length > 0 ? (
                    <>
                      START
                      <ChevronRight className="w-6 h-6 ml-2" />
                    </>
                  ) : (
                    'SELECT HEROES'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Character Preview (P2 Side / Hovered Info) */}
          <div className="w-1/5 hidden lg:flex flex-col">
            {currentHoveredChar && (
              <CharacterInfoPanel character={currentHoveredChar} />
            )}
            {selectedTeam[2] && (() => {
              const char = ALL_CHARACTERS.find(c => c.id === selectedTeam[2]);
              if (!char) return null;
              return (
                <CharacterPortrait character={char} side="right" slot={3} />
              );
            })()}
            {selectedTeam[3] && (() => {
              const char = ALL_CHARACTERS.find(c => c.id === selectedTeam[3]);
              if (!char) return null;
              return (
                <CharacterPortrait character={char} side="right" slot={4} />
              );
            })()}
          </div>
        </div>

        {/* Character Names Row */}
        <div className="mt-2 flex justify-center gap-4 md:gap-8">
          {getSelectedCharacters().map((char, i) => (
            <div 
              key={char.id}
              className="text-center"
              style={{ color: ROLE_COLORS[char.role] }}
            >
              <p className="font-black text-lg md:text-2xl drop-shadow-lg uppercase tracking-wider">
                {char.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CharacterPortrait({ 
  character, 
  side, 
  slot 
}: { 
  character: Character; 
  side: 'left' | 'right'; 
  slot: number;
}) {
  return (
    <div className={`
      flex-1 flex flex-col items-center justify-center p-4
      bg-gradient-to-${side === 'left' ? 'r' : 'l'} from-black/80 to-transparent
    `}>
      {/* Large Character Portrait */}
      <div 
        className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-2 shadow-2xl"
        style={{ 
          backgroundColor: ROLE_COLORS[character.role],
          boxShadow: `0 0 40px ${ROLE_COLORS[character.role]}`
        }}
      >
        <span className="text-white font-black text-4xl md:text-5xl">
          {character.name.charAt(0)}
        </span>
      </div>
      
      {/* Character Name */}
      <p className="text-white font-black text-lg md:text-xl text-center">{character.name}</p>
      <p className="text-cyan-400 text-sm">{character.title}</p>
      
      {/* Player Indicator */}
      <div className="mt-2 bg-yellow-400 text-black font-bold px-4 py-1 rounded-full text-sm">
        P{slot} READY
      </div>
    </div>
  );
}

function CharacterInfoPanel({ character }: { character: Character }) {
  return (
    <div className="bg-black/80 rounded-lg border-2 border-cyan-500 p-3 mb-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: ROLE_COLORS[character.role] }}
        >
          <span className="text-white font-black text-xl">
            {character.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-white font-black">{character.name}</p>
          <p className="text-cyan-400 text-xs">{character.title}</p>
        </div>
      </div>

      {/* Role Badge */}
      <div 
        className="inline-block px-2 py-1 rounded text-white text-xs font-bold mb-2"
        style={{ backgroundColor: ROLE_COLORS[character.role] }}
      >
        {ROLE_ICONS[character.role]} {character.role}
      </div>

      {/* Stats */}
      <div className="space-y-1">
        <StatBar label="HP" value={character.stats.health} color="#22c55e" />
        <StatBar label="ATK" value={character.stats.attack} color="#ef4444" />
        <StatBar label="DEF" value={character.stats.defense} color="#3b82f6" />
        <StatBar label="SPD" value={character.stats.speed} color="#f59e0b" />
        <StatBar label="SPL" value={character.stats.special} color="#a855f7" />
      </div>

      {/* Abilities Preview */}
      <div className="mt-3">
        <p className="text-yellow-400 font-bold text-xs mb-1">ABILITIES</p>
        <div className="flex flex-wrap gap-1">
          {character.abilities.slice(0, 3).map((ability, i) => (
            <span key={i} className="bg-purple-900/50 text-purple-300 text-[10px] px-1 py-0.5 rounded">
              {ability}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-xs w-8">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white text-xs w-6 text-right">{value}</span>
    </div>
  );
}
