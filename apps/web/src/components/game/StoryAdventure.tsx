import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRunner } from "../../lib/stores/useRunner";
import { useAdventure } from "../../lib/stores/useAdventure";
import { useMissions } from "../../lib/stores/useMissions";
import { getStoryMissionById, type StoryMission, type StoryDialogue } from "../../lib/story_missions";

interface StoryAdventureProps {
  missionId: string;
  characterId: string;
  onComplete: (success: boolean) => void;
  onBack: () => void;
}

type StoryPhase = "intro" | "playing" | "wave-transition" | "outro" | "results";

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
      className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
      style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.85) 100%)" }}
      onClick={handleClick}
    >
      <div className="w-full max-w-3xl">
        <div className="bg-black/90 border-2 rounded-2xl p-6 backdrop-blur-sm" style={{ borderColor: `${speakerColor}60` }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black"
              style={{ background: `${speakerColor}30`, color: speakerColor, border: `2px solid ${speakerColor}50` }}
            >
              {currentLine.speaker[0]}
            </div>
            <span className="font-bold text-lg" style={{ color: speakerColor }}>
              {currentLine.speaker}
            </span>
          </div>
          <p className="text-white text-lg leading-relaxed min-h-[3rem]">
            {displayText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          <div className="mt-3 text-right">
            <span className="text-xs text-slate-500">
              {isTyping ? "Click to skip" : isLastLine ? "Click to continue" : `${lineIndex + 1} / ${lines.length} — Click to advance`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSpeakerColor(speaker: string): string {
  const colors: Record<string, string> = {
    "Kai-Jax": "#7fff00",
    "Kai": "#ff6b00",
    "Jax": "#00d4ff",
    "Jaxon": "#5dd9ff",
    "Kaison": "#ffc233",
    "Voltage Fang": "#facc15",
    "Steelwolf": "#94a3b8",
    "Ashen Tiger": "#ff6347",
    "???": "#a855f7",
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

function MissionBriefing({ mission, onStart }: { mission: StoryMission; onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at center, rgba(10,10,30,0.95), rgba(0,0,0,0.98))" }}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <p className="text-amber-300/80 text-xs font-semibold tracking-[0.3em] uppercase mb-1">
            Act {mission.act} — Mission {mission.missionNumber}
          </p>
          <h1 className="text-3xl font-black text-white mb-2">{mission.title}</h1>
          <p className="text-slate-300 text-sm leading-relaxed">{mission.description}</p>
        </div>

        <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4">
          <h3 className="text-amber-300 font-bold text-sm mb-2 tracking-wide uppercase">Objectives</h3>
          <ul className="space-y-1">
            {mission.objectives.map((obj, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 text-xs mb-6">
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">+{mission.rewards.xp} XP</span>
          <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">+{mission.rewards.currency} Gold</span>
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-300">Difficulty {mission.difficulty}</span>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Begin Mission
        </button>
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
          {success ? `You completed "${mission.name}" and earned your rewards.` : `You were defeated. Train harder and try again.`}
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

    const wave = mission.enemyWaves[waveIndex];
    const existingEnemies = useAdventure.getState().enemies;

    const newEnemies = wave.enemies.map((e, i) => {
      const angle = (i / wave.enemies.length) * Math.PI * 2;
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
    initAdventure(characterId, missionId, mission.arenaId || "mushroom-plains");
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
          const delay = mission.enemyWaves[nextWave].spawnDelay || 2;
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
        <MissionBriefing mission={mission} onStart={() => setPhase("intro")} />
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
