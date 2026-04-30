/**
 * Mission Demo Entry Point
 */

import { MissionScene } from './scenes/MissionScene';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('mission-canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const mission = new MissionScene(canvas);
  mission.start();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  (window as any).mission = mission;

  // Live HUD wiring — subscribe to mission state every 200ms
  const statusEl = document.getElementById('hud-status');
  const waveEl = document.getElementById('hud-wave');
  const killsEl = document.getElementById('hud-kills');
  const hpFill = document.getElementById('hud-hp-fill');

  setInterval(() => {
    const s = mission.getStatus();
    const orch = (mission as any).mission;
    const orchStatus = orch?.getStatus?.();
    if (statusEl) {
      if (!s.missionStarted) statusEl.textContent = 'READY';
      else if (orchStatus?.state === 'complete') statusEl.textContent = 'VICTORY';
      else if (orchStatus?.state === 'failed') statusEl.textContent = 'DEFEATED';
      else statusEl.textContent = (orchStatus?.state || 'ACTIVE').toString().toUpperCase();
    }
    if (waveEl && orchStatus) waveEl.textContent = `${orchStatus.wave} / ${orchStatus.totalWaves}`;
    if (killsEl && orchStatus) killsEl.textContent = String(orchStatus.kills ?? 0);
    if (hpFill) hpFill.style.width = `${Math.max(0, Math.min(100, s.playerHP))}%`;
  }, 200);

  console.log('Mission demo ready. Press SPACE to start.');
});
