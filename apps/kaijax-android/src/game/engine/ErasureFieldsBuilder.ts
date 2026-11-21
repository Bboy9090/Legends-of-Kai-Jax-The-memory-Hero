import * as THREE from 'three';
import { EnvironmentMode } from '../types';
import { WorldTextureSet } from './ProceduralTextures';
import {
  AshblockWorld,
  BoxCollider,
  CivilianProp,
  CrateProp,
  EnvironmentalHazardProp,
  WalkableZoneSummary,
  WebAnchor,
} from './WorldBuilder';

/**
 * OPERATION KAI-JAX — WAVE 7: ERASURE FIELDS (ASH PLAINS & COVENANT CATHEDRAL)
 * Synthesized from fbb50f2d.png per src/game/data/districtSpecifications.ts
 * (composite_sheets_inferred provisional authority).
 */
export function buildErasureFieldsDistrict(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ErasureFields_Ash_District';
  scene.add(rootGroup);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(res: T): T => {
    disposables.push(res);
    return res;
  };

  const colliders: BoxCollider[] = [];
  const walkableZones: WalkableZoneSummary[] = [];
  const webAnchors: WebAnchor[] = [];
  const environmentalHazards: EnvironmentalHazardProp[] = [];
  const civilians: CivilianProp[] = [];
  const crates: CrateProp[] = [];

  // 1. Static-Scarred Violet-Black Sky & Ash-Crusted Plain
  const skyMat = track(new THREE.MeshBasicMaterial({ color: 0x11071a, side: THREE.BackSide, depthWrite: false }));
  rootGroup.add(new THREE.Mesh(track(new THREE.SphereGeometry(220, 20, 12)), skyMat));

  const ashMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x1f162b,
      roughness: 0.9,
      metalness: 0.1,
      envMapIntensity: 0.12,
    })
  );
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), ashMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -40);
  floor.receiveShadow = true;
  rootGroup.add(floor);

  colliders.push(
    { minX: -26, maxX: -22, minY: 0, maxY: 18, minZ: -94, maxZ: 18 },
    { minX: 22, maxX: 26, minY: 0, maxY: 18, minZ: -94, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 18, minZ: 14, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 18, minZ: -94, maxZ: -90 }
  );

  const obsidianMat = track(new THREE.MeshStandardMaterial({ color: 0x140d21, roughness: 0.7, metalness: 0.35 }));
  const erasureVioletMat = track(new THREE.MeshBasicMaterial({ color: 0xc084fc }));
  const crimsonStaticMat = track(new THREE.MeshBasicMaterial({ color: 0xf43f5e }));

  // 2. Fractured Memory Monoliths & Cathedral Nave Ribs
  const structures: Array<{ id: string; label: string; x: number; y: number; z: number; w: number; h: number; d: number }> = [
    { id: 'ef-slab-w', label: 'Shattered Memory Slab W', x: -12, y: 2.2, z: -14, w: 6, h: 4.4, d: 9 },
    { id: 'ef-slab-e', label: 'Shattered Memory Slab E', x: 12, y: 2.2, z: -18, w: 6, h: 4.4, d: 9 },
    { id: 'ef-bridge', label: 'Erasure Fracture Span', x: 0, y: 6.4, z: -30, w: 26, h: 1.1, d: 4.5 },
    { id: 'ef-rib-w', label: 'Cathedral Rib West', x: -13.5, y: 4.0, z: -44, w: 5, h: 8.0, d: 10 },
    { id: 'ef-rib-e', label: 'Cathedral Rib East', x: 13.5, y: 4.0, z: -44, w: 5, h: 8.0, d: 10 },
    { id: 'ef-choir-w', label: 'Choir Plinth West', x: -14.5, y: 3.2, z: -66, w: 5, h: 6.4, d: 18 },
    { id: 'ef-choir-e', label: 'Choir Plinth East', x: 14.5, y: 3.2, z: -66, w: 5, h: 6.4, d: 18 },
  ];

  for (const st of structures) {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(st.w, st.h, st.d)), obsidianMat);
    mesh.position.set(st.x, st.y, st.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(st.w + 0.18, 0.18, st.d + 0.18)), erasureVioletMat);
    trim.position.set(st.x, st.y + st.h / 2 - 0.12, st.z);
    rootGroup.add(trim);

    const topY = st.y + st.h / 2;
    colliders.push({
      minX: st.x - st.w / 2,
      maxX: st.x + st.w / 2,
      minY: st.y - st.h / 2,
      maxY: topY,
      minZ: st.z - st.d / 2,
      maxZ: st.z + st.d / 2,
      walkableTop: true,
      wallRunnable: true,
      zoneTag: st.id,
    });
    walkableZones.push({ id: st.id, label: st.label, elevationY: topY, center: [st.x, topY, st.z] });
  }

  // Floating Resonance Shards (distinctive Erasure Fields atmosphere)
  const floatingShards: THREE.Mesh[] = [];
  const shardGeo = track(new THREE.OctahedronGeometry(0.75, 0));
  for (const [fx, fy, fz] of [
    [-9, 5.5, -24],
    [9, 6.2, -26],
    [-10, 7.5, -56],
    [10, 7.5, -56],
  ] as [number, number, number][]) {
    const shard = new THREE.Mesh(shardGeo, crimsonStaticMat);
    shard.position.set(fx, fy, fz);
    rootGroup.add(shard);
    floatingShards.push(shard);
  }

  const alleyGateBarrier = new THREE.Mesh(
    track(new THREE.BoxGeometry(14, 8, 0.8)),
    track(new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.35 }))
  );
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'erasure_gate' });

  // 3. Web Anchors (6 anchors)
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorList: Array<[string, number, number, number, number, number, number]> = [
    ['ef-wa-1', -6, 9.8, -14, -12, 4.6, -14],
    ['ef-wa-2', 6, 9.8, -18, 12, 4.6, -18],
    ['ef-wa-3', 0, 11.0, -30, 0, 7.2, -30],
    ['ef-wa-4', -7, 11.4, -44, -13.5, 8.2, -44],
    ['ef-wa-5', 7, 11.4, -44, 13.5, 8.2, -44],
    ['ef-wa-6', 0, 11.8, -64, 0, 6.6, -66],
  ];
  for (const [id, x, y, z, px, py, pz] of anchorList) {
    const ringMesh = new THREE.Mesh(anchorGeo, erasureVioletMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'erasure_monolith',
      attachmentType: 'skybridge_truss_girder',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 4. Amnesia Resonance Pulse Hazards (4 nodes)
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-8, -16],
    [8, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const pillar = new THREE.Mesh(track(new THREE.CylinderGeometry(0.45, 0.65, 2.8, 8)), obsidianMat);
    pillar.position.y = 1.4;
    const cap = new THREE.Mesh(track(new THREE.SphereGeometry(0.38, 10, 8)), crimsonStaticMat);
    cap.position.y = 2.95;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(pillar, cap, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `ef-pulse-${idx + 1}`,
      name: 'Amnesia Resonance Pulse',
      position: new THREE.Vector3(hx, 0, hz),
      group: grp,
      beaconRing,
      pullRadius: 11.5,
      aoeRadius: 6.2,
      damage: 105,
      cooldown: 0,
      maxCooldown: 8,
      triggeredCount: 0,
    });
  }

  // 5. Memory Site Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(0, 0, -34);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.95, 0)), erasureVioletMat);
  crystalMesh.position.y = 1.7;
  memoryCrystal.add(crystalMesh);
  rootGroup.add(memoryCrystal);

  const world: AshblockWorld & { dispose: () => void } = {
    environmentMode: initialMode,
    qualityTier: 'balanced',
    modularKitLoadedCount: 8,
    modularKitExpectedCount: 8,
    instancedPropCount: structures.length + anchorList.length + floatingShards.length,
    deduplicatedMaterialCount: 5,
    colliders,
    walkableZones,
    webAnchors,
    environmentalHazards,
    civilians,
    crates,
    memorySitePos,
    memoryCrystal,
    memorySiteReconstructed: false,
    alleyGatePos: new THREE.Vector3(0, 0, -48),
    alleyGateBarrier,
    alleyGateColliderIndex,
    alleyGateOpen: false,
    sanctuaryPos: new THREE.Vector3(0, 0, 6),
    dojoDeckPos: new THREE.Vector3(0, 7.1, -30),
    bossArenaCenter: new THREE.Vector3(0, 0, -68),
    borynMentorPos: new THREE.Vector3(-4.5, 0, 5),
    boraxMentorPos: new THREE.Vector3(4.5, 0, 5),
    setEnvironmentMode: (mode: EnvironmentMode) => {
      world.environmentMode = mode;
    },
    setQualityTier: (tier: 'low' | 'balanced' | 'high') => {
      world.qualityTier = tier;
    },
    updateVisuals: (elapsed: number) => {
      crystalMesh.rotation.y = elapsed * 1.5;
      crystalMesh.position.y = 1.7 + Math.sin(elapsed * 2.5) * 0.22;
      floatingShards.forEach((s, i) => {
        s.rotation.y = elapsed * (1.2 + i * 0.2);
        s.position.y += Math.sin(elapsed * 2 + i) * 0.004;
      });
    },
    dispose: () => {
      scene.remove(rootGroup);
      for (const d of disposables) d.dispose();
    },
  };

  return world;
}
