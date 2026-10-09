import React, { useMemo, useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, LockKeyhole, MapPin, Shield, Skull, Sparkles, Zap } from 'lucide-react';

interface DistrictInfo {
  id: string;
  name: string;
  threat: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  faction: string;
  description: string;
  color: string;
  x: number;
  y: number;
  reward: string;
}

const DISTRICTS: DistrictInfo[] = [
  { id: 'ashblock-heights', name: 'ASHBLOCK HEIGHTS', threat: 'HIGH', faction: 'FANG SYNDICATE', description: 'Rooftop territory ruled by Syndicate Enforcers and heavy war machines.', color: '#f6b94b', x: 26, y: 35, reward: 'Memory Fragment' },
  { id: 'ironvein-wards', name: 'IRONVEIN WARDS', threat: 'HIGH', faction: 'ANTI-SABERTOOTH COVENANT', description: 'Foundry wards where memory essence is cut, catalogued, and weaponized.', color: '#73b7ff', x: 52, y: 42, reward: 'Covenant Intel' },
  { id: 'skyfall-spines', name: 'SKYFALL SPINES', threat: 'EXTREME', faction: 'MEMORY CULT', description: 'Vertical shrine district wrapped around the city’s living lightning spine.', color: '#d46cff', x: 75, y: 48, reward: 'Royal Memory' },
  { id: 'sector-7', name: 'SECTOR-7', threat: 'MEDIUM', faction: 'INDEPENDENTS', description: 'Refugee lanes, old tech, and hidden routes beneath the syndicate grid.', color: '#55e6c1', x: 67, y: 72, reward: 'Safehouse Key' },
  { id: 'storm-ronin-sanctum', name: 'STORM RONIN SANCTUM', threat: 'HIGH', faction: 'RONIN ORDER', description: 'A memory shrine hidden below the old city, guarded by ancestral trials.', color: '#d8d8d8', x: 39, y: 71, reward: 'Storm Seal' },
];

