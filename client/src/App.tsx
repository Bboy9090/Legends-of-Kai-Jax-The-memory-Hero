import { useState, useEffect, useRef, useMemo } from "react";
import "@fontsource/inter";
import "@fontsource/bebas-neue";
import AdventureArena from "./components/game/AdventureArena";

import BattleScene from "./components/game/BattleScene";
import TouchControls from "./components/game/TouchControls";
import MobileControls from "./components/game/MobileControls";
import BattleUI from "./components/game/BattleUI";
import DialogueDisplay from "./components/game/DialogueDisplay";
import MainMenu from "./components/game/MainMenu";
import CharacterSelect from "./components/game/CharacterSelect";
import MVCCharacterSelect from "./components/game/MVCCharacterSelect";
import CustomizationMenu from "./components/game/CustomizationMenu";
import NexusHaven from "./components/game/world/NexusHaven";
import SquadSelection from "./components/game/SquadSelection";
import StoryModeSelect from "./components/game/StoryModeSelect";
import GameModesMenu from "./components/game/GameModesMenu";
import MissionSelect from "./components/game/MissionSelect";
import MissionGameplay from "./components/game/MissionGameplay";
import FluidBattleArena from "./components/game/FluidBattleArena";
import ChapterSelect from "./components/game/ChapterSelect";
import ChapterMissionSelect from "./components/game/ChapterMissionSelect";
import CinematicPlayer from "./components/game/CinematicPlayer";
import ExplorationWorld from "./components/game/ExplorationWorld";
import { useGame } from "./lib/stores/useGame";
import { useRunner } from "./lib/stores/useRunner";
import { useBattle } from "./lib/stores/useBattle";
import { useAudio } from "./lib/stores/useAudio";
import { useCampaign } from "./lib/stores/useCampaign";
import { type ChapterNumber } from "./lib/ragingCityCampaign";
import { getSceneByMissionId, type CinematicScene } from "./lib/cinematicStory";
import { useEffect, useState } from "react";

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/htuxfqte_9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png";

const GALLERY_IMAGES = [
  {
    id: 'full-cast',
    title: 'Full Cast - Production Canon',
    description: 'Kai (fire) + Jax (ice) vs Borax (Tank King) + Boryn (Hunter General)',
    url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png'
  },
  {
    id: 'brothers-training',
    title: 'The Brothers Training',
    description: 'Kai and Jax sparring in their youth, before the fall.',
    url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/wqaylhx5_IMG_2571.png'
  },
  {
    id: 'kaijax-dark',
    title: 'Kai-Jax: Shadow Form',
    description: 'The dark fusion with glowing yellow eyes and elemental tails.',
    url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/xtev4z4g_IMG_2562.png'
  },
  {
    id: 'kaijax-protector',
    title: 'Kai-Jax: The Protector',
    description: 'Defending the innocent with fire and web tails blazing.',
    url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/jedvy626_IMG_2623.png'
  },
  {
    id: 'kaijax-king',
    title: 'Kai-Jax: The Memory King',
    description: 'Full 9-tail armored form - the ultimate fusion state.',
    url: HERO_IMAGE
  },
  {
    id: 'brothers-fusion',
    title: 'Brothers & Fusion',
    description: 'Kai (red jacket), Jax (blue jacket), and their legendary fusion form.',
    url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qg2yruaf_D3D596A4-184F-4AE1-8009-15784FB7D51F.png'
  }
];

