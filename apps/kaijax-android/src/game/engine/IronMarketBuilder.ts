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
 * OPERATION KAI-JAX — WAVE 6: IRON MARKET (FORGE KEEPS & SYNDICATE BLOOD-PIT)
 * Built from direct visual library sheets e05fb785.png & e5b27b30.png per
 * src/game/data/districtSpecifications.ts.
 */
export function buildIronMarketDistrict(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld & { dispose: () => void } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'IronMarket_Forge_District';
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

  // 1. Forge-Smoke Sky & Hammered Cast-Iron Bazaar Floor
  const skyMat = track(
    new THREE.MeshBasicMaterial({ color: 0x1a0d0a, side: THREE.BackSide, depthWrite: false })
  );
  rootGroup.add(new THREE.Mesh(track(new THREE.SphereGeometry(220, 20, 12)), skyMat));

  const ironFloorMat = track(
    new THREE.MeshStandardMaterial({
      ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
      color: 0x2c221e,
      roughness: 0.75,
      metalness: 0.45,
      envMapIntensity: 0.16,
    })
  );
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(64, 140)), ironFloorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -40);
  floor.receiveShadow = true;
  rootGroup.add(floor);

  colliders.push(
    { minX: -26, maxX: -22, minY: 0, maxY: 16, minZ: -94, maxZ: 18 },
    { minX: 22, maxX: 26, minY: 0, maxY: 16, minZ: -94, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 16, minZ: 14, maxZ: 18 },
    { minX: -26, maxX: 26, minY: 0, maxY: 16, minZ: -94, maxZ: -90 }
  );

  // Shared Forge Materials
  const forgeIronMat = track(new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness: 0.65, metalness: 0.65 }));
  const timberMat = track(new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.85, metalness: 0.1 }));
  const moltenMat = track(new THREE.MeshBasicMaterial({ color: 0xf97316 }));
  const crimsonMat = track(new THREE.MeshBasicMaterial({ color: 0xe11d48 }));

  // Molten Slag Channels flanking the central bazaar
  for (const sx of [-7.8, 7.8]) {
    const channel = new THREE.Mesh(track(new THREE.BoxGeometry(1.1, 0.06, 98)), moltenMat);
    channel.position.set(sx, 0.03, -36);
    rootGroup.add(channel);
  }

  // 2. Forge Bazaar Stalls, Crucible Catwalks & Octagonal Pit Gallery
  const structures: Array<{ id: string; label: string; x: number; y: number; z: number; w: number; h: number; d: number; wood?: boolean }> = [
    { id: 'im-stall-w', label: 'West Forge Bazaar', x: -13, y: 1.9, z: -12, w: 6, h: 3.8, d: 10, wood: true },
    { id: 'im-stall-e', label: 'East Forge Bazaar', x: 13, y: 1.9, z: -14, w: 6, h: 3.8, d: 10, wood: true },
    { id: 'im-catwalk-1', label: 'Crucible Ladle Span', x: 0, y: 6.8, z: -28, w: 28, h: 1.1, d: 4.8 },
    { id: 'im-foundry-w', label: 'West Foundry Balcony', x: -13.5, y: 3.6, z: -38, w: 6, h: 7.2, d: 12 },
    { id: 'im-foundry-e', label: 'East Foundry Balcony', x: 13.5, y: 3.6, z: -38, w: 6, h: 7.2, d: 12 },
    { id: 'im-pit-w', label: 'Blood-Pit Gallery West', x: -14.5, y: 3.0, z: -66, w: 5, h: 6.0, d: 18 },
    { id: 'im-pit-e', label: 'Blood-Pit Gallery East', x: 14.5, y: 3.0, z: -66, w: 5, h: 6.0, d: 18 },
  ];

  for (const st of structures) {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(st.w, st.h, st.d)), st.wood ? timberMat : forgeIronMat);
    mesh.position.set(st.x, st.y, st.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);

    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(st.w + 0.2, 0.2, st.d + 0.2)), moltenMat);
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

  // Octagonal Fang Pit Ring around Blood Broker arena (z = -68)
  const pitRing = new THREE.Mesh(track(new THREE.RingGeometry(11.2, 12.2, 8)), crimsonMat);
  pitRing.rotation.x = -Math.PI / 2;
  pitRing.position.set(0, 0.05, -68);
  rootGroup.add(pitRing);

  // Market Gate Barrier (z = -48)
  const alleyGateBarrier = new THREE.Mesh(
    track(new THREE.BoxGeometry(14, 8, 0.8)),
    track(new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.35 }))
  );
  alleyGateBarrier.position.set(0, 4, -48);
  rootGroup.add(alleyGateBarrier);
  const alleyGateColliderIndex = colliders.length;
  colliders.push({ minX: -7, maxX: 7, minY: 0, maxY: 8, minZ: -48.6, maxZ: -47.4, zoneTag: 'ironmarket_gate' });

  // 3. Chain-Cage & Crucible Crane Web Anchors (6 anchors)
  const anchorGeo = track(new THREE.TorusGeometry(0.45, 0.08, 8, 18));
  const anchorList: Array<[string, number, number, number, number, number, number]> = [
    ['im-wa-1', -6.5, 10.0, -12, -13, 4.0, -12],
    ['im-wa-2', 6.5, 10.0, -14, 13, 4.0, -14],
    ['im-wa-3', 0, 11.2, -28, 0, 7.5, -28],
    ['im-wa-4', -7, 11.4, -38, -13.5, 7.4, -38],
    ['im-wa-5', 7, 11.4, -38, 13.5, 7.4, -38],
    ['im-wa-6', 0, 11.8, -64, 0, 6.2, -66],
  ];
  for (const [id, x, y, z, px, py, pz] of anchorList) {
    const ringMesh = new THREE.Mesh(anchorGeo, moltenMat);
    ringMesh.position.set(x, y, z);
    rootGroup.add(ringMesh);
    webAnchors.push({
      id,
      position: new THREE.Vector3(x, y, z),
      supportPoint: new THREE.Vector3(x, y + 0.15, z),
      attachedStructureId: 'ironmarket_crucible_crane',
      attachmentType: 'tenement_crane_davit',
      ringMesh,
      perchLandingPos: new THREE.Vector3(px, py, pz),
    });
  }

  // 4. Molten Forge Vent Hazards (4 interactive takedown nodes)
  const beaconGeo = track(new THREE.RingGeometry(0.8, 1.1, 20));
  for (const [idx, [hx, hz]] of [
    [-8, -16],
    [8, -22],
    [-8.5, -62],
    [8.5, -62],
  ].entries()) {
    const grp = new THREE.Group();
    grp.position.set(hx, 0, hz);
    const vent = new THREE.Mesh(track(new THREE.CylinderGeometry(0.65, 0.85, 2.2, 8)), forgeIronMat);
    vent.position.y = 1.1;
    const emberCap = new THREE.Mesh(track(new THREE.SphereGeometry(0.42, 10, 8)), moltenMat);
    emberCap.position.y = 2.35;
    const beaconRing = new THREE.Mesh(
      beaconGeo,
      track(new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.06;
    grp.add(vent, emberCap, beaconRing);
    rootGroup.add(grp);
    environmentalHazards.push({
      id: `im-vent-${idx + 1}`,
      name: 'Molten Forge Vent',
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

  // 5. Forge-Keep Captives (2 NPCs to rescue)
  for (const [idx, [cx, cz, label]] of ([
    [-11, -24, 'Forge Apprentice'],
    [11, -26, 'Bazaar Merchant'],
  ] as [number, number, string][]).entries()) {
    const cg = new THREE.Group();
    cg.position.set(cx, 0, cz);
    const body = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.32, 0.85, 4, 8)), timberMat);
    body.position.y = 0.78;
    cg.add(body);
    rootGroup.add(cg);
    civilians.push({ id: `im-civ-${idx + 1}`, name: label, position: new THREE.Vector3(cx, 0, cz), group: cg, rescued: false });
  }

  // 6. Memory Site Crystal
  const memoryCrystal = new THREE.Group();
  const memorySitePos = new THREE.Vector3(0, 0, -32);
  memoryCrystal.position.copy(memorySitePos);
  const crystalMesh = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.95, 0)), crimsonMat);
  crystalMesh.position.y = 1.7;
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
    dojoDeckPos: new THREE.Vector3(0, 7.4, -28),
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
