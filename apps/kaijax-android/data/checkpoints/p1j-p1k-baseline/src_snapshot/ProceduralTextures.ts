import * as THREE from 'three';

export interface WorldTextureSet {
  asphaltMap: THREE.CanvasTexture;
  asphaltRoughness: THREE.CanvasTexture;
  sidewalkMap: THREE.CanvasTexture;
  buildingFacadeMap: THREE.CanvasTexture;
  buildingWarmOchreMap: THREE.CanvasTexture;
  containerMap: THREE.CanvasTexture;
  awningMap: THREE.CanvasTexture;
  muralUnityMap: THREE.CanvasTexture;
  billboardTrustMap: THREE.CanvasTexture;
  graffitiMemoryMap: THREE.CanvasTexture;
  bannerRoarMap: THREE.CanvasTexture;
  signMarketMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

// Deterministic pseudo-random helper so procedural world maps remain crisp & repeatable
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function finalizeColorTex(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  if (repeatX > 1 || repeatY > 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function paintTenementFacade(
  baseHex: string,
  panelTintHexes: string[],
  seed: number,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const rng = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Patched tenement plaster & weathered color blocks (Ashblock Heights sheet reference)
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = panelTintHexes[Math.floor(rng() * panelTintHexes.length)];
    ctx.globalAlpha = 0.14 + rng() * 0.2;
    ctx.fillRect(rng() * 440, rng() * 440, 48 + rng() * 96, 36 + rng() * 72);
  }
  ctx.globalAlpha = 1;

  // Fine masonry & soot speckle
  for (let i = 0; i < 2600; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const dark = rng() > 0.45;
    ctx.fillStyle = dark ? 'rgba(12,14,20,0.24)' : 'rgba(226,212,190,0.12)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Horizontal concrete floor slabs & vertical expansion seams
  for (let y = 0; y < 512; y += 64) {
    ctx.fillStyle = 'rgba(10,12,18,0.68)';
    ctx.fillRect(0, y, 512, 4);
    ctx.fillStyle = 'rgba(180,158,132,0.16)';
    ctx.fillRect(0, y + 4, 512, 2);
  }
  for (let x = 0; x < 512; x += 128) {
    ctx.fillStyle = 'rgba(12,15,22,0.45)';
    ctx.fillRect(x, 0, 3, 512);
  }

  // Tenement windows, shutters, rust drip stains & AC units
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const wx = 14 + col * 62;
      const wy = 12 + row * 64;
      const roll = rng();

      // Window recess
      ctx.fillStyle = '#0c0f16';
      ctx.fillRect(wx - 2, wy - 2, 38, 42);

      if (roll > 0.72) {
        // Warm tungsten / hearth-lit lived-in apartment window
        const grad = ctx.createLinearGradient(wx, wy, wx, wy + 38);
        grad.addColorStop(0, roll > 0.9 ? '#fb923c' : '#f59e0b');
        grad.addColorStop(1, '#7c2d12');
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.72 + rng() * 0.22;
      } else if (roll > 0.58) {
        // Cool television / workshop glow
        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = 0.36 + rng() * 0.2;
      } else {
        // Darkened shuttered pane
        ctx.fillStyle = '#141923';
        ctx.globalAlpha = 0.95;
      }
      ctx.fillRect(wx, wy, 34, 38);
      ctx.globalAlpha = 1;

      // Mullions & weathered sill
      ctx.fillStyle = '#262d3d';
      ctx.fillRect(wx + 16, wy, 2, 38);
      ctx.fillRect(wx, wy + 18, 34, 2);
      ctx.fillStyle = '#473d35';
      ctx.fillRect(wx - 3, wy + 37, 40, 4);

      // Rust drip streaks below window sills
      if (rng() > 0.42) {
        ctx.fillStyle = 'rgba(92, 45, 24, 0.36)';
        ctx.fillRect(wx + 4 + rng() * 20, wy + 41, 3, 12 + rng() * 10);
      }

      // Occasional exterior metal AC unit box
      if (rng() > 0.68) {
        const ax = wx + 20;
        const ay = wy + 24;
        ctx.fillStyle = '#646b75';
        ctx.fillRect(ax, ay, 18, 13);
        ctx.fillStyle = '#1e2430';
        ctx.beginPath();
        ctx.arc(ax + 6, ay + 6.5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return finalizeColorTex(c, maxAnisotropy, 2, 2);
}

export function createProceduralTextures(maxAnisotropy: number): WorldTextureSet {
  const rng = mulberry32(20260803);

  // 1. Wet Cobble-Asphalt Street Albedo with Crosswalk & Drainage Grates
  const aspCanvas = document.createElement('canvas');
  aspCanvas.width = 512;
  aspCanvas.height = 512;
  const actx = aspCanvas.getContext('2d')!;
  actx.fillStyle = '#141821';
  actx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 4800; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const v = 16 + Math.floor(rng() * 24);
    actx.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
    actx.fillRect(x, y, 2, 2);
  }
  // Tire tracks & oil sheen
  actx.fillStyle = 'rgba(8, 10, 15, 0.42)';
  actx.fillRect(156, 0, 38, 512);
  actx.fillRect(318, 0, 38, 512);

  // Weathered double-ochre center lane markings
  actx.fillStyle = 'rgba(217, 164, 65, 0.34)';
  for (let y = 16; y < 512; y += 96) {
    actx.fillRect(248, y, 6, 56);
    actx.fillRect(258, y, 6, 56);
  }
  // Iron manhole cover detail
  actx.fillStyle = '#252b38';
  actx.beginPath();
  actx.arc(256, 256, 22, 0, Math.PI * 2);
  actx.fill();
  actx.strokeStyle = '#11151d';
  actx.lineWidth = 3;
  actx.stroke();

  const asphaltMap = finalizeColorTex(aspCanvas, maxAnisotropy, 6, 18);

  // 2. Wet Puddle Roughness Map (linear NoColorSpace)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#bdbdbd';
  rctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18; i++) {
    const px = rng() * 512;
    const py = rng() * 512;
    const pr = 34 + rng() * 78;
    const grad = rctx.createRadialGradient(px, py, 4, px, py, pr);
    grad.addColorStop(0, '#161616');
    grad.addColorStop(0.68, '#343434');
    grad.addColorStop(1, 'rgba(189,189,189,0)');
    rctx.fillStyle = grad;
    rctx.beginPath();
    rctx.arc(px, py, pr, 0, Math.PI * 2);
    rctx.fill();
  }
  const asphaltRoughness = new THREE.CanvasTexture(roughCanvas);
  asphaltRoughness.wrapS = THREE.RepeatWrapping;
  asphaltRoughness.wrapT = THREE.RepeatWrapping;
  asphaltRoughness.repeat.set(6, 16);
  asphaltRoughness.anisotropy = maxAnisotropy;

  // 2b. Concrete Flagstone Sidewalk Map
  const swCanvas = document.createElement('canvas');
  swCanvas.width = 256;
  swCanvas.height = 256;
  const swCtx = swCanvas.getContext('2d')!;
  swCtx.fillStyle = '#2a2f3a';
  swCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1200; i++) {
    const v = 36 + Math.floor(rng() * 22);
    swCtx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
    swCtx.fillRect(rng() * 256, rng() * 256, 2, 2);
  }
  swCtx.strokeStyle = '#181c24';
  swCtx.lineWidth = 2;
  for (let p = 0; p < 256; p += 64) {
    swCtx.beginPath();
    swCtx.moveTo(0, p);
    swCtx.lineTo(256, p);
    swCtx.moveTo(p, 0);
    swCtx.lineTo(p, 256);
    swCtx.stroke();
  }
  swCtx.fillStyle = 'rgba(212, 175, 55, 0.28)';
  swCtx.fillRect(0, 0, 10, 256);
  const sidewalkMap = finalizeColorTex(swCanvas, maxAnisotropy, 2, 18);

  // 3. Weathered Ashblock Tenement Facades (Slate-Brick + Warm Ochre Plaster Variants)
  const buildingFacadeMap = paintTenementFacade(
    '#242834',
    ['#4a352c', '#2b3b47', '#5c3a2e', '#363c4a'],
    101,
    maxAnisotropy
  );
  const buildingWarmOchreMap = paintTenementFacade(
    '#4a3c31',
    ['#6e533b', '#5c3428', '#2d454c', '#3b3530'],
    202,
    maxAnisotropy
  );

  // 4. Corrugated Industrial Container
  const cntCanvas = document.createElement('canvas');
  cntCanvas.width = 256;
  cntCanvas.height = 256;
  const cctx = cntCanvas.getContext('2d')!;
  cctx.fillStyle = '#26303f';
  cctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 16) {
    cctx.fillStyle = x % 32 === 0 ? '#19202b' : '#334054';
    cctx.fillRect(x, 0, 8, 256);
  }
  // Rust wear along bottom edge + stencil hazard stripe
  cctx.fillStyle = 'rgba(124, 54, 26, 0.52)';
  cctx.fillRect(0, 214, 256, 42);
  cctx.fillStyle = 'rgba(234, 88, 12, 0.78)';
  cctx.fillRect(0, 116, 256, 14);
  const containerMap = finalizeColorTex(cntCanvas, maxAnisotropy, 1, 1);

  // 5. Rusted Patchwork Corrugated Shopfront Awning (Red / Teal / Mustard Tin Panels from d438c610.png)
  const awnCanvas = document.createElement('canvas');
  awnCanvas.width = 256;
  awnCanvas.height = 128;
  const awCtx = awnCanvas.getContext('2d')!;
  const tinColors = ['#7f2f29', '#2b5861', '#8a6229', '#573a2e', '#6b2824', '#334e58'];
  for (let i = 0; i < 8; i++) {
    awCtx.fillStyle = tinColors[i % tinColors.length];
    awCtx.fillRect(i * 32, 0, 32, 128);
  }
  for (let x = 0; x < 256; x += 8) {
    awCtx.fillStyle = x % 16 === 0 ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.08)';
    awCtx.fillRect(x, 0, 4, 128);
  }
  awCtx.fillStyle = 'rgba(68, 32, 18, 0.45)';
  awCtx.fillRect(0, 96, 256, 32);
  const awningMap = finalizeColorTex(awnCanvas, maxAnisotropy, 1, 1);

