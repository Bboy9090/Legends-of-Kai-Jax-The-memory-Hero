/**
 * Mission End-State Overlay
 *
 * Watches MissionScene + MissionOrchestrator state and renders a fullscreen
 * VICTORY / DEFEAT overlay with stats, a Retry button (reload), and an
 * Exit button (back to the lore hub).
 *
 * Lives at the DOM level (not React) since the demo pages are vanilla TS.
 */

import type { MissionScene } from '../scenes/MissionScene';

interface MissionStatus {
  frameCount: number;
  playerHP: number;
  enemyCount: number;
  missionStarted: boolean;
}
interface OrchestratorStatus {
  missionName: string;
  state: string;
  wave: number;
  totalWaves: number;
  kills: number;
  enemiesActive: number;
  bossSpawned: boolean;
}

let frozen = false;

function ensureOverlay(): HTMLDivElement {
  let el = document.getElementById('mission-endstate') as HTMLDivElement | null;
  if (el) return el;
  el = document.createElement('div');
  el.id = 'mission-endstate';
  el.setAttribute('data-testid', 'mission-endstate');
  el.style.cssText = [
    'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.85)',
    'display:none', 'align-items:center', 'justify-content:center',
    'z-index:99998', 'font-family:Courier New,monospace',
    'backdrop-filter:blur(6px)',
    '-webkit-backdrop-filter:blur(6px)',
  ].join(';');
  document.body.appendChild(el);
  return el;
}

function render(state: 'victory' | 'defeat', stats: { mission: string; wave: string; kills: number; hp: number; frames: number }) {
  const el = ensureOverlay();
  const isWin = state === 'victory';
  const accent = isWin ? '#00ff88' : '#ff3344';
  const title = isWin ? 'VICTORY' : 'DEFEATED';
  const subtitle = isWin ? 'Mission Complete' : 'Mission Failed';
  const seconds = (stats.frames / 60).toFixed(1);

  el.innerHTML = `
    <div style="border:3px solid ${accent}; padding:48px 64px; min-width:420px; text-align:center; background:linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,40,0.9)); box-shadow:0 0 60px ${accent}55;">
      <div style="color:${accent}; font-size:14px; letter-spacing:6px; margin-bottom:8px; text-transform:uppercase">${subtitle}</div>
      <div style="color:${accent}; font-size:64px; font-weight:bold; letter-spacing:8px; margin-bottom:24px; text-shadow:0 0 24px ${accent}; animation:pulse 1.6s infinite" data-testid="endstate-title">${title}</div>
      <div style="color:#888; font-size:11px; margin-bottom:18px">${stats.mission}</div>
      <div style="display:grid; grid-template-columns:auto auto; gap:8px 24px; margin:24px 0; color:#ddd; font-size:14px; text-align:left">
        <div style="color:#888">Wave Reached:</div><div style="color:#fff" data-testid="endstate-wave">${stats.wave}</div>
        <div style="color:#888">Kills:</div><div style="color:#fff" data-testid="endstate-kills">${stats.kills}</div>
        <div style="color:#888">HP Remaining:</div><div style="color:#fff" data-testid="endstate-hp">${stats.hp} / 100</div>
        <div style="color:#888">Time:</div><div style="color:#fff" data-testid="endstate-time">${seconds}s</div>
      </div>
      <div style="display:flex; gap:12px; margin-top:24px; justify-content:center">
        <button id="endstate-retry" data-testid="endstate-retry-btn" style="background:${accent}; color:#000; border:none; padding:14px 32px; font-family:inherit; font-weight:bold; letter-spacing:2px; cursor:pointer; font-size:14px; text-transform:uppercase; transition:transform 0.1s">RETRY</button>
        <button id="endstate-exit" data-testid="endstate-exit-btn" style="background:transparent; color:${accent}; border:2px solid ${accent}; padding:12px 30px; font-family:inherit; font-weight:bold; letter-spacing:2px; cursor:pointer; font-size:14px; text-transform:uppercase">EXIT</button>
      </div>
      <div style="margin-top:20px; color:#555; font-size:10px">[R] retry · [Esc] exit</div>
    </div>
    <style>
      @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.7 } }
      #endstate-retry:hover { transform:scale(1.05) }
      #endstate-exit:hover { background:${accent}22 }
    </style>
  `;
  el.style.display = 'flex';

  const retry = () => window.location.reload();
  const exit = () => { window.location.href = '/'; };

  el.querySelector<HTMLButtonElement>('#endstate-retry')?.addEventListener('click', retry);
  el.querySelector<HTMLButtonElement>('#endstate-exit')?.addEventListener('click', exit);

  const handler = (e: KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') retry();
    if (e.key === 'Escape') exit();
  };
  window.addEventListener('keydown', handler, { once: false });
  // Auto-cleanup if the overlay is removed
}

export function installMissionEndStateWatcher(mission: MissionScene): void {
  const tick = setInterval(() => {
    if (frozen) return;
    const status = (mission as any).getStatus?.() as MissionStatus | undefined;
    const orch = (mission as any).mission;
    const orchStatus = orch?.getStatus?.() as OrchestratorStatus | undefined;
    if (!status || !orchStatus) return;

    if (orchStatus.state === 'won' || orchStatus.state === 'lost') {
      frozen = true;
      clearInterval(tick);
      const stats = {
        mission: orchStatus.missionName,
        wave: `${Math.min(orchStatus.wave, orchStatus.totalWaves)} / ${orchStatus.totalWaves}`,
        kills: orchStatus.kills,
        hp: status.playerHP,
        frames: status.frameCount,
      };
      render(orchStatus.state === 'won' ? 'victory' : 'defeat', stats);
    }
  }, 200);
}
