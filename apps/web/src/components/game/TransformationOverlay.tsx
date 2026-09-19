import { useEffect, useState } from "react";
import { useBattle } from "../../lib/stores/useBattle";
import { useRunner } from "../../lib/stores/useRunner";
import { Zap, Sparkles, Star } from "lucide-react";
import { canTriggerKaiJaxFusion } from "../../game/fusion/fusionPolicy";

function TransformationParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#00FFFF', '#FF6B6B', '#A855F7', '#FFFFFF'];
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      delay: Math.random() * 0.5,
      duration: Math.random() * 1 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF',
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-[transformParticle_1s_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function EnergyRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-4 animate-[ringExpand_1.5s_ease-out_infinite]"
          style={{
            width: 100 + i * 100,
            height: 100 + i * 100,
            borderColor: i % 2 === 0 ? '#FFD700' : '#00FFFF',
            animationDelay: `${i * 0.2}s`,
            opacity: 0.6 - i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

export default function TransformationOverlay() {
  const {
    battlePhase,
    playerFighterId,
    playerTransformed,
    transformationTimeRemaining,
    maxTransformationTime,
    playerSynergy,
    maxSynergy,
    triggerTransformation,
  } = useBattle();
  const fusionUnlocked = useRunner((s) => s.kaiJaxFusionUnlocked);

  const [animationPhase, setAnimationPhase] = useState<'idle' | 'charging' | 'flash' | 'reveal'>('idle');

  const fusionReady = canTriggerKaiJaxFusion({
    fighterId: playerFighterId,
    fusionUnlocked,
    synergy: playerSynergy,
    maxSynergy,
    transformed: playerTransformed,
    battlePhase,
  });

  useEffect(() => {
    if (battlePhase === 'transforming') {
      setAnimationPhase('charging');
      const flash = window.setTimeout(() => setAnimationPhase('flash'), 800);
      const reveal = window.setTimeout(() => setAnimationPhase('reveal'), 1200);
      const reset = window.setTimeout(() => setAnimationPhase('idle'), 2000);
      return () => {
        window.clearTimeout(flash);
        window.clearTimeout(reveal);
        window.clearTimeout(reset);
      };
    }
    setAnimationPhase('idle');
  }, [battlePhase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 't' || e.key === 'T') && fusionReady) {
        triggerTransformation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fusionReady, triggerTransformation]);

  return (
    <>
      {fusionReady && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div
            className="
              flex items-center gap-3 px-6 py-3 rounded-xl
              bg-gradient-to-r from-yellow-500 via-orange-500 to-purple-600
              border-2 border-yellow-300
              shadow-[0_0_40px_rgba(255,215,0,0.8)]
            "
          >
            <Sparkles className="w-6 h-6 text-white animate-spin" />
            <div className="text-center">
              <span className="text-lg font-black text-white">FUSION READY</span>
              <div className="flex items-center gap-2 text-sm text-yellow-100">
                <kbd className="px-2 py-0.5 bg-black/30 rounded font-bold">T</kbd>
                <span>stabilize Kai-Jax</span>
              </div>
            </div>
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>
      )}

      {battlePhase === 'transforming' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 bg-black transition-opacity duration-500"
            style={{ opacity: animationPhase === 'flash' ? 0 : 0.7 }}
          />

          <TransformationParticles />
          <EnergyRings />

          {animationPhase === 'flash' && (
            <div className="absolute inset-0 bg-white animate-[flash_0.3s_ease-out]" />
          )}

          <div className="relative z-10 text-center">
            {animationPhase === 'charging' && (
              <div className="animate-pulse">
                <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-4">
                  FUSION STABILIZING
                </div>
                <div className="flex items-center justify-center gap-4 text-xl sm:text-2xl font-black tracking-[0.25em] text-white">
                  <span>KAI</span>
                  <Zap className="w-10 h-10 text-yellow-400 animate-bounce" />
                  <span>JAX</span>
                </div>
              </div>
            )}

            {animationPhase === 'reveal' && (
              <div className="animate-[zoomIn_0.5s_ease-out]">
                <div
                  className="text-6xl sm:text-8xl font-black mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FF6B6B, #A855F7, #00FFFF)',
                    backgroundSize: '300% 300%',
                    animation: 'gradient-shift 2s ease infinite',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.8))',
                  }}
                >
                  KAI-JAX
                </div>
                <div className="text-2xl text-white font-bold tracking-widest">
                  THREE-TAIL CONVERGENCE
                </div>
                <div className="flex items-center justify-center gap-2 mt-4" aria-label="Three-tail base fusion">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {playerTransformed && battlePhase === 'fighting' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30">
          <div
            className="
              flex items-center gap-4 px-6 py-2 rounded-full
              bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-cyan-500/20
              backdrop-blur-sm
              border-2 border-yellow-400/50
              shadow-[0_0_20px_rgba(255,215,0,0.4)]
            "
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #A855F7)',
                boxShadow: '0 0 15px rgba(255,215,0,0.8)',
              }}
            >
              ⚡
            </div>

            <div className="flex-1 w-48">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-yellow-300">KAI-JAX FUSION</span>
                <span className="text-white">{Math.ceil(transformationTimeRemaining)}s</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-purple-500 to-cyan-400 transition-all duration-100"
                  style={{
                    width: `${(transformationTimeRemaining / maxTransformationTime) * 100}%`,
                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3)',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-yellow-300 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>1.5x</span>
            </div>
          </div>

          {transformationTimeRemaining <= 5 && (
            <div className="text-center mt-2 animate-pulse">
              <span className="text-red-400 font-bold text-sm">FUSION ENDING SOON</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes transformParticle {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) translateY(-50px);
            opacity: 1;
          }
          100% {
            transform: scale(0) translateY(-100px);
            opacity: 0;
          }
        }

        @keyframes ringExpand {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes zoomIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