  // 6. Ashblock Landmark Mural 1: "STRENGTH THROUGH UNITY" (d438c610.png center tower mural)
  const muCanvas = document.createElement('canvas');
  muCanvas.width = 256;
  muCanvas.height = 512;
  const mu = muCanvas.getContext('2d')!;
  const muGrad = mu.createLinearGradient(0, 0, 0, 512);
  muGrad.addColorStop(0, '#7c2d24');
  muGrad.addColorStop(0.5, '#26384a');
  muGrad.addColorStop(1, '#1d4d61');
  mu.fillStyle = muGrad;
  mu.fillRect(0, 0, 256, 512);
  // Stylized Guardian Beast Silhouette
  mu.fillStyle = '#e2e8f0';
  mu.beginPath();
  mu.moveTo(128, 44);
  mu.lineTo(168, 22);
  mu.lineTo(162, 86);
  mu.lineTo(196, 134);
  mu.lineTo(148, 214);
  mu.lineTo(108, 214);
  mu.lineTo(60, 134);
  mu.lineTo(94, 86);
  mu.lineTo(88, 22);
  mu.closePath();
  mu.fill();
  mu.fillStyle = '#1e293b';
  mu.beginPath();
  mu.moveTo(128, 72);
  mu.lineTo(158, 124);
  mu.lineTo(128, 188);
  mu.lineTo(98, 124);
  mu.closePath();
  mu.fill();
  mu.fillStyle = '#f59e0b';
  mu.fillRect(108, 114, 12, 6);
  mu.fillRect(136, 114, 12, 6);
  // Stencil Banner Copy
  mu.fillStyle = '#f8fafc';
  mu.font = 'bold 28px sans-serif';
  mu.textAlign = 'center';
  mu.fillText('STRENGTH', 128, 276);
  mu.fillText('THROUGH', 128, 314);
  mu.fillText('UNITY', 128, 352);
  // Weathering scratches
  mu.strokeStyle = 'rgba(20, 20, 24, 0.45)';
  mu.lineWidth = 4;
  mu.strokeRect(8, 8, 240, 496);
  const muralUnityMap = finalizeColorTex(muCanvas, maxAnisotropy);

