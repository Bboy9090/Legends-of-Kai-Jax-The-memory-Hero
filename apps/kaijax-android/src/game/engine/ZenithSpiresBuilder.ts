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
 * OPERATION KAI-JAX — WAVE 7: ZENITH SPIRES (SKYFALL SPINES & STORM RONIN SANCTUM)
 * Built from direct visual sheets a43aff68.png & 16464786.png per
 * src/game/data/districtSpecifications.ts.
 */
export function buildZenithSpiresDistrict(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ZenithSpires_Skyfall_District';
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

  // 1. High-Altitude Golden Cloud-Sea Sky & Marble/Gold Citadel Deck
  const skyMat = track(new THREE.MeshBasicMaterial({ color: 0x1a2238, side: THREE.BackSide, depthWrite: false }));
  rootGroup.add(new THREE.Mesh(track(new THREE.SphereGeometry(220, 20, 12)), skyMat));

  const deckMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x334155,
      roughness: 0.52,
      metalness: 0.35,
      envMapIntensity: 0.16,
    })
  );
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), deckMat);
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

  const gothicStoneMat = track(new THREE.MeshStandardMaterial({ color: 0x273043, roughness: 0.65, metalness: 0.25 }));
  const goldTrimMat = track(new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
  const stormCyanMat = track(new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));

  // 2. Gothic-Gold Needle Spires, Suspension Bridges & Storm Ronin Nave
  const structures: Array<{ id: string; label: string; x: number; y: number; z: number; w: number; h: number; d: number }> = [
    { id: 'zs-spire-w1', label: 'West Citadel Buttress', x: -13, y: 2.8, z: -14, w: 5.5, h: 5.6, d: 10 },
    { id: 'zs-spire-e1', label: 'East Citadel Buttress', x: 13, y: 2.8, z: -14, w: 5.5, h: 5.6, d: 10 },
    { id: 'zs-bridge', label: 'Skyfall Suspension Span', x: 0, y: 6.8, z: -28, w: 28, h: 1.2, d: 5 },
    { id: 'zs-nave-w', label: 'Storm Ronin Colonnade W', x: -13.5, y: 4.5, z: -42, w: 5, h: 9, d: 12 },
    { id: 'zs-nave-e', label: 'Storm Ronin Colonnade E', x: 13.5, y: 4.5, z: -42, w: 5, h: 9, d: 12 },
    { id: 'zs-tribunal-w', label: 'Apex Tribunal Balcony W', x: -15, y: 3.8, z: -66, w: 4.5, h: 7.6, d: 18 },
    { id: 'zs-tribunal-e', label: 'Apex Tribunal Balcony E', x: 15, y: 3.8, z: -66, w: 4.5, h: 7.6, d: 18 },
  ];

  for (const st of structures) {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(st.w, st.h, st.d)), gothicStoneMat);
    mesh.position.set(st.x, st.y, st.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(st.w + 0.2, 0.22, st.d + 0.2)), goldTrimMat);
    trim.position.set(st.x, st.y + st.h / 2 - 0.15, st.z);
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

  // Soaring Spire Needles (visual skyline)
  for (const [sx, sz] of [
    [-19, -20],
    [19, -20],
    [-19, -56],
    [19, -56],
  ] as [number, number][]) {
    const cone = new THREE.Mesh(track(new THREE.ConeGeometry(2.2, 18, 6)), gothicStoneMat);
    cone.position.set(sx, 16, sz);
    rootGroup.add(cone);
  }

  // Tribunal Gate Barrier (z = -48)
  const alleyGateBarrier = new THREE.Mesh(
    track(new THREE.BoxGeometry(14, 8, 0.8)),
    track(new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.35 }))
  );
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'zenith_gate' });

  // 3. Spire Web Anchors (6 anchors)
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorList: Array<[string, number, number, number, number, number, number]> = [
    ['zs-wa-1', -6.5, 10.2, -14, -13, 5.8, -14],
    ['zs-wa-2', 6.5, 10.2, -14, 13, 5.8, -14],
    ['zs-wa-3', 0, 11.4, -28, 0, 7.6, -28],
    ['zs-wa-4', -7, 11.8, -42, -13.5, 9.2, -42],
    ['zs-wa-5', 7, 11.8, -42, 13.5, 9.2, -42],
    ['zs-wa-6', 0, 12.2, -64, 0, 7.8, -66],
  ];
  for (const [id, x, y, z, px, py, pz] of anchorList) {
    const ringMesh = new THREE.Mesh(anchorGeo, goldTrimMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'zenith_spire_davit',
      attachmentType: 'skybridge_truss_girder',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 4. Lightning Conductor Pylon Hazards (4 interactive takedown nodes)
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-8, -18],
    [8, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.4, 0.55, 3.4, 8)), gothicStoneMat);
    pole.position.y = 1.7;
    const orb = new THREE.Mesh(track(new THREE.SphereGeometry(0.4, 10, 8)), stormCyanMat);
    orb.position.y = 3.55;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(pole, orb, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `zs-pylon-${idx + 1}`,
      name: 'Lightning Conductor Pylon',
      position: new THREE.Vector3(hx, 0, hz),
      group: grp,
      beaconRing,
      pullRadius: 11.5,
      aoeRadius: 6.2,
      damage: 100,
      cooldown: 0,
      maxCooldown: 8,
      triggeredCount: 0,
    });
  }

  // 5. Memory Site Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(0, 0, -34);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.95, 0)), goldTrimMat);
  crystalMesh.position.y = 1.7;
  memoryCrystal.add(crystalMesh);
  rootGroup.add(memoryCrystal);

  const world: AshblockWorld & { dispose: () => void } = {
    environmentMode: initialMode,
    qualityTier: 'balanced',
    modularKitLoadedCount: 8,
    modularKitExpectedCount: 8,
    instancedPropCount: structures.length + anchorList.length + 8,
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
    dojoDeckPos: new THREE.Vector3(0, 7.6, -28),
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
    },
    dispose: () => {
      scene.remove(rootGroup);
      for (const d of disposables) d.dispose();
    },
  };

  return world;
}
