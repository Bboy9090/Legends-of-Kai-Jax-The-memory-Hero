import { useState, useMemo } from "react";
import { useRunner } from "../../lib/stores/useRunner";
import { Star, Zap, Swords, BookOpen, Skull, ChevronRight } from "../ui/icons";

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/htuxfqte_9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png";

interface TailData {
  id: number;
  name: string;
  element: string;
  color: string;
  description: string;
  signatureMove: string;
  primaryUse: string;
}

const TAILS: TailData[] = [
  { id: 1, name: "Inferno Whip", element: "Fire", color: "#FF3B30", description: "Raw destructive force. The first tail awakened in Kai-Jax's rage.", signatureMove: "Hellfire Lash", primaryUse: "Offense" },
  { id: 2, name: "Tempest Fang", element: "Wind", color: "#64D2FF", description: "Speed and evasion. Cuts through space like a blade.", signatureMove: "Cyclone Cutter", primaryUse: "Mobility" },
  { id: 3, name: "Umbra Veil", element: "Shadow", color: "#BF5AF2", description: "Stealth and deception. The world forgets you exist.", signatureMove: "Void Step", primaryUse: "Stealth" },
  { id: 4, name: "Thunder Spike", element: "Lightning", color: "#FFD60A", description: "Paralyzing strikes that lock opponents in place.", signatureMove: "Storm Chain", primaryUse: "Control" },
  { id: 5, name: "Titan Root", element: "Earth", color: "#8B6914", description: "Unbreakable defense. Anchors reality itself.", signatureMove: "Quake Shield", primaryUse: "Defense" },
  { id: 6, name: "Torrent Surge", element: "Water", color: "#0A84FF", description: "Fluid adaptation. Flows around any obstacle.", signatureMove: "Tidal Crush", primaryUse: "Adaptation" },
  { id: 7, name: "Verdant Bloom", element: "Nature", color: "#30D158", description: "Regeneration and life force manipulation.", signatureMove: "Genesis Thorns", primaryUse: "Recovery" },
  { id: 8, name: "Solar Flare", element: "Light", color: "#FFFFFF", description: "Purifying radiance that reveals all hidden truths.", signatureMove: "Dawn Break", primaryUse: "Revelation" },
  { id: 9, name: "Eternity Thread", element: "Memory/Reality", color: "#FFD700", description: "Not power. Not spectacle. It appears only when internal conflict ends.", signatureMove: "Memory Lock", primaryUse: "Transcendence" },
];

interface CharacterData {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  image: string;
  abilities: string[];
}

const CHARACTERS: CharacterData[] = [
  {
    id: "kai",
    name: "KAI",
    title: "The Fire Brother",
    description: "Fierce, impulsive, and burning with uncontrollable passion. Kai's fire is both his greatest weapon and his deepest flaw.",
    color: "#FF3B30",
    image: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    abilities: ["Fire Manipulation", "Berserker Rage", "Web Sling", "Flame Dash"],
  },
  {
    id: "jax",
    name: "JAX",
    title: "The Ice Strategist",
    description: "Calm, calculating, and precise. Jax is the mind where Kai is the heart. His ice reflects his perfect control.",
    color: "#64D2FF",
    image: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    abilities: ["Ice Manipulation", "Strategic Mind", "Frost Shield", "Crystal Lock"],
  },
  {
    id: "kaijax",
    name: "KAI-JAX",
    title: "The Memory King",
    description: "The legendary fusion. Two brothers, one body, nine tails. Kai-Jax is the sovereign who cannot be erased from existence.",
    color: "#2E2EFE",
    image: HERO_IMAGE,
    abilities: ["9-Tail System", "Memory Lock", "Reality Warp", "Fusion State"],
  },
  {
    id: "boryn",
    name: "BORYN",
    title: "The Hunter General",
    description: "A massive protective tiger beast. Father figure to the brothers. His warmth hides a warrior's ferocity.",
    color: "#FFD60A",
    image: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    abilities: ["Beast Strength", "Guardian Instinct", "Pack Command", "Iron Hide"],
  },
  {
    id: "borax",
    name: "BORAX",
    title: "The Tank King",
    description: "Towering armored lion warrior. Ancient authority. The apex predator who watches from the shadows of Raging City.",
    color: "#BF5AF2",
    image: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    abilities: ["Absolute Authority", "Armor Break", "Mentor's Eye", "Apex Strike"],
  },
];

