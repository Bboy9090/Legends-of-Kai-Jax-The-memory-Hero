import * as THREE from "three";

export interface RimLightOptions {
  color: string;
  /** Overall brightness of the edge glow. */
  strength?: number;
  /** Higher values confine the glow to the very edge of the silhouette. */
  power?: number;
  /** Optional faint emissive wash over the whole surface (used for boss tints). */
  tintStrength?: number;
}

type PatchedMaterial = THREE.Material & { userData: { rimPatched?: boolean } };

function patchMaterial(material: THREE.Material, opts: Required<RimLightOptions>): THREE.Material {
  const mat = material.clone() as PatchedMaterial;
  const color = new THREE.Color(opts.color);
  mat.userData = { ...mat.userData, rimPatched: true };
  const previous = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, renderer) => {
    previous?.call(mat, shader, renderer);
    shader.uniforms.rimColor = { value: color };
    shader.uniforms.rimStrength = { value: opts.strength };
    shader.uniforms.rimPower = { value: opts.power };
    shader.uniforms.rimTint = { value: opts.tintStrength };
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 rimColor;\nuniform float rimStrength;\nuniform float rimPower;\nuniform float rimTint;")
      .replace(
        "#include <opaque_fragment>",
        `float rimFres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), rimPower);
        outgoingLight += rimColor * (rimFres * rimStrength + rimTint);
        #include <opaque_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => `rim:${opts.color}:${opts.strength}:${opts.power}:${opts.tintStrength}`;
  mat.needsUpdate = true;
  return mat;
}

/**
 * Add a faction-coloured fresnel rim light to every standard-material mesh under `root`.
 * Materials are cloned first, so the shared cached GLB materials are never mutated.
 * Returns a disposer that restores the originals and frees the clones.
 */
export function applyRimLight(root: THREE.Object3D, options: RimLightOptions): () => void {
  const opts: Required<RimLightOptions> = { strength: 1.1, power: 2.6, tintStrength: 0, ...options };
  const restore: Array<() => void> = [];

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const original = mesh.material;
    const supported = (m: THREE.Material) => (m as THREE.MeshStandardMaterial).isMeshStandardMaterial || (m as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial;
    const patched = Array.isArray(original) ? original.map((m) => (supported(m) ? patchMaterial(m, opts) : m)) : supported(original) ? patchMaterial(original, opts) : original;
    mesh.material = patched;
    restore.push(() => {
      const clones = Array.isArray(patched) ? patched : [patched];
      const originals = Array.isArray(original) ? original : [original];
      clones.forEach((m, i) => { if (m !== originals[i]) m.dispose(); });
      mesh.material = original;
    });
  });

  return () => restore.forEach((fn) => fn());
}
