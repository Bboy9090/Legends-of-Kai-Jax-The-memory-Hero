import * as THREE from 'three';
import { HeroId } from '../types';

export interface ArticulatedHeroRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  spiderLimbs: THREE.Group[];
  maneSpikes: THREE.Mesh[];
  tails: THREE.Group[]; // Strictly 3 primary tails for Kai-Jax (Ember, Memory, Storm)
  auraMesh: THREE.Mesh;
  energyMaterial: THREE.MeshStandardMaterial;
  trimMaterial: THREE.MeshStandardMaterial;
}

export interface ArticulatedEnemyRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weaponGroup: THREE.Group;
  visorMat: THREE.MeshStandardMaterial;
  telegraphRing: THREE.Mesh;
}

export function createHeroRig(
  heroId: HeroId,
  contactShadowTex: THREE.Texture,
  accentHex = '#D4AF37',
  trimHex = '#1E293B'
): ArticulatedHeroRig {
  const root = new THREE.Group();

  // Contact shadow disc grounded at y=0.02
  const shadowGeo = new THREE.PlaneGeometry(1.55, 1.55);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  root.add(shadow);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.92; // Hip center height
  root.add(bodyGroup);

  const isKai = heroId === 'kai';
  const isJax = heroId === 'jax';
  const isFused = heroId === 'kaijax';

  const furColor = isKai ? 0xeaeff8 : isJax ? 0x151a25 : 0xdbe3f0;
  const clothColor = isKai ? 0xf1f5f9 : isJax ? 0x10141e : 0x161424;
  const energyHex = isKai ? 0xa855f7 : isJax ? 0x38bdf8 : 0xa855f7;
  const eyeHex = isKai ? 0xa855f7 : isJax ? 0x38bdf8 : 0xf59e0b;

  const furMat = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.78,
    metalness: 0.06,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    color: clothColor,
    roughness: 0.62,
    metalness: 0.18,
  });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(trimHex),
    roughness: 0.35,
    metalness: 0.68,
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: 0.18,
  });
  const energyMaterial = new THREE.MeshStandardMaterial({
    color: energyHex,
    emissive: energyHex,
    emissiveIntensity: 1.5,
    roughness: 0.25,
    metalness: 0.3,
  });
  const fangMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.22,
    metalness: 0.15,
  });

  // 1. Torso & Urban Armor Chest
  const torsoScale = isFused ? 1.12 : isJax ? 1.08 : 0.94;
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26 * torsoScale, 0.2 * torsoScale, 0.56, 8),
    clothMat
  );
  torso.position.y = 0.26;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Chest Heritage Plate / Core
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.38 * torsoScale, 0.24, 0.28 * torsoScale),
    trimMaterial
  );
  chestPlate.position.set(0, 0.34, 0.04);
  chestPlate.castShadow = true;
  bodyGroup.add(chestPlate);

  const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), energyMaterial);
  chestCore.position.set(0, 0.35, 0.19 * torsoScale);
  bodyGroup.add(chestCore);

  // 2. Head + Sabertooth Muzzle + Oversized Fangs
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.66, 0.03);
  bodyGroup.add(headGroup);

  const cranium = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), furMat);
  cranium.scale.set(0.95, 1.0, 1.05);
  cranium.castShadow = true;
  headGroup.add(cranium);

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.18), furMat);
  muzzle.position.set(0, -0.05, 0.16);
  headGroup.add(muzzle);

  // Twin oversized sabertooth fangs
  const fangGeo = new THREE.ConeGeometry(0.026, 0.14, 6);
  const leftFang = new THREE.Mesh(fangGeo, fangMat);
  leftFang.position.set(-0.055, -0.14, 0.22);
  leftFang.rotation.x = Math.PI;
  headGroup.add(leftFang);

  const rightFang = new THREE.Mesh(fangGeo, fangMat);
  rightFang.position.set(0.055, -0.14, 0.22);
  rightFang.rotation.x = Math.PI;
  headGroup.add(rightFang);

  // Glowing Eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: eyeHex,
    emissive: eyeHex,
    emissiveIntensity: 2.0,
    roughness: 0.15,
  });
  const eyeGeo = new THREE.BoxGeometry(0.06, 0.028, 0.04);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.075, 0.03, 0.19);
  leftEye.rotation.z = -0.22;
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.075, 0.03, 0.19);
  rightEye.rotation.z = 0.22;
  headGroup.add(rightEye);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.065, 0.16, 4);
  const leftEar = new THREE.Mesh(earGeo, furMat);
  leftEar.position.set(-0.14, 0.2, -0.02);
  leftEar.rotation.z = 0.35;
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, furMat);
  rightEar.position.set(0.14, 0.2, -0.02);
  rightEar.rotation.z = -0.35;
  headGroup.add(rightEar);

  // 3. Jax / Kai-Jax Flowing Storm Mane
  const maneSpikes: THREE.Mesh[] = [];
  if (isJax || isFused) {
    const spikeMat = new THREE.MeshStandardMaterial({
      color: isJax ? 0x161c28 : 0x221c35,
      emissive: isJax ? 0x2563eb : 0x38bdf8,
      emissiveIntensity: isJax ? 0.55 : 0.75,
      roughness: 0.45,
      metalness: 0.2,
    });
    for (let i = 0; i < 7; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.32, 5), spikeMat);
      const angle = ((i - 3) / 3) * 0.75;
      spike.position.set(Math.sin(angle) * 0.18, 0.14 - Math.abs(i - 3) * 0.04, -0.15);
      spike.rotation.x = -0.85;
      spike.rotation.z = -angle * 0.8;
      headGroup.add(spike);
      maneSpikes.push(spike);
    }
  }

  // 4. Arms & Gauntlets
  const makeLimb = (isArm: boolean, side: -1 | 1) => {
    const g = new THREE.Group();
    if (isArm) {
      g.position.set(side * 0.31 * torsoScale, 0.48, 0);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.32, 7), furMat);
      upper.position.y = -0.14;
      upper.castShadow = true;
      g.add(upper);

      const gauntlet = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.28, 0.14),
        isJax ? trimMaterial : clothMat
      );
      gauntlet.position.y = -0.4;
      gauntlet.castShadow = true;
      g.add(gauntlet);

      const clawAccent = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.06, 0.16),
        energyMaterial
      );
      clawAccent.position.set(0, -0.52, 0.03);
      g.add(clawAccent);
    } else {
      g.position.set(side * 0.14 * torsoScale, 0, 0);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.075, 0.44, 7), clothMat);
      thigh.position.y = -0.22;
      thigh.castShadow = true;
      g.add(thigh);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.062, 0.42, 7), trimMaterial);
      shin.position.y = -0.62;
      shin.castShadow = true;
      g.add(shin);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.22), clothMat);
      boot.position.set(0, -0.86, 0.04);
      boot.castShadow = true;
      g.add(boot);
    }
    bodyGroup.add(g);
    return g;
  };

  const leftArm = makeLimb(true, -1);
  const rightArm = makeLimb(true, 1);
  const leftLeg = makeLimb(false, -1);
  const rightLeg = makeLimb(false, 1);

  // 5. Kai & Kai-Jax: 4 Articulated Spider Limbs
  const spiderLimbs: THREE.Group[] = [];
  if (isKai || isFused) {
    const limbMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.82,
      roughness: 0.25,
    });
    const tipMat = new THREE.MeshStandardMaterial({
      color: isKai ? 0xf97316 : 0x8b5cf6,
      emissive: isKai ? 0xf97316 : 0xa855f7,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });
    const configs: [number, number, number][] = [
      [-0.14, 0.44, -0.14], // Upper Left
      [0.14, 0.44, -0.14],  // Upper Right
      [-0.16, 0.26, -0.15], // Lower Left
      [0.16, 0.26, -0.15],  // Lower Right
    ];
    configs.forEach(([px, py, pz], idx) => {
      const side = idx % 2 === 0 ? -1 : 1;
      const isUpper = idx < 2;
      const limbPivot = new THREE.Group();
      limbPivot.position.set(px, py, pz);

      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.025, 0.48, 6), limbMat);
      seg1.position.set(side * 0.2, isUpper ? 0.2 : 0.05, -0.16);
      seg1.rotation.z = side * (isUpper ? -0.68 : -1.05);
      seg1.rotation.x = -0.45;
      seg1.castShadow = true;
      limbPivot.add(seg1);

      const seg2 = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.56, 6), tipMat);
      seg2.position.set(side * 0.46, isUpper ? 0.26 : -0.02, -0.04);
      seg2.rotation.z = side * (isUpper ? 2.4 : 2.1);
      seg2.rotation.x = 0.55;
      limbPivot.add(seg2);

      bodyGroup.add(limbPivot);
      spiderLimbs.push(limbPivot);
    });
  }

  // 6. KAI-JAX: STRICTLY THREE PRIMARY PHYSICAL TAILS (Ember, Memory, Storm)
  const tails: THREE.Group[] = [];
  if (isFused) {
    const tailColors = [0xf97316, 0x8b5cf6, 0x38bdf8]; // Ember, Memory, Storm
    const tailAngles = [-0.48, 0, 0.48];
    for (let t = 0; t < 3; t++) {
      const tailGroup = new THREE.Group();
      tailGroup.position.set(tailAngles[t] * 0.22, 0.06, -0.18);
      tailGroup.rotation.y = tailAngles[t];
      const tMat = new THREE.MeshStandardMaterial({
        color: tailColors[t],
        emissive: tailColors[t],
        emissiveIntensity: 1.25,
        roughness: 0.3,
        metalness: 0.4,
      });
      // 3-segment curved tail
      for (let s = 0; s < 3; s++) {
        const seg = new THREE.Mesh(
          new THREE.ConeGeometry(0.06 - s * 0.014, 0.42, 6),
          tMat
        );
        seg.position.set(0, 0.1 + s * 0.18, -0.22 - s * 0.32);
        seg.rotation.x = -Math.PI * 0.42 + s * 0.14;
        tailGroup.add(seg);
      }
      bodyGroup.add(tailGroup);
      tails.push(tailGroup);
    }
  }

  // Subtle Ground Energy Ring Aura
  const auraGeo = new THREE.RingGeometry(0.56, 0.68, 28);
  const auraMat = new THREE.MeshBasicMaterial({
    color: energyHex,
    transparent: true,
    opacity: isFused ? 0.65 : 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.rotation.x = -Math.PI / 2;
  auraMesh.position.y = 0.04;
  root.add(auraMesh);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    spiderLimbs,
    maneSpikes,
    tails,
    auraMesh,
    energyMaterial,
    trimMaterial,
  };
}

