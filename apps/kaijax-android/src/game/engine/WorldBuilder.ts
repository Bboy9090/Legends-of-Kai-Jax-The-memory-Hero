import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EnvironmentMode } from '../types';
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
  zoneTag?: string;
}

export type WebAnchorAttachmentType =
  | 'skybridge_truss_girder'
  | 'tenement_crane_davit'
  | 'watertower_hoist_davit'
  | 'stronghold_spotlight_truss';

export interface WebAnchor {
  id: string;
  position: THREE.Vector3;
  supportPoint: THREE.Vector3;
  attachedStructureId: string;
  attachmentType: WebAnchorAttachmentType;
  ringMesh: THREE.Mesh;
  perchLandingPos?: THREE.Vector3;
}

export interface EnvironmentalHazardProp {
  id: string;
  name: string;
  position: THREE.Vector3;
  group: THREE.Group;
  beaconRing: THREE.Mesh;
  pullRadius: number;
  aoeRadius: number;
  damage: number;
  cooldown: number;
  maxCooldown: number;
  triggeredCount: number;
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

export interface WalkableZoneSummary {
  id: string;
  label: string;
  elevationY: number;
  center: [number, number, number];
}

export interface AshblockWorld {
  environmentMode: EnvironmentMode;
  qualityTier: 'low' | 'balanced' | 'high';
  modularKitLoadedCount: number;
  modularKitExpectedCount: number;
  instancedPropCount: number;
  deduplicatedMaterialCount: number;
  colliders: BoxCollider[];
  walkableZones: WalkableZoneSummary[];
  webAnchors: WebAnchor[];
  environmentalHazards: EnvironmentalHazardProp[];
  civilians: CivilianProp[];
  crates: CrateProp[];
  memorySitePos: THREE.Vector3;
  memoryCrystal: THREE.Group;
  memorySiteReconstructed: boolean;
  alleyGatePos: THREE.Vector3;
  alleyGateBarrier: THREE.Mesh;
  alleyGateColliderIndex: number;
  alleyGateOpen: boolean;
  sanctuaryPos: THREE.Vector3;
  dojoDeckPos: THREE.Vector3;
  bossArenaCenter: THREE.Vector3;
  borynMentorPos: THREE.Vector3;
  boraxMentorPos: THREE.Vector3;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  setQualityTier: (tier: 'low' | 'balanced' | 'high') => void;
  updateVisuals: (elapsed: number, dt?: number, cameraPos?: THREE.Vector3) => void;
}

export type DistrictWorld = AshblockWorld;

type ModularKitKey =
  | 'tenement'
  | 'tenementSetback'
  | 'shopfrontRow'
  | 'skybridge'
  | 'fireEscape'
  | 'watertower'
  | 'mechCluster'
  | 'dojo'
  | 'relay'
  | 'marketStall'
  | 'gatehouse'
  | 'strongholdArena';

const ASHBLOCK_KIT_URLS: Record<ModularKitKey, string> = {
  tenement: '/models/environments/ashblock/ashblock_tenement_facade.glb',
  tenementSetback: '/models/environments/ashblock/ashblock_tenement_corner_setback.glb',
  shopfrontRow: '/models/environments/ashblock/ashblock_alley_shopfront_row.glb',
  skybridge: '/models/environments/ashblock/ashblock_skybridge_truss.glb',
  fireEscape: '/models/environments/ashblock/ashblock_fire_escape_tower.glb',
  watertower: '/models/environments/ashblock/ashblock_rooftop_watertower.glb',
  mechCluster: '/models/environments/ashblock/ashblock_rooftop_mech_cluster.glb',
  dojo: '/models/environments/ashblock/ashblock_bloodward_dojo.glb',
  relay: '/models/environments/ashblock/ashblock_syndicate_relay.glb',
  marketStall: '/models/environments/ashblock/ashblock_market_awning_stall.glb',
  gatehouse: '/models/environments/ashblock/ashblock_syndicate_gatehouse.glb',
  strongholdArena: '/models/environments/ashblock/ashblock_courtyard_stronghold_arena.glb',
};

function createDuskSkyDome(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(235, 24, 14);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);

  const cHorizonLow = new THREE.Color(0xd97236); // Warm golden-amber dusk horizon (d438c610.png)
  const cHorizonMid = new THREE.Color(0x883b4e); // Burnt rose-crimson cloud band (f9d37a6e.png)
  const cMidSky = new THREE.Color(0x2e2144);     // Deep twilight violet
  const cZenith = new THREE.Color(0x0f1426);     // Night slate zenith
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const ny = THREE.MathUtils.clamp(pos.getY(i) / 235, -1, 1);
    if (ny <= 0.02) {
      tmp.copy(cHorizonLow).multiplyScalar(0.75);
    } else if (ny < 0.16) {
      tmp.lerpColors(cHorizonLow, cHorizonMid, ny / 0.16);
    } else if (ny < 0.44) {
      tmp.lerpColors(cHorizonMid, cMidSky, (ny - 0.16) / 0.28);
    } else {
      tmp.lerpColors(cMidSky, cZenith, Math.min(1, (ny - 0.44) / 0.56));
    }
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.name = 'Ashblock_Dusk_SkyDome';
  dome.renderOrder = -10;
  return dome;
}

function makeTranslatedBoxGeo(sx: number, sy: number, sz: number, cx: number, cy: number, cz: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(sx, sy, sz);
  g.translate(cx, cy, cz);
  return g;
}

function buildMergedStaticMesh(
  geos: THREE.BufferGeometry[],
  mat: THREE.Material,
  castShadow = false,
  receiveShadow = true
): THREE.Mesh | null {
  if (geos.length === 0) return null;
  const merged = mergeGeometries(geos, false);
  for (const g of geos) g.dispose();
  if (!merged) return null;
  const mesh = new THREE.Mesh(merged, mat);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  return mesh;
}

