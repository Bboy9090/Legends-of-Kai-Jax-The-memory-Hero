/**
 * Character PBR Shader with Phase-Driven Emissive and Rim Highlights
 * Studio-quality material for Kai-Jax and enemies
 */

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Vertex Shader
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment Shader with PBR, Emissive Pulse, and Rim Lighting
const fragmentShader = `
  uniform vec3 uBaseColor;
  uniform vec3 uEmissiveColor;
  uniform float uEmissiveIntensity;
  uniform float uRoughness;
  uniform float uMetalness;
  uniform float uPhase; // 0-1 animation phase
  uniform float uPulseSpeed;
  uniform float uPulseIntensity;
  uniform vec3 uRimColor;
  uniform float uRimPower;
  uniform float uRimIntensity;
  uniform float uTime;
  uniform float uDamageFlash;
  uniform float uBlockFlash;
  uniform sampler2D uAlbedoMap;
  uniform sampler2D uNormalMap;
  uniform sampler2D uORMMap; // Occlusion, Roughness, Metalness packed
  uniform sampler2D uEmissiveMask;
  uniform bool uUseTextures;
  uniform vec3 uLightPosition;
  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  uniform vec3 uAmbientLight;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  // Fresnel Schlick approximation
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }
  
  // GGX Distribution
  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265 * denom * denom;
    
    return num / denom;
  }
  
  // Geometry Smith
  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    
    float ggx1 = NdotV / (NdotV * (1.0 - k) + k);
    float ggx2 = NdotL / (NdotL * (1.0 - k) + k);
    
    return ggx1 * ggx2;
  }
  
  void main() {
    // Sample textures or use uniforms
    vec3 albedo = uBaseColor;
    float ao = 1.0;
    float roughness = uRoughness;
    float metalness = uMetalness;
    vec3 emissiveMask = vec3(1.0);
    
    if (uUseTextures) {
      albedo = texture2D(uAlbedoMap, vUv).rgb * uBaseColor;
      vec3 orm = texture2D(uORMMap, vUv).rgb;
      ao = orm.r;
      roughness = orm.g * uRoughness;
      metalness = orm.b * uMetalness;
      emissiveMask = texture2D(uEmissiveMask, vUv).rgb;
    }
    
    // Normal
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    
    // Light direction
    vec3 L = normalize(uLightPosition - vWorldPosition);
    vec3 H = normalize(V + L);
    
    // PBR calculations
    vec3 F0 = mix(vec3(0.04), albedo, metalness);
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    vec3 kD = (vec3(1.0) - F) * (1.0 - metalness);
    float NdotL = max(dot(N, L), 0.0);
    
    // Direct lighting
    vec3 Lo = (kD * albedo / 3.14159265 + specular) * uLightColor * uLightIntensity * NdotL;
    
    // Ambient with AO
    vec3 ambient = uAmbientLight * albedo * ao;
    
    // Phase-driven emissive pulse
    float pulse = sin(uTime * uPulseSpeed + uPhase * 6.28318) * 0.5 + 0.5;
    pulse = pow(pulse, 2.0) * uPulseIntensity;
    vec3 emissive = uEmissiveColor * uEmissiveIntensity * emissiveMask * (1.0 + pulse);
    
    // Rim lighting
    float rim = 1.0 - max(dot(V, N), 0.0);
    rim = pow(rim, uRimPower);
    vec3 rimLight = uRimColor * rim * uRimIntensity;
    
    // Damage flash (red pulse)
    vec3 damageColor = vec3(1.0, 0.2, 0.1) * uDamageFlash * 2.0;
    
    // Block flash (blue pulse)
    vec3 blockColor = vec3(0.3, 0.7, 1.0) * uBlockFlash * 1.5;
    
    // Final color
    vec3 color = ambient + Lo + emissive + rimLight + damageColor + blockColor;
    
    // Tone mapping (ACES approximation)
    color = color / (color + vec3(1.0));
    
    // Gamma correction
    color = pow(color, vec3(1.0 / 2.2));
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Create the custom material
const CharacterMaterial = shaderMaterial(
  {
    // Base PBR
    uBaseColor: new THREE.Color('#FFD60A'),
    uRoughness: 0.4,
    uMetalness: 0.1,
    
    // Emissive
    uEmissiveColor: new THREE.Color('#FFD60A'),
    uEmissiveIntensity: 0.5,
    uPhase: 0,
    uPulseSpeed: 2.0,
    uPulseIntensity: 0.3,
    
    // Rim
    uRimColor: new THREE.Color('#FFFFFF'),
    uRimPower: 3.0,
    uRimIntensity: 0.4,
    
    // Time and effects
    uTime: 0,
    uDamageFlash: 0,
    uBlockFlash: 0,
    
    // Textures
    uAlbedoMap: null,
    uNormalMap: null,
    uORMMap: null,
    uEmissiveMask: null,
    uUseTextures: false,
    
    // Lighting
    uLightPosition: new THREE.Vector3(5, 10, 5),
    uLightColor: new THREE.Color('#FFFFFF'),
    uLightIntensity: 2.0,
    uAmbientLight: new THREE.Color('#1a1a2e'),
  },
  vertexShader,
  fragmentShader
);

// Extend for JSX usage
extend({ CharacterMaterial });

export { CharacterMaterial, vertexShader, fragmentShader };
export default CharacterMaterial;
