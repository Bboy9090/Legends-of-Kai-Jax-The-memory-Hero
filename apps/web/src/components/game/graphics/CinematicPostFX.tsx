import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { getDeviceType, getQualitySettings } from "../../../lib/threejs/PerformanceOptimizer";

export default function CinematicPostFX({
  enabled = true,
  profile = "preview",
  grade = "neutral",
  accent = "#00f2ff",
  punch = 0,
  center = [0.5, 0.45],
}: {
  enabled?: boolean;
  profile?: "preview" | "battle";
  grade?: "neutral" | "ice" | "ember" | "cosmic";
  accent?: string;
  punch?: number; // 0..1 impact spike
  center?: [number, number]; // screen-space 0..1
}) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const gradePassRef = useRef<ShaderPass | null>(null);
  const afterimageRef = useRef<AfterimagePass | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);
  const rgbRef = useRef<ShaderPass | null>(null);
  const vignetteRef = useRef<ShaderPass | null>(null);
  const filmRef = useRef<FilmPass | null>(null);
  const raysRef = useRef<ShaderPass | null>(null);
  const sharpenRef = useRef<ShaderPass | null>(null);
  const baseBloomRef = useRef({ strength: 1.1, radius: 0.92, threshold: 0.18 });
  const prevPunchRef = useRef(0);
  const impactRef = useRef(0);
  const initRef = useRef(false);
  const baseExposureRef = useRef<number | null>(null);
  const failedRef = useRef(false);
  const postFxPixelRatioRef = useRef<number>(1);

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
        uFlash: { value: 0.0 },
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
        uniform float uFlash;
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

          // hit flash (impact exposure pop) — driven by punch delta so idle scenes don’t smear/flash
          float f = clamp(uFlash, 0.0, 1.0);
          if (f > 0.001) {
            vec3 flashColor = mix(vec3(1.0), uTint, 0.35);
            outc = clamp(outc + flashColor * (f * 0.75), 0.0, 1.0);
          }
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

  const sharpenShader = useMemo(() => {
    return {
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uAmount: { value: 0.0 },
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
        uniform vec2 uResolution;
        uniform float uAmount;

        void main() {
          vec2 texel = 1.0 / max(uResolution, vec2(1.0));
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
          vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
          vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
          vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;

          // simple unsharp mask (edge boost)
          vec3 blur = (n + s + e + w) * 0.25;
          vec3 detail = c - blur;
          vec3 outc = c + detail * uAmount;
          gl_FragColor = vec4(clamp(outc, 0.0, 1.0), 1.0);
        }
      `,
    };
  }, []);

  useEffect(() => {
    const q = getQualitySettings();
    const deviceType = getDeviceType();
    const shouldEnable = enabled && q.postProcessing;
    if (!shouldEnable) return;

    failedRef.current = false;
    let composer: EffectComposer | null = null;
    try {
      // Capture baseline exposure once (lets us do real “camera flash” on hits)
      if (baseExposureRef.current == null) baseExposureRef.current = (gl as any).toneMappingExposure ?? 1.0;

      // PostFX is expensive: cap its internal resolution to avoid crashes and blown highlights.
      // (We keep the main renderer pixelRatio untouched; this only affects post passes.)
      const postFxPixelRatio = Math.min(q.pixelRatio, deviceType === "desktop" ? 1.5 : 1.25);
      postFxPixelRatioRef.current = postFxPixelRatio;

      composer = new EffectComposer(gl);
      composerRef.current = composer;
      composer.setSize(size.width, size.height);
      composer.setPixelRatio(postFxPixelRatio);

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      // Afterimage can be unstable on some GPUs (HalfFloat render targets).
      // Keep it desktop-only and optional; if it fails, we skip it.
      if (deviceType === "desktop") {
        try {
          const after = new AfterimagePass(0.0);
          afterimageRef.current = after;
          composer.addPass(after);
        } catch {
          afterimageRef.current = null;
        }
      }

      // Bloom (the “poster glow”)
      // Battle profile runs lower bloom to keep arenas readable.
      const initialBloomStrength = profile === "battle" ? 0.88 : 1.10;
      const initialBloomRadius = profile === "battle" ? 0.82 : 0.92;
      const initialBloomThreshold = profile === "battle" ? 0.22 : 0.18;
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        initialBloomStrength,
        initialBloomRadius,
        initialBloomThreshold
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
      if (rgb.uniforms?.["amount"]) rgb.uniforms["amount"].value = 0.0008;
      rgbRef.current = rgb;
      composer.addPass(rgb);

      // Vignette (focus)
      const vignette = new ShaderPass(VignetteShader);
      if (vignette.uniforms?.["offset"]) vignette.uniforms["offset"].value = 0.25;
      if (vignette.uniforms?.["darkness"]) vignette.uniforms["darkness"].value = 0.9;
      vignetteRef.current = vignette;
      composer.addPass(vignette);

      // Film grain (very subtle) — FilmPass(noiseIntensity, scanlinesIntensity, scanlinesCount?, grayscale?)
      const film = new (FilmPass as any)(0.22, 0.04, 720, false);
      filmRef.current = film;
      composer.addPass(film);

      // Final sharpen (nice, but not worth crashing) — desktop-only
      if (deviceType === "desktop") {
        const sharpen = new ShaderPass(sharpenShader as any);
        sharpenRef.current = sharpen;
        if (sharpen.uniforms?.uResolution?.value?.set)
          sharpen.uniforms.uResolution.value.set(size.width * postFxPixelRatio, size.height * postFxPixelRatio);
        // base amount is tuned in useFrame (impact + grade)
        if (sharpen.uniforms?.uAmount) sharpen.uniforms.uAmount.value = 0.0;
        composer.addPass(sharpen);
      } else {
        sharpenRef.current = null;
      }
    } catch (err) {
      // If postFX fails (device/driver differences), fall back to default R3F rendering
      failedRef.current = true;
      composerRef.current = null;
      gradePassRef.current = null;
      afterimageRef.current = null;
      bloomRef.current = null;
      rgbRef.current = null;
      vignetteRef.current = null;
      filmRef.current = null;
      raysRef.current = null;
      sharpenRef.current = null;
      console.warn("[CinematicPostFX] disabled due to init error", err);
    }

    return () => {
      composerRef.current = null;
      gradePassRef.current = null;
      afterimageRef.current = null;
      bloomRef.current = null;
      rgbRef.current = null;
      vignetteRef.current = null;
      filmRef.current = null;
      raysRef.current = null;
      sharpenRef.current = null;
      composer?.dispose();
    };
  }, [camera, coreRaysShader, enabled, gl, gradeShader, profile, scene, sharpenShader, size.height, size.width]);

  useEffect(() => {
    const pass = gradePassRef.current;
    if (!pass) return;

    const acc = new THREE.Color(accent);
    pass.uniforms.uTint.value = acc;

    // default (lift blacks a touch so arenas don’t crush to black)
    // battle profile is intentionally less “poster” so the arena stays readable.
    const isBattle = profile === "battle";
    pass.uniforms.uLift.value.set(0.015, 0.015, 0.015);
    pass.uniforms.uGamma.value.set(1.0, 1.0, 1.0);
    pass.uniforms.uGain.value.set(1.0, 1.0, 1.0);
    pass.uniforms.uSaturation.value = isBattle ? 1.04 : 1.12;
    pass.uniforms.uContrast.value = isBattle ? 1.04 : 1.08;
    pass.uniforms.uIntensity.value = isBattle ? 0.62 : 0.78;
    pass.uniforms.uCosmic.value = 0.0;

    if (grade === "ice") {
      pass.uniforms.uLift.value.set(0.03, 0.045, 0.06);
      pass.uniforms.uGamma.value.set(1.01, 1.02, 0.99);
      pass.uniforms.uGain.value.set(0.98, 1.02, 1.08);
      pass.uniforms.uSaturation.value = isBattle ? 1.08 : 1.18;
      pass.uniforms.uContrast.value = isBattle ? 1.06 : 1.10;
      pass.uniforms.uIntensity.value = isBattle ? 0.68 : 0.82;
    } else if (grade === "ember") {
      pass.uniforms.uLift.value.set(0.055, 0.032, 0.018);
      pass.uniforms.uGamma.value.set(0.99, 1.01, 1.06);
      pass.uniforms.uGain.value.set(1.10, 1.03, 0.94);
      pass.uniforms.uSaturation.value = isBattle ? 1.08 : 1.18;
      pass.uniforms.uContrast.value = isBattle ? 1.06 : 1.10;
      pass.uniforms.uIntensity.value = isBattle ? 0.68 : 0.82;
    } else if (grade === "cosmic") {
      pass.uniforms.uLift.value.set(0.02, 0.02, 0.03);
      pass.uniforms.uGain.value.set(1.03, 1.03, 1.03);
      pass.uniforms.uSaturation.value = isBattle ? 1.12 : 1.22;
      pass.uniforms.uContrast.value = isBattle ? 1.06 : 1.10;
      pass.uniforms.uIntensity.value = isBattle ? 0.72 : 0.84;
      pass.uniforms.uCosmic.value = 1.0;
    }
  }, [accent, grade, profile]);

  useEffect(() => {
    const bloom = bloomRef.current;
    if (!bloom) return;

    // Grade-driven bloom tuning (more “poster”)
    if (grade === "cosmic") {
      baseBloomRef.current = { strength: 1.05, radius: 0.95, threshold: 0.18 };
    } else if (grade === "ice") {
      baseBloomRef.current = { strength: 0.92, radius: 0.88, threshold: 0.20 };
    } else if (grade === "ember") {
      baseBloomRef.current = { strength: 0.96, radius: 0.90, threshold: 0.20 };
    } else {
      baseBloomRef.current = { strength: 0.80, radius: 0.75, threshold: 0.22 };
    }

    const isBattle = profile === "battle";
    bloom.strength = baseBloomRef.current.strength * (isBattle ? 0.70 : 1.0);
    bloom.radius = baseBloomRef.current.radius * (isBattle ? 0.78 : 1.0);
    bloom.threshold = THREE.MathUtils.clamp(baseBloomRef.current.threshold + (isBattle ? 0.06 : 0.0), 0, 1);
  }, [grade, profile]);

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
    composer.setPixelRatio(postFxPixelRatioRef.current || Math.min(q.pixelRatio, 1.5));
    const sharpen = sharpenRef.current;
    if (sharpen?.uniforms?.uResolution?.value?.set) {
      const pr = postFxPixelRatioRef.current || Math.min(q.pixelRatio, 1.5);
      sharpen.uniforms.uResolution.value.set(size.width * pr, size.height * pr);
    }
  }, [size.height, size.width]);

  useFrame((_, delta) => {
    if (failedRef.current) return;
    const composer = composerRef.current;
    if (!composer) return;
    try {
      gl.autoClear = true;
      const pass = gradePassRef.current;
      if (pass?.uniforms?.uTime) pass.uniforms.uTime.value += delta;

      const spike = THREE.MathUtils.clamp(punch, 0, 1);
      const dp = initRef.current ? spike - prevPunchRef.current : 0;
      prevPunchRef.current = spike;
      initRef.current = true;
      // Exponential decay so a single hit lingers for a few frames (trailer feel)
      const decay = Math.exp(-delta * 12.0);
      impactRef.current = Math.max(impactRef.current * decay, Math.max(0, dp) * 1.0);
      const impact = THREE.MathUtils.clamp(impactRef.current, 0, 1);

      // Hit flash feeds the grade shader (keeps it “cinematic”, not a UI overlay)
      if (pass?.uniforms?.uFlash) pass.uniforms.uFlash.value = impact;

      // Real exposure “camera flash” (this is what makes hits feel like trailer footage)
      const baseExposure = baseExposureRef.current ?? (gl as any).toneMappingExposure ?? 1.0;
      const isBattle = profile === "battle";
      const flashExposure = 1.0 + impact * (isBattle ? 0.05 : 0.10) + spike * (isBattle ? 0.01 : 0.02);
      (gl as any).toneMappingExposure = baseExposure * Math.min(isBattle ? 1.07 : 1.18, flashExposure);

      // Ghost trail strength (0..1): only rises on impact deltas so steady “punch” doesn’t smear previews
      const after = afterimageRef.current as any;
      if (after?.uniforms?.damp) {
        const maxDamp = grade === "cosmic" ? 0.965 : grade === "ice" ? 0.945 : grade === "ember" ? 0.955 : 0.935;
        after.uniforms.damp.value = maxDamp * impact;
      }

      // Punch bloom/rgb/grain spikes (cinematic hits)
      const bloom = bloomRef.current;
      if (bloom) {
        bloom.strength = baseBloomRef.current.strength * (1.0 + spike * 0.25);
        bloom.radius = baseBloomRef.current.radius * (1.0 + spike * 0.06);
        bloom.threshold = baseBloomRef.current.threshold * (1.0 - spike * 0.12);
      }

      const rgb = rgbRef.current;
      if (rgb?.uniforms?.["amount"]) rgb.uniforms["amount"].value = 0.0008 + spike * 0.0022;

      const vignette = vignetteRef.current;
      if (vignette?.uniforms?.["darkness"]) vignette.uniforms["darkness"].value = 0.65 + spike * 0.12;

      const film = filmRef.current as any;
      if (film?.uniforms) {
        if (film.uniforms["nIntensity"]) film.uniforms["nIntensity"].value = 0.12 + spike * 0.12;
        if (film.uniforms["sIntensity"]) film.uniforms["sIntensity"].value = 0.02 + spike * 0.03;
      }

      const rays = raysRef.current as any;
      if (rays?.uniforms) {
        if (rays.uniforms.uTime) rays.uniforms.uTime.value += delta;
        if (rays.uniforms.uPunch) rays.uniforms.uPunch.value = spike;
        if (rays.uniforms.uStrength) {
          const base =
            grade === "cosmic" ? 0.52 : grade === "ice" ? 0.38 : grade === "ember" ? 0.44 : 0.32;
          rays.uniforms.uStrength.value = base * (profile === "battle" ? 0.62 : 1.0);
        }
      }

      // Final sharpen amount: small baseline + extra on impacts to make motion read “crisp”
      const sharpen = sharpenRef.current;
      if (sharpen?.uniforms?.uAmount) {
        const baseSharp = grade === "cosmic" ? 0.06 : grade === "ice" ? 0.07 : grade === "ember" ? 0.065 : 0.05;
        sharpen.uniforms.uAmount.value = baseSharp + impact * 0.12;
      }

      composer.render(delta);
    } catch (err) {
      failedRef.current = true;
      console.warn("[CinematicPostFX] disabled due to runtime error", err);
    }
  }, 1);

  return null;
}

