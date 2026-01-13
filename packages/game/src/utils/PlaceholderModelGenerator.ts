// Character Model Placeholder Generator
// Path: packages/game/src/utils/PlaceholderModelGenerator.ts

import * as THREE from 'three';

/**
 * Generate placeholder 3D character models for testing
 * These are geometric stand-ins that can be replaced with AI-generated models later
 */

interface PlaceholderCharacterConfig {
  id: string;
  bodyColor: string;
  headColor: string;
  accentColor: string;
  specialFeatures?: 'tails' | 'cape' | 'armor' | 'wings' | 'none';
}

/**
 * Create a placeholder character model
 */
export function createPlaceholderCharacter(config: PlaceholderCharacterConfig): THREE.Group {
  const character = new THREE.Group();
  character.name = config.id;

  // Body (sphere)
  const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: config.bodyColor,
    emissive: 0x111111,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  character.add(body);

  // Head (smaller sphere)
  const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const headMaterial = new THREE.MeshPhongMaterial({
    color: config.headColor,
    emissive: 0x111111,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.0;
  head.castShadow = true;
  head.receiveShadow = true;
  character.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const eyeMaterial = new THREE.MeshPhongMaterial({
    color: config.accentColor,
    emissive: config.accentColor,
  });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.12, 1.15, 0.28);
  character.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.12, 1.15, 0.28);
  character.add(rightEye);

  // Arms (capsules)
  const armGeometry = new THREE.CapsuleGeometry(0.12, 0.6, 8, 8);
  const armMaterial = new THREE.MeshPhongMaterial({
    color: config.bodyColor,
    emissive: 0x111111,
  });

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.5, 0.7, 0);
  leftArm.rotation.z = Math.PI / 6;
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  character.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.5, 0.7, 0);
  rightArm.rotation.z = -Math.PI / 6;
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  character.add(rightArm);

  // Legs (capsules)
  const legGeometry = new THREE.CapsuleGeometry(0.15, 0.8, 8, 8);
  
  const leftLeg = new THREE.Mesh(legGeometry, armMaterial);
  leftLeg.position.set(-0.25, 0, 0);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  character.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, armMaterial);
  rightLeg.position.set(0.25, 0, 0);
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  character.add(rightLeg);

  // Special features
  if (config.specialFeatures) {
    addSpecialFeatures(character, config.specialFeatures, config.accentColor);
  }

  // Set origin to ground
  character.position.y = 0;
  
  return character;
}

/**
 * Add special features to character (tails, cape, armor, etc.)
 */
function addSpecialFeatures(
  character: THREE.Group,
  feature: 'tails' | 'cape' | 'armor' | 'wings',
  color: string
): void {
  const material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: 0x111111,
  });

  switch (feature) {
    case 'tails': {
      // Create 3 flowing tails
      for (let i = 0; i < 3; i++) {
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.8, 8);
        const tail = new THREE.Mesh(tailGeometry, material);
        tail.position.set(
          Math.sin((i - 1) * 0.3) * 0.3,
          0.3,
          -0.4 - i * 0.2
        );
        tail.rotation.z = (i - 1) * 0.2;
        tail.castShadow = true;
        character.add(tail);
      }
      break;
    }
    case 'cape': {
      // Create a cape plane
      const capeGeometry = new THREE.PlaneGeometry(0.8, 1.0);
      const capeMaterial = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        emissive: 0x111111,
      });
      const cape = new THREE.Mesh(capeGeometry, capeMaterial);
      cape.position.set(0, 0.6, -0.5);
      cape.castShadow = true;
      character.add(cape);
      break;
    }
    case 'armor': {
      // Add armor plates on shoulders/chest
      const armorGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.2);
      
      const leftArmor = new THREE.Mesh(armorGeometry, material);
      leftArmor.position.set(-0.4, 0.8, 0.1);
      leftArmor.castShadow = true;
      character.add(leftArmor);

      const rightArmor = new THREE.Mesh(armorGeometry, material);
      rightArmor.position.set(0.4, 0.8, 0.1);
      rightArmor.castShadow = true;
      character.add(rightArmor);

      const chestArmor = new THREE.Mesh(armorGeometry, material);
      chestArmor.position.set(0, 0.7, 0.15);
      chestArmor.castShadow = true;
      character.add(chestArmor);
      break;
    }
    case 'wings': {
      // Add wing planes
      const wingGeometry = new THREE.PlaneGeometry(0.4, 0.6);
      const wingMaterial = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        emissive: 0x111111,
      });

      const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
      leftWing.position.set(-0.5, 0.6, 0);
      leftWing.rotation.y = Math.PI / 6;
      leftWing.castShadow = true;
      character.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
      rightWing.position.set(0.5, 0.6, 0);
      rightWing.rotation.y = -Math.PI / 6;
      rightWing.castShadow = true;
      character.add(rightWing);
      break;
    }
  }
}

/**
 * Create all 6 Genesis placeholder characters
 */
export function createAllPlaceholderCharacters(): Map<string, THREE.Group> {
  const characters = new Map<string, THREE.Group>();

  // Kai-Jax: Compact sphere body, 3 tails
  characters.set('kai-jax', createPlaceholderCharacter({
    id: 'kai-jax',
    bodyColor: '#1a1a1a',
    headColor: '#1a1a1a',
    accentColor: '#ffd700',
    specialFeatures: 'tails',
  }));

  // Lunara Solis: Elegant body, cape (represents robes)
  characters.set('lunara-solis', createPlaceholderCharacter({
    id: 'lunara-solis',
    bodyColor: '#c0c0c0',
    headColor: '#ffd700',
    accentColor: '#00ffff',
    specialFeatures: 'cape',
  }));

  // Umbra-Flux: White/metallic body, tails
  characters.set('umbra-flux', createPlaceholderCharacter({
    id: 'umbra-flux',
    bodyColor: '#f0f0f0',
    headColor: '#f0f0f0',
    accentColor: '#3399ff',
    specialFeatures: 'tails',
  }));

  // Boryx Zenith: Brown body, armor
  characters.set('boryx-zenith', createPlaceholderCharacter({
    id: 'boryx-zenith',
    bodyColor: '#5c4033',
    headColor: '#5c4033',
    accentColor: '#ffaa00',
    specialFeatures: 'armor',
  }));

  // Sentinel Vox: Orange body, wings (represents energy blades)
  characters.set('sentinel-vox', createPlaceholderCharacter({
    id: 'sentinel-vox',
    bodyColor: '#ff6600',
    headColor: '#ff6600',
    accentColor: '#3399ff',
    specialFeatures: 'wings',
  }));

  // Kiro Kong: Brown body, armor (stone plates)
  characters.set('kiro-kong', createPlaceholderCharacter({
    id: 'kiro-kong',
    bodyColor: '#3d2817',
    headColor: '#3d2817',
    accentColor: '#808080',
    specialFeatures: 'armor',
  }));

  return characters;
}
