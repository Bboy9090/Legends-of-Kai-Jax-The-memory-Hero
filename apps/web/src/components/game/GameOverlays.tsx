/**
 * GameOverlays — global, additive dev/utility overlays.
 * Mounts the Wave 2 PerformanceHUD and QuestLog behind keyboard toggles.
 * Purely additive: does not touch gameplay state or input handling for combat.
 *
 * Toggles:
 *   F3 — Performance HUD (FPS / frame time / memory)
 *   F1 — Quest Log
 */

import { useEffect, useState } from "react";
import PerformanceHUD from "./PerformanceHUD";
import QuestLog from "./QuestLog";

export default function GameOverlays() {
  const [showPerf, setShowPerf] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Use function keys so we never collide with combat/movement controls.
      if (e.code === "F3") {
        e.preventDefault();
        setShowPerf((v) => !v);
      } else if (e.code === "F1") {
        e.preventDefault();
        setShowQuests((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <PerformanceHUD visible={showPerf} />
      <QuestLog isOpen={showQuests} onClose={() => setShowQuests(false)} />
    </>
  );
}
