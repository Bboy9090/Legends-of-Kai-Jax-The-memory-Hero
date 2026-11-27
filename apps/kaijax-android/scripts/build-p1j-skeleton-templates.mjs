#!/usr/bin/env node
/**
 * OPERATION KAI-JAX — P1-J PRIORITY 1 & 4 STUDIO-GRADE 19-CLIP SKELETAL TEMPLATE COMPILER
 *
 * Generates `/data/checkpoints/p1j-skeleton-templates/<id>_template.glb` for all 5 approved
 * canon characters (`kai`, `jax`, `kaijax`, `boryn`, `borax`) with:
 *   1. Exact canonical bone hierarchies (37, 32, 56, 29, 29 joints) + 6 gameplay attachment sockets.
 *   2. 25-keyframe full-body animation curves across all 19 required gameplay clips.
 *   3. Analytical stance-leg sole height compensation (`computeGroundedPelvisDy`) + heel-to-toe roll
 *      (`foot_L/R` + `toe_L/R`) eliminating floating feet and foot sliding during `walk`, `run`, `sprint`.
 *   4. Multi-segment spine (`spine_01`, `spine_02`, `chest`), `neck`, `head`, `clavicle_L/R`, and
 *      wrist (`hand_L/R`) counter-rotation, anticipation windups, impact holds, and clean claw clearance.
 *   5. Non-intersecting dorsal spider-limb (`spider_UL/UR/LL/LR_01..03`) choreography, 7-crest traveling
 *      storm-mane wave (`mane_01..07`), and phase-separated 3-tail fan-out (`tail_ember`, `tail_storm`,
 *      `tail_memory` — strictly 3 physical tails on Kai-Jax!).
 */

import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

const OUT_DIR = path.resolve('/app/applet/data/checkpoints/p1j-skeleton-templates');

const REQUIRED_CLIPS = [
  'idle',
  'breathing',
  'walk',
  'run',
  'sprint',
  'jump',
  'fall',
  'landing',
  'dodge',
  'attack_1',
  'attack_2',
  'attack_3',
  'heavy_strike',
  'parry',
  'hit_reaction',
  'roar',
  'ability_cast',
  'victory',
  'defeat',
];

const MORPH_NAMES = ['blink', 'snarl', 'roar', 'pain', 'focus'];

const ROSTER_SPECS = [
  {
    id: 'kai',
    height: 1.82,
    shoulderWidth: 0.240,
    hipWidth: 0.124,
    spiderCount: 4,
    maneCount: 0,
    tailMode: 'none',
  },
  {
    id: 'jax',
    height: 1.88,
    shoulderWidth: 0.268,
    hipWidth: 0.134,
    spiderCount: 0,
    maneCount: 7,
    tailMode: 'none',
  },
  {
    id: 'kaijax',
    height: 2.04,
    shoulderWidth: 0.298,
    hipWidth: 0.148,
    spiderCount: 4,
    maneCount: 7,
    tailMode: 'tri_canon', // STRICTLY 3 PHYSICAL TAILS: tail_ember, tail_storm, tail_memory
  },
  {
    id: 'boryn',
    height: 2.12,
    shoulderWidth: 0.334,
    hipWidth: 0.164,
    spiderCount: 0,
    maneCount: 0,
    tailMode: 'single',
  },
  {
    id: 'borax',
    height: 2.20,
    shoulderWidth: 0.326,
    hipWidth: 0.162,
    spiderCount: 0,
    maneCount: 0,
    tailMode: 'single',
  },
];

function buildSkeletonDefinition(spec) {
  const H = spec.height;
  const S = H / 1.85;
  const shX = spec.shoulderWidth;
  const hipX = spec.hipWidth;

  const bones = [];
  const byName = new Map();

  function addBone(name, parentName, worldPos) {
    const parent = parentName ? byName.get(parentName) : null;
    const localPos = parent
      ? [worldPos[0] - parent.worldPos[0], worldPos[1] - parent.worldPos[1], worldPos[2] - parent.worldPos[2]]
      : [...worldPos];
    const b = {
      index: bones.length,
      name,
      parentIndex: parent ? parent.index : -1,
      worldPos,
      localPos,
    };
    bones.push(b);
    byName.set(name, b);
    return b;
  }

  addBone('pelvis', null, [0, 0.94 * S, 0]);
  addBone('spine_01', 'pelvis', [0, 1.07 * S, 0]);
  addBone('spine_02', 'spine_01', [0, 1.21 * S, 0.01 * S]);
  addBone('chest', 'spine_02', [0, 1.35 * S, 0.012 * S]);
  addBone('neck', 'chest', [0, 1.49 * S, 0.02 * S]);
  addBone('head', 'neck', [0, 1.595 * S, 0.032 * S]);
  addBone('jaw', 'head', [0, 1.528 * S, 0.088 * S]);
  addBone('ear_L', 'head', [0.128 * S, 1.725 * S, -0.008 * S]);
  addBone('ear_R', 'head', [-0.128 * S, 1.725 * S, -0.008 * S]);

  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`clavicle_${suf}`, 'chest', [sign * 0.095 * S, 1.43 * S, 0.01 * S]);
    addBone(`upper_arm_${suf}`, `clavicle_${suf}`, [sign * shX, 1.40 * S, -0.005 * S]);
    addBone(`forearm_${suf}`, `upper_arm_${suf}`, [sign * (shX + 0.056 * S), 1.135 * S, -0.018 * S]);
    addBone(`hand_${suf}`, `forearm_${suf}`, [sign * (shX + 0.078 * S), 0.885 * S, 0.048 * S]);
  }

  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`thigh_${suf}`, 'pelvis', [sign * hipX, 0.90 * S, 0]);
    addBone(`shin_${suf}`, `thigh_${suf}`, [sign * (hipX + 0.010 * S), 0.49 * S, 0.024 * S]);
    addBone(`foot_${suf}`, `shin_${suf}`, [sign * (hipX + 0.014 * S), 0.11 * S, 0.005 * S]);
    addBone(`toe_${suf}`, `foot_${suf}`, [sign * (hipX + 0.014 * S), 0.04 * S, 0.145 * S]);
  }

  if (spec.spiderCount === 4) {
    const spiderConfigs = [
      { prefix: 'spider_UL', sign: 1, upper: true },
      { prefix: 'spider_UR', sign: -1, upper: true },
      { prefix: 'spider_LL', sign: 1, upper: false },
      { prefix: 'spider_LR', sign: -1, upper: false },
    ];
    for (const cfg of spiderConfigs) {
      const s = cfg.sign;
      const p0 = cfg.upper ? [s * 0.105 * S, 1.42 * S, -0.145 * S] : [s * 0.125 * S, 1.25 * S, -0.155 * S];
      const p1 = cfg.upper ? [s * 0.44 * S, 1.88 * S, -0.22 * S] : [s * 0.52 * S, 1.46 * S, -0.25 * S];
      const p2 = cfg.upper ? [s * 0.54 * S, 2.12 * S, -0.03 * S] : [s * 0.68 * S, 1.06 * S, -0.06 * S];
      addBone(`${cfg.prefix}_01`, 'chest', p0);
      addBone(`${cfg.prefix}_02`, `${cfg.prefix}_01`, p1);
      addBone(`${cfg.prefix}_03`, `${cfg.prefix}_02`, p2);
    }
  }

  if (spec.maneCount === 7) {
    for (let i = 1; i <= 7; i++) {
      const u = (i - 4) / 3;
      const base = [u * 0.125 * S, (1.715 - Math.abs(u) * 0.065) * S, (0.045 - Math.abs(u) * 0.045) * S];
      addBone(`mane_0${i}`, 'head', base);
    }
  }

  if (spec.tailMode === 'tri_canon') {
    const triDefs = [
      {
        prefix: 'tail_ember',
        pts: [
          [-0.09 * S, 0.92 * S, -0.14 * S],
          [-0.36 * S, 0.74 * S, -0.34 * S],
          [-0.56 * S, 0.46 * S, -0.44 * S],
          [-0.46 * S, 0.26 * S, -0.16 * S],
        ],
      },
      {
        prefix: 'tail_storm',
        pts: [
          [0, 0.92 * S, -0.15 * S],
          [0.06 * S, 0.66 * S, -0.42 * S],
          [0.14 * S, 0.34 * S, -0.56 * S],
          [0.06 * S, 0.18 * S, -0.26 * S],
        ],
      },
      {
        prefix: 'tail_memory',
        pts: [
          [0.09 * S, 0.92 * S, -0.14 * S],
          [0.36 * S, 0.74 * S, -0.34 * S],
          [0.56 * S, 0.48 * S, -0.44 * S],
          [0.47 * S, 0.28 * S, -0.16 * S],
        ],
      },
    ];
    for (const td of triDefs) {
      addBone(`${td.prefix}_01`, 'pelvis', td.pts[0]);
      addBone(`${td.prefix}_02`, `${td.prefix}_01`, td.pts[1]);
      addBone(`${td.prefix}_03`, `${td.prefix}_02`, td.pts[2]);
      addBone(`${td.prefix}_04`, `${td.prefix}_03`, td.pts[3]);
    }
  } else if (spec.tailMode === 'single') {
    const pts = [
      [0, 0.91 * S, -0.15 * S],
      [0.10 * S, 0.70 * S, -0.40 * S],
      [0.20 * S, 0.44 * S, -0.52 * S],
      [0.14 * S, 0.30 * S, -0.26 * S],
    ];
    addBone('tail_01', 'pelvis', pts[0]);
    addBone('tail_02', 'tail_01', pts[1]);
    addBone('tail_03', 'tail_02', pts[2]);
    addBone('tail_04', 'tail_03', pts[3]);
  }

  return { bones, byName, S, H };
}