function App() {
  const { phase } = useGame();
  const { gameState, selectedCharacter, setGameState } = useRunner();
  const { setPlayerFighter, setOpponentFighter } = useBattle();
  const { 
    setBackgroundMusic, 
    setBattleMusic, 
    setHitSound, 
    setSuccessSound,
    backgroundMusic,
    isMuted
  } = useAudio();
  const [currentActNumber, setCurrentActNumber] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [completedActs, setCompletedActs] = useState<(1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [battleMode, setBattleMode] = useState<'story' | 'versus' | 'mission'>('story');
  
  const [currentChapter, setCurrentChapter] = useState<ChapterNumber | null>(null);
  const [campaignMissionId, setCampaignMissionId] = useState<string | null>(null);
  const [currentCinematic, setCurrentCinematic] = useState<CinematicScene | null>(null);
  const [showingCinematic, setShowingCinematic] = useState(false);
  const [explorationArea, setExplorationArea] = useState<string>('prologue');
  const campaignStore = useCampaign();

const TAILS = [
  { id: 1, name: 'TAIL OF FLAME', element: 'Fire', color: '#FF3B30', use: 'Offense', signature: 'Inferno Barrage', description: 'Raw destructive power. Burns through anything. The first tail Kai-Jax mastered.' },
  { id: 2, name: 'TAIL OF GALE', element: 'Wind', color: '#30D158', use: 'Mobility', signature: 'Cyclone Rush', description: 'Speed and evasion. Allows mid-air dashes and tornado kicks.' },
  { id: 3, name: 'TAIL OF SHADOW', element: 'Shadow', color: '#1C1C1E', use: 'Stealth', signature: 'Void Step', description: 'Invisibility and fear. Phase through attacks, strike from darkness.' },
  { id: 4, name: 'TAIL OF STORM', element: 'Lightning', color: '#FFD60A', use: 'Stun', signature: 'Thunder Judgement', description: 'Paralysis and raw voltage. Chain lightning between enemies.' },
  { id: 5, name: 'TAIL OF STONE', element: 'Earth', color: '#8E8E93', use: 'Defense', signature: 'Tectonic Wall', description: 'Unbreakable defense. Create barriers, earthquake stomps.' },
  { id: 6, name: 'TAIL OF TIDE', element: 'Water', color: '#0A84FF', use: 'Healing', signature: 'Restoration Wave', description: 'Healing and pressure. Regenerate health, drown opponents.' },
  { id: 7, name: 'TAIL OF VINE', element: 'Nature', color: '#34C759', use: 'Control', signature: 'Root Prison', description: 'Entangle and drain. Vines that sap strength and bind.' },
  { id: 8, name: 'TAIL OF DAWN', element: 'Light', color: '#FF9F0A', use: 'Purify', signature: 'Solar Flare', description: 'Blinding radiance. Purify corruption, illuminate truth.' },
  { id: 9, name: 'TAIL OF MEMORY', element: 'Memory/Reality', color: '#BF5AF2', use: 'Ultimate', signature: 'Reality Rewrite', description: 'Not power. Not spectacle. It appears only when internal conflict ends.' },
];

const STORY_ACTS = [
  { number: 1, title: 'THE RAGING CITY', theme: 'Origin', color: '#FF3B30', events: ['Kai and Jax survive alone in Sector-7', 'Boryn watches from the shadows, protecting them', 'First encounter with the Fang Syndicate', 'Kai discovers his fire tail'] },
  { number: 2, title: 'THE FRACTURE', theme: 'Conflict', color: '#64D2FF', events: ['Jax is captured by the Void Fang Covenant', 'Kai unleashes three tails in desperation', 'Borax reveals himself as the true enemy', 'The brothers are separated'] },
  { number: 3, title: 'THE FUSION', theme: 'Transformation', color: '#BF5AF2', events: ['Kai finds Jax in the Void realm', 'The brothers merge into KAI-JAX', 'Nine tails manifest for the first time', 'Reality itself begins to crack'] },
  { number: 4, title: 'THE SOVEREIGNTY', theme: 'War', color: '#FFD60A', events: ['KAI-JAX leads the Beast-Kin uprising', 'Voidonus Imperion awakens', 'The final battle for Aeterna begins', 'Memory becomes the ultimate weapon'] },
  { number: 5, title: 'THE MEMORY KING', theme: 'Resolution', color: '#2E2EFE', events: ['The ninth tail settles', 'Voidonus is sealed, not destroyed', 'Kai-Jax becomes the Memory King', 'The world stops correcting him'] },
];

const ADVENTURE_HEROES = [
  { id: 'KAITEENFOX', name: 'KAI', subtitle: 'The Fire Twin', color: '#FF3B30', description: 'Play as Kai through the early story chapters. Street-smart, web-slinging beast warrior.' },
  { id: 'kaison_beast', name: 'JAX', subtitle: 'The Ice Twin', color: '#64D2FF', description: 'Play as Jax through select story missions. Strategic mind, lightning reflexes.' },
  { id: 'KAIJAX1', name: 'KAI-JAX', subtitle: 'The Memory King', color: '#BF5AF2', locked: true, description: 'Unlocked after Act 3: The Fusion. The legendary nine-tailed fusion form.' },
];

const ALL_CHARACTERS = [
  { id: 'KAIJAX1', name: 'KAI-JAX', subtitle: 'The Memory King', color: '#8B5CF6' },
  { id: 'KAINJAXYN', name: 'KAINJAXYN', subtitle: 'The Ascended Twin', color: '#A855F7' },
  { id: 'KAITEENFOX', name: 'KAITEEN FOX', subtitle: 'Blazing Vanguard', color: '#F97316' },
  { id: 'darjshadowkaijax', name: 'DARK SHADOW', subtitle: 'Shadow Form', color: '#6366F1' },
  { id: 'BORYN', name: 'BORYN', subtitle: 'The Iron Beast', color: '#78716C' },
  { id: 'Borax', name: 'BORAX', subtitle: 'Crystal Guardian', color: '#22D3EE' },
  { id: 'SABERVILLAIN', name: 'SABER VILLAIN', subtitle: 'The Dark Blade', color: '#DC2626' },
  { id: 'kai_jax_beast', name: 'KAI-JAX BEAST', subtitle: 'Original Beast Form', color: '#7C3AED' },
  { id: 'kaison_beast', name: 'KAISON', subtitle: 'Twin of Law', color: '#3B82F6' },
  { id: 'jaxon_beast', name: 'JAXON', subtitle: 'Twin of Sacrifice', color: '#EF4444' },
  { id: 'boryx_zenith_beast', name: 'BORYX ZENITH', subtitle: 'Guardian King', color: '#F59E0B' },
  { id: 'lunara_solis_beast', name: 'LUNARA SOLIS', subtitle: 'Oracle Sentinel', color: '#EC4899' },
  { id: 'phoenix_warrior', name: 'PHOENIX WARRIOR', subtitle: 'Flame Reborn', color: '#F97316' },
  { id: 'frost_wolf', name: 'FROST WOLF', subtitle: 'Ice Stalker', color: '#06B6D4' },
  { id: 'thunder_lion', name: 'THUNDER LION', subtitle: 'Storm Sovereign', color: '#FBBF24' },
  { id: 'jade_serpent', name: 'JADE SERPENT', subtitle: 'Venom Sage', color: '#10B981' },
  { id: 'shadow_panther', name: 'SHADOW PANTHER', subtitle: 'Void Hunter', color: '#6366F1' },
  { id: 'earth_turtle', name: 'EARTH TURTLE', subtitle: 'Ancient Guardian', color: '#84CC16' },
  { id: 'voidonus_beast', name: 'VOIDONUS', subtitle: 'The Final Darkness', color: '#991B1B' },
];

function ParticleBackground() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      left: `${(i * 37 + 13) % 100}%`,
      delay: `${(i * 2.7) % 15}s`,
      duration: `${12 + (i % 8)}s`,
      color: ['#FF3B30', '#FFD60A', '#64D2FF', '#BF5AF2', '#2E2EFE'][i % 5],
    })), []
  );

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-10px',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            backgroundColor: p.color,
            opacity: 0.4,
            animation: `floatUp ${p.duration} ${p.delay} infinite linear`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Navigation({ activeSection, onNavigate }: { activeSection: AppSection; onNavigate: (s: AppSection) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections: { id: AppSection; label: string }[] = [
    { id: 'home', label: 'HOME' },
    { id: 'characters', label: 'HEROES' },
    { id: 'tails', label: '9 TAILS' },
    { id: 'story', label: 'SAGA' },
    { id: 'gallery', label: 'GALLERY' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <KeyboardControls map={controls}>
        {/* Main Menu */}
        {phase === 'ready' && gameState === 'menu' && <MainMenu />}
        
        {/* Story Mode: Choose exploration or chapter select */}
        {phase === 'ready' && gameState === 'story-mode-select' && !currentChapter && (
          <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
            <div className="max-w-md w-full p-6 space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2">STORY MODE</h1>
                <p className="text-gray-400">Choose how to experience the story</p>
              </div>
              
              <button
                onClick={() => {
                  setExplorationArea('prologue');
                  setGameState('exploration');
                }}
                className="w-full p-6 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 hover:from-cyan-800/60 hover:to-purple-800/60 rounded-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all text-left group"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300">
                  Explore Raging City
                </h3>
                <p className="text-gray-400 text-sm">
                  Walk around, talk to people, discover the story naturally. 
                  NPCs will point you where to go.
                </p>
              </button>
              
              <button
                onClick={() => {
                  setGameState('chapter-select');
                }}
                className="w-full p-6 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all text-left group"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-300">
                  Chapter Select
                </h3>
                <p className="text-gray-400 text-sm">
                  Jump to specific chapters and missions. 
                  Watch cinematics before battles.
                </p>
              </button>
              
              <button
                onClick={() => setGameState('menu')}
                className="w-full py-3 text-gray-500 hover:text-white transition-colors"
              >
                ← Back to Menu
              </button>
            </div>
          </div>
        )}
        
        {/* Exploration World - Walk around, talk to NPCs, discover story */}
        {phase === 'ready' && gameState === 'exploration' && (
          <ExplorationWorld
            currentArea={explorationArea}
            onBack={() => setGameState('story-mode-select')}
          />
        )}
        
        {/* Chapter Select (Alternative to exploration) */}
        {phase === 'ready' && gameState === 'chapter-select' && (
          <ChapterSelect
            onSelectChapter={(chapterNum) => {
              setCurrentChapter(chapterNum as ChapterNumber);
              campaignStore.setCurrentChapter(chapterNum as ChapterNumber);
              setGameState('chapter-missions');
            }}
            onBack={() => {
              setCurrentChapter(null);
              setGameState('story-mode-select');
            }}
            completedChapters={campaignStore.completedChapters}
          />
        )}
        
        {/* NEW: Chapter Mission Select */}
        {phase === 'ready' && gameState === 'chapter-missions' && currentChapter !== null && !campaignMissionId && !showingCinematic && (
          <ChapterMissionSelect
            chapterNumber={currentChapter}
            onSelectMission={(missionId) => {
              setCampaignMissionId(missionId);
              campaignStore.setCurrentMission(missionId);
              const scene = getSceneByMissionId(missionId);
              if (scene) {
                setCurrentCinematic(scene);
                setShowingCinematic(true);
                setGameState('cinematic');
              } else {
                setGameState('campaign-team-select');
              }
            }}
            onBack={() => {
              setCurrentChapter(0);
              setGameState('story-mode-select');
            }}
          />
        )}
        
        {/* Cinematic Player - Story plays out before gameplay */}
        {phase === 'ready' && gameState === 'cinematic' && showingCinematic && currentCinematic && (
          <CinematicPlayer
            scene={currentCinematic}
            onComplete={() => {
              setShowingCinematic(false);
              setCurrentCinematic(null);
              if (currentCinematic.triggersGameplay) {
                setGameState('campaign-team-select');
              } else {
                setGameState('chapter-missions');
              }
            }}
            onSkip={() => {
              setShowingCinematic(false);
              setCurrentCinematic(null);
              setGameState('campaign-team-select');
            }}
          />
        )}
        
        {/* Campaign Team Select */}
        {phase === 'ready' && gameState === 'campaign-team-select' && campaignMissionId && !showingCinematic && (
          <MVCCharacterSelect
            mode="mission"
            maxTeamSize={4}
            onTeamComplete={(team) => {
              setSelectedTeam(team);
              setGameState('campaign-battle');
            }}
            onBack={() => {
              setCampaignMissionId(null);
              setGameState('chapter-missions');
            }}
          />
        )}
        
        {/* Campaign Battle */}
        {phase === 'ready' && gameState === 'campaign-battle' && campaignMissionId && (
          <FluidBattleArena
            missionId={campaignMissionId}
            playerTeam={selectedTeam}
            onBattleComplete={(success: boolean) => {
              if (success) {
                campaignStore.completeMission(campaignMissionId);
              }
              setCampaignMissionId(null);
              setSelectedTeam([]);
              setGameState('chapter-missions');
            }}
            onBack={() => {
              setCampaignMissionId(null);
              setSelectedTeam([]);
              setGameState('chapter-missions');
            }}
          />
        )}
        
        {/* Legacy Mission Selection */}
        {phase === 'ready' && gameState === 'mission-select' && !currentMissionId && (
          <MissionSelect
            actNumber={currentActNumber}
            onSelectMission={(missionId) => {
              setCurrentMissionId(missionId);
              setGameState('mission-team-select');
            }}
            onBack={() => setGameState('menu')}
            onChangeAct={(actNumber) => setCurrentActNumber(actNumber)}
            completedMissions={completedMissions}
          />
        )}
        
        {/* Mission Team Select - Choose heroes before mission */}
        {phase === 'ready' && gameState === 'mission-team-select' && currentMissionId && (
          <MVCCharacterSelect
            mode="mission"
            maxTeamSize={4}
            onTeamComplete={(team) => {
              setSelectedTeam(team);
              setGameState('mission-gameplay');
            }}
            onBack={() => {
              setCurrentMissionId(null);
              setGameState('mission-select');
            }}
          />
        )}
        
        {/* Mission Gameplay */}
        {phase === 'ready' && gameState === 'mission-gameplay' && currentMissionId && (
          <FluidBattleArena
            missionId={currentMissionId}
            playerTeam={selectedTeam}
            onBattleComplete={(success: boolean) => {
              if (success) {
                setCompletedMissions([...completedMissions, currentMissionId]);
              }
              setCurrentMissionId(null);
              setSelectedTeam([]);
              setGameState('mission-select');
            }}
            onBack={() => {
              setCurrentMissionId(null);
              setSelectedTeam([]);
              setGameState('mission-select');
            }}
          />
        )}
        
        {/* Versus Mode Character Select */}
        {phase === 'ready' && gameState === 'versus-select' && (
          <MVCCharacterSelect
            mode="battle"
            maxTeamSize={4}
            onTeamComplete={(team) => {
              setSelectedTeam(team);
              setBattleMode('versus');
              setGameState('versus-battle');
            }}
            onBack={() => setGameState('menu')}
          />
        )}
        
        {/* Versus Battle */}
        {phase === 'ready' && gameState === 'versus-battle' && (
          <FluidBattleArena
            missionId={null}
            playerTeam={selectedTeam}
            onBattleComplete={() => {
              setSelectedTeam([]);
              setGameState('menu');
            }}
            onBack={() => {
              setSelectedTeam([]);
              setGameState('versus-select');
            }}
          />
        )}
        
        {/* Game Modes Menu */}
        {phase === 'ready' && gameState === 'game-modes-menu' && (
          <GameModesMenu 
            onSelectMode={(mode) => {
              // TODO: Start game mode
              console.log("Starting Game Mode:", mode);
            }}
            onBack={() => setGameState('menu')}
            unlockedModes={['legacy']}
          />
        )}
        
        {/* Nexus Haven Hub */}
        {phase === 'ready' && gameState === 'nexus-haven' && <NexusHaven />}
        
        {/* Squad Selection */}
        {phase === 'ready' && gameState === 'squad-select' && <SquadSelection />}
        
        {/* Character Selection */}
        {phase === 'ready' && gameState === 'character-select' && <CharacterSelect />}
        
        {/* Customization Menu */}
        {phase === 'ready' && gameState === 'customization' && <CustomizationMenu />}
        
        {/* Game Canvas */}
        {(phase === 'playing' || phase === 'ended') && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 5, 10],  // Adjusted for better mobile zoom
                fov: 60,  // Narrower FOV = more zoom to fill screen!
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
          className="nav-mobile-btn"
        >
          {mobileOpen ? 'X' : '='}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ background: 'rgba(0,0,0,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { onNavigate(s.id); setMobileOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '1rem 1.5rem', background: activeSection === s.id ? 'rgba(139,92,246,0.1)' : 'none',
                border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: activeSection === s.id ? '#BF5AF2' : 'rgba(255,255,255,0.6)',
                fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
                letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

function HeroSection({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img
          src={HERO_IMAGE}
          alt="Kai-Jax"
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            height: '120%', width: 'auto', objectFit: 'contain', opacity: 0.4,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0.8), transparent)',
        }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '700px' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", color: '#64D2FF', fontSize: '0.8rem',
            letterSpacing: '0.3em', marginBottom: '1rem',
          }}>
            FORGED IN THE RAGING CITY
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: 'white', lineHeight: 0.95, marginBottom: '0.5rem',
          }}>
            LEGENDS OF<br />
            <span style={{
              background: 'linear-gradient(90deg, #FF3B30, #FFD60A, #64D2FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              KAI-JAX
            </span>
          </h1>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem',
            color: '#BF5AF2', marginBottom: '1.5rem', letterSpacing: '0.1em',
          }}>
            THE MEMORY KING
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2.5rem',
            fontStyle: 'italic', lineHeight: 1.6,
          }}>
            "Survival without memory is extinction with better design."
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <CyberButton color="#BF5AF2" onClick={() => onNavigate('adventure-select')} primary>
              ADVENTURE MODE
            </CyberButton>
            <CyberButton color="#FF3B30" onClick={() => onNavigate('versus-select')}>
              VERSUS MODE
            </CyberButton>
            <CyberButton color="#FFD60A" onClick={() => onNavigate('battleworld-select')}>
              BATTLEWORLD
            </CyberButton>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
            <CyberButton color="#64D2FF" onClick={() => onNavigate('characters')}>
              HEROES
            </CyberButton>
            <CyberButton color="#30D158" onClick={() => onNavigate('story')}>
              SAGA
            </CyberButton>
            <CyberButton color="#0A84FF" onClick={() => onNavigate('tails')}>
              9 TAILS
            </CyberButton>
            <CyberButton color="#8E8E93" onClick={() => onNavigate('gallery')}>
              GALLERY
            </CyberButton>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        animation: 'floatBounce 2s infinite',
      }}>
        <div style={{
          width: '24px', height: '40px', borderRadius: '12px',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', justifyContent: 'center', paddingTop: '8px',
        }}>
          <div style={{
            width: '4px', height: '8px', borderRadius: '2px',
            backgroundColor: 'rgba(255,255,255,0.6)', animation: 'scrollDot 2s infinite',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes floatBounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-10px); } }
        @keyframes scrollDot { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(12px); } }
      `}</style>
    </section>
  );
}

function CyberButton({ children, color, onClick, primary = false }: {
  children: React.ReactNode; color: string; onClick: () => void; primary?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: primary
          ? hovered ? `${color}40` : `${color}25`
          : hovered ? `${color}15` : 'transparent',
        border: `1px solid ${hovered ? color : `${color}60`}`,
        color: 'white', padding: '0.75rem 1.5rem',
        fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem',
        letterSpacing: '0.15em', cursor: 'pointer',
        transition: 'all 0.2s ease', borderRadius: '4px',
        boxShadow: hovered ? `0 0 20px ${color}30` : 'none',
      }}
    >
      {children}
    </button>
  );
}

function CharactersSection() {
  return (
    <section style={{ minHeight: '100vh', padding: '8rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader label="THE WARRIORS" title="MEET THE" highlight="LEGENDS" subtitle="Two brothers. One destiny. A fusion that cannot be erased." />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem', marginBottom: '4rem',
        }}>
          {CHARACTERS.map((char) => (
            <div key={char.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${char.color}20`,
              borderRadius: '12px', padding: '1.5rem',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: `${char.color}20`, boxShadow: `0 0 20px ${char.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <span style={{ color: char.color, fontSize: '1.2rem', fontWeight: 'bold' }}>{char.name[0]}</span>
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.25rem' }}>
                {char.name}
              </h3>
              <p style={{ color: char.color, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                {char.title} &bull; {char.element}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {char.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TailsSection() {
  return (
    <section style={{ minHeight: '100vh', padding: '8rem 1.5rem 4rem', background: 'rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader label="THE NINE-TAIL SYSTEM" title="NINE TAILS OF" highlight="POWER" subtitle="Kai-Jax always has nine tails. The world only allows him to express some." />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {TAILS.map((tail) => (
            <div key={tail.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${tail.color}15`,
              borderRadius: '12px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: `${tail.color}20`, boxShadow: `0 0 20px ${tail.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: tail.color, fontSize: '1.1rem', fontWeight: 'bold' }}>{tail.id}</span>
                </div>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'rgba(255,255,255,0.06)' }}>
                  {String(tail.id).padStart(2, '0')}
                </span>
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: tail.color, marginBottom: '0.25rem' }}>
                {tail.name}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                {tail.element} &bull; {tail.use}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {tail.description}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  SIGNATURE MOVE
                </p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", color: tail.color, fontSize: '0.95rem' }}>
                  {tail.signature}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '3rem', textAlign: 'center',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '12px', padding: '2rem', maxWidth: '600px', margin: '3rem auto 0',
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", color: '#BF5AF2', fontSize: '1rem', marginBottom: '0.75rem' }}>The Ninth Tail</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "Not power. Not spectacle. It appears only when internal conflict ends. It settles. The world stops correcting him."
          </p>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section style={{ minHeight: '100vh', padding: '8rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <SectionHeader label="THE GENESIS SAGA" title="BOOKS" highlight="1-3" subtitle="From the streets of Raging City to the throne of memory itself." />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {STORY_ACTS.map((act) => (
            <div key={act.number} style={{
              background: 'rgba(255,255,255,0.03)',
              borderLeft: `4px solid ${act.color}`,
              borderRadius: '0 12px 12px 0', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    ACT {act.number}
                  </p>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: act.color }}>
                    {act.title}
                  </h3>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '999px',
                  background: `${act.color}15`, color: act.color,
                  fontSize: '0.7rem', letterSpacing: '0.1em',
                }}>
                  {act.theme}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {act.events.map((event, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', padding: '0.25rem 0' }}>
                    &bull; {event}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '3rem', textAlign: 'center',
          background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '12px', padding: '2rem',
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", color: '#BF5AF2', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.6 }}>
            "Memory cannot be designed out of existence."
          </p>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section style={{ minHeight: '100vh', padding: '8rem 1.5rem 4rem', background: 'rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader label="THE GALLERY" title="CHARACTER" highlight="ART" subtitle="Concept art and character variations - Production canon locked." />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}>
          {GALLERY_IMAGES.map((img) => (
            <div key={img.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px', overflow: 'hidden',
              transition: 'transform 0.3s ease',
            }}>
              <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)',
                }} />
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#BF5AF2', marginBottom: '0.25rem' }}>
                  {img.title}
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                  {img.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdventureCharacterSelect({ onSelect, onBack }: { onSelect: (id: string) => void; onBack: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
    }}>
      <button onClick={onBack} style={{
        position: 'absolute', top: '1.5rem', left: '1.5rem',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer',
      }}>
        BACK
      </button>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '3rem', color: 'white', letterSpacing: '0.15em',
        marginBottom: '0.5rem', textAlign: 'center',
      }}>
        ADVENTURE <span style={{ color: '#BF5AF2' }}>MODE</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', textAlign: 'center', maxWidth: '500px' }}>
        Follow the story of the Beast-Kin twins. Only Kai, Jax, or the fused Kai-Jax can enter the story campaign.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {ADVENTURE_HEROES.map((hero) => {
          const isHovered = hoveredId === hero.id;
          const isLocked = !!(hero as any).locked;
          return (
            <button
              key={hero.id}
              onClick={() => !isLocked && onSelect(hero.id)}
              onMouseEnter={() => setHoveredId(hero.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                width: '240px', padding: '2rem 1.5rem',
                background: isLocked ? 'rgba(255,255,255,0.03)' : isHovered
                  ? `linear-gradient(135deg, ${hero.color}25, ${hero.color}08)`
                  : 'rgba(255,255,255,0.06)',
                border: `2px solid ${isLocked ? 'rgba(255,255,255,0.08)' : isHovered ? hero.color : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '16px', cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered && !isLocked ? 'translateY(-6px) scale(1.03)' : 'none',
                boxShadow: isHovered && !isLocked ? `0 12px 40px ${hero.color}35` : 'none',
                opacity: isLocked ? 0.5 : 1,
                textAlign: 'center' as const,
              }}
            >
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: `radial-gradient(circle, ${hero.color}50, ${hero.color}15)`,
                margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${hero.color}60`,
                fontSize: '2rem', fontWeight: 'bold', color: hero.color,
              }}>
                {isLocked ? '?' : hero.name[0]}
              </div>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.5rem', color: isLocked ? 'rgba(255,255,255,0.4)' : 'white',
                letterSpacing: '0.1em', margin: 0,
              }}>
                {hero.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: hero.color, letterSpacing: '0.12em', textTransform: 'uppercase' as const, margin: '0.3rem 0 0.8rem' }}>
                {hero.subtitle}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
                {hero.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GameCharacterSelect({ onSelect, onBack, mode }: { onSelect: (id: string) => void; onBack: () => void; mode: 'versus' | 'battleworld' }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const modeConfig = mode === 'versus'
    ? { title: 'VERSUS', accent: '#FF3B30', subtitle: 'Choose your fighter for head-to-head combat.' }
    : { title: 'BATTLEWORLD', accent: '#FFD60A', subtitle: 'Choose your warrior for endless wave survival.' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'auto', padding: '2rem',
    }}>
      <button onClick={onBack} style={{
        position: 'absolute', top: '1.5rem', left: '1.5rem',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer',
      }}>
        BACK
      </button>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '3rem', color: 'white', letterSpacing: '0.15em',
        marginBottom: '0.5rem', textAlign: 'center', marginTop: '1rem',
      }}>
        {modeConfig.title} <span style={{ color: modeConfig.accent }}>MODE</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', textAlign: 'center' }}>
        {modeConfig.subtitle} All {ALL_CHARACTERS.length} Beast-Kin warriors available.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem', maxWidth: '1000px', width: '100%',
      }}>
        {ALL_CHARACTERS.map((char) => {
          const isHovered = hoveredId === char.id;
          return (
            <button
              key={char.id}
              onClick={() => onSelect(char.id)}
              onMouseEnter={() => setHoveredId(char.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, ${char.color}30, ${char.color}10)`
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isHovered ? char.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', padding: '1.25rem', cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none',
                boxShadow: isHovered ? `0 8px 32px ${char.color}40` : 'none',
              }}
            >
              <div style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: `radial-gradient(circle, ${char.color}60, ${char.color}20)`,
                margin: '0 auto 0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${char.color}80`,
              }}>
                <span style={{ fontSize: '1.3rem', color: char.color, fontWeight: 'bold' }}>
                  {char.name[0]}
                </span>
              </div>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1rem', color: 'white', letterSpacing: '0.1em', margin: 0,
              }}>
                {char.name}
              </p>
              <p style={{
                fontSize: '0.6rem', color: char.color,
                letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                margin: '0.2rem 0 0',
              }}>
                {char.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ label, title, highlight, subtitle }: {
  label: string; title: string; highlight: string; subtitle: string;
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <p style={{
        fontFamily: "'Inter', sans-serif", color: '#BF5AF2', fontSize: '0.75rem',
        letterSpacing: '0.3em', marginBottom: '0.75rem',
      }}>
        {label}
      </p>
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white',
        marginBottom: '0.75rem',
      }}>
        {title} <span style={{ color: '#BF5AF2' }}>{highlight}</span>
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
        {subtitle}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      padding: '3rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)',
      textAlign: 'center',
    }}>
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>
        LEGENDS OF <span style={{ color: '#BF5AF2' }}>KAI-JAX</span>
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '1rem' }}>
        "Forged in the Raging City. Crowned by Memory."
      </p>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
        Beast-Kin Sovereignty: Genesis
      </p>
    </footer>
  );
}

