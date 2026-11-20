import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eye,
  EyeOff,
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
  dialogueOpen?: boolean;
  engineRef: React.RefObject<GameEngine | null>;
  onOpenHub: (tab?: 'missions' | 'skills' | 'gear' | 'map' | 'canon' | 'settings') => void;
  onRetryCheckpoint: () => void;
  onStartPatrol: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  settings,
  dialogueOpen = false,
  engineRef,
  onOpenHub,
  onRetryCheckpoint,
  onStartPatrol,
}) => {
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0, active: false });
  const joyOrigin = useRef({ x: 0, y: 0 });
  const joyPointerId = useRef<number | null>(null);
  const camLast = useRef<{ id: number; x: number; y: number } | null>(null);
  const [sprintLocked, setSprintLocked] = useState(false);
  const [zenHidden, setZenHidden] = useState(false);
  const [objectiveExpanded, setObjectiveExpanded] = useState(false);
  const [autoCompactViewport, setAutoCompactViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight < 540 || window.innerWidth < 960 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      setAutoCompactViewport(window.innerHeight < 540 || window.innerWidth < 960);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isCompact =
    settings.hudCompactMode === 'compact' ||
    (settings.hudCompactMode !== 'expanded' && autoCompactViewport);

  const abilities = HERO_ABILITIES[hud.activeHero];
  const scale = settings.hudButtonScale;
  const opacity = settings.hudOpacity;
  const edgeX = settings.hudEdgeOffset;
  const edgeY = settings.hudVerticalOffset ?? 10;

  const haptic = (ms = 12) => {
    if (settings.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Release transient controls when story dialogue, clean-view mode, or route changes
  // remove the joystick while a finger is still held down. Android WebView
  // does not guarantee a pointerup after a touch target unmounts.
  useEffect(() => {
    if (!dialogueOpen && !zenHidden) return;
    joyPointerId.current = null;
    camLast.current = null;
    setJoyKnob({ x: 0, y: 0, active: false });
    setSprintLocked(false);
    engineRef.current?.setTouchMove(0, 0);
    engineRef.current?.setTouchSprint(false);
  }, [dialogueOpen, zenHidden, engineRef]);

  // Leaving the game must never carry virtual movement into the next screen.
  useEffect(() => () => {
    engineRef.current?.setTouchMove(0, 0);
    engineRef.current?.setTouchSprint(false);
  }, [engineRef]);

  // Virtual Joystick Handlers (PointerId-isolated for reliable simultaneous multi-touch)
  const onJoyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joyPointerId.current !== null && joyPointerId.current !== e.pointerId) return;
    joyPointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    joyOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoy(e.clientX, e.clientY, true);
  };

  const onJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointerId.current !== e.pointerId) return;
    updateJoy(e.clientX, e.clientY, true);
  };

  const onJoyUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointerId.current !== null && joyPointerId.current !== e.pointerId) return;
    joyPointerId.current = null;
    setJoyKnob({ x: 0, y: 0, active: false });
    engineRef.current?.setTouchMove(0, 0);
  };

  const updateJoy = (cx: number, cy: number, active: boolean) => {
    const maxR = isCompact ? 34 : 42;
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
    // Only one camera pointer owns orbit; a second finger must not steal it.
    if (camLast.current && camLast.current.id !== e.pointerId) return;
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

  const heroAccentText =
    hud.activeHero === 'kai'
      ? 'text-violet-300'
      : hud.activeHero === 'jax'
        ? 'text-sky-300'
        : 'text-amber-300';

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

  const showObjectiveBody = !isCompact || objectiveExpanded;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none safe-area-pad">
      {/* Camera Swipe Surface behind HUD controls */}
      <div
        onPointerDown={onCamDown}
        onPointerMove={onCamMove}
        onPointerUp={onCamUp}
        onPointerCancel={onCamUp}
        onLostPointerCapture={onCamUp}
        className="absolute inset-0 pointer-events-auto"
        aria-label="Camera orbit touch area"
      />

      {/* World-Projected On-Target Reticle Diamond */}
      {!zenHidden &&
        !dialogueOpen &&
        hud.lockedTargetScreenX !== null &&
        hud.lockedTargetScreenX !== undefined &&
        hud.lockedTargetScreenY !== null &&
        hud.lockedTargetScreenY !== undefined && (
          <div
            style={{
              transform: `translate3d(${hud.lockedTargetScreenX - 18}px, ${hud.lockedTargetScreenY - 18}px, 0)`,
            }}
            className="fixed top-0 left-0 w-9 h-9 pointer-events-none z-10 flex items-center justify-center will-change-transform"
            aria-hidden="true"
          >
            <div
              className={`w-6 h-6 rotate-45 border-2 ${
                hud.lockedTargetName
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-sky-300/80 bg-sky-400/5'
              }`}
            />
            {(hud.lockedTargetShield ?? 0) > 0 && (
              <Shield className="absolute -top-2.5 w-3.5 h-3.5 text-sky-300 drop-shadow" />
            )}
          </div>
        )}

      {/* Floating Damage & Status Numbers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hud.floatingDamages.map((fd) => (
          <div
            key={fd.id}
            style={{
              transform: `translate3d(${fd.x}px, ${fd.y}px, 0)`,
              opacity: Math.max(0, 1 - fd.age / 0.85),
              color: fd.color,
            }}
            className={`absolute top-0 left-0 font-mono-tabular font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
              fd.isCrit ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
            }`}
          >
            {fd.label ?? (fd.isCrit ? `CRIT ${fd.amount}` : fd.amount)}
          </div>
        ))}
      </div>

      {/* TOP BAR: Hero Vitals (Left) — Boss / Target Lock (Center) — Controls & Combo (Right) */}
      <div
        className="relative z-20 flex items-start justify-between gap-2 sm:gap-3 pt-2 sm:pt-3 pointer-events-none"
        style={{ paddingLeft: `${edgeX}px`, paddingRight: `${edgeX}px` }}
      >
        {/* Top-Left: Compact Vitals + Collapsible Objective (Zero Clipping & Zero Joystick Collision on 844x390) */}
        {!zenHidden ? (
          <div
            className={`flex flex-col gap-1.5 pointer-events-auto shrink-0 ${
              isCompact ? 'w-[264px]' : 'w-[308px] sm:w-[340px]'
            }`}
          >
            <div
              className={`rounded-xl bg-[#0a0d14]/90 border border-white/12 shadow-lg ${
                isCompact ? 'px-2.5 py-2' : 'p-3'
              }`}
            >
              {/* Unboxed Hero Identity & Quiet Inline Metadata (Zero-Pill Discipline) */}
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-display ${isCompact ? 'text-base' : 'text-lg'} font-bold tracking-wide whitespace-nowrap shrink-0 ${heroAccentText}`}>
                  {hud.activeHero === 'kaijax' ? 'KAI-JAX' : hud.activeHero.toUpperCase()}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono-tabular text-slate-300 whitespace-nowrap shrink-0">
                  {hud.traversalState}
                </span>
              </div>

              {/* Primary HP Bar */}
              <div className={isCompact ? 'mt-1' : 'mt-1.5'}>
                <div className="flex justify-between text-[10px] sm:text-[11px] font-mono-tabular text-slate-200 mb-0.5">
                  <span>HP</span>
                  <span>
                    {activeHp}/{activeMaxHp}
                  </span>
                </div>
                <div
                  className={`${isCompact ? 'h-1.5' : 'h-2'} rounded-full bg-slate-800/95 overflow-hidden`}
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

              {/* Dual Side-by-Side Energy & Duo Synergy Micro-Bars (Saves Vertical Height on Landscape Phones) */}
              <div className={`grid grid-cols-2 gap-2 ${isCompact ? 'mt-1' : 'mt-1.5'}`}>
                <div>
                  <div className="flex justify-between text-[10px] font-mono-tabular text-slate-300 mb-0.5">
                    <span>EN</span>
                    <span>{activeEn}</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full bg-slate-800/95 overflow-hidden"
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

                <div>
                  <div className="flex justify-between text-[10px] font-mono-tabular text-slate-300 mb-0.5">
                    <span>Synergy</span>
                    <span className={hud.duoSynergy >= 50 ? 'text-amber-300 font-semibold' : ''}>
                      {hud.duoSynergy}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full bg-slate-800/95 overflow-hidden"
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
              </div>

              {/* Quiet Companion & Fusion Readout */}
              <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] font-mono-tabular text-slate-300">
                {!hud.isFused ? (
                  <span>
                    Ally {compName} {compHp}/{compMaxHp}
                  </span>
                ) : (
                  <span className="text-amber-300 font-semibold">
                    Tri-Tail {hud.fusionTimeLeft.toFixed(1)}s
                  </span>
                )}
                <span className={hud.fusionUnlocked ? 'text-amber-300' : 'text-slate-300'}>
                  {hud.fusionUnlocked ? `Fuse ${hud.fusionCharge}%` : `Style ${hud.styleScore}`}
                </span>
              </div>
            </div>

            {/* Collapsible Mission Objective Strip */}
            {!dialogueOpen && (
              <button
                type="button"
                onClick={() => setObjectiveExpanded((v) => !v)}
                className="min-h-[36px] text-left rounded-xl bg-[#0a0d14]/88 border border-white/12 px-2.5 py-1.5 text-xs hover:border-amber-400/50 transition-colors"
                aria-expanded={showObjectiveBody}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-semibold text-amber-300 text-[11px] leading-tight">
                    {hud.missionStepTitle}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono-tabular text-slate-300 whitespace-nowrap shrink-0">
                    <span>
                      {hud.rescuedCivilians}/{hud.totalCivilians}
                    </span>
                    {isCompact &&
                      (objectiveExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ))}
                  </span>
                </div>
                {showObjectiveBody && (
                  <div className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                    {hud.missionObjective}
                  </div>
                )}
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Top-Center: Unified Boss Bar OR Locked Target Readout (Responsive across Phone, Tablet & Desktop) */}
        {!zenHidden && (hud.bossName || hud.lockedTargetName) && (
          <div className="flex flex-col items-center min-w-0 flex-1 max-w-[230px] sm:max-w-[340px] pointer-events-none">
            {hud.bossName ? (
              <div className="w-full rounded-xl bg-[#0a0d14]/92 border border-red-500/55 px-3 py-1.5 sm:px-4 sm:py-2 shadow-xl">
                <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-semibold">
                  <span className="font-display text-sm sm:text-base tracking-wide text-red-300 truncate">
                    {hud.bossName}
                  </span>
                  <span className="font-mono-tabular text-slate-300 shrink-0">
                    P{hud.bossPhase} · {hud.bossHp}/{hud.bossMaxHp}
                  </span>
                </div>
                <div
                  className="mt-1 h-2 rounded-full bg-slate-800 overflow-hidden"
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
                  <div className="mt-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-[width] duration-150"
                      style={{ width: `${(hud.bossArmor / Math.max(1, hud.bossMaxArmor)) * 100}%` }}
                    />
                  </div>
                )}
                {hud.bossTelegraph && (
                  <div className="mt-1 text-center text-[10px] font-bold tracking-wide text-amber-300 truncate">
                    {hud.bossTelegraph}
                  </div>
                )}
              </div>
            ) : (
              hud.lockedTargetName && (
                <div className="w-full rounded-xl bg-[#0a0d14]/90 border border-amber-400/45 px-3 py-1.5">
                  <div className="flex justify-between gap-2 text-[11px] text-amber-200 font-semibold">
                    <span className="truncate">{hud.lockedTargetName}</span>
                    <span className="font-mono-tabular shrink-0">
                      {hud.lockedTargetHp}/{hud.lockedTargetMaxHp}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-[width] duration-150"
                      style={{ width: `${(hud.lockedTargetHp / hud.lockedTargetMaxHp) * 100}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Top-Right: HUD Visibility Toggle, Command Hub & Pause + Compact Combo Counter */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setZenHidden((v) => !v)}
              aria-label={zenHidden ? 'Show HUD Controls' : 'Hide HUD Controls'}
              title={zenHidden ? 'Show HUD' : 'Clean Viewport'}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-[#0a0d14]/90 border border-white/15 hover:border-amber-400/60 text-slate-200 transition-colors shrink-0"
            >
              {zenHidden ? <Eye className="w-4 h-4 text-amber-300" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onOpenHub('skills')}
              aria-label="Open Heroes and Skills Hub"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-[#0a0d14]/90 border border-white/15 hover:border-amber-400/60 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Hub</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenHub('missions')}
              aria-label="Pause Game"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-[#0a0d14]/90 border border-white/15 hover:border-slate-400 text-slate-100 transition-colors shrink-0"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {!zenHidden && !dialogueOpen && (
            <ComboMeterWidget
              comboCount={hud.comboCount}
              comboTimer={hud.comboTimer}
              comboMaxTimer={hud.comboMaxTimer}
              comboBrokenSeq={hud.comboBrokenSeq}
              lastBrokenCombo={hud.lastBrokenCombo}
              activeHero={hud.activeHero}
              reducedMotion={settings.reducedMotion}
              colorblindMode={settings.colorblindMode}
              compact={isCompact}
            />
          )}
        </div>
      </div>

      {/* Active Duo Finisher Title Banner (Peripheral Top-Center — Never Obstructs Center Combat) */}
      {!zenHidden && !dialogueOpen && hud.activeFinisherName && (
        <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0a0d14]/92 border border-amber-400 text-amber-300 font-display text-sm sm:text-base tracking-wide shadow-2xl whitespace-nowrap shrink-0">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{hud.activeFinisherName}</span>
          </div>
        </div>
      )}

      {/* Contextual World Interact Prompt (Suppressed when Relay Takedown chip is active; docked clear of thumb clusters on compact screens) */}
      {!zenHidden && !dialogueOpen && hud.interactPrompt && !hud.canEnvironmentalTakedown && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 z-20 pointer-events-auto ${isCompact && !hud.activeFinisherName ? 'top-14' : ''}`}
          style={isCompact && !hud.activeFinisherName ? undefined : { bottom: `${edgeY + 26}px` }}
        >
          <button
            type="button"
            onClick={() => {
              haptic(18);
              engineRef.current?.triggerInteract();
            }}
            className="min-h-[44px] max-w-[280px] sm:max-w-none inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-xl transition-transform active:scale-95 whitespace-nowrap shrink-0"
          >
            <Hand className="w-4 h-4 shrink-0" />
            <span className="truncate">{hud.interactPrompt}</span>
          </button>
        </div>
      )}

      {/* BOTTOM LEFT: Virtual Movement Joystick + Thumb-Arc Sprint Toggle (Yields cleanly when Story Dialogue is open) */}
      {!zenHidden && !dialogueOpen && (
        <div
          className="fixed z-20 flex items-end gap-2.5 pointer-events-auto"
          style={{
            left: `${edgeX}px`,
            bottom: `${edgeY}px`,
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
            onLostPointerCapture={onJoyUp}
            className={`relative ${
              isCompact ? 'w-24 h-24' : 'w-28 h-28 sm:w-32 sm:h-32'
            } rounded-full bg-[#0a0d14]/78 border-2 border-slate-500/65 flex items-center justify-center touch-none shadow-lg`}
            aria-label="Movement Joystick"
          >
            <div
              className={`${
                isCompact ? 'w-10 h-10' : 'w-12 h-12'
              } rounded-full bg-slate-100/90 border-2 border-amber-400 shadow-md pointer-events-none will-change-transform`}
              style={{
                transform: `translate3d(${joyKnob.x}px, ${joyKnob.y}px, 0)`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !sprintLocked;
              setSprintLocked(next);
              engineRef.current?.setTouchSprint(next);
              haptic();
            }}
            className={`min-h-[44px] min-w-[56px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              sprintLocked
                ? 'bg-sky-600 border-sky-300 text-white'
                : 'bg-[#0a0d14]/88 border-white/15 text-slate-200'
            }`}
          >
            {sprintLocked ? 'Sprint On' : 'Sprint'}
          </button>
        </div>
      )}

      {/* BOTTOM RIGHT: Ergonomic 2-Row Thumb-Arc Combat Cluster (Fits cleanly within <=120px height on 844x390) */}
      {!zenHidden && !dialogueOpen && (
        <div
          className="fixed z-20 flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto"
          style={{
            right: `${edgeX}px`,
            bottom: `${edgeY}px`,
            opacity,
            transform: `scale(${scale})`,
            transformOrigin: 'bottom right',
          }}
        >
          {/* Peripheral Right-Thumb Callout Row: Counter Strike, Environmental Takedown & Duo Finisher (Zero Center-Screen Obstruction) */}
          {!hud.activeFinisherName && (hud.counterWindowActive || hud.canEnvironmentalTakedown || hud.duoFinisherReady) && (
            <div className="flex items-center justify-end gap-1.5">
              {hud.canEnvironmentalTakedown && (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    haptic(20);
                    engineRef.current?.triggerEnvironmentalTakedown();
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 border border-cyan-200 text-slate-950 font-bold text-xs shadow-xl active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>{isCompact ? 'Relay [V]' : 'Arc Takedown [V]'}</span>
                </button>
              )}

              {hud.counterWindowActive && (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    haptic(18);
                    engineRef.current?.triggerLightAttack();
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 border border-amber-300 text-white font-bold text-xs shadow-xl active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Counter Strike</span>
                </button>
              )}

              {hud.duoFinisherReady && (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    haptic(26);
                    engineRef.current?.triggerDuoFinisher();
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 border border-amber-200 text-slate-950 font-bold text-xs shadow-xl active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Duo Finisher [G]</span>
                </button>
              )}
            </div>
          )}

          {/* Upper Arc Row: 3 Active Hero Skills (Full Unclipped Names) + Lock, Switch & Fuse */}
          <div className="flex items-center gap-1.5">
            {abilities.map((ab, idx) => {
              const cd = hud.abilityCooldowns[idx];
              return (
                <button
                  key={ab.id}
                  type="button"
                  onClick={() => {
                    haptic(14);
                    engineRef.current?.triggerAbility((idx + 1) as 1 | 2 | 3);
                  }}
                  title={`${ab.name} (${ab.energyCost} EN)`}
                  className={`relative min-h-[44px] ${
                    isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'
                  } rounded-xl bg-[#0a0d14]/90 border border-white/15 hover:border-slate-400 text-left flex flex-col justify-between active:scale-95 shrink-0`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular text-slate-300 whitespace-nowrap">
                    <span className="font-bold text-amber-300">{idx + 1}</span>
                    <span>{ab.energyCost} EN</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-100 whitespace-nowrap">
                    {ab.name}
                  </div>
                  {cd > 0 && (
                    <div className="absolute inset-0 rounded-xl bg-black/78 flex items-center justify-center font-mono-tabular text-[11px] font-bold text-amber-300 whitespace-nowrap">
                      {cd.toFixed(1)}s
                    </div>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                haptic();
                engineRef.current?.triggerLockOn();
              }}
              aria-label="Toggle Target Lock"
              className={`min-h-[44px] min-w-[44px] px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                hud.lockedTargetName
                  ? 'bg-amber-500 border-amber-300 text-slate-950'
                  : 'bg-[#0a0d14]/90 border-white/15 text-slate-200'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              {!isCompact && <span>Lock</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                haptic(16);
                engineRef.current?.triggerSwitchHero();
              }}
              disabled={hud.isFused}
              aria-label="Switch Active Brother"
              className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-[#0a0d14]/90 border border-white/15 hover:border-sky-400 disabled:opacity-40 text-xs font-semibold text-slate-100 inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>{isCompact ? compName : 'Switch'}</span>
            </button>

            {(hud.fusionUnlocked || hud.isFused) && (
              <button
                type="button"
                onClick={() => {
                  haptic(25);
                  engineRef.current?.triggerFusion();
                }}
                disabled={!hud.isFused && hud.fusionCharge < 100}
                className={`min-h-[44px] min-w-[48px] px-2.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  hud.isFused
                    ? 'bg-amber-500 border-amber-300 text-slate-950'
                    : hud.fusionCharge >= 100
                      ? 'bg-violet-600 border-amber-400 text-white'
                      : 'bg-[#0a0d14]/90 border-white/15 text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {hud.isFused ? 'Unfuse' : hud.fusionCharge >= 100 ? 'Fuse' : `${hud.fusionCharge}%`}
                </span>
              </button>
            )}
          </div>

          {/* Primary Thumb Arc Row: Parry/Block, Web/Storm, Jump/Swing, Heavy, Primary Attack Anchor */}
          <div className="flex items-end gap-1.5 sm:gap-2">
            <button
              type="button"
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
              className={`${
                isCompact ? 'min-h-[48px] min-w-[54px] px-2' : 'min-h-[52px] min-w-[62px] px-2.5'
              } rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center touch-none active:scale-95 whitespace-nowrap shrink-0 ${
                hud.isBlocking
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-[#121622]/95 border-white/15 text-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>{hud.isBlocking ? 'Guard' : 'Parry'}</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                haptic(12);
                engineRef.current?.triggerTacticalAction();
              }}
              className={`relative ${
                isCompact ? 'min-h-[48px] min-w-[58px] px-2' : 'min-h-[52px] min-w-[66px] px-2.5'
              } rounded-xl bg-[#131a29]/95 border border-violet-400/55 text-violet-100 text-[11px] font-semibold flex flex-col items-center justify-center touch-none overflow-hidden active:scale-95 whitespace-nowrap shrink-0`}
            >
              <Link2 className="w-4 h-4 text-violet-300" />
              <span>{hud.tacticalActionLabel}</span>
              {hud.tacticalCooldown > 0 && (
                <div className="absolute inset-0 bg-black/78 flex items-center justify-center font-mono-tabular text-[11px] font-bold text-amber-300">
                  {hud.tacticalCooldown.toFixed(1)}s
                </div>
              )}
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                haptic();
                engineRef.current?.triggerJumpOrSwing();
              }}
              className={`${
                isCompact ? 'min-h-[48px] min-w-[54px] px-2' : 'min-h-[52px] min-w-[60px] px-2.5'
              } rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center touch-none active:scale-95 whitespace-nowrap shrink-0 ${
                hud.canWebSwing
                  ? 'bg-orange-600 border-orange-300 text-white'
                  : 'bg-[#121622]/95 border-white/15 text-slate-100'
              }`}
            >
              <Wind className="w-4 h-4 text-sky-300" />
              <span>{hud.canWebSwing ? 'Swing' : 'Jump'}</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                haptic(14);
                engineRef.current?.triggerHeavyAttack();
              }}
              className={`${
                isCompact ? 'min-h-[52px] min-w-[54px] px-2' : 'min-h-[56px] min-w-[62px] px-2.5'
              } rounded-xl bg-[#1a1625]/95 border border-orange-500/60 text-orange-200 text-[11px] font-bold flex flex-col items-center justify-center touch-none active:scale-95 whitespace-nowrap shrink-0`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Heavy</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                haptic(10);
                engineRef.current?.triggerLightAttack();
              }}
              className={`${
                isCompact ? 'min-h-[58px] min-w-[64px] px-3' : 'min-h-[64px] min-w-[72px] px-3.5'
              } rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex flex-col items-center justify-center shadow-xl touch-none active:scale-95 whitespace-nowrap shrink-0`}
            >
              {hud.activeHero === 'jax' ? <Zap className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
              <span>{hud.counterWindowActive ? 'Counter' : 'Attack'}</span>
            </button>
          </div>

          {/* Discrete Desktop Keybind Hint (Desktop Only >= 1280px) */}
          <div className="hidden xl:block text-[10px] text-slate-300 font-mono-tabular bg-[#0a0d14]/85 px-2.5 py-0.5 rounded border border-white/10">
            WASD Move · Space Jump/Swing · J/K Attack · U Web/Storm · V Relay Takedown · Q Parry ({settings.parryTiming === 'generous' ? '0.16s' : '0.10s'}) · G Duo Finisher · 1-3 Skills · Tab Switch
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {hud.isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
          <div className="max-w-md w-full rounded-2xl bg-[#131620] border border-red-500/50 p-6 text-center shadow-2xl">
            <h2 className="font-display text-3xl font-bold text-red-400">Brothers Down</h2>
            <p className="mt-2 text-sm text-slate-300">
              Both Kai and Jax fell in Ashblock Heights. Reload from your latest checkpoint with all earned progression intact.
            </p>
            <button
              type="button"
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
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="rounded-2xl bg-[#0a0d14]/95 border border-amber-400/70 px-5 py-3.5 shadow-2xl flex flex-wrap items-center gap-4">
            <div>
              <div className="font-display text-xl sm:text-2xl font-bold text-amber-300">
                Mission 1 Complete: Ashblock Liberated
              </div>
              <div className="text-xs text-slate-300">
                Kai-Jax Fusion &amp; Pyraxis/Kar-Voth armor trims unlocked.
              </div>
            </div>
            <button
              type="button"
              onClick={onStartPatrol}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Launch Patrol Skirmish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
