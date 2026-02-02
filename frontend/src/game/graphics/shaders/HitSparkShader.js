/**
 * Hit Spark Particle Shader
 * Three contrast profiles for readability
 */

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const vertexShader = `
  attribute float aSize;
  attribute float aLife;
  attribute vec3 aVelocity;
  attribute vec3 aColor;
  
  uniform float uTime;
  uniform float uStartTime;
  uniform float uScale;
  
  varying float vLife;
  varying vec3 vColor;
  
  void main() {
    float elapsed = uTime - uStartTime;
    float life = aLife - elapsed;
    vLife = clamp(life / aLife, 0.0, 1.0);
    vColor = aColor;
    
    // Apply velocity with gravity
    vec3 pos = position + aVelocity * elapsed;
    pos.y -= 4.9 * elapsed * elapsed; // Gravity
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation
    float size = aSize * uScale * vLife;
    gl_PointSize = size * (300.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uCoreColor;
  uniform vec3 uGlowColor;
  uniform float uEmissiveIntensity;
  
  varying float vLife;
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Core to glow gradient
    float core = 1.0 - smoothstep(0.0, 0.2, dist);
    float glow = 1.0 - smoothstep(0.2, 0.5, dist);
    
    vec3 color = mix(uGlowColor, uCoreColor, core) * vColor;
    color *= uEmissiveIntensity;
    
    // Fade with life
    float alpha = glow * vLife;
    
    // HDR bloom compatible
    gl_FragColor = vec4(color, alpha);
  }
`;

const HitSparkMaterial = shaderMaterial(
  {
    uTime: 0,
    uStartTime: 0,
    uScale: 1.0,
    uCoreColor: new THREE.Color('#FFFFFF'),
    uGlowColor: new THREE.Color('#FFD60A'),
    uEmissiveIntensity: 3.0,
  },
  vertexShader,
  fragmentShader
);

extend({ HitSparkMaterial });

export { HitSparkMaterial };
export default HitSparkMaterial;
