import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as THREE from 'three';

/**
 * OPERATION KAI-JAX — PROJECT BEAST GODS (P1-I AI CHARACTER RECONSTRUCTION PIPELINE v4.0)
 * Multi-View Orthographic Artwork Reconstruction + Hybrid 2048x2048 PBR Projection +
 * Headless Blender 3.4.1 Deformable Armature Rigging & 7-Pose Extreme Deformation Certification +
 * 19-Clip Gameplay Animation Retargeting + Mobile LOD1 Optimization.
 *
 * Strictly governed by the 18 Official Legends of Kai-Jax Visual Library sheets:
 *   - 078f6bfc.png: CHARACTER VISUAL LIBRARY (BORYN · KAI · KAI-JAX · JAX · BORAX)
 *   - 3e003001.png: FATHERS, MENTOR, AND ELDER FANG (BORYN · BORAX · VHAROK)
 *   - Phase 1 Approved 4-View Orthographic Plates (/public/models/reconstruction-sheets/<id>/)
 *
 * Canon Locks Enforced:
 *   - Kai-Jax has STRICTLY 3 primary physical tails (tail_ember, tail_storm, tail_memory = 12 bones).
 *   - Bovar remains strictly withheld (`awaiting_visual_approval`, zero fabricated GLB files).
 */

const ROOT_DIR = path.resolve('/app/applet');
const CHAR_DIR = path.join(ROOT_DIR, 'public', 'models', 'characters');
const P1I_DIR = path.join(CHAR_DIR, 'p1i');
const RECON_MANIFEST_PATH = path.join(ROOT_DIR, 'public', 'models', 'reconstruction-sheets', 'manifest.json');
const RIG_REPORT_PATH = path.join(ROOT_DIR, 'docs', 'production', 'p1i-rig-validation.json');

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

// Bottom-Half 4x4 Dedicated Appendage & Parallax Material Tiles [U: 0..1, V: 0.5..1.0]
const TILES = {
  FUR_PRIMARY: [0, 0],
  FUR_SECONDARY: [1, 0],
  IVORY_FANG: [2, 0],
  EYE_LEFT: [3, 0],
  JACKET_MAIN: [0, 1],
  JACKET_ACCENT: [1, 1],
  INNER_SHIRT: [2, 1],
  EYE_RIGHT: [3, 1],
  PANTS_CARGO: [0, 2],
  SNEAKER_BODY: [1, 2],
  ARMOR_GOLD: [2, 2],
  SASH_TABARD: [3, 2],
  SPIDER_CHITIN: [0, 3],
  STORM_MANE: [1, 3],
  TAIL_EMBER: [2, 3],
  TAIL_MEMORY: [3, 3],
};

// Parts that receive direct Front [0..0.5, 0..0.5] & Rear [0.5..1.0, 0..0.5] Orthographic Artwork Projection
// (while 3D convex eyes, curved ivory fangs/claws, spider limbs, storm-mane crests, and tails use dedicated unoccluded tiles!)
const ARTWORK_PROJECTED_TAGS = new Set([
  'torso',
  'pelvis_hip',
  'belt',
  'sash',
  'jacket',
  'collar',
  'head',
  'snout',
  'jaw',
  'ear_L',
  'ear_R',
  'eyelid_L',
  'eyelid_R',
  'mane_lion',
  'arm_L',
  'arm_R',
  'hand_L',
  'hand_R',
  'leg_L',
  'leg_R',
  'foot_L',
  'foot_R',
]);

