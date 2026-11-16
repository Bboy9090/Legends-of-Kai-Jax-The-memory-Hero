import * as THREE from 'three';
import { WorldTextureSet } from './ProceduralTextures';

export interface BoxCollider {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  walkableTop?: boolean;
  wallRunnable?: boolean;
}

export interface WebAnchor {
  id: string;
  position: THREE.Vector3;
  ringMesh: THREE.Mesh;
}

export interface CivilianProp {
  id: string;
  name: string;
  position: THREE.Vector3;
  group: THREE.Group;
  rescued: boolean;
}

export interface CrateProp {
  id: string;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  hp: number;
  broken: boolean;
  rewardMaterial: string;
}

export interface AshblockWorld {
  colliders: BoxCollider[];
  webAnchors: WebAnchor[];
  civilians: CivilianProp[];
  crates: CrateProp[];
  memorySitePos: THREE.Vector3;
  memoryCrystal: THREE.Group;
  memorySiteReconstructed: boolean;
  alleyGatePos: THREE.Vector3;
  alleyGateBarrier: THREE.Mesh;
  alleyGateColliderIndex: number;
  alleyGateOpen: boolean;
  bossArenaCenter: THREE.Vector3;
  borynMentorPos: THREE.Vector3;
  boraxMentorPos: THREE.Vector3;
  updateVisuals: (elapsed: number) => void;
}

