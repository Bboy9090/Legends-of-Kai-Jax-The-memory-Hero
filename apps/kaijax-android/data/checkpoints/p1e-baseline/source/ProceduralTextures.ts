import * as THREE from 'three';

export interface WorldTextureSet {
  asphaltMap: THREE.CanvasTexture;
  asphaltRoughness: THREE.CanvasTexture;
  buildingFacadeMap: THREE.CanvasTexture;
  containerMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): WorldTextureSet {
  // 1. Wet Asphalt Albedo
  const aspCanvas = document.createElement('canvas');
  aspCanvas.width = 512;
  aspCanvas.height = 512;
  const actx = aspCanvas.getContext('2d')!;
  actx.fillStyle = '#12151e';
  actx.fillRect(0, 0, 512, 512);

  // Subtle aggregate grain + dark damp patches
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = 14 + Math.floor(Math.random() * 20);
    actx.fillStyle = `rgb(${v},${v + 2},${v + 7})`;
    actx.fillRect(x, y, 2, 2);
  }
  // Faint street wear streaks
  actx.fillStyle = 'rgba(212, 175, 55, 0.22)';
  actx.fillRect(250, 0, 12, 180);
  actx.fillRect(250, 260, 12, 180);

  const asphaltMap = new THREE.CanvasTexture(aspCanvas);
  asphaltMap.wrapS = THREE.RepeatWrapping;
  asphaltMap.wrapT = THREE.RepeatWrapping;
  asphaltMap.repeat.set(8, 22);
  asphaltMap.colorSpace = THREE.SRGBColorSpace;
  asphaltMap.anisotropy = maxAnisotropy;

  // 2. Wet Puddle Roughness Map (linear space)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#b8b8b8';
  rctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 16; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const pr = 35 + Math.random() * 75;
    const grad = rctx.createRadialGradient(px, py, 4, px, py, pr);
    grad.addColorStop(0, '#181818'); // slick wet puddle
    grad.addColorStop(0.7, '#323232');
    grad.addColorStop(1, 'rgba(184,184,184,0)');
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

  // 3. Urban Brutalist Building Facade with lit apartments
  const bldCanvas = document.createElement('canvas');
  bldCanvas.width = 512;
  bldCanvas.height = 512;
  const bctx = bldCanvas.getContext('2d')!;
  bctx.fillStyle = '#181c26';
  bctx.fillRect(0, 0, 512, 512);
  // Concrete panel seams
  bctx.strokeStyle = '#0e1118';
  bctx.lineWidth = 3;
  for (let y = 0; y < 512; y += 64) {
    bctx.beginPath();
    bctx.moveTo(0, y);
    bctx.lineTo(512, y);
    bctx.stroke();
  }
  // Windows
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const wx = 18 + col * 62;
      const wy = 14 + row * 64;
      const litRoll = Math.random();
      if (litRoll > 0.72) {
        bctx.fillStyle = litRoll > 0.9 ? '#f97316' : litRoll > 0.82 ? '#38bdf8' : '#d4af37';
        bctx.globalAlpha = 0.55 + Math.random() * 0.35;
      } else {
        bctx.fillStyle = '#0b0e15';
        bctx.globalAlpha = 0.95;
      }
      bctx.fillRect(wx, wy, 34, 38);
      bctx.globalAlpha = 1;
      bctx.strokeStyle = '#272e3f';
      bctx.lineWidth = 2;
      bctx.strokeRect(wx, wy, 34, 38);
    }
  }
  const buildingFacadeMap = new THREE.CanvasTexture(bldCanvas);
  buildingFacadeMap.wrapS = THREE.RepeatWrapping;
  buildingFacadeMap.wrapT = THREE.RepeatWrapping;
  buildingFacadeMap.colorSpace = THREE.SRGBColorSpace;
  buildingFacadeMap.anisotropy = maxAnisotropy;

  // 4. Corrugated Industrial Container
  const cntCanvas = document.createElement('canvas');
  cntCanvas.width = 256;
  cntCanvas.height = 256;
  const cctx = cntCanvas.getContext('2d')!;
  cctx.fillStyle = '#242b38';
  cctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 16) {
    cctx.fillStyle = x % 32 === 0 ? '#1b202b' : '#2f3848';
    cctx.fillRect(x, 0, 8, 256);
  }
  cctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
  cctx.fillRect(0, 118, 256, 14);
  const containerMap = new THREE.CanvasTexture(cntCanvas);
  containerMap.wrapS = THREE.RepeatWrapping;
  containerMap.wrapT = THREE.RepeatWrapping;
  containerMap.colorSpace = THREE.SRGBColorSpace;
  containerMap.anisotropy = maxAnisotropy;

  // 5. Radial Contact Shadow
  const shCanvas = document.createElement('canvas');
  shCanvas.width = 128;
  shCanvas.height = 128;
  const sctx = shCanvas.getContext('2d')!;
  const sgrad = sctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  sgrad.addColorStop(0, 'rgba(0,0,0,0.72)');
  sgrad.addColorStop(0.6, 'rgba(0,0,0,0.28)');
  sgrad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = sgrad;
  sctx.fillRect(0, 0, 128, 128);
  const contactShadowMap = new THREE.CanvasTexture(shCanvas);

  return {
    asphaltMap,
    asphaltRoughness,
    buildingFacadeMap,
    containerMap,
    contactShadowMap,
    dispose: () => {
      asphaltMap.dispose();
      asphaltRoughness.dispose();
      buildingFacadeMap.dispose();
      containerMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