function App() {
  const [section, setSection] = useState<AppSection>('home');
  const [selectedCharacter, setSelectedCharacter] = useState('KAITEENFOX');
  const [gameMode, setGameMode] = useState<GameMode>('adventure');

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bg = new Audio('/sounds/background.mp3');
    bg.loop = true;
    bg.volume = 0.25;
    bgMusicRef.current = bg;
  }, []);

  const startMusic = () => {
    if (bgMusicRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(() => {});
    }
  };

  if (section === 'adventure' || section === 'versus' || section === 'battleworld') {
    return (
      <AdventureArena
        characterId={selectedCharacter}
        onBack={() => setSection('home')}
      />
    );
  }

  if (section === 'adventure-select') {
    return (
      <AdventureCharacterSelect
        onSelect={(id) => {
          setSelectedCharacter(id);
          setGameMode('adventure');
          setSection('adventure');
        }}
        onBack={() => setSection('home')}
      />
    );
  }

  if (section === 'versus-select') {
    return (
      <GameCharacterSelect
        mode="versus"
        onSelect={(id) => {
          setSelectedCharacter(id);
          setGameMode('versus');
          setSection('versus');
        }}
        onBack={() => setSection('home')}
      />
    );
  }

  if (section === 'battleworld-select') {
    return (
      <GameCharacterSelect
        mode="battleworld"
        onSelect={(id) => {
          setSelectedCharacter(id);
          setGameMode('battleworld');
          setSection('battleworld');
        }}
        onBack={() => setSection('home')}
      />
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'characters': return <CharactersSection />;
      case 'tails': return <TailsSection />;
      case 'story': return <StorySection />;
      case 'gallery': return <GallerySection />;
      default: return <HeroSection onNavigate={setSection} />;
    }
  };

  return (
    <div
      onClick={startMusic}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
        color: 'white',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <ParticleBackground />
      <Navigation activeSection={section} onNavigate={setSection} />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {renderSection()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
