#!/usr/bin/env python3
"""
LEGENDS OF KAI-JAX: BLENDER MODEL OPTIMIZATION SCRIPT
Batch-process GLB models: decimate geometry, generate LODs, optimize textures
Run via: blender --background --python scripts/blender_optimize_models.py
"""

import bpy
import json
import os
from pathlib import Path
from dataclasses import dataclass
from typing import Dict, List, Tuple
import subprocess
import sys


@dataclass
class ModelStats:
    """Before/after statistics for a single model."""
    name: str
    original_path: str
    original_size_mb: float
    original_verts: int
    original_tris: int

    optimized_path: str = ""
    optimized_size_mb: float = 0.0
    optimized_verts: int = 0
    optimized_tris: int = 0

    lod_low_path: str = ""
    lod_low_size_mb: float = 0.0
    lod_low_verts: int = 0
    lod_low_tris: int = 0

    def compression_ratio(self) -> float:
        """Return size compression ratio (lower = better)."""
        if self.original_size_mb == 0:
            return 1.0
        return self.optimized_size_mb / self.original_size_mb

    def poly_reduction(self) -> float:
        """Return polygon reduction ratio (lower = better)."""
        if self.original_tris == 0:
            return 1.0
        return self.optimized_tris / self.original_tris


class ModelOptimizer:
    """Batch optimize Legends of Kai-Jax GLB models."""

    def __init__(self, models_dir: str, output_dir: str = None, decimate_ratio: float = 0.5):
        """
        Initialize optimizer.

        Args:
            models_dir: Directory containing GLB files
            output_dir: Where to save optimized models (default: models_dir/optimized)
            decimate_ratio: Target polygon reduction (0.5 = 50% reduction)
        """
        self.models_dir = Path(models_dir)
        self.output_dir = Path(output_dir or self.models_dir / "optimized")
        self.decimate_ratio = decimate_ratio
        self.stats: List[ModelStats] = []

        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / "lod_low").mkdir(exist_ok=True)

        print(f"🎯 Model Optimizer initialized")
        print(f"  📁 Input:  {self.models_dir}")
        print(f"  📁 Output: {self.output_dir}")
        print(f"  📊 Target decimation: {decimate_ratio*100:.0f}%")

    def get_mesh_stats(self, obj: bpy.types.Object) -> Tuple[int, int]:
        """Get vertex and triangle count for a mesh object."""
        if obj.type != 'MESH':
            return 0, 0

        # Ensure mesh is in edit mode to count accurately
        mesh = obj.data
        verts = len(mesh.vertices)
        tris = sum(1 for _ in mesh.polygons if len(mesh.polygons[0].vertices) == 3)
        quads = sum(1 for _ in mesh.polygons if len(mesh.polygons[0].vertices) == 4)

        # Convert quads to tris for triangle count estimate
        tri_count = tris + (quads * 2)

        return verts, tri_count

    def decimate_model(self, obj: bpy.types.Object, ratio: float = 0.5) -> bool:
        """
        Apply decimation modifier to reduce polygon count.

        Args:
            obj: Object to decimate
            ratio: Target ratio (0.5 = 50% of original)

        Returns:
            True if successful
        """
        if obj.type != 'MESH':
            return False

        # Add decimation modifier
        decimate = obj.modifiers.new(name="Decimate", type='DECIMATE')
        decimate.ratio = ratio
        decimate.use_collapse_edge_weight = True

        # Apply modifier
        try:
            with bpy.context.temp_override(object=obj):
                bpy.ops.object.modifier_apply(modifier=decimate.name)
            return True
        except Exception as e:
            print(f"  ⚠️  Decimation failed: {e}")
            return False

    def optimize_materials(self, obj: bpy.types.Object) -> None:
        """Optimize materials for smaller file size."""
        mesh = obj.data
        for mat_slot in obj.material_slots:
            if mat_slot.material is None:
                continue

            mat = mat_slot.material
            if mat.use_nodes:
                # Reduce texture resolution references
                for node in mat.node_tree.nodes:
                    if node.type == 'TEX_IMAGE' and node.image:
                        # Mark for potential compression (manual step in Blender)
                        node.image.scale(2048, 2048)  # Reduce to 2K max

    def process_model(self, glb_path: Path) -> ModelStats:
        """
        Process a single GLB model: load, optimize, export.

        Args:
            glb_path: Path to GLB file

        Returns:
            ModelStats with before/after comparison
        """
        model_name = glb_path.stem
        print(f"\n📦 Processing: {model_name}")

        # Get original file size
        original_size_mb = glb_path.stat().st_size / (1024 * 1024)
        print(f"  📊 Original size: {original_size_mb:.2f} MB")

        # Clear scene
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        # Import GLB
        try:
            bpy.ops.import_scene.gltf(filepath=str(glb_path))
            print(f"  ✅ Imported GLB")
        except Exception as e:
            print(f"  ❌ Import failed: {e}")
            return None

        # Get mesh objects
        mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
        if not mesh_objects:
            print(f"  ⚠️  No mesh objects found")
            return None

        # Count original geometry
        total_verts = 0
        total_tris = 0
        for obj in mesh_objects:
            verts, tris = self.get_mesh_stats(obj)
            total_verts += verts
            total_tris += tris

        print(f"  📐 Original: {total_verts} verts, {total_tris} tris")

        # Create stats entry
        stats = ModelStats(
            name=model_name,
            original_path=str(glb_path),
            original_size_mb=original_size_mb,
            original_verts=total_verts,
            original_tris=total_tris,
        )

        # Optimize: decimate each mesh
        print(f"  🔧 Decimating geometry ({self.decimate_ratio*100:.0f}%)...")
        for obj in mesh_objects:
            self.decimate_model(obj, self.decimate_ratio)
            self.optimize_materials(obj)

        # Count optimized geometry
        opt_verts = 0
        opt_tris = 0
        for obj in mesh_objects:
            verts, tris = self.get_mesh_stats(obj)
            opt_verts += verts
            opt_tris += tris

        print(f"  📐 Optimized: {opt_verts} verts, {opt_tris} tris")
        stats.optimized_verts = opt_verts
        stats.optimized_tris = opt_tris

        # Export optimized version
        opt_path = self.output_dir / f"{model_name}_optimized.glb"
        try:
            bpy.ops.export_scene.gltf(
                filepath=str(opt_path),
                export_format='GLB',
                export_draco_mesh_compression_level=7,  # Max compression
                export_image_format='AUTO',
            )
            opt_size_mb = opt_path.stat().st_size / (1024 * 1024)
            stats.optimized_path = str(opt_path)
            stats.optimized_size_mb = opt_size_mb
            print(f"  ✅ Exported: {opt_size_mb:.2f} MB ({stats.compression_ratio():.1%} of original)")
        except Exception as e:
            print(f"  ❌ Export failed: {e}")
            return stats

        # Generate LOD low-poly version (25% of original)
        print(f"  🔧 Generating LOD (25%)...")
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        # Re-import optimized version
        bpy.ops.import_scene.gltf(filepath=str(opt_path))
        mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']

        # Further decimate for LOD
        for obj in mesh_objects:
            self.decimate_model(obj, 0.25)

        lod_verts = 0
        lod_tris = 0
        for obj in mesh_objects:
            verts, tris = self.get_mesh_stats(obj)
            lod_verts += verts
            lod_tris += tris

        print(f"  📐 LOD: {lod_verts} verts, {lod_tris} tris")
        stats.lod_low_verts = lod_verts
        stats.lod_low_tris = lod_tris

        # Export LOD version
        lod_path = self.output_dir / "lod_low" / f"{model_name}_lod_low.glb"
        try:
            bpy.ops.export_scene.gltf(
                filepath=str(lod_path),
                export_format='GLB',
                export_draco_mesh_compression_level=7,
            )
            lod_size_mb = lod_path.stat().st_size / (1024 * 1024)
            stats.lod_low_path = str(lod_path)
            stats.lod_low_size_mb = lod_size_mb
            print(f"  ✅ LOD exported: {lod_size_mb:.2f} MB")
        except Exception as e:
            print(f"  ⚠️  LOD export failed: {e}")

        return stats

    def process_all(self) -> List[ModelStats]:
        """Process all GLB files in models directory."""
        glb_files = list(self.models_dir.glob("*.glb"))

        if not glb_files:
            print(f"❌ No GLB files found in {self.models_dir}")
            return []

        print(f"\n🚀 Found {len(glb_files)} models to optimize")

        for glb_path in glb_files:
            stats = self.process_model(glb_path)
            if stats:
                self.stats.append(stats)

        return self.stats

    def generate_report(self, output_path: Path = None) -> Dict:
        """Generate optimization report."""
        if output_path is None:
            output_path = self.output_dir / "optimization_report.json"

        # Calculate totals
        total_original_size = sum(s.original_size_mb for s in self.stats)
        total_optimized_size = sum(s.optimized_size_mb for s in self.stats)
        total_lod_size = sum(s.lod_low_size_mb for s in self.stats)

        total_original_tris = sum(s.original_tris for s in self.stats)
        total_optimized_tris = sum(s.optimized_tris for s in self.stats)
        total_lod_tris = sum(s.lod_low_tris for s in self.stats)

        report = {
            "timestamp": str(Path(output_path).parent),
            "decimate_ratio": self.decimate_ratio,
            "model_count": len(self.stats),

            "size_mb": {
                "original_total": round(total_original_size, 2),
                "optimized_total": round(total_optimized_size, 2),
                "lod_low_total": round(total_lod_size, 2),
                "size_saved_mb": round(total_original_size - total_optimized_size, 2),
                "compression_ratio": round(total_optimized_size / total_original_size if total_original_size > 0 else 1.0, 3),
            },

            "geometry": {
                "original_total_tris": total_original_tris,
                "optimized_total_tris": total_optimized_tris,
                "lod_low_total_tris": total_lod_tris,
                "poly_reduction_ratio": round(total_optimized_tris / total_original_tris if total_original_tris > 0 else 1.0, 3),
            },

            "models": [
                {
                    "name": s.name,
                    "original_size_mb": round(s.original_size_mb, 2),
                    "optimized_size_mb": round(s.optimized_size_mb, 2),
                    "lod_low_size_mb": round(s.lod_low_size_mb, 2),
                    "original_tris": s.original_tris,
                    "optimized_tris": s.optimized_tris,
                    "lod_low_tris": s.lod_low_tris,
                    "compression": f"{s.compression_ratio():.1%}",
                    "poly_reduction": f"{s.poly_reduction():.1%}",
                }
                for s in sorted(self.stats, key=lambda x: x.original_size_mb, reverse=True)
            ]
        }

        # Write JSON report
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)

        return report

    def print_report(self, report: Dict) -> None:
        """Print human-readable report."""
        print("\n" + "="*70)
        print("📊 OPTIMIZATION REPORT")
        print("="*70)

        print(f"\n🎯 SUMMARY")
        print(f"  Models processed: {report['model_count']}")
        print(f"  Size reduction: {report['size_mb']['original_total']:.1f} MB → {report['size_mb']['optimized_total']:.1f} MB")
        print(f"  Compression ratio: {report['size_mb']['compression_ratio']:.1%}")
        print(f"  Space saved: {report['size_mb']['size_saved_mb']:.1f} MB")

        print(f"\n📐 GEOMETRY")
        print(f"  Original triangles: {report['geometry']['original_total_tris']:,}")
        print(f"  Optimized triangles: {report['geometry']['optimized_total_tris']:,}")
        print(f"  LOD triangles: {report['geometry']['lod_low_total_tris']:,}")
        print(f"  Poly reduction: {report['geometry']['poly_reduction_ratio']:.1%}")

        print(f"\n📦 MODELS")
        for model in report['models']:
            print(f"\n  {model['name']}")
            print(f"    Size: {model['original_size_mb']} MB → {model['optimized_size_mb']} MB ({model['compression']})")
            print(f"    Tris: {model['original_tris']:,} → {model['optimized_tris']:,} ({model['poly_reduction']})")
            if model['lod_low_size_mb'] > 0:
                print(f"    LOD:  {model['lod_low_size_mb']} MB ({model['lod_low_tris']:,} tris)")

        print("\n" + "="*70)
        print(f"✅ Report saved: {Path(report.get('timestamp', ''))}/optimization_report.json")


def main():
    """Main entry point."""
    # Determine paths
    models_dir = Path(__file__).parent.parent / "apps" / "web" / "public" / "models"

    if not models_dir.exists():
        print(f"❌ Models directory not found: {models_dir}")
        return 1

    # Initialize optimizer
    optimizer = ModelOptimizer(
        models_dir=str(models_dir),
        decimate_ratio=0.5  # 50% polygon reduction
    )

    # Process all models
    stats = optimizer.process_all()

    if not stats:
        print("❌ No models processed successfully")
        return 1

    # Generate and print report
    report = optimizer.generate_report()
    optimizer.print_report(report)

    print(f"\n🎉 Optimization complete!")
    print(f"   📁 Optimized models: {optimizer.output_dir}")
    print(f"   📁 LOD models: {optimizer.output_dir / 'lod_low'}")

    return 0


if __name__ == "__main__":
    exit(main())