export function buildAshblockHeights(
  scene: THREE.Scene,
  textures: WorldTextureSet
): AshblockWorld {
  const colliders: BoxCollider[] = [];
  const webAnchors: WebAnchor[] = [];
  const civilians: CivilianProp[] = [];
  const crates: CrateProp[] = [];

  // 1. Main Wet Asphalt Ground Plane (extends far beyond playable zone for natural horizon)
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltMap,
    roughnessMap: textures.asphaltRoughness,
    roughness: 0.72,
    metalness: 0.14,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 220), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -40);
  ground.receiveShadow = true;
  scene.add(ground);

  // Raised Sidewalks (offset Y >= 0.04 to avoid any Z-fighting)
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x1c212c,
    roughness: 0.85,
    metalness: 0.08,
  });
  const addWalkablePlatform = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    wallRunnable = false
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minY: y,
      maxY: y + h,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      walkableTop: true,
      wallRunnable,
    });
    return mesh;
  };

  // West & East Sidewalks along Ashblock Row (z = +20 to -48)
  addWalkablePlatform(-13.5, 0, -14, 7, 0.22, 68, curbMat);
  addWalkablePlatform(13.5, 0, -14, 7, 0.22, 68, curbMat);

  // 2. Tenement Buildings & Wall-Runnable Facades
  const bldMat = new THREE.MeshStandardMaterial({
    map: textures.buildingFacadeMap,
    roughness: 0.82,
    metalness: 0.12,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x181d27,
    roughness: 0.45,
    metalness: 0.72,
  });
  const containerMat = new THREE.MeshStandardMaterial({
    map: textures.containerMap,
    roughness: 0.52,
    metalness: 0.55,
  });

  // Playable Perimeter & Alley Buildings (wall-runnable!)
  const buildings: [number, number, number, number, number][] = [
    [-25, -4, 14, 24, 24],
    [-25, -36, 14, 28, 22],
    [25, -4, 14, 22, 24],
    [25, -36, 14, 26, 22],
    [-26, -70, 14, 30, 38],
    [26, -70, 14, 30, 38],
    [0, -96, 56, 32, 12], // North Courtyard Backdrop Wall
    [0, 26, 46, 16, 10],  // South Street Closure
  ];
  buildings.forEach(([bx, bz, bw, bh, bd]) => {
    addWalkablePlatform(bx, 0, bz, bw, bh, bd, bldMat, true);
  });

  // 3. Vertical Parkour Structures: Containers, Ramps & Elevated Fire-Escape Rooftop Walkway
  // West Alley Stacked Containers (leads to Civilian 1)
  addWalkablePlatform(-14, 0, -24, 4.2, 2.2, 7.5, containerMat, true);
  addWalkablePlatform(-14.5, 2.2, -26, 3.6, 1.9, 4.0, containerMat, true);

  // East Rooftop Fire-Escape Deck + Stepped Access (leads to Civilian 2)
  addWalkablePlatform(14.5, 0, -18, 4.5, 1.4, 4.0, containerMat);
  addWalkablePlatform(14.5, 0, -23.5, 4.5, 2.8, 5.5, containerMat, true);
  addWalkablePlatform(14.5, 2.8, -31, 6.0, 0.5, 9.5, darkMetalMat); // Elevated catwalk at y=3.3

  // Central Street Cover Containers (can be vaulted or swung over)
  addWalkablePlatform(-4.8, 0, -14, 2.8, 1.7, 5.4, containerMat);
  addWalkablePlatform(5.2, 0, -28, 3.0, 2.0, 5.2, containerMat);

  // 4. Alley Gate Structure at z = -48
  addWalkablePlatform(-11.5, 0, -48, 13, 8.5, 3.2, darkMetalMat, true);
  addWalkablePlatform(11.5, 0, -48, 13, 8.5, 3.2, darkMetalMat, true);
  // Overhead gate archway bridge
  const arch = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 3.2), darkMetalMat);
  arch.position.set(0, 7.4, -48);
  arch.castShadow = true;
  scene.add(arch);

  const gateBarrierMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.6,
    transparent: true,
    opacity: 0.65,
    roughness: 0.2,
  });
  const alleyGateBarrier = new THREE.Mesh(new THREE.BoxGeometry(10, 6.2, 0.45), gateBarrierMat);
  alleyGateBarrier.position.set(0, 3.1, -48);
  scene.add(alleyGateBarrier);

  const alleyGateColliderIndex = colliders.length;
  colliders.push({
    minX: -5,
    maxX: 5,
    minY: 0,
    maxY: 6.2,
    minZ: -48.4,
    maxZ: -47.6,
  });

  // 5. Overhead Web Swing Anchors (Crane Booms & Street Lamps)
  const anchorPositions: [number, number, number][] = [
    [0, 9.2, -8],
    [-4, 9.6, -21],
    [6, 9.4, -33],
    [0, 9.8, -44],
    [0, 10.2, -64],
  ];
  const anchorRingGeo = new THREE.TorusGeometry(0.62, 0.09, 8, 20);
  const anchorMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xf97316,
    emissiveIntensity: 1.4,
    roughness: 0.25,
  });
  anchorPositions.forEach(([ax, ay, az], idx) => {
    // Support beam arm
    const beam = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 0.3), darkMetalMat);
    beam.position.set(ax, ay + 0.75, az);
    scene.add(beam);

    const ringMesh = new THREE.Mesh(anchorRingGeo, anchorMat.clone());
    ringMesh.position.set(ax, ay, az);
    scene.add(ringMesh);

    webAnchors.push({
      id: `anchor-${idx}`,
      position: new THREE.Vector3(ax, ay, az),
      ringMesh,
    });
  });

  // 6. Streetlamps with Warm/Cool Atmosphere
  const lampPostGeo = new THREE.CylinderGeometry(0.08, 0.11, 5.2, 6);
  const lampBulbGeo = new THREE.BoxGeometry(0.55, 0.14, 0.3);
  const warmLampMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
  });
  const coolLampMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.8,
  });
  const lampCoords: [number, number, boolean][] = [
    [-10.2, 4, true],
    [10.2, -10, false],
    [-10.2, -26, false],
    [10.2, -38, true],
    [-12, -62, true],
    [12, -62, false],
    [-12, -80, false],
    [12, -80, true],
  ];
  lampCoords.forEach(([lx, lz, isWarm]) => {
    const post = new THREE.Mesh(lampPostGeo, darkMetalMat);
    post.position.set(lx, 2.6, lz);
    post.castShadow = true;
    scene.add(post);
    const bulb = new THREE.Mesh(lampBulbGeo, isWarm ? warmLampMat : coolLampMat);
    bulb.position.set(lx + (lx < 0 ? 0.35 : -0.35), 5.15, lz);
    scene.add(bulb);
  });

  // 7. Distant Skyline Towers via InstancedMesh (prevent void edge)
  const towerCount = 44;
  const towerGeo = new THREE.BoxGeometry(1, 1, 1);
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x0e131e,
    roughness: 0.85,
    metalness: 0.25,
  });
  const skyline = new THREE.InstancedMesh(towerGeo, towerMat, towerCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < towerCount; i++) {
    const angle = (i / towerCount) * Math.PI * 2;
    const radius = 64 + (i % 4) * 14;
    const h = 24 + ((i * 17) % 42);
    const w = 8 + ((i * 7) % 9);
    dummy.position.set(Math.cos(angle) * radius, h / 2, -38 + Math.sin(angle) * radius);
    dummy.scale.set(w, h, w);
    dummy.updateMatrix();
    skyline.setMatrixAt(i, dummy.matrix);
  }
  skyline.computeBoundingSphere();
  scene.add(skyline);

  // 7b. Canon Ashblock Heights Landmarks (Elevated Rail Viaduct, Rooftop Water Tower & Faction Murals)
  const viaductDeck = new THREE.Mesh(new THREE.BoxGeometry(92, 1.8, 5.4), darkMetalMat);
  viaductDeck.position.set(0, 14.5, -86);
  scene.add(viaductDeck);
  for (const px of [-32, -16, 16, 32]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(2.4, 14.5, 3.2), darkMetalMat);
    pier.position.set(px, 7.25, -86);
    scene.add(pier);
  }

  // Weathered Ashblock Rooftop Water Tower (from Ashblock Heights Area Sheet)
  const tankLegs = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.1, 3.2, 6, 1, true), darkMetalMat);
  tankLegs.position.set(21.5, 23.6, -8);
  scene.add(tankLegs);
  const waterTank = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 3.8, 12),
    new THREE.MeshStandardMaterial({ color: 0x574c44, roughness: 0.82, metalness: 0.22 })
  );
  waterTank.position.set(21.5, 26.8, -8);
  scene.add(waterTank);
  const tankCap = new THREE.Mesh(
    new THREE.ConeGeometry(2.45, 1.3, 12),
    new THREE.MeshStandardMaterial({ color: 0x3b332e, roughness: 0.78, metalness: 0.28 })
  );
  tankCap.position.set(21.5, 29.35, -8);
  scene.add(tankCap);

  // Official Faction & Memory Resistance Vertical Banners (#4A2A7A Syndicate Purple, #E4511E Blood Orange, #D4AF37 Memory Gold)
  const bannerSpecs: [number, number, number, number, number][] = [
    [-17.9, 9.5, -12, 0x4a2a7a, 0xd4af37],
    [17.9, 10.2, -28, 0x2360d1, 0x38bdf8],
    [-18.8, 10.5, -66, 0x4a2a7a, 0xe4511e],
    [18.8, 10.5, -66, 0x4a2a7a, 0xe4511e],
  ];
  bannerSpecs.forEach(([bx, by, bz, clothHex, trimHex]) => {
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 6.8),
      new THREE.MeshStandardMaterial({
        color: clothHex,
        emissive: trimHex,
        emissiveIntensity: 0.35,
        roughness: 0.68,
        side: THREE.DoubleSide,
      })
    );
    banner.position.set(bx, by, bz);
    banner.rotation.y = bx < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(banner);
  });

  // 8. Endangered Civilians (2 rescue targets)
  const buildCivilian = (id: string, name: string, pos: THREE.Vector3) => {
    const g = new THREE.Group();
    g.position.copy(pos);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadowMap,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    g.add(shadow);

    const coatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.6,
    });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.95, 8), coatMat);
    torso.position.y = 0.55;
    torso.castShadow = true;
    g.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }));
    head.position.y = 1.22;
    g.add(head);

    const beaconRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.035, 6, 24), beaconMat);
    beaconRing.rotation.x = Math.PI / 2;
    beaconRing.position.y = 0.12;
    g.add(beaconRing);

    scene.add(g);
    civilians.push({ id, name, position: pos.clone(), group: g, rescued: false });
  };

  buildCivilian('civ-1', 'Ashblock Medic', new THREE.Vector3(-15.5, 0.22, -16));
  buildCivilian('civ-2', 'Rooftop Machinist', new THREE.Vector3(14.5, 3.3, -32));

  // 9. Disrupted Myrr'Kai Memory Site
  const memorySitePos = new THREE.Vector3(15.5, 0.22, -38);
  const memoryCrystal = new THREE.Group();
  memoryCrystal.position.copy(memorySitePos);
  const coreCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.68, 0),
    new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 2.0,
      roughness: 0.18,
      metalness: 0.4,
    })
  );
  coreCrystal.position.y = 1.45;
  memoryCrystal.add(coreCrystal);

  const threadRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.045, 8, 32),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xd4af37,
      emissiveIntensity: 1.4,
    })
  );
  threadRing.rotation.x = Math.PI / 2.4;
  threadRing.position.y = 1.45;
  memoryCrystal.add(threadRing);
  scene.add(memoryCrystal);

  // 10. Destructible Supply Crates [GAMEPLAY ADAPTATION]
  const cratePositions: [number, number, number, string][] = [
    [-7.5, 0, -6, 'Ash Scrap'],
    [7.2, 0, -16, 'Pyraxis Ember'],
    [-8.5, 0, -34, 'Storm Capacitor'],
    [8.2, 0, -42, 'Myrr\'Kai Thread'],
    [-11, 0, -60, 'Pyraxis Ember'],
    [11, 0, -68, 'Storm Capacitor'],
  ];
  const crateGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    emissive: 0xf97316,
    emissiveIntensity: 0.22,
    roughness: 0.55,
    metalness: 0.45,
  });
  cratePositions.forEach(([cx, cy, cz, matReward], i) => {
    const mesh = new THREE.Mesh(crateGeo, crateMat.clone());
    mesh.position.set(cx, cy + 0.575, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    crates.push({
      id: `crate-${i}`,
      position: new THREE.Vector3(cx, cy, cz),
      mesh,
      hp: 30,
      broken: false,
      rewardMaterial: matReward,
    });
  });

  const world: AshblockWorld = {
    colliders,
    webAnchors,
    civilians,
    crates,
    memorySitePos,
    memoryCrystal,
    memorySiteReconstructed: false,
    alleyGatePos: new THREE.Vector3(0, 0, -48),
    alleyGateBarrier,
    alleyGateColliderIndex,
    alleyGateOpen: false,
    bossArenaCenter: new THREE.Vector3(0, 0, -72),
    borynMentorPos: new THREE.Vector3(16.2, 0.22, -41.2),
    boraxMentorPos: new THREE.Vector3(-14.5, 4.1, -26.0),
    updateVisuals: (elapsed: number) => {
      coreCrystal.rotation.y = elapsed * 1.1;
      coreCrystal.position.y = 1.45 + Math.sin(elapsed * 2.2) * 0.16;
      threadRing.rotation.z = elapsed * 1.4;
      webAnchors.forEach((a, idx) => {
        a.ringMesh.rotation.y = elapsed * 1.2 + idx;
      });
      civilians.forEach((c) => {
        if (!c.rescued && c.group.children[3]) {
          c.group.children[3].scale.setScalar(1 + Math.sin(elapsed * 4) * 0.08);
        }
      });
    },
  };

  return world;
}