/**
 * Analytical vertical sole position relative to hip (`thigh` joint) in normalized S units:
 * Rest leg chain: thigh->shin = 0.41*S, shin->foot = 0.38*S, foot->ground = 0.11*S (total = -0.90*S).
 * Computes exact pelvis dy so the planted stance sole stays locked on Y = 0 without floating or sinking!
 */
function soleRelativeY(rxThigh, rxShin, rxFoot, rxPelvis = 0) {
  const th = rxPelvis + rxThigh;
  const sh = th + rxShin;
  const ft = sh + rxFoot;
  const toeOrHeelDrop =
    ft >= 0 ? 0.148 * Math.sin(ft) : 0.068 * Math.sin(-ft);
  return (
    -0.41 * Math.cos(th) -
    0.38 * Math.cos(sh) -
    0.11 * Math.cos(ft) -
    toeOrHeelDrop -
    0.022
  );
}

function computeGroundedPelvisDy(rxTL, rxSL, rxFL, rxTR, rxSR, rxFR, flightLift = 0, rxPelvis = 0) {
  const sL = soleRelativeY(rxTL, rxSL, rxFL, rxPelvis);
  const sR = soleRelativeY(rxTR, rxSR, rxFR, rxPelvis);
  const lowestSole = Math.min(sL, sR);
  return -0.90 - lowestSole + flightLift;
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Studio-grade anticipation -> snap strike -> impact follow-through -> smooth neutral recovery curve:
 *   p in [0..0.18]: coil back (-anticipation)
 *   p in [0.18..0.40]: explosive forward acceleration to +1.0 peak
 *   p in [0.40..0.56]: crisp impact follow-through plateau
 *   p in [0.56..1.00]: smooth Hermite settle back to 0.0 (zero transition pop!)
 */
function combatStrikeCurve(p, antiAmp = 0.32) {
  if (p < 0.18) {
    return -antiAmp * Math.sin((p / 0.18) * (Math.PI * 0.5));
  }
  if (p < 0.40) {
    const u = smoothstep(0.18, 0.40, p);
    return -antiAmp * (1 - u) + 1.0 * u;
  }
  if (p < 0.56) {
    const u = (p - 0.40) / 0.16;
    return 1.0 - 0.08 * u;
  }
  const u = smoothstep(0.56, 1.0, p);
  return 0.92 * (1 - u);
}

function combatEnvelope(p) {
  if (p < 0.14) return smoothstep(0, 0.14, p);
  if (p < 0.62) return 1.0;
  return 1.0 - smoothstep(0.62, 1.0, p);
}

export function buildP1JAnimationClips(spec, skel) {
  const { bones, byName, S } = skel;
  const euler = new THREE.Euler(0, 0, 0, 'XYZ');
  const quat = new THREE.Quaternion();

  function qEuler(rx, ry, rz) {
    euler.set(rx, ry, rz, 'XYZ');
    quat.setFromEuler(euler);
    return [quat.x, quat.y, quat.z, quat.w];
  }

  const pelvisRest = byName.get('pelvis').localPos;
  const isHeavyBuild = spec.id === 'boryn' || spec.id === 'borax';
  const weightScale = isHeavyBuild ? 1.12 : spec.id === 'kaijax' ? 1.06 : 1.0;

  return REQUIRED_CLIPS.map((clipName) => {
    const isLoop = ['idle', 'breathing', 'walk', 'run', 'sprint', 'fall', 'victory'].includes(clipName);
    const duration =
      clipName === 'idle'
        ? 2.4
        : clipName === 'breathing'
          ? 2.1
          : clipName === 'walk'
            ? 0.88
            : clipName === 'run'
              ? 0.62
              : clipName === 'sprint'
                ? 0.46
                : clipName === 'attack_1' || clipName === 'attack_2'
                  ? 0.38
                  : clipName === 'attack_3'
                    ? 0.50
                    : clipName === 'heavy_strike'
                      ? 0.54
                      : clipName === 'parry' || clipName === 'dodge'
                        ? 0.42
                        : clipName === 'roar' || clipName === 'ability_cast'
                          ? 0.78
                          : clipName === 'victory'
                            ? 2.0
                            : clipName === 'defeat'
                              ? 1.12
                              : 0.44;

    // P1-J Upgrade: 25 keyframes per clip (double temporal density for crisp contact & snap frames)
    const sampleCount = 25;
    const times = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      times[i] = (i / (sampleCount - 1)) * duration;
    }

    const tracks = [];
    const addRotTrack = (boneName, fn) => {
      const b = byName.get(boneName);
      if (!b) return;
      const values = new Float32Array(sampleCount * 4);
      for (let i = 0; i < sampleCount; i++) {
        const phase = i / (sampleCount - 1);
        const wave = phase * Math.PI * 2;
        const [rx, ry, rz] = isLoop && i === sampleCount - 1 ? fn(0, 0) : fn(phase, wave);
        const q = qEuler(rx, ry, rz);
        values[i * 4] = q[0];
        values[i * 4 + 1] = q[1];
        values[i * 4 + 2] = q[2];
        values[i * 4 + 3] = q[3];
      }
      tracks.push({ boneIndex: b.index, path: 'rotation', values });
    };

    const addPelvisPosTrack = (fn) => {
      const b = byName.get('pelvis');
      const values = new Float32Array(sampleCount * 3);
      for (let i = 0; i < sampleCount; i++) {
        const phase = i / (sampleCount - 1);
        const wave = phase * Math.PI * 2;
        const [dx, dy, dz] = isLoop && i === sampleCount - 1 ? fn(0, 0) : fn(phase, wave);
        values[i * 3] = pelvisRest[0] + dx * S;
        values[i * 3 + 1] = pelvisRest[1] + dy * S;
        values[i * 3 + 2] = pelvisRest[2] + dz * S;
      }
      tracks.push({ boneIndex: b.index, path: 'translation', values });
    };

    if (clipName === 'idle' || clipName === 'breathing') {
      const amp = clipName === 'breathing' ? 1.32 : 1.0;
      const combatReady = spec.id === 'kai' || spec.id === 'jax' || spec.id === 'kaijax';
      const kneeL = (w) => 0.14 + Math.max(0, -Math.sin(w)) * 0.04 * amp;
      const kneeR = (w) => 0.10 + Math.max(0, Math.sin(w)) * 0.04 * amp;
      const thighL = (w) => -0.08 - Math.max(0, -Math.sin(w)) * 0.02 * amp;
      const thighR = (w) => 0.04 - Math.max(0, Math.sin(w)) * 0.02 * amp;
      const footL = (w) => 0.08 - thighL(w) - kneeL(w);
      const footR = (w) => 0.06 - thighR(w) - kneeR(w);

      addPelvisPosTrack((_, w) => [
        Math.sin(w) * 0.012,
        computeGroundedPelvisDy(thighL(w), kneeL(w), footL(w), thighR(w), kneeR(w), footR(w), 0),
        Math.cos(w) * 0.008,
      ]);
      addRotTrack('pelvis', (_, w) => [0.02, combatReady ? 0.10 : 0.03, Math.sin(w) * 0.018]);
      addRotTrack('spine_01', (_, w) => [0.03 + Math.sin(w) * 0.018 * amp, combatReady ? -0.04 : 0, 0]);
      addRotTrack('spine_02', (_, w) => [0.02 + Math.sin(w - 0.3) * 0.018 * amp, combatReady ? -0.04 : 0, 0]);
      addRotTrack('chest', (_, w) => [0.02 - Math.sin(w - 0.5) * 0.024 * amp, combatReady ? -0.04 : 0, 0]);
      addRotTrack('neck', (_, w) => [-0.02 + Math.sin(w) * 0.014, combatReady ? 0.06 : 0, 0]);
      addRotTrack('head', (_, w) => [-0.02 + Math.cos(w) * 0.018, combatReady ? 0.06 + Math.sin(w * 0.5) * 0.03 : Math.sin(w) * 0.03, 0]);
      addRotTrack('clavicle_L', (_, w) => [0, -0.04, 0.03 + Math.sin(w) * 0.025 * amp]);
      addRotTrack('clavicle_R', (_, w) => [0, 0.04, -0.03 - Math.sin(w) * 0.025 * amp]);
      addRotTrack('upper_arm_L', (_, w) => [0.08 + Math.sin(w) * 0.03, 0.06, 0.20 + Math.cos(w) * 0.02]);
      addRotTrack('upper_arm_R', (_, w) => [0.12 - Math.sin(w) * 0.03, -0.06, -0.20 - Math.cos(w) * 0.02]);
      addRotTrack('forearm_L', (_, w) => [-0.34 - Math.sin(w) * 0.04, 0.08, 0]);
      addRotTrack('forearm_R', (_, w) => [-0.38 + Math.sin(w) * 0.04, -0.08, 0]);
      addRotTrack('hand_L', (_, w) => [0.06, 0.12, 0.06 + Math.sin(w) * 0.03]);
      addRotTrack('hand_R', (_, w) => [0.06, -0.12, -0.06 - Math.sin(w) * 0.03]);
      addRotTrack('thigh_L', (_, w) => [thighL(w), 0.04, 0.04]);
      addRotTrack('thigh_R', (_, w) => [thighR(w), -0.04, -0.04]);
      addRotTrack('shin_L', (_, w) => [kneeL(w), 0, 0]);
      addRotTrack('shin_R', (_, w) => [kneeR(w), 0, 0]);
      addRotTrack('foot_L', (_, w) => [footL(w), 0, 0]);
      addRotTrack('foot_R', (_, w) => [footR(w), 0, 0]);
      addRotTrack('ear_L', (_, w) => [Math.sin(w * 2) * 0.04, 0, 0.03]);
      addRotTrack('ear_R', (_, w) => [-Math.sin(w * 2) * 0.04, 0, -0.03]);
    } else if (clipName === 'walk' || clipName === 'run' || clipName === 'sprint') {
      const isWalk = clipName === 'walk';
      const isSprint = clipName === 'sprint';
      const stride = isWalk ? 0.54 : isSprint ? 1.12 : 0.88;
      const lean = isWalk ? 0.09 : isSprint ? 0.36 : 0.22;

      // Leg kinematics with distinct Stance (planted cushion + push-off) vs Swing (high knee lift)
      const legKinematics = (wLeg) => {
        const s = Math.sin(wLeg);
        const c = Math.cos(wLeg);
        // s > 0: leg swings forward -> heel strike at wLeg = PI/2 -> stance sweep backward during c < 0
        const rxThigh = -s * stride + (isSprint ? -0.08 : -0.03);
        // Knee flexes high during forward swing (c > 0) and cushions softly during mid-stance (c < 0)
        const swingFlex = Math.max(0, c) * (isWalk ? 0.62 : isSprint ? 1.18 : 0.94);
        const stanceCushion = Math.max(0, -c) * (isWalk ? 0.14 : 0.22);
        const rxShin = 0.08 + swingFlex + stanceCushion;
        // Ankle heel-strike (s > 0.6) -> flat plant -> strong plantarflexion toe-off (s < -0.4)
        const heelLead = Math.max(0, s - 0.35) * 0.32;
        const toePush = Math.max(0, -s - 0.25) * (isWalk ? 0.38 : 0.56);
        const rxFoot = -heelLead + toePush - 0.06;
        const rxToe = Math.max(0, -s - 0.15) * (isWalk ? 0.36 : 0.54);
        return { rxThigh, rxShin, rxFoot, rxToe };
      };

      addPelvisPosTrack((_, w) => {
        const L = legKinematics(w);
        const R = legKinematics(w + Math.PI);
        // Controlled brief flight arc only at peak double-float in run/sprint (never floats during mid-stance!)
        const doubleFloat = isWalk ? 0 : Math.pow(Math.abs(Math.sin(w)), 3) * (isSprint ? 0.026 : 0.016);
        const dy = computeGroundedPelvisDy(
          L.rxThigh,
          L.rxShin,
          L.rxFoot,
          R.rxThigh,
          R.rxShin,
          R.rxFoot,
          doubleFloat,
          lean * 0.22
        );
        // Lateral weight transfer over the planted stance leg
        const dx = -Math.cos(w) * (isWalk ? 0.028 : 0.022) * weightScale;
        const dz = Math.sin(w * 2) * (isSprint ? 0.022 : 0.012);
        return [dx, dy, dz];
      });

      addRotTrack('pelvis', (_, w) => [
        lean * 0.22,
        Math.sin(w) * 0.14 * stride,
        Math.cos(w) * (isWalk ? 0.05 : 0.065),
      ]);
      // Smooth 3-link spine distribution + axial counter-torsion (eliminates unnatural single-joint spine kink!)
      addRotTrack('spine_01', (_, w) => [
        lean * 0.34 + Math.abs(Math.sin(w)) * 0.03,
        -Math.sin(w) * 0.10 * stride,
        -Math.cos(w) * 0.025,
      ]);
      addRotTrack('spine_02', (_, w) => [
        lean * 0.32,
        -Math.sin(w) * 0.11 * stride,
        -Math.cos(w) * 0.02,
      ]);
      addRotTrack('chest', (_, w) => [
        lean * 0.30 + Math.sin(w * 2) * 0.025,
        -Math.sin(w) * 0.13 * stride,
        0,
      ]);
      // Neck & head horizon stabilization (gaze stays forward while torso leans into sprint!)
      addRotTrack('neck', (_, w) => [-lean * 0.42, Math.sin(w) * 0.06 * stride, 0]);
      addRotTrack('head', (_, w) => [-lean * 0.48 + Math.cos(w * 2) * 0.02, Math.sin(w) * 0.07 * stride, 0]);

      addRotTrack('thigh_L', (_, w) => {
        const k = legKinematics(w);
        return [k.rxThigh, 0.02, 0.035];
      });
      addRotTrack('thigh_R', (_, w) => {
        const k = legKinematics(w + Math.PI);
        return [k.rxThigh, -0.02, -0.035];
      });
      addRotTrack('shin_L', (_, w) => [legKinematics(w).rxShin, 0, 0]);
      addRotTrack('shin_R', (_, w) => [legKinematics(w + Math.PI).rxShin, 0, 0]);
      addRotTrack('foot_L', (_, w) => [legKinematics(w).rxFoot, 0, 0]);
      addRotTrack('foot_R', (_, w) => [legKinematics(w + Math.PI).rxFoot, 0, 0]);
      addRotTrack('toe_L', (_, w) => [legKinematics(w).rxToe, 0, 0]);
      addRotTrack('toe_R', (_, w) => [legKinematics(w + Math.PI).rxToe, 0, 0]);

      // Clavicle + arm pump with outward clearance (`rz`) so claws never clip hips or jacket!
      addRotTrack('clavicle_L', (_, w) => [0, -Math.sin(w) * 0.10 * stride, 0.04]);
      addRotTrack('clavicle_R', (_, w) => [0, Math.sin(w) * 0.10 * stride, -0.04]);
      addRotTrack('upper_arm_L', (_, w) => [Math.sin(w) * stride * 0.78 + 0.10, 0.06, 0.22]);
      addRotTrack('upper_arm_R', (_, w) => [-Math.sin(w) * stride * 0.78 + 0.10, -0.06, -0.22]);
      addRotTrack('forearm_L', (_, w) => [
        (isWalk ? -0.38 : -0.68) - Math.max(0, -Math.sin(w)) * (isSprint ? 0.54 : 0.38),
        0.10,
        0,
      ]);
      addRotTrack('forearm_R', (_, w) => [
        (isWalk ? -0.38 : -0.68) - Math.max(0, Math.sin(w)) * (isSprint ? 0.54 : 0.38),
        -0.10,
        0,
      ]);
      addRotTrack('hand_L', (_, w) => [0.08 + Math.sin(w) * 0.12, 0.14, 0.08]);
      addRotTrack('hand_R', (_, w) => [0.08 - Math.sin(w) * 0.12, -0.14, -0.08]);
      addRotTrack('ear_L', (_, w) => [-lean * 0.45 + Math.sin(w * 2) * 0.05, 0, 0.04]);
      addRotTrack('ear_R', (_, w) => [-lean * 0.45 - Math.sin(w * 2) * 0.05, 0, -0.04]);
    } else if (clipName === 'jump') {
      // Crouch anticipation (0..0.18) -> explosive toe-off extension (0.36) -> athletic tuck apex (0.72..1.0)
      const crouch = (p) => (p < 0.20 ? Math.sin((p / 0.20) * Math.PI) : 0);
      const lift = (p) => smoothstep(0.16, 0.72, p) * (1 - 0.15 * smoothstep(0.80, 1.0, p));
      addPelvisPosTrack((p) => [0, -0.14 * crouch(p) + 0.24 * lift(p), 0.04 * lift(p)]);
      addRotTrack('spine_01', (p) => [0.22 * crouch(p) - 0.08 * lift(p), 0, 0]);
      addRotTrack('spine_02', (p) => [0.16 * crouch(p) - 0.08 * lift(p), 0, 0]);
      addRotTrack('chest', (p) => [0.12 * crouch(p) - 0.10 * lift(p), 0, 0]);
      addRotTrack('neck', (p) => [-0.14 * crouch(p) + 0.06 * lift(p), 0, 0]);
      addRotTrack('head', (p) => [-0.16 * crouch(p) + 0.06 * lift(p), 0, 0]);
      addRotTrack('clavicle_L', (p) => [0, 0, 0.18 * lift(p)]);
      addRotTrack('clavicle_R', (p) => [0, 0, -0.18 * lift(p)]);
      addRotTrack('upper_arm_L', (p) => [0.38 * crouch(p) - 0.92 * lift(p), 0.10, 0.34]);
      addRotTrack('upper_arm_R', (p) => [0.38 * crouch(p) - 0.92 * lift(p), -0.10, -0.34]);
      addRotTrack('forearm_L', (p) => [-0.48 - 0.28 * lift(p), 0.12, 0]);
      addRotTrack('forearm_R', (p) => [-0.48 - 0.28 * lift(p), -0.12, 0]);
      addRotTrack('thigh_L', (p) => [-0.45 * crouch(p) - 0.86 * lift(p), 0.05, 0.09]);
      addRotTrack('thigh_R', (p) => [-0.45 * crouch(p) - 0.38 * lift(p), -0.05, -0.09]);
      addRotTrack('shin_L', (p) => [0.68 * crouch(p) + 1.08 * lift(p), 0, 0]);
      addRotTrack('shin_R', (p) => [0.68 * crouch(p) + 0.56 * lift(p), 0, 0]);
      addRotTrack('foot_L', (p) => [0.36 * lift(p), 0, 0]);
      addRotTrack('foot_R', (p) => [0.42 * lift(p), 0, 0]);
    } else if (clipName === 'fall') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.022, 0]);
      addRotTrack('spine_01', (_, w) => [0.10 + Math.sin(w) * 0.02, 0, 0]);
      addRotTrack('spine_02', () => [0.08, 0, 0]);
      addRotTrack('chest', (_, w) => [0.08 + Math.cos(w) * 0.025, 0, 0]);
      addRotTrack('neck', () => [0.08, 0, 0]);
      addRotTrack('head', () => [0.12, 0, 0]);
      addRotTrack('clavicle_L', (_, w) => [0, 0, 0.16 + Math.sin(w) * 0.04]);
      addRotTrack('clavicle_R', (_, w) => [0, 0, -0.16 - Math.sin(w) * 0.04]);
      addRotTrack('thigh_L', (_, w) => [-0.54 + Math.sin(w) * 0.06, 0.06, 0.12]);
      addRotTrack('thigh_R', (_, w) => [-0.28 - Math.sin(w) * 0.06, -0.06, -0.12]);
      addRotTrack('shin_L', () => [0.88, 0, 0]);
      addRotTrack('shin_R', () => [0.48, 0, 0]);
      addRotTrack('foot_L', () => [0.24, 0, 0]);
      addRotTrack('foot_R', () => [0.28, 0, 0]);
      addRotTrack('upper_arm_L', (_, w) => [-0.48 + Math.sin(w) * 0.10, 0.12, 0.46]);
      addRotTrack('upper_arm_R', (_, w) => [-0.48 - Math.sin(w) * 0.10, -0.12, -0.46]);
      addRotTrack('forearm_L', () => [-0.56, 0.10, 0]);
      addRotTrack('forearm_R', () => [-0.56, -0.10, 0]);
      addRotTrack('hand_L', (_, w) => [-0.14, 0.16, 0.18 + Math.sin(w) * 0.06]);
      addRotTrack('hand_R', (_, w) => [-0.14, -0.16, -0.18 - Math.sin(w) * 0.06]);
    } else if (clipName === 'landing') {
      const squash = (p) => Math.sin(Math.pow(p, 0.58) * Math.PI);
      addPelvisPosTrack((p) => {
        const s = squash(p);
        const rxT = -0.62 * s;
        const rxS = 0.92 * s;
        const rxF = -0.28 * s;
        return [0, computeGroundedPelvisDy(rxT, rxS, rxF, rxT * 0.88, rxS * 0.88, rxF * 0.88, 0), 0.05 * s];
      });
      addRotTrack('spine_01', (p) => [squash(p) * 0.22, 0.06 * squash(p), 0]);
      addRotTrack('spine_02', (p) => [squash(p) * 0.18, 0, 0]);
      addRotTrack('chest', (p) => [squash(p) * 0.16, -0.06 * squash(p), 0]);
      addRotTrack('neck', (p) => [-squash(p) * 0.18, 0, 0]);
      addRotTrack('head', (p) => [-squash(p) * 0.22, 0, 0]);
      addRotTrack('thigh_L', (p) => [-squash(p) * 0.62, 0.06, 0.11]);
      addRotTrack('thigh_R', (p) => [-squash(p) * 0.54, -0.06, -0.11]);
      addRotTrack('shin_L', (p) => [squash(p) * 0.92, 0, 0]);
      addRotTrack('shin_R', (p) => [squash(p) * 0.82, 0, 0]);
      addRotTrack('foot_L', (p) => [-squash(p) * 0.28, 0, 0]);
      addRotTrack('foot_R', (p) => [-squash(p) * 0.24, 0, 0]);
      addRotTrack('clavicle_L', (p) => [0, -0.08 * squash(p), -0.06 * squash(p)]);
      addRotTrack('clavicle_R', (p) => [0, 0.08 * squash(p), 0.06 * squash(p)]);
      addRotTrack('upper_arm_L', (p) => [squash(p) * 0.44, 0.08, 0.36]);
      addRotTrack('upper_arm_R', (p) => [squash(p) * 0.44, -0.08, -0.36]);
      addRotTrack('forearm_L', (p) => [-0.36 - 0.22 * squash(p), 0.10, 0]);
      addRotTrack('forearm_R', (p) => [-0.36 - 0.22 * squash(p), -0.10, 0]);
    } else if (clipName === 'dodge') {
      const env = (p) => Math.sin(Math.pow(p, 0.68) * Math.PI);
      addPelvisPosTrack((p) => {
        const e = env(p);
        const dy = computeGroundedPelvisDy(-0.66 * e, 0.82 * e, -0.18 * e, 0.34 * e, 0.34 * e, 0.28 * e, 0, 0.10 * e);
        return [0.06 * Math.sin(p * Math.PI * 2), dy, 0.18 * e];
      });
      addRotTrack('pelvis', (p) => [0.10 * env(p), Math.sin(p * Math.PI * 2) * 0.22, 0]);
      addRotTrack('spine_01', (p) => [0.24 * env(p), Math.sin(p * Math.PI * 2) * 0.18, 0]);
      addRotTrack('spine_02', (p) => [0.20 * env(p), Math.sin(p * Math.PI * 2) * 0.16, 0]);
      addRotTrack('chest', (p) => [0.18 * env(p), Math.sin(p * Math.PI * 2) * 0.14, 0]);
      addRotTrack('neck', (p) => [-0.22 * env(p), -Math.sin(p * Math.PI * 2) * 0.18, 0]);
      addRotTrack('head', (p) => [-0.26 * env(p), -Math.sin(p * Math.PI * 2) * 0.22, 0]);
      addRotTrack('thigh_L', (p) => [-0.66 * env(p), 0.06, 0.14]);
      addRotTrack('thigh_R', (p) => [0.34 * env(p), -0.06, -0.14]);
      addRotTrack('shin_L', (p) => [0.82 * env(p), 0, 0]);
      addRotTrack('shin_R', (p) => [0.34 * env(p), 0, 0]);
      addRotTrack('foot_L', (p) => [-0.18 * env(p), 0, 0]);
      addRotTrack('foot_R', (p) => [0.28 * env(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.48 * env(p), 0.10, 0.28]);
      addRotTrack('upper_arm_R', (p) => [0.48 * env(p), -0.10, -0.28]);
      addRotTrack('forearm_L', (p) => [-0.52 * env(p) - 0.24, 0.12, 0]);
      addRotTrack('forearm_R', (p) => [-0.52 * env(p) - 0.24, -0.12, 0]);
    } else if (
      clipName === 'attack_1' ||
      clipName === 'attack_2' ||
      clipName === 'attack_3' ||
      clipName === 'heavy_strike'
    ) {
      const isLeft = clipName === 'attack_2';
      const isComboFinisher = clipName === 'attack_3';
      const isHeavy = clipName === 'heavy_strike';
      const dir = isLeft ? -1 : 1;

      const sFn = (p) => combatStrikeCurve(p, isHeavy ? 0.42 : 0.30);
      const eFn = (p) => combatEnvelope(p);

      addPelvisPosTrack((p) => {
        const s = sFn(p);
        const sp = Math.max(0, s);
        const fwd = Math.max(-0.08, s) * (isHeavy ? 0.24 : isComboFinisher ? 0.20 : 0.15);
        const dy = computeGroundedPelvisDy(
          -0.08 - 0.42 * sp,
          0.14 + 0.54 * sp,
          -0.12 * sp,
          0.04 + 0.34 * sp,
          0.10 + 0.14 * sp,
          0.22 * sp,
          0,
          0.06 * eFn(p)
        );
        return [dir * 0.03 * s, dy, fwd];
      });

      addRotTrack('pelvis', (p) => [0.06 * eFn(p), dir * sFn(p) * (isComboFinisher ? 0.38 : 0.26), 0]);
      addRotTrack('spine_01', (p) => [
        0.04 + sFn(p) * (isHeavy ? 0.18 : 0.12),
        dir * sFn(p) * 0.26,
        0,
      ]);
      addRotTrack('spine_02', (p) => [
        0.03 + sFn(p) * (isHeavy ? 0.16 : 0.10),
        dir * sFn(p) * 0.26,
        0,
      ]);
      addRotTrack('chest', (p) => [
        0.04 + sFn(p) * (isHeavy ? 0.16 : 0.10),
        dir * sFn(p) * 0.28,
        -dir * 0.06 * Math.max(0, sFn(p)),
      ]);
      // Gaze stays locked forward onto target while torso whips through!
      addRotTrack('neck', (p) => [-0.06 * eFn(p), -dir * sFn(p) * 0.28, 0]);
      addRotTrack('head', (p) => [-0.08 * eFn(p), -dir * sFn(p) * 0.32, 0]);
      addRotTrack('jaw', (p) => [Math.max(0, sFn(p)) * (isHeavy ? 0.44 : 0.32), 0, 0]);

      if (isHeavy) {
        // Overhead double-claw apex slam with wide shoulder protraction & clean torso clearance
        addRotTrack('clavicle_L', (p) => [0, -0.22 * sFn(p), 0.22 * Math.max(0, -sFn(p))]);
        addRotTrack('clavicle_R', (p) => [0, 0.22 * sFn(p), -0.22 * Math.max(0, -sFn(p))]);
        addRotTrack('upper_arm_R', (p) => {
          const coil = Math.max(0, -sFn(p)) / 0.42;
          const slam = Math.max(0, sFn(p));
          return [-1.85 * coil - 0.55 * slam + 0.12, 0.24 * slam, -0.32 - 0.14 * coil];
        });
        addRotTrack('upper_arm_L', (p) => {
          const coil = Math.max(0, -sFn(p)) / 0.42;
          const slam = Math.max(0, sFn(p));
          return [-1.72 * coil - 0.48 * slam + 0.10, -0.24 * slam, 0.32 + 0.14 * coil];
        });
        addRotTrack('forearm_R', (p) => [-0.34 - 0.58 * Math.max(0, -sFn(p)) - 0.22 * eFn(p), -0.14, 0]);
        addRotTrack('forearm_L', (p) => [-0.32 - 0.58 * Math.max(0, -sFn(p)) - 0.22 * eFn(p), 0.14, 0]);
        addRotTrack('hand_R', (p) => [0.28 * Math.max(0, sFn(p)), -0.18, -0.14]);
        addRotTrack('hand_L', (p) => [0.28 * Math.max(0, sFn(p)), 0.18, 0.14]);
      } else if (isComboFinisher) {
        // attack_3: Wide twin-arc scissor rend with strong follow-through
        addRotTrack('clavicle_R', (p) => [0, 0.26 * sFn(p), -0.06]);
        addRotTrack('clavicle_L', (p) => [0, -0.18 * sFn(p), 0.06]);
        addRotTrack('upper_arm_R', (p) => [-1.28 * eFn(p) + 0.32 * sFn(p), 0.58 * sFn(p), -0.34]);
        addRotTrack('upper_arm_L', (p) => [-0.96 * eFn(p) - 0.28 * sFn(p), -0.42 * sFn(p), 0.34]);
        addRotTrack('forearm_R', (p) => [-0.34 - 0.48 * (1 - Math.max(0, sFn(p))) * eFn(p), -0.18, 0]);
        addRotTrack('forearm_L', (p) => [-0.34 - 0.42 * eFn(p), 0.18, 0]);
        addRotTrack('hand_R', (p) => [0.16 * eFn(p), -0.24 * sFn(p), -0.16]);
        addRotTrack('hand_L', (p) => [0.14 * eFn(p), 0.22 * sFn(p), 0.16]);
      } else if (isLeft) {
        // attack_2: Left claw horizontal cross slash (kept clear outside chest via rz=0.30!)
        addRotTrack('clavicle_L', (p) => [0, -0.26 * sFn(p), 0.05]);
        addRotTrack('clavicle_R', (p) => [0, -0.10 * sFn(p), -0.04]);
        addRotTrack('upper_arm_L', (p) => [-1.18 * eFn(p) + 0.26 * sFn(p), -0.52 * sFn(p), 0.30]);
        addRotTrack('forearm_L', (p) => [-0.32 - 0.58 * (1 - Math.max(0, sFn(p))) * eFn(p), 0.18, 0]);
        addRotTrack('hand_L', (p) => [0.18 * Math.max(0, sFn(p)), 0.24, 0.14]);
        addRotTrack('upper_arm_R', (p) => [0.34 * eFn(p), -0.12, -0.28]);
        addRotTrack('forearm_R', (p) => [-0.54 * eFn(p) - 0.28, -0.10, 0]);
      } else {
        // attack_1: Snappy right claw hook/slash (kept clear outside chest via rz=-0.30!)
        addRotTrack('clavicle_R', (p) => [0, 0.26 * sFn(p), -0.05]);
        addRotTrack('clavicle_L', (p) => [0, 0.10 * sFn(p), 0.04]);
        addRotTrack('upper_arm_R', (p) => [-1.18 * eFn(p) + 0.26 * sFn(p), 0.52 * sFn(p), -0.30]);
        addRotTrack('forearm_R', (p) => [-0.32 - 0.58 * (1 - Math.max(0, sFn(p))) * eFn(p), -0.18, 0]);
        addRotTrack('hand_R', (p) => [0.18 * Math.max(0, sFn(p)), -0.24, -0.14]);
        addRotTrack('upper_arm_L', (p) => [0.34 * eFn(p), 0.12, 0.28]);
        addRotTrack('forearm_L', (p) => [-0.54 * eFn(p) - 0.28, 0.10, 0]);
      }

      // Grounded martial-arts lunge stance (front knee bent, rear heel pushing)
      addRotTrack('thigh_L', (p) => [-0.08 - 0.42 * Math.max(0, sFn(p)), 0.06, 0.10]);
      addRotTrack('thigh_R', (p) => [0.04 + 0.34 * Math.max(0, sFn(p)), -0.06, -0.10]);
      addRotTrack('shin_L', (p) => [0.14 + 0.54 * Math.max(0, sFn(p)), 0, 0]);
      addRotTrack('shin_R', (p) => [0.10 + 0.14 * Math.max(0, sFn(p)), 0, 0]);
      addRotTrack('foot_L', (p) => [-0.12 * Math.max(0, sFn(p)), 0, 0]);
      addRotTrack('foot_R', (p) => [0.22 * Math.max(0, sFn(p)), 0, 0]);
      addRotTrack('toe_R', (p) => [0.28 * Math.max(0, sFn(p)), 0, 0]);
    } else if (clipName === 'parry') {
      // Crisp guard snap at p=0.18 -> deflection recoil -> smooth reset (forearms held well forward of chest!)
      const guard = (p) => (p < 0.18 ? smoothstep(0, 0.18, p) : 1 - smoothstep(0.58, 1.0, p));
      const deflect = (p) => (p > 0.18 && p < 0.52 ? Math.sin(((p - 0.18) / 0.34) * Math.PI) : 0);
      addPelvisPosTrack((p) => {
        const g = guard(p);
        const dy = computeGroundedPelvisDy(-0.28 * g, 0.42 * g, 0, 0.16 * g, 0.22 * g, 0, 0, 0);
        return [0, dy, -0.07 * g - 0.04 * deflect(p)];
      });
      addRotTrack('spine_01', (p) => [0.08 * guard(p), -0.14 * guard(p) + 0.18 * deflect(p), 0]);
      addRotTrack('spine_02', (p) => [0.06 * guard(p), -0.12 * guard(p) + 0.16 * deflect(p), 0]);
      addRotTrack('chest', (p) => [0.06 * guard(p), -0.14 * guard(p) + 0.20 * deflect(p), 0]);
      addRotTrack('neck', (p) => [-0.08 * guard(p), 0.22 * guard(p), 0]);
      addRotTrack('head', (p) => [-0.08 * guard(p), 0.18 * guard(p), 0]);
      addRotTrack('clavicle_L', (p) => [0, -0.22 * guard(p), 0.08 * guard(p)]);
      addRotTrack('clavicle_R', (p) => [0, 0.22 * guard(p), -0.08 * guard(p)]);
      addRotTrack('upper_arm_L', (p) => [-1.12 * guard(p) - 0.22 * deflect(p), -0.32 * guard(p), 0.30]);
      addRotTrack('upper_arm_R', (p) => [-1.04 * guard(p) + 0.28 * deflect(p), 0.32 * guard(p), -0.30]);
      addRotTrack('forearm_L', (p) => [-0.34 - 0.72 * guard(p), 0.24 * guard(p), 0]);
      addRotTrack('forearm_R', (p) => [-0.38 - 0.68 * guard(p), -0.24 * guard(p), 0]);
      addRotTrack('hand_L', (p) => [-0.18 * guard(p), 0.22, 0.14]);
      addRotTrack('hand_R', (p) => [-0.18 * guard(p), -0.22, -0.14]);
      addRotTrack('thigh_L', (p) => [-0.28 * guard(p), 0.06, 0.10]);
      addRotTrack('thigh_R', (p) => [0.16 * guard(p), -0.06, -0.10]);
      addRotTrack('shin_L', (p) => [0.42 * guard(p), 0, 0]);
      addRotTrack('shin_R', (p) => [0.22 * guard(p), 0, 0]);
    } else if (clipName === 'hit_reaction') {
      const jolt = (p) => Math.sin(Math.pow(p, 0.50) * Math.PI);
      addPelvisPosTrack((p) => {
        const j = jolt(p);
        const dy = computeGroundedPelvisDy(-0.22 * j, 0.34 * j, 0, 0.18 * j, 0, 0, 0, 0);
        return [0, dy, -0.18 * j];
      });
      addRotTrack('spine_01', (p) => [-0.16 * jolt(p), 0.12 * jolt(p), 0.05 * jolt(p)]);
      addRotTrack('spine_02', (p) => [-0.14 * jolt(p), 0.10 * jolt(p), 0]);
      addRotTrack('chest', (p) => [-0.14 * jolt(p), 0.10 * jolt(p), 0]);
      addRotTrack('neck', (p) => [-0.18 * jolt(p), -0.10 * jolt(p), 0]);
      addRotTrack('head', (p) => [-0.24 * jolt(p), -0.12 * jolt(p), 0]);
      addRotTrack('jaw', (p) => [0.28 * jolt(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.34 * jolt(p), 0.12, 0.28]);
      addRotTrack('upper_arm_R', (p) => [0.34 * jolt(p), -0.12, -0.28]);
      addRotTrack('forearm_L', (p) => [-0.44 * jolt(p) - 0.20, 0, 0]);
      addRotTrack('forearm_R', (p) => [-0.44 * jolt(p) - 0.20, 0, 0]);
      addRotTrack('thigh_L', (p) => [-0.22 * jolt(p), 0, 0.08]);
      addRotTrack('thigh_R', (p) => [0.18 * jolt(p), 0, -0.08]);
      addRotTrack('shin_L', (p) => [0.34 * jolt(p), 0, 0]);
    } else if (clipName === 'roar' || clipName === 'ability_cast') {
      // Coil in (0..0.22) -> chest-open apex surge (0.22..0.72) -> grounded return (0.72..1.0)
      const coil = (p) => (p < 0.22 ? Math.sin((p / 0.22) * Math.PI) : 0);
      const surge = (p) => smoothstep(0.16, 0.36, p) * (1 - smoothstep(0.72, 1.0, p));
      addPelvisPosTrack((p) => {
        const k = coil(p) + surge(p) * 0.7;
        const dy = computeGroundedPelvisDy(-0.26 * k, 0.40 * k, -0.12 * k, -0.22 * k, 0.36 * k, -0.12 * k, 0, 0);
        return [0, dy, 0.04 * surge(p)];
      });
      addRotTrack('spine_01', (p) => [0.16 * coil(p) - 0.12 * surge(p), 0, 0]);
      addRotTrack('spine_02', (p) => [0.14 * coil(p) - 0.12 * surge(p), 0, 0]);
      addRotTrack('chest', (p) => [0.12 * coil(p) - 0.16 * surge(p), 0, 0]);
      addRotTrack('neck', (p) => [0.10 * coil(p) - 0.16 * surge(p), 0, 0]);
      addRotTrack('head', (p) => [0.12 * coil(p) - 0.22 * surge(p), 0, 0]);
      addRotTrack('jaw', (p) => [0.58 * surge(p), 0, 0]);
      addRotTrack('ear_L', (p) => [-0.28 * surge(p), 0, 0.12 * surge(p)]);
      addRotTrack('ear_R', (p) => [-0.28 * surge(p), 0, -0.12 * surge(p)]);
      addRotTrack('clavicle_L', (p) => [0, 0.14 * surge(p), 0.10 * surge(p)]);
      addRotTrack('clavicle_R', (p) => [0, -0.14 * surge(p), -0.10 * surge(p)]);
      addRotTrack('upper_arm_L', (p) => [-0.68 * coil(p) - 0.88 * surge(p), 0.22 * surge(p), 0.32 * surge(p) + 0.14]);
      addRotTrack('upper_arm_R', (p) => [-0.68 * coil(p) - 0.88 * surge(p), -0.22 * surge(p), -0.32 * surge(p) - 0.14]);
      addRotTrack('forearm_L', (p) => [-0.82 * coil(p) - 0.42 * surge(p) - 0.22, 0.16, 0]);
      addRotTrack('forearm_R', (p) => [-0.82 * coil(p) - 0.42 * surge(p) - 0.22, -0.16, 0]);
      addRotTrack('hand_L', (p) => [-0.22 * surge(p), 0.18, 0.14 * surge(p)]);
      addRotTrack('hand_R', (p) => [-0.22 * surge(p), -0.18, -0.14 * surge(p)]);
      addRotTrack('thigh_L', (p) => [-0.26 * (coil(p) + surge(p) * 0.7), 0.06, 0.10]);
      addRotTrack('thigh_R', (p) => [-0.22 * (coil(p) + surge(p) * 0.7), -0.06, -0.10]);
      addRotTrack('shin_L', (p) => [0.40 * (coil(p) + surge(p) * 0.7), 0, 0]);
      addRotTrack('shin_R', (p) => [0.36 * (coil(p) + surge(p) * 0.7), 0, 0]);
      addRotTrack('foot_L', (p) => [-0.12 * (coil(p) + surge(p) * 0.7), 0, 0]);
      addRotTrack('foot_R', (p) => [-0.12 * (coil(p) + surge(p) * 0.7), 0, 0]);
    } else if (clipName === 'victory') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.018 - 0.02, 0]);
      addRotTrack('spine_01', (_, w) => [-0.04, Math.sin(w) * 0.04, 0]);
      addRotTrack('spine_02', (_, w) => [-0.05, Math.sin(w) * 0.04, 0]);
      addRotTrack('chest', (_, w) => [-0.08, Math.sin(w) * 0.06, 0]);
      addRotTrack('neck', (_, w) => [-0.04, -Math.sin(w) * 0.05, 0]);
      addRotTrack('head', (_, w) => [-0.06, Math.sin(w) * 0.08, 0]);
      addRotTrack('clavicle_R', (_, w) => [0, 0, -0.22 + Math.sin(w) * 0.03]);
      addRotTrack('upper_arm_R', (_, w) => [-2.08 + Math.sin(w) * 0.07, 0.12, -0.34]);
      addRotTrack('forearm_R', () => [-0.42, -0.12, 0]);
      addRotTrack('hand_R', () => [0.10, -0.14, -0.10]);
      addRotTrack('upper_arm_L', () => [0.18, 0.08, 0.24]);
      addRotTrack('forearm_L', () => [-0.48, 0.12, 0]);
      addRotTrack('thigh_L', () => [-0.08, 0.05, 0.06]);
      addRotTrack('thigh_R', () => [0.06, -0.05, -0.06]);
      addRotTrack('shin_L', () => [0.14, 0, 0]);
      addRotTrack('shin_R', () => [0.08, 0, 0]);
    } else if (clipName === 'defeat') {
      const k = (p) => smoothstep(0, 0.85, p);
      addPelvisPosTrack((p) => [0, -0.44 * k(p), -0.10 * k(p)]);
      addRotTrack('spine_01', (p) => [0.24 * k(p), 0, 0]);
      addRotTrack('spine_02', (p) => [0.20 * k(p), 0, 0]);
      addRotTrack('chest', (p) => [0.22 * k(p), 0, 0]);
      addRotTrack('neck', (p) => [0.20 * k(p), 0, 0]);
      addRotTrack('head', (p) => [0.28 * k(p), 0, 0]);
      addRotTrack('thigh_L', (p) => [-1.02 * k(p), 0.06, 0.10]);
      addRotTrack('thigh_R', (p) => [-0.82 * k(p), -0.06, -0.10]);
      addRotTrack('shin_L', (p) => [1.52 * k(p), 0, 0]);
      addRotTrack('shin_R', (p) => [1.32 * k(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.42 * k(p), 0, 0.24]);
      addRotTrack('upper_arm_R', (p) => [0.42 * k(p), 0, -0.24]);
      addRotTrack('forearm_L', (p) => [-0.36 * k(p) - 0.18, 0, 0]);
      addRotTrack('forearm_R', (p) => [-0.36 * k(p) - 0.18, 0, 0]);
    }

    // -----------------------------------------------------------------------
    // Supernatural Secondary Appendages (Non-Intersecting & Context-Driven!)
    // -----------------------------------------------------------------------
    const isStrike =
      clipName === 'attack_1' || clipName === 'attack_2' || clipName === 'attack_3' || clipName === 'heavy_strike';
    const isBurst = clipName === 'roar' || clipName === 'ability_cast';
    const isFastLoco = clipName === 'run' || clipName === 'sprint' || clipName === 'dodge';

    for (const b of bones) {
      if (b.name.startsWith('spider_')) {
        // Dorsal Spider Limbs (`spider_UL/UR/LL/LR_01..03`):
        // Keep base splayed outward & slightly rearward so limbs NEVER penetrate shoulders/arms!
        const signX = b.name.includes('_UL_') || b.name.includes('_LL_') ? 1 : -1;
        const isUpper = b.name.includes('_UL_') || b.name.includes('_UR_');
        const segNum = Number(b.name.slice(-1)); // 1, 2, 3
        const phaseOff = (isUpper ? 0 : 1.15) + (signX > 0 ? 0 : 0.65) + segNum * 0.45;

        addRotTrack(b.name, (p, w) => {
          if (isBurst) {
            const s = smoothstep(0.14, 0.38, p) * (1 - smoothstep(0.72, 1.0, p));
            return [
              -0.18 * s / segNum,
              -signX * 0.22 * s,
              signX * (isUpper ? 0.18 : 0.14) * s,
            ];
          }
          if (isStrike) {
            const s = combatStrikeCurve(p, 0.28);
            return [
              0.16 * Math.max(0, s) - 0.10 * Math.max(0, -s),
              signX * 0.14 * s,
              signX * 0.08 * Math.abs(s),
            ];
          }
          if (isFastLoco) {
            // Streamlined aerodynamic sweep behind back during sprint/run/dodge
            return [
              -0.14 / segNum + Math.sin(w + phaseOff) * 0.08,
              -signX * 0.14 + Math.cos(w + phaseOff) * 0.06,
              signX * 0.06,
            ];
          }
          return [
            -0.04 + Math.sin(w + phaseOff) * 0.075,
            -signX * 0.05 + Math.cos(w + phaseOff) * 0.065,
            signX * Math.sin(w + phaseOff * 0.7) * 0.05,
          ];
        });
      } else if (b.name.startsWith('mane_0')) {
        // 7 Swept-Back Storm-Mane Crests (`mane_01..07`): traveling lightning crest wave
        const idx = Number(b.name.slice(-1));
        const lateralU = (idx - 4) / 3; // -1 .. +1
        addRotTrack(b.name, (p, w) => {
          if (isBurst) {
            const s = smoothstep(0.14, 0.36, p) * (1 - smoothstep(0.72, 1.0, p));
            return [-0.26 * s + Math.sin(w * 3 + idx * 0.7) * 0.08, lateralU * 0.14 * s, 0];
          }
          const windSweep = isFastLoco ? 0.18 : 0.0;
          const amp = isStrike ? 1.65 : isFastLoco ? 1.45 : 1.0;
          return [
            windSweep + Math.sin(w * 2 + idx * 0.55) * 0.085 * amp,
            lateralU * 0.05 + Math.cos(w + idx * 0.45) * 0.045 * amp,
            0,
          ];
        });
      } else if (b.name.startsWith('tail')) {
        // Strictly 3 Physical Tails on Kai-Jax (`tail_ember`, `tail_storm`, `tail_memory`) or single tail on Boryn/Borax:
        // Enforce angular separation (`fanBiasY` & `elevBiasX`) so the 3 tails NEVER intersect each other or the legs!
        const segNum = Number(b.name.slice(-1)); // 1..4
        const isEmber = b.name.includes('ember');
        const isStorm = b.name.includes('storm');
        const isMemory = b.name.includes('memory');

        const fanBiasY = isEmber ? -0.14 : isMemory ? 0.14 : 0.0;
        const elevBiasX = isStorm ? -0.09 : 0.03;
        const chainPhase = isEmber ? 0.0 : isStorm ? 2.094 : isMemory ? 4.188 : 0.0;

        addRotTrack(b.name, (p, w) => {
          const tipScale = 0.55 + segNum * 0.18;
          if (isBurst) {
            const s = smoothstep(0.14, 0.36, p) * (1 - smoothstep(0.72, 1.0, p));
            return [
              (elevBiasX - 0.14 * s) * tipScale + Math.sin(w * 2 + chainPhase - segNum * 0.5) * 0.07,
              fanBiasY * (1 + 0.8 * s) + Math.cos(w * 2 + chainPhase - segNum * 0.4) * 0.08,
              0,
            ];
          }
          const locoTrail = isFastLoco ? -0.10 * tipScale : 0;
          const amp = isStrike ? 1.45 : isFastLoco ? 1.25 : 0.92;
          return [
            elevBiasX * 0.6 + locoTrail + Math.sin(w + chainPhase - segNum * 0.52) * 0.075 * tipScale * amp,
            fanBiasY + Math.cos(w + chainPhase - segNum * 0.46) * 0.085 * tipScale * amp,
            fanBiasY * 0.25 * Math.sin(w + chainPhase),
          ];
        });
      }
    }

    return { name: clipName, times, tracks };
  });
}

