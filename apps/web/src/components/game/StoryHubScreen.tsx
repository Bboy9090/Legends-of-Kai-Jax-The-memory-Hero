import React, { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, MapPin, ChevronRight, ShieldAlert } from 'lucide-react';

interface DistrictInfo {
  id: string;
  missionId: string;
  name: string;
  threat: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  pressure: string;
  description: string;
  color: string;
}

/**
 * Story Hub location allowlist.
 * Keep this list limited to established Raging City / Bloodward locations.
 * Encounter placement and chapter-specific events remain controlled by the
 * publication-locked story source rather than being invented in UI copy.
 */
const DISTRICTS: DistrictInfo[] = [
  {
    id: 'ashblock-heights',
    missionId: 'vertical_slice_ashblock_heights',
    name: 'ASHBLOCK HEIGHTS',
    threat: 'HIGH',
    pressure: 'FANG SYNDICATE PRESSURE',
    description: 'An established Raging City district used for vertical traversal, district exploration, memory fragments, and canon-aligned faction encounters.',
    color: '#f97316',
  },
  {
    id: 'ironvein-wards',
    missionId: 'vertical_slice_ironvein_wards',
    name: 'IRONVEIN WARDS',
    threat: 'EXTREME',
    pressure: 'ANTI-SABERTOOTH COVENANT ACTIVITY',
    description: 'An established Raging City district where the vertical slice can exercise pressure, suppression, traps, and traversal without inventing a new faction or story event.',
    color: '#a855f7',
  },
  {
    id: 'skyfall-spines',
    missionId: 'vertical_slice_skyfall_spines',
    name: 'SKYFALL SPINES',
    threat: 'HIGH',
    pressure: 'CONTESTED TERRITORY',
    description: 'An established location reserved for story-controlled encounters. The gameplay slice focuses on movement, alternate routes, and environmental memory traces.',
    color: '#38bdf8',
  },
  {
    id: 'storm-ronin-sanctum',
    missionId: 'vertical_slice_storm_ronin_sanctum',
    name: 'STORM RONIN SANCTUM',
    threat: 'MEDIUM',
    pressure: 'RONIN LEGACY SITE',
    description: 'The established Storm Ronin sanctuary. It can host training, memory reconstruction, mentor material, and chronology-safe archive sequences where the story source permits them.',
    color: '#fbbf24',
  },
];

export default function StoryHubScreen() {
  const { setGameState, setActiveStoryMission } = useRunner();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(DISTRICTS[0]);

  const handleEnterDistrict = (district: DistrictInfo) => {
    setActiveStoryMission(district.missionId);
    setGameState('mission-select');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(168,85,247,0.15),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.11),transparent_38%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510] pointer-events-none" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGameState('menu')}
            aria-label="Back to menu"
            className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic tracking-wider uppercase">STORY HUB</h1>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">THE RAGING CITY WORLD MAP</p>
          </div>
        </div>
        <button
          onClick={() => setGameState('character-select')}
          className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all"
        >
          CHANGE HERO
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full mx-auto my-auto py-6 z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">ESTABLISHED LOCATIONS</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-purple-300 border border-purple-500/30 bg-purple-500/10 rounded-full px-2 py-1">
              Phase C Slice
            </span>
          </div>
          {DISTRICTS.map((district) => {
            const isSelected = selectedDistrict.id === district.id;
            return (
              <button
                key={district.id}
                onClick={() => setSelectedDistrict(district)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center justify-between ${
                  isSelected
                    ? 'bg-white/10 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.22)] translate-x-2'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: district.color }} />
                  <div>
                    <h4 className="font-black italic text-base uppercase">{district.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{district.pressure}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[140px] pointer-events-none opacity-20"
            style={{ backgroundColor: selectedDistrict.color }}
          />

          <div className="space-y-6 z-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
              <div>
                <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
                  RAGING CITY FIELD NODE
                </span>
                <h2 className="text-4xl font-black italic tracking-wide uppercase mt-2">{selectedDistrict.name}</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-mono text-xs font-bold self-start">
                <ShieldAlert className="w-4 h-4" />
                <span>THREAT: {selectedDistrict.threat}</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{selectedDistrict.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-slate-500 block mb-1">CURRENT PRESSURE</span>
                <span className="font-bold text-white uppercase">{selectedDistrict.pressure}</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-slate-500 block mb-1">SLICE OBJECTIVE</span>
                <span className="font-bold text-cyan-400 uppercase">TRAVERSAL + MEMORY TRACE</span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs leading-6 text-slate-400">
              This Phase C field node tests established gameplay systems without declaring a new book event. Final chapter placement, enemy identity, dialogue, and consequences remain locked to the publication chronology.
            </div>
          </div>

          <div className="pt-8 z-10 flex justify-end">
            <button
              onClick={() => handleEnterDistrict(selectedDistrict)}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-black text-sm tracking-widest uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105"
            >
              OPEN FIELD BRIEFING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