export function buildAshblockHeights(
  scene: THREE.Scene,
  textures: WorldTextureSet,
  initialMode: EnvironmentMode = 'reconstructed'
): AshblockWorld {
  const colliders: BoxCollider[] = [];
  const walkableZones: WalkableZoneSummary[] = [];
  const webAnchors: WebAnchor[] = [];
  const environmentalHazards: EnvironmentalHazardProp[] = [];
  const civilians: CivilianProp[] = [];
  const crates: CrateProp[] = [];

  const reconstructedGroup = new THREE.Group();
  reconstructedGroup.name = 'Ashblock_P1L_Reconstructed_World';
  scene.add(reconstructedGroup);

  const legacyGroup = new THREE.Group();
  legacyGroup.name = 'Ashblock_Legacy_Fallback_World';
  scene.add(legacyGroup);

  const secondaryDetailObjects: THREE.Object3D[] = [];

  // -------------------------------------------------------------------------
  // 1. Dusk Atmospheric Sky Dome + Ground Asphalt & Curbed Sidewalks
  // -------------------------------------------------------------------------
  reconstructedGroup.add(createDuskSkyDome());

  const roadMat = new THREE.MeshStandardMaterial({
    ...(textures.asphaltMap ? { map: textures.asphaltMap } : {}),
    ...(textures.asphaltRoughness ? { roughnessMap: textures.asphaltRoughness } : {}),
    roughness: 0.94,
    metalness: 0.02,
    envMapIntensity: 0.16,
  });
  const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(52, 136), roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0, -40);
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  const sidewalkMat = new THREE.MeshStandardMaterial({
    ...(textures.sidewalkMap ? { map: textures.sidewalkMap } : {}),
    roughness: 0.88,
    metalness: 0.06,
  });
  const sidewalkMerged = buildMergedStaticMesh(
    [
      makeTranslatedBoxGeo(8.5, 0.22, 126, -14.5, 0.11, -38),
      makeTranslatedBoxGeo(8.5, 0.22, 126, 14.5, 0.11, -38),
    ],
    sidewalkMat,
    false,
    true
  );
  if (sidewalkMerged) scene.add(sidewalkMerged);

  const courtyardFloorMat = new THREE.MeshStandardMaterial({
    ...(textures.sidewalkMap ? { map: textures.sidewalkMap } : {}),
    color: 0x8f8896,
    roughness: 0.72,
    metalness: 0.18,
  });
  const courtyardSlab = new THREE.Mesh(new THREE.PlaneGeometry(35.6, 38), courtyardFloorMat);
  courtyardSlab.rotation.x = -Math.PI / 2;
  courtyardSlab.position.set(0, 0.02, -69.5);
  courtyardSlab.receiveShadow = true;
  reconstructedGroup.add(courtyardSlab);

  // -------------------------------------------------------------------------
  // 2. Shared Physics Colliders + Batched Static World Geometry Buffers
  // -------------------------------------------------------------------------
  const wallMatA = new THREE.MeshStandardMaterial({
    ...(textures.buildingFacadeMap ? { map: textures.buildingFacadeMap } : {}),
    roughness: 0.84,
    metalness: 0.12,
  });
  const wallMatB = new THREE.MeshStandardMaterial({
    map: textures.buildingWarmOchreMap,
    roughness: 0.86,
    metalness: 0.08,
  });
  const containerMat = new THREE.MeshStandardMaterial({
    map: textures.containerMap,
    roughness: 0.62,
    metalness: 0.42,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    roughness: 0.46,
    metalness: 0.74,
  });
  const trimSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2c3342,
    roughness: 0.42,
    metalness: 0.8,
  });
  const hazardArmorMat = new THREE.MeshStandardMaterial({
    color: 0x261d29,
    roughness: 0.48,
    metalness: 0.72,
  });
  const crimsonTrimMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.55,
    roughness: 0.4,
    metalness: 0.5,
  });

  // Geometry collectors merged into single GPU draw calls per material (P5 optimization!)
  const legacyWallAGeos: THREE.BufferGeometry[] = [];
  const legacyWallBGeos: THREE.BufferGeometry[] = [];
  const legacyContainerGeos: THREE.BufferGeometry[] = [];
  const legacyDarkMetalGeos: THREE.BufferGeometry[] = [];

  const reconTrimSteelGeos: THREE.BufferGeometry[] = [];
  const reconDarkMetalGeos: THREE.BufferGeometry[] = [];
  const reconHazardArmorGeos: THREE.BufferGeometry[] = [];
  const reconCrimsonTrimGeos: THREE.BufferGeometry[] = [];

  const addColliderOnly = (
    cx: number,
    minY: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    walkableTop = false,
    wallRunnable = false,
    zoneTag?: string
  ): number => {
    const maxY = minY + sy;
    colliders.push({
      minX: cx - sx / 2,
      maxX: cx + sx / 2,
      minY,
      maxY,
      minZ: cz - sz / 2,
      maxZ: cz + sz / 2,
      walkableTop,
      wallRunnable,
      zoneTag,
    });
    if (walkableTop && zoneTag) {
      walkableZones.push({
        id: zoneTag,
        label: zoneTag,
        elevationY: Number(maxY.toFixed(2)),
        center: [Number(cx.toFixed(2)), Number(maxY.toFixed(2)), Number(cz.toFixed(2))],
      });
    }
    return colliders.length - 1;
  };

  const perimeterWalls: [number, number, number, number, number, boolean][] = [
    [-25.2, 8, 14, 24, 20, true],
    [25.2, 8, 14, 22, 20, false],
    [-27.5, -16, 11, 26, 16, false],
    [25.2, -11, 14, 25, 14, true],
    [-27.5, -32, 11, 24, 18, true],
    [27.5, -32, 11, 24, 22, false],
    [-25.2, -62, 14, 28, 22, false],
    [25.2, -62, 14, 28, 22, true],
    [-25.2, -82, 14, 30, 18, true],
    [25.2, -82, 14, 30, 18, false],
    [0, -93, 56, 32, 8, false],
    [0, 24, 56, 22, 8, false],
  ];

  for (const [bx, bz, sx, sy, sz, warm] of perimeterWalls) {
    addColliderOnly(bx, 0, bz, sx, sy, sz, false, true);
    (warm ? legacyWallBGeos : legacyWallAGeos).push(makeTranslatedBoxGeo(sx, sy, sz, bx, sy / 2, bz));
  }

  // -------------------------------------------------------------------------
  // 3. Continuous Rooftop, Fire-Escape, Skybridge & Boss Balcony Network (P3)
  // -------------------------------------------------------------------------
  const addGratedCatwalk = (
    cx: number,
    topY: number,
    cz: number,
    sx: number,
    sz: number,
    railSide: 'west' | 'east' | 'both' | 'none' = 'none',
    supportColumnsToGround = false
  ) => {
    reconTrimSteelGeos.push(makeTranslatedBoxGeo(sx, 0.24, sz, cx, topY - 0.12, cz));
    const sides: number[] =
      railSide === 'both' ? [-1, 1] : railSide === 'west' ? [1] : railSide === 'east' ? [-1] : [];
    for (const s of sides) {
      const rx = cx + s * (sx * 0.47);
      // Open-sightline top safety rail + vertical stanchions so characters/mentors remain unoccluded
      reconDarkMetalGeos.push(makeTranslatedBoxGeo(0.08, 0.09, sz, rx, topY + 0.82, cz));
      reconDarkMetalGeos.push(makeTranslatedBoxGeo(0.06, 0.06, sz, rx, topY + 0.42, cz));
      const postCount = Math.max(2, Math.round(sz / 3.2) + 1);
      for (let p = 0; p < postCount; p++) {
        const pz = cz - sz * 0.46 + (sz * 0.92 * p) / Math.max(1, postCount - 1);
        reconDarkMetalGeos.push(makeTranslatedBoxGeo(0.08, 0.84, 0.08, rx, topY + 0.42, pz));
      }
    }
    if (supportColumnsToGround) {
      for (const px of [cx - sx * 0.44, cx + sx * 0.44]) {
        for (const pz of [cz - sz * 0.44, cz + sz * 0.44]) {
          reconDarkMetalGeos.push(makeTranslatedBoxGeo(0.28, topY, 0.28, px, topY * 0.5, pz));
        }
      }
    }
  };

  // Elevated Rooftop Sanctuary Decks at y = 7.05m supported on real structural steel columns!
  addColliderOnly(-16.8, 6.72, -27.5, 8.8, 0.33, 13.0, true, false, 'west_high_rooftop_terrace');
  addGratedCatwalk(-16.8, 7.05, -27.5, 8.8, 13.0, 'west', true);

  addColliderOnly(16.8, 6.72, -25.0, 8.8, 0.33, 11.5, true, false, 'east_bloodward_dojo_rooftop');
  addGratedCatwalk(16.8, 7.05, -25.0, 8.8, 11.5, 'east', true);

  // West Fire-Escape Ascent Route (Street -> 1.80 -> 3.65 -> 5.35 -> 7.05m)
  addColliderOnly(-12.4, 0, -13.6, 3.0, 1.80, 3.2, true, false, 'west_ascent_step_1');
  addGratedCatwalk(-12.4, 1.80, -13.6, 3.0, 3.2, 'west', true);
  legacyContainerGeos.push(makeTranslatedBoxGeo(3.0, 1.80, 3.2, -12.4, 0.9, -13.6));

  addColliderOnly(-12.8, 0, -17.4, 3.2, 3.65, 3.6, true, true, 'west_ascent_step_2');
  addGratedCatwalk(-12.8, 3.65, -17.4, 3.2, 3.6, 'west', true);
  legacyContainerGeos.push(makeTranslatedBoxGeo(3.2, 3.65, 3.6, -12.8, 1.825, -17.4));

  addColliderOnly(-13.2, 3.40, -21.2, 3.4, 1.95, 3.8, true, false, 'west_ascent_step_3');
  addGratedCatwalk(-13.2, 5.35, -21.2, 3.4, 3.8, 'west', true);

  // East Bloodward Loft Ascent Route (Street -> 1.80 -> 3.65 -> 5.35 -> 7.05m)
  addColliderOnly(12.2, 0, -13.6, 3.0, 1.80, 3.2, true, false, 'east_ascent_step_1');
  addGratedCatwalk(12.2, 1.80, -13.6, 3.0, 3.2, 'east', true);
  legacyContainerGeos.push(makeTranslatedBoxGeo(3.0, 1.80, 3.2, 12.2, 0.9, -13.6));

  addColliderOnly(12.4, 0, -17.4, 3.2, 3.65, 3.6, true, true, 'east_ascent_step_2');
  addGratedCatwalk(12.4, 3.65, -17.4, 3.2, 3.6, 'east', true);
  legacyContainerGeos.push(makeTranslatedBoxGeo(3.2, 3.65, 3.6, 12.4, 1.825, -17.4));

  addColliderOnly(12.8, 3.40, -20.8, 3.4, 1.95, 3.6, true, false, 'east_ascent_step_3');
  addGratedCatwalk(12.8, 5.35, -20.8, 3.4, 3.6, 'east', true);

  // Stage 1 Rooftop Machinist (14.5, 3.3, -32) & Roof Dodger (14.5, 3.3, -29) Market Canopy Terrace
  addColliderOnly(14.5, 0, -30.5, 4.4, 3.30, 8.2, true, true, 'east_market_canopy_ledge');
  addGratedCatwalk(14.5, 3.30, -30.5, 4.4, 8.2, 'east', true);
  legacyContainerGeos.push(makeTranslatedBoxGeo(4.4, 3.30, 8.2, 14.5, 1.65, -30.5));

  // Walkable Cross-Street Pedestrian Skybridge (z = -27.0, top y = 7.05m)
  addColliderOnly(0, 6.72, -27.0, 29.6, 0.33, 3.1, true, false, 'central_walkable_skybridge');

  // North Rooftop Overlook Catwalks -> Syndicate Gatehouse Overhead Gantry (y = 5.20m)
  addColliderOnly(-13.4, 4.88, -40.5, 3.6, 0.32, 11.2, true, false, 'west_north_overlook_catwalk');
  addGratedCatwalk(-13.4, 5.20, -40.5, 3.6, 11.2, 'west', true);

  addColliderOnly(13.4, 4.88, -40.5, 3.6, 0.32, 11.2, true, false, 'east_north_overlook_catwalk');
  addGratedCatwalk(13.4, 5.20, -40.5, 3.6, 11.2, 'east', true);

  addColliderOnly(0, 4.85, -48.0, 29.0, 0.35, 3.4, true, false, 'syndicate_gatehouse_gantry');

  // Alley Gate Flanking Bastions & Breachable Energy Barrier (z = -48.0)
  addColliderOnly(-11.4, 0, -48.0, 14.8, 5.2, 3.6, false, true);
  addColliderOnly(11.4, 0, -48.0, 14.8, 5.2, 3.6, false, true);
  legacyDarkMetalGeos.push(
    makeTranslatedBoxGeo(14.8, 8.0, 3.2, -11.4, 4.0, -48.0),
    makeTranslatedBoxGeo(14.8, 8.0, 3.2, 11.4, 4.0, -48.0)
  );

  const alleyGatePos = new THREE.Vector3(0, 0, -48);
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.56,
    roughness: 0.18,
  });
  const alleyGateBarrier = new THREE.Mesh(new THREE.BoxGeometry(8.0, 4.8, 0.65), barrierMat);
  alleyGateBarrier.position.set(0, 2.4, -48);
  scene.add(alleyGateBarrier);

  const alleyGateColliderIndex = colliders.length;
  colliders.push({
    minX: -4.0,
    maxX: 4.0,
    minY: 0,
    maxY: 4.85,
    minZ: -49.2,
    maxZ: -46.8,
    walkableTop: false,
    wallRunnable: false,
    zoneTag: 'alley_gate_energy_barrier',
  });

  // Boss Courtyard Tactical Cover & Vertical Flanking Balconies (P2)
  const addSyndicateBarricade = (cx: number, cz: number, sx: number, sy: number, sz: number, tag: string) => {
    addColliderOnly(cx, 0, cz, sx, sy, sz, true, false, tag);
    legacyContainerGeos.push(makeTranslatedBoxGeo(sx, sy, sz, cx, sy * 0.5, cz));
    reconHazardArmorGeos.push(makeTranslatedBoxGeo(sx, sy * 0.84, sz, cx, sy * 0.42, cz));
    reconTrimSteelGeos.push(makeTranslatedBoxGeo(sx * 0.94, sy * 0.16, sz * 0.92, cx, sy * 0.92, cz));
    reconCrimsonTrimGeos.push(makeTranslatedBoxGeo(sx + 0.06, 0.18, sz + 0.06, cx, sy * 0.68, cz));
  };

  addSyndicateBarricade(-5.8, -6.5, 2.8, 1.35, 1.6, 'street_cover_west');
  addSyndicateBarricade(6.2, -23.5, 3.0, 1.40, 1.7, 'street_cover_east');

  addColliderOnly(-15.4, 0, -60.5, 3.4, 1.80, 4.2, true, false, 'boss_west_balcony_step');
  addGratedCatwalk(-15.4, 1.80, -60.5, 3.4, 4.2, 'west', true);
  addColliderOnly(-15.4, 0, -70.0, 3.6, 3.55, 14.5, true, true, 'boss_west_elevated_balcony');
  addGratedCatwalk(-15.4, 3.55, -70.0, 3.6, 14.5, 'west', true);

  addColliderOnly(15.4, 0, -60.5, 3.4, 1.80, 4.2, true, false, 'boss_east_balcony_step');
  addGratedCatwalk(15.4, 1.80, -60.5, 3.4, 4.2, 'east', true);
  addColliderOnly(15.4, 0, -70.0, 3.6, 3.55, 14.5, true, true, 'boss_east_elevated_balcony');
  addGratedCatwalk(15.4, 3.55, -70.0, 3.6, 14.5, 'east', true);

  addSyndicateBarricade(-9.6, -64.0, 3.2, 1.55, 1.9, 'boss_cover_nw');
  addSyndicateBarricade(9.6, -64.0, 3.2, 1.55, 1.9, 'boss_cover_ne');
  addSyndicateBarricade(-9.8, -79.0, 3.4, 1.65, 2.0, 'boss_cover_sw');
  addSyndicateBarricade(9.8, -79.0, 3.4, 1.65, 2.0, 'boss_cover_se');

  // Craning davit steel brackets for tenement web anchors & Stronghold floodlight truss (merged into reconTrimSteelGeos!)
  reconTrimSteelGeos.push(
    makeTranslatedBoxGeo(4.6, 0.28, 0.32, -13.55, 11.55, -15.0),
    makeTranslatedBoxGeo(4.6, 0.28, 0.32, 13.55, 11.55, -19.0),
    makeTranslatedBoxGeo(8.6, 0.36, 1.2, 0, 9.28, -48.0),
    // Boss Courtyard Stronghold overhead ring floodlight gantry & flank towers (e5b27b30.png)
    makeTranslatedBoxGeo(24.0, 0.48, 0.9, 0, 11.55, -81.65),
    makeTranslatedBoxGeo(0.65, 11.8, 0.65, -11.6, 5.9, -81.65),
    makeTranslatedBoxGeo(0.65, 11.8, 0.65, 11.6, 5.9, -81.65)
  );
  reconCrimsonTrimGeos.push(
    makeTranslatedBoxGeo(22.4, 0.22, 0.26, 0, 11.2, -81.2),
    makeTranslatedBoxGeo(8.2, 0.22, 0.26, 0, 9.5, -85.1)
  );

  // Flush merged Legacy & Reconstructed structural batches (reduces ~95 meshes to 8 draw calls!)
  for (const [geos, mat, target, cast] of [
    [legacyWallAGeos, wallMatA, legacyGroup, true],
    [legacyWallBGeos, wallMatB, legacyGroup, true],
    [legacyContainerGeos, containerMat, legacyGroup, true],
    [legacyDarkMetalGeos, darkMetalMat, legacyGroup, true],
    [reconTrimSteelGeos, trimSteelMat, reconstructedGroup, true],
    [reconDarkMetalGeos, darkMetalMat, reconstructedGroup, false],
    [reconHazardArmorGeos, hazardArmorMat, reconstructedGroup, true],
    [reconCrimsonTrimGeos, crimsonTrimMat, reconstructedGroup, false],
  ] as [THREE.BufferGeometry[], THREE.Material, THREE.Group, boolean][]) {
    const m = buildMergedStaticMesh(geos, mat, cast, true);
    if (m) target.add(m);
  }

  // -------------------------------------------------------------------------
  // 4. GPU-Instanced 12-Piece Modular PBR GLB Kit + Material Deduplication (P1, P5)
  // -------------------------------------------------------------------------
  const gltfLoader = new GLTFLoader();
  const canStreamBrowserGlbs = typeof window !== 'undefined' && typeof document !== 'undefined';
  let modularKitLoadedCount = 0;
  let deduplicatedMaterialCount = 0;
  let sharedKitMaterial: THREE.MeshStandardMaterial | null = null;
  let instancedPropCount = 0;
  const dummy = new THREE.Object3D();

  const extractSharedKitMesh = (gltfScene: THREE.Group): THREE.Mesh | null => {
    let found: THREE.Mesh | null = null;
    gltfScene.traverse((n) => {
      if (!found && (n as THREE.Mesh).isMesh) {
        found = n as THREE.Mesh;
        const origMat = found.material as THREE.MeshStandardMaterial;
        if (origMat && origMat.name === 'Ashblock_PBR_Atlas') {
          if (origMat.map) origMat.map.colorSpace = THREE.SRGBColorSpace;
          if (origMat.emissiveMap) origMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
          if (!sharedKitMaterial) {
            sharedKitMaterial = origMat;
            sharedKitMaterial.envMapIntensity = 0.85;
          } else if (origMat !== sharedKitMaterial) {
            origMat.map?.dispose();
            origMat.metalnessMap?.dispose();
            origMat.roughnessMap?.dispose();
            origMat.normalMap?.dispose();
            origMat.aoMap?.dispose();
            origMat.emissiveMap?.dispose();
            origMat.dispose();
            found.material = sharedKitMaterial;
            deduplicatedMaterialCount += 1;
          }
        }
      }
    });
    return found;
  };

  /**
   * Loads a modular .glb kit piece and renders all world placements in 1 single GPU InstancedMesh draw call!
   */
  const loadInstancedKitAsset = (
    url: string,
    placements: [number, number, number, number, number][],
    castShadow: boolean,
    isSecondaryDetail = false,
    onLoaded?: () => void
  ) => {
    if (!canStreamBrowserGlbs) return;
    gltfLoader.load(
      url,
      (gltf) => {
        modularKitLoadedCount += 1;
        const srcMesh = extractSharedKitMesh(gltf.scene);
        if (!srcMesh) return;

        const inst = new THREE.InstancedMesh(
          srcMesh.geometry,
          sharedKitMaterial ?? (srcMesh.material as THREE.Material),
          placements.length
        );
        inst.castShadow = castShadow;
        inst.receiveShadow = true;

        placements.forEach(([x, y, z, ry, syScale], i) => {
          dummy.position.set(x, y, z);
          dummy.rotation.set(0, ry, 0);
          dummy.scale.set(1, syScale, 1);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        });
        inst.instanceMatrix.needsUpdate = true;
        inst.computeBoundingSphere();
        reconstructedGroup.add(inst);
        if (isSecondaryDetail) {
          secondaryDetailObjects.push(inst);
        }
        onLoaded?.();
      },
      undefined,
      () => undefined
    );
  };

  // 1. Tower Variant A (`ashblock_tenement_facade.glb`) — 7 staggered placements -> 1 InstancedMesh draw call!
  const tenementAPlacements: [number, number, number, number, number][] = [
    [-20.5, 0, 11.0, Math.PI / 2, 1.0],
    [20.5, 0, 0.5, -Math.PI / 2, 1.04],
    [-23.8, 0, -25.0, Math.PI / 2, 1.02], // Continuous backdrop behind West Rooftop Overlook
    [-23.5, 0, -37.5, Math.PI / 2, 0.96],
    [20.5, 0, -56.5, -Math.PI / 2, 1.08],
    [-20.5, 0, -77.5, Math.PI / 2, 1.12],
  ];
  instancedPropCount += tenementAPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.tenement, tenementAPlacements, true);

  // 2. Tower Variant B (`ashblock_tenement_corner_setback.glb`) — 6 staggered placements -> 1 InstancedMesh draw call!
  const tenementBPlacements: [number, number, number, number, number][] = [
    [20.5, 0, 11.5, -Math.PI / 2, 1.0],
    [-20.5, 0, 0.0, Math.PI / 2, 1.05],
    [20.5, 0, -10.5, -Math.PI / 2, 0.98],
    [23.8, 0, -33.5, -Math.PI / 2, 1.04], // Continuous backdrop behind Bloodward Loft & Memory Site
    [-20.5, 0, -56.5, Math.PI / 2, 1.06],
    [20.5, 0, -77.5, -Math.PI / 2, 1.1],
  ];
  instancedPropCount += tenementBPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.tenementSetback, tenementBPlacements, true);

  // 3. 2-Story Alley & Street Storefront Rows (`ashblock_alley_shopfront_row.glb`) -> 1 InstancedMesh draw call!
  const shopfrontPlacements: [number, number, number, number, number][] = [
    [-21.2, 0, -16.5, Math.PI / 2, 1],
    [-21.2, 0, -27.5, Math.PI / 2, 1],
    [21.2, 0, -23.5, -Math.PI / 2, 1],
    [21.2, 0, -37.5, -Math.PI / 2, 1],
    [-19.8, 0, -67.5, Math.PI / 2, 1],
    [19.8, 0, -67.5, -Math.PI / 2, 1],
  ];
  instancedPropCount += shopfrontPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.shopfrontRow, shopfrontPlacements, true);

  // 4. Spanning Pratt-Truss Steel Skybridges (`ashblock_skybridge_truss.glb`) -> 1 InstancedMesh draw call!
  const skybridgePlacements: [number, number, number, number, number][] = [
    [0, 9.95, -7.0, 0, 1],
    [0, 6.92, -27.0, 0, 1],
    [0, 10.95, -39.0, 0, 1],
    [0, 11.15, -62.0, 0, 1],
  ];
  instancedPropCount += skybridgePlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.skybridge, skybridgePlacements, true);

  // 5. Climbable Multi-Tier Fire-Escape Towers (`ashblock_fire_escape_tower.glb`) -> 1 InstancedMesh draw call!
  const fireEscapePlacements: [number, number, number, number, number][] = [
    [-13.4, 0, -18.0, 0, 1],
    [13.0, 0, -17.6, Math.PI, 1],
    [-15.6, 0, -61.5, 0, 1],
    [15.6, 0, -61.5, Math.PI, 1],
  ];
  instancedPropCount += fireEscapePlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.fireEscape, fireEscapePlacements, false);

  // 6. Rooftop Cedar Water Towers (`ashblock_rooftop_watertower.glb`) -> 1 InstancedMesh draw call!
  const watertowerPlacements: [number, number, number, number, number][] = [
    [-17.48, 7.05, -31.0, 0, 1],
    [17.48, 7.05, -33.0, Math.PI, 1],
    [-19.5, 16.4, 1.5, 0.4, 1],
    [19.5, 16.4, -55.0, 2.6, 1],
  ];
  instancedPropCount += watertowerPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.watertower, watertowerPlacements, false);

  // 7. Rooftop Mechanical HVAC & Antenna Clusters (`ashblock_rooftop_mech_cluster.glb`) -> 1 InstancedMesh draw call!
  const mechPlacements: [number, number, number, number, number][] = [
    [-18.2, 7.05, -23.5, 0.3, 1],
    [19.8, 16.35, 11.0, -1.2, 1],
    [-19.8, 16.35, -56.0, 0.8, 1],
    [18.8, 18.4, -77.0, -0.6, 1],
  ];
  instancedPropCount += mechPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.mechCluster, mechPlacements, false, true);

  // 8. Boryn's Bloodward Loft Rooftop Sanctuary (`ashblock_bloodward_dojo.glb`)
  const dojoDeckPos = new THREE.Vector3(17.2, 7.05, -25.0);
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.dojo, [[dojoDeckPos.x, dojoDeckPos.y, dojoDeckPos.z, -Math.PI / 2, 1]], true);

  // 10. Beast-Kin Street Market Stalls (`ashblock_market_awning_stall.glb`) -> 1 InstancedMesh draw call!
  const stallPlacements: [number, number, number, number, number][] = [
    [-11.8, 0.22, 4.8, Math.PI / 2, 1],
    [11.8, 0.22, -2.5, -Math.PI / 2, 1],
    [-11.8, 0.22, -22.5, Math.PI / 2, 1],
    [11.4, 0.22, -23.5, -Math.PI / 2, 1],
  ];
  instancedPropCount += stallPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.marketStall, stallPlacements, false, true);

  // 11. Fang Syndicate Fortified Alley Gatehouse (`ashblock_syndicate_gatehouse.glb`)
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.gatehouse, [[0, 0, -48.0, 0, 1]], true);

  // 12. Fang Stronghold Boss Courtyard Backdrop & Floodlight Truss (`ashblock_courtyard_stronghold_arena.glb`)
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.strongholdArena, [[0, 0, -88.0, 0, 1]], true);

  // -------------------------------------------------------------------------
  // 5. 10 Geometry-Attached Structural Web Anchors (Batched into 1 InstancedMesh!)
  // -------------------------------------------------------------------------
  const collarRingGeo = new THREE.TorusGeometry(0.32, 0.06, 8, 16);
  const collarRingMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.35,
    roughness: 0.25,
    metalness: 0.72,
  });
  const legacyAnchorGeo = new THREE.OctahedronGeometry(0.42, 0);
  const legacyAnchorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });

  const anchorSpecs: {
    id: string;
    pos: [number, number, number];
    support: [number, number, number];
    structureId: string;
    type: WebAnchorAttachmentType;
    perch?: [number, number, number];
  }[] = [
    {
      id: 'wb-south-skybridge',
      pos: [0, 9.56, -7.0],
      support: [0, 9.72, -7.0],
      structureId: 'skybridge-south-z07',
      type: 'skybridge_truss_girder',
    },
    {
      id: 'wb-west-crane-south',
      pos: [-12.9, 11.35, -15.0],
      support: [-13.1, 11.52, -15.0],
      structureId: 'tenement-west-crane-z15',
      type: 'tenement_crane_davit',
      perch: [-12.8, 3.65, -17.4],
    },
    {
      id: 'wb-east-crane-market',
      pos: [12.9, 11.35, -19.0],
      support: [13.1, 11.52, -19.0],
      structureId: 'tenement-east-crane-z19',
      type: 'tenement_crane_davit',
      perch: [14.2, 7.05, -23.0],
    },
    {
      id: 'wb-mid-skybridge-walkable',
      pos: [0, 6.56, -27.0],
      support: [0, 6.74, -27.0],
      structureId: 'skybridge-walkable-z27',
      type: 'skybridge_truss_girder',
      perch: [0, 7.05, -27.0],
    },
    {
      id: 'wb-west-watertower',
      pos: [-15.5, 12.15, -31.0],
      support: [-15.5, 12.33, -31.0],
      structureId: 'watertower-west-z31',
      type: 'watertower_hoist_davit',
      perch: [-15.2, 7.05, -29.0],
    },
    {
      id: 'wb-east-dojo-watertower',
      pos: [15.5, 12.15, -33.0],
      support: [15.5, 12.33, -33.0],
      structureId: 'watertower-east-z33',
      type: 'watertower_hoist_davit',
      perch: [14.5, 7.05, -26.5],
    },
    {
      id: 'wb-memory-skybridge',
      pos: [0, 10.56, -39.0],
      support: [0, 10.74, -39.0],
      structureId: 'skybridge-memory-z39',
      type: 'skybridge_truss_girder',
    },
    {
      id: 'wb-gatehouse-arch',
      pos: [0, 9.05, -48.0],
      support: [0, 9.24, -48.0],
      structureId: 'gatehouse-arch-z48',
      type: 'skybridge_truss_girder',
      perch: [0, 5.20, -48.0],
    },
    {
      id: 'wb-courtyard-skybridge',
      pos: [0, 10.76, -62.0],
      support: [0, 10.94, -62.0],
      structureId: 'skybridge-courtyard-z62',
      type: 'skybridge_truss_girder',
    },
    {
      id: 'wb-stronghold-spotlight-truss',
      pos: [0, 11.24, -81.65],
      support: [0, 11.42, -81.65],
      structureId: 'stronghold-spotlight-z82',
      type: 'stronghold_spotlight_truss',
    },
  ];

  const collarInst = new THREE.InstancedMesh(collarRingGeo, collarRingMat, anchorSpecs.length);
  const legacyAnchorInst = new THREE.InstancedMesh(legacyAnchorGeo, legacyAnchorMat, anchorSpecs.length);
  const sharedStubRingMesh = new THREE.Mesh(collarRingGeo, collarRingMat);

  anchorSpecs.forEach((spec, i) => {
    dummy.position.set(spec.support[0], spec.support[1], spec.support[2]);
    dummy.rotation.set(Math.PI / 2, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    collarInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    legacyAnchorInst.setMatrixAt(i, dummy.matrix);

    webAnchors.push({
      id: spec.id,
      position: new THREE.Vector3(...spec.pos),
      supportPoint: new THREE.Vector3(...spec.support),
      attachedStructureId: spec.structureId,
      attachmentType: spec.type,
      ringMesh: sharedStubRingMesh,
      perchLandingPos: spec.perch ? new THREE.Vector3(...spec.perch) : undefined,
    });
  });
  collarInst.instanceMatrix.needsUpdate = true;
  collarInst.computeBoundingSphere();
  legacyAnchorInst.instanceMatrix.needsUpdate = true;
  legacyAnchorInst.computeBoundingSphere();
  reconstructedGroup.add(collarInst);
  legacyGroup.add(legacyAnchorInst);
  instancedPropCount += anchorSpecs.length;

  // -------------------------------------------------------------------------
  // 6. 5 Interactive Fang Syndicate High-Voltage Arc Relay Hazards (P2, Batched GLB)
  // -------------------------------------------------------------------------
  const relaySpecs: { id: string; name: string; pos: [number, number, number] }[] = [
    { id: 'relay-row-south', name: 'Ashblock Row Arc Relay', pos: [-6.8, 0, -11.5] },
    { id: 'relay-alley-west', name: 'Market Alley Junction Relay', pos: [-10.8, 0, -21.5] },
    { id: 'relay-memory-east', name: 'Memory Plaza Conduit Pylon', pos: [9.2, 0, -36.5] },
    { id: 'relay-boss-west', name: 'Courtyard West Surge Pylon', pos: [-8.2, 0, -68.5] },
    { id: 'relay-boss-east', name: 'Courtyard East Surge Pylon', pos: [8.2, 0, -75.5] },
  ];

  const relayRingGeo = new THREE.TorusGeometry(0.95, 0.055, 8, 22);
  const relayPlacements: [number, number, number, number, number][] = [];

  for (const rSpec of relaySpecs) {
    const group = new THREE.Group();
    group.position.set(rSpec.pos[0], rSpec.pos[1], rSpec.pos[2]);
    reconstructedGroup.add(group);

    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const beaconRing = new THREE.Mesh(relayRingGeo, beaconMat);
    beaconRing.rotation.x = Math.PI / 2;
    beaconRing.position.y = 0.16;
    group.add(beaconRing);

    addColliderOnly(rSpec.pos[0], 0, rSpec.pos[2], 1.35, 2.7, 1.35, false, false);
    relayPlacements.push([rSpec.pos[0], rSpec.pos[1], rSpec.pos[2], 0, 1]);

    environmentalHazards.push({
      id: rSpec.id,
      name: rSpec.name,
      position: new THREE.Vector3(rSpec.pos[0], rSpec.pos[1], rSpec.pos[2]),
      group,
      beaconRing,
      pullRadius: 8.5,
      aoeRadius: 5.2,
      damage: 68,
      cooldown: 0,
      maxCooldown: 9.0,
      triggeredCount: 0,
    });
  }

  // 9. Instanced Syndicate Relay Pylons -> 1 GPU draw call for all 5 relays!
  instancedPropCount += relayPlacements.length;
  loadInstancedKitAsset(ASHBLOCK_KIT_URLS.relay, relayPlacements, true);

  // -------------------------------------------------------------------------
  // 7. Canon Murals, District Storefront Signage & Stronghold Decals (P1, P4)
  // -------------------------------------------------------------------------
  const addWallDecal = (
    map: THREE.CanvasTexture | undefined,
    w: number,
    h: number,
    pos: [number, number, number],
    rotY: number,
    emissiveBoost = 0,
    reconstructedOnly = false
  ) => {
    if (!map) return;
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: emissiveBoost > 0 ? 0.35 : 0.72,
      metalness: 0.1,
      emissive: emissiveBoost > 0 ? new THREE.Color(0xffffff) : new THREE.Color(0x000000),
      emissiveMap: emissiveBoost > 0 ? map : null,
      emissiveIntensity: emissiveBoost,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    plane.position.set(pos[0], pos[1], pos[2]);
    plane.rotation.y = rotY;
    (reconstructedOnly ? reconstructedGroup : scene).add(plane);
  };

  addWallDecal(textures.muralUnityMap, 9.2, 4.6, [-17.65, 6.2, 8.5], Math.PI / 2);
  addWallDecal(textures.billboardTrustMap, 8.8, 4.4, [17.65, 10.6, -11.0], -Math.PI / 2, 0.25);
  addWallDecal(textures.graffitiMemoryMap, 5.4, 2.7, [18.55, 3.2, -37.5], -Math.PI / 2, 0, true);
  addWallDecal(textures.bannerRoarMap, 5.4, 1.35, [19.4, 10.6, -24.5], -Math.PI / 2, 0.18, true);
  addWallDecal(textures.signMarketMap, 5.8, 1.45, [17.65, 3.25, -23.5], -Math.PI / 2, 0.36, true);
  addWallDecal(textures.signTailoringMap, 5.6, 1.4, [-17.65, 3.25, -16.5], Math.PI / 2, 0.36, true);

  addWallDecal(textures.bannerFangSyndicateMap, 7.8, 1.6, [0, 6.85, -46.02], 0, 0.45, true);
  addWallDecal(textures.bannerFangSyndicateMap, 8.6, 1.8, [0, 6.15, -85.15], 0, 0.52, true);
  addWallDecal(textures.graffitiNoLawMap, 5.2, 2.6, [-17.15, 5.6, -69.5], Math.PI / 2, 0.15, true);
  addWallDecal(textures.graffitiNoLawMap, 5.2, 2.6, [17.15, 5.6, -69.5], -Math.PI / 2, 0.15, true);

  // -------------------------------------------------------------------------
  // 8. Merged Horizon Beast-God Monoliths, Stepped Skyline & Rail Viaduct (P4, P5)
  // -------------------------------------------------------------------------
  const monolithMat = new THREE.MeshStandardMaterial({
    color: 0x1a1528,
    roughness: 0.92,
    metalness: 0.12,
  });
  const monolithEyeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

  const horizonGeos: THREE.BufferGeometry[] = [];
  const horizonEyeGeos: THREE.BufferGeometry[] = [];

  for (const [mx, mz, mw, mh] of [
    [-46, -138, 22, 92],
    [0, -152, 28, 114],
    [48, -140, 22, 95],
  ] as [number, number, number, number][]) {
    // Torso, broad guardian pauldrons/shoulders, and crowned head (d438c610.png skyline)
    horizonGeos.push(
      makeTranslatedBoxGeo(mw * 0.84, mh * 0.82, mw * 0.68, mx, mh * 0.41 - 4, mz),
      makeTranslatedBoxGeo(mw * 1.24, mh * 0.22, mw * 0.62, mx, mh * 0.64 - 4, mz),
      makeTranslatedBoxGeo(mw * 0.64, mh * 0.24, mw * 0.6, mx, mh * 0.86 - 4, mz)
    );
    for (const side of [-1, 1]) {
      const ear = new THREE.ConeGeometry(mw * 0.2, 16, 4);
      ear.translate(mx + side * mw * 0.26, mh - 1, mz);
      horizonGeos.push(ear);

      const eye = new THREE.PlaneGeometry(2.5, 1.1);
      eye.translate(mx + side * 4.2, mh * 0.82, mz + mw * 0.34);
      horizonEyeGeos.push(eye);
    }
  }

  for (const [sx, sz, sw, sh] of [
    [-86, -118, 16, 62],
    [-64, -124, 14, 74],
    [-26, -130, 15, 58],
    [28, -128, 16, 66],
    [66, -122, 15, 78],
    [88, -116, 18, 56],
  ] as [number, number, number, number][]) {
    horizonGeos.push(
      makeTranslatedBoxGeo(sw, sh * 0.76, sw, sx, sh * 0.38 - 2, sz),
      makeTranslatedBoxGeo(sw * 0.62, sh * 0.28, sw * 0.62, sx, sh * 0.86 - 2, sz)
    );
  }

  const mergedHorizon = buildMergedStaticMesh(horizonGeos, monolithMat, false, false);
  const mergedEyes = buildMergedStaticMesh(horizonEyeGeos, monolithEyeMat, false, false);
  if (mergedHorizon) scene.add(mergedHorizon);
  if (mergedEyes) scene.add(mergedEyes);

  // Elevated Steel Rail Viaduct & Merged Gliding Lit Train Consist (f9d37a6e.png)
  const viaductGroup = new THREE.Group();
  viaductGroup.position.set(0, 19.2, -98.0);
  reconstructedGroup.add(viaductGroup);

  const viaductSpanGeos: THREE.BufferGeometry[] = [
    makeTranslatedBoxGeo(150, 1.35, 5.2, 0, 0, 0),
    makeTranslatedBoxGeo(150, 0.45, 5.6, 0, 3.6, 0),
  ];
  for (let vx = -64; vx <= 64; vx += 16) {
    viaductSpanGeos.push(makeTranslatedBoxGeo(2.4, 20, 3.8, vx, -10.5, 0));
  }
  const viaductMerged = buildMergedStaticMesh(viaductSpanGeos, darkMetalMat, false, false);
  if (viaductMerged) viaductGroup.add(viaductMerged);

  const trainConsist = new THREE.Group();
  trainConsist.position.set(-40, 1.65, 0);
  viaductGroup.add(trainConsist);

  const trainBodyGeos: THREE.BufferGeometry[] = [];
  const trainWinGeos: THREE.BufferGeometry[] = [];
  for (let car = 0; car < 4; car++) {
    const cx = car * 11.4;
    trainBodyGeos.push(makeTranslatedBoxGeo(10.6, 2.3, 3.2, cx, 0, 0));
    const wg = new THREE.PlaneGeometry(9.2, 0.72);
    wg.translate(cx, 0.25, 1.62);
    trainWinGeos.push(wg);
  }
  const mergedTrainBody = buildMergedStaticMesh(trainBodyGeos, trimSteelMat, false, false);
  const mergedTrainWin = buildMergedStaticMesh(
    trainWinGeos,
    new THREE.MeshBasicMaterial({ color: 0xfde68a }),
    false,
    false
  );
  if (mergedTrainBody) trainConsist.add(mergedTrainBody);
  if (mergedTrainWin) trainConsist.add(mergedTrainWin);

  // -------------------------------------------------------------------------
  // 9. GPU Instanced Streetlamps, Bollards, Alley String-Lights & Dusk Motes (P4, P5)
  // -------------------------------------------------------------------------
  const lampCoords: [number, number][] = [
    [-10.4, 10],
    [10.4, 10],
    [-10.4, -5],
    [10.4, -5],
    [-10.4, -20],
    [10.4, -20],
    [-10.4, -36],
    [10.4, -36],
    [-12.2, -56],
    [12.2, -56],
    [-12.2, -78],
    [12.2, -78],
  ];
  const poleInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.11, 0.16, 5.4, 6),
    darkMetalMat,
    lampCoords.length
  );
  const bulbInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.62, 0.24, 0.36),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    lampCoords.length
  );
  lampCoords.forEach(([lx, lz], i) => {
    const dir = lx < 0 ? 1 : -1;
    dummy.position.set(lx, 2.7, lz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    poleInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx + dir * 0.7, 5.3, lz);
    dummy.updateMatrix();
    bulbInst.setMatrixAt(i, dummy.matrix);
  });
  poleInst.instanceMatrix.needsUpdate = true;
  bulbInst.instanceMatrix.needsUpdate = true;
  poleInst.computeBoundingSphere();
  bulbInst.computeBoundingSphere();
  scene.add(poleInst);
  scene.add(bulbInst);
  instancedPropCount += lampCoords.length * 2;

  const streetPointLights: THREE.PointLight[] = [];
  for (const [px, py, pz, col, inten, dist] of [
    [0, 5.8, 2, 0xf59e0b, 1.35, 24],
    [0, 5.8, -24, 0xfb923c, 1.35, 24],
    [15.2, 9.5, -25.0, 0xfbbf24, 1.45, 18],
    [0, 8.2, -72, 0xef4444, 1.65, 28],
  ] as [number, number, number, number, number, number][]) {
    const pl = new THREE.PointLight(col, inten, dist, 1.6);
    pl.position.set(px, py, pz);
    reconstructedGroup.add(pl);
    streetPointLights.push(pl);
  }

  const bollardCoords: [number, number][] = [];
  for (let bz = 12; bz >= -42; bz -= 6) {
    bollardCoords.push([-10.2, bz], [10.2, bz]);
  }
  const bollardInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.86, 6),
    trimSteelMat,
    bollardCoords.length
  );
  bollardCoords.forEach(([bx, bz], i) => {
    dummy.position.set(bx, 0.43, bz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bollardInst.setMatrixAt(i, dummy.matrix);
  });
  bollardInst.instanceMatrix.needsUpdate = true;
  bollardInst.computeBoundingSphere();
  reconstructedGroup.add(bollardInst);
  instancedPropCount += bollardCoords.length;

  const garlandSpans = [-2, -16, -32];
  const bulbsPerSpan = 12;
  const garlandBulbInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.11, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0xfde68a }),
    garlandSpans.length * bulbsPerSpan
  );
  let gIdx = 0;
  for (const gz of garlandSpans) {
    for (let k = 0; k < bulbsPerSpan; k++) {
      const t = (k + 0.5) / bulbsPerSpan;
      const gx = THREE.MathUtils.lerp(-16.5, 16.5, t);
      const sag = Math.sin(t * Math.PI) * 1.15;
      dummy.position.set(gx, 6.35 - sag, gz);
      dummy.updateMatrix();
      garlandBulbInst.setMatrixAt(gIdx++, dummy.matrix);
    }
  }
  garlandBulbInst.instanceMatrix.needsUpdate = true;
  garlandBulbInst.computeBoundingSphere();
  reconstructedGroup.add(garlandBulbInst);
  instancedPropCount += gIdx;

  const moteCount = 90;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3] = ((i * 37) % 36) - 18;
    motePositions[i * 3 + 1] = 0.8 + ((i * 19) % 13);
    motePositions[i * 3 + 2] = 14 - ((i * 53) % 102);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0xfdba74,
    size: 0.16,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const duskMotes = new THREE.Points(moteGeo, moteMat);
  reconstructedGroup.add(duskMotes);

  // -------------------------------------------------------------------------
  // 10. Sanctuary Brazier, Disrupted Memory Site, Civilians & Destructible Crates
  // -------------------------------------------------------------------------
  const sanctuaryPos = new THREE.Vector3(-8, 0, 12);
  const brazierBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.2, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 })
  );
  brazierBase.position.set(sanctuaryPos.x, 0.45, sanctuaryPos.z);
  scene.add(brazierBase);

  const brazierFlame = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 1),
    new THREE.MeshBasicMaterial({ color: 0xf97316 })
  );
  brazierFlame.position.set(sanctuaryPos.x, 1.35, sanctuaryPos.z);
  scene.add(brazierFlame);

  const memorySitePos = new THREE.Vector3(15.5, 0.22, -38);
  const memoryCrystal = new THREE.Group();
  memoryCrystal.position.copy(memorySitePos);
  scene.add(memoryCrystal);

  const memRingMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x6d28d9,
    emissiveIntensity: 1.6,
    roughness: 0.22,
  });
  const memRingOuter = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.08, 10, 28), memRingMat);
  memRingOuter.rotation.x = Math.PI / 2;
  memRingOuter.position.y = 0.2;
  memoryCrystal.add(memRingOuter);

  const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), memRingMat);
  coreCrystal.position.y = 1.65;
  memoryCrystal.add(coreCrystal);

  const buildCivilian = (id: string, name: string, pos: THREE.Vector3, shirtHex: number) => {
    const cg = new THREE.Group();
    cg.position.copy(pos);
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.85, 4, 8),
      new THREE.MeshStandardMaterial({ color: shirtHex, roughness: 0.7 })
    );
    body.position.y = 0.78;
    body.castShadow = true;
    cg.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
    );
    head.position.y = 1.48;
    cg.add(head);

    const beacon = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.72, 18),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    beacon.rotation.x = -Math.PI / 2;
    beacon.position.y = 0.05;
    cg.add(beacon);

    scene.add(cg);
    civilians.push({ id, name, position: pos.clone(), group: cg, rescued: false });
  };

  buildCivilian('civ-1', 'Ashblock Medic', new THREE.Vector3(-15.5, 0.22, -16), 0x38bdf8);
  buildCivilian('civ-2', 'Rooftop Machinist', new THREE.Vector3(14.5, 3.30, -32), 0xf59e0b);

  const crateSpecs: [number, number, number, string][] = [
    [-7.5, 0, -6, 'Ash Scrap'],
    [7.2, 0, -16, 'Pyraxis Ember'],
    [-8.5, 0, -34, 'Storm Capacitor'],
    [8.2, 0, -42, "Myrr'Kai Thread"],
    [-11.0, 0, -60, 'Pyraxis Ember'],
    [11.0, 0, -68, 'Storm Capacitor'],
  ];
  const crateGeo = new THREE.BoxGeometry(1.12, 1.12, 1.12);
  const crateMat = new THREE.MeshStandardMaterial({
    map: textures.containerMap,
    color: 0xb47b44,
    emissive: 0xf97316,
    emissiveIntensity: 0.22,
    roughness: 0.54,
    metalness: 0.36,
  });
  crateSpecs.forEach(([cx, cy, cz, matReward], i) => {
    const mesh = new THREE.Mesh(crateGeo, crateMat);
    mesh.position.set(cx, cy + 0.56, cz);
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

  // -------------------------------------------------------------------------
  // 11. World State, Mode Toggle, Mobile Quality Tier & Visual Tick
  // -------------------------------------------------------------------------
  const world: AshblockWorld = {
    environmentMode: initialMode,
    qualityTier: 'high',
    get modularKitLoadedCount() {
      return modularKitLoadedCount;
    },
    modularKitExpectedCount: Object.keys(ASHBLOCK_KIT_URLS).length,
    instancedPropCount,
    get deduplicatedMaterialCount() {
      return deduplicatedMaterialCount;
    },
    colliders,
    walkableZones,
    webAnchors,
    environmentalHazards,
    civilians,
    crates,
    memorySitePos,
    memoryCrystal,
    memorySiteReconstructed: false,
    alleyGatePos,
    alleyGateBarrier,
    alleyGateColliderIndex,
    alleyGateOpen: false,
    sanctuaryPos,
    dojoDeckPos,
    bossArenaCenter: new THREE.Vector3(0, 0, -72),
    borynMentorPos: new THREE.Vector3(14.2, 7.05, -24.5),
    boraxMentorPos: new THREE.Vector3(-14.6, 7.05, -26.5),
    setEnvironmentMode(mode: EnvironmentMode) {
      world.environmentMode = mode;
      reconstructedGroup.visible = mode === 'reconstructed';
      legacyGroup.visible = mode === 'legacy';
    },
    setQualityTier(tier: 'low' | 'balanced' | 'high') {
      world.qualityTier = tier;
      const isLow = tier === 'low';
      duskMotes.visible = !isLow;
      garlandBulbInst.visible = !isLow;
      viaductGroup.visible = !isLow;
      for (let i = 0; i < streetPointLights.length; i++) {
        streetPointLights[i].visible = isLow ? i >= 2 : true;
      }
      for (const detailObj of secondaryDetailObjects) {
        detailObj.visible = !isLow;
      }
    },
    updateVisuals(elapsed: number, dt = 1 / 60) {
      brazierFlame.rotation.y = elapsed * 2.4;
      brazierFlame.scale.setScalar(0.92 + Math.sin(elapsed * 7) * 0.1);

      coreCrystal.rotation.y = elapsed * 1.3;
      coreCrystal.position.y = 1.65 + Math.sin(elapsed * 2.6) * 0.18;
      if (world.memorySiteReconstructed) {
        memRingMat.color.setHex(0x38bdf8);
        memRingMat.emissive.setHex(0x0284c7);
      }

      if (viaductGroup.visible) {
        trainConsist.position.x = -68 + ((elapsed * 9.5) % 136);
      }

      if (duskMotes.visible) {
        duskMotes.position.y = Math.sin(elapsed * 0.45) * 0.45;
      }

      for (let i = 0; i < environmentalHazards.length; i++) {
        const haz = environmentalHazards[i];
        if (haz.cooldown > 0) {
          haz.cooldown = Math.max(0, haz.cooldown - dt);
        }
        const bMat = haz.beaconRing.material as THREE.MeshBasicMaterial;
        if (haz.cooldown > 0) {
          bMat.color.setHex(0x64748b);
          bMat.opacity = 0.24;
        } else {
          bMat.color.setHex(0x38bdf8);
          bMat.opacity = 0.58 + Math.sin(elapsed * 5 + i) * 0.2;
          haz.beaconRing.scale.setScalar(0.98 + Math.sin(elapsed * 3.8 + i) * 0.06);
        }
      }

      if (!world.alleyGateOpen) {
        barrierMat.opacity = 0.45 + Math.sin(elapsed * 5) * 0.14;
      }

      for (const civ of civilians) {
        if (!civ.rescued) {
          civ.group.children[0].position.y = 0.78 + Math.abs(Math.sin(elapsed * 3.5)) * 0.08;
        }
      }
    },
  };

  world.setEnvironmentMode(initialMode);
  return world;
}
