import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useRunner } from '../../lib/stores/useRunner';
import { useAudio } from '../../lib/stores/useAudio';
import { Settings, UserCheck, Play } from 'lucide-react';
import { BRAND } from '../../lib/brand';
import { getFighterById } from '../../lib/characters';
import OptimizedBeastModel from './models/OptimizedBeastModel';


function TitleHeroStage() {
  const compact = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 1024, []);
  const kai = compact ? null : getFighterById('kai');
  const jax = compact ? null : getFighterById('jax');

  // Compact devices keep the approved city/title composition but do not
  // preload two additional heavyweight GLBs before gameplay. Those devices
  // reserve model memory for the fighter the player actually controls.
  if (compact || (!kai && !jax)) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0 top-[7%] z-[4] w-[58%] min-w-[560px] max-md:w-[72%] max-md:min-w-[420px] max-sm:opacity-45"
      aria-hidden="true"
      data-testid="title-live-hero-stage"
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.45, 7.4], fov: 36 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#000000'), 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.16;
        }}
      >
        <ambientLight intensity={0.85} color="#76698f" />
        <directionalLight
          castShadow
          position={[3.8, 6.5, 5.5]}
          intensity={3.2}
          color="#f0c783"
        />
        <directionalLight position={[-4, 3, 1]} intensity={2.8} color="#7c4dff" />
        <pointLight position={[1.5, 2.2, 3.2]} intensity={20} distance={8} color="#55b7ff" />
        <pointLight position={[-1.8, 1.8, 2.4]} intensity={16} distance={7} color="#b85cff" />

        <Suspense fallback={null}>
          {kai ? (
            <group position={[-0.85, -1.45, 0.05]} rotation={[0, -0.14, 0]}>
              <OptimizedBeastModel
                beast={kai}
                emotionIntensity={0.28}
                isMoving={false}
                isRunning={false}
                isAttacking={false}
                locomotionState="neutral"
              />
            </group>
          ) : null}
          {jax ? (
            <group position={[1.18, -1.42, -0.35]} rotation={[0, 0.14, 0]} scale={1.07}>
              <OptimizedBeastModel
                beast={jax}
                emotionIntensity={0.22}
                isMoving={false}
                isRunning={false}
                isAttacking={false}
                locomotionState="neutral"
              />
            </group>
          ) : null}
        </Suspense>
      </Canvas>
      <div className="absolute inset-x-[8%] bottom-[6%] h-24 rounded-[50%] bg-purple-500/10 blur-3xl" />
    </div>
  );
}

export default function TitleScreen() {
  const { setGameState } = useRunner();
  const { playVictory } = useAudio();

  const handleStart = () => {
    playVictory();
    setGameState('menu');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handleStart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const releaseVersion = import.meta.env.VITE_RELEASE_VERSION || 'dev';
  const releaseSha = (import.meta.env.VITE_RELEASE_SHA || 'local').slice(0, 7);

  return (
    <div
      data-testid="title-screen"
      className="kj-vision-shell kj-vision-city-vignette fixed inset-0 z-50 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_22%,rgba(128,58,180,.20),transparent_24%),linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.54))]" />
      <div className="absolute right-[9%] top-[12%] h-[56vh] w-[36vw] min-w-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,112,255,.18),rgba(78,24,118,.04)_45%,transparent_72%)] blur-[1px]" />
      <div className="absolute right-[12%] top-[5%] h-[42vh] w-[34vw] rounded-full border border-purple-300/[0.035] bg-[radial-gradient(circle,rgba(196,150,255,.11),rgba(84,39,130,.025)_48%,transparent_72%)] shadow-[0_0_120px_rgba(157,78,221,.09)]" aria-hidden />
      <div className="absolute right-[22%] top-[4%] text-[min(20vw,240px)] leading-none text-purple-200/[0.055] drop-shadow-[0_0_45px_rgba(168,85,247,.18)]" aria-hidden>
        ✦
      </div>

      <TitleHeroStage />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="kj-vision-panel px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--kj-muted)]">
          <span data-testid="title-release-metadata">VER. {releaseVersion} | BUILD {releaseSha}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGameState('settings')}
            className="kj-vision-button flex items-center gap-2 px-4 py-2 text-xs"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={() => setGameState('save-slots')}
            className="kj-vision-button flex items-center gap-2 px-4 py-2 text-xs"
            aria-label="Switch profile"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-112px)] items-center px-7 sm:px-12 md:px-[7vw]">
        <section className="max-w-[660px] -translate-y-[3vh] md:max-w-[48vw]">
          <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.48em] text-[var(--kj-gold)]">
            <span className="h-px w-16 bg-[var(--kj-gold-dim)]" />
            Legends of
          </div>

          <h1
            className="kj-vision-title text-[clamp(68px,10vw,160px)] font-black leading-[0.78]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            KAI<span className="text-purple-400 drop-shadow-[0_0_16px_rgba(192,132,252,.9)]">✦</span>JAX
          </h1>

          <div className="kj-vision-divider my-5 max-w-xl" />

          <h2 className="kj-vision-subtitle text-[clamp(18px,2.4vw,36px)]">
            The Memory King
          </h2>

          <p className="mt-7 max-w-xl text-sm tracking-[0.12em] text-[#d4bd91] sm:text-base">
            {BRAND.shortTagline}
          </p>

          <div className="mt-10 max-w-xl">
            <button
              type="button"
              data-testid="title-begin-button"
              onClick={handleStart}
              className="kj-vision-button group flex w-full items-center justify-between px-6 py-4 text-sm sm:text-base"
              aria-label="Begin Legends of Kai-Jax"
            >
              <span className="flex items-center gap-3">
                <Play className="h-4 w-4 fill-current text-purple-300" aria-hidden />
                Enter the Raging City
              </span>
              <span className="text-[10px] tracking-[0.24em] text-[#9f9180]">ENTER / SPACE</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-4 left-6 right-6 z-10 flex items-end justify-between text-[10px] uppercase tracking-[0.2em] text-[#8e8578] sm:left-10 sm:right-10">
        <span>Memory is currency. Blood remembers.</span>
        <span>Raging City Saga</span>
      </footer>
    </div>
  );
}
