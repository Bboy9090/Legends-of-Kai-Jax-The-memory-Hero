/**
 * Ashblock Slice — React mounter.
 * Owns the canvas + scene + cinematic overlay coordination.
 */
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AshblockSliceScene, type AshblockSliceStatus } from "./scenes/AshblockSliceScene";
import {
  AshblockBeatOverlay,
  type AshblockBeatOverlayHandle,
} from "./components/game/cinematic/AshblockBeatOverlay";

function AshblockSliceApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<AshblockSliceScene | null>(null);
  const overlayCtrlRef = useRef<AshblockBeatOverlayHandle | null>(null);
  const [status, setStatus] = useState<AshblockSliceStatus | null>(null);
  const [sliceComplete, setSliceComplete] = useState(false);
  const [playerDead, setPlayerDead] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const scene = new AshblockSliceScene(canvas, {
      character: "kai",
      callbacks: {
        onStatus: (s) => setStatus(s),
        onEncounterCleared: () => {
          // Tell the overlay to roll into payoff beat.
          overlayCtrlRef.current?.notifyCombatComplete();
        },
        onPlayerDied: () => setPlayerDead(true),
      },
    });
    sceneRef.current = scene;
    scene.start();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      scene.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scene.stop();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="ashblock-canvas"
        data-testid="ashblock-canvas"
        style={{ display: "block", width: "100vw", height: "100vh" }}
      />

      {/* HUD — minimal, always visible */}
      <div
        data-testid="ashblock-hud"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          padding: "10px 14px",
          background: "rgba(8,5,12,0.78)",
          border: "1px solid rgba(255,138,61,0.4)",
          borderRadius: 4,
          color: "#fff",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          letterSpacing: "0.15em",
          zIndex: 60,
          pointerEvents: "none",
        }}
      >
        <div style={{ color: "#ff8a3d", fontWeight: 700, marginBottom: 6 }}>
          ASHBLOCK HEIGHTS · ACT I
        </div>
        <div data-testid="hud-hp">
          HP <span style={{ color: "#9eff6e" }}>{status?.playerHP ?? 100}</span>/
          {status?.playerMaxHP ?? 100}
        </div>
        <div data-testid="hud-encounter">
          Encounter <span style={{ color: "#ffd23d" }}>{status?.encounterId ?? "—"}</span>
        </div>
        <div data-testid="hud-enemies">
          Enemies <span style={{ color: "#ff6e6e" }}>{status?.enemyCount ?? 0}</span>
          {status?.bossAlive ? "  + BOSS" : ""}
        </div>
        <div style={{ marginTop: 10, color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
          WASD · J K L I U O · SHIFT shield
        </div>
      </div>

      {!sliceComplete && !playerDead && (
        <AshblockBeatOverlay
          controlRef={overlayCtrlRef}
          onEscalation={(encounterId) => {
            sceneRef.current?.beginEncounter(encounterId);
          }}
          onSliceComplete={() => setSliceComplete(true)}
        />
      )}

      {playerDead && (
        <div
          data-testid="ashblock-player-dead"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,4,8,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            color: "#ff5555",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.4em",
            fontSize: 28,
          }}
        >
          THE BLOCK TOOK YOU
        </div>
      )}

      {sliceComplete && (
        <div
          data-testid="ashblock-slice-complete"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,4,2,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            color: "#ff8a3d",
            fontFamily: "'Courier New', monospace",
            textAlign: "center",
            padding: 32,
          }}
        >
          <div style={{ letterSpacing: "0.4em", fontSize: 24, marginBottom: 16 }}>
            ASHBLOCK REMEMBERS
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", maxWidth: 520, lineHeight: 1.6 }}>
            The block has been held. Boryn breathes beside you, watching the dusk move on without you.
            Memory keeps the score.
          </div>
          <div style={{ marginTop: 24, color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.3em" }}>
            END OF ACT I VERTICAL SLICE
          </div>
        </div>
      )}
    </>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("react-root");
  if (!root) {
    console.error("[ashblock-slice] #react-root not found");
    return;
  }
  createRoot(root).render(<AshblockSliceApp />);
});
