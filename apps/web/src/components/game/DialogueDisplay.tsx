import { useEffect, useRef, useState } from "react";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import {
  getDialogueLine,
  type DialogueTrigger,
} from "../../lib/dialogueConfig";

const DISMISS_MS = 4000;

interface DialogueLine {
  speaker: "player" | "opponent";
  displayName: string;
  line: string;
}

function pickSpeaker(): "player" | "opponent" {
  return Math.random() < 0.5 ? "player" : "opponent";
}

export default function DialogueDisplay() {
  const {
    battlePhase,
    playerFighterId,
    opponentFighterId,
    comboCount,
    playerSynergy,
    maxSynergy,
    playerTransformed,
    playerHealth,
    opponentHealth,
    maxHealth,
    winner,
  } = useBattle();

  const [dialogue, setDialogue] = useState<DialogueLine | null>(null);
  const prevPhaseRef = useRef(battlePhase);
  const prevComboRef = useRef(comboCount);
  const prevPlayerHealthRef = useRef(playerHealth);
  const prevOpponentHealthRef = useRef(opponentHealth);
  const prevSynergyRef = useRef(playerSynergy);
  const hasShownFirstHitRef = useRef(false);
  const hasShownRoundStartRef = useRef(false);
  const hasShownTransformReadyRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);

  const showDialogue = (trigger: DialogueTrigger, speaker: "player" | "opponent") => {
    const fighterId = speaker === "player" ? playerFighterId : opponentFighterId;
    const line = getDialogueLine(trigger, speaker, fighterId);
    if (!line) return;
    const fighter = speaker === "player" ? playerFighter : opponentFighter;
    if (!fighter) return;
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setDialogue({ speaker, displayName: fighter.displayName, line });
    dismissTimerRef.current = setTimeout(() => {
      setDialogue(null);
      dismissTimerRef.current = null;
    }, DISMISS_MS);
  };

  // Reset refs when round restarts
  useEffect(() => {
    if (battlePhase === "preRound") {
      hasShownFirstHitRef.current = false;
      hasShownRoundStartRef.current = false;
      hasShownTransformReadyRef.current = false;
    }
  }, [battlePhase]);

  // Round start - short intro line per character/opponent
  useEffect(() => {
    if (!playerFighter || !opponentFighter) return;
    if (battlePhase !== "fighting" || prevPhaseRef.current !== "preRound") return;
    hasShownRoundStartRef.current = true;
    const speaker = pickSpeaker();
    const fighterId = speaker === "player" ? playerFighterId : opponentFighterId;
    const line = getDialogueLine("roundStart", speaker, fighterId);
    if (!line) return;
    const fighter = speaker === "player" ? playerFighter : opponentFighter;
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setDialogue({ speaker, displayName: fighter.displayName, line });
    dismissTimerRef.current = setTimeout(() => {
      setDialogue(null);
      dismissTimerRef.current = null;
    }, DISMISS_MS);
  }, [battlePhase, playerFighter, opponentFighter]);

  // First hit - either player or opponent landed first
  useEffect(() => {
    if (battlePhase !== "fighting") return;
    if (hasShownFirstHitRef.current) return;

    const playerLanded = opponentHealth < prevOpponentHealthRef.current;
    const opponentLanded = playerHealth < prevPlayerHealthRef.current;

    if (playerLanded || opponentLanded) {
      hasShownFirstHitRef.current = true;
      const speaker = playerLanded ? "player" : "opponent";
      showDialogue("firstHit", speaker);
    }
  }, [battlePhase, playerHealth, opponentHealth]);

  // Combo milestones 5, 10, 20
  useEffect(() => {
    if (battlePhase !== "fighting" && battlePhase !== "transforming") return;

    let trigger: DialogueTrigger | null = null;
    if (comboCount === 5 && prevComboRef.current < 5) trigger = "combo5";
    else if (comboCount === 10 && prevComboRef.current < 10) trigger = "combo10";
    else if (comboCount === 20 && prevComboRef.current < 20) trigger = "combo20";

    if (trigger) {
      showDialogue(trigger, "player");
    }
  }, [battlePhase, comboCount]);

  // Transformation ready - synergy hits threshold (50 for Jaxon/Kaison, 100 otherwise)
  useEffect(() => {
    if (!playerFighter) return;
    if (playerTransformed) return;
    if (hasShownTransformReadyRef.current) return;

    const fusionThreshold =
      playerFighterId === "jaxon" || playerFighterId === "kaison" ? 50 : maxSynergy;
    if (playerSynergy >= fusionThreshold && prevSynergyRef.current < fusionThreshold) {
      hasShownTransformReadyRef.current = true;
      showDialogue("transformationReady", "player");
    }
  }, [
    playerSynergy,
    maxSynergy,
    playerFighterId,
    playerTransformed,
    playerFighter,
  ]);

  // KO - winner/loser line
  useEffect(() => {
    if (battlePhase !== "ko" || winner === null) return;
    showDialogue(winner === "player" ? "koWinner" : "koLoser", winner);
  }, [battlePhase, winner]);

  // Update prev refs AFTER comparison effects (so first-hit etc see previous values)
  useEffect(() => {
    prevPhaseRef.current = battlePhase;
    prevComboRef.current = comboCount;
    prevPlayerHealthRef.current = playerHealth;
    prevOpponentHealthRef.current = opponentHealth;
    prevSynergyRef.current = playerSynergy;
  }, [battlePhase, comboCount, playerHealth, opponentHealth, playerSynergy]);

  // Cleanup dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  if (!dialogue) return null;

  const accent =
    dialogue.speaker === "player"
      ? playerFighter?.accentColor ?? "#00d4ff"
      : opponentFighter?.accentColor ?? "#ef4444";

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-[fadeInUp_0.3s_ease-out]"
      style={{ maxWidth: "min(90vw, 360px)" }}
    >
      <div
        className="
          px-4 py-3 rounded-xl
          bg-black/75 backdrop-blur-md
          border
          shadow-[0_4px_24px_rgba(0,0,0,0.6)]
        "
        style={{
          borderColor: `${accent}66`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 20px ${accent}20`,
        }}
      >
        <div
          className="text-xs font-black tracking-wider mb-1"
          style={{ color: accent, textShadow: `0 0 8px ${accent}80` }}
        >
          {dialogue.displayName}
        </div>
        <div className="text-white/95 text-sm sm:text-base font-medium leading-snug">
          "{dialogue.line}"
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
