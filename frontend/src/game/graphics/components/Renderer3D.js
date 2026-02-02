/**
 * Main 3D Renderer Component
 * WebGL with ACES tone mapping, dynamic resolution, and post-processing
 */

import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  OrbitControls, 
  PerspectiveCamera,
  Stats,
  AdaptiveDpr,
  AdaptiveEvents,
  Preload
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  SMAA,
  ToneMapping
} from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import useGraphicsStore from '../stores/graphicsStore';

// Performance Monitor Component
const PerformanceMonitor = () => {
  const { gl, scene } = useThree();
  const updatePerformance = useGraphicsStore(s => s.updatePerformance);
  const frameTimesRef = useRef([]);
  const lastTimeRef = useRef(performance.now());
  
  useFrame(() => {
    const now = performance.now();
    const frameTime = now - lastTimeRef.current;
    lastTimeRef.current = now;
    
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    // Update every 30 frames
    if (frameTimesRef.current.length % 30 === 0) {
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = 1000 / avgFrameTime;
      
      const info = gl.info;
      updatePerformance({
        fps: Math.round(fps),
        frameTime: avgFrameTime.toFixed(2),
        triangleCount: info.render?.triangles || 0,
        drawCalls: info.render?.calls || 0,
      });
    }
  });
  
  return null;
};

// Dynamic Resolution Adjuster
const DynamicResolution = () => {
  const { gl } = useThree();
  const currentResolution = useGraphicsStore(s => s.currentResolution);
  
  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio * currentResolution);
  }, [gl, currentResolution]);
  
  return null;
};

// Post-Processing Stack
const PostProcessing = () => {
  const preset = useGraphicsStore(s => s.preset);
  const hitStopActive = useGraphicsStore(s => s.hitStopActive);
  const hitStopIntensity = useGraphicsStore(s => s.hitStopIntensity);
  
  const vignetteOffset = useMemo(() => {
    return hitStopActive ? 0.1 : preset.vignette.offset;
  }, [hitStopActive, preset.vignette.offset]);
  
  const vignetteDarkness = useMemo(() => {
    return hitStopActive ? preset.vignette.darkness + hitStopIntensity * 0.3 : preset.vignette.darkness;
  }, [hitStopActive, hitStopIntensity, preset.vignette.darkness]);
  
  return (
    <EffectComposer multisampling={0}>
      {preset.smaa && <SMAA />}
      
      <Bloom
        intensity={preset.bloom.intensity}
        luminanceThreshold={preset.bloom.luminanceThreshold}
        luminanceSmoothing={preset.bloom.luminanceSmoothing}
        mipmapBlur={preset.bloom.mipmapBlur}
      />
      
      <Vignette
        offset={vignetteOffset}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {preset.chromaticAberration?.enabled && (
        <ChromaticAberration
          offset={preset.chromaticAberration.offset}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
      
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
};

// Lighting Setup
const Lighting = () => {
  const preset = useGraphicsStore(s => s.preset);
  const shadowMapSize = preset.shadowMapSize;
  
  return (
    <>
      {/* Key Light - Main directional */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={2.0}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      
      {/* Fill Light */}
      <directionalLight
        position={[-8, 8, -5]}
        intensity={0.6}
        color="#a0c0ff"
      />
      
      {/* Rim Light for character separation */}
      <spotLight
        position={[0, 10, -15]}
        intensity={1.5}
        color="#ffffff"
        angle={0.4}
        penumbra={0.5}
      />
      
      {/* Ambient */}
      <ambientLight intensity={0.3} color="#1a1a2e" />
      
      {/* HDRI Environment for reflections */}
      <Environment preset="city" background={false} />
    </>
  );
};

// Performance HUD Overlay
const PerformanceHUD = () => {
  const { fps, frameTime, triangleCount, drawCalls, showPerfHUD, currentResolution, currentPreset } = useGraphicsStore();
  
  if (!showPerfHUD) return null;
  
  return (
    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded-lg p-4 font-mono text-xs text-white z-50">
      <h3 className="text-primary font-bold mb-2">PERFORMANCE</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-white/60">FPS:</span>
        <span className={fps < 30 ? 'text-red-500' : fps < 55 ? 'text-yellow-500' : 'text-green-500'}>
          {fps}
        </span>
        <span className="text-white/60">Frame:</span>
        <span>{frameTime}ms</span>
        <span className="text-white/60">Triangles:</span>
        <span>{triangleCount.toLocaleString()}</span>
        <span className="text-white/60">Draw Calls:</span>
        <span>{drawCalls}</span>
        <span className="text-white/60">Resolution:</span>
        <span>{(currentResolution * 100).toFixed(0)}%</span>
        <span className="text-white/60">Preset:</span>
        <span className="text-primary">{currentPreset}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-white/10 text-white/40">
        Press F3 to toggle
      </div>
    </div>
  );
};

// Main Renderer Component
const Renderer3D = ({ children, cameraPosition = [0, 5, 15] }) => {
  const containerRef = useRef();
  const preset = useGraphicsStore(s => s.preset);
  const togglePerfHUD = useGraphicsStore(s => s.togglePerfHUD);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'F3') {
        togglePerfHUD();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePerfHUD]);
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas
        shadows
        dpr={[0.5, 2]}
        gl={{
          antialias: false, // Using SMAA instead
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={50}
          near={0.1}
          far={1000}
        />
        
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <Suspense fallback={null}>
          <Lighting />
          {children}
          <Preload all />
        </Suspense>
        
        <PostProcessing />
        <PerformanceMonitor />
        <DynamicResolution />
      </Canvas>
      
      <PerformanceHUD />
    </div>
  );
};

export default Renderer3D;
export { Lighting, PostProcessing, PerformanceMonitor, PerformanceHUD };
