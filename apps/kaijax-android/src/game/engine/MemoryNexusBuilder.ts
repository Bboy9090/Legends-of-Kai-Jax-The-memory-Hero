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
 * OPERATION KAI-JAX — WAVE 7: MEMORY NEXUS (LIBRARY OF THREADS & FINAL CONVERGENCE)
 * Built from direct visual library sheet 1f74b763.png per
 * src/game/data/districtSpecifications.ts.
 */
export function buildMemoryNexusDistrict(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'MemoryNexus_Library_District';
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

  // 1. Astral Library Sky & Obsidian-Gold Archive Floor
  const skyMat = track(new THREE.MeshBasicMaterial({ color: 0x090614, side: THREE.BackSide, depthWrite: false }));
  rootGroup.add(new THREE.Mesh(track(new THREE.SphereGeometry(220, 20, 12)), skyMat));

  const nexusFloorMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x161224,
      roughness: 0.48,
      metalness: 0.4,
      envMapIntensity: 0.16,
    })
  );
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), nexusFloorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -40);
  floor.receiveShadow = true;
  rootGroup.add(floor);

  colliders.push(
    { minX: -26, maxX: -22, minY: 0, maxY: 20, minZ: -94, maxZ: 18 },
    { minX: 22, maxX: 26, minY: 0, maxY: 20, minZ: -94, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 20, minZ: 14, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 20, minZ: -94, maxZ: -90 }
  );

  const archiveObsidianMat = track(new THREE.MeshStandardMaterial({ color: 0x1b1530, roughness: 0.55, metalness: 0.45 }));
  const threadGoldMat = track(new THREE.MeshBasicMaterial({ color: 0xeab308 }));
  const memoryVioletMat = track(new THREE.MeshBasicMaterial({ color: 0xa855f7 }));

  // 2. Archive Thread Pillars, Convergence Span & Hollow Architect Throne Arena
  const structures: Array<{ id: string; label: string; x: number; y: number; z: number; w: number; h: number; d: number }> = [
    { id: 'mn-archive-w', label: 'West Archive Stack', x: -12.5, y: 3.0, z: -14, w: 5.5, h: 6.0, d: 10 },
    { id: 'mn-archive-e', label: 'East Archive Stack', x: 12.5, y: 3.0, z: -14, w: 5.5, h: 6.0, d: 10 },
    { id: 'mn-span', label: 'Library of Threads Bridge', x: 0, y: 7.0, z: -28, w: 28, h: 1.2, d: 5 },
    { id: 'mn-pillar-w', label: 'Four-Bloodline Pillar W', x: -13.5, y: 4.5, z: -42, w: 5, h: 9.0, d: 10 },
    { id: 'mn-pillar-e', label: 'Four-Bloodline Pillar E', x: 13.5, y: 4.5, z: -42, w: 5, h: 9.0, d: 10 },
    { id: 'mn-sanctum-w', label: 'Nexus Gallery West', x: -15, y: 3.8, z: -66, w: 4.5, h: 7.6, d: 18 },
    { id: 'mn-sanctum-e', label: 'Nexus Gallery East', x: 15, y: 3.8, z: -66, w: 4.5, h: 7.6, d: 18 },
  ];

  for (const st of structures) {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(st.w, st.h, st.d)), archiveObsidianMat);
    mesh.position.set(st.x, st.y, st.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(st.w + 0.2, 0.22, st.d + 0.2)), threadGoldMat);
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

  // Convergence Ring at Hollow Architect Arena (z = -68)
  const nexusRing = new THREE.Mesh(track(new THREE.RingGeometry(11.5, 12.6, 24)), threadGoldMat);
  nexusRing.rotation.x = -Math.PI / 2;
  nexusRing.position.set(0, 0.05, -68);
  rootGroup.add(nexusRing);

  const alleyGateBarrier = new THREE.Mesh(
    track(new THREE.BoxGeometry(14, 8, 0.8)),
    track(new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.35 }))
  );
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'nexus_gate' });

  // 3. Thread Web Anchors (6 anchors)
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorList: Array<[string, number, number, number, number, number, number]> = [
    ['mn-wa-1', -6.5, 10.2, -14, -12.5, 6.2, -14],
    ['mn-wa-2', 6.5, 10.2, -14, 12.5, 6.2, -14],
    ['mn-wa-3', 0, 11.4, -28, 0, 7.8, -28],
    ['mn-wa-4', -7, 11.8, -42, -13.5, 9.2, -42],
    ['mn-wa-5', 7, 11.8, -42, 13.5, 9.2, -42],
    ['mn-wa-6', 0, 12.2, -64, 0, 7.8, -66],
  ];
  for (const [id, x, y, z, px, py, pz] of anchorList) {
    const ringMesh = new THREE.Mesh(anchorGeo, threadGoldMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'memory_nexus_arch',
      attachmentType: 'skybridge_truss_girder',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 4. Temporal Thread Fracture Hazards (4 nodes)
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-8, -18],
    [8, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const pillar = new THREE.Mesh(track(new THREE.CylinderGeometry(0.45, 0.65, 3.2, 8)), archiveObsidianMat);
    pillar.position.y = 1.6;
    const cap = new THREE.Mesh(track(new THREE.SphereGeometry(0.4, 10, 8)), memoryVioletMat);
    cap.position.y = 3.35;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(pillar, cap, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `mn-fracture-${idx + 1}`,
      name: 'Temporal Thread Fracture',
      position: new THREE.Vector3(hx, 0, hz),
      group: grp,
      beaconRing,
      pullRadius: 11.5,
      aoeRadius: 6.2,
      damage: 115,
      cooldown: 0,
      maxCooldown: 8,
      triggeredCount: 0,
    });
  }

  // 5. Central Memory Convergence Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(0, 0, -34);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(1.1, 0)), threadGoldMat);
  crystalMesh.position.y = 1.9;
  memoryCrystal.add(crystalMesh);
  rootGroup.add(memoryCrystal);

  const world: AshblockWorld & { dispose: () => void } = {
    environmentMode: initialMode,
    qualityTier: 'balanced',
    modularKitLoadedCount: 8,
    modularKitExpectedCount: 8,
    instancedPropCount: structures.length + anchorList.length + 6,
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
    dojoDeckPos: new THREE.Vector3(0, 7.8, -28),
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
      crystalMesh.rotation.y = elapsed * 1.6;
      crystalMesh.position.y = 1.9 + Math.sin(elapsed * 2.5) * 0.24;
    },
    dispose: () => {
      scene.remove(rootGroup);
      for (const d of disposables) d.dispose();
    },
  };

  return world;
}
