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
 * OPERATION KAI-JAX — WAVE 5: NEON WARD (MIRAGE BOULEVARD & BROADCAST ATRIUM)
 * Synthesized from composite sheets f9d37a6e.png & e5b27b30.png per
 * docs/production/P1P_NEON_WARD_EXPANSION_SPEC.md (provisional until dedicated Neon Ward sheet).
 */
export function buildNeonWardDistrict(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'NeonWard_Mirage_District';
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

  // 1. Night Mirage Sky & Wet Basalt Plaza (envMapIntensity <= 0.16 per mobile shader budget)
  const skyGeo = track(new THREE.SphereGeometry(220, 20, 12));
  const skyMat = track(
    new THREE.MeshBasicMaterial({ color: 0x0f0720, side: THREE.BackSide, depthWrite: false })
  );
  rootGroup.add(new THREE.Mesh(skyGeo, skyMat));

  const basaltMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x1e1b2e,
      roughness: 0.62,
      metalness: 0.25,
      envMapIntensity: 0.14,
    })
  );
  const plazaFloor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), basaltMat);
  plazaFloor.rotation.x = -Math.PI / 2;
  plazaFloor.position.set(0, 0, -40);
  plazaFloor.receiveShadow = true;
  rootGroup.add(plazaFloor);

  // Arena bounds
  colliders.push(
    { minX: -26, maxX: -22, minY: 0, maxY: 18, minZ: -94, maxZ: 18 },
    { minX: 22, maxX: 26, minY: 0, maxY: 18, minZ: -94, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 18, minZ: 14, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 18, minZ: -94, maxZ: -90 }
  );

  // Shared Neon Emissive Materials (zero per-sign point lights)
  const towerMat = track(new THREE.MeshStandardMaterial({ color: 0x151324, roughness: 0.55, metalness: 0.5 }));
  const glassMat = track(
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.7, transparent: true, opacity: 0.55 })
  );
  const magentaMat = track(new THREE.MeshBasicMaterial({ color: 0xec4899 }));
  const cyanMat = track(new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  const violetMat = track(new THREE.MeshBasicMaterial({ color: 0xa855f7 }));

  // 2. Commercial Towers, Cantilevered Sign-Cages & Glass Skywalks
  const platformSpecs: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    z: number;
    w: number;
    h: number;
    d: number;
    neon: 'magenta' | 'cyan' | 'violet';
  }> = [
    { id: 'nw-cage-w1', label: 'West Mirage Sign-Cage', x: -12.5, y: 3.2, z: -12, w: 6, h: 6.4, d: 9, neon: 'magenta' },
    { id: 'nw-cage-e1', label: 'East Mirage Sign-Cage', x: 12.5, y: 3.2, z: -14, w: 6, h: 6.4, d: 9, neon: 'cyan' },
    { id: 'nw-skywalk-1', label: 'Glass Skywalk Span', x: 0, y: 6.8, z: -26, w: 26, h: 1.0, d: 4.8, neon: 'violet' },
    { id: 'nw-cage-w2', label: 'Broadcast Tower West', x: -13, y: 4.4, z: -38, w: 6.5, h: 8.8, d: 10, neon: 'cyan' },
    { id: 'nw-cage-e2', label: 'Broadcast Tower East', x: 13, y: 4.4, z: -38, w: 6.5, h: 8.8, d: 10, neon: 'magenta' },
    { id: 'nw-atrium-w', label: 'Atrium Balcony West', x: -14.5, y: 3.4, z: -66, w: 5, h: 6.8, d: 18, neon: 'violet' },
    { id: 'nw-atrium-e', label: 'Atrium Balcony East', x: 14.5, y: 3.4, z: -66, w: 5, h: 6.8, d: 18, neon: 'magenta' },
  ];

  for (const ps of platformSpecs) {
    const isGlass = ps.id.includes('skywalk');
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(ps.w, ps.h, ps.d)), isGlass ? glassMat : towerMat);
    mesh.position.set(ps.x, ps.y, ps.z);
    mesh.castShadow = !isGlass;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const nMat = ps.neon === 'magenta' ? magentaMat : ps.neon === 'cyan' ? cyanMat : violetMat;
    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(ps.w + 0.2, 0.25, ps.d + 0.2)), nMat);
    trim.position.set(ps.x, ps.y + ps.h / 2 - 0.2, ps.z);
    rootGroup.add(trim);

    const topY = ps.y + ps.h / 2;
    colliders.push({
      minX: ps.x - ps.w / 2,
      maxX: ps.x + ps.w / 2,
      minY: ps.y - ps.h / 2,
      maxY: topY,
      minZ: ps.z - ps.d / 2,
      maxZ: ps.z + ps.d / 2,
      walkableTop: true,
      wallRunnable: true,
      zoneTag: ps.id,
    });
    walkableZones.push({ id: ps.id, label: ps.label, elevationY: topY, center: [ps.x, topY, ps.z] });
  }

  // Central Mirage Concourse Fountain Landmark (z = -18)
  const fountainRing = new THREE.Mesh(track(new THREE.CylinderGeometry(2.6, 3.0, 0.7, 16)), towerMat);
  fountainRing.position.set(0, 0.35, -18);
  const fountainGlow = new THREE.Mesh(track(new THREE.CylinderGeometry(2.1, 2.1, 0.82, 16)), cyanMat);
  fountainGlow.position.set(0, 0.4, -18);
  rootGroup.add(fountainRing, fountainGlow);

  // Atrium Gate Barrier (z = -48, openable)
  const gateBarrierMat = track(new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.35 }));
  const alleyGateBarrier = new THREE.Mesh(track(new THREE.BoxGeometry(14, 8, 0.8)), gateBarrierMat);
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'neonward_gate' });

  // 3. Web Anchors (6 Cantilevered Sign-Cage & Broadcast Trusses)
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorList: Array<[string, number, number, number, number, number, number]> = [
    ['nw-wa-1', -6.5, 10.2, -12, -12.5, 6.6, -12],
    ['nw-wa-2', 6.5, 10.2, -14, 12.5, 6.6, -14],
    ['nw-wa-3', 0, 11.4, -26, 0, 7.5, -26],
    ['nw-wa-4', -7, 11.6, -38, -13, 9.0, -38],
    ['nw-wa-5', 7, 11.6, -38, 13, 9.0, -38],
    ['nw-wa-6', 0, 12.0, -64, 0, 7.0, -66],
  ];
  for (const [id, x, y, z, px, py, pz] of anchorList) {
    const ringMesh = new THREE.Mesh(anchorGeo, magentaMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'neonward_sign_cage',
      attachmentType: 'skybridge_truss_girder',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 4. Overloaded Neon Signboard Hazards (4 interactive takedown nodes)
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-8, -16],
    [8, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.35, 0.45, 3.2, 8)), towerMat);
    pole.position.y = 1.6;
    const signBox = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, 0.9, 0.35)), magentaMat);
    signBox.position.y = 3.4;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(pole, signBox, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `nw-sign-${idx + 1}`,
      name: 'Overloaded Neon Signboard',
      position: new THREE.Vector3(hx, 0, hz),
      group: grp,
      beaconRing,
      pullRadius: 11.5,
      aoeRadius: 6.2,
      damage: 90,
      cooldown: 0,
      maxCooldown: 8,
      triggeredCount: 0,
    });
  }

  // 5. Memory Site Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(0, 0, -32);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.95, 0)), magentaMat);
  crystalMesh.position.y = 1.7;
  memoryCrystal.add(crystalMesh);
  rootGroup.add(memoryCrystal);

  const world: AshblockWorld & { dispose: () => void } = {
    environmentMode: initialMode,
    qualityTier: 'balanced',
    modularKitLoadedCount: 8,
    modularKitExpectedCount: 8,
    instancedPropCount: platformSpecs.length + anchorList.length + 6,
    deduplicatedMaterialCount: 6,
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
    dojoDeckPos: new THREE.Vector3(0, 7.3, -26),
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
      crystalMesh.position.y = 1.7 + Math.sin(elapsed * 2.8) * 0.24;
    },
    dispose: () => {
      scene.remove(rootGroup);
      for (const d of disposables) d.dispose();
    },
  };

  return world;
}
