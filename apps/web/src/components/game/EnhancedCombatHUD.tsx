/**
 * ENHANCED COMBAT HUD
 * Integrated battle UI with abilities, character stats, and boss mechanics
 */

import React, { useState } from 'react';
import { getCharacterPowerMatrix, getCharacterAbilities, type Ability } from '../../lib/abilitySystems';
import { getCharacterData, getCharacterStats } from '../../lib/characterStats';
import { getBossEncounter, type BossEncounter } from '../../lib/bossEncounters';
import { Heart, Zap, Shield, AlertTriangle, Target } from 'lucide-react';

interface EnhancedCombatHUDProps {
  playerId: string;
  bossId?: string;
  playerHealth?: number;
  playerMaxHealth?: number;
  bossHealth?: number;
  bossMaxHealth?: number;
  mana?: number;
  maxMana?: number;
  onAbilitySelected?: (abilityId: string) => void;
}

export default function EnhancedCombatHUD({
  playerId,
  bossId,
  playerHealth = 100,
  playerMaxHealth = 100,
  bossHealth = 100,
  bossMaxHealth = 100,
  mana = 100,
  maxMana = 100,
  onAbilitySelected,
}: EnhancedCombatHUDProps) {
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const playerData = getCharacterData(playerId);
  const playerStats = getCharacterStats(playerId);
  const playerAbilities = getCharacterAbilities(playerId);
  const boss = bossId ? getBossEncounter(bossId) : null;
  const currentHealthPct = (bossHealth / bossMaxHealth) * 100;
  const bossPhaseThreshold = boss && boss.phases ? (() => {
    const sortedPhases = [...boss.phases].sort((a, b) => b.healthThreshold - a.healthThreshold);
    const activePhase = sortedPhases.find(p => currentHealthPct >= p.healthThreshold) || sortedPhases[sortedPhases.length - 1];
    return activePhase?.description || null;
  })() : null;

  const playerHealthPct = (playerHealth / playerMaxHealth) * 100;
  const bossHealthPct = (bossHealth / bossMaxHealth) * 100;
  const manaPct = (mana / maxMana) * 100;

  if (!playerData || !playerStats) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* PLAYER STATS - TOP LEFT */}
      <div className="absolute top-4 left-4 w-80 z-30 pointer-events-auto">
        <div className="border border-[#22d3ee]/40 bg-black/60 backdrop-blur p-3 rounded-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-[0.1em]" style={{ color: playerData.visualIdentity.primaryColor }}>
              {playerData.displayName}
            </div>
            <div className="text-[10px] text-[#8f816d]">
              Lv. {Math.floor(playerStats.attack / 10) + 1}
            </div>
          </div>

          {/* HEALTH BAR */}
          <div className="mb-2">
            <div className="flex justify-between mb-1 text-[9px]">
              <span className="text-[#8f816d]">HP</span>
              <span className="text-[#d6c9b5]">{Math.ceil(playerHealth)}/{playerMaxHealth}</span>
            </div>
            <div className="h-3 bg-black/50 border border-[#735a35]/50 overflow-hidden rounded-sm">
              <div
                className="h-full bg-gradient-to-r from-[#ff6347] to-[#ff8c00]"
                style={{ width: `${playerHealthPct}%` }}
              />
            </div>
          </div>

          {/* MANA BAR */}
          <div className="mb-3">
            <div className="flex justify-between mb-1 text-[9px]">
              <span className="text-[#8f816d]">Mana</span>
              <span className="text-[#d6c9b5]">{Math.ceil(mana)}/{maxMana}</span>
            </div>
            <div className="h-3 bg-black/50 border border-[#735a35]/50 overflow-hidden rounded-sm">
              <div
                className="h-full bg-gradient-to-r from-[#5aaeff] to-[#00f2ff]"
                style={{ width: `${manaPct}%` }}
              />
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-3 gap-1 text-[9px] pt-2 border-t border-[#735a35]/50">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#ffed4e]" />
              <span className="text-[#8f816d]">ATK</span>
              <span className="text-[#d6c9b5]">{playerStats.attack}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-[#22d3ee]" />
              <span className="text-[#8f816d]">DEF</span>
              <span className="text-[#d6c9b5]">{playerStats.defense}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-[#d46cff]" />
              <span className="text-[#8f816d]">SPD</span>
              <span className="text-[#d6c9b5]">{playerStats.speed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOSS STATUS - TOP RIGHT */}
      {boss && (
        <div className="absolute top-4 right-4 w-80 z-30 pointer-events-auto">
          <div className="border border-[#ff6347]/40 bg-black/60 backdrop-blur p-3 rounded-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[9px] uppercase tracking-[0.08em] text-[#8f816d]">
                  Boss Encounter
                </div>
                <div className="text-xs uppercase tracking-[0.1em]" style={{ color: boss.visualIdentity.primaryColor }}>
                  {boss.displayName}
                </div>
              </div>
              <AlertTriangle className="h-5 w-5" style={{ color: boss.visualIdentity.primaryColor }} />
            </div>

            {/* BOSS HEALTH */}
            <div className="mb-2">
              <div className="flex justify-between mb-1 text-[9px]">
                <span className="text-[#8f816d]">Boss HP</span>
                <span className="text-[#ff6347]">{Math.ceil(bossHealth)}/{bossMaxHealth}</span>
              </div>
              <div className="h-4 bg-black/50 border border-[#ff6347]/50 overflow-hidden rounded-sm">
                <div
                  className="h-full bg-gradient-to-r from-[#ff6347] to-[#ff0000]"
                  style={{ width: `${bossHealthPct}%` }}
                />
              </div>
            </div>

            {/* PHASE INFO */}
            {bossPhaseThreshold && (
              <div className="mb-2 text-[9px] bg-black/40 border border-[#ff6347]/30 p-2 rounded-sm">
                <div className="text-[#8f816d]">Current Phase</div>
                <div className="text-[#ff6347] text-[10px] font-bold mt-1">
                  {bossPhaseThreshold}
                </div>
              </div>
            )}

            {/* BOSS STATS */}
            <div className="grid grid-cols-2 gap-1 text-[9px] pt-2 border-t border-[#ff6347]/30">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-[#ffed4e]" />
                <span className="text-[#8f816d]">ATK</span>
                <span className="text-[#ff6347]">{boss.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-[#ff8c00]" />
                <span className="text-[#8f816d]">DEF</span>
                <span className="text-[#ff8c00]">{boss.defense}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABILITIES - BOTTOM */}
      {playerAbilities.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="flex gap-2 mb-2 justify-center">
            <div className="text-[9px] uppercase tracking-[0.08em] text-[#a48c65] text-center">
              Combat Abilities
            </div>
          </div>
          <div className="flex gap-2 bg-black/60 backdrop-blur border border-[#8b6e3d]/40 p-2 rounded-sm">
            {playerAbilities.map((ability) => (
              <button
                key={ability.id}
                onClick={() => {
                  setSelectedAbility(ability);
                  onAbilitySelected?.(ability.id);
                }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-sm transition border ${
                  selectedAbility?.id === ability.id
                    ? 'border-[#efcf91] bg-black/80'
                    : 'border-[#735a35]/50 bg-black/40 hover:bg-black/60'
                }`}
                title={ability.description}
              >
                <div className="text-[8px] uppercase tracking-[0.08em] text-[#efcf91] text-center">
                  {ability.name.split(' ')[0]}
                </div>
                <div className="text-[7px] text-[#8f816d]">CD: {ability.cooldown}s</div>
                <div className="text-[7px] text-[#d6c9b5]">
                  {ability.manaCost < maxMana ? '✓' : '✗'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SELECTED ABILITY INFO */}
      {selectedAbility && (
        <div className="absolute bottom-32 right-4 z-30 pointer-events-auto">
          <div className="border border-[#8b6e3d]/45 bg-black/60 backdrop-blur p-3 rounded-sm w-72">
            <div className="mb-2">
              <div className="text-xs uppercase tracking-[0.1em]" style={{ color: selectedAbility.element === 'Lightning' ? '#5aaeff' : '#00f2ff' }}>
                {selectedAbility.name}
              </div>
              <div className="text-[10px] text-[#bbb0a0] mt-1">
                {selectedAbility.description}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] pt-2 border-t border-[#735a35]/50">
              <div className="flex items-center gap-1">
                <span className="text-[#8f816d]">Damage:</span>
                <span className="text-[#d6c9b5]">{selectedAbility.damage}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#8f816d]">Cooldown:</span>
                <span className="text-[#d6c9b5]">{selectedAbility.cooldown}s</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#8f816d]">Mana:</span>
                <span className={mana >= selectedAbility.manaCost ? 'text-[#55e6c1]' : 'text-[#ff6347]'}>
                  {selectedAbility.manaCost}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#8f816d]">Tier:</span>
                <span className="text-[#d6c9b5]">{selectedAbility.tier}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
