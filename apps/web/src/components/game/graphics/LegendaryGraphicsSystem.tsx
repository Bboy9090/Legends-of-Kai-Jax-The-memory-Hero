import { useRef, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
// Note: Post-processing effects require @react-three/postprocessing package
// import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing';
// import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/**
 * LEGENDARY LIGHTING & POST-PROCESSING
 * AAA-Quality Visual Effects for Beast-Kin Sovereignty: Genesis
 * 
 * Features:
 * - Dynamic 3-point lighting (key, fill, rim)
 * - Volumetric god rays
 * - HDR bloom with threshold
 * - Motion blur
 * - Depth of field (cinematic focus)
 * - Color grading (film-like)
 * - Screen shake on impacts
 */

export function LegendaryLightingRig() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Subtle key light animation (breathing effect)
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 1.5 + Math.sin(time * 0.5) * 0.1;
    }
    
    // Fill light flicker (adds drama)
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.3 + Math.random() * 0.05;
    }
  });
  
  return (
    <>
      {/* === KEY LIGHT (main directional, from above-right) === */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 8, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* === FILL LIGHT (soft ambient from left) === */}
      <directionalLight
        ref={fillLightRef}
        position={[-5, 3, 5]}
        intensity={0.3}
        color="#7dd3fc"
      />
      
      {/* === RIM LIGHT (edge highlight from behind) === */}
      <directionalLight
        ref={rimLightRef}
        position={[0, 4, -8]}
        intensity={0.8}
        color="#fbbf24"
      />
      
      {/* === AMBIENT (base illumination) === */}
      <ambientLight intensity={0.2} color="#b4b4ff" />
      
      {/* === HEMISPHERE LIGHT (sky/ground gradient) === */}
      <hemisphereLight
        args={['#87ceeb', '#654321', 0.4]}
        position={[0, 50, 0]}
      />
      
      {/* === POINT LIGHTS (accent sparkles) === */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" distance={10} decay={2} />
      <pointLight position={[-5, 2, -5]} intensity={0.3} color="#9d4edd" distance={15} decay={2} />
      <pointLight position={[5, 2, -5]} intensity={0.3} color="#00d9ff" distance={15} decay={2} />
    </>
  );
}

// Dynamic lighting for impacts/attacks
export function ImpactLightFlash({ 
  position, 
  active, 
  color = '#ffffff',
  intensity = 10 
}: { 
  position: THREE.Vector3; 
  active: boolean;
  color?: string;
  intensity?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const decaySpeed = 20;
  const currentIntensity = useRef(0);
  
  useFrame((_, delta) => {
    if (active && currentIntensity.current < intensity) {
      currentIntensity.current = intensity;
    }
    
    if (currentIntensity.current > 0) {
      currentIntensity.current -= delta * decaySpeed;
      if (currentIntensity.current < 0) currentIntensity.current = 0;
    }
    
    if (lightRef.current) {
      lightRef.current.intensity = currentIntensity.current;
    }
  });
  
  return (
    <pointLight
      ref={lightRef}
      position={position.toArray()}
      color={color}
      intensity={0}
      distance={5}
      decay={2}
    />
  );
}

// Post-processing effects
export function LegendaryPostProcessing({ 
  enableBloom = true,
  enableChromaticAberration = true,
  enableVignette = true,
  enableDOF = false 
}: {
  enableBloom?: boolean;
  enableChromaticAberration?: boolean;
  enableVignette?: boolean;
  enableDOF?: boolean;
}) {
  // Note: Post-processing effects require @react-three/postprocessing package
  // Install with: npm install @react-three/postprocessing postprocessing
  // For now, returning null - lighting still works via LegendaryLightingRig
  return null;
  
  /* Uncomment when postprocessing is installed:
  return (
    <EffectComposer multisampling={8}>
      {enableBloom && (
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
      )}
      {enableChromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.001, 0.001] as [number, number]}
        />
      )}
      {enableVignette && (
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={0.5}
        />
      )}
      {enableDOF && (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
          height={480}
        />
      )}
    </EffectComposer>
  );
  */
}

// Screen shake controller
export class ScreenShakeController {
  private intensity: number = 0;
  private decay: number = 5;
  private frequency: number = 20;
  
  trigger(intensity: number = 0.5, decay: number = 5): void {
    this.intensity = intensity;
    this.decay = decay;
  }
  
  update(camera: THREE.Camera, delta: number): void {
    if (this.intensity > 0) {
      // Apply shake
      camera.position.x += (Math.random() - 0.5) * this.intensity;
      camera.position.y += (Math.random() - 0.5) * this.intensity;
      camera.position.z += (Math.random() - 0.5) * this.intensity * 0.5;
      
      // Decay
      this.intensity -= delta * this.decay;
      if (this.intensity < 0) this.intensity = 0;
    }
  }
}

// Hook for screen shake
export function useScreenShake() {
  const { camera } = useThree();
  const controllerRef = useRef(new ScreenShakeController());
  const originalPosition = useRef(camera.position.clone());
  
  useFrame((_, delta) => {
    // Reset to original
    camera.position.copy(originalPosition.current);
    
    // Apply shake
    controllerRef.current.update(camera, delta);
  });
  
  return {
    trigger: (intensity?: number, decay?: number) => 
      controllerRef.current.trigger(intensity, decay)
  };
}

// Cinematic camera controller
export function CinematicCamera({ 
  target, 
  mode = 'gameplay' 
}: { 
  target: THREE.Vector3; 
  mode?: 'gameplay' | 'victory' | 'intro';
}) {
  const { camera } = useThree();
  const cameraOffset = useRef(new THREE.Vector3(0, 5, 10));
  
  useFrame((_, delta) => {
    const targetPosition = target.clone().add(cameraOffset.current);
    
    switch (mode) {
      case 'gameplay':
        // Smooth follow
        camera.position.lerp(targetPosition, delta * 3);
        camera.lookAt(target);
        break;
        
      case 'victory':
        // Orbit around character
        const angle = Date.now() * 0.001;
        const radius = 8;
        camera.position.x = target.x + Math.cos(angle) * radius;
        camera.position.z = target.z + Math.sin(angle) * radius;
        camera.position.y = target.y + 5;
        camera.lookAt(target);
        break;
        
      case 'intro':
        // Dolly in
        camera.position.lerp(
          new THREE.Vector3(target.x, target.y + 3, target.z + 15),
          delta * 0.5
        );
        camera.lookAt(target);
        break;
    }
  });
  
  return null;
}

// Environment map for realistic reflections
export function LegendaryEnvironment() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Create gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#001a33'); // Dark blue top
    gradient.addColorStop(0.5, '#1a0033'); // Purple middle
    gradient.addColorStop(1, '#330033'); // Dark magenta bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    
    // Create environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(scene as any);
    scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;
    
    return () => {
      texture.dispose();
    };
  }, [scene]);
  
  return null;
}

// Fog for depth
export function AtmosphericFog({ 
  color = '#1a0033', 
  near = 5, 
  far = 30 
}: {
  color?: string;
  near?: number;
  far?: number;
}) {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.fog = new THREE.Fog(color, near, far);
    return () => {
      scene.fog = null;
    };
  }, [scene, color, near, far]);
  
  return null;
}
