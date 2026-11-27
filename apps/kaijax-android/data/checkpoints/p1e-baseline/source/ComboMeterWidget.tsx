import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getComboTierLabel } from '../game/combat/comboSystem';
import { ColorblindMode, HeroId } from '../game/types';

interface ComboMeterWidgetProps {
  comboCount: number;
  comboTimer: number;
  comboMaxTimer: number;
  comboBrokenSeq: number;
  lastBrokenCombo: number;
  activeHero: HeroId;
  reducedMotion: boolean;
  colorblindMode: ColorblindMode;
}

export const ComboMeterWidget: React.FC<ComboMeterWidgetProps> = ({
  comboCount,
  comboTimer,
  comboMaxTimer,
  comboBrokenSeq,
  lastBrokenCombo,
  activeHero,
  reducedMotion,
  colorblindMode,
}) => {
  const [showBrokenFeedback, setShowBrokenFeedback] = useState(false);

  // Trigger brief "Combo Broken" state when damage resets an active combo
  useEffect(() => {
    if (comboBrokenSeq === 0 || lastBrokenCombo < 2) return;
    setShowBrokenFeedback(true);
    const id = window.setTimeout(() => {
      setShowBrokenFeedback(false);
    }, 650);
    return () => window.clearTimeout(id);
  }, [comboBrokenSeq, lastBrokenCombo]);

  // Clear broken state immediately if the player starts a new combo
  useEffect(() => {
    if (comboCount > 0 && showBrokenFeedback) {
      setShowBrokenFeedback(false);
    }
  }, [comboCount, showBrokenFeedback]);

  const isVisible = comboCount > 0 || showBrokenFeedback;
  const safeMax = Math.max(0.1, comboMaxTimer);
  const decayRatio = Math.max(0, Math.min(1, comboTimer / safeMax));
  const tier = getComboTierLabel(comboCount);

  // Colorblind-safe and hero-attuned bar & accent color
  const accentColor = (() => {
    if (colorblindMode === 'protanopia' || colorblindMode === 'deuteranopia') {
      return comboCount >= 15 ? '#F59E0B' : '#38BDF8';
    }
    if (comboCount >= 8) return tier.accentHex;
    if (activeHero === 'jax') return '#38BDF8';
    if (activeHero === 'kai') return '#A855F7';
    return '#F97316';
  })();

  const isLowTime = comboCount > 0 && decayRatio < 0.28;

  return (
    <div className="pointer-events-none select-none flex flex-col items-end">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={showBrokenFeedback && comboCount === 0 ? `broken-${comboBrokenSeq}` : 'active-combo'}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.86, x: 12 }
            }
            animate={
              showBrokenFeedback && comboCount === 0
                ? reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 0.94, x: [-5, 5, -3, 0] }
                : {
                    opacity: 1,
                    scale: reducedMotion ? 1 : tier.baseScale,
                    x: 0,
                  }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.88, x: 10 }
            }
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'top right' }}
            className={`w-48 sm:w-56 rounded-xl bg-[#0a0b10]/92 border px-3.5 py-2.5 shadow-xl ${
              showBrokenFeedback && comboCount === 0
                ? 'border-red-500/70'
                : 'border-slate-700/90'
            }`}
            role="status"
            aria-live="polite"
          >
            {showBrokenFeedback && comboCount === 0 ? (
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-bold tracking-wide text-red-400">
                    Combo Broken
                  </span>
                  <span className="text-xs font-mono-tabular text-slate-300 line-through">
                    {lastBrokenCombo} Hits
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800/90 overflow-hidden">
                  <div
                    className="h-full w-full bg-red-500/70 origin-left transition-transform duration-150"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-red-300/90">
                  Reset on damage taken
                </div>
              </div>
            ) : (
              <div>
                {/* Top Metadata Line (Zero-Pill Unboxed Text) */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                  <span className="font-semibold tracking-wide truncate" style={{ color: accentColor }}>
                    {tier.title}
                  </span>
                  <span className="font-mono-tabular text-slate-300 shrink-0">
                    {comboTimer.toFixed(1)}s
                  </span>
                </div>

                {/* Scaling Hit Counter */}
                <div className="mt-0.5 flex items-baseline justify-between gap-2">
                  <motion.div
                    key={comboCount}
                    initial={
                      reducedMotion
                        ? { opacity: 0.9 }
                        : { scale: 1.34, opacity: 0.88 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 560,
                      damping: 22,
                      mass: 0.6,
                    }}
                    style={{ transformOrigin: 'left bottom' }}
                    className="flex items-baseline gap-1.5"
                  >
                    <span
                      className="font-display text-3xl sm:text-4xl font-bold leading-none font-mono-tabular tracking-tight"
                      style={{ color: accentColor }}
                    >
                      {comboCount}
                    </span>
                    <span className="font-display text-base sm:text-lg font-bold tracking-wide text-slate-100">
                      {comboCount === 1 ? 'Hit' : 'Hits'}
                    </span>
                  </motion.div>

                  <span className="text-[11px] font-mono-tabular text-slate-300">
                    x{(1 + Math.min(1.5, comboCount * 0.05)).toFixed(2)}
                  </span>
                </div>

                {/* Decay Timer Progress Bar (Compositor-Only scaleX) */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800/95 overflow-hidden">
                  <div
                    className="h-full w-full rounded-full origin-left will-change-transform"
                    style={{
                      transform: `scaleX(${decayRatio})`,
                      backgroundColor: isLowTime ? '#F59E0B' : accentColor,
                      transition: 'transform 60ms linear, background-color 150ms ease',
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