const GALLERY_IMAGES = [
  {
    id: "full-cast",
    title: "Full Cast - Canon Locked",
    url: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
  },
  {
    id: "brothers-training",
    title: "The Brothers Training",
    url: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/wqaylhx5_IMG_2571.png",
  },
  {
    id: "kaijax-shadow",
    title: "Kai-Jax: Shadow Form",
    url: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/xtev4z4g_IMG_2562.png",
  },
  {
    id: "kaijax-protector",
    title: "Kai-Jax: The Protector",
    url: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/jedvy626_IMG_2623.png",
  },
  {
    id: "kaijax-king",
    title: "Kai-Jax: The Memory King",
    url: HERO_IMAGE,
  },
  {
    id: "brothers-fusion",
    title: "Brothers & Fusion",
    url: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qg2yruaf_D3D596A4-184F-4AE1-8009-15784FB7D51F.png",
  },
];

const STORY_ACTS = [
  { act: 1, title: "The Awakening", subtitle: "When the brothers fall, the beast rises", region: "Sector-7, The Ash District", tails: 3, color: "#FF3B30", narrative: "Kai and Jax are separated during the Fall of Sector-7. In desperation, their bodies merge into Kai-Jax — a fusion neither wanted. Three tails manifest: Fire, Wind, and Shadow.", bossTest: "Can you fight when you don't know who you are?" },
  { act: 2, title: "The Raging City", subtitle: "Memory is the currency of survival", region: "Raging City Core", tails: 5, color: "#64D2FF", narrative: "Kai-Jax navigates the brutal politics of Raging City. Two more tails awaken: Lightning and Earth. The Memory Codex begins recording everything.", bossTest: "Can you trust what you remember?" },
  { act: 3, title: "The Void Covenant", subtitle: "The enemy knows your name before you do", region: "The Undercity", tails: 6, color: "#BF5AF2", narrative: "The Void Fang Covenant reveals itself. Water tail awakens. Kai-Jax learns the fusion is permanent — and was planned.", bossTest: "Can you accept what you've become?" },
  { act: 4, title: "The God Wars", subtitle: "When gods fight, mortals choose sides", region: "The Celestial Breach", tails: 8, color: "#FFD60A", narrative: "The Sabertooth Gods descend. Nature and Light tails manifest. Kai-Jax must choose between the gods or forge a new path.", bossTest: "Can you refuse power that's freely offered?" },
  { act: 5, title: "The Memory King", subtitle: "The ninth tail doesn't fight — it settles", region: "The Convergence", tails: 9, color: "#2E2EFE", narrative: "All conflicts converge. The ninth tail — Memory/Reality — appears not through combat, but through acceptance. Kai-Jax becomes the Memory King.", bossTest: "Can you end a war without winning it?" },
];

function Gamepad2Icon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1.11 0 2.08-.474 2.844-1.277l1.426-1.496A3.97 3.97 0 0 1 12 15c1.07 0 2.06.42 2.73 1.227l1.426 1.496C16.92 18.526 17.89 19 19 19a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  );
}

function FlameIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ShieldIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function WindIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

function DropletIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function LeafIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function SunIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MenuIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

const ELEMENT_ICONS: Record<string, React.ComponentType<{className?: string; size?: number}>> = {
  Fire: FlameIcon,
  Wind: WindIcon,
  Shadow: Skull,
  Lightning: Zap,
  Earth: ShieldIcon,
  Water: DropletIcon,
  Nature: LeafIcon,
  Light: SunIcon,
  "Memory/Reality": Star,
};

type Section = "home" | "characters" | "tails" | "story";

