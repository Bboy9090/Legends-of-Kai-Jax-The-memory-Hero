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
 * OPERATION KAI-JAX — WAVE 4: SECTOR-7 (IRONVEIN FREIGHT YARDS & SERVICE TUNNEL 7B)
 * Implements District 2 of 8 per docs/production/P1P_SECTOR7_EXPANSION_SPEC.md:
 *   - Grade Switching Yard (y = 0m): Cargo container lanes, Freight Turntable Pit, Searchlights
 *   - Elevated Rail Viaduct & Crane Deck (y = +6.5m..+9.5m): Web Swing & Zip anchors
 *   - Service Tunnel 7B Substation (z = -68m): Architect Scout boss arena + Kar-Voth Arc Transformers
 */
export function buildSector7District(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Sector7_Ironvein_District';
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

  // 1. Industrial Dusk Sky & Steel Switching Yard Floor
  const skyGeo = track(new THREE.SphereGeometry(220, 20, 12));
  const skyMat = track(
    new THREE.MeshBasicMaterial({
      color: 0x0b1628,
      side: THREE.BackSide,
      depthWrite: false,
    })
  );
  rootGroup.add(new THREE.Mesh(skyGeo, skyMat));

  const yardMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x334155,
      roughness: 0.72,
      metalness: 0.35,
    })
  );
  const yardFloor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), yardMat);
  yardFloor.rotation.x = -Math.PI / 2;
  yardFloor.position.set(0, 0, -40);
  yardFloor.receiveShadow = true;
  rootGroup.add(yardFloor);

  // Boundary walls (X = +-24, Z = +14 / -92)
  colliders.push(
    { minX: -26, maxX: -22, minY: 0, maxY: 16, minZ: -94, maxZ: 18 },
    { minX: 22, maxX: 26, minY: 0, maxY: 16, minZ: -94, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 16, minZ: 14, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 16, minZ: -94, maxZ: -90 }
  );

  // 2. Cargo Container Stacks (Walkable Elevated Zones + Wall-Run Faces)
  const containerMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.containerMap ? { map: textures.containerMap } : {}),
      color: 0x1e3a5f,
      roughness: 0.58,
      metalness: 0.45,
    })
  );
  const rustSteelMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.65,
      metalness: 0.65,
    })
  );
  const cyanEmissiveMat = track(new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  const amberEmissiveMat = track(new THREE.MeshBasicMaterial({ color: 0xf59e0b }));

  const containerSpecs: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    z: number;
    w: number;
    h: number;
    d: number;
  }> = [
    { id: 's7-c1', label: 'West Freight Stack', x: -12, y: 1.8, z: -12, w: 6, h: 3.6, d: 10 },
    { id: 's7-c2', label: 'East Freight Stack', x: 12, y: 1.8, z: -16, w: 6, h: 3.6, d: 10 },
    { id: 's7-c3', label: 'Upper Crane Deck West', x: -12, y: 5.4, z: -26, w: 7, h: 3.6, d: 12 },
    { id: 's7-c4', label: 'Upper Crane Deck East', x: 12, y: 5.4, z: -30, w: 7, h: 3.6, d: 12 },
    { id: 's7-v1', label: 'Ironvein Rail Viaduct', x: 0, y: 7.4, z: -36, w: 28, h: 1.4, d: 5.2 },
    { id: 's7-sub-w', label: 'Substation Catwalk West', x: -14, y: 3.2, z: -66, w: 5.5, h: 6.4, d: 18 },
    { id: 's7-sub-e', label: 'Substation Catwalk East', x: 14, y: 3.2, z: -66, w: 5.5, h: 6.4, d: 18 },
  ];

  for (const cs of containerSpecs) {
    const geo = track(new THREE.BoxGeometry(cs.w, cs.h, cs.d));
    const mesh = new THREE.Mesh(geo, cs.id.includes('v1') ? rustSteelMat : containerMat);
    mesh.position.set(cs.x, cs.y, cs.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const topY = cs.y + cs.h / 2;
    colliders.push({
      minX: cs.x - cs.w / 2,
      maxX: cs.x + cs.w / 2,
      minY: cs.y - cs.h / 2,
      maxY: topY,
      minZ: cs.z - cs.d / 2,
      maxZ: cs.z + cs.d / 2,
      walkableTop: true,
      wallRunnable: true,
      zoneTag: cs.id,
    });
    walkableZones.push({
      id: cs.id,
      label: cs.label,
      elevationY: topY,
      center: [cs.x, topY, cs.z],
    });
  }

  // 2b. Wave 5 Visual Fidelity Upgrade: Switching Yard Rail Tracks, Gantry Crane Span & Tunnel Chevrons
  const railGeo = track(new THREE.BoxGeometry(0.18, 0.08, 128));
  for (const rx of [-2.2, 2.2, -5.8, 5.8]) {
    const rail = new THREE.Mesh(railGeo, rustSteelMat);
    rail.position.set(rx, 0.04, -40);
    rootGroup.add(rail);
  }
  const tieGeo = track(new THREE.BoxGeometry(13.2, 0.05, 0.32));
  const tieMat = track(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
  for (let tz = 10; tz >= -86; tz -= 3.2) {
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.025, tz);
    rootGroup.add(tie);
  }
  // Overhead Gantry Crane Truss & Hoist Columns
  const gantryBridge = new THREE.Mesh(track(new THREE.BoxGeometry(38, 1.3, 2.4)), rustSteelMat);
  gantryBridge.position.set(0, 12.4, -22);
  const gantryTrim = new THREE.Mesh(track(new THREE.BoxGeometry(38, 0.22, 2.5)), amberEmissiveMat);
  gantryTrim.position.set(0, 11.7, -22);
  const gantryLegL = new THREE.Mesh(track(new THREE.BoxGeometry(1.4, 12.8, 1.4)), rustSteelMat);
  gantryLegL.position.set(-18.5, 6.4, -22);
  const gantryLegR = new THREE.Mesh(track(new THREE.BoxGeometry(1.4, 12.8, 1.4)), rustSteelMat);
  gantryLegR.position.set(18.5, 6.4, -22);
  rootGroup.add(gantryBridge, gantryTrim, gantryLegL, gantryLegR);

  // 3. Service Tunnel 7B Portal & Barrier (z = -48)
  const portalArchMat = track(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 }));
  const portalL = new THREE.Mesh(track(new THREE.BoxGeometry(4, 10, 4)), portalArchMat);
  portalL.position.set(-9, 5, -48);
  const portalR = new THREE.Mesh(track(new THREE.BoxGeometry(4, 10, 4)), portalArchMat);
  portalR.position.set(9, 5, -48);
  const portalTop = new THREE.Mesh(track(new THREE.BoxGeometry(22, 3, 4)), portalArchMat);
  portalTop.position.set(0, 10.5, -48);
  rootGroup.add(portalL, portalR, portalTop);

  const gateBarrierMat = track(
    new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.38 })
  );
  const alleyGateBarrier = new THREE.Mesh(track(new THREE.BoxGeometry(14, 8, 0.8)), gateBarrierMat);
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'sector7_gate' });

  // 4. Web Anchors along Viaduct & Gantry Cranes (6 geometry-attached anchors)
  const anchorPositions: Array<[string, number, number, number, number, number, number]> = [
    ['s7-wa-1', -6, 11.2, -14, -12, 7.5, -12],
    ['s7-wa-2', 6, 11.2, -18, 12, 7.5, -16],
    ['s7-wa-3', 0, 11.8, -33, 0, 8.2, -36],
    ['s7-wa-4', -8, 11.2, -44, -12, 7.5, -30],
    ['s7-wa-5', 8, 11.2, -44, 12, 7.5, -30],
    ['s7-wa-6', 0, 12.0, -64, 0, 6.5, -66],
  ];
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorMat = track(new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  for (const [id, x, y, z, px, py, pz] of anchorPositions) {
    const ringMesh = new THREE.Mesh(anchorGeo, anchorMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'sector7_viaduct',
      attachmentType: 'skybridge_truss_girder',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 5. Kar-Voth Arc Transformer Pylons (4 Environmental Hazards)
  const pylonGeo = track(new THREE.CylinderGeometry(0.55, 0.75, 3.2, 8));
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-7.5, -18],
    [7.5, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const pylon = new THREE.Mesh(pylonGeo, rustSteelMat);
    pylon.position.y = 1.6;
    const cap = new THREE.Mesh(track(new THREE.SphereGeometry(0.38, 10, 8)), cyanEmissiveMat);
    cap.position.y = 3.35;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(pylon, cap, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `s7-arc-${idx + 1}`,
      name: 'Kar-Voth Arc Transformer',
      position: new THREE.Vector3(hx, 0, hz),
      group: grp,
      beaconRing,
      pullRadius: 11.5,
      aoeRadius: 6.2,
      damage: 85,
      cooldown: 0,
      maxCooldown: 8,
      triggeredCount: 0,
    });
  }

  // 6. Automated Searchlight Sweep Towers (visual atmosphere + Sector-7 identity)
  const searchlightBeams: THREE.Mesh[] = [];
  const beamGeo = track(new THREE.ConeGeometry(3.2, 16, 14, 1, true));
  const beamMat = track(
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
  );
  for (const [sx, sz] of [
    [-16, -20],
    [16, -34],
    [0, -78],
  ] as [number, number][]) {
    const tower = new THREE.Mesh(track(new THREE.BoxGeometry(1.2, 11, 1.2)), rustSteelMat);
    tower.position.set(sx, 5.5, sz);
    const head = new THREE.Mesh(track(new THREE.BoxGeometry(1.5, 0.9, 1.5)), amberEmissiveMat);
    head.position.set(sx, 11.2, sz);
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(sx, 4.5, sz);
    rootGroup.add(tower, head, beam);
    searchlightBeams.push(beam);
  }

  // 7. Disrupted Memory Site Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(10, 0, -28);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.9, 0)), cyanEmissiveMat);
  crystalMesh.position.y = 1.6;
  memoryCrystal.add(crystalMesh);
  rootGroup.add(memoryCrystal);

  const world: AshblockWorld & { dispose: () => void } = {
    environmentMode: initialMode,
    qualityTier: 'balanced',
    modularKitLoadedCount: 8,
    modularKitExpectedCount: 8,
    instancedPropCount: containerSpecs.length + anchorPositions.length + 7,
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
    dojoDeckPos: new THREE.Vector3(0, 8.1, -36),
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
      crystalMesh.position.y = 1.6 + Math.sin(elapsed * 2.5) * 0.22;
      searchlightBeams.forEach((b, i) => {
        b.rotation.z = Math.sin(elapsed * 0.9 + i * 2.1) * 0.38;
        b.rotation.x = Math.cos(elapsed * 0.7 + i) * 0.22;
      });
    },
    dispose: () => {
      scene.remove(rootGroup);
      for (const d of disposables) d.dispose();
    },
  };

  return world;
}