export function createEnemyRig(
  kind:
    | 'brawler'
    | 'stalker'
    | 'marksman'
    | 'dodger'
    | 'bruiser'
    | 'shield'
    | 'assassin'
    | 'boss',
  contactShadowTex: THREE.Texture
): ArticulatedEnemyRig {
  const root = new THREE.Group();
  const scale =
    kind === 'boss'
      ? 1.65
      : kind === 'bruiser'
        ? 1.28
        : kind === 'shield'
          ? 1.12
          : kind === 'stalker' || kind === 'dodger' || kind === 'assassin'
            ? 0.95
            : 1.05;

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4 * scale, 1.4 * scale),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  root.add(shadow);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.92 * scale;
  bodyGroup.scale.setScalar(scale);
  root.add(bodyGroup);

  // Official Fang Syndicate Faction Dossier Palette (#4A2A7A Syndicate Purple, #2360D1 Venom Blue, #2A2D34 Gunmetal, #E4511E Blood Orange)
  const armorColor =
    kind === 'boss'
      ? 0x2a2d34
      : kind === 'bruiser'
        ? 0x3b231e
        : kind === 'shield'
          ? 0x1e2c44
          : kind === 'assassin'
            ? 0x24133d
            : kind === 'stalker' || kind === 'dodger'
              ? 0x4a2a7a
              : kind === 'marksman'
                ? 0x1e2c44
                : 0x2a2d34;
  const accentColor =
    kind === 'boss'
      ? 0xe4511e
      : kind === 'bruiser'
        ? 0xf97316
        : kind === 'shield'
          ? 0x38bdf8
          : kind === 'assassin'
            ? 0xd946ef
            : kind === 'dodger'
              ? 0xa855f7
              : kind === 'marksman'
                ? 0x2360d1
                : kind === 'stalker'
                  ? 0x9333ea
                  : 0xe4511e;

  const armorMat = new THREE.MeshStandardMaterial({
    color: armorColor,
    roughness: 0.45,
    metalness: 0.65,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    color: 0x0f1117,
    roughness: 0.8,
    metalness: 0.1,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });

  // Torso
  const torsoWidth = kind === 'bruiser' ? 0.64 : 0.52;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth, 0.58, 0.34), armorMat);
  torso.position.y = 0.28;
  torso.castShadow = true;
  bodyGroup.add(torso);

  if (kind === 'boss' || kind === 'bruiser') {
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.38, 8), visorMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.34, 0.04);
    bodyGroup.add(core);
  }

  // Head / Helmet
  const helmet = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), armorMat);
  helmet.position.set(0, 0.72, 0);
  helmet.castShadow = true;
  bodyGroup.add(helmet);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.14), visorMat);
  visor.position.set(0, 0.72, 0.16);
  bodyGroup.add(visor);

  // Arms
  const makeArm = (side: -1 | 1) => {
    const g = new THREE.Group();
    g.position.set(side * (kind === 'bruiser' ? 0.42 : 0.36), 0.48, 0);
    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.54, 0.16), armorMat);
    armMesh.position.y = -0.24;
    armMesh.castShadow = true;
    g.add(armMesh);
    bodyGroup.add(g);
    return g;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // Shielded Defender Riot Energy Shield on leftArm
  if (kind === 'shield') {
    const shieldBarrier = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.96, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.25,
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.78,
      })
    );
    shieldBarrier.name = 'enemy_riot_shield';
    shieldBarrier.position.set(-0.08, -0.22, 0.32);
    leftArm.add(shieldBarrier);
  }

  // Twin off-hand venom blade for Elite Assassin
  if (kind === 'assassin') {
    const offBlade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.52, 4), visorMat);
    offBlade.rotation.x = Math.PI / 2;
    offBlade.position.set(0, -0.48, 0.28);
    leftArm.add(offBlade);
  }

  // Weapon attached to rightArm
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(0, -0.48, 0.12);
  rightArm.add(weaponGroup);

  if (kind === 'boss' || kind === 'bruiser') {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, kind === 'boss' ? 1.35 : 1.05, 8), armorMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.45;
    weaponGroup.add(shaft);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.48), visorMat);
    head.position.z = kind === 'boss' ? 1.05 : 0.85;
    head.castShadow = true;
    weaponGroup.add(head);
  } else if (kind === 'marksman') {
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.75), armorMat);
    barrel.position.z = 0.32;
    weaponGroup.add(barrel);
  } else {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.07, kind === 'assassin' ? 0.56 : 0.48, 4), visorMat);
    blade.rotation.x = Math.PI / 2;
    blade.position.z = 0.25;
    weaponGroup.add(blade);
  }

  // Legs
  const makeLeg = (side: -1 | 1) => {
    const g = new THREE.Group();
    g.position.set(side * 0.16, 0, 0);
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.86, 0.2), clothMat);
    legMesh.position.y = -0.43;
    legMesh.castShadow = true;
    g.add(legMesh);
    bodyGroup.add(g);
    return g;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  // Telegraph ring for Boss / Heavy attacks
  const telegraphRing = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 3.2, 32),
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  telegraphRing.rotation.x = -Math.PI / 2;
  telegraphRing.position.y = 0.06;
  root.add(telegraphRing);

  return {
    root,
    bodyGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponGroup,
    visorMat,
    telegraphRing,
  };
}