const particles = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 17 + 13) % 100}%`,
  delay: `${(i * 0.7) % 15}s`,
  color: ["#FF3B30", "#FFD60A", "#64D2FF", "#BF5AF2", "#2E2EFE"][i % 5],
}));

export default function LoreHub() {
  const [section, setSection] = useState<Section>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const setGameState = useRunner((s) => s.setGameState);

  const handlePlayGame = () => {
    setGameState("menu");
  };

  return (
    <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden" style={{ background: "linear-gradient(to bottom, #050510, #0a0a1a, #050510)" }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="fixed w-1 h-1 rounded-full opacity-30 animate-pulse pointer-events-none"
          style={{ left: p.left, top: "-10px", backgroundColor: p.color, animationDelay: p.delay, animationDuration: "3s" }}
        />
      ))}

      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(5,5,16,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(46,46,254,0.2)", border: "1px solid rgba(46,46,254,0.5)" }}>
              <Star className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-black text-sm tracking-tight uppercase text-white">KAI-JAX</span>
          </div>

          <div className="hidden md:flex gap-6">
            {(["home", "characters", "tails", "story"] as Section[]).map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`uppercase tracking-widest text-xs transition-colors ${section === s ? "text-blue-400" : "text-white/50 hover:text-white"}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setGameState("menu")}
              className="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 ttransition-all"
            >
              Exit to Menu
            </button>
            <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden" style={{ background: "rgba(0,0,0,0.9)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {(["home", "characters", "tails", "story"] as Section[]).map((s) => (
              <button
                key={s}
                onClick={() => { setSection(s); setMobileOpen(false); }}
                className={`block w-full text-left px-6 py-3 uppercase tracking-widest text-xs ${section === s ? "text-blue-400 bg-blue-500/10" : "text-white/50"}`}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-16">
        {section === "home" && <HeroSection onNavigate={setSection} onPlayGame={handlePlayGame} />}
        {section === "characters" && <CharactersSection />}
        {section === "tails" && <TailsSection />}
        {section === "story" && <StorySection />}
      </main>

      <footer className="py-10 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 className="text-xl font-black text-white mb-2">
          LEGENDS OF <span className="text-blue-400">KAI-JAX</span>
        </h3>
        <p className="text-white/40 italic text-sm">"Forged in the Raging City. Crowned by Memory."</p>
        <p className="text-white/20 text-xs mt-3">Memory cannot be designed out of existence.</p>
      </footer>
    </div>
  );
}

function HeroSection({ onNavigate, onPlayGame }: { onNavigate: (s: Section) => void; onPlayGame: () => void }) {
  return (
    <section className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Kai-Jax"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto object-contain opacity-25 md:opacity-40"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #050510 0%, rgba(5,5,16,0.8) 50%, transparent 100%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          <p className="text-blue-300/70 text-xs md:text-sm tracking-[0.3em] mb-4 uppercase">Forged in the Raging City</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-none text-white">
            LEGENDS OF <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #FF3B30, #FFD60A, #64D2FF)" }}>
              KAI-JAX
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-blue-400 font-black mb-6">THE MEMORY KING</p>
          <p className="text-white/50 text-lg md:text-xl max-w-xl mb-10 italic">
            "Survival without memory is extinction with better design."
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-8 py-4 rounded-lg font-black text-base uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(46,46,254,0.3), rgba(255,59,48,0.2))",
                border: "2px solid rgba(46,46,254,0.8)",
                boxShadow: "0 0 25px rgba(46,46,254,0.3)",
              }}
              data-testid="lorehub-play-game-btn"
            >
              <Gamepad2Icon className="w-5 h-5" /> Play Game
            </button>
            <a
              href="/mission-demo.html"
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(255,59,48,0.35), rgba(255,214,10,0.15))",
                border: "2px solid rgba(255,59,48,0.7)",
                boxShadow: "0 0 18px rgba(255,59,48,0.25)",
              }}
              data-testid="lorehub-mission-demo-btn"
            >
              <FlameIcon className="w-4 h-4" /> Mission: First Blood
            </a>
            <a
              href="/combat-demo.html"
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(0,217,255,0.25), rgba(46,46,254,0.15))",
                border: "2px solid rgba(0,217,255,0.7)",
                boxShadow: "0 0 18px rgba(0,217,255,0.25)",
              }}
              data-testid="lorehub-combat-demo-btn"
            >
              <Gamepad2Icon className="w-4 h-4" /> Combat Kernel
            </a>
            <button
              onClick={() => onNavigate("characters")}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm text-white/80 transition-all hover:text-white hover:scale-[1.02]"
              style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}
            >
              <Star className="w-4 h-4" /> Meet the Heroes
            </button>
            <button
              onClick={() => onNavigate("story")}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm text-white/80 transition-all hover:text-white hover:scale-[1.02]"
              style={{ border: "1px solid rgba(255,59,48,0.3)", background: "rgba(255,59,48,0.05)" }}
            >
              <FlameIcon className="w-4 h-4 text-red-400" /> Read the Saga
            </button>
            <button
              onClick={() => onNavigate("tails")}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm text-white/80 transition-all hover:text-white hover:scale-[1.02]"
              style={{ border: "1px solid rgba(255,214,10,0.3)", background: "rgba(255,214,10,0.05)" }}
            >
              <Zap className="w-4 h-4 text-yellow-400" /> 9 Tails
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full flex justify-center pt-2" style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CharactersSection() {
  return (
    <section className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-purple-400 text-xs tracking-[0.3em] mb-3 uppercase">The Warriors</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
            MEET THE <span className="text-blue-400">LEGENDS</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm">Two brothers. One destiny. A fusion that cannot be erased.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${char.color}25` }}
            >
              <div className="aspect-square relative overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-black text-white mb-1">{char.name}</h3>
                <p className="text-sm mb-2" style={{ color: char.color }}>{char.title}</p>
                <p className="text-white/50 text-sm mb-3 leading-relaxed">{char.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {char.abilities.map((a, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full text-white/40" style={{ background: "rgba(255,255,255,0.05)" }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="text-center mb-10">
            <p className="text-red-400 text-xs tracking-[0.3em] mb-3 uppercase">The Gallery</p>
            <h3 className="text-3xl font-black text-white mb-2">CHARACTER <span className="text-red-400">ART</span></h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((img) => (
              <div
                key={img.id}
                className="rounded-xl overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-blue-400">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TailsSection() {
  return (
    <section className="min-h-screen py-24" style={{ background: "rgba(0,0,0,0.2)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-yellow-400 text-xs tracking-[0.3em] mb-3 uppercase">The Nine-Tail System</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
            <span className="text-red-400">NINE</span> TAILS OF <span className="text-blue-400">POWER</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm">Kai-Jax always has nine tails. The world only allows him to express some.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TAILS.map((tail) => {
            const Icon = ELEMENT_ICONS[tail.element] || Star;
            return (
              <div
                key={tail.id}
                className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${tail.color}20` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${tail.color}15`, boxShadow: `0 0 15px ${tail.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: tail.color } as React.CSSProperties} />
                  </div>
                  <span className="text-3xl font-black text-white/8">{tail.id.toString().padStart(2, "0")}</span>
                </div>
                <h3 className="text-lg font-black mb-1" style={{ color: tail.color }}>{tail.name}</h3>
                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">
                  {tail.element} &middot; {tail.primaryUse}
                </p>
                <p className="text-white/50 text-sm mb-3">{tail.description}</p>
                <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs text-white/25 uppercase tracking-widest mb-1">Signature Move</p>
                  <p className="text-sm font-bold" style={{ color: tail.color }}>{tail.signatureMove}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <div
            className="max-w-xl mx-auto rounded-xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.15)" }}
          >
            <p className="text-lg text-yellow-400 italic mb-2">The Ninth Tail</p>
            <p className="text-white/50 italic text-sm">
              "Not power. Not spectacle. It appears only when internal conflict ends.
              It settles. The world stops correcting him."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-red-400 text-xs tracking-[0.3em] mb-3 uppercase">The Saga</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
            THE FIVE <span className="text-blue-400">ACTS</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm">
            From awakening to sovereignty. The journey of two brothers who became one king.
          </p>
        </div>

        <div className="space-y-4">
          {STORY_ACTS.map((act) => (
            <div
              key={act.act}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${act.color}20` }}
            >
              <button
                className="w-full p-5 text-left flex items-start justify-between"
                onClick={() => setExpanded(expanded === act.act ? null : act.act)}
              >
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Act {act.act}</p>
                  <h3 className="text-xl font-black text-white mb-1">{act.title}</h3>
                  <p className="text-sm italic" style={{ color: `${act.color}CC` }}>{act.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${act.color}15`, color: act.color }}>
                    {act.tails} tails
                  </span>
                  <ChevronRight className={`w-5 h-5 text-white/30 transition-transform ${expanded === act.act ? "rotate-90" : ""}`} />
                </div>
              </button>

              {expanded === act.act && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="pt-4">
                    <p className="text-white/40 text-xs mb-1">Region: <span className="text-white/60">{act.region}</span></p>
                    <p className="text-white/55 text-sm leading-relaxed mt-3">{act.narrative}</p>
                    <div className="mt-4 rounded-lg p-4" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Boss Philosophy Test</p>
                      <p className="text-sm font-bold" style={{ color: act.color }}>{act.bossTest}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <div
            className="rounded-xl p-6 max-w-xl mx-auto"
            style={{ background: "rgba(46,46,254,0.05)", border: "1px solid rgba(46,46,254,0.15)" }}
          >
            <p className="text-blue-400 italic">"The ninth tail doesn't fight — it settles."</p>
          </div>
        </div>
      </div>
    </section>
  );
}
