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
 * OPERATION KAI-JAX — WAVE 6: UNDERCROWN (FRACTURE PIT & PRE-CITY CATACOMBS)
 * Built from direct visual library sheet 0e91caa6.png per
 * src/game/data/districtSpecifications.ts.
 */
export function buildUndercrownDistrict(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Undercrown_FracturePit_District';
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

  // 1. Subterranean Abyssal Cavern & Monolithic Basalt Floor
  const skyMat = track(
    new THREE.MeshBasicMaterial({ color: 0x050b16, side: THREE.BackSide, depthWrite: false })
  );
  rootGroup.add(new THREE.Mesh(track(new THREE.SphereGeometry(220, 20, 12)), skyMat));

  const basaltMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x16202e,
      roughness: 0.78,
      metalness: 0.25,
      envMapIntensity: 0.14,
    })
  );
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), basaltMat);
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

  // Shared Undercrown Materials
  const stoneMat = track(new THREE.MeshStandardMaterial({ color: 0x263244, roughness: 0.85, metalness: 0.15 }));
  const tramMat = track(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 }));
  const azureMat = track(new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  const goldMat = track(new THREE.MeshBasicMaterial({ color: 0xf59e0b }));

  // 2. Derailed Transit Cars, Fractured Stone Viaducts & Monolithic Pillars
  const structures: Array<{ id: string; label: string; x: number; y: number; z: number; w: number; h: number; d: number; tram?: boolean }> = [
    { id: 'uc-tram-w', label: 'Derailed Transit Car West', x: -11.5, y: 1.8, z: -14, w: 4.2, h: 3.6, d: 12, tram: true },
    { id: 'uc-tram-e', label: 'Derailed Transit Car East', x: 11.5, y: 1.8, z: -18, w: 4.2, h: 3.6, d: 12, tram: true },
    { id: 'uc-viaduct', label: 'Fractured Chasm Viaduct', x: 0, y: 7.0, z: -30, w: 28, h: 1.4, d: 5.5 },
    { id: 'uc-pillar-w', label: 'Beast-God Vault Pillar West', x: -13.5, y: 4.2, z: -40, w: 5.5, h: 8.4, d: 8 },
    { id: 'uc-pillar-e', label: 'Beast-God Vault Pillar East', x: 13.5, y: 4.2, z: -40, w: 5.5, h: 8.4, d: 8 },
    { id: 'uc-sanctum-w', label: 'Sentinel Ledge West', x: -14.5, y: 3.4, z: -66, w: 5, h: 6.8, d: 18 },
    { id: 'uc-sanctum-e', label: 'Sentinel Ledge East', x: 14.5, y: 3.4, z: -66, w: 5, h: 6.8, d: 18 },
  ];

  for (const st of structures) {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(st.w, st.h, st.d)), st.tram ? tramMat : stoneMat);
    mesh.position.set(st.x, st.y, st.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(st.w + 0.18, 0.2, st.d + 0.18)), st.tram ? azureMat : goldMat);
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

  // Ancient Pre-Covenant Stone Arch at z = -48
  const alleyGateBarrier = new THREE.Mesh(
    track(new THREE.BoxGeometry(14, 8, 0.8)),
    track(new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 }))
  );
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'undercrown_gate' });

  // 3. Chasm Web Anchors (6 anchors)
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorList: Array<[string, number, number, number, number, number, number]> = [
    ['uc-wa-1', -6, 10.2, -14, -11.5, 3.8, -14],
    ['uc-wa-2', 6, 10.2, -18, 11.5, 3.8, -18],
    ['uc-wa-3', 0, 11.4, -30, 0, 7.8, -30],
    ['uc-wa-4', -7, 11.6, -40, -13.5, 8.6, -40],
    ['uc-wa-5', 7, 11.6, -40, 13.5, 8.6, -40],
    ['uc-wa-6', 0, 11.8, -64, 0, 7.0, -66],
  ];
  for (const [id, x, y, z, px, py, pz] of anchorList) {
    const ringMesh = new THREE.Mesh(anchorGeo, azureMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'undercrown_viaduct',
      attachmentType: 'skybridge_truss_girder',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 4. Subterranean Surge Conduit Hazards (4 interactive takedown nodes)
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-8, -16],
    [8, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const pillar = new THREE.Mesh(track(new THREE.CylinderGeometry(0.55, 0.7, 2.8, 8)), stoneMat);
    pillar.position.y = 1.4;
    const cap = new THREE.Mesh(track(new THREE.SphereGeometry(0.38, 10, 8)), azureMat);
    cap.position.y = 2.95;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(pillar, cap, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `uc-surge-${idx + 1}`,
      name: 'Subterranean Surge Conduit',
      position: new THREE.Vector3(hx, 0, hz),
      group: grp,
      beaconRing,
      pullRadius: 11.5,
      aoeRadius: 6.2,
      damage: 95,
      cooldown: 0,
      maxCooldown: 8,
      triggeredCount: 0,
    });
  }

  // 5. Memory Site Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(0, 0, -34);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.95, 0)), goldMat);
  crystalMesh.position.y = 1.7;
  memoryCrystal.add(crystalMesh);
  rootGroup.add(memoryCrystal);

  const world: AshblockWorld & { dispose: () => void } = {
    environmentMode: initialMode,
    qualityTier: 'balanced',
    modularKitLoadedCount: 8,
    modularKitExpectedCount: 8,
    instancedPropCount: structures.length + anchorList.length + 5,
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
    dojoDeckPos: new THREE.Vector3(0, 7.7, -30),
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
      crystalMesh.rotation.y = elapsed * 1.4;
      crystalMesh.position.y = 1.7 + Math.sin(elapsed * 2.5) * 0.22;
    },
    dispose: () => {
      scene.remove(rootGroup);
      for (const d of disposables) d.dispose();
    },
  };

  return world;
}