export default function StoryHubScreen() {
  const {
    setGameState,
    setActiveStoryMission,
    selectedCharacter,
    setCharacter,
    totalScore,
    activeProfileIndex,
  } = useRunner();
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const profileLevel = Math.max(1, Math.floor(totalScore / 1000) + 1);

  const routes = useMemo(() => DISTRICTS.slice(0, -1).map((district, index) => ({
    from: district,
    to: DISTRICTS[index + 1],
  })), []);

  const handleEnterDistrict = () => {
    setActiveStoryMission('story_act1_m1');
    setGameState('character-select');
  };

  return (
    <div className="kj-vision-shell fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,3,7,.25),rgba(2,3,7,.62)),url('/models/ruined_city_bg.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_38%,rgba(154,72,220,.13),transparent_26%),linear-gradient(90deg,rgba(3,4,8,.72),transparent_26%,transparent_72%,rgba(3,4,8,.78))]" />

      <header className="relative z-10 mx-5 mt-4 flex items-center justify-between border-b border-[#7d6136]/55 px-4 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setGameState('menu')} className="kj-vision-button p-3" aria-label="Back to main menu">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-[0.42em] text-[#9c8764]">Legends of Kai-Jax</div>
            <h1 className="kj-vision-title mt-1 text-2xl sm:text-4xl">Story Hub — The Raging City</h1>
          </div>
        </div>
        <div className="hidden items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-[#a79372] md:flex">
          <span>Profile 0{activeProfileIndex + 1}</span>
          <span>Lv. {profileLevel}</span>
          <span className="h-1.5 w-28 overflow-hidden rounded-full bg-black/70">
            <span
              className="block h-full bg-purple-500"
              style={{ width: `${Math.min(100, totalScore % 1000 / 10)}%` }}
            />
          </span>
          <span>{totalScore.toLocaleString()} Memory Score</span>
        </div>
      </header>

      <main className="relative z-10 grid h-[calc(100vh-96px)] grid-cols-1 gap-4 p-5 lg:grid-cols-[320px_1fr_280px]">
        <aside className="kj-vision-panel flex flex-col overflow-hidden p-4">
          <div className="mb-4 border border-[#8b6e3d]/45 bg-black/45 p-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#ab976f]">Selected District</div>
            <h2 className="mt-2 text-2xl uppercase tracking-[0.12em] text-[#efcf91]">{selectedDistrict.name}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#8d806d]">Main Quest</div>
              <div className="mt-1 text-lg uppercase tracking-[0.08em] text-white">The City Bites Back</div>
              <p className="mt-2 text-sm leading-6 text-[#bbb0a0]">{selectedDistrict.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="kj-vision-hud p-3"><div className="text-[#8f816d]">Threat</div><div className="mt-1 text-rose-300">{selectedDistrict.threat}</div></div>
              <div className="kj-vision-hud p-3"><div className="text-[#8f816d]">Faction</div><div className="mt-1 truncate text-purple-300">{selectedDistrict.faction}</div></div>
            </div>

            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#8d806d]">Rewards</div>
              {['Memory Fragment', 'Tail XP', selectedDistrict.reward].map((reward, index) => (
                <div key={reward} className="flex items-center gap-2 border-t border-white/5 py-2 text-sm text-[#d6c9b5]">
                  {index === 0 ? <Sparkles className="h-4 w-4 text-purple-300" /> : index === 1 ? <Zap className="h-4 w-4 text-blue-300" /> : <Shield className="h-4 w-4 text-amber-300" />}
                  {reward}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleEnterDistrict} className="kj-vision-button mt-auto px-4 py-3 text-xs">
            View Quest Details
          </button>
        </aside>

        <section className="relative overflow-hidden border border-[#7b5f34]/55 bg-black/25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(157,78,221,.08),transparent_58%)]" />

          <svg className="absolute inset-0 h-full w-full opacity-75" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {routes.map(({ from, to }) => (
              <line key={from.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={from.color} strokeWidth="0.35" strokeDasharray="1 1.6" />
            ))}
          </svg>

          {DISTRICTS.map((district) => {
            const active = district.id === selectedDistrict.id;
            return (
              <button
                key={district.id}
                onClick={() => setSelectedDistrict(district)}
                data-active={active}
                className="kj-vision-node absolute min-w-[150px] -translate-x-1/2 -translate-y-1/2 px-3 py-2 text-left transition hover:scale-105"
                style={{ left: `${district.x}%`, top: `${district.y}%`, color: district.color }}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rotate-45 border border-current bg-black/70"><MapPin className="h-3.5 w-3.5 -rotate-45" /></span>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em]">{district.name}</div>
                    <div className="mt-1 text-[9px] text-[#8f877b]">{district.threat}</div>
                  </div>
                </div>
              </button>
            );
          })}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-[#a78c61]">
            We take. We hold. We hunt. This is our city.
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="kj-vision-panel p-4">
            <div className="text-center text-[10px] uppercase tracking-[0.3em] text-[#a48c65]">Your Legends</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['kai', 'KAI', '#c76cff', 'MEMORY-WEB HEIR'],
                ['jax', 'JAX', '#5aaeff', 'STORM FANG'],
                ['kai-jax', 'KAI-JAX', '#efc76d', 'FUSION HERO'],
              ].map(([id, name, color, subtitle]) => {
                const active = selectedCharacter === id
                  || (id === 'kai-jax' && ['kaijax', 'kai_jax'].includes(selectedCharacter ?? ''));
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCharacter(id)}
                    aria-pressed={active}
                    className="border bg-black/45 p-2 text-center transition hover:-translate-y-0.5"
                    style={{
                      borderColor: active ? color : 'rgba(115,92,57,.55)',
                      boxShadow: active ? `0 0 20px ${color}33` : 'none',
                    }}
                  >
                    <div
                      className="mx-auto mb-2 grid h-14 w-10 place-items-center border bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.6))] text-lg"
                      style={{ borderColor: `${color}66`, boxShadow: `inset 0 0 18px ${color}33`, color }}
                      aria-hidden="true"
                    >
                      ✦
                    </div>
                    <div className="text-[9px] tracking-[0.12em]" style={{ color }}>{name}</div>
                    <div className="mt-1 text-[7px] tracking-[0.08em] text-[#817768]">{subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="kj-vision-panel flex-1 p-4">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">Map Legend</div>
            <div className="mt-4 space-y-3 text-xs text-[#cfc1aa]">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-300" /> Side Missions</div>
              <div className="flex items-center gap-2"><Skull className="h-4 w-4 text-rose-400" /> Boss Missions</div>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-300" /> Memory Sites</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-300" /> Safe Houses</div>
              <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#927c59]" /> Locked Path</div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