function smoothstep01(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

class ReconstructedMeshAccumulator {
  constructor() {
    this.positions = [];
    this.uvs = [];
    this.tags = [];
    this.indices = [];
  }

  get vertexCount() {
    return this.positions.length;
  }

  /** Maps into the Bottom-Half [V: 0.5..1.0] 4x4 Material Tile Region */
  mapTileUv(tile, uLocal, vLocal, uSubRange = null) {
    const [col, row] = tile;
    let uIn = Math.max(0.05, Math.min(0.95, uLocal));
    if (uSubRange) {
      uIn = uSubRange[0] + (uSubRange[1] - uSubRange[0]) * uIn;
    }
    const vIn = Math.max(0.05, Math.min(0.95, vLocal));
    return [(col + uIn) * 0.25, 0.5 + (row + vIn) * 0.125];
  }

  addLoft(rings, opts) {
    const {
      radialSegs = 20,
      tile = TILES.FUR_PRIMARY,
      splitTilePositiveX = null,
      uSubRange = null,
      thetaStart = 0,
      thetaLength = Math.PI * 2,
      closedCircle = Math.abs(thetaLength - Math.PI * 2) < 1e-4,
      capStart = true,
      capEnd = true,
      tag = 'body',
      doubleSidedShell = false,
      shellThickness = 0.014,
      liningTile = TILES.JACKET_ACCENT,
      planarFrontUv = false,
    } = opts;

    const ringCount = rings.length;
    const cols = radialSegs + 1;
    const baseVertex = this.vertexCount;

    const rotMat = new THREE.Matrix4();
    const euler = new THREE.Euler();
    const pt = new THREE.Vector3();

    let maxRx = 0.001;
    let maxRz = 0.001;
    for (const r of rings) {
      if (r.rx > maxRx) maxRx = r.rx;
      if (r.rz > maxRz) maxRz = r.rz;
    }

    for (let r = 0; r < ringCount; r++) {
      const ring = rings[r];
      const vFrac = ringCount > 1 ? r / (ringCount - 1) : 0.5;
      euler.set(ring.pitch || 0, ring.yaw || 0, ring.roll || 0, 'YXZ');
      rotMat.makeRotationFromEuler(euler);
      const ringTile = ring.tileOverride || tile;

      for (let s = 0; s < cols; s++) {
        const uFrac = s / radialSegs;
        const theta = thetaStart + uFrac * thetaLength;
        const lobeScale = ring.lobe ? ring.lobe(theta, vFrac) : 1.0;
        const lx = Math.sin(theta) * ring.rx * lobeScale;
        const lz = Math.cos(theta) * ring.rz * lobeScale;
        const ly = ring.crown ? ring.crown(theta) : 0;

        pt.set(lx, ly, lz).applyMatrix4(rotMat);
        const wx = ring.cx + pt.x;
        const wy = ring.cy + pt.y;
        const wz = ring.cz + pt.z;

        const chosenTile = splitTilePositiveX && wx > 0.002 ? splitTilePositiveX : ringTile;
        let uMap = uFrac;
        let vMap = vFrac;
        if (planarFrontUv) {
          uMap = 0.5 + (lx / maxRx) * 0.44;
          vMap = 0.5 + (lz / maxRz) * 0.44;
        } else if (closedCircle) {
          uMap = Math.acos(Math.max(-1, Math.min(1, Math.cos(theta)))) / Math.PI;
        }

        const [uAtlas, vAtlas] = this.mapTileUv(chosenTile, uMap, vMap, uSubRange);
        this.positions.push([wx, wy, wz]);
        this.uvs.push([uAtlas, vAtlas]);
        this.tags.push({ tag, theta, vFrac, localX: lx, localZ: lz, isShellInterior: false });
      }
    }

    for (let r = 0; r < ringCount - 1; r++) {
      for (let s = 0; s < radialSegs; s++) {
        const a = baseVertex + r * cols + s;
        const b = baseVertex + (r + 1) * cols + s;
        const c = baseVertex + (r + 1) * cols + (s + 1);
        const d = baseVertex + r * cols + (s + 1);
        this.indices.push(a, d, c);
        this.indices.push(a, c, b);
      }
    }

    if (closedCircle && capStart && rings[0].rx + rings[0].rz > 0.004) {
      const r0 = rings[0];
      const cIdx = this.vertexCount;
      const chosenTile = splitTilePositiveX && r0.cx > 0.002 ? splitTilePositiveX : r0.tileOverride || tile;
      this.positions.push([r0.cx, r0.cy - (r0.capDrop || 0), r0.cz]);
      this.uvs.push(this.mapTileUv(chosenTile, planarFrontUv ? 0.5 : 0.06, planarFrontUv ? 0.5 : 0.05, uSubRange));
      this.tags.push({ tag, theta: 0, vFrac: 0, localX: 0, localZ: 0, isShellInterior: false });
      for (let s = 0; s < radialSegs; s++) {
        this.indices.push(cIdx, baseVertex + s + 1, baseVertex + s);
      }
    }

    if (closedCircle && capEnd && rings[ringCount - 1].rx + rings[ringCount - 1].rz > 0.004) {
      const rn = rings[ringCount - 1];
      const cIdx = this.vertexCount;
      const lastRow = baseVertex + (ringCount - 1) * cols;
      const chosenTile = splitTilePositiveX && rn.cx > 0.002 ? splitTilePositiveX : rn.tileOverride || tile;
      euler.set(rn.pitch || 0, rn.yaw || 0, rn.roll || 0, 'YXZ');
      rotMat.makeRotationFromEuler(euler);
      pt.set(0, rn.capLift || 0, 0).applyMatrix4(rotMat);
      this.positions.push([rn.cx + pt.x, rn.cy + pt.y, rn.cz + pt.z]);
      this.uvs.push(this.mapTileUv(chosenTile, planarFrontUv ? 0.5 : 0.06, planarFrontUv ? 0.5 : 0.95, uSubRange));
      this.tags.push({ tag, theta: 0, vFrac: 1, localX: 0, localZ: 0, isShellInterior: false });
      for (let s = 0; s < radialSegs; s++) {
        this.indices.push(cIdx, lastRow + s, lastRow + s + 1);
      }
    }

    if (doubleSidedShell && !closedCircle) {
      const innerBase = this.vertexCount;
      for (let r = 0; r < ringCount; r++) {
        const ring = rings[r];
        const vFrac = ringCount > 1 ? r / (ringCount - 1) : 0.5;
        euler.set(ring.pitch || 0, ring.yaw || 0, ring.roll || 0, 'YXZ');
        rotMat.makeRotationFromEuler(euler);
        for (let s = 0; s < cols; s++) {
          const uFrac = s / radialSegs;
          const theta = thetaStart + uFrac * thetaLength;
          const lobeScale = ring.lobe ? ring.lobe(theta, vFrac) : 1.0;
          const lx = Math.sin(theta) * Math.max(0.01, ring.rx * lobeScale - shellThickness);
          const lz = Math.cos(theta) * Math.max(0.01, ring.rz * lobeScale - shellThickness);
          const ly = ring.crown ? ring.crown(theta) : 0;
          pt.set(lx, ly, lz).applyMatrix4(rotMat);
          const wx = ring.cx + pt.x;
          const wy = ring.cy + pt.y;
          const wz = ring.cz + pt.z;
          const [uAtlas, vAtlas] = this.mapTileUv(liningTile, uFrac, vFrac);
          this.positions.push([wx, wy, wz]);
          this.uvs.push([uAtlas, vAtlas]);
          // Keep interior garment lining on clean dedicated lining tile!
          this.tags.push({ tag, theta, vFrac, localX: lx, localZ: lz, isShellInterior: true });
        }
      }
      for (let r = 0; r < ringCount - 1; r++) {
        for (let s = 0; s < radialSegs; s++) {
          const a = innerBase + r * cols + s;
          const b = innerBase + (r + 1) * cols + s;
          const c = innerBase + (r + 1) * cols + (s + 1);
          const d = innerBase + r * cols + (s + 1);
          this.indices.push(a, c, d);
          this.indices.push(a, b, c);
        }
      }
      for (let r = 0; r < ringCount - 1; r++) {
        const o0 = baseVertex + r * cols;
        const o1 = baseVertex + (r + 1) * cols;
        const i0 = innerBase + r * cols;
        const i1 = innerBase + (r + 1) * cols;
        this.indices.push(o0, o1, i1, o0, i1, i0);

        const ro0 = baseVertex + r * cols + radialSegs;
        const ro1 = baseVertex + (r + 1) * cols + radialSegs;
        const ri0 = innerBase + r * cols + radialSegs;
        const ri1 = innerBase + (r + 1) * cols + radialSegs;
        this.indices.push(ro0, ri1, ro1, ro0, ri0, ri1);
      }
    }
  }

  addSplineTube(points, radiusFn, opts) {
    const {
      tubularSegs = 16,
      radialSegs = 12,
      tile = TILES.FUR_PRIMARY,
      splitTilePositiveX = null,
      uSubRange = null,
      tag = 'spline',
      flattenY = 1.0,
      forceTileOnly = false,
    } = opts;

    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const frames = curve.computeFrenetFrames(tubularSegs, false);
    const cols = radialSegs + 1;
    const baseVertex = this.vertexCount;
    const pt = new THREE.Vector3();
    const offset = new THREE.Vector3();

    for (let i = 0; i <= tubularSegs; i++) {
      const vFrac = i / tubularSegs;
      curve.getPointAt(vFrac, pt);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const rad = Math.max(0.0022, radiusFn(vFrac));

      for (let s = 0; s < cols; s++) {
        const uFrac = s / radialSegs;
        const theta = uFrac * Math.PI * 2;
        const c = Math.cos(theta) * rad;
        const sn = Math.sin(theta) * rad * flattenY;
        offset.set(0, 0, 0).addScaledVector(N, c).addScaledVector(B, sn);
        const wx = pt.x + offset.x;
        const wy = pt.y + offset.y;
        const wz = pt.z + offset.z;

        const chosenTile = splitTilePositiveX && wx > 0.002 ? splitTilePositiveX : tile;
        const uSym = Math.acos(Math.max(-1, Math.min(1, Math.cos(theta)))) / Math.PI;
        const [uAtlas, vAtlas] = this.mapTileUv(chosenTile, uSym, vFrac, uSubRange);
        this.positions.push([wx, wy, wz]);
        this.uvs.push([uAtlas, vAtlas]);
        this.tags.push({ tag, theta, vFrac, splineT: vFrac, isShellInterior: forceTileOnly });
      }
    }

    for (let i = 0; i < tubularSegs; i++) {
      for (let s = 0; s < radialSegs; s++) {
        const a = baseVertex + i * cols + s;
        const b = baseVertex + (i + 1) * cols + s;
        const c = baseVertex + (i + 1) * cols + (s + 1);
        const d = baseVertex + i * cols + (s + 1);
        this.indices.push(a, b, c);
        this.indices.push(a, c, d);
      }
    }

    const endPt = curve.getPointAt(1.0);
    const tipIdx = this.vertexCount;
    const chosenTipTile = splitTilePositiveX && endPt.x > 0.002 ? splitTilePositiveX : tile;
    this.positions.push([endPt.x, endPt.y, endPt.z]);
    this.uvs.push(this.mapTileUv(chosenTipTile, 0.5, 0.95, uSubRange));
    this.tags.push({ tag, theta: 0, vFrac: 1, splineT: 1, isShellInterior: forceTileOnly });
    const lastRing = baseVertex + tubularSegs * cols;
    for (let s = 0; s < radialSegs; s++) {
      this.indices.push(tipIdx, lastRing + s + 1, lastRing + s);
    }
  }

  computeSmoothNormals(posArray = this.positions) {
    const vCount = posArray.length;
    const accum = new Float32Array(vCount * 3);

    const ax = new THREE.Vector3();
    const bx = new THREE.Vector3();
    const cx = new THREE.Vector3();
    const e1 = new THREE.Vector3();
    const e2 = new THREE.Vector3();
    const fn = new THREE.Vector3();

    for (let i = 0; i < this.indices.length; i += 3) {
      const i0 = this.indices[i];
      const i1 = this.indices[i + 1];
      const i2 = this.indices[i + 2];
      const p0 = posArray[i0];
      const p1 = posArray[i1];
      const p2 = posArray[i2];
      ax.set(p0[0], p0[1], p0[2]);
      bx.set(p1[0], p1[1], p1[2]);
      cx.set(p2[0], p2[1], p2[2]);
      e1.subVectors(bx, ax);
      e2.subVectors(cx, ax);
      fn.crossVectors(e1, e2);

      for (const vi of [i0, i1, i2]) {
        accum[vi * 3] += fn.x;
        accum[vi * 3 + 1] += fn.y;
        accum[vi * 3 + 2] += fn.z;
      }
    }

    const seamBuckets = new Map();
    for (let v = 0; v < vCount; v++) {
      const p = posArray[v];
      const tag = this.tags[v]?.tag || 'body';
      const shell = this.tags[v]?.isShellInterior ? 'in' : 'out';
      const key = `${tag}_${shell}_${Math.round(p[0] * 5000)}_${Math.round(p[1] * 5000)}_${Math.round(p[2] * 5000)}`;
      let list = seamBuckets.get(key);
      if (!list) {
        list = [];
        seamBuckets.set(key, list);
      }
      list.push(v);
    }

    const out = new Float32Array(vCount * 3);
    for (const list of seamBuckets.values()) {
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const v of list) {
        sx += accum[v * 3];
        sy += accum[v * 3 + 1];
        sz += accum[v * 3 + 2];
      }
      const len = Math.hypot(sx, sy, sz) || 1;
      const nx = sx / len;
      const ny = sy / len;
      const nz = sz / len;
      for (const v of list) {
        out[v * 3] = nx;
        out[v * 3 + 1] = ny;
        out[v * 3 + 2] = nz;
      }
    }
    return out;
  }

  /**
   * Applies Zero-Bleed Dual-Hemisphere Orthographic Artwork Projection onto core body, head & garments!
   * Preserves precomputed welded smooth vertex normals while splitting UV seams cleanly along the lateral
   * silhouette (fnz < -0.02 vs fnz >= -0.02) so ZERO triangles ever streak across the Front/Rear boundary.
   */
  applyDualHemisphereArtworkProjection(spec, skel, landmarks, baseNormals) {
    const crownY = landmarks.crownY ?? 88;
    const footY = landmarks.footY ?? 976;
    const frontSpans = landmarks.frontSpans128;
    const backSpans = landmarks.backSpans128;

    // 3D top of head/ears in world meters
    const headTopMeters = 1.88 * skel.S;
    const bodySpanNormY = (footY - crownY) / 1024.0;
    const crownNormY = crownY / 1024.0;

    const LEG_TAGS = new Set(['leg_L', 'leg_R', 'foot_L', 'foot_R', 'toe_L', 'toe_R']);

    // Precompute 3D mesh horizontal bounds per 128-row plate scanline so every 3D row maps 1:1 into the 2D silhouette!
    const meshMaxAbsX = new Float32Array(128).fill(0.12);
    const meshLegMinAbsX = new Float32Array(128).fill(1e6);
    const meshLegMaxAbsX = new Float32Array(128).fill(0.05);

    const rowIndexForWy = (wy) => {
      const hFrac = Math.max(0.0, Math.min(1.04, wy / headTopMeters));
      const vPlate = Math.max(0.012, Math.min(0.988, crownNormY + (1.0 - hFrac) * bodySpanNormY));
      return { vPlate, rIdx: Math.max(0, Math.min(127, Math.floor(vPlate * 128))) };
    };

    for (let v = 0; v < this.vertexCount; v++) {
      const m = this.tags[v];
      if (!m || m.isShellInterior || !ARTWORK_PROJECTED_TAGS.has(m.tag)) continue;
      const axVal = Math.abs(this.positions[v][0]);
      const { rIdx } = rowIndexForWy(this.positions[v][1]);
      for (const dr of [-1, 0, 1]) {
        const rr = Math.max(0, Math.min(127, rIdx + dr));
        if (axVal > meshMaxAbsX[rr]) meshMaxAbsX[rr] = axVal;
        if (LEG_TAGS.has(m.tag)) {
          if (axVal < meshLegMinAbsX[rr]) meshLegMinAbsX[rr] = axVal;
          if (axVal > meshLegMaxAbsX[rr]) meshLegMaxAbsX[rr] = axVal;
        }
      }
    }

    const projectUv = (wx, wy, nx, isBack, tag) => {
      const { vPlate, rIdx } = rowIndexForWy(wy);
      const spans = isBack ? backSpans : frontSpans;
      const hemiX = isBack ? -wx : wx;
      const grazePull = 1.0 - Math.pow(Math.min(1, Math.abs(nx)), 2.4) * 0.10;

      let xPx = 512.0;
      if (Array.isArray(spans) && spans[rIdx]) {
        const [fullL, fullR, negMin, negMax, posMin, posMax] = spans[rIdx];
        const isLegPart = LEG_TAGS.has(tag);
        const hasSplitLegs = posMin > 516 && negMax < 508 && posMax - posMin >= 14 && negMax - negMin >= 14;

        if (isLegPart && hasSplitLegs) {
          const lMin = meshLegMinAbsX[rIdx] < 1e5 ? meshLegMinAbsX[rIdx] : 0.04;
          const lMax = Math.max(lMin + 0.03, meshLegMaxAbsX[rIdx]);
          // Map across the 3D leg cylinder onto [innerInset .. outerInset] of the corresponding 2D trouser/boot column!
          let tLeg = (Math.abs(wx) - lMin) / (lMax - lMin);
          tLeg = 0.5 + (Math.max(0.0, Math.min(1.0, tLeg)) - 0.5) * 0.84 * grazePull;
          if (hemiX >= 0) {
            const p0 = posMin + 4;
            const p1 = Math.max(p0 + 2, posMax - 4);
            xPx = p0 + tLeg * (p1 - p0);
          } else {
            const n1 = negMax - 4;
            const n0 = Math.min(n1 - 2, negMin + 4);
            xPx = n1 - tLeg * (n1 - n0);
          }
        } else {
          const maxW = Math.max(0.06, meshMaxAbsX[rIdx]);
          const sFrac = Math.max(-0.94, Math.min(0.94, (hemiX / maxW) * grazePull));
          if (sFrac >= 0) {
            const rightSpan = Math.max(6, fullR - 5 - 512);
            xPx = 512.0 + sFrac * rightSpan;
          } else {
            const leftSpan = Math.max(6, 512 - (fullL + 5));
            xPx = 512.0 + sFrac * leftSpan;
          }
        }
      } else {
        xPx = 512.0 + hemiX * 420.0 * grazePull;
      }

      const uPlate = Math.max(0.012, Math.min(0.988, xPx / 1024.0));
      const uAtlas = isBack ? 0.5 + uPlate * 0.5 : uPlate * 0.5;
      const vAtlas = vPlate * 0.5;
      return [uAtlas, vAtlas];
    };

    const normalList = [];
    for (let v = 0; v < this.vertexCount; v++) {
      normalList.push([baseNormals[v * 3], baseNormals[v * 3 + 1], baseNormals[v * 3 + 2]]);
    }

    // Cache hemisphere-assigned vertex index (origVertexIdx * 2 + (isBack ? 1 : 0))
    const hemiVertexMap = new Map();
    const ax = new THREE.Vector3();
    const bx = new THREE.Vector3();
    const cx = new THREE.Vector3();
    const e1 = new THREE.Vector3();
    const e2 = new THREE.Vector3();
    const fn = new THREE.Vector3();

    for (let t = 0; t < this.indices.length; t += 3) {
      const tri = [this.indices[t], this.indices[t + 1], this.indices[t + 2]];
      const m0 = this.tags[tri[0]];
      if (!m0 || m0.isShellInterior || !ARTWORK_PROJECTED_TAGS.has(m0.tag)) {
        continue;
      }

      const p0 = this.positions[tri[0]];
      const p1 = this.positions[tri[1]];
      const p2 = this.positions[tri[2]];
      ax.set(p0[0], p0[1], p0[2]);
      bx.set(p1[0], p1[1], p1[2]);
      cx.set(p2[0], p2[1], p2[2]);
      e1.subVectors(bx, ax);
      e2.subVectors(cx, ax);
      fn.crossVectors(e1, e2).normalize();

      const isBack = fn.z < -0.02;

      for (let k = 0; k < 3; k++) {
        const origVi = tri[k];
        const mapKey = origVi * 2 + (isBack ? 1 : 0);
        let assignedVi = hemiVertexMap.get(mapKey);

        if (assignedVi === undefined) {
          const otherKey = origVi * 2 + (isBack ? 0 : 1);
          const pos = this.positions[origVi];
          const nrm = normalList[origVi];
          const vTag = this.tags[origVi]?.tag || 'torso';
          const projUv = projectUv(pos[0], pos[1], nrm[0], isBack, vTag);

          if (!hemiVertexMap.has(otherKey)) {
            this.uvs[origVi] = projUv;
            assignedVi = origVi;
          } else {
            assignedVi = this.positions.length;
            this.positions.push([pos[0], pos[1], pos[2]]);
            this.uvs.push(projUv);
            this.tags.push({ ...this.tags[origVi] });
            normalList.push([nrm[0], nrm[1], nrm[2]]);
          }
          hemiVertexMap.set(mapKey, assignedVi);
        }

        this.indices[t + k] = assignedVi;
      }
    }

    const finalNormals = new Float32Array(normalList.length * 3);
    for (let v = 0; v < normalList.length; v++) {
      finalNormals[v * 3] = normalList[v][0];
      finalNormals[v * 3 + 1] = normalList[v][1];
      finalNormals[v * 3 + 2] = normalList[v][2];
    }
    return finalNormals;
  }
}

const ROSTER_SPECS = [
  {
    id: 'kai',
    height: 1.82,
    shoulderWidth: 0.242,
    armSpreadOffset: 0.105,
    hipWidth: 0.126,
    bulk: 0.96,
    spiderCount: 4,
    maneCount: 0,
    tailMode: 'none',
    hasCrownSpikes: true,
    garmentStyle: 'techwear_kai',
  },
  {
    id: 'jax',
    height: 1.88,
    shoulderWidth: 0.270,
    armSpreadOffset: 0.128,
    hipWidth: 0.136,
    bulk: 1.06,
    spiderCount: 0,
    maneCount: 7,
    tailMode: 'none',
    hasCrownSpikes: true,
    garmentStyle: 'techwear_jax',
  },
  {
    id: 'kaijax',
    height: 2.04,
    shoulderWidth: 0.300,
    armSpreadOffset: 0.112,
    hipWidth: 0.150,
    bulk: 1.13,
    spiderCount: 4,
    maneCount: 7,
    tailMode: 'tri_canon', // STRICTLY 3 PHYSICAL TAILS: Ember, Storm, Memory!
    hasCrownSpikes: true,
    splitFurYinYang: true,
    garmentStyle: 'fusion_coat',
  },
  {
    id: 'boryn',
    height: 2.12,
    shoulderWidth: 0.342,
    armSpreadOffset: 0.205,
    hipWidth: 0.168,
    bulk: 1.30,
    spiderCount: 0,
    maneCount: 0,
    tailMode: 'single',
    hasCrownSpikes: false,
    garmentStyle: 'shield_harness',
  },
  {
    id: 'borax',
    height: 2.20,
    shoulderWidth: 0.332,
    armSpreadOffset: 0.220,
    hipWidth: 0.164,
    bulk: 1.24,
    spiderCount: 0,
    maneCount: 0,
    hasLionMane: true,
    tailMode: 'single',
    hasCrownSpikes: false,
    garmentStyle: 'storm_ronin',
  },
];

