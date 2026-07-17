import { useState, useEffect, useCallback, useRef } from "react";
import { useAdventure } from "../../lib/stores/useAdventure";
import { getStoryMissionById, type StoryMission, type StoryDialogue } from "../../lib/story_missions";

interface StoryAdventureProps {
  missionId: string;
  characterId: string;
  onComplete: (success: boolean) => void;
  onBack: () => void;
}

type StoryPhase = "intro" | "playing" | "wave-transition" | "outro" | "results";

type StoryWaveEnemySpec = {
  fighterId: string;
};

const WAVE_TYPE_TO_FIGHTER_ID: Record<string, string> = {
  grunt: "hyena-scout",
  "void-grunt": "rift-drone",
  "void-scout": "hyena-scout",
  "void-elite": "neon-wraith",
  "void-legion": "rift-drone",
  "void-stalker-minion": "neon-wraith",
  "void-stalker": "void-stalker",
  "rift-general": "rift-general",
};

function normalizeWaveEnemies(mission: StoryMission, waveIndex: number): StoryWaveEnemySpec[] {
  const wave = mission.enemyWaves[waveIndex] as any;
  if (!wave) return [];

  if (Array.isArray(wave.enemies)) {
    return wave.enemies
      .filter((enemy: any) => typeof enemy?.fighterId === "string")
      .map((enemy: any) => ({ fighterId: enemy.fighterId }));
  }

  const count = Math.max(1, Number(wave.count ?? 1));
  const isFinalBossWave = Boolean(mission.bossId) && waveIndex === mission.enemyWaves.length - 1;
  const fighterId = isFinalBossWave
    ? mission.bossId!
    : WAVE_TYPE_TO_FIGHTER_ID[String(wave.type)] ?? "rift-drone";

  return Array.from({ length: count }, () => ({ fighterId }));
}

function getWaveDelaySeconds(mission: StoryMission, waveIndex: number): number {
  const wave = mission.enemyWaves[waveIndex] as any;
  const delay = Number(wave?.spawnDelay ?? wave?.delay ?? 2);
  return Number.isFinite(delay) && delay >= 0 ? delay : 2;
}