function buildMinimalTemplateGlb(spec) {
  const skel = buildP1JSkeletonAndClips(spec);
  const { bones, byName, S } = skel.skel;
  const clips = skel.clips;
  const boneCount = bones.length;

  // Minimal 3-vertex placeholder triangle bound to pelvis so glTF validator & Blender importer see a valid SkinnedMesh
  const posFloat = new Float32Array([0, 0.9 * S, 0, 0.01, 0.91 * S, 0, -0.01, 0.91 * S, 0]);
  const normFloat = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  const uvFloat = new Float32Array([0.5, 0.5, 0.6, 0.5, 0.4, 0.5]);
  const jointsArr = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const weightsArr = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
  const idxArr = new Uint16Array([0, 1, 2]);

  const ibmFloat = new Float32Array(boneCount * 16);
  const m4 = new THREE.Matrix4();
  for (let b = 0; b < boneCount; b++) {
    const wp = bones[b].worldPos;
    m4.makeTranslation(-wp[0], -wp[1], -wp[2]);
    m4.toArray(ibmFloat, b * 16);
  }

  const binChunks = [];
  let byteOffset = 0;
  const bufferViews = [];
  const accessors = [];

  function appendBufferView(typedOrBuf, target = undefined) {
    const raw = Buffer.isBuffer(typedOrBuf)
      ? typedOrBuf
      : Buffer.from(typedOrBuf.buffer, typedOrBuf.byteOffset, typedOrBuf.byteLength);
    const pad = (4 - (raw.length % 4)) % 4;
    const bvIdx = bufferViews.length;
    const bv = { buffer: 0, byteOffset, byteLength: raw.length };
    if (target !== undefined) bv.target = target;
    bufferViews.push(bv);
    binChunks.push(raw);
    if (pad > 0) binChunks.push(Buffer.alloc(pad));
    byteOffset += raw.length + pad;
    return bvIdx;
  }

  function appendAccessor(typedArray, componentType, typeStr, count, target = undefined, includeMinMaxVec3 = false) {
    const bvIdx = appendBufferView(typedArray, target);
    const accObj = {
      bufferView: bvIdx,
      byteOffset: 0,
      componentType,
      count,
      type: typeStr,
    };
    if (includeMinMaxVec3) {
      const mn = [Infinity, Infinity, Infinity];
      const mx = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < count; i++) {
        const x = typedArray[i * 3];
        const y = typedArray[i * 3 + 1];
        const z = typedArray[i * 3 + 2];
        if (x < mn[0]) mn[0] = x;
        if (y < mn[1]) mn[1] = y;
        if (z < mn[2]) mn[2] = z;
        if (x > mx[0]) mx[0] = x;
        if (y > mx[1]) mx[1] = y;
        if (z > mx[2]) mx[2] = z;
      }
      accObj.min = mn;
      accObj.max = mx;
    }
    const idx = accessors.length;
    accessors.push(accObj);
    return idx;
  }

  const posAcc = appendAccessor(posFloat, 5126, 'VEC3', 3, 34962, true);
  const normAcc = appendAccessor(normFloat, 5126, 'VEC3', 3, 34962, false);
  const uvAcc = appendAccessor(uvFloat, 5126, 'VEC2', 3, 34962, false);
  const jointsAcc = appendAccessor(jointsArr, 5123, 'VEC4', 3, 34962, false);
  const weightsAcc = appendAccessor(weightsArr, 5126, 'VEC4', 3, 34962, false);
  const idxAcc = appendAccessor(idxArr, 5123, 'SCALAR', 3, 34963, false);
  const ibmAcc = appendAccessor(ibmFloat, 5126, 'MAT4', boneCount, undefined, false);

  const targets = MORPH_NAMES.map(() => {
    const dPos = new Float32Array(9);
    const mPosAcc = appendAccessor(dPos, 5126, 'VEC3', 3, 34962, true);
    return { POSITION: mPosAcc };
  });

  const nodes = [
    {
      name: `${spec.id}_SkinnedMesh`,
      mesh: 0,
      skin: 0,
    },
  ];

  const jointNodeOffset = 1;
  const jointNodeIndices = [];
  for (let b = 0; b < boneCount; b++) {
    const bone = bones[b];
    const children = bones.filter((c) => c.parentIndex === b).map((c) => c.index + jointNodeOffset);
    const nodeObj = {
      name: bone.name,
      translation: bone.localPos,
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    if (children.length > 0) nodeObj.children = children;
    nodes.push(nodeObj);
    jointNodeIndices.push(b + jointNodeOffset);
  }

  const attachSocket = (socketName, parentBoneName, localOffset) => {
    const pBone = byName.get(parentBoneName);
    const pNode = nodes[pBone.index + jointNodeOffset];
    const sNodeIdx = nodes.length;
    nodes.push({
      name: socketName,
      translation: localOffset,
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    });
    if (!pNode.children) pNode.children = [];
    pNode.children.push(sNodeIdx);
  };

  attachSocket('socket_weapon_L', 'hand_L', [0, -0.08 * S, 0.04 * S]);
  attachSocket('socket_weapon_R', 'hand_R', [0, -0.08 * S, 0.04 * S]);
  attachSocket('socket_hitbox_L', 'hand_L', [0, -0.14 * S, 0.12 * S]);
  attachSocket('socket_hitbox_R', 'hand_R', [0, -0.14 * S, 0.12 * S]);
  attachSocket('socket_relic', 'chest', [0, 0.04 * S, 0.16 * S]);
  attachSocket('socket_head', 'head', [0, 0.14 * S, 0.04 * S]);

  const animations = clips.map((clip) => {
    const tBv = appendBufferView(clip.times);
    const tAcc = accessors.length;
    accessors.push({
      bufferView: tBv,
      byteOffset: 0,
      componentType: 5126,
      count: clip.times.length,
      type: 'SCALAR',
      min: [clip.times[0]],
      max: [clip.times[clip.times.length - 1]],
    });

    const animSamplers = [];
    const animChannels = [];
    for (const tr of clip.tracks) {
      const isRot = tr.path === 'rotation';
      const outAcc = appendAccessor(tr.values, 5126, isRot ? 'VEC4' : 'VEC3', clip.times.length, undefined, false);
      const sIdx = animSamplers.length;
      animSamplers.push({
        input: tAcc,
        interpolation: 'LINEAR',
        output: outAcc,
      });
      animChannels.push({
        sampler: sIdx,
        target: {
          node: tr.boneIndex + jointNodeOffset,
          path: tr.path,
        },
      });
    }
    return {
      name: clip.name,
      samplers: animSamplers,
      channels: animChannels,
    };
  });

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Kai-Jax P1-J Studio 19-Clip Skeleton Template v4.0',
    },
    scene: 0,
    scenes: [{ name: `${spec.id}_Scene`, nodes: [0, jointNodeOffset] }],
    nodes,
    meshes: [
      {
        name: `${spec.id}_TemplateBody`,
        primitives: [
          {
            attributes: {
              POSITION: posAcc,
              NORMAL: normAcc,
              TEXCOORD_0: uvAcc,
              JOINTS_0: jointsAcc,
              WEIGHTS_0: weightsAcc,
            },
            indices: idxAcc,
            targets,
          },
        ],
        weights: [0, 0, 0, 0, 0],
        extras: { targetNames: MORPH_NAMES },
      },
    ],
    skins: [
      {
        name: `${spec.id}_Armature`,
        skeleton: jointNodeOffset,
        joints: jointNodeIndices,
        inverseBindMatrices: ibmAcc,
      },
    ],
    animations,
    bufferViews,
    accessors,
    buffers: [{ byteLength: byteOffset }],
  };

  const jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const paddedJson = jsonPad > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]) : jsonBuf;
  const binBody = Buffer.concat(binChunks);

  const totalLen = 12 + 8 + paddedJson.length + 8 + binBody.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBody.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, binBody]);
}

function buildP1JSkeletonAndClips(spec) {
  const skel = buildSkeletonDefinition(spec);
  const clips = buildP1JAnimationClips(spec, skel);
  return { skel, clips };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const spec of ROSTER_SPECS) {
  const buf = buildMinimalTemplateGlb(spec);
  const outPath = path.join(OUT_DIR, `${spec.id}_template.glb`);
  fs.writeFileSync(outPath, buf);
  console.log(`[P1J_TEMPLATE] ${spec.id.padEnd(8)} -> ${outPath} (${(buf.length / 1024).toFixed(1)} KB, 19 clips x 25 keys)`);
}