function buildSkeletonDefinition(spec) {
  const H = spec.height;
  const S = H / 1.85;
  const shX = spec.shoulderWidth;
  const hipX = spec.hipWidth;
  const armSpread = spec.armSpreadOffset ?? 0.115;

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

  // Core Spine, Neck, Sabertooth Head, Jaw & Ears
  addBone('pelvis', null, [0, 0.94 * S, 0]);
  addBone('spine_01', 'pelvis', [0, 1.07 * S, 0]);
  addBone('spine_02', 'spine_01', [0, 1.21 * S, 0.01 * S]);
  addBone('chest', 'spine_02', [0, 1.35 * S, 0.012 * S]);
  addBone('neck', 'chest', [0, 1.49 * S, 0.02 * S]);
  addBone('head', 'neck', [0, 1.595 * S, 0.032 * S]);
  addBone('jaw', 'head', [0, 1.528 * S, 0.088 * S]);
  addBone('ear_L', 'head', [0.128 * S, 1.725 * S, -0.008 * S]);
  addBone('ear_R', 'head', [-0.128 * S, 1.725 * S, -0.008 * S]);

  // Arms & Articulated Hands calibrated to orthographic A-pose angle
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`clavicle_${suf}`, 'chest', [sign * 0.095 * S, 1.43 * S, 0.01 * S]);
    addBone(`upper_arm_${suf}`, `clavicle_${suf}`, [sign * shX, 1.40 * S, -0.005 * S]);
    addBone(`forearm_${suf}`, `upper_arm_${suf}`, [sign * (shX + armSpread * 0.62 * S), 1.14 * S, -0.014 * S]);
    addBone(`hand_${suf}`, `forearm_${suf}`, [sign * (shX + armSpread * S), 0.885 * S, 0.042 * S]);
  }

  // Legs, Ankles & Clawed Feet
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`thigh_${suf}`, 'pelvis', [sign * hipX, 0.90 * S, 0]);
    addBone(`shin_${suf}`, `thigh_${suf}`, [sign * (hipX + 0.012 * S), 0.49 * S, 0.022 * S]);
    addBone(`foot_${suf}`, `shin_${suf}`, [sign * (hipX + 0.018 * S), 0.11 * S, 0.005 * S]);
    addBone(`toe_${suf}`, `foot_${suf}`, [sign * (hipX + 0.018 * S), 0.04 * S, 0.148 * S]);
  }

  // Kai & Kai-Jax: 4 Segmented Dorsal Spider Limbs (12 bones)
  const spiderChains = [];
  if (spec.spiderCount === 4) {
    const spiderConfigs = [
      { prefix: 'spider_UL', sign: 1, upper: true },
      { prefix: 'spider_UR', sign: -1, upper: true },
      { prefix: 'spider_LL', sign: 1, upper: false },
      { prefix: 'spider_LR', sign: -1, upper: false },
    ];
    for (const cfg of spiderConfigs) {
      const s = cfg.sign;
      const p0 = cfg.upper
        ? [s * 0.105 * S, 1.42 * S, -0.145 * S]
        : [s * 0.125 * S, 1.25 * S, -0.155 * S];
      const p1 = cfg.upper
        ? [s * 0.44 * S, 1.88 * S, -0.22 * S]
        : [s * 0.52 * S, 1.46 * S, -0.25 * S];
      const p2 = cfg.upper
        ? [s * 0.54 * S, 2.12 * S, -0.03 * S]
        : [s * 0.68 * S, 1.06 * S, -0.06 * S];
      const pTip = cfg.upper
        ? [s * 0.30 * S, 1.88 * S, 0.18 * S]
        : [s * 0.52 * S, 0.58 * S, 0.16 * S];

      addBone(`${cfg.prefix}_01`, 'chest', p0);
      addBone(`${cfg.prefix}_02`, `${cfg.prefix}_01`, p1);
      addBone(`${cfg.prefix}_03`, `${cfg.prefix}_02`, p2);
      spiderChains.push({ ...cfg, points: [p0, p1, p2, pTip] });
    }
  }

  // Jax & Kai-Jax: 7 Swept-Back Electric Storm-Mane Crests (7 bones)
  const maneChains = [];
  if (spec.maneCount === 7) {
    for (let i = 1; i <= 7; i++) {
      const u = (i - 4) / 3;
      const crownFactor = 1 - Math.abs(u) * 0.38;
      const base = [u * 0.125 * S, (1.715 - Math.abs(u) * 0.065) * S, (0.045 - Math.abs(u) * 0.045) * S];
      const crest = [u * 0.195 * S, (1.92 * crownFactor + 0.09) * S, -0.10 * S];
      const sweep = [u * 0.255 * S, (1.84 * crownFactor + 0.04) * S, -0.32 * S];
      const tip = [u * 0.295 * S, (1.68 * crownFactor) * S, -0.52 * S];
      addBone(`mane_0${i}`, 'head', base);
      maneChains.push({ name: `mane_0${i}`, u, points: [base, crest, sweep, tip] });
    }
  }

  // Physical Tails (STRICTLY 3 for Kai-Jax; 1 for Boryn & Borax; 0 for Kai & Jax)
  const tailChains = [];
  if (spec.tailMode === 'tri_canon') {
    const triDefs = [
      {
        prefix: 'tail_ember',
        tile: TILES.TAIL_EMBER,
        uSub: null,
        pts: [
          [-0.09 * S, 0.92 * S, -0.14 * S],
          [-0.36 * S, 0.74 * S, -0.34 * S],
          [-0.56 * S, 0.46 * S, -0.44 * S],
          [-0.46 * S, 0.26 * S, -0.16 * S],
          [-0.32 * S, 0.52 * S, 0.02 * S],
        ],
      },
      {
        prefix: 'tail_storm',
        tile: TILES.TAIL_MEMORY,
        uSub: [0.04, 0.46],
        pts: [
          [0, 0.92 * S, -0.15 * S],
          [0.06 * S, 0.66 * S, -0.42 * S],
          [0.14 * S, 0.34 * S, -0.56 * S],
          [0.06 * S, 0.18 * S, -0.26 * S],
          [0.02 * S, 0.40 * S, -0.08 * S],
        ],
      },
      {
        prefix: 'tail_memory',
        tile: TILES.TAIL_MEMORY,
        uSub: [0.54, 0.96],
        pts: [
          [0.09 * S, 0.92 * S, -0.14 * S],
          [0.36 * S, 0.74 * S, -0.34 * S],
          [0.56 * S, 0.48 * S, -0.44 * S],
          [0.47 * S, 0.28 * S, -0.16 * S],
          [0.34 * S, 0.56 * S, 0.02 * S],
        ],
      },
    ];
    for (const td of triDefs) {
      for (let seg = 1; seg <= 4; seg++) {
        const bName = `${td.prefix}_0${seg}`;
        const pName = seg === 1 ? 'pelvis' : `${td.prefix}_0${seg - 1}`;
        addBone(bName, pName, td.pts[seg - 1]);
      }
      tailChains.push(td);
    }
  } else if (spec.tailMode === 'single') {
    const pts = [
      [0, 0.92 * S, -0.15 * S],
      [0.08 * S, 0.68 * S, -0.38 * S],
      [0.16 * S, 0.44 * S, -0.46 * S],
      [0.20 * S, 0.28 * S, -0.28 * S],
      [0.16 * S, 0.42 * S, -0.14 * S],
    ];
    for (let seg = 1; seg <= 4; seg++) {
      const bName = `tail_0${seg}`;
      const pName = seg === 1 ? 'pelvis' : `tail_0${seg - 1}`;
      addBone(bName, pName, pts[seg - 1]);
    }
    tailChains.push({ prefix: 'tail', tile: TILES.TAIL_EMBER, uSub: null, pts });
  }

  return { bones, byName, S, spiderChains, maneChains, tailChains };
}

