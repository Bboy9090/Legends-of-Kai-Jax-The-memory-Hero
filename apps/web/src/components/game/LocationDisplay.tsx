/**
 * LOCATION DISPLAY COMPONENT
 * Shows environment and location information
 */

import React, { useState } from 'react';
import { getLocation, ALL_LOCATIONS, type Location } from '../../lib/locations';
import { MapPin, Shield, Skull, TrendingUp } from 'lucide-react';

interface LocationDisplayProps {
  locationId?: string;
  showGrid?: boolean;
  compact?: boolean;
}

const getThreatIcon = (level: string) => {
  switch (level) {
    case 'LOW':
      return '●';
    case 'MEDIUM':
      return '●●';
    case 'HIGH':
      return '●●●';
    case 'EXTREME':
      return '●●●●';
    default:
      return '○';
  }
};

const getThreatColor = (level: string): string => {
  switch (level) {
    case 'LOW':
      return '#55e6c1';
    case 'MEDIUM':
      return '#ffed4e';
    case 'HIGH':
      return '#ff8c00';
    case 'EXTREME':
      return '#ff6347';
    default:
      return '#a9a9a9';
  }
};

export default function LocationDisplay({ locationId, showGrid = false, compact = false }: LocationDisplayProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    locationId ? getLocation(locationId) || null : null
  );

  const location = selectedLocation;

  if (compact && locationId && location) {
    return (
      <div className="border border-[#8b6e3d]/45 bg-black/45 p-2">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3" style={{ color: location.color }} />
          <span className="uppercase text-[#efcf91]">{location.name}</span>
          <span
            className="ml-auto"
            style={{ color: getThreatColor(location.threatLevel) }}
          >
            {getThreatIcon(location.threatLevel)}
          </span>
        </div>
      </div>
    );
  }

  if (!location && !showGrid) {
    return (
      <div className="text-center text-[#a79372] text-sm">
        Select a location to view details
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* LOCATION GRID */}
      {showGrid && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            All Locations ({ALL_LOCATIONS.length})
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`text-left p-3 border transition ${
                  selectedLocation?.id === loc.id
                    ? 'border-[#efcf91] bg-black/60'
                    : 'border-[#8b6e3d]/45 bg-black/45 hover:bg-black/55'
                }`}
                style={{
                  borderColor:
                    selectedLocation?.id === loc.id
                      ? loc.color
                      : '#8b6e3d' + '73',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.1em]" style={{ color: loc.color }}>
                      {loc.name}
                    </div>
                    <div className="mt-1 text-[9px] text-[#8f816d]">{loc.faction || 'Neutral'}</div>
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: getThreatColor(loc.threatLevel) }}
                    title={loc.threatLevel}
                  >
                    {getThreatIcon(loc.threatLevel)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LOCATION DETAILS */}
      {location && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Location Details
          </div>
          <div
            className="border border-[#8b6e3d]/45 bg-black/45 p-4 relative overflow-hidden"
            style={{ borderColor: location.color + '40' }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full"
              style={{
                backgroundColor: location.color,
              }}
            />
            <div className="relative z-10 space-y-3">
              {/* HEADER */}
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#8d806d]">
                  {location.region}
                </div>
                <div
                  className="mt-1 text-2xl uppercase tracking-[0.08em]"
                  style={{ color: location.color }}
                >
                  {location.displayName}
                </div>
                {location.faction && (
                  <div className="mt-2 text-[10px] text-[#bbb0a0]">
                    Faction: <span style={{ color: location.accentColor }}>{location.faction}</span>
                  </div>
                )}
              </div>

              {/* THREAT & TYPE */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#735a35]/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: getThreatColor(location.threatLevel) }} />
                  <div className="text-[9px] uppercase text-[#8f816d]">Threat Level</div>
                  <div
                    className="text-[10px] font-bold"
                    style={{ color: getThreatColor(location.threatLevel) }}
                  >
                    {location.threatLevel}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#22d3ee]" />
                  <div className="text-[9px] uppercase text-[#8f816d]">Type</div>
                  <div className="text-[10px] text-[#d6c9b5]">
                    {location.environmentType.replace(/-/g, ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESCRIPTION & LORE */}
      {location && (
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Description
          </div>
          <div className="text-sm text-[#bbb0a0] mb-4">{location.description}</div>
          <div className="border-l-2 pl-4" style={{ borderColor: location.color + '40' }}>
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#8f816d] mb-2">
              Lore
            </div>
            <div className="text-sm leading-6 text-[#bbb0a0]">{location.lore}</div>
          </div>
        </div>
      )}

      {/* VISUAL THEMES */}
      {location && location.visualThemes.length > 0 && (
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Visual Identity
          </div>
          <div className="flex flex-wrap gap-2">
            {location.visualThemes.map((theme, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded-sm text-[9px] uppercase tracking-[0.08em]"
                style={{
                  backgroundColor: location.color + '20',
                  color: location.color,
                  border: `1px solid ${location.color}40`,
                }}
              >
                {theme}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENEMIES & BOSSES */}
      {location && (location.enemies?.length || location.bosses?.length) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {location.enemies && location.enemies.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
                Enemy Types
              </div>
              <div className="space-y-1">
                {location.enemies.map((enemy, i) => (
                  <div
                    key={i}
                    className="text-[9px] text-[#bbb0a0] flex items-center gap-2"
                  >
                    <Skull className="h-3 w-3 text-[#ff6347]" />
                    {enemy.replace(/-/g, ' ').toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
          {location.bosses && location.bosses.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#ff6347]">
                Boss Encounters
              </div>
              <div className="space-y-1">
                {location.bosses.map((boss, i) => (
                  <div
                    key={i}
                    className="text-[9px] text-[#ff6347] flex items-center gap-2 font-bold"
                  >
                    <Skull className="h-3 w-3" />
                    {boss.replace(/-/g, ' ').toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REWARDS */}
      {location && location.rewards && location.rewards.length > 0 && (
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Possible Rewards
          </div>
          <div className="flex flex-wrap gap-2">
            {location.rewards.map((reward, i) => (
              <div
                key={i}
                className="px-2 py-1 rounded text-[9px] text-[#efcf91]"
                style={{
                  backgroundColor: location.color + '15',
                  border: `1px solid ${location.color}40`,
                }}
              >
                {reward}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
