import React, { useRef, useState } from 'react';
import {
  Crosshair,
  Flame,
  Hand,
  Link2,
  Menu,
  Pause,
  RefreshCw,
  Shield,
  Sparkles,
  Swords,
  Wind,
  Zap,
} from 'lucide-react';
import { HERO_ABILITIES } from '../game/data/abilitiesData';
import { GameEngine } from '../game/engine/GameEngine';
import { GameSettings, HudSnapshot } from '../game/types';
import { ComboMeterWidget } from './ComboMeterWidget';

interface GameHUDProps {
  hud: HudSnapshot;
  settings: GameSettings;
  engineRef: React.RefObject<GameEngine | null>;
  onOpenHub: (tab?: 'missions' | 'skills' | 'gear' | 'map' | 'canon' | 'settings') => void;
  onRetryCheckpoint: () => void;
  onStartPatrol: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  settings,
  engineRef,
  onOpenHub,
  onRetryCheckpoint,
  onStartPatrol,
}) => {
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0, active: false });
  const joyOrigin = useRef({ x: 0, y: 0 });
  const camLast = useRef<{ id: number; x: number; y: number } | null>(null);
  const [sprintLocked, setSprintLocked] = useState(false);

  const abilities = HERO_ABILITIES[hud.activeHero];
  const scale = settings.hudButtonScale;
  const opacity = settings.hudOpacity;
  const edge = settings.hudEdgeOffset;

  const haptic = (ms = 12) => {
    if (settings.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Virtual Joystick Handlers
  const onJoyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    joyOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoy(e.clientX, e.clientY, true);
  };

  const onJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joyKnob.active) return;
    updateJoy(e.clientX, e.clientY, true);
  };

  const onJoyUp = () => {
    setJoyKnob({ x: 0, y: 0, active: false });
    engineRef.current?.setTouchMove(0, 0);
  };

  const updateJoy = (cx: number, cy: number, active: boolean) => {
    const maxR = 42;
    const dx = cx - joyOrigin.current.x;
    const dy = cy - joyOrigin.current.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clamped;
    const ky = Math.sin(angle) * clamped;
    setJoyKnob({ x: kx, y: ky, active });
    engineRef.current?.setTouchMove(kx / maxR, ky / maxR);
  };

  // Touch Camera Drag Handlers
  const onCamDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    camLast.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };

  const onCamMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!camLast.current || camLast.current.id !== e.pointerId) return;
    const dx = e.clientX - camLast.current.x;
    const dy = e.clientY - camLast.current.y;
    camLast.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    engineRef.current?.addCameraDelta(dx, dy);
  };

  const onCamUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (camLast.current?.id === e.pointerId) camLast.current = null;
  };

  const heroColor =
    hud.activeHero === 'kai'
      ? 'text-violet-300 border-violet-500/60'
      : hud.activeHero === 'jax'
        ? 'text-sky-300 border-sky-500/60'
        : 'text-amber-300 border-amber-400/80';

  const hpBarColor =
    settings.colorblindMode === 'deuteranopia' || settings.colorblindMode === 'protanopia'
      ? 'bg-sky-400'
      : hud.activeHero === 'kai'
        ? 'bg-violet-500'
        : hud.activeHero === 'jax'
          ? 'bg-sky-400'
          : 'bg-amber-400';

  const activeHp = hud.activeHero === 'jax' ? hud.jaxHp : hud.kaiHp;
  const activeMaxHp = hud.activeHero === 'jax' ? hud.jaxMaxHp : hud.kaiMaxHp;
  const activeEn = hud.activeHero === 'jax' ? hud.jaxEnergy : hud.kaiEnergy;
  const activeMaxEn = hud.activeHero === 'jax' ? hud.jaxMaxEnergy : hud.kaiMaxEnergy;

  const compName = hud.activeHero === 'kai' ? 'JAX' : 'KAI';
  const compHp = hud.activeHero === 'kai' ? hud.jaxHp : hud.kaiHp;
  const compMaxHp = hud.activeHero === 'kai' ? hud.jaxMaxHp : hud.kaiMaxHp;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none safe-area-pad">
      {/* Camera Swipe Surface behind HUD controls */}
      <div
        onPointerDown={onCamDown}
        onPointerMove={onCamMove}
        onPointerUp={onCamUp}
        onPointerCancel={onCamUp}
        className="absolute inset-0 pointer-events-auto"
        aria-label="Camera orbit touch area"
      />

      {/* Floating Damage & Status Numbers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hud.floatingDamages.map((fd) => (
          <div
            key={fd.id}
            style={{
              transform: `translate(${fd.x}px, ${fd.y}px)`,
              opacity: Math.max(0, 1 - fd.age / 0.85),
              color: fd.color,
            }}
            className={`absolute top-0 left-0 font-mono-tabular font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
              fd.isCrit ? 'text-lg' : 'text-sm'
            }`}
          >
            {fd.label ?? (fd.isCrit ? `CRIT ${fd.amount}` : fd.amount)}
          </div>
        ))}
      </div>

      {/* TOP BAR: Hero Status + Boss / Mission Objective + Menu */}
      <div
        className="relative z-20 flex items-start justify-between gap-3 p-3 sm:p-4 pointer-events-none"
        style={{ paddingLeft: `${edge}px`, paddingRight: `${edge}px` }}
      >
        {/* Top-Left: Active Hero & Companion Vitals + Objective */}
        <div className="flex flex-col gap-2 max-w-[280px] sm:max-w-[330px] pointer-events-auto">
          <div className="rounded-xl bg-[#0a0b10]/90 border border-slate-800 p-3 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className={`font-display text-lg font-bold tracking-wide px-2 py-0.5 rounded border bg-[#131620] ${heroColor}`}>
                {hud.activeHero === 'kaijax' ? 'KAI-JAX (FUSED)' : hud.activeHero.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono-tabular text-slate-300">
                {hud.traversalState} · {hud.fpsEstimate} FPS
              </span>
            </div>

            {/* HP */}
            <div className="mt-2">
              <div className="flex justify-between text-[11px] font-mono-tabular text-slate-200 mb-0.5">
                <span>HP</span>
                <span>{activeHp} / {activeMaxHp}</span>
              </div>
              <div
                className="h-2 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-label="Hero Health"
                aria-valuenow={activeHp}
                aria-valuemin={0}
                aria-valuemax={activeMaxHp}
              >
                <div
                  className={`h-full transition-[width] duration-150 ${hpBarColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, (activeHp / activeMaxHp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="mt-1.5">
              <div className="flex justify-between text-[11px] font-mono-tabular text-slate-300 mb-0.5">
                <span>Energy</span>
                <span>{activeEn} / {activeMaxEn}</span>
              </div>
              <div
                className="h-1.5 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-label="Hero Energy"
                aria-valuenow={activeEn}
                aria-valuemin={0}
                aria-valuemax={activeMaxEn}
              >
                <div
                  className="h-full bg-orange-400 transition-[width] duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (activeEn / activeMaxEn) * 100))}%` }}
                />
              </div>
            </div>

            {/* Duo Synergy Meter */}
            <div className="mt-1.5">
              <div className="flex justify-between text-[11px] font-mono-tabular text-slate-300 mb-0.5">
                <span>Duo Synergy</span>
                <span className={hud.duoSynergy >= 50 ? 'text-amber-300 font-semibold' : ''}>
                  {hud.duoSynergy}% {hud.duoFinisherReady ? '· FINISHER READY' : ''}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-label="Duo Synergy Meter"
                aria-valuenow={hud.duoSynergy}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full transition-[width] duration-150 ${
                    hud.duoSynergy >= 50 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, hud.duoSynergy))}%` }}
                />
              </div>
            </div>

            {/* Fusion Gauge, Style Score & Companion Mini-Readout */}
            <div className="mt-2 pt-2 border-t border-slate-700/90 flex items-center justify-between gap-2 text-[11px] font-mono-tabular">
              {!hud.isFused ? (
                <span className="text-slate-200">
                  Ally {compName}: {compHp}/{compMaxHp}
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  Tri-Tail Form: {hud.fusionTimeLeft.toFixed(1)}s
                </span>
              )}
              <span className={hud.fusionUnlocked ? 'text-amber-300' : 'text-slate-300'}>
                {hud.fusionUnlocked ? `Fusion ${hud.fusionCharge}%` : `Style ${hud.styleScore}`}
              </span>
            </div>
          </div>

          {/* Active Mission Objective */}
          <div className="rounded-xl bg-[#0a0b10]/90 border border-slate-700/90 px-3 py-2 text-xs">
            <div className="font-semibold text-amber-300">{hud.missionStepTitle}</div>
            <div className="text-slate-100 mt-0.5 leading-snug">{hud.missionObjective}</div>
            <div className="mt-1 text-[11px] text-slate-300 font-mono-tabular">
              Civilians {hud.rescuedCivilians}/{hud.totalCivilians} · Fragments {hud.memoryFragments}
            </div>
          </div>
        </div>

        {/* Top-Center: Boss Bar OR Locked Target + Combo */}
        <div className="hidden md:flex flex-col items-center gap-2 min-w-[280px] max-w-md">
          {hud.bossName && (
            <div className="w-full rounded-xl bg-[#0a0b10]/92 border border-red-500/50 px-4 py-2.5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="font-display text-lg tracking-wide text-red-300">{hud.bossName}</span>
                <span className="font-mono-tabular text-slate-300">
                  Phase {hud.bossPhase} · {hud.bossHp}/{hud.bossMaxHp}
                </span>
              </div>
              <div
                className="mt-1 h-2.5 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-label="Boss Health"
                aria-valuenow={hud.bossHp}
                aria-valuemin={0}
                aria-valuemax={hud.bossMaxHp}
              >
                <div
                  className="h-full bg-red-500 transition-[width] duration-150"
                  style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%` }}
                />
              </div>
              {hud.bossArmor > 0 && (
                <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-[width] duration-150"
                    style={{ width: `${(hud.bossArmor / Math.max(1, hud.bossMaxArmor)) * 100}%` }}
                  />
                </div>
              )}
              {hud.bossTelegraph && (
                <div className="mt-1.5 text-center text-[11px] font-bold tracking-wider text-amber-300">
                  WARNING: {hud.bossTelegraph}
                </div>
              )}
            </div>
          )}

          {!hud.bossName && hud.lockedTargetName && (
            <div className="w-64 rounded-xl bg-[#0a0b10]/90 border border-amber-500/40 px-3 py-2">
              <div className="flex justify-between text-xs text-amber-200 font-semibold">
                <span>Locked: {hud.lockedTargetName}</span>
                <span className="font-mono-tabular">{hud.lockedTargetHp}/{hud.lockedTargetMaxHp}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${(hud.lockedTargetHp / hud.lockedTargetMaxHp) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Menu, Pause & Animated Combo Counter Widget */}
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => onOpenHub('skills')}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0a0b10]/90 border border-slate-700 hover:border-amber-400/60 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Menu / Skills</span>
            </button>
            <button
              onClick={() => onOpenHub('missions')}
              aria-label="Pause Game"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-[#0a0b10]/90 border border-slate-700 hover:border-slate-500 text-slate-100 transition-colors shrink-0"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          <ComboMeterWidget
            comboCount={hud.comboCount}
            comboTimer={hud.comboTimer}
            comboMaxTimer={hud.comboMaxTimer}
            comboBrokenSeq={hud.comboBrokenSeq}
            lastBrokenCombo={hud.lastBrokenCombo}
            activeHero={hud.activeHero}
            reducedMotion={settings.reducedMotion}
            colorblindMode={settings.colorblindMode}
          />
        </div>
      </div>

      {/* Mobile Boss Bar Banner (shown below top bar on small screens) */}
      {hud.bossName && (
        <div className="md:hidden mx-4 mt-1 rounded-xl bg-[#0a0b10]/92 border border-red-500/50 px-3 py-2 pointer-events-none">
          <div className="flex justify-between text-xs font-semibold text-red-300">
            <span>{hud.bossName} (Phase {hud.bossPhase})</span>
            <span className="font-mono-tabular">{hud.bossHp}/{hud.bossMaxHp}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%` }} />
          </div>
          {hud.bossTelegraph && (
            <div className="mt-1 text-center text-[10px] font-bold text-amber-300">{hud.bossTelegraph}</div>
          )}
        </div>
      )}

      {/* Contextual Interact / Counter / Duo Finisher Prompts (Center-Bottom above thumbs) */}
      {(hud.interactPrompt || hud.counterWindowActive || hud.duoFinisherReady || hud.activeFinisherName) && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2.5 pointer-events-auto">
          {hud.activeFinisherName && (
            <div className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0b10]/95 border border-amber-400 text-amber-300 font-display text-lg tracking-wide shadow-2xl">
              <Sparkles className="w-4 h-4" />
              <span>{hud.activeFinisherName}</span>
            </div>
          )}

          {hud.counterWindowActive && !hud.activeFinisherName && (
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                haptic(18);
                engineRef.current?.triggerLightAttack();
              }}
              className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 border border-amber-300 text-white font-bold text-xs shadow-xl active:scale-95 whitespace-nowrap shrink-0"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>COUNTER STRIKE [Attack]</span>
            </button>
          )}

          {hud.duoFinisherReady && !hud.activeFinisherName && (
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                haptic(26);
                engineRef.current?.triggerDuoFinisher();
              }}
              className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 border border-amber-200 text-slate-950 font-bold text-xs shadow-xl active:scale-95 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>DUO FINISHER [G / Atk+Web]</span>
            </button>
          )}

          {hud.interactPrompt && (
            <button
              onClick={() => {
                haptic(18);
                engineRef.current?.triggerInteract();
              }}
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm shadow-xl transition-transform active:scale-95 whitespace-nowrap shrink-0"
            >
              <Hand className="w-4 h-4" />
              <span>{hud.interactPrompt} [E]</span>
            </button>
          )}
        </div>
      )}

      {/* BOTTOM LEFT: Virtual Movement Joystick + Sprint Lock */}
      <div
        className="fixed bottom-4 z-20 flex items-end gap-3 pointer-events-auto"
        style={{
          left: `${edge}px`,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'bottom left',
        }}
      >
        <div
          onPointerDown={onJoyDown}
          onPointerMove={onJoyMove}
          onPointerUp={onJoyUp}
          onPointerCancel={onJoyUp}
          className="relative w-32 h-32 rounded-full bg-[#0a0b10]/75 border-2 border-slate-600/70 flex items-center justify-center touch-none"
          aria-label="Movement Joystick"
        >
          <div
            className="w-12 h-12 rounded-full bg-slate-200/85 border-2 border-amber-400 shadow-lg pointer-events-none"
            style={{
              transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)`,
            }}
          />
        </div>

        <button
          onClick={() => {
            const next = !sprintLocked;
            setSprintLocked(next);
            engineRef.current?.setTouchSprint(next);
            haptic();
          }}
          className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
            sprintLocked
              ? 'bg-sky-600 border-sky-400 text-white'
              : 'bg-[#0a0b10]/85 border-slate-700 text-slate-300'
          }`}
        >
          {sprintLocked ? 'Sprint On' : 'Sprint'}
        </button>
      </div>

      {/* BOTTOM RIGHT: Combat, Abilities, Switch, Lock-on, Jump/Web-Swing, Fusion */}
      <div
        className="fixed bottom-4 z-20 flex flex-col items-end gap-2.5 pointer-events-auto"
        style={{
          right: `${edge}px`,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'bottom right',
        }}
      >
        {/* Top Utility Row: Lock-On, Switch Hero, Fusion */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptic();
              engineRef.current?.triggerLockOn();
            }}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 ${
              hud.lockedTargetName
                ? 'bg-amber-500 border-amber-300 text-slate-950'
                : 'bg-[#0a0b10]/88 border-slate-700 text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Lock</span>
          </button>

          <button
            onClick={() => {
              haptic(16);
              engineRef.current?.triggerSwitchHero();
            }}
            disabled={hud.isFused}
            className="min-h-[44px] px-3 rounded-xl bg-[#0a0b10]/88 border border-slate-700 hover:border-sky-400 disabled:opacity-40 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Switch [Tab]</span>
          </button>

          <button
            onClick={() => {
              haptic(25);
              engineRef.current?.triggerFusion();
            }}
            disabled={!hud.fusionUnlocked || (!hud.isFused && hud.fusionCharge < 100)}
            className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
              hud.isFused
                ? 'bg-amber-500 border-amber-300 text-slate-950'
                : hud.fusionUnlocked && hud.fusionCharge >= 100
                  ? 'bg-violet-600 border-amber-400 text-white'
                  : 'bg-[#0a0b10]/90 border-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {hud.isFused
                ? 'Unfuse'
                : !hud.fusionUnlocked
                  ? 'Fusion Locked'
                  : hud.fusionCharge >= 100
                    ? 'FUSE [F]'
                    : `Fuse ${hud.fusionCharge}%`}
            </span>
          </button>
        </div>

        {/* Middle Row: 3 Active Hero Abilities */}
        <div className="flex items-center gap-2">
          {abilities.map((ab, idx) => {
            const cd = hud.abilityCooldowns[idx];
            return (
              <button
                key={ab.id}
                onClick={() => {
                  haptic(14);
                  engineRef.current?.triggerAbility((idx + 1) as 1 | 2 | 3);
                }}
                className="relative min-h-[48px] min-w-[68px] px-2.5 py-1.5 rounded-xl bg-[#0a0b10]/90 border border-slate-700 hover:border-slate-400 text-left flex flex-col justify-between overflow-hidden active:scale-95"
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tabular text-slate-200">
                  <span>[{idx + 1}]</span>
                  <span>{ab.energyCost} EN</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-100 truncate max-w-[78px]">
                  {ab.name}
                </div>
                {cd > 0 && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center font-mono-tabular text-xs font-bold text-amber-300">
                    {cd.toFixed(1)}s
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Primary Combat, Web/Storm Tactical & Traversal Row */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              haptic();
              engineRef.current?.startDefenseInput();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              engineRef.current?.endDefenseInput();
            }}
            onPointerCancel={() => {
              engineRef.current?.endDefenseInput();
            }}
            className={`min-h-[52px] min-w-[62px] px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center touch-none active:scale-95 ${
              hud.isBlocking
                ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                : 'bg-[#131620]/95 border-slate-600 text-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>{hud.isBlocking ? 'Blocking' : 'Block/Parry'}</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              haptic(12);
              engineRef.current?.triggerTacticalAction();
            }}
            className="relative min-h-[52px] min-w-[64px] px-2.5 rounded-xl bg-[#131a29]/95 border border-violet-400/60 text-violet-100 text-xs font-semibold flex flex-col items-center justify-center touch-none overflow-hidden active:scale-95"
          >
            <Link2 className="w-4 h-4 text-violet-300" />
            <span>{hud.tacticalActionLabel}</span>
            {hud.tacticalCooldown > 0 && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center font-mono-tabular text-[11px] font-bold text-amber-300">
                {hud.tacticalCooldown.toFixed(1)}s
              </div>
            )}
          </button>

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              haptic();
              engineRef.current?.triggerJumpOrSwing();
            }}
            className={`min-h-[52px] min-w-[60px] px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center touch-none active:scale-95 ${
              hud.canWebSwing
                ? 'bg-orange-600 border-orange-300 text-white'
                : 'bg-[#131620]/95 border-slate-600 text-slate-100'
            }`}
          >
            <Wind className="w-4 h-4 text-sky-300" />
            <span>{hud.canWebSwing ? 'Web Swing' : 'Jump'}</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              haptic(14);
              engineRef.current?.triggerHeavyAttack();
            }}
            className="min-h-[56px] min-w-[62px] px-2.5 rounded-xl bg-[#1a1625]/95 border border-orange-500/60 text-orange-200 text-xs font-bold flex flex-col items-center justify-center touch-none active:scale-95"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Heavy</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              haptic(10);
              engineRef.current?.triggerLightAttack();
            }}
            className="min-h-[64px] min-w-[70px] px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex flex-col items-center justify-center shadow-xl touch-none active:scale-95"
          >
            {hud.activeHero === 'jax' ? <Zap className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
            <span>{hud.counterWindowActive ? 'Counter!' : 'Attack'}</span>
          </button>
        </div>

        {/* Discrete Desktop Keybind Hint */}
        <div className="hidden lg:block text-[10px] text-slate-300 font-mono-tabular bg-[#0a0b10]/85 px-2.5 py-0.5 rounded border border-slate-800">
          WASD Move · Space Jump/Swing · J/K Attack · U Web/Storm · Q Block/Parry ({settings.parryTiming === 'generous' ? '0.16s' : '0.10s'}) · G Duo Finisher · 1-3 Skills · Tab Switch
        </div>
      </div>

      {/* GAME OVER MODAL */}
      {hud.isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
          <div className="max-w-md w-full rounded-2xl bg-[#131620] border border-red-500/50 p-6 text-center shadow-2xl">
            <h2 className="font-display text-3xl font-bold text-red-400">Brothers Down</h2>
            <p className="mt-2 text-sm text-slate-300">
              Both Kai and Jax fell in Ashblock Heights. Reload from your latest checkpoint with all earned progression intact.
            </p>
            <button
              onClick={onRetryCheckpoint}
              className="mt-5 w-full min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
            >
              Retry from Checkpoint
            </button>
          </div>
        </div>
      )}

      {/* VICTORY BANNER */}
      {hud.isVictory && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="rounded-2xl bg-[#0a0b10]/95 border border-amber-400/70 px-6 py-4 shadow-2xl flex flex-wrap items-center gap-4">
            <div>
              <div className="font-display text-2xl font-bold text-amber-300">
                Mission 1 Complete: Ashblock Liberated
              </div>
              <div className="text-xs text-slate-300">
                Kai-Jax Fusion &amp; Pyraxis/Kar-Voth armor trims unlocked.
              </div>
            </div>
            <button
              onClick={onStartPatrol}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
            >
              Launch Patrol Skirmish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