function sculptReconstructedGeometry(spec, skel, tier) {
  const isMaster = tier === 'master';
  // Multiples of 4 ensure clean front/back/side symmetry lines!
  const R_BODY = isMaster ? 28 : 14;
  const R_LIMB = isMaster ? 20 : 10;
  const R_DETAIL = isMaster ? 14 : 8;
  const SUB_RINGS = isMaster ? 3 : 1;

  const { S, byName, spiderChains, maneChains, tailChains } = skel;
  const B = spec.bulk;
  const shX = spec.shoulderWidth;
  const hipX = spec.hipWidth;
  const splitFur = spec.splitFurYinYang ? TILES.FUR_SECONDARY : null;

  const acc = new ReconstructedMeshAccumulator();

  const subdivideRings = (rings, mult) => {
    if (mult <= 1) return rings;
    const out = [];
    for (let i = 0; i < rings.length - 1; i++) {
      const a = rings[i];
      const b = rings[i + 1];
      out.push(a);
      for (let m = 1; m < mult; m++) {
        const t = m / mult;
        out.push({
          cx: a.cx + (b.cx - a.cx) * t,
          cy: a.cy + (b.cy - a.cy) * t,
          cz: a.cz + (b.cz - a.cz) * t,
          rx: a.rx + (b.rx - a.rx) * t,
          rz: a.rz + (b.rz - a.rz) * t,
          pitch: (a.pitch || 0) + ((b.pitch || 0) - (a.pitch || 0)) * t,
          yaw: (a.yaw || 0) + ((b.yaw || 0) - (a.yaw || 0)) * t,
          roll: (a.roll || 0) + ((b.roll || 0) - (a.roll || 0)) * t,
          lobe: a.lobe || b.lobe,
          crown: a.crown || b.crown,
          tileOverride: t < 0.5 ? a.tileOverride : b.tileOverride,
        });
      }
    }
    out.push(rings[rings.length - 1]);
    return out;
  };

  // 1. Sculpted V-Taper Pectoral/Abdominal Torso & Furred Neck
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 0.88 * S, cz: 0, rx: 0.144 * B * S, rz: 0.114 * B * S },
        {
          cx: 0,
          cy: 1.03 * S,
          cz: 0.004 * S,
          rx: 0.142 * B * S,
          rz: 0.116 * B * S,
          lobe: (th) => 1 + Math.max(0, Math.cos(th)) * 0.05 * Math.cos(th * 4),
        },
        {
          cx: 0,
          cy: 1.19 * S,
          cz: 0.012 * S,
          rx: 0.172 * B * S,
          rz: 0.136 * B * S,
          lobe: (th) => 1 + Math.max(0, Math.cos(th)) * 0.09,
        },
        {
          cx: 0,
          cy: 1.35 * S,
          cz: 0.018 * S,
          rx: 0.204 * B * S,
          rz: 0.150 * B * S,
          lobe: (th) => 1 + Math.pow(Math.max(0, Math.cos(th)), 2) * 0.13,
        },
        { cx: 0, cy: 1.465 * S, cz: 0.020 * S, rx: 0.114 * B * S, rz: 0.106 * B * S },
        { cx: 0, cy: 1.580 * S, cz: 0.028 * S, rx: 0.096 * B * S, rz: 0.096 * B * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: TILES.INNER_SHIRT, splitTilePositiveX: splitFur, tag: 'torso' }
  );

  // 1B. Sculpted Pelvis & Tactical Belt / Buckle Relief
  acc.addLoft(
    [
      {
        cx: 0,
        cy: 0.77 * S,
        cz: 0.004 * S,
        rx: (hipX + 0.070 * B) * S,
        rz: 0.116 * B * S,
        capDrop: 0.015 * S,
        lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.08 - Math.pow(Math.cos(th), 4) * 0.08,
      },
      {
        cx: 0,
        cy: 0.875 * S,
        cz: 0.003 * S,
        rx: (hipX + 0.066 * B) * S,
        rz: 0.124 * B * S,
        lobe: (th) => 1 + Math.max(0, -Math.cos(th)) * 0.10,
      },
      { cx: 0, cy: 0.970 * S, cz: 0.002 * S, rx: 0.158 * B * S, rz: 0.126 * B * S, capLift: 0.008 * S },
    ],
    { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: 'pelvis_hip' }
  );

  acc.addLoft(
    [
      { cx: 0, cy: 0.922 * S, cz: 0.005 * S, rx: 0.166 * B * S, rz: 0.132 * B * S },
      { cx: 0, cy: 0.982 * S, cz: 0.005 * S, rx: 0.164 * B * S, rz: 0.130 * B * S },
    ],
    { radialSegs: R_LIMB, tile: TILES.SASH_TABARD, tag: 'belt' }
  );

  const buckleScale = spec.id === 'borax' || spec.id === 'boryn' || spec.id === 'kaijax' ? 1.25 : 0.85;
  acc.addLoft(
    [
      { cx: 0, cy: 0.952 * S, cz: 0.130 * B * S, rx: 0.048 * buckleScale * S, rz: 0.044 * buckleScale * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 0.952 * S, cz: (0.130 * B + 0.024) * S, rx: 0.040 * buckleScale * S, rz: 0.036 * buckleScale * S, pitch: Math.PI * 0.5, capLift: 0.008 * S },
    ],
    { radialSegs: 12, tile: TILES.ARMOR_GOLD, tag: 'belt' }
  );

  // 2. Sculpted Sabertooth Wedge Cranium + Cheek Ruff Tufts + Crown Fur Locks
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.505 * S, cz: 0.018 * S, rx: 0.100 * S, rz: 0.104 * S, capDrop: 0.010 * S },
        {
          cx: 0,
          cy: 1.578 * S,
          cz: 0.035 * S,
          rx: 0.160 * S,
          rz: 0.148 * S,
          lobe: (th) =>
            1 +
            Math.pow(Math.abs(Math.sin(th)), 3) * 0.25 -
            Math.pow(Math.max(0, Math.cos(th)), 4) * 0.06 +
            (Math.cos(th) < -0.35 ? 0.06 : 0),
        },
        {
          cx: 0,
          cy: 1.650 * S,
          cz: 0.038 * S,
          rx: 0.144 * S,
          rz: 0.148 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 4) * 0.13 + Math.pow(Math.max(0, Math.cos(th)), 3) * 0.08,
        },
        { cx: 0, cy: 1.722 * S, cz: 0.018 * S, rx: 0.116 * S, rz: 0.128 * S },
        { cx: 0, cy: 1.772 * S, cz: 0.002 * S, rx: 0.074 * S, rz: 0.088 * S, capLift: 0.018 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'head' }
  );

  // Layered Cheek Ruff Fur Locks
  for (const sign of [-1, 1]) {
    const ruffTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    for (let r = 0; r < 4; r++) {
      const yOff = (r - 1.5) * 0.028 * S;
      const lenScale = r === 1 || r === 2 ? 1.18 : 0.90;
      acc.addSplineTube(
        [
          [sign * 0.118 * S, 1.592 * S + yOff, 0.056 * S],
          [sign * 0.190 * lenScale * S, 1.594 * S + yOff * 1.12, 0.016 * S],
          [sign * 0.246 * lenScale * S, 1.600 * S + yOff * 1.28, -0.042 * S],
        ],
        (t) => (1 - Math.pow(t, 1.12) * 0.90) * 0.029 * S,
        { tubularSegs: isMaster ? 6 : 4, radialSegs: isMaster ? 8 : 5, tile: ruffTile, tag: 'head', flattenY: 0.52 }
      );
    }
  }

  if (spec.hasCrownSpikes) {
    const crownLocks = spec.id === 'jax' ? [-0.30, 0, 0.30] : [-0.46, -0.22, 0, 0.22, 0.46];
    for (const ang of crownLocks) {
      const cTile = ang > 0.01 && splitFur ? splitFur : TILES.FUR_PRIMARY;
      const hBoost = 1 - Math.abs(ang) * 0.38;
      acc.addSplineTube(
        [
          [ang * 0.14 * S, 1.735 * S, 0.042 * S],
          [ang * 0.19 * S, (1.815 * hBoost + 0.025) * S, 0.012 * S],
          [ang * 0.23 * S, (1.882 * hBoost + 0.035) * S, -0.045 * S],
        ],
        (t) => (1 - Math.pow(t, 1.18) * 0.92) * 0.030 * S,
        { tubularSegs: isMaster ? 6 : 4, radialSegs: isMaster ? 6 : 5, tile: cTile, tag: 'head', flattenY: 0.62 }
      );
    }
  }

  // 3. Sculpted Sabertooth Muzzle, Nasal Bridge, Nose Leather & Articulated Lower Jaw
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.598 * S, cz: 0.104 * S, rx: 0.098 * S, rz: 0.072 * S, pitch: Math.PI * 0.44 },
        {
          cx: 0,
          cy: 1.576 * S,
          cz: 0.172 * S,
          rx: 0.090 * S,
          rz: 0.064 * S,
          pitch: Math.PI * 0.48,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.22 - Math.pow(Math.max(0, -Math.cos(th)), 4) * 0.10,
        },
        {
          cx: 0,
          cy: 1.560 * S,
          cz: 0.232 * S,
          rx: 0.074 * S,
          rz: 0.052 * S,
          pitch: Math.PI * 0.5,
          capLift: 0.015 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.15,
        },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_LIMB, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  acc.addLoft(
    [
      { cx: 0, cy: 1.650 * S, cz: 0.134 * S, rx: 0.042 * S, rz: 0.032 * S, pitch: Math.PI * 0.34 },
      { cx: 0, cy: 1.616 * S, cz: 0.188 * S, rx: 0.036 * S, rz: 0.027 * S, pitch: Math.PI * 0.38 },
      { cx: 0, cy: 1.590 * S, cz: 0.235 * S, rx: 0.031 * S, rz: 0.021 * S, pitch: Math.PI * 0.42, capLift: 0.008 * S },
    ],
    { radialSegs: 12, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  acc.addLoft(
    [
      { cx: 0, cy: 1.584 * S, cz: 0.236 * S, rx: 0.035 * S, rz: 0.024 * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 1.578 * S, cz: 0.258 * S, rx: 0.024 * S, rz: 0.017 * S, pitch: Math.PI * 0.5, capLift: 0.006 * S },
    ],
    { radialSegs: 10, tile: TILES.PANTS_CARGO, tag: 'snout' }
  );

  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.514 * S, cz: 0.082 * S, rx: 0.080 * S, rz: 0.050 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.500 * S, cz: 0.152 * S, rx: 0.066 * S, rz: 0.044 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.490 * S, cz: 0.214 * S, rx: 0.048 * S, rz: 0.036 * S, pitch: Math.PI * 0.5, capLift: 0.014 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_DETAIL, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'jaw' }
  );

  // 4. Curved Blade-Profile Ivory Sabertooth Fangs (dedicated unoccluded IVORY_FANG tile!)
  for (const sign of [-1, 1]) {
    const fScale = spec.id === 'boryn' || spec.id === 'borax' ? 1.18 : 1.02;
    const tipY = spec.id === 'boryn' || spec.id === 'borax' ? 1.385 : 1.410;
    acc.addSplineTube(
      [
        [sign * 0.054 * S, 1.552 * S, 0.196 * S],
        [sign * 0.058 * S, 1.504 * S, 0.218 * S],
        [sign * 0.056 * S, 1.456 * S, 0.220 * S],
        [sign * 0.049 * S, tipY * S, 0.206 * S],
      ],
      (t) => (1 - Math.pow(t, 1.32) * 0.88) * 0.023 * fScale * S,
      {
        tubularSegs: isMaster ? 10 : 6,
        radialSegs: isMaster ? 10 : 7,
        tile: TILES.IVORY_FANG,
        tag: 'fang',
        flattenY: 0.58,
      }
    );
  }

  // 5. Planar-UV Glowing Convex Predator Eyes + Animated Supraorbital Eyelid/Brow Ridges
  for (const [sign, eyeTile, lidTag] of [
    [1, TILES.EYE_LEFT, 'eyelid_L'],
    [-1, TILES.EYE_RIGHT, 'eyelid_R'],
  ]) {
    const ex = sign * 0.064 * S;
    const ey = 1.632 * S;
    const ez = 0.178 * S;
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez - 0.010 * S, rx: 0.038 * S, rz: 0.024 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18 },
        { cx: ex, cy: ey, cz: ez + 0.008 * S, rx: 0.036 * S, rz: 0.023 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18 },
      ],
      { radialSegs: 12, tile: TILES.PANTS_CARGO, tag: 'eye' }
    );
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez + 0.006 * S, rx: 0.033 * S, rz: 0.020 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18 },
        { cx: ex, cy: ey, cz: ez + 0.020 * S, rx: 0.029 * S, rz: 0.018 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18, capLift: 0.008 * S },
      ],
      { radialSegs: 14, tile: eyeTile, planarFrontUv: true, tag: 'eye' }
    );
    acc.addSplineTube(
      [
        [ex - sign * 0.038 * S, ey + 0.009 * S, ez + 0.018 * S],
        [ex, ey + 0.025 * S, ez + 0.022 * S],
        [ex + sign * 0.042 * S, ey + 0.038 * S, ez + 0.006 * S],
      ],
      (t) => (0.85 + Math.sin(t * Math.PI) * 0.35) * 0.015 * S,
      { tubularSegs: 6, radialSegs: 7, tile: TILES.FUR_PRIMARY, tag: lidTag, flattenY: 0.72 }
    );
  }

  // 6. Cupped Sabertooth Ears & Borax Volumetric Lion Mane
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    acc.addSplineTube(
      [
        [sign * 0.106 * S, 1.705 * S, 0.004 * S],
        [sign * 0.165 * S, 1.805 * S, -0.022 * S],
        [sign * 0.212 * S, 1.902 * S, -0.052 * S],
      ],
      (t) => (1 - Math.pow(t, 1.18) * 0.90) * 0.058 * S,
      { tubularSegs: isMaster ? 8 : 5, radialSegs: isMaster ? 10 : 6, tile: TILES.FUR_PRIMARY, tag: `ear_${suf}`, flattenY: 0.44 }
    );
  }

  if (spec.hasLionMane) {
    const outerCount = isMaster ? 16 : 10;
    for (let m = 0; m < outerCount; m++) {
      const ang = -Math.PI * 0.82 + (m / (outerCount - 1)) * Math.PI * 1.64;
      if (Math.abs(ang) < 0.36) continue;
      const sx = Math.sin(ang);
      const cz = Math.cos(ang);
      acc.addSplineTube(
        [
          [sx * 0.13 * S, 1.71 * S, cz * 0.10 * S],
          [sx * 0.28 * S, 1.66 * S, cz * 0.22 * S - 0.04 * S],
          [sx * 0.33 * S, 1.48 * S, cz * 0.26 * S - 0.10 * S],
          [sx * 0.28 * S, 1.28 * S, cz * 0.24 * S - 0.14 * S],
        ],
        (t) => Math.sin(Math.min(0.96, t * 0.84 + 0.16) * Math.PI) * 0.088 * S,
        { tubularSegs: isMaster ? 9 : 5, radialSegs: isMaster ? 9 : 6, tile: TILES.FUR_SECONDARY, tag: 'mane_lion' }
      );
    }
  }

  // 7. Layered Outerwear Shells, Lapels, Collars & Sashes (Receives Direct Orthographic Artwork Projection!)
  if (spec.garmentStyle === 'techwear_kai' || spec.garmentStyle === 'techwear_jax' || spec.garmentStyle === 'fusion_coat') {
    const isFusion = spec.garmentStyle === 'fusion_coat';
    const coatBottomY = isFusion ? 0.56 * S : spec.id === 'kai' ? 0.96 * S : 0.88 * S;
    const openGapRad = spec.id === 'kai' ? 0.54 : 0.46;
    acc.addLoft(
      subdivideRings(
        [
          {
            cx: 0,
            cy: coatBottomY,
            cz: -0.008 * S,
            rx: (isFusion ? 0.275 : 0.198) * B * S,
            rz: (isFusion ? 0.215 : 0.156) * B * S,
            lobe: (th) => 1 + Math.sin(th * 5) * 0.03,
          },
          { cx: 0, cy: 1.04 * S, cz: 0, rx: 0.190 * B * S, rz: 0.150 * B * S },
          { cx: 0, cy: 1.22 * S, cz: 0.006 * S, rx: 0.212 * B * S, rz: 0.162 * B * S },
          { cx: 0, cy: 1.41 * S, cz: 0.012 * S, rx: 0.232 * B * S, rz: 0.172 * B * S },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: openGapRad,
        thetaLength: Math.PI * 2 - openGapRad * 2,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.016 * S,
        liningTile: TILES.JACKET_ACCENT,
        tag: 'jacket',
      }
    );

    for (const sign of [-1, 1]) {
      acc.addSplineTube(
        [
          [sign * 0.115 * B * S, 1.42 * S, 0.146 * B * S],
          [sign * 0.134 * B * S, 1.24 * S, 0.160 * B * S],
          [sign * 0.120 * B * S, coatBottomY + 0.04 * S, 0.144 * B * S],
        ],
        (t) => (1.15 - t * 0.35) * 0.025 * S,
        { tubularSegs: 6, radialSegs: 6, tile: TILES.JACKET_ACCENT, tag: 'jacket', flattenY: 0.42 }
      );
    }

    acc.addLoft(
      [
        { cx: 0, cy: 1.39 * S, cz: -0.015 * S, rx: 0.194 * B * S, rz: 0.160 * B * S },
        { cx: 0, cy: 1.52 * S, cz: -0.045 * S, rx: 0.220 * B * S, rz: 0.182 * B * S },
        { cx: 0, cy: isFusion ? 1.69 * S : 1.57 * S, cz: -0.072 * S, rx: (isFusion ? 0.206 : 0.180) * B * S, rz: 0.152 * B * S },
      ],
      {
        radialSegs: R_DETAIL,
        tile: TILES.JACKET_ACCENT,
        thetaStart: Math.PI * 0.36,
        thetaLength: Math.PI * 1.28,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.015 * S,
        liningTile: isFusion ? TILES.ARMOR_GOLD : TILES.JACKET_ACCENT,
        tag: 'collar',
      }
    );
  } else if (spec.garmentStyle === 'shield_harness') {
    acc.addLoft(
      [
        { cx: 0, cy: 1.16 * S, cz: 0.01 * S, rx: 0.198 * B * S, rz: 0.154 * B * S },
        { cx: 0, cy: 1.42 * S, cz: 0.01 * S, rx: 0.224 * B * S, rz: 0.170 * B * S },
      ],
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.48,
        thetaLength: Math.PI * 2 - 0.96,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.017 * S,
        tag: 'jacket',
      }
    );
  } else if (spec.garmentStyle === 'storm_ronin') {
    acc.addLoft(
      subdivideRings(
        [
          { cx: 0, cy: 0.32 * S, cz: -0.02 * S, rx: 0.300 * B * S, rz: 0.234 * B * S },
          { cx: 0, cy: 0.72 * S, cz: -0.01 * S, rx: 0.238 * B * S, rz: 0.186 * B * S },
          { cx: 0, cy: 0.98 * S, cz: 0, rx: 0.202 * B * S, rz: 0.160 * B * S },
          { cx: 0, cy: 1.39 * S, cz: 0.01 * S, rx: 0.238 * B * S, rz: 0.178 * B * S },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.26,
        thetaLength: Math.PI * 2 - 0.52,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.016 * S,
        liningTile: TILES.ARMOR_GOLD,
        tag: 'jacket',
      }
    );
  }

  // Shoulder Pauldrons / Caps
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    if (spec.id === 'borax' || spec.id === 'kaijax' || spec.id === 'boryn') {
      const tiers = spec.id === 'borax' ? 2 : 1;
      for (let t = 0; t < tiers; t++) {
        const yDrop = t * 0.075 * S;
        acc.addLoft(
          [
            { cx: sign * (shX + 0.026 * S), cy: 1.36 * S - yDrop, cz: 0, rx: 0.110 * S, rz: 0.110 * S, roll: -sign * 0.42 },
            { cx: sign * (shX - 0.018 * S), cy: 1.45 * S - yDrop * 0.7, cz: 0, rx: 0.090 * S, rz: 0.092 * S, roll: -sign * 0.32, capLift: 0.016 * S },
          ],
          { radialSegs: R_DETAIL, tile: TILES.ARMOR_GOLD, tag: `arm_${suf}` }
        );
      }
    } else {
      acc.addLoft(
        [
          { cx: sign * shX, cy: 1.34 * S, cz: 0, rx: 0.090 * B * S, rz: 0.090 * B * S, roll: -sign * 0.25 },
          { cx: sign * (shX - 0.028 * S), cy: 1.425 * S, cz: 0, rx: 0.076 * B * S, rz: 0.078 * B * S, roll: -sign * 0.25, capLift: 0.016 * S },
        ],
        { radialSegs: R_DETAIL, tile: TILES.JACKET_ACCENT, tag: `arm_${suf}` }
      );
    }
  }

  // Front Sashes / Tactical Ribbons
  if (spec.id === 'jax') {
    for (const zOff of [0.105, 0.052]) {
      acc.addSplineTube(
        [
          [0.145 * S, 0.94 * S, zOff * S],
          [0.178 * S, 0.72 * S, (zOff + 0.01) * S],
          [0.192 * S, 0.48 * S, zOff * S],
        ],
        (t) => (1 - t * 0.22) * 0.024 * S,
        { tubularSegs: 7, radialSegs: 6, tile: TILES.SASH_TABARD, tag: 'sash', flattenY: 0.25, forceTileOnly: true }
      );
    }
  } else if (spec.id !== 'kai') {
    const sashW = 0.090;
    const sashX = spec.id === 'borax' ? -0.02 * S : 0;
    acc.addLoft(
      [
        { cx: sashX, cy: spec.id === 'borax' ? 0.38 * S : 0.44 * S, cz: 0.158 * B * S, rx: sashW * S, rz: 0.014 * S },
        { cx: sashX, cy: 0.70 * S, cz: 0.154 * B * S, rx: (sashW + 0.01) * S, rz: 0.014 * S },
        { cx: sashX, cy: 0.94 * S, cz: 0.142 * B * S, rx: sashW * S, rz: 0.016 * S },
      ],
      { radialSegs: 10, tile: TILES.SASH_TABARD, tag: 'sash' }
    );
  }

  // 8. Arms & 5-Digit Clawed Sabertooth Hands
  const sleeveBulk = spec.id === 'borax' ? 1.38 : spec.id === 'boryn' ? 1.14 : 1.06;
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const uArm = byName.get(`upper_arm_${suf}`).worldPos;
    const fArm = byName.get(`forearm_${suf}`).worldPos;
    const hPos = byName.get(`hand_${suf}`).worldPos;

    acc.addLoft(
      subdivideRings(
        [
          { cx: hPos[0], cy: hPos[1] + 0.026 * S, cz: hPos[2] - 0.012 * S, rx: 0.048 * B * S, rz: 0.048 * B * S },
          { cx: (fArm[0] + hPos[0]) * 0.5, cy: (fArm[1] + hPos[1]) * 0.5, cz: (fArm[2] + hPos[2]) * 0.5, rx: 0.064 * B * sleeveBulk * S, rz: 0.064 * B * sleeveBulk * S },
          { cx: fArm[0], cy: fArm[1] - 0.022 * S, cz: fArm[2] + 0.004 * S, rx: 0.066 * B * sleeveBulk * S, rz: 0.066 * B * sleeveBulk * S },
          { cx: fArm[0], cy: fArm[1] + 0.022 * S, cz: fArm[2] - 0.002 * S, rx: 0.068 * B * sleeveBulk * S, rz: 0.068 * B * sleeveBulk * S },
          { cx: (uArm[0] + fArm[0]) * 0.5, cy: (uArm[1] + fArm[1]) * 0.5, cz: (uArm[2] + fArm[2]) * 0.5, rx: 0.078 * B * S, rz: 0.078 * B * S },
          { cx: uArm[0] - sign * 0.015 * S, cy: uArm[1] + 0.034 * S, cz: uArm[2], rx: 0.084 * B * S, rz: 0.082 * B * S, capLift: 0.020 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: TILES.JACKET_MAIN, tag: `arm_${suf}` }
    );

    const handTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    acc.addLoft(
      [
        { cx: hPos[0] - sign * 0.004 * S, cy: hPos[1] - 0.058 * S, cz: hPos[2] + 0.018 * S, rx: 0.044 * B * S, rz: 0.032 * B * S, capDrop: 0.010 * S },
        { cx: hPos[0], cy: hPos[1] - 0.012 * S, cz: hPos[2] + 0.006 * S, rx: 0.050 * B * S, rz: 0.038 * B * S },
        { cx: hPos[0], cy: hPos[1] + 0.032 * S, cz: hPos[2] - 0.010 * S, rx: 0.046 * B * S, rz: 0.042 * B * S },
      ],
      { radialSegs: 12, tile: handTile, tag: `hand_${suf}` }
    );

    for (let c = 0; c < 4; c++) {
      const zOff = (1.5 - c) * 0.016 * S;
      const lenF = c === 1 || c === 2 ? 1.06 : 0.92;
      acc.addSplineTube(
        [
          [hPos[0] + sign * 0.014 * S, hPos[1] - 0.054 * S, hPos[2] + 0.022 * S + zOff],
          [hPos[0] + sign * 0.012 * S, hPos[1] - 0.098 * lenF * S, hPos[2] + 0.036 * S + zOff],
          [hPos[0] - sign * 0.004 * S, hPos[1] - 0.132 * lenF * S, hPos[2] + 0.032 * S + zOff],
        ],
        (t) => (1 - t * 0.55) * 0.012 * B * S,
        { tubularSegs: 5, radialSegs: 6, tile: handTile, tag: `hand_${suf}`, forceTileOnly: true }
      );
      acc.addSplineTube(
        [
          [hPos[0] - sign * 0.004 * S, hPos[1] - 0.128 * lenF * S, hPos[2] + 0.032 * S + zOff],
          [hPos[0] - sign * 0.016 * S, hPos[1] - 0.154 * lenF * S, hPos[2] + 0.026 * S + zOff],
        ],
        (t) => (1 - t * 0.88) * 0.009 * S,
        { tubularSegs: 4, radialSegs: 5, tile: TILES.IVORY_FANG, tag: `hand_${suf}`, forceTileOnly: true }
      );
    }

    acc.addSplineTube(
      [
        [hPos[0] - sign * 0.022 * S, hPos[1] - 0.022 * S, hPos[2] + 0.028 * S],
        [hPos[0] - sign * 0.034 * S, hPos[1] - 0.062 * S, hPos[2] + 0.052 * S],
        [hPos[0] - sign * 0.028 * S, hPos[1] - 0.092 * S, hPos[2] + 0.058 * S],
      ],
      (t) => (1 - t * 0.65) * 0.014 * B * S,
      { tubularSegs: 5, radialSegs: 6, tile: handTile, tag: `hand_${suf}`, forceTileOnly: true }
    );
  }

  // 9. Tapered Cargo Trousers + 3D Thigh Cargo Pockets + Clawed High-Top Sneakers
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const thPos = byName.get(`thigh_${suf}`).worldPos;
    const shPos = byName.get(`shin_${suf}`).worldPos;
    const ftPos = byName.get(`foot_${suf}`).worldPos;

    acc.addLoft(
      subdivideRings(
        [
          { cx: ftPos[0], cy: 0.195 * S, cz: ftPos[2], rx: 0.058 * B * S, rz: 0.060 * B * S },
          { cx: ftPos[0], cy: 0.255 * S, cz: ftPos[2] + 0.004 * S, rx: 0.068 * B * S, rz: 0.070 * B * S },
          { cx: shPos[0], cy: 0.375 * S, cz: shPos[2], rx: 0.094 * B * S, rz: 0.094 * B * S, lobe: (th) => 1 + Math.sin(th * 3) * 0.035 },
          { cx: shPos[0], cy: shPos[1] - 0.022 * S, cz: shPos[2], rx: 0.090 * B * S, rz: 0.092 * B * S },
          { cx: shPos[0], cy: shPos[1] + 0.025 * S, cz: shPos[2], rx: 0.094 * B * S, rz: 0.096 * B * S },
          { cx: (thPos[0] + shPos[0]) * 0.5, cy: 0.705 * S, cz: 0.012 * S, rx: 0.110 * B * S, rz: 0.110 * B * S },
          { cx: thPos[0] * 0.94, cy: thPos[1] + 0.045 * S, cz: 0, rx: 0.114 * B * S, rz: 0.114 * B * S, capLift: 0.018 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: `leg_${suf}` }
    );

    if (spec.id !== 'borax') {
      const px = thPos[0] + sign * 0.090 * B * S;
      acc.addLoft(
        [
          { cx: px, cy: 0.58 * S, cz: 0.014 * S, rx: 0.028 * B * S, rz: 0.064 * B * S },
          { cx: px + sign * 0.006 * S, cy: 0.72 * S, cz: 0.014 * S, rx: 0.030 * B * S, rz: 0.066 * B * S },
          { cx: px + sign * 0.010 * S, cy: 0.755 * S, cz: 0.014 * S, rx: 0.032 * B * S, rz: 0.070 * B * S, capLift: 0.008 * S },
        ],
        { radialSegs: 8, tile: TILES.PANTS_CARGO, tag: `leg_${suf}` }
      );
    }

    if (spec.id === 'kaijax') {
      acc.addLoft(
        [
          { cx: shPos[0], cy: 0.28 * S, cz: shPos[2] + 0.056 * S, rx: 0.058 * B * S, rz: 0.048 * B * S },
          { cx: shPos[0], cy: 0.49 * S, cz: shPos[2] + 0.076 * S, rx: 0.074 * B * S, rz: 0.058 * B * S },
          { cx: shPos[0], cy: 0.58 * S, cz: shPos[2] + 0.062 * S, rx: 0.052 * B * S, rz: 0.042 * B * S, capLift: 0.016 * S },
        ],
        { radialSegs: 8, tile: TILES.ARMOR_GOLD, tag: `leg_${suf}` }
      );
    }

    acc.addLoft(
      [
        { cx: ftPos[0], cy: 0.004, cz: ftPos[2] + 0.058 * S, rx: 0.080 * B * S, rz: 0.152 * S, capDrop: 0.003 },
        { cx: ftPos[0], cy: 0.048 * S, cz: ftPos[2] + 0.055 * S, rx: 0.078 * B * S, rz: 0.148 * S },
        { cx: ftPos[0], cy: 0.118 * S, cz: ftPos[2] + 0.022 * S, rx: 0.070 * B * S, rz: 0.102 * S },
        { cx: ftPos[0], cy: 0.205 * S, cz: ftPos[2] + 0.004 * S, rx: 0.068 * B * S, rz: 0.074 * S, capLift: 0.010 * S },
      ],
      { radialSegs: R_DETAIL, tile: TILES.SNEAKER_BODY, tag: `foot_${suf}` }
    );

    for (let c = -1; c <= 1; c++) {
      const cxOff = c * 0.026 * S;
      acc.addSplineTube(
        [
          [ftPos[0] + cxOff, 0.036 * S, ftPos[2] + 0.190 * S],
          [ftPos[0] + cxOff, 0.022 * S, ftPos[2] + 0.232 * S],
          [ftPos[0] + cxOff, 0.006 * S, ftPos[2] + 0.260 * S],
        ],
        (t) => (1 - t * 0.85) * 0.014 * S,
        { tubularSegs: 5, radialSegs: 6, tile: TILES.IVORY_FANG, tag: `toe_${suf}` }
      );
    }
  }

  // 10. Articulated Dorsal Spider Limbs (Dedicated SPIDER_CHITIN + ARMOR_GOLD Tiles — Zero Torso UV Bleed!)
  if (spiderChains.length > 0) {
    acc.addLoft(
      [
        { cx: 0, cy: 1.22 * S, cz: -0.148 * S, rx: 0.114 * S, rz: 0.048 * S },
        { cx: 0, cy: 1.35 * S, cz: -0.164 * S, rx: 0.134 * S, rz: 0.058 * S },
        { cx: 0, cy: 1.45 * S, cz: -0.148 * S, rx: 0.094 * S, rz: 0.042 * S, capLift: 0.010 * S },
      ],
      { radialSegs: 12, tile: TILES.ARMOR_GOLD, tag: 'torso' }
    );

    for (const sc of spiderChains) {
      const [p0, p1, p2, pTip] = sc.points;
      acc.addSplineTube(
        [p0, p1, p2, pTip],
        (t) => {
          const taper = (1 - Math.pow(t, 1.42) * 0.90) * 0.035;
          const jointNode =
            Math.exp(-Math.pow((t - 0.33) * 18, 2)) * 0.023 +
            Math.exp(-Math.pow((t - 0.67) * 18, 2)) * 0.019;
          return (taper + jointNode) * S;
        },
        {
          tubularSegs: isMaster ? 26 : 12,
          radialSegs: isMaster ? 10 : 7,
          tile: TILES.SPIDER_CHITIN,
          tag: sc.prefix,
          flattenY: 0.76,
        }
      );

      if (isMaster) {
        for (const [jIdx, jp] of [p0, p1, p2].entries()) {
          const jr = (jIdx === 0 ? 0.042 : jIdx === 1 ? 0.036 : 0.030) * S;
          acc.addLoft(
            [
              { cx: jp[0], cy: jp[1] - jr * 0.7, cz: jp[2], rx: jr, rz: jr, capDrop: jr * 0.3 },
              { cx: jp[0], cy: jp[1] + jr * 0.7, cz: jp[2], rx: jr, rz: jr, capLift: jr * 0.3 },
            ],
            { radialSegs: 8, tile: TILES.ARMOR_GOLD, tag: sc.prefix }
          );
        }
        acc.addSplineTube(
          [
            p0,
            [(p0[0] + p2[0]) * 0.52, (p0[1] + p2[1]) * 0.48, (p0[2] + p2[2]) * 0.5],
            [(p2[0] + pTip[0]) * 0.5, (p2[1] + pTip[1]) * 0.5, (p2[2] + pTip[2]) * 0.5],
          ],
          () => 0.0045 * S,
          { tubularSegs: 6, radialSegs: 5, tile: TILES.SPIDER_CHITIN, tag: sc.prefix }
        );
      }
    }
  }

  // 11. Jax & Kai-Jax: 7 Swept-Back Storm-Mane Crests (Dedicated STORM_MANE Tile!)
  for (const mc of maneChains) {
    acc.addSplineTube(
      mc.points,
      (t) => Math.sin(Math.min(0.98, t * 0.86 + 0.14) * Math.PI) * 0.074 * S,
      {
        tubularSegs: isMaster ? 14 : 8,
        radialSegs: isMaster ? 9 : 6,
        tile: TILES.STORM_MANE,
        tag: mc.name,
        flattenY: 0.58,
      }
    );
  }
  if (maneChains.length === 7) {
    for (let k = 0; k < 8; k++) {
      const side = k < 4 ? -1 : 1;
      const rowIdx = k % 4;
      const boneTag = side < 0 ? `mane_0${Math.min(3, rowIdx + 1)}` : `mane_0${Math.max(5, 7 - rowIdx)}`;
      const yBase = (1.66 - rowIdx * 0.055) * S;
      acc.addSplineTube(
        [
          [side * 0.135 * S, yBase, -0.02 * S],
          [side * (0.21 + rowIdx * 0.025) * S, yBase + 0.08 * S, -0.16 * S],
          [side * (0.26 + rowIdx * 0.032) * S, yBase - 0.02 * S, -0.34 * S],
          [side * (0.29 + rowIdx * 0.035) * S, yBase - 0.12 * S, -0.48 * S],
        ],
        (t) => Math.sin(Math.min(0.98, t * 0.84 + 0.16) * Math.PI) * 0.058 * S,
        {
          tubularSegs: isMaster ? 10 : 6,
          radialSegs: isMaster ? 8 : 5,
          tile: TILES.STORM_MANE,
          tag: boneTag,
          flattenY: 0.55,
        }
      );
    }
  }

  // 12. Independent Animated Physical Tails (STRICTLY 3 for Kai-Jax; 1 for Boryn & Borax)
  for (const tc of tailChains) {
    const isKaiJaxTail = spec.id === 'kaijax';
    acc.addSplineTube(
      tc.pts,
      (t) => {
        const plume = isKaiJaxTail
          ? Math.sin(Math.min(0.98, t * 0.80 + 0.18) * Math.PI) * 0.108
          : (1 - t * 0.50) * 0.062;
        return Math.max(0.014, plume) * S;
      },
      {
        tubularSegs: isMaster ? 22 : 12,
        radialSegs: isMaster ? 13 : 8,
        tile: tc.tile,
        uSubRange: tc.uSub,
        tag: tc.prefix,
      }
    );
  }

  return acc;
}

function computeSkinWeights(acc, skel) {
  const vCount = acc.vertexCount;
  const joints = new Uint16Array(vCount * 4);
  const weights = new Float32Array(vCount * 4);

  const { bones, byName, S } = skel;
  const idxOf = (name) => byName.get(name)?.index ?? 0;

  const boneSegments = bones.map((b) => {
    const children = bones.filter(
      (c) =>
        c.parentIndex === b.index &&
        !c.name.startsWith('spider_') &&
        !c.name.startsWith('mane_') &&
        !c.name.startsWith('tail')
    );
    const endPos =
      children.length === 1
        ? children[0].worldPos
        : [b.worldPos[0], b.worldPos[1] + 0.08 * S, b.worldPos[2]];
    return { index: b.index, name: b.name, a: b.worldPos, b: endPos };
  });

  function distToSegSq(p, a, b) {
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const abz = b[2] - a[2];
    const lenSq = abx * abx + aby * aby + abz * abz;
    let t = 0;
    if (lenSq > 1e-6) {
      t = ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby + (p[2] - a[2]) * abz) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }
    const dx = p[0] - (a[0] + abx * t);
    const dy = p[1] - (a[1] + aby * t);
    const dz = p[2] - (a[2] + abz * t);
    return dx * dx + dy * dy + dz * dz;
  }

  for (let v = 0; v < vCount; v++) {
    const p = acc.positions[v];
    const meta = acc.tags[v];
    const tag = meta.tag;

    let candidates = [];

    if (tag === 'jaw') {
      candidates = [[idxOf('jaw'), 0.86], [idxOf('head'), 0.14]];
    } else if (
      tag === 'head' ||
      tag === 'snout' ||
      tag === 'fang' ||
      tag === 'eye' ||
      tag.startsWith('eyelid_') ||
      tag === 'mane_lion'
    ) {
      candidates = [[idxOf('head'), 0.94], [idxOf('neck'), 0.06]];
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      candidates = [[idxOf(tag), 0.86], [idxOf('head'), 0.14]];
    } else if (tag.startsWith('mane_0')) {
      const mIdx = idxOf(tag);
      const t = meta.splineT ?? 0.5;
      candidates = [[mIdx, Math.max(0.22, t)], [idxOf('head'), Math.max(0.06, 1 - t)]];
    } else if (tag.startsWith('spider_')) {
      const t = meta.splineT ?? 0.5;
      const b1 = idxOf(`${tag}_01`);
      const b2 = idxOf(`${tag}_02`);
      const b3 = idxOf(`${tag}_03`);
      if (t < 0.34) {
        const k = smoothstep01(t / 0.34);
        candidates = [[b1, 1 - k * 0.48], [b2, k * 0.48]];
      } else if (t < 0.68) {
        const k = smoothstep01((t - 0.34) / 0.34);
        candidates = [[b2, 1 - k * 0.52], [b3, k * 0.52]];
      } else {
        candidates = [[b3, 0.92], [b2, 0.08]];
      }
    } else if (tag.startsWith('tail')) {
      const t = meta.splineT ?? 0.5;
      const posF = t * 3.0;
      const s0 = Math.min(3, Math.floor(posF));
      const s1 = Math.min(3, s0 + 1);
      const frac = smoothstep01(posF - s0);
      const b0 = idxOf(`${tag}_0${s0 + 1}`);
      const b1 = idxOf(`${tag}_0${s1 + 1}`);
      candidates = b0 === b1 ? [[b0, 1.0]] : [[b0, 1 - frac], [b1, frac]];
    } else if (tag === 'arm_L' || tag === 'arm_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      const uY = byName.get(`upper_arm_${suf}`).worldPos[1];
      const fY = byName.get(`forearm_${suf}`).worldPos[1];
      const hY = byName.get(`hand_${suf}`).worldPos[1];
      const y = p[1];
      if (y >= fY - 0.065 * S) {
        const shBlend = smoothstep01((y - (uY - 0.04 * S)) / (0.11 * S));
        const elBlend = smoothstep01(((fY + 0.055 * S) - y) / (0.11 * S));
        const wClav = shBlend * 0.38;
        const wFore = elBlend * 0.50;
        const wUpper = Math.max(0.05, 1 - wClav - wFore);
        candidates = [
          [idxOf(`upper_arm_${suf}`), wUpper],
          [idxOf(`forearm_${suf}`), wFore],
          [idxOf(`clavicle_${suf}`), wClav],
        ];
      } else {
        const elBlend = smoothstep01((y - (fY - 0.065 * S)) / (0.12 * S));
        const wrBlend = smoothstep01(((hY + 0.045 * S) - y) / (0.09 * S));
        const wUpper = elBlend * 0.45;
        const wHand = wrBlend * 0.35;
        const wFore = Math.max(0.05, 1 - wUpper - wHand);
        candidates = [
          [idxOf(`forearm_${suf}`), wFore],
          [idxOf(`upper_arm_${suf}`), wUpper],
          [idxOf(`hand_${suf}`), wHand],
        ];
      }
    } else if (tag === 'leg_L' || tag === 'leg_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      const thY = byName.get(`thigh_${suf}`).worldPos[1];
      const shY = byName.get(`shin_${suf}`).worldPos[1];
      const ftY = byName.get(`foot_${suf}`).worldPos[1];
      const y = p[1];
      if (y >= shY - 0.06 * S) {
        const hipBlend = smoothstep01((y - (thY - 0.05 * S)) / (0.12 * S));
        const kneeBlend = smoothstep01(((shY + 0.06 * S) - y) / (0.12 * S));
        const wPelvis = hipBlend * 0.36;
        const wShin = kneeBlend * 0.50;
        const wThigh = Math.max(0.05, 1 - wPelvis - wShin);
        candidates = [
          [idxOf(`thigh_${suf}`), wThigh],
          [idxOf(`shin_${suf}`), wShin],
          [idxOf('pelvis'), wPelvis],
        ];
      } else {
        const kneeBlend = smoothstep01((y - (shY - 0.06 * S)) / (0.12 * S));
        const ankBlend = smoothstep01(((ftY + 0.09 * S) - y) / (0.11 * S));
        const wThigh = kneeBlend * 0.45;
        const wFoot = ankBlend * 0.32;
        const wShin = Math.max(0.05, 1 - wThigh - wFoot);
        candidates = [
          [idxOf(`shin_${suf}`), wShin],
          [idxOf(`thigh_${suf}`), wThigh],
          [idxOf(`foot_${suf}`), wFoot],
        ];
      }
    } else if (tag === 'hand_L' || tag === 'hand_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      candidates = [[idxOf(`hand_${suf}`), 0.88], [idxOf(`forearm_${suf}`), 0.12]];
    } else if (tag === 'foot_L' || tag === 'foot_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      const ftZ = byName.get(`foot_${suf}`).worldPos[2];
      const toeBlend = smoothstep01((p[2] - (ftZ + 0.08 * S)) / (0.10 * S));
      candidates = [
        [idxOf(`foot_${suf}`), 0.88 - toeBlend * 0.35],
        [idxOf(`toe_${suf}`), toeBlend * 0.35],
        [idxOf(`shin_${suf}`), 0.12],
      ];
    } else if (tag === 'toe_L' || tag === 'toe_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      candidates = [[idxOf(`toe_${suf}`), 0.85], [idxOf(`foot_${suf}`), 0.15]];
    } else {
      const allowedNames =
        tag === 'pelvis_hip' || tag === 'sash' || tag === 'belt'
          ? ['pelvis', 'spine_01', 'thigh_L', 'thigh_R']
          : ['pelvis', 'spine_01', 'spine_02', 'chest', 'clavicle_L', 'clavicle_R', 'neck', 'thigh_L', 'thigh_R'];
      const pool = boneSegments.filter((bs) => allowedNames.includes(bs.name));
      const scored = pool.map((bs) => {
        const dSq = distToSegSq(p, bs.a, bs.b);
        return [bs.index, 1 / Math.pow(dSq + 0.0024, 1.65)];
      });
      scored.sort((a, b) => b[1] - a[1]);
      candidates = scored.slice(0, 4);
    }

    let sum = 0;
    for (const c of candidates) sum += c[1];
    if (sum <= 0) {
      joints[v * 4] = 0;
      weights[v * 4] = 1.0;
      continue;
    }
    for (let k = 0; k < 4; k++) {
      if (k < candidates.length) {
        joints[v * 4 + k] = candidates[k][0];
        weights[v * 4 + k] = candidates[k][1] / sum;
      } else {
        joints[v * 4 + k] = 0;
        weights[v * 4 + k] = 0;
      }
    }
  }

  return { joints, weights };
}