function DialogueOverlay({
  lines,
  onComplete,
}: {
  lines: StoryDialogue[];
  onComplete: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentLine = lines[lineIndex];
  const fullText = currentLine?.text || "";
  const displayText = showFull ? fullText : fullText.slice(0, charIndex);
  const isTyping = !showFull && charIndex < fullText.length;
  const isLastLine = lineIndex >= lines.length - 1;

  useEffect(() => {
    setCharIndex(0);
    setShowFull(false);
  }, [lineIndex]);

  useEffect(() => {
    if (showFull) return;
    timerRef.current = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= fullText.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowFull(true);
          return prev;
        }
        return prev + 1;
      });
    }, 25);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fullText, showFull]);

  const handleClickRef = useRef<() => void>(() => {});
  handleClickRef.current = () => {
    if (isTyping) {
      setShowFull(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (isLastLine) {
      onComplete();
    } else {
      setLineIndex((i) => i + 1);
    }
  };

  const handleClick = () => handleClickRef.current();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleClickRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!currentLine) return null;

  const speakerColor = getSpeakerColor(currentLine.speaker);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-12 px-6"
      style={{ background: "linear-gradient(transparent 20%, rgba(5,5,10,0.8) 70%, rgba(5,5,10,0.95) 100%)" }}
      onClick={handleClick}
    >
      {/* Cinematic Bars */}
      <div className="absolute top-0 left-0 w-full h-[10vh] bg-black/80" />
      <div className="absolute bottom-0 left-0 w-full h-[10vh] bg-black/80" />

      <div className="w-full max-w-4xl relative">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 opacity-50" style={{ borderColor: speakerColor }} />
        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 opacity-50" style={{ borderColor: speakerColor }} />

        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black rotate-3 group-hover:rotate-0 transition-transform"
              style={{ 
                background: `linear-gradient(135deg, ${speakerColor}44, ${speakerColor}11)`, 
                color: speakerColor, 
                border: `1px solid ${speakerColor}60`,
                boxShadow: `0 0 15px ${speakerColor}22`
              }}
            >
              {currentLine.speaker[0]}
            </div>
            <div>
              <span className="font-black text-xl uppercase tracking-widest block" style={{ color: speakerColor, textShadow: `0 0 10px ${speakerColor}44` }}>
                {currentLine.speaker}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Transmission Active</span>
            </div>
          </div>
          
          <p className="text-slate-100 text-xl font-medium leading-relaxed min-h-[4rem] tracking-wide">
            {displayText}
            {isTyping && <span className="w-2 h-5 inline-block bg-cyan-400 ml-1 animate-pulse" />}
          </p>
          
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex gap-1">
              {lines.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === lineIndex ? 'w-6 bg-cyan-500' : 'w-2 bg-white/10'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
              {isTyping ? "Synchronizing..." : isLastLine ? "Click to engage" : "Ready for next phase"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSpeakerColor(speaker: string): string {
  const colors: Record<string, string> = {
    "Kai-Jax": "#00f2ff",
    "Kai-Jax Zenith": "#00f2ff",
    "Kai": "#ffc233",
    "Jax": "#a855f7",
    "Jaxon": "#a855f7",
    "Kaison": "#ffc233",
    "System": "#94a3b8",
    "Narrator": "#cbd5e1",
    "???": "#f43f5e",
  };
  return colors[speaker] || "#00f2ff";
}

function WaveTransition({ waveNum, total, onContinue }: { waveNum: number; total: number; onContinue: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-pulse">
        <p className="text-amber-300 text-sm font-semibold tracking-[0.3em] uppercase mb-2">Incoming</p>
        <h2 className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(255,180,0,0.4)]">
          Wave {waveNum} / {total}
        </h2>
        <p className="text-slate-400 text-sm mt-2">Prepare yourself...</p>
      </div>
    </div>
  );
}

function MissionBriefing({ mission, onStart, onBack }: { mission: StoryMission; onStart: () => void; onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl" style={{ background: "radial-gradient(circle at center, rgba(10,15,30,0.9), rgba(2,2,5,0.98))" }}>
      <div className="max-w-xl w-full animate-in zoom-in-95 duration-500">
        <div className="relative p-8 rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
          {/* Animated Background Shards */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <button
              onClick={onBack}
              className="mb-4 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              ← Back to Campaign
            </button>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                Sector Protocol {mission.actNumber}-{mission.missionNumber}
              </div>
              <h1 className="text-4xl font-black text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {mission.title}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                {mission.description}
              </p>
            </div>

            <div className="space-y-4 mb-10">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="text-white font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]" />
                  Mission Objectives
                </h3>
                <ul className="space-y-3">
                  {mission.objectives.map((obj, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-3">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <p className="text-[8px] text-slate-500 uppercase font-black mb-1">XP Reward</p>
                  <p className="text-lg font-black text-amber-400">+{mission.rewards.xp}</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Currency</p>
                  <p className="text-lg font-black text-emerald-400">+{mission.rewards.currency}</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Difficulty</p>
                  <p className="text-lg font-black text-red-500">{mission.difficulty}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="group relative w-full h-16 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 rounded-2xl bg-cyan-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <span className="relative z-10">Engage Mission</span>
            </button>
          </div>
        </div>
        
        <p className="text-center mt-6 text-[10px] text-slate-600 uppercase tracking-widest">
          Memory Synchronized • All Systems Nominal
        </p>
      </div>
    </div>
  );
}

function ResultsScreen({ mission, success, onContinue }: { mission: StoryMission; success: boolean; onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at center, rgba(10,10,30,0.95), rgba(0,0,0,0.98))" }}>
      <div className="max-w-md w-full text-center">
        <h1 className={`text-4xl font-black mb-4 ${success ? "text-green-400" : "text-red-400"}`}>
          {success ? "Mission Complete" : "Mission Failed"}
        </h1>
        <p className="text-slate-300 text-sm mb-6">
          {success ? `You completed "${mission.title}" and earned your rewards.` : `You were defeated. Train harder and try again.`}
        </p>
        {success && (
          <div className="flex justify-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">+{mission.rewards.xp} XP</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 font-bold">+{mission.rewards.currency} Gold</span>
          </div>
        )}
        <button
          onClick={onContinue}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
            success
              ? "bg-gradient-to-r from-green-600 to-cyan-600 text-white"
              : "bg-gradient-to-r from-red-600 to-amber-600 text-white"
          }`}
        >
          {success ? "Continue" : "Return to Campaign"}
        </button>
      </div>
    </div>
  );
}

export default function StoryAdventure({ missionId, characterId, onComplete, onBack }: StoryAdventureProps) {
  const mission = getStoryMissionById(missionId);
  const [phase, setPhase] = useState<StoryPhase | "briefing">("briefing");
  const [currentWave, setCurrentWave] = useState(0);
  const [success, setSuccess] = useState(false);
  const spawnedWaves = useRef(new Set<number>());
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initAdventure = useAdventure((s) => s.initAdventure);
  const spawnEnemies = useAdventure((s) => s.spawnEnemies);

  const spawnWave = useCallback((waveIndex: number) => {
    if (!mission || waveIndex >= mission.enemyWaves.length) return;
    if (spawnedWaves.current.has(waveIndex)) return;
    spawnedWaves.current.add(waveIndex);

    const waveEnemies = normalizeWaveEnemies(mission, waveIndex);
    if (waveEnemies.length === 0) {
      console.warn(`[StoryAdventure] Mission ${mission.id} wave ${waveIndex} has no enemies. Skipping wave.`);
      return;
    }

    const existingEnemies = useAdventure.getState().enemies;

    const newEnemies = waveEnemies.map((e, i) => {
      const angle = (i / waveEnemies.length) * Math.PI * 2;
      const radius = 8 + waveIndex * 3;
      const isBoss = mission.bossId === e.fighterId;
      return {
        id: `w${waveIndex}-${i}-${e.fighterId}`,
        fighterId: e.fighterId,
        tier: (isBoss ? "boss1" : "minion1") as "minion1" | "minion2" | "boss1" | "boss2",
        posX: Math.sin(angle) * radius,
        posY: 0,
        posZ: Math.cos(angle) * radius,
        rotY: 0,
        health: isBoss ? 200 : 80 + mission.difficulty * 20,
        maxHealth: isBoss ? 200 : 80 + mission.difficulty * 20,
        isAggro: false,
        isAttacking: false,
        isDead: false,
        aiState: "idle" as const,
        telegraphTimer: 0,
        patrolTargetX: Math.sin(angle) * radius + (Math.random() - 0.5) * 8,
        patrolTargetZ: Math.cos(angle) * radius + (Math.random() - 0.5) * 8,
        stunTimer: 0,
      };
    });

    spawnEnemies([...existingEnemies, ...newEnemies]);
  }, [mission, spawnEnemies]);

  const startPlaying = useCallback(() => {
    if (!mission) return;
    initAdventure(characterId, missionId, mission.arena || "cross_point_arena");
    setCurrentWave(0);
    spawnedWaves.current.clear();
    spawnWave(0);
    setPhase("playing");
  }, [mission, characterId, missionId, initAdventure, spawnWave]);

  useEffect(() => {
    if (phase !== "playing" || !mission) return;

    checkIntervalRef.current = setInterval(() => {
      const { enemies, player } = useAdventure.getState();

      if (player.health <= 0) {
        setSuccess(false);
        setPhase("outro");
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        return;
      }

      const allDead = enemies.length > 0 && enemies.every((e) => e.isDead);
      if (allDead) {
        const nextWave = currentWave + 1;
        if (nextWave < mission.enemyWaves.length) {
          setCurrentWave(nextWave);
          const delay = getWaveDelaySeconds(mission, nextWave);
          setPhase("wave-transition");
          setTimeout(() => {
            spawnWave(nextWave);
            setPhase("playing");
          }, delay * 1000);
        } else {
          setSuccess(true);
          setPhase("outro");
        }
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      }
    }, 500);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [phase, mission, currentWave, spawnWave]);

  if (!mission) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
        <p>Mission not found.</p>
        <button onClick={onBack} className="ml-4 text-cyan-400 underline">Back</button>
      </div>
    );
  }

  return (
    <>
      {phase === "briefing" && (
        <MissionBriefing mission={mission} onStart={() => setPhase("intro")} onBack={onBack} />
      )}

      {phase === "intro" && (
        <DialogueOverlay
          lines={mission.introCutscene}
          onComplete={startPlaying}
        />
      )}

      {phase === "wave-transition" && (
        <WaveTransition
          waveNum={currentWave + 1}
          total={mission.enemyWaves.length}
          onContinue={() => {}}
        />
      )}

      {phase === "outro" && (
        <DialogueOverlay
          lines={success ? mission.outroCutscene : [
            { speaker: "Kai-Jax", text: "No... I can't fall here. Not yet..." },
            { speaker: "???", text: "The Memory King crumbles. How disappointing." },
          ]}
          onComplete={() => setPhase("results")}
        />
      )}

      {phase === "results" && (
        <ResultsScreen
          mission={mission}
          success={success}
          onContinue={() => onComplete(success)}
        />
      )}
    </>
  );
}
