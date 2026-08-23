/**
 * GameOverlays — global additive utility/debug surfaces.
 *
 * Toggles:
 *   F1 — Quest Log
 *   F2 — Training Lab
 *   F3 — Performance HUD
 */

import { useEffect, useState } from "react";
import PerformanceHUD from "./PerformanceHUD";
import QuestLog from "./QuestLog";
import TrainingLabOverlay from "./TrainingLabOverlay";
import { useTrainingLab } from "../../lib/stores/useTrainingLab";

export default function GameOverlays() {
  const [showPerf, setShowPerf] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showTraining, setShowTraining] = useState(false);

  useEffect(() => {
    useTrainingLab.getState().setEnabled(showTraining);
    if (!showTraining) {
      useTrainingLab.getState().setSimulationPaused(false);
    }
  }, [showTraining]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "F3") {
        event.preventDefault();
        setShowPerf((value) => !value);
      } else if (event.code === "F2") {
        event.preventDefault();
        setShowTraining((value) => !value);
      } else if (event.code === "F1") {
        event.preventDefault();
        setShowQuests((value) => !value);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <PerformanceHUD visible={showPerf} />
      <TrainingLabOverlay visible={showTraining} />
      <QuestLog isOpen={showQuests} onClose={() => setShowQuests(false)} />
    </>
  );
}
