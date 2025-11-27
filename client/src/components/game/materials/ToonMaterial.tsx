import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

const BRIGHT_PALETTES: Record<string, { primary: string; secondary: string; accent: string }> = {
  red: { primary: '#FF4444', secondary: '#CC2222', accent: '#FFAAAA' },
  blue: { primary: '#4488FF', secondary: '#2255CC', accent: '#AACCFF' },
  green: { primary: '#44DD44', secondary: '#22AA22', accent: '#AAFFAA' },
  yellow: { primary: '#FFDD44', secondary: '#CCAA22', accent: '#FFFFAA' },
  purple: { primary: '#AA44FF', secondary: '#7722CC', accent: '#DDAAFF' },
  orange: { primary: '#FF8844', secondary: '#CC5522', accent: '#FFCCAA' },
  pink: { primary: '#FF88CC', secondary: '#CC5599', accent: '#FFCCEE' },
  cyan: { primary: '#44DDFF', secondary: '#22AACC', accent: '#AAFFFF' },
  brown: { primary: '#AA7744', secondary: '#775522', accent: '#DDAA88' },
  gray: { primary: '#888888', secondary: '#555555', accent: '#CCCCCC' },
  white: { primary: '#FFFFFF', secondary: '#CCCCCC', accent: '#FFFFFF' },
  black: { primary: '#444444', secondary: '#222222', accent: '#888888' },
  gold: { primary: '#FFD700', secondary: '#B8860B', accent: '#FFF8DC' },
  silver: { primary: '#C0C0C0', secondary: '#808080', accent: '#E8E8E8' },
};

export function normalizeToBrightColor(inputColor: string): string {
  const color = new THREE.Color(inputColor);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  
  hsl.s = Math.max(0.6, Math.min(0.9, hsl.s * 1.3));
  hsl.l = Math.max(0.45, Math.min(0.65, hsl.l));
  
  color.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + color.getHexString();
}

export function createToonMaterial(baseColor: string, options?: {
  rimColor?: string;
  rimPower?: number;
  steps?: number;
}): THREE.MeshToonMaterial {
  const normalizedColor = normalizeToBrightColor(baseColor);
  
  const gradientSteps = options?.steps || 4;
  const gradientData = new Uint8Array(gradientSteps);
  for (let i = 0; i < gradientSteps; i++) {
    gradientData[i] = Math.floor((i / (gradientSteps - 1)) * 255 * 0.6 + 255 * 0.4);
  }
  
  const gradientMap = new THREE.DataTexture(
    gradientData,
    gradientSteps,
    1,
    THREE.RedFormat
  );
  gradientMap.needsUpdate = true;
  
  const material = new THREE.MeshToonMaterial({
    color: normalizedColor,
    gradientMap: gradientMap,
  });
  
  return material;
}

export function createOutlineMaterial(color: string = '#000000', thickness: number = 0.03): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      outlineColor: { value: new THREE.Color(color) },
      outlineThickness: { value: thickness },
    },
    vertexShader: `
      uniform float outlineThickness;
      void main() {
        vec3 pos = position + normal * outlineThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 outlineColor;
      void main() {
        gl_FragColor = vec4(outlineColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
}

export const RimLightShaderMaterial = shaderMaterial(
  {
    baseColor: new THREE.Color('#FFFFFF'),
    rimColor: new THREE.Color('#88CCFF'),
    rimPower: 2.0,
    rimStrength: 0.6,
    lightDirection: new THREE.Vector3(1, 1, 1).normalize(),
    time: 0,
  },
  `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vUv = uv;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform vec3 baseColor;
    uniform vec3 rimColor;
    uniform float rimPower;
    uniform float rimStrength;
    uniform vec3 lightDirection;
    uniform float time;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Toon shading with 3 steps
      float NdotL = dot(normal, lightDirection);
      float toonShade = smoothstep(-0.1, 0.1, NdotL) * 0.5 + 0.5;
      toonShade = floor(toonShade * 3.0) / 3.0;
      
      // Rim lighting
      float rim = 1.0 - max(0.0, dot(viewDir, normal));
      rim = pow(rim, rimPower);
      
      // Combine
      vec3 finalColor = baseColor * toonShade;
      finalColor += rimColor * rim * rimStrength;
      
      // Subtle animation pulse
      float pulse = 0.95 + 0.05 * sin(time * 2.0);
      finalColor *= pulse;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ RimLightShaderMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      rimLightShaderMaterial: any;
    }
  }
}

export function applyToonShadingToModel(
  scene: THREE.Group,
  primaryColor: string,
  accentColor?: string
): void {
  const normalizedPrimary = normalizeToBrightColor(primaryColor);
  const normalizedAccent = accentColor ? normalizeToBrightColor(accentColor) : normalizedPrimary;
  
  const gradientData = new Uint8Array([100, 150, 200, 255]);
  const gradientMap = new THREE.DataTexture(gradientData, 4, 1, THREE.RedFormat);
  gradientMap.needsUpdate = true;
  
  let meshIndex = 0;
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const useAccent = meshIndex % 3 === 0;
      const color = useAccent ? normalizedAccent : normalizedPrimary;
      
      const toonMaterial = new THREE.MeshToonMaterial({
        color: color,
        gradientMap: gradientMap,
        emissive: new THREE.Color(color).multiplyScalar(0.1),
        emissiveIntensity: 0.3,
      });
      
      child.material = toonMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
      
      meshIndex++;
    }
  });
}

export function createCharacterLighting(): {
  ambient: { intensity: number; color: string };
  key: { position: [number, number, number]; intensity: number; color: string };
  fill: { position: [number, number, number]; intensity: number; color: string };
  rim: { position: [number, number, number]; intensity: number; color: string };
} {
  return {
    ambient: { intensity: 0.4, color: '#FFFFFF' },
    key: { position: [5, 10, 5], intensity: 1.2, color: '#FFFAF0' },
    fill: { position: [-5, 5, 3], intensity: 0.5, color: '#E6F0FF' },
    rim: { position: [0, 8, -5], intensity: 0.8, color: '#88CCFF' },
  };
}
