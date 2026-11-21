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
        ? 1.30
        : kind === 'shield'
          ? 1.14
          : kind === 'stalker' || kind === 'dodger' || kind === 'assassin'
            ? 0.96
            : 1.06;

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.45 * scale, 1.45 * scale),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.74,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  root.add(shadow);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.92 * scale;
  bodyGroup.scale.setScalar(scale);
  root.add(bodyGroup);

  // Official Fang Syndicate Faction Dossier Palette (5c371ed9.png):
  // #4A2A7A Syndicate Purple, #2360D1 Venom Blue, #2A2D34 Gunmetal, #C7C3BB Bone Grey, #E4511E Blood Orange
  const furColor =
    kind === 'bruiser'
      ? 0xc7c3bb // Scarred bone-grey Chain Bruiser fur
      : kind === 'boss'
        ? 0x786d60 // District Lieutenant / Ironjaw lion-brute fur
        : kind === 'stalker' || kind === 'assassin'
          ? 0x262330 // Dark tunnel predator fur
          : kind === 'dodger' || kind === 'marksman'
            ? 0x5c534a // Razor Scout tawny-ash jackal fur
            : 0x6e5b4b; // Spotted/scarred hyena Enforcer fur

  const armorColor =
    kind === 'boss'
      ? 0x262338
      : kind === 'bruiser'
        ? 0x2a2d34
        : kind === 'shield'
          ? 0x1d2b44
          : kind === 'assassin'
            ? 0x24133d
            : kind === 'stalker' || kind === 'dodger'
              ? 0x4a2a7a
              : kind === 'marksman'
                ? 0x1e2d4a
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

  const furMat = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.84,
    metalness: 0.06,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: armorColor,
    roughness: 0.42,
    metalness: 0.68,
  });
  const syndicateClothMat = new THREE.MeshStandardMaterial({
    color: 0x4a2a7a,
    roughness: 0.76,
    metalness: 0.12,
  });
  const darkPantsMat = new THREE.MeshStandardMaterial({
    color: 0x161821,
    roughness: 0.78,
    metalness: 0.14,
  });
  const boneSpikeMat = new THREE.MeshStandardMaterial({
    color: 0xe5e0d5,
    roughness: 0.28,
    metalness: 0.22,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.85,
    roughness: 0.2,
  });

  const isHeavy = kind === 'bruiser' || kind === 'boss';
  const isAgile = kind === 'stalker' || kind === 'dodger' || kind === 'assassin';
  const chestW = isHeavy ? 0.34 : isAgile ? 0.24 : 0.28;

  // 1. Hunched V-Tapered Beast Torso + Syndicate Chest Harness
  const upperTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(chestW, chestW * 0.74, 0.56, 8),
    armorMat
  );
  upperTorso.position.set(0, 0.29, isAgile ? 0.04 : 0.01);
  upperTorso.rotation.x = isAgile ? 0.18 : 0.08;
  upperTorso.scale.set(1.12, 1.0, 0.82);
  upperTorso.castShadow = true;
  bodyGroup.add(upperTorso);

  const pelvisBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(chestW * 0.74, chestW * 0.78, 0.22, 8),
    darkPantsMat
  );
  pelvisBlock.position.set(0, -0.02, 0);
  pelvisBlock.scale.set(1.08, 1.0, 0.84);
  bodyGroup.add(pelvisBlock);

  // Tattered Syndicate Waist Banner & Spiked Belt
  const beltRing = new THREE.Mesh(
    new THREE.CylinderGeometry(chestW * 0.82, chestW * 0.82, 0.09, 8),
    syndicateClothMat
  );
  beltRing.position.set(0, 0.04, 0);
  beltRing.scale.set(1.1, 1.0, 0.88);
  bodyGroup.add(beltRing);

  const tatteredSash = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.44, 4),
    syndicateClothMat
  );
  tatteredSash.position.set(0.06, -0.18, chestW * 0.72);
  tatteredSash.rotation.x = Math.PI;
  tatteredSash.scale.set(1.0, 1.0, 0.24);
  bodyGroup.add(tatteredSash);

  if (isHeavy) {
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), visorMat);
    core.position.set(0, 0.34, chestW * 0.82);
    bodyGroup.add(core);
  }

  // 2. Snarling Lupine / Hyena / Brute Beast Head + Snout + Fangs + Dorsal Mane Bristles
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.67, isAgile ? 0.10 : 0.05);
  bodyGroup.add(headPivot);

  const cranium = new THREE.Mesh(new THREE.DodecahedronGeometry(0.21, 1), furMat);
  cranium.scale.set(1.02, 0.96, 1.12);
  cranium.castShadow = true;
  headPivot.add(cranium);

  // Snarling elongated lupine/hyena muzzle
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.115, 0.22, 6), furMat);
  snout.rotation.x = Math.PI * 0.46;
  snout.position.set(0, -0.04, 0.19);
  headPivot.add(snout);

  // Lower jaw + twin syndicate fangs
  const fangGeo = new THREE.ConeGeometry(0.022, 0.10, 5);
  for (const s of [-1, 1]) {
    const fang = new THREE.Mesh(fangGeo, boneSpikeMat);
    fang.position.set(s * 0.048, -0.10, 0.24);
    fang.rotation.x = Math.PI;
    headPivot.add(fang);

    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.058, 0.18, 4), furMat);
    ear.position.set(s * 0.13, 0.19, -0.03);
    ear.rotation.z = -s * 0.32;
    ear.rotation.x = -0.18;
    headPivot.add(ear);

    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.026, 0.04), visorMat);
    eye.position.set(s * 0.075, 0.035, 0.175);
    eye.rotation.z = s * 0.22;
    headPivot.add(eye);
  }

  // Dorsal Syndicate Purple Mane Crest / Hood Cowl
  if (isAgile || kind === 'marksman') {
    const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.30, 6), syndicateClothMat);
    cowl.position.set(0, 0.08, -0.05);
    cowl.rotation.x = -0.35;
    headPivot.add(cowl);
  } else {
    for (let m = 0; m < 3; m++) {
      const bristle = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 4), syndicateClothMat);
      bristle.position.set(0, 0.16 - m * 0.09, -0.12 - m * 0.05);
      bristle.rotation.x = -0.95 - m * 0.18;
      headPivot.add(bristle);
    }
  }

  // 3. Muscular Beast Arms + Spiked Syndicate Pauldrons + Chain-Wrapped Gauntlets
  const makeArm = (side: -1 | 1) => {
    const g = new THREE.Group();
    g.position.set(side * (chestW + 0.10), 0.49, 0);

    // Spiked shoulder pauldron
    const pauldron = new THREE.Mesh(new THREE.DodecahedronGeometry(isHeavy ? 0.14 : 0.11, 0), armorMat);
    pauldron.position.set(side * 0.03, 0.02, 0);
    pauldron.scale.set(1.15, 0.85, 1.1);
    g.add(pauldron);

    if (side === 1 || isHeavy) {
      const pSpike = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 4), boneSpikeMat);
      pSpike.position.set(side * 0.08, 0.11, 0);
      pSpike.rotation.z = -side * 0.48;
      g.add(pSpike);
    }

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(isHeavy ? 0.095 : 0.072, isHeavy ? 0.082 : 0.062, 0.28, 7),
      furMat
    );
    upperArm.position.y = -0.14;
    upperArm.castShadow = true;
    g.add(upperArm);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(isHeavy ? 0.105 : 0.076, isHeavy ? 0.088 : 0.065, 0.30, 7),
      armorMat
    );
    forearm.position.set(0, -0.38, 0.03);
    forearm.rotation.x = 0.18;
    forearm.castShadow = true;
    g.add(forearm);

    // Heavy chain-restraint rings on Bruiser / Boss / Enforcer forearms
    if (isHeavy || kind === 'brawler') {
      for (let r = 0; r < 2; r++) {
        const chainRing = new THREE.Mesh(
          new THREE.TorusGeometry(isHeavy ? 0.108 : 0.082, 0.016, 5, 10),
          boneSpikeMat
        );
        chainRing.rotation.x = Math.PI / 2;
        chainRing.position.set(0, -0.32 - r * 0.11, 0.03);
        g.add(chainRing);
      }
    }

    bodyGroup.add(g);
    return g;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // Shielded Defender Riot Energy Shield on leftArm (name preserved for combat engine)
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
    const offBlade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.54, 4), visorMat);
    offBlade.rotation.x = Math.PI / 2;
    offBlade.position.set(0, -0.48, 0.28);
    leftArm.add(offBlade);
  }

  // 4. Syndicate Street Weapons attached to rightArm
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(0, -0.48, 0.12);
  rightArm.add(weaponGroup);

  if (kind === 'boss' || kind === 'bruiser') {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, kind === 'boss' ? 1.35 : 1.08, 8),
      armorMat
    );
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.45;
    weaponGroup.add(shaft);
    const maulHead = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 6), armorMat);
    maulHead.rotation.z = Math.PI / 2;
    maulHead.position.z = kind === 'boss' ? 1.05 : 0.86;
    maulHead.castShadow = true;
    weaponGroup.add(maulHead);
    const glowBand = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.10, 6), visorMat);
    glowBand.rotation.z = Math.PI / 2;
    glowBand.position.z = kind === 'boss' ? 1.05 : 0.86;
    weaponGroup.add(glowBand);
  } else if (kind === 'marksman') {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.78, 8), armorMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.34;
    weaponGroup.add(barrel);
    const muzzleCore = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.18, 6), visorMat);
    muzzleCore.rotation.x = Math.PI / 2;
    muzzleCore.position.z = 0.68;
    weaponGroup.add(muzzleCore);
  } else {
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.22, 6), armorMat);
    hilt.rotation.x = Math.PI / 2;
    hilt.position.z = 0.04;
    weaponGroup.add(hilt);
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.068, kind === 'assassin' ? 0.58 : 0.50, 4),
      visorMat
    );
    blade.rotation.x = Math.PI / 2;
    blade.position.z = 0.30;
    blade.scale.set(0.55, 1.0, 1.0);
    weaponGroup.add(blade);
  }

  // 5. Tapered Armored Beast Legs & Clawed Street Boots
  const makeLeg = (side: -1 | 1) => {
    const g = new THREE.Group();
    g.position.set(side * (isHeavy ? 0.18 : 0.15), 0, 0);

    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.082, 0.44, 7),
      darkPantsMat
    );
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    g.add(thigh);

    const shin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.084, 0.068, 0.42, 7),
      armorMat
    );
    shin.position.set(0, -0.60, -0.02);
    shin.castShadow = true;
    g.add(shin);

    const boot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.095, 0.12, 6),
      armorMat
    );
    boot.position.set(0, -0.85, 0.04);
    boot.scale.set(0.95, 1.0, 1.45);
    boot.castShadow = true;
    g.add(boot);

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
