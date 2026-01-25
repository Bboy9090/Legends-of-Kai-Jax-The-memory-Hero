import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { getQualitySettings } from "../../../lib/threejs/PerformanceOptimizer";

export default function CinematicPostFX({
  enabled = true,
  grade = "neutral",
  accent = "#00f2ff",
  punch = 0,
  center = [0.5, 0.45],
}: {
  enabled?: boolean;
  grade?: "neutral" | "ice" | "ember" | "cosmic";
  accent?: string;
  punch?: number; // 0..1 impact spike
  center?: [number, number]; // screen-space 0..1
}) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const gradePassRef = useRef<ShaderPass | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);
  const rgbRef = useRef<ShaderPass | null>(null);
  const vignetteRef = useRef<ShaderPass | null>(null);
  const filmRef = useRef<FilmPass | null>(null);
  const raysRef = useRef<ShaderPass | null>(null);
  const baseBloomRef = useRef({ strength: 1.1, radius: 0.92, threshold: 0.18 });

  const gradeShader = useMemo(() => {
    return {
      uniforms: {
        tDiffuse: { value: null },
        uTint: { value: new THREE.Color("#00f2ff") },
        uLift: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        uGamma: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uGain: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uSaturation: { value: 1.15 },
        uContrast: { value: 1.12 },
        uIntensity: { value: 0.85 },
        uTime: { value: 0.0 },
        uCosmic: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;
        uniform vec3 uLift;
        uniform vec3 uGamma;
        uniform vec3 uGain;
        uniform float uSaturation;
        uniform float uContrast;
        uniform float uIntensity;
        uniform float uTime;
        uniform float uCosmic;

        vec3 saturateColor(vec3 c, float s) {
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          return mix(vec3(l), c, s);
        }

        vec3 liftGammaGain(vec3 c, vec3 lift, vec3 gamma, vec3 gain) {
          c = clamp(c + lift, 0.0, 1.0);
          c = pow(c, 1.0 / max(gamma, vec3(0.001)));
          c = clamp(c * gain, 0.0, 1.0);
          return c;
        }

        vec3 hueShift(vec3 c, float a) {
          // simple YIQ hue rotation
          const mat3 RGB2YIQ = mat3(
            0.299, 0.587, 0.114,
            0.596, -0.274, -0.322,
            0.211, -0.523, 0.312
          );
          const mat3 YIQ2RGB = mat3(
            1.0, 0.956, 0.621,
            1.0, -0.272, -0.647,
            1.0, -1.107, 1.704
          );
          vec3 yiq = RGB2YIQ * c;
          float h = atan(yiq.z, yiq.y) + a;
          float chroma = sqrt(yiq.y * yiq.y + yiq.z * yiq.z);
          yiq.y = chroma * cos(h);
          yiq.z = chroma * sin(h);
          return clamp(YIQ2RGB * yiq, 0.0, 1.0);
        }

        void main() {
          vec4 src = texture2D(tDiffuse, vUv);
          vec3 c = src.rgb;

          // contrast around mid
          c = (c - 0.5) * uContrast + 0.5;
          c = saturateColor(c, uSaturation);
          c = liftGammaGain(c, uLift, uGamma, uGain);

          // tint blend
          vec3 tinted = mix(c, c * uTint, 0.25);

          // cosmic hue drift for Kai‑Jax
          if (uCosmic > 0.5) {
            tinted = hueShift(tinted, sin(uTime * 0.35) * 0.8);
            tinted = saturateColor(tinted, 1.45);
          }

          vec3 outc = mix(c, tinted, uIntensity);
          gl_FragColor = vec4(outc, src.a);
        }
      `,
    };
  }, []);

  const coreRaysShader = useMemo(() => {
    return {
      uniforms: {
        tDiffuse: { value: null },
        uColor: { value: new THREE.Color("#00f2ff") },
        uCenter: { value: new THREE.Vector2(0.5, 0.45) },
        uStrength: { value: 0.5 },
        uTime: { value: 0.0 },
        uPunch: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec3 uColor;
        uniform vec2 uCenter;
        uniform float uStrength;
        uniform float uTime;
        uniform float uPunch;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec4 src = texture2D(tDiffuse, vUv);

          vec2 dir = uCenter - vUv;
          float dist = length(dir);
          dir = normalize(dir + 1e-6);

          vec2 uv = vUv;
          vec3 acc = vec3(0.0);
          float illumination = 1.0;
          float decay = 0.92;
          float w = 0.16 + uPunch * 0.28;

          for (int i = 0; i < 10; i++) {
            uv += dir * (0.014 + uPunch * 0.010);
            vec3 s = texture2D(tDiffuse, uv).rgb;
            float n = hash(uv * (120.0 + uTime * 3.0));
            s *= 0.85 + n * 0.35;
            acc += s * illumination * w;
            illumination *= decay;
          }

          float centerMask = smoothstep(0.95, 0.0, dist);
          centerMask = pow(centerMask, 1.7);
          vec3 rays = acc * uColor * (uStrength * (0.55 + uPunch * 1.15)) * centerMask;
          gl_FragColor = vec4(src.rgb + rays, src.a);
        }
      `,
    };
  }, []);

  useEffect(() => {
    const q = getQualitySettings();
    const shouldEnable = enabled && q.postProcessing;
    if (!shouldEnable) return;

    const composer = new EffectComposer(gl);
    composerRef.current = composer;
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(q.pixelRatio);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom (the “poster glow”)
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.10, // strength
      0.92, // radius
      0.18 // threshold
    );
    bloomRef.current = bloom;
    composer.addPass(bloom);

    // Color grade (hero identity)
    const gradePass = new ShaderPass(gradeShader as any);
    gradePassRef.current = gradePass;
    composer.addPass(gradePass);

    // Core rays (light shafts around core/aura)
    const rays = new ShaderPass(coreRaysShader as any);
    raysRef.current = rays;
    composer.addPass(rays);

    // Subtle chromatic shift (cinematic lens)
    const rgb = new ShaderPass(RGBShiftShader);
    rgb.uniforms["amount"].value = 0.0008;
    rgbRef.current = rgb;
    composer.addPass(rgb);

    // Vignette (focus)
    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms["offset"].value = 0.25;
    vignette.uniforms["darkness"].value = 0.9;
    vignetteRef.current = vignette;
    composer.addPass(vignette);

    // Film grain (very subtle)
    const film = new FilmPass(
      0.22, // noise intensity
      0.04, // scanline intensity
      720, // scanline count
      false
    );
    filmRef.current = film;
    composer.addPass(film);

    return () => {
      composerRef.current = null;
      gradePassRef.current = null;
      bloomRef.current = null;
      rgbRef.current = null;
      vignetteRef.current = null;
      filmRef.current = null;
      raysRef.current = null;
      composer.dispose();
    };
  }, [camera, coreRaysShader, enabled, gl, gradeShader, scene, size.height, size.width]);

  useEffect(() => {
    const pass = gradePassRef.current;
    if (!pass) return;

    const acc = new THREE.Color(accent);
    pass.uniforms.uTint.value = acc;

    // default
    pass.uniforms.uLift.value.set(0.0, 0.0, 0.0);
    pass.uniforms.uGamma.value.set(1.0, 1.0, 1.0);
    pass.uniforms.uGain.value.set(1.0, 1.0, 1.0);
    pass.uniforms.uSaturation.value = 1.18;
    pass.uniforms.uContrast.value = 1.14;
    pass.uniforms.uIntensity.value = 0.85;
    pass.uniforms.uCosmic.value = 0.0;

    if (grade === "ice") {
      pass.uniforms.uLift.value.set(0.02, 0.04, 0.06);
      pass.uniforms.uGamma.value.set(1.02, 1.03, 0.98);
      pass.uniforms.uGain.value.set(0.95, 1.02, 1.12);
      pass.uniforms.uSaturation.value = 1.25;
      pass.uniforms.uContrast.value = 1.18;
      pass.uniforms.uIntensity.value = 0.92;
    } else if (grade === "ember") {
      pass.uniforms.uLift.value.set(0.06, 0.03, 0.01);
      pass.uniforms.uGamma.value.set(0.98, 1.02, 1.10);
      pass.uniforms.uGain.value.set(1.18, 1.03, 0.90);
      pass.uniforms.uSaturation.value = 1.28;
      pass.uniforms.uContrast.value = 1.20;
      pass.uniforms.uIntensity.value = 0.92;
    } else if (grade === "cosmic") {
      pass.uniforms.uLift.value.set(0.02, 0.02, 0.02);
      pass.uniforms.uGain.value.set(1.05, 1.05, 1.05);
      pass.uniforms.uSaturation.value = 1.35;
      pass.uniforms.uContrast.value = 1.18;
      pass.uniforms.uIntensity.value = 0.95;
      pass.uniforms.uCosmic.value = 1.0;
    }
  }, [accent, grade]);

  useEffect(() => {
    const bloom = bloomRef.current;
    if (!bloom) return;

    // Grade-driven bloom tuning (more “poster”)
    if (grade === "cosmic") {
      baseBloomRef.current = { strength: 1.55, radius: 1.10, threshold: 0.13 };
    } else if (grade === "ice") {
      baseBloomRef.current = { strength: 1.32, radius: 1.02, threshold: 0.16 };
    } else if (grade === "ember") {
      baseBloomRef.current = { strength: 1.38, radius: 1.05, threshold: 0.16 };
    } else {
      baseBloomRef.current = { strength: 1.10, radius: 0.92, threshold: 0.18 };
    }

    bloom.strength = baseBloomRef.current.strength;
    bloom.radius = baseBloomRef.current.radius;
    bloom.threshold = baseBloomRef.current.threshold;
  }, [grade]);

  useEffect(() => {
    const rays = raysRef.current;
    if (!rays) return;
    rays.uniforms.uColor.value = new THREE.Color(accent);
    rays.uniforms.uCenter.value.set(center[0], center[1]);
  }, [accent, center]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    const q = getQualitySettings();
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(q.pixelRatio);
  }, [size.height, size.width]);

  useFrame((_, delta) => {
    const composer = composerRef.current;
    if (!composer) return;
    gl.autoClear = true;
    const pass = gradePassRef.current;
    if (pass) pass.uniforms.uTime.value += delta;

    const spike = THREE.MathUtils.clamp(punch, 0, 1);

    // Punch bloom/rgb/grain spikes (cinematic hits)
    const bloom = bloomRef.current;
    if (bloom) {
      bloom.strength = baseBloomRef.current.strength * (1.0 + spike * 0.55);
      bloom.radius = baseBloomRef.current.radius * (1.0 + spike * 0.10);
      bloom.threshold = baseBloomRef.current.threshold * (1.0 - spike * 0.25);
    }

    const rgb = rgbRef.current;
    if (rgb) rgb.uniforms["amount"].value = 0.0008 + spike * 0.0022;

    const vignette = vignetteRef.current;
    if (vignette) vignette.uniforms["darkness"].value = 0.9 + spike * 0.15;

    const film = filmRef.current as any;
    if (film?.uniforms) {
      film.uniforms["nIntensity"].value = 0.22 + spike * 0.22;
      film.uniforms["sIntensity"].value = 0.04 + spike * 0.05;
    }

    const rays = raysRef.current;
    if (rays) {
      rays.uniforms.uTime.value += delta;
      rays.uniforms.uPunch.value = spike;
      rays.uniforms.uStrength.value = grade === "cosmic" ? 0.75 : grade === "ice" ? 0.58 : grade === "ember" ? 0.66 : 0.48;
    }

    composer.render(delta);
  }, 1);

  return null;
}