  // 7. Ashblock Landmark Billboard 2: Purple "TRUST — WE SEE YOU" (d438c610.png mid-level billboard)
  const btCanvas = document.createElement('canvas');
  btCanvas.width = 512;
  btCanvas.height = 256;
  const bt = btCanvas.getContext('2d')!;
  bt.fillStyle = '#43256e';
  bt.fillRect(0, 0, 512, 256);
  bt.strokeStyle = '#d4af37';
  bt.lineWidth = 6;
  bt.strokeRect(10, 10, 492, 236);
  // Covenant All-Seeing Emblem
  bt.strokeStyle = '#e9d5ff';
  bt.lineWidth = 5;
  bt.beginPath();
  bt.arc(256, 98, 44, 0, Math.PI * 2);
  bt.stroke();
  bt.beginPath();
  bt.moveTo(256, 56);
  bt.lineTo(294, 124);
  bt.lineTo(218, 124);
  bt.closePath();
  bt.stroke();
  bt.fillStyle = '#f59e0b';
  bt.beginPath();
  bt.arc(256, 98, 10, 0, Math.PI * 2);
  bt.fill();
  bt.fillStyle = '#f3e8ff';
  bt.font = 'bold 34px sans-serif';
  bt.textAlign = 'center';
  bt.fillText('T R U S T', 256, 184);
  bt.font = 'bold 18px sans-serif';
  bt.fillStyle = '#d8b4fe';
  bt.fillText('WE SEE YOU', 256, 214);
  const billboardTrustMap = finalizeColorTex(btCanvas, maxAnisotropy);

