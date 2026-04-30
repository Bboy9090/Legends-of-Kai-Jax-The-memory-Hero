/**
 * Registry Debug Overlay
 *
 * Toggle with `~` (backtick / tilde key).
 * Lists every entry in MODEL_REGISTRY, async-validates each by:
 *   - HEAD request to confirm the file is reachable
 *   - GLTFLoader load to confirm it parses
 *   - traverse loaded scene to confirm canonical anchor presence
 *     (root / spine / head / tail_01..tail_09)
 *
 * Renders a one-glance dashboard so future-you can drop a new GLB into
 * the registry and see immediately whether the asset is healthy.
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_REGISTRY } from '../assets/modelRegistry';

interface AnchorReport {
  root: boolean;
  spine: boolean;
  head: boolean;
  tails: number; // 0..9
  bones: number;
}

interface EntryReport {
  id: string;
  path: string;
  scale: number;
  reachable: boolean | null; // null = pending
  loaded: boolean | null;
  anchors: AnchorReport | null;
  error?: string;
}

const STORAGE_KEY = 'lokj_registry_debug_open';

function findByName(root: any, name: string): boolean {
  let hit = false;
  root.traverse((o: any) => {
    if (hit) return;
    if (o.name === name || o.name.toLowerCase() === name.toLowerCase()) hit = true;
  });
  return hit;
}

function findByContains(root: any, fragment: string): boolean {
  let hit = false;
  const f = fragment.toLowerCase();
  root.traverse((o: any) => {
    if (hit) return;
    if (o.name.toLowerCase().includes(f)) hit = true;
  });
  return hit;
}

async function validateEntry(id: string, path: string): Promise<EntryReport> {
  const entry: EntryReport = {
    id,
    path,
    scale: MODEL_REGISTRY[id].scale,
    reachable: null,
    loaded: null,
    anchors: null,
  };

  // HEAD reachability
  try {
    const res = await fetch(path, { method: 'HEAD' });
    entry.reachable = res.ok;
    if (!res.ok) {
      entry.error = `HTTP ${res.status}`;
      entry.loaded = false;
      return entry;
    }
  } catch (e: any) {
    entry.reachable = false;
    entry.error = e?.message || 'fetch failed';
    entry.loaded = false;
    return entry;
  }

  // GLB load + anchor traverse
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync(path);
    const sceneRoot = gltf.scene;

    let bones = 0;
    sceneRoot.traverse((o: any) => {
      if (o.isBone) bones++;
    });

    const root = findByName(sceneRoot, 'root') || findByContains(sceneRoot, 'hips');
    const spine = findByName(sceneRoot, 'spine') || findByContains(sceneRoot, 'spine');
    const head = findByName(sceneRoot, 'head') || findByContains(sceneRoot, 'head');
    let tails = 0;
    for (let i = 1; i <= 9; i++) {
      const tailId = `tail_${i.toString().padStart(2, '0')}`;
      if (findByName(sceneRoot, tailId)) tails++;
    }

    entry.loaded = true;
    entry.anchors = { root, spine, head, tails, bones };
  } catch (e: any) {
    entry.loaded = false;
    entry.error = e?.message || 'GLTFLoader failed';
  }

  return entry;
}

function row(e: EntryReport): string {
  const dot = (ok: boolean | null, label: string) => {
    if (ok === null) return `<span style="color:#888">${label}…</span>`;
    if (ok) return `<span style="color:#00ff88">${label}✓</span>`;
    return `<span style="color:#ff5555">${label}✗</span>`;
  };
  const a = e.anchors;
  const tailColor = !a ? '#888' : a.tails === 9 ? '#00ff88' : a.tails > 0 ? '#ffd700' : '#ff5555';
  const tailLabel = a ? `${a.tails}/9` : '—';
  const anchors = a
    ? `${dot(a.root, 'root')} ${dot(a.spine, 'spine')} ${dot(a.head, 'head')} <span style="color:${tailColor}">tails ${tailLabel}</span> <span style="color:#888">bones=${a.bones}</span>`
    : '<span style="color:#888">pending…</span>';
  const err = e.error ? ` <span style="color:#ff5555">[${e.error}]</span>` : '';
  return `<tr>
    <td style="padding:3px 8px; color:#00d9ff; font-weight:bold">${e.id}</td>
    <td style="padding:3px 8px">${dot(e.reachable, 'fetch')}</td>
    <td style="padding:3px 8px">${dot(e.loaded, 'parse')}</td>
    <td style="padding:3px 8px">${anchors}${err}</td>
    <td style="padding:3px 8px"><button data-load-id="${e.id}" style="background:#222;color:#00d9ff;border:1px solid #00d9ff;padding:1px 8px;cursor:pointer;font-family:inherit">load</button></td>
    <td style="padding:3px 8px;color:#666;font-size:10px">${e.path}</td>
  </tr>`;
}

function summaryLine(reports: EntryReport[]): string {
  const total = reports.length;
  const ready = reports.filter((r) => r.loaded).length;
  const reachable = reports.filter((r) => r.reachable).length;
  const fullAnchors = reports.filter((r) => r.anchors && r.anchors.root && r.anchors.spine && r.anchors.head && r.anchors.tails === 9).length;
  return `<span style="color:#00d9ff">${total}</span> registered · <span style="color:#00ff88">${reachable}</span> reachable · <span style="color:#00ff88">${ready}</span> parsed · <span style="color:#ffd700">${fullAnchors}</span> with full canonical anchors (root+spine+head+tail_01..09)`;
}

function ensureContainer(): HTMLDivElement {
  let el = document.getElementById('registry-debug-overlay') as HTMLDivElement | null;
  if (el) return el;
  el = document.createElement('div');
  el.id = 'registry-debug-overlay';
  el.style.cssText = [
    'position:fixed', 'top:0', 'right:0', 'width:780px', 'max-height:96vh',
    'overflow-y:auto', 'background:rgba(0,0,0,0.95)', 'border:2px solid #00d9ff',
    'color:#ddd', 'font-family:Courier New,monospace', 'font-size:12px',
    'padding:14px 18px', 'z-index:99999', 'box-shadow:-4px 0 20px rgba(0,217,255,0.25)',
    'display:none',
  ].join(';');
  document.body.appendChild(el);
  return el;
}

function setOpen(open: boolean) {
  const el = ensureContainer();
  el.style.display = open ? 'block' : 'none';
  try { localStorage.setItem(STORAGE_KEY, open ? '1' : '0'); } catch {}
}

function render(el: HTMLDivElement, reports: EntryReport[]) {
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #00d9ff;padding-bottom:6px">
      <div style="color:#ffd700;font-weight:bold;font-size:14px;letter-spacing:2px">REGISTRY DEBUG</div>
      <div>
        <button id="rd-refresh" style="background:#111;color:#00d9ff;border:1px solid #00d9ff;padding:3px 10px;cursor:pointer;font-family:inherit;margin-right:8px">refresh</button>
        <button id="rd-close" style="background:#111;color:#ff5555;border:1px solid #ff5555;padding:3px 10px;cursor:pointer;font-family:inherit">close (~)</button>
      </div>
    </div>
    <div style="margin-bottom:10px;font-size:11px;line-height:1.6">${summaryLine(reports)}</div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="color:#888;text-align:left;font-size:11px;border-bottom:1px solid #333">
          <th style="padding:4px 8px">id</th>
          <th style="padding:4px 8px">net</th>
          <th style="padding:4px 8px">parse</th>
          <th style="padding:4px 8px">anchors</th>
          <th style="padding:4px 8px"></th>
          <th style="padding:4px 8px">path</th>
        </tr>
      </thead>
      <tbody>${reports.map(row).join('')}</tbody>
    </table>
    <div style="margin-top:10px;font-size:10px;color:#666">
      Looking for canonical anchors: <span style="color:#00d9ff">root</span> · <span style="color:#00d9ff">spine</span> · <span style="color:#00d9ff">head</span> · <span style="color:#00d9ff">tail_01..tail_09</span>.<br>
      A full ✓ row means the asset is ready for bone-socket hitbox attachment.
    </div>
  `;
  el.querySelector<HTMLButtonElement>('#rd-close')?.addEventListener('click', () => setOpen(false));
  el.querySelector<HTMLButtonElement>('#rd-refresh')?.addEventListener('click', () => boot(true));
  el.querySelectorAll<HTMLButtonElement>('button[data-load-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-load-id')!;
      btn.textContent = 'loading…';
      const r = await validateEntry(id, MODEL_REGISTRY[id].path);
      const idx = reports.findIndex((x) => x.id === id);
      if (idx >= 0) reports[idx] = r;
      render(el, reports);
    });
  });
}

let bootedOnce = false;
async function boot(force: boolean = false) {
  const el = ensureContainer();
  if (bootedOnce && !force) {
    el.style.display = 'block';
    return;
  }
  bootedOnce = true;

  const ids = Object.keys(MODEL_REGISTRY);
  const reports: EntryReport[] = ids.map((id) => ({
    id,
    path: MODEL_REGISTRY[id].path,
    scale: MODEL_REGISTRY[id].scale,
    reachable: null,
    loaded: null,
    anchors: null,
  }));
  render(el, reports);
  el.style.display = 'block';

  // Validate sequentially to avoid hammering the network with 26 GLB downloads
  for (let i = 0; i < ids.length; i++) {
    reports[i] = await validateEntry(ids[i], MODEL_REGISTRY[ids[i]].path);
    render(el, reports);
  }
}

export function installRegistryDebugOverlay(): void {
  // Restore last open state
  let openOnLoad = false;
  try { openOnLoad = localStorage.getItem(STORAGE_KEY) === '1'; } catch {}

  window.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      const el = ensureContainer();
      const willOpen = el.style.display === 'none' || !el.style.display;
      if (willOpen) boot();
      else setOpen(false);
    }
  });

  if (openOnLoad) boot();

  // Expose for console use
  (window as any).registryDebug = { open: () => boot(), close: () => setOpen(false), refresh: () => boot(true) };
  console.log('[RegistryDebug] Press ~ (tilde/backtick) to toggle the registry health overlay.');
}
