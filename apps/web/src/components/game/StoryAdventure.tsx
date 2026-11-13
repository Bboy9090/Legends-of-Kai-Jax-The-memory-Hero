import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAdventure } from "../../lib/stores/useAdventure";
import { evaluateCampaignProgressionGating } from "../../lib/adventureEvaluator";
import { MISSION6_ID } from "../../lib/mission6";
import { normalizeWaveEnemies, getWaveDelaySeconds, advanceWaveDelayMs } from "../../lib/storyWaveRuntime";
import { shouldMarkChaseTargetEscaped, findCivilianAttack, CIVILIAN_ATTACK_DAMAGE } from "../../lib/adventureTelemetry";
import { getStoryMissionById, type StoryMission, type StoryDialogue } from "../../lib/story_missions";
import { expandDialogue, MAX_BEAT_CHARS, PHONE_BEAT_CHARS } from "../../lib/dialogueBeats";
import { identityForSpeaker, moodFromEmotion, type HeroMood } from "../../lib/heroVisualIdentity";
import { getBossConfig } from "../../lib/bossPhases";
import HeroSilhouette from "./HeroSilhouette";
import { BossEncounterHUD, useBossEncounter } from "./BossEncounter";

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
  finale,
}: {
  lines: StoryDialogue[];
  onComplete: () => void;
  /** Colours the last beat's portrait: a victory outro ends triumphant, a defeat outro ends hit. */
  finale?: "victory" | "defeat";
}) {
  const beats = useMemo(
    () => expandDialogue(lines, typeof window !== "undefined" && window.innerWidth < 640 ? PHONE_BEAT_CHARS : MAX_BEAT_CHARS),
    [lines],
  );
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentLine = beats[lineIndex];
  const fullText = currentLine?.text || "";
  const displayText = showFull ? fullText : fullText.slice(0, charIndex);
  const isTyping = !showFull && charIndex < fullText.length;
  const isLastLine = lineIndex >= beats.length - 1;

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
    }, 22);
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
    if (isLastLine) onComplete();
    else setLineIndex((i) => i + 1);
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

  const identity = identityForSpeaker(currentLine.speaker);
  const speakerColor = identity?.primaryColor ?? getSpeakerColor(currentLine.speaker);
  let mood: HeroMood = moodFromEmotion(currentLine.emotion);
  if (isLastLine && mood === "neutral" && finale) mood = finale === "victory" ? "triumphant" : "hit";
  const rightSide = currentLine.side === "right";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-3 sm:px-6"
      data-testid="dialogue-overlay"
      style={{
        background: "linear-gradient(transparent 20%, rgba(5,5,10,0.8) 70%, rgba(5,5,10,0.95) 100%)",
        paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
      onClick={handleClick}
    >
      <div className="absolute left-0 top-0 w-full bg-black/80" style={{ height: "max(8vh, env(safe-area-inset-top))" }} />
      <div className="absolute bottom-0 left-0 w-full bg-black/80" style={{ height: "max(6vh, env(safe-area-inset-bottom))" }} />

      <div className="relative w-full max-w-3xl">
        <div className="absolute -left-2 -top-3 h-10 w-10 border-l-2 border-t-2 opacity-50" style={{ borderColor: speakerColor }} />
        <div className="absolute -bottom-3 -right-2 h-10 w-10 border-b-2 border-r-2 opacity-50" style={{ borderColor: speakerColor }} />

        <div className={`flex items-stretch gap-3 rounded-2xl border border-white/10 bg-black/80 p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:gap-5 sm:p-6 ${rightSide ? "flex-row-reverse" : ""}`}>
          <div
            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-24"
            data-testid="dialogue-portrait"
            data-mood={mood}
            data-speaker={currentLine.speaker}
            style={{
              background: `linear-gradient(135deg, ${speakerColor}44, ${speakerColor}11)`,
              border: `1px solid ${speakerColor}80`,
              boxShadow: `0 0 18px ${speakerColor}33`,
              transform: mood === "hit" ? "translateX(-2px) rotate(-1.5deg)" : undefined,
            }}
          >
            {identity ? (
              <HeroSilhouette heroId={identity.id} mood={mood} view="portrait" className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-black" style={{ color: speakerColor }}>{currentLine.speaker[0]}</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-base font-black uppercase tracking-widest sm:text-lg" style={{ color: speakerColor, textShadow: `0 0 10px ${speakerColor}44` }}>
              {currentLine.speaker}
            </span>
            <p className="kj-subtitle mt-1 min-h-[3.4rem] text-[17px] font-medium leading-snug tracking-wide text-slate-100 sm:min-h-[3.8rem] sm:text-xl" data-testid="dialogue-text">
              {displayText}
              {isTyping && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-cyan-400" />}
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
              <div className="flex gap-1" aria-hidden="true">
                {beats.slice(0, 14).map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === lineIndex ? "w-5 bg-cyan-500" : "w-1.5 bg-white/10"}`} />
                ))}
              </div>
              <span className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isTyping ? "…" : isLastLine ? "Tap to engage" : "Tap to continue"}
              </span>
            </div>
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

function WaveTransition({ waveNum, total }: { waveNum: number; total: number }) {
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

function ResultsScreen({ mission, success, onContinue, onRetry }: { mission: StoryMission; success: boolean; onContinue: () => void; onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at center, rgba(10,10,30,0.95), rgba(0,0,0,0.98))" }}>
      <div className="max-w-md w-full text-center">
        <h1 className={`text-4xl font-black mb-4 ${success ? "text-green-400" : "text-red-400"}`}>
          {success ? "Mission Complete" : "Mission Failed"}
        </h1>
        <p className="text-slate-300 text-sm mb-6">
          {success ? `You completed "${mission.title}" and earned your rewards.` : `You were defeated. Train harder and try again.`}
        </p>
        {success && mission.rewards.loot.length > 0 && (
          <div data-testid="story-mission-loot-reward" className="mb-5 text-center text-sm text-cyan-200">
            Memory recovered: {mission.rewards.loot.join(", ")}
          </div>
        )}
        {success && (
          <div className="flex justify-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">+{mission.rewards.xp} XP</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 font-bold">+{mission.rewards.currency} Gold</span>
          </div>
        )}
        <div className={`flex gap-3 ${success ? "flex-col" : "flex-col"}`}>
          {!success && (
            <button
              onClick={onRetry}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-yellow-600 to-amber-600 text-white"
            >
              Retry Mission
            </button>
          )}
          <button
            onClick={onContinue}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
              success
                ? "bg-gradient-to-r from-green-600 to-cyan-600 text-white"
                : "bg-gradient-to-r from-red-600 to-red-700 text-white"
            }`}
          >
            {success ? "Continue" : "Return to Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoryAdventure({ missionId, characterId, onComplete, onBack }: StoryAdventureProps) {
  const mission = getStoryMissionById(missionId);
  const bossConfigRef = useMemo(
    () => (mission?.bossId ? getBossConfig(mission.id, mission.bossId, mission.difficulty) : undefined),
    [mission],
  );
  const [phase, setPhase] = useState<StoryPhase | "briefing">("briefing");
  const [currentWave, setCurrentWave] = useState(0);
  const [success, setSuccess] = useState(false);
  const spawnedWaves = useRef(new Set<number>());
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveDelayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const civilianAttackTimes = useRef(new Map<string, number>());

  const bossHud = useBossEncounter(bossConfigRef, phase === "playing" || phase === "wave-transition");
  const initAdventure = useAdventure((s) => s.initAdventure);
  const spawnEnemies = useAdventure((s) => s.spawnEnemies);
  const retryMissionAction = useAdventure((s) => s.retryMission);

  useEffect(() => {
    console.log(`[StoryAdventure] Loaded with missionId=${missionId}, mission found=${!!mission}, phase=${phase}`);
    if (mission && phase === "intro") {
      console.log(`[StoryAdventure] Intro phase - introCutscene exists=${!!mission.introCutscene}, lines=${mission.introCutscene?.length || 0}`);
    }
  }, [missionId, mission, phase]);

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

    const bossConfig = bossConfigRef;
    const newEnemies = waveEnemies.map((e, i) => {
      const angle = (i / waveEnemies.length) * Math.PI * 2;
      const radius = 8 + waveIndex * 3;
      const isBoss = mission.bossId === e.fighterId;
      const boss = isBoss ? bossConfig : undefined;
      const hp = boss ? boss.maxHealth : 80 + mission.difficulty * 20;
      return {
        id: `w${waveIndex}-${i}-${e.fighterId}`,
        fighterId: e.fighterId,
        tier: (boss ? boss.tier :
          mission.id === MISSION6_ID && waveIndex === 1 ? "minion2" : "minion1") as "minion1" | "minion2" | "boss1" | "boss2",
        posX: Math.sin(angle) * radius,
        posY: 0,
        posZ: Math.cos(angle) * radius,
        rotY: 0,
        health: hp,
        maxHealth: hp,
        isAggro: false,
        isAttacking: false,
        isDead: false,
        aiState: "idle" as const,
        telegraphTimer: 0,
        patrolTargetX: Math.sin(angle) * radius + (Math.random() - 0.5) * 8,
        patrolTargetZ: Math.cos(angle) * radius + (Math.random() - 0.5) * 8,
        stunTimer: 0,
        ...(boss
          ? {
              bossKey: boss.missionId,
              bossPhase: 1 as const,
              bossStage: null,
              visual: { scale: boss.scale, tint: boss.tint, aura: boss.aura, weapon: boss.weapon },
            }
          : {}),
      };
    });

    spawnEnemies([...existingEnemies, ...newEnemies]);
    useAdventure.setState({ waveCount: waveIndex + 1 });
  }, [mission, spawnEnemies, bossConfigRef]);

  const startPlaying = useCallback(() => {
    console.log(`[StoryAdventure] startPlaying called, mission=${mission?.id}, enemyWaves=${mission?.enemyWaves.length}`);
    if (!mission) return;
    initAdventure(characterId, missionId, mission.arena || "cross_point_arena");
    setCurrentWave(0);
    if (waveDelayTimerRef.current) clearInterval(waveDelayTimerRef.current);
    waveDelayTimerRef.current = null;
    spawnedWaves.current.clear();
    civilianAttackTimes.current.clear();
    console.log(`[StoryAdventure] Spawning wave 0 with ${mission.enemyWaves[0]?.count} enemies`);

    // Narrative-only missions (for example the epilogue) must resolve
    // without waiting for enemies that will never spawn.
    if (mission.enemyWaves.length === 0) {
      setSuccess(true);
      setPhase("outro");
      return;
    }

    spawnWave(0);
    setPhase("playing");
  }, [mission, characterId, missionId, initAdventure, spawnWave]);

  const handleRetry = useCallback(() => {
    retryMissionAction();
    setCurrentWave(0);
    if (waveDelayTimerRef.current) clearInterval(waveDelayTimerRef.current);
    waveDelayTimerRef.current = null;
    spawnedWaves.current.clear();
    civilianAttackTimes.current.clear();
    spawnWave(0);
    setPhase("playing");
  }, [retryMissionAction, spawnWave]);

  useEffect(() => {
    if (phase !== "playing" || !mission) return;

    checkIntervalRef.current = setInterval(() => {
      const state = useAdventure.getState();
      const { enemies, player, isPaused } = state;
      if (isPaused) return;
      if (shouldMarkChaseTargetEscaped(mission.id, state.objectives.milestones.stalkerIntercepted, player, enemies)) {
        state.markChaseTargetEscaped();
      }
      if (mission.id === "story_act1_m5" && !isPaused) {
        const nowMs = Date.now();
        const attacks = findCivilianAttack(enemies, state.objectives.civilianRegistry, nowMs, civilianAttackTimes.current);
        for (const attack of attacks) {
          useAdventure.getState().damageCivilian(attack.civilianId, CIVILIAN_ATTACK_DAMAGE);
          civilianAttackTimes.current.set(attack.enemyId, nowMs);
        }
      }
      const updated = useAdventure.getState();
      const outcome = evaluateCampaignProgressionGating({
        ...updated, currentWaveIndex: currentWave, totalWavesCount: mission.enemyWaves.length,
      });
      if (player.health <= 0 || outcome === "FAILED") {
        setSuccess(false);
        setPhase("outro");
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        return;
      }

      const allDead = enemies.length > 0 && enemies.every((e) =>
        e.isDead || (mission.id === "story_act1_m4" && e.fighterId === "void-stalker" && state.objectives.milestones.stalkerIntercepted)
      );
      if (allDead) {
        const nextWave = currentWave + 1;
        if (nextWave < mission.enemyWaves.length) {
          setCurrentWave(nextWave);
          const delay = getWaveDelaySeconds(mission, nextWave);
          setPhase("wave-transition");
          // Account for actual elapsed time, not the nominal callback period.
          // Headless WebGL, background tabs and low-end mobile GPUs can throttle
          // setInterval far beyond 100ms. Pause consumes no mission time.
          let remainingMs = delay * 1000;
          let lastTickMs = performance.now();
          if (waveDelayTimerRef.current) clearInterval(waveDelayTimerRef.current);
          waveDelayTimerRef.current = setInterval(() => {
            const nowMs = performance.now();
            const elapsedMs = nowMs - lastTickMs;
            lastTickMs = nowMs;
            remainingMs = advanceWaveDelayMs(remainingMs, elapsedMs, useAdventure.getState().isPaused);
            if (remainingMs > 0) return;
            if (waveDelayTimerRef.current) clearInterval(waveDelayTimerRef.current);
            waveDelayTimerRef.current = null;
            spawnWave(nextWave);
            setPhase("playing");
          }, 100);
        } else if (outcome === "VICTORY") {
          setSuccess(true);
          setPhase("outro");
        } else {
          return; // Fail closed until the mission's actual objective is satisfied.
        }
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      }
    }, 500);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [phase, mission, currentWave, spawnWave]);

  useEffect(() => () => {
    if (waveDelayTimerRef.current) clearInterval(waveDelayTimerRef.current);
  }, []);

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

      {(phase === "playing" || phase === "wave-transition") && <BossEncounterHUD hud={bossHud} />}

      {phase === "wave-transition" && (
        <WaveTransition
          waveNum={currentWave + 1}
          total={mission.enemyWaves.length}
        />
      )}

      {phase === "outro" && (
        <DialogueOverlay
          finale={success ? "victory" : "defeat"}
          lines={success ? mission.outroCutscene : [
            { speaker: "Kai-Jax", text: "No... I can't fall here. Not yet..." },
            { speaker: "???", text: "The Memory Hero crumbles. How disappointing." },
          ]}
          onComplete={() => setPhase("results")}
        />
      )}

      {phase === "results" && (
        <ResultsScreen
          mission={mission}
          success={success}
          onContinue={() => onComplete(success)}
          onRetry={handleRetry}
        />
      )}
    </>
  );
}