  // 8. Ashblock Resistance Graffiti 3: "THE MEMORY — REMEMBER WHAT THEY TRIED TO ERASE!" (d438c610.png left wall)
  const gmCanvas = document.createElement('canvas');
  gmCanvas.width = 256;
  gmCanvas.height = 256;
  const gm = gmCanvas.getContext('2d')!;
  gm.fillStyle = '#785c38';
  gm.fillRect(0, 0, 256, 256);
  // Three-Pointed Memory Crown Stencil
  gm.strokeStyle = '#141210';
  gm.lineWidth = 7;
  gm.beginPath();
  gm.moveTo(68, 124);
  gm.lineTo(60, 68);
  gm.lineTo(104, 98);
  gm.lineTo(128, 52);
  gm.lineTo(152, 98);
  gm.lineTo(196, 68);
  gm.lineTo(188, 124);
  gm.closePath();
  gm.stroke();
  gm.fillStyle = '#141210';
  gm.font = 'bold 21px sans-serif';
  gm.textAlign = 'center';
  gm.fillText('THE MEMORY', 128, 38);
  gm.font = 'bold 16px sans-serif';
  gm.fillText('REMEMBER WHAT', 128, 166);
  gm.fillText('THEY TRIED', 128, 190);
  gm.fillText('TO ERASE!', 128, 214);
  const graffitiMemoryMap = finalizeColorTex(gmCanvas, maxAnisotropy);

  // 8b. Canon Raging City Resistance Street Banner: "WE ROAR AS ONE" (f9d37a6e.png)
  const brCanvas = document.createElement('canvas');
  brCanvas.width = 512;
  brCanvas.height = 128;
  const br = brCanvas.getContext('2d')!;
  const brGrad = br.createLinearGradient(0, 0, 512, 0);
  brGrad.addColorStop(0, '#5c1f19');
  brGrad.addColorStop(0.5, '#7c2d12');
  brGrad.addColorStop(1, '#5c1f19');
  br.fillStyle = brGrad;
  br.fillRect(0, 0, 512, 128);
  br.strokeStyle = '#d4af37';
  br.lineWidth = 5;
  br.strokeRect(8, 8, 496, 112);
  br.fillStyle = '#fef3c7';
  br.font = 'bold 34px sans-serif';
  br.textAlign = 'center';
  br.fillText('WE ROAR AS ONE', 256, 76);
  br.fillStyle = '#f59e0b';
  br.font = 'bold 14px sans-serif';
  br.fillText('ASHBLOCK HEIGHTS SOLIDARITY', 256, 102);
  const bannerRoarMap = finalizeColorTex(brCanvas, maxAnisotropy);

  // 8c. Canon District Shopfront Signage: "BEAST-KIN MARKET · FANG & CLAW TAILORING" (f9d37a6e.png)
  const smCanvas = document.createElement('canvas');
  smCanvas.width = 512;
  smCanvas.height = 128;
  const sm = smCanvas.getContext('2d')!;
  sm.fillStyle = '#17202c';
  sm.fillRect(0, 0, 512, 128);
  sm.strokeStyle = '#fb923c';
  sm.lineWidth = 4;
  sm.strokeRect(6, 6, 500, 116);
  sm.fillStyle = '#fde68a';
  sm.font = 'bold 27px sans-serif';
  sm.textAlign = 'center';
  sm.fillText('BEAST-KIN MARKET', 256, 56);
  sm.fillStyle = '#38bdf8';
  sm.font = 'bold 17px sans-serif';
  sm.fillText('FANG & CLAW TAILORING · IRONSMITH', 256, 94);
  const signMarketMap = finalizeColorTex(smCanvas, maxAnisotropy);

  // 9. Radial Contact Shadow
  const shCanvas = document.createElement('canvas');
  shCanvas.width = 128;
  shCanvas.height = 128;
  const sctx = shCanvas.getContext('2d')!;
  const sgrad = sctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  sgrad.addColorStop(0, 'rgba(0,0,0,0.74)');
  sgrad.addColorStop(0.6, 'rgba(0,0,0,0.28)');
  sgrad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = sgrad;
  sctx.fillRect(0, 0, 128, 128);
  const contactShadowMap = new THREE.CanvasTexture(shCanvas);

  return {
    asphaltMap,
    asphaltRoughness,
    sidewalkMap,
    buildingFacadeMap,
    buildingWarmOchreMap,
    containerMap,
    awningMap,
    muralUnityMap,
    billboardTrustMap,
    graffitiMemoryMap,
    bannerRoarMap,
    signMarketMap,
    contactShadowMap,
    dispose: () => {
      asphaltMap.dispose();
      asphaltRoughness.dispose();
      sidewalkMap.dispose();
      buildingFacadeMap.dispose();
      buildingWarmOchreMap.dispose();
      containerMap.dispose();
      awningMap.dispose();
      muralUnityMap.dispose();
      billboardTrustMap.dispose();
      graffitiMemoryMap.dispose();
      bannerRoarMap.dispose();
      signMarketMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