function buildFacialMorphDeltas(acc, skel) {
  const S = skel.S;
  const vCount = acc.vertexCount;
  const deltas = {};
  for (const mName of MORPH_NAMES) {
    deltas[mName] = new Float32Array(vCount * 3);
  }

  for (let v = 0; v < vCount; v++) {
    const p = acc.positions[v];
    const { tag, vFrac } = acc.tags[v];
    const o = v * 3;
    const signX = p[0] >= 0 ? 1 : -1;

    if (tag === 'eyelid_L' || tag === 'eyelid_R') {
      deltas.blink[o + 1] = -0.030 * S;
      deltas.blink[o + 2] = 0.010 * S;
      deltas.pain[o + 1] = -0.024 * S;
      deltas.pain[o + 2] = 0.008 * S;
      deltas.focus[o] = -signX * 0.008 * S;
      deltas.focus[o + 1] = -0.014 * S;
      deltas.snarl[o] = -signX * 0.010 * S;
      deltas.snarl[o + 1] = -0.012 * S;
    } else if (tag === 'snout') {
      const frontAmt = Math.max(0, vFrac);
      deltas.snarl[o] = signX * 0.013 * S * frontAmt;
      deltas.snarl[o + 1] = 0.022 * S * frontAmt;
      deltas.snarl[o + 2] = -0.006 * S * frontAmt;
      deltas.roar[o] = signX * 0.016 * S * frontAmt;
      deltas.roar[o + 1] = 0.026 * S * frontAmt;
      deltas.pain[o + 1] = 0.010 * S * frontAmt;
      deltas.focus[o + 1] = 0.005 * S * frontAmt;
    } else if (tag === 'fang') {
      deltas.snarl[o + 1] = 0.007 * S;
      deltas.roar[o + 1] = 0.012 * S;
    } else if (tag === 'jaw') {
      const tipAmt = 0.35 + vFrac * 0.65;
      deltas.roar[o + 1] = -0.066 * S * tipAmt;
      deltas.roar[o + 2] = -0.024 * S * tipAmt;
      deltas.snarl[o + 1] = -0.022 * S * tipAmt;
      deltas.pain[o + 1] = -0.026 * S * tipAmt;
      deltas.pain[o] = 0.008 * S * tipAmt;
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      const earTip = vFrac;
      deltas.pain[o + 1] = -0.032 * S * earTip;
      deltas.pain[o + 2] = -0.040 * S * earTip;
      deltas.roar[o + 2] = -0.036 * S * earTip;
      deltas.focus[o + 1] = 0.018 * S * earTip;
      deltas.focus[o + 2] = 0.015 * S * earTip;
      deltas.blink[o + 2] = -0.004 * S * earTip;
    }
  }

  return deltas;
}

