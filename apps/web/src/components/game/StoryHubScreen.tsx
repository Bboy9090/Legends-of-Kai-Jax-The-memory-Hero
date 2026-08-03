import React, { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, MapPin, Shield, Zap, ChevronRight, Skull } from 'lucide-react';

interface DistrictInfo {
  id: string;
  name: string;
  threat: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  faction: string;
  description: string;
  color: string;
}

const DISTRICTS: DistrictInfo[] = [
  {
    id: 'ashblock-heights',
    name: 'ASHBLOCK HEIGHTS',
    threat: 'HIGH',
    faction: 'FANG SYNDICATE',
    description: 'Rooftop territory ruled by Syndicate Enforcers and heavy war machines.',
    color: '#f43f5e'
  },
  {
    id: 'ironclaw-foundries',
    name: 'IRONCLAW FOUNDRIES',
    threat: 'EXTREME',
    faction: 'ANTI-SABERTOOTH COVENANT',
    description: 'Industrial forge district where memory essence is harvested by ironworks.',
    color: '#a855f7'
  },
  {
    id: 'beast-kin-market',
    name: 'BEAST-KIN MARKET',
    threat: 'MEDIUM',
    faction: 'INDEPENDENT REFUGEES',
    description: 'Bustling alley market under threat of Covenant raids and street shakedowns.',
    color: '#38bdf8'
  },
  {
    id: 'memory-archive',
    name: 'MEMORY ARCHIVE',
    threat: 'EXTREME',
    faction: 'STORM RONIN COVEN',
    description: 'Ancient sacred vault keeping the lost Sabertooth God lineage scrolls.',
    color: '#ffd700'
  }
];

export default function StoryHubScreen() {
  const { setGameState, setActiveStoryMission } = useRunner();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(DISTRICTS[0]);

  const handleEnterDistrict = (districtId: string) => {
    setActiveStoryMission('story_act1_m1');
    setGameState('mission-select');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      {/* Background City Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: 'url("/models/ruined_city_bg.jpg")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('menu')}
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

      {/* Main Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full mx-auto my-auto py-6 z-10">
        {/* District Selector List */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">ACTIVE CITY DISTRICTS</h3>
          {DISTRICTS.map((d) => {
            const isSelected = selectedDistrict.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center justify-between ${
                  isSelected 
                    ? 'bg-white/10 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] translate-x-2' 
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: d.color }} />
                  <div>
                    <h4 className="font-black italic text-base uppercase">{d.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{d.faction}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected District Intel Preview */}
        <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
          <div 
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[140px] pointer-events-none opacity-20"
            style={{ backgroundColor: selectedDistrict.color }}
          />

          <div className="space-y-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
                  TARGET DISTRICT
                </span>
                <h2 className="text-4xl font-black italic tracking-wide uppercase mt-2">{selectedDistrict.name}</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-mono text-xs font-bold">
                <Skull className="w-4 h-4" />
                <span>THREAT: {selectedDistrict.threat}</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {selectedDistrict.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-slate-500 block mb-1">DOMINANT FACTION</span>
                <span className="font-bold text-white uppercase">{selectedDistrict.faction}</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-slate-500 block mb-1">KEY OBJECTIVE</span>
                <span className="font-bold text-cyan-400 uppercase">RECLAIM MEMORY SCROLLS</span>
              </div>
            </div>
          </div>

          <div className="pt-8 z-10 flex justify-end">
            <button
              onClick={() => handleEnterDistrict(selectedDistrict.id)}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-black text-sm tracking-widest uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105"
            >
              DEPLOY TO DISTRICT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