function buildAllAnimationClips(spec, skel) {
  const { bones, byName, S } = skel;
  const euler = new THREE.Euler(0, 0, 0, 'XYZ');
  const quat = new THREE.Quaternion();

  function qEuler(rx, ry, rz) {
    euler.set(rx, ry, rz, 'XYZ');
    quat.setFromEuler(euler);
    return [quat.x, quat.y, quat.z, quat.w];
  }

  const pelvisRest = byName.get('pelvis').localPos;

  return REQUIRED_CLIPS.map((clipName) => {
    const isLoop = ['idle', 'breathing', 'walk', 'run', 'sprint', 'fall', 'victory'].includes(clipName);
    const duration =
      clipName === 'idle' || clipName === 'breathing'
        ? 2.2
        : clipName === 'walk'
          ? 0.96
          : clipName === 'run'
            ? 0.68
            : clipName === 'sprint'
              ? 0.50
              : clipName === 'attack_1' || clipName === 'attack_2'
                ? 0.36
                : clipName === 'attack_3' || clipName === 'heavy_strike'
                  ? 0.50
                  : clipName === 'roar' || clipName === 'ability_cast'
                    ? 0.78
                    : clipName === 'victory'
                      ? 2.0
                      : clipName === 'defeat'
                        ? 1.1
                        : 0.44;

    const sampleCount = 13;
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
      const amp = clipName === 'breathing' ? 1.25 : 1.0;
      const combatReady = spec.id === 'kai' || spec.id === 'jax' || spec.id === 'kaijax';
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.016 * amp - (combatReady ? 0.02 : 0), 0]);
      addRotTrack('spine_01', (_, w) => [0.04 + Math.sin(w) * 0.025 * amp, combatReady ? 0.05 : 0, 0]);
      addRotTrack('chest', (_, w) => [0.03 - Math.sin(w) * 0.03 * amp, combatReady ? -0.04 : 0, 0]);
      addRotTrack('head', (_, w) => [Math.sin(w) * 0.02, Math.cos(w) * 0.035, 0]);
      addRotTrack('upper_arm_L', (_, w) => [0.06 + Math.sin(w) * 0.03, 0, 0.08 + Math.cos(w) * 0.02]);
      addRotTrack('upper_arm_R', (_, w) => [0.08 - Math.sin(w) * 0.03, 0, -0.08 - Math.cos(w) * 0.02]);
      addRotTrack('forearm_L', (_, w) => [-0.22 - Math.sin(w) * 0.04, 0, 0]);
      addRotTrack('forearm_R', (_, w) => [-0.26 + Math.sin(w) * 0.04, 0, 0]);
      addRotTrack('thigh_L', () => [-0.06, 0, 0.04]);
      addRotTrack('thigh_R', () => [0.04, 0, -0.04]);
      addRotTrack('shin_L', () => [0.10, 0, 0]);
      addRotTrack('shin_R', () => [0.06, 0, 0]);
      addRotTrack('ear_L', (_, w) => [Math.sin(w * 2) * 0.04, 0, 0]);
      addRotTrack('ear_R', (_, w) => [-Math.sin(w * 2) * 0.04, 0, 0]);
    } else if (clipName === 'walk' || clipName === 'run' || clipName === 'sprint') {
      const stride = clipName === 'walk' ? 0.56 : clipName === 'run' ? 0.96 : 1.24;
      const lean = clipName === 'walk' ? 0.08 : clipName === 'run' ? 0.24 : 0.40;
      const bounce = clipName === 'walk' ? 0.030 : clipName === 'run' ? 0.064 : 0.088;

      addPelvisPosTrack((_, w) => [Math.sin(w) * 0.024, Math.abs(Math.cos(w)) * bounce - bounce * 0.48, 0]);
      addRotTrack('pelvis', (_, w) => [0, Math.sin(w) * 0.12 * stride, Math.cos(w) * 0.045]);
      addRotTrack('spine_01', (_, w) => [lean * 0.55 + Math.abs(Math.cos(w)) * 0.04, -Math.sin(w) * 0.16 * stride, 0]);
      addRotTrack('chest', (_, w) => [lean * 0.48, -Math.sin(w) * 0.20 * stride, 0]);
      addRotTrack('head', (_, w) => [-lean * 0.62, Math.sin(w) * 0.08, 0]);

      addRotTrack('thigh_L', (_, w) => [-Math.sin(w) * stride, 0, 0.03]);
      addRotTrack('thigh_R', (_, w) => [Math.sin(w) * stride, 0, -0.03]);
      addRotTrack('shin_L', (_, w) => [Math.max(0.06, Math.cos(w) * 0.85 * stride + 0.26 * stride), 0, 0]);
      addRotTrack('shin_R', (_, w) => [Math.max(0.06, -Math.cos(w) * 0.85 * stride + 0.26 * stride), 0, 0]);
      addRotTrack('foot_L', (_, w) => [Math.sin(w) * 0.34 * stride - 0.08, 0, 0]);
      addRotTrack('foot_R', (_, w) => [-Math.sin(w) * 0.34 * stride - 0.08, 0, 0]);

      addRotTrack('upper_arm_L', (_, w) => [Math.sin(w) * stride * 0.85 + 0.08, 0, 0.10]);
      addRotTrack('upper_arm_R', (_, w) => [-Math.sin(w) * stride * 0.85 + 0.08, 0, -0.10]);
      addRotTrack('forearm_L', (_, w) => [-0.46 - Math.max(0, -Math.sin(w)) * 0.44, 0, 0]);
      addRotTrack('forearm_R', (_, w) => [-0.46 - Math.max(0, Math.sin(w)) * 0.44, 0, 0]);
    } else if (clipName === 'jump') {
      addPelvisPosTrack((p) => [0, Math.sin(p * Math.PI) * 0.24, 0]);
      addRotTrack('spine_01', (p) => [0.22 - p * 0.32, 0, 0]);
      addRotTrack('thigh_L', (p) => [-0.88 * Math.sin(p * Math.PI * 0.85), 0, 0.08]);
      addRotTrack('thigh_R', (p) => [-0.46 * Math.sin(p * Math.PI * 0.85), 0, -0.08]);
      addRotTrack('shin_L', (p) => [1.08 * Math.sin(p * Math.PI * 0.85), 0, 0]);
      addRotTrack('shin_R', (p) => [0.64 * Math.sin(p * Math.PI * 0.85), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [-0.95 * Math.sin(p * Math.PI * 0.9), 0, 0.30]);
      addRotTrack('upper_arm_R', (p) => [-0.95 * Math.sin(p * Math.PI * 0.9), 0, -0.30]);
    } else if (clipName === 'fall') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.025, 0]);
      addRotTrack('spine_01', () => [0.18, 0, 0]);
      addRotTrack('thigh_L', (_, w) => [-0.52 + Math.sin(w) * 0.06, 0, 0.12]);
      addRotTrack('thigh_R', (_, w) => [-0.28 - Math.sin(w) * 0.06, 0, -0.12]);
      addRotTrack('shin_L', () => [0.86, 0, 0]);
      addRotTrack('shin_R', () => [0.46, 0, 0]);
      addRotTrack('upper_arm_L', (_, w) => [-0.52 + Math.sin(w) * 0.1, 0, 0.36]);
      addRotTrack('upper_arm_R', (_, w) => [-0.52 - Math.sin(w) * 0.1, 0, -0.36]);
      addRotTrack('forearm_L', () => [-0.58, 0, 0]);
      addRotTrack('forearm_R', () => [-0.58, 0, 0]);
    } else if (clipName === 'landing') {
      const squash = (p) => Math.sin(Math.pow(p, 0.65) * Math.PI);
      addPelvisPosTrack((p) => [0, -squash(p) * 0.20, 0.04 * squash(p)]);
      addRotTrack('spine_01', (p) => [squash(p) * 0.38, 0, 0]);
      addRotTrack('head', (p) => [-squash(p) * 0.22, 0, 0]);
      addRotTrack('thigh_L', (p) => [-squash(p) * 0.66, 0, 0.10]);
      addRotTrack('thigh_R', (p) => [-squash(p) * 0.66, 0, -0.10]);
      addRotTrack('shin_L', (p) => [squash(p) * 0.90, 0, 0]);
      addRotTrack('shin_R', (p) => [squash(p) * 0.90, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [squash(p) * 0.48, 0, 0.28]);
      addRotTrack('upper_arm_R', (p) => [squash(p) * 0.48, 0, -0.28]);
    } else if (clipName === 'dodge') {
      const env = (p) => Math.sin(p * Math.PI);
      addPelvisPosTrack((p) => [0, -env(p) * 0.24, env(p) * 0.16]);
      addRotTrack('spine_01', (p) => [env(p) * 0.58, Math.sin(p * Math.PI * 2) * 0.36, 0]);
      addRotTrack('head', (p) => [-env(p) * 0.28, 0, 0]);
      addRotTrack('thigh_L', (p) => [-env(p) * 0.68, 0, 0.12]);
      addRotTrack('thigh_R', (p) => [env(p) * 0.36, 0, -0.12]);
      addRotTrack('shin_L', (p) => [env(p) * 0.76, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.54 * env(p), 0, 0.38]);
      addRotTrack('upper_arm_R', (p) => [0.54 * env(p), 0, -0.38]);
    } else if (clipName === 'attack_1' || clipName === 'attack_2' || clipName === 'attack_3' || clipName === 'heavy_strike') {
      const isLeft = clipName === 'attack_2';
      const isHeavy = clipName === 'heavy_strike' || clipName === 'attack_3';
      const snap = (p) => (p < 0.18 ? -0.32 * (p / 0.18) : Math.sin(((p - 0.18) / 0.82) * Math.PI));
      const env = (p) => Math.sin(Math.pow(p, 0.72) * Math.PI);

      addPelvisPosTrack((p) => [0, -Math.max(0, snap(p)) * (isHeavy ? 0.15 : 0.08), snap(p) * (isHeavy ? 0.20 : 0.14)]);
      addRotTrack('spine_01', (p) => [0.04 + snap(p) * (isHeavy ? 0.40 : 0.25), (isLeft ? -1 : 1) * snap(p) * 0.62, 0]);
      addRotTrack('chest', (p) => [0.06 * env(p), (isLeft ? -1 : 1) * snap(p) * 0.48, 0]);
      addRotTrack('jaw', (p) => [Math.max(0, snap(p)) * 0.36, 0, 0]);

      if (isHeavy) {
        addRotTrack('upper_arm_R', (p) => [0.08 + (-2.15 + Math.pow(p, 0.68) * 2.85) * env(p), -0.22 * env(p), -0.14]);
        addRotTrack('upper_arm_L', (p) => [0.06 + (-1.88 + Math.pow(p, 0.68) * 2.48) * env(p), 0.22 * env(p), 0.14]);
        addRotTrack('forearm_R', (p) => [-0.28 - 0.56 * (1 - p) * env(p), 0, 0]);
        addRotTrack('forearm_L', (p) => [-0.24 - 0.56 * (1 - p) * env(p), 0, 0]);
      } else if (isLeft) {
        addRotTrack('upper_arm_L', (p) => [0.06 + (-1.42 + Math.max(0, snap(p)) * 1.74) * env(p), -0.46 * snap(p), 0.16]);
        addRotTrack('forearm_L', (p) => [-0.24 - 0.62 * (1 - Math.max(0, snap(p))) * env(p), 0, 0]);
        addRotTrack('upper_arm_R', (p) => [0.08 + 0.28 * env(p), 0, -0.16]);
      } else {
        addRotTrack('upper_arm_R', (p) => [0.08 + (-1.42 + Math.max(0, snap(p)) * 1.74) * env(p), 0.46 * snap(p), -0.16]);
        addRotTrack('forearm_R', (p) => [-0.28 - 0.62 * (1 - Math.max(0, snap(p))) * env(p), 0, 0]);
        addRotTrack('upper_arm_L', (p) => [0.06 + 0.28 * env(p), 0, 0.16]);
      }
      addRotTrack('thigh_L', (p) => [-0.06 - 0.38 * Math.max(0, snap(p)), 0, 0.08]);
      addRotTrack('thigh_R', (p) => [0.04 + 0.30 * Math.max(0, snap(p)), 0, -0.08]);
      addRotTrack('shin_L', (p) => [0.10 + 0.48 * Math.max(0, snap(p)), 0, 0]);
    } else if (clipName === 'parry') {
      const guard = (p) => Math.sin(Math.pow(p, 0.6) * Math.PI);
      addPelvisPosTrack((p) => [0, -0.11 * guard(p), -0.06 * guard(p)]);
      addRotTrack('chest', (p) => [0.10 * guard(p), -0.36 * guard(p), 0]);
      addRotTrack('upper_arm_L', (p) => [-1.18 * guard(p), -0.54 * guard(p), 0.18]);
      addRotTrack('upper_arm_R', (p) => [-1.08 * guard(p), 0.54 * guard(p), -0.18]);
      addRotTrack('forearm_L', (p) => [-0.24 - 0.86 * guard(p), 0, 0]);
      addRotTrack('forearm_R', (p) => [-0.28 - 0.82 * guard(p), 0, 0]);
    } else if (clipName === 'hit_reaction') {
      const jolt = (p) => Math.sin(Math.pow(p, 0.55) * Math.PI);
      addPelvisPosTrack((p) => [0, -0.06 * jolt(p), -0.16 * jolt(p)]);
      addRotTrack('spine_01', (p) => [-0.38 * jolt(p), 0.20 * jolt(p), 0]);
      addRotTrack('head', (p) => [-0.44 * jolt(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.36 * jolt(p), 0, 0.36]);
      addRotTrack('upper_arm_R', (p) => [0.36 * jolt(p), 0, -0.36]);
    } else if (clipName === 'roar' || clipName === 'ability_cast') {
      const env = (p) => Math.sin(p * Math.PI);
      addPelvisPosTrack((p) => [0, -0.09 * env(p), 0]);
      addRotTrack('spine_01', (p) => [-0.26 * env(p), 0, 0]);
      addRotTrack('chest', (p) => [-0.22 * env(p), 0, 0]);
      addRotTrack('head', (p) => [-0.32 * env(p), 0, 0]);
      addRotTrack('jaw', (p) => [0.54 * env(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [-0.86 * env(p), 0, 0.56 * env(p) + 0.10]);
      addRotTrack('upper_arm_R', (p) => [-0.86 * env(p), 0, -0.56 * env(p) - 0.10]);
      addRotTrack('forearm_L', (p) => [-0.24 - 0.24 * env(p), 0, 0]);
      addRotTrack('forearm_R', (p) => [-0.28 - 0.20 * env(p), 0, 0]);
    } else if (clipName === 'victory') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.025, 0]);
      addRotTrack('chest', (_, w) => [-0.14, Math.sin(w) * 0.08, 0]);
      addRotTrack('head', (_, w) => [-0.08, Math.sin(w) * 0.1, 0]);
      addRotTrack('upper_arm_R', (_, w) => [-2.22 + Math.sin(w) * 0.08, 0, -0.24]);
      addRotTrack('forearm_R', () => [-0.45, 0, 0]);
      addRotTrack('upper_arm_L', () => [0.18, 0, 0.18]);
      addRotTrack('forearm_L', () => [-0.55, 0, 0]);
    } else if (clipName === 'defeat') {
      addPelvisPosTrack((p) => [0, -0.44 * p, -0.10 * p]);
      addRotTrack('spine_01', (p) => [0.62 * p, 0, 0]);
      addRotTrack('head', (p) => [0.45 * p, 0, 0]);
      addRotTrack('thigh_L', (p) => [-1.05 * p, 0, 0.1]);
      addRotTrack('thigh_R', (p) => [-0.85 * p, 0, -0.1]);
      addRotTrack('shin_L', (p) => [1.55 * p, 0, 0]);
      addRotTrack('shin_R', (p) => [1.35 * p, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.45 * p, 0, 0.14]);
      addRotTrack('upper_arm_R', (p) => [0.45 * p, 0, -0.14]);
    }

    const energyBoost =
      clipName.startsWith('attack') || clipName === 'heavy_strike' || clipName === 'roar' || clipName === 'ability_cast'
        ? 2.1
        : clipName === 'sprint' || clipName === 'run'
          ? 1.5
          : 1.0;

    for (const b of bones) {
      if (b.name.startsWith('spider_')) {
        const phaseOff = b.index * 0.85;
        const sign = b.name.includes('_UL_') || b.name.includes('_LL_') ? 1 : -1;
        addRotTrack(b.name, (_, w) => [
          Math.sin(w + phaseOff) * 0.11 * energyBoost,
          Math.cos(w + phaseOff) * 0.09 * energyBoost,
          sign * Math.sin(w + phaseOff * 0.7) * 0.07 * energyBoost,
        ]);
      } else if (b.name.startsWith('mane_0')) {
        const idx = Number(b.name.slice(-1));
        addRotTrack(b.name, (_, w) => [
          Math.sin(w * 2 + idx * 0.6) * 0.08 * energyBoost,
          Math.cos(w + idx * 0.5) * 0.05 * energyBoost,
          0,
        ]);
      } else if (b.name.startsWith('tail')) {
        const segNum = Number(b.name.slice(-1));
        const chainHash = b.name.includes('ember') ? 0 : b.name.includes('storm') ? 2.1 : 4.2;
        addRotTrack(b.name, (_, w) => [
          Math.sin(w + chainHash - segNum * 0.55) * (0.08 + segNum * 0.035) * energyBoost,
          Math.cos(w + chainHash - segNum * 0.45) * (0.10 + segNum * 0.04) * energyBoost,
          0,
        ]);
      }
    }

    return { name: clipName, times, tracks };
  });
}

function packReconstructedGlbBinary(spec, tier, pbrPngs, landmarks) {
  const skel = buildSkeletonDefinition(spec);
  const acc = sculptReconstructedGeometry(spec, skel, tier);
  const initialSmoothNormals = acc.computeSmoothNormals();
  const baseNormals = acc.applyDualHemisphereArtworkProjection(spec, skel, landmarks, initialSmoothNormals);
  const { joints, weights } = computeSkinWeights(acc, skel);
  const morphDeltas = buildFacialMorphDeltas(acc, skel);
  const clips = buildAllAnimationClips(spec, skel);

  const vCount = acc.vertexCount;
  const posFloat = new Float32Array(vCount * 3);
  const uvFloat = new Float32Array(vCount * 2);

  for (let v = 0; v < vCount; v++) {
    const [px, py, pz] = acc.positions[v];
    posFloat[v * 3] = px;
    posFloat[v * 3 + 1] = py;
    posFloat[v * 3 + 2] = pz;

    uvFloat[v * 2] = acc.uvs[v][0];
    uvFloat[v * 2 + 1] = acc.uvs[v][1];
  }

  const indexArray = vCount > 65535 ? new Uint32Array(acc.indices) : new Uint16Array(acc.indices);
  const indexComponentType = vCount > 65535 ? 5125 : 5123;

  const boneCount = skel.bones.length;
  const ibmFloat = new Float32Array(boneCount * 16);
  const m4 = new THREE.Matrix4();
  for (let b = 0; b < boneCount; b++) {
    const wp = skel.bones[b].worldPos;
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

  const posAcc = appendAccessor(posFloat, 5126, 'VEC3', vCount, 34962, true);
  const normAcc = appendAccessor(baseNormals, 5126, 'VEC3', vCount, 34962, false);
  const uvAcc = appendAccessor(uvFloat, 5126, 'VEC2', vCount, 34962, false);
  const jointsAcc = appendAccessor(joints, 5123, 'VEC4', vCount, 34962, false);
  const weightsAcc = appendAccessor(weights, 5126, 'VEC4', vCount, 34962, false);
  const idxAcc = appendAccessor(indexArray, indexComponentType, 'SCALAR', indexArray.length, 34963, false);
  const ibmAcc = appendAccessor(ibmFloat, 5126, 'MAT4', boneCount, undefined, false);

  const targets = MORPH_NAMES.map((mName) => {
    const dPos = morphDeltas[mName];
    const mPosAcc = appendAccessor(dPos, 5126, 'VEC3', vCount, 34962, true);
    return { POSITION: mPosAcc };
  });

  const baseImgBv = appendBufferView(pbrPngs.baseColorPng);
  const ormImgBv = appendBufferView(pbrPngs.ormPng);
  const normImgBv = appendBufferView(pbrPngs.normalPng);
  const emisImgBv = appendBufferView(pbrPngs.emissivePng);

  const images = [
    { name: `${spec.id}_baseColor`, bufferView: baseImgBv, mimeType: 'image/png' },
    { name: `${spec.id}_orm`, bufferView: ormImgBv, mimeType: 'image/png' },
    { name: `${spec.id}_normal`, bufferView: normImgBv, mimeType: 'image/png' },
    { name: `${spec.id}_emissive`, bufferView: emisImgBv, mimeType: 'image/png' },
  ];
  const samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
  const textures = [
    { sampler: 0, source: 0 },
    { sampler: 0, source: 1 },
    { sampler: 0, source: 2 },
    { sampler: 0, source: 3 },
  ];

  const materials = [
    {
      name: `${spec.id}_p1i_reconstructed_pbr`,
      doubleSided: false,
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        baseColorTexture: { index: 0 },
        metallicFactor: 1.0,
        roughnessFactor: 1.0,
        metallicRoughnessTexture: { index: 1 },
      },
      occlusionTexture: { index: 1, strength: 0.86 },
      normalTexture: { index: 2, scale: 0.85 },
      emissiveTexture: { index: 3 },
      emissiveFactor: [1, 1, 1],
    },
  ];

  const nodes = [];
  nodes.push({
    name: `${spec.id}_SkinnedMesh`,
    mesh: 0,
    skin: 0,
  });

  const jointNodeOffset = 1;
  const jointNodeIndices = [];
  for (let b = 0; b < boneCount; b++) {
    const bone = skel.bones[b];
    const children = skel.bones
      .filter((c) => c.parentIndex === b)
      .map((c) => c.index + jointNodeOffset);
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
    const pBone = skel.byName.get(parentBoneName);
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

  const S = skel.S;
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
      const outAcc = appendAccessor(
        tr.values,
        5126,
        isRot ? 'VEC4' : 'VEC3',
        clip.times.length,
        undefined,
        false
      );
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
      generator: 'Kai-Jax Beast Gods Production Rig Compiler v4.0 (P1-I Reconstructed · P1-G Compatible)',
    },
    scene: 0,
    scenes: [
      {
        name: `${spec.id}_Scene`,
        nodes: [0, jointNodeOffset],
      },
    ],
    nodes,
    meshes: [
      {
        name: `${spec.id}_UnifiedBody`,
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
            material: 0,
            targets,
          },
        ],
        weights: [0, 0, 0, 0, 0],
        extras: {
          targetNames: MORPH_NAMES,
        },
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
    materials,
    textures,
    images,
    samplers,
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

function buildHybridPbrPngs(charId, tier, tmpDir) {
  execFileSync('python3', [path.join(ROOT_DIR, 'scripts', 'build_p1i_pbr_atlases.py'), charId, tier, tmpDir], {
    stdio: 'inherit',
  });
  return {
    baseColorPng: fs.readFileSync(path.join(tmpDir, `${charId}_${tier}_baseColor.png`)),
    ormPng: fs.readFileSync(path.join(tmpDir, `${charId}_${tier}_orm.png`)),
    normalPng: fs.readFileSync(path.join(tmpDir, `${charId}_${tier}_normal.png`)),
    emissivePng: fs.readFileSync(path.join(tmpDir, `${charId}_${tier}_emissive.png`)),
  };
}

function runBlenderRigCertification(glbPath, tmpReportPath) {
  execFileSync(
    'blender',
    [
      '-b',
      '--factory-startup',
      '--python-exit-code',
      '1',
      '-P',
      path.join(ROOT_DIR, 'scripts', 'blender_p1i_rig_and_validate.py'),
      '--',
      glbPath,
      tmpReportPath,
    ],
    { stdio: 'pipe' }
  );
  return JSON.parse(fs.readFileSync(tmpReportPath, 'utf8'));
}

// ---------------------------------------------------------------------------
// Execute P1-I Reconstruction Pipeline (Supports single PoC ID or full roster)
// ---------------------------------------------------------------------------
fs.mkdirSync(CHAR_DIR, { recursive: true });
fs.mkdirSync(P1I_DIR, { recursive: true });
fs.mkdirSync(path.dirname(RIG_REPORT_PATH), { recursive: true });

for (const forbidden of ['bovar_master.glb', 'bovar_lod1.glb']) {
  for (const dir of [CHAR_DIR, P1I_DIR]) {
    const fp = path.join(dir, forbidden);
    if (fs.existsSync(fp)) fs.rmSync(fp, { force: true });
  }
}

const reconManifest = JSON.parse(fs.readFileSync(RECON_MANIFEST_PATH, 'utf8'));
const filterIds = process.argv.slice(2).map((s) => s.toLowerCase());
const targetSpecs = filterIds.length > 0 ? ROSTER_SPECS.filter((s) => filterIds.includes(s.id)) : ROSTER_SPECS;

let fullRigAudit = fs.existsSync(RIG_REPORT_PATH)
  ? JSON.parse(fs.readFileSync(RIG_REPORT_PATH, 'utf8'))
  : { generatedAt: new Date().toISOString(), blenderVersion: '3.4.1', characters: {} };

const tmpWork = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-p1i-'));
try {
  for (const spec of targetSpecs) {
    const landmarks = reconManifest.characters?.[spec.id]?.projectionLandmarks ?? {};
    fullRigAudit.characters[spec.id] = {};

    for (const tier of ['master', 'lod1']) {
      const pbrPngs = buildHybridPbrPngs(spec.id, tier, tmpWork);
      const glbBuf = packReconstructedGlbBinary(spec, tier, pbrPngs, landmarks);

      const p1iPath = path.join(P1I_DIR, `${spec.id}_${tier}.glb`);
      const activePath = path.join(CHAR_DIR, `${spec.id}_${tier}.glb`);
      fs.writeFileSync(p1iPath, glbBuf);
      fs.writeFileSync(activePath, glbBuf);

      const tmpJson = path.join(tmpWork, `${spec.id}_${tier}_rig.json`);
      const rigCert = runBlenderRigCertification(p1iPath, tmpJson);
      fullRigAudit.characters[spec.id][tier] = rigCert;

      console.log(
        `[P1-I RECONSTRUCTED] ${spec.id}_${tier}.glb -> ${(glbBuf.length / 1e6).toFixed(2)} MB | ` +
          `tris=${rigCert.extremePoses.rest_a_pose.triangleCount} | bones=${rigCert.armatureBoneCount} | ` +
          `Blender7Pose=${rigCert.status} (maxStretch=${rigCert.maxExtremePoseEdgeStretch})`
      );
    }
  }
} finally {
  fs.rmSync(tmpWork, { recursive: true, force: true });
}

fullRigAudit.generatedAt = new Date().toISOString();
fs.writeFileSync(RIG_REPORT_PATH, JSON.stringify(fullRigAudit, null, 2), 'utf8');
console.log(`Saved Blender 3.4.1 Rig & Extreme-Pose Stress Report -> ${RIG_REPORT_PATH}`);
