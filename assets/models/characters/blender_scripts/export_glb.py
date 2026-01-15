"""
Blender GLB Export Script
Automated export with OMEGA PROTOCOL settings

Usage:
1. Open Blender
2. Load character model
3. Run Script: Text Editor → Run Script
4. Select export directory
"""

import bpy
import os
from pathlib import Path

# OMEGA PROTOCOL Export Settings
EXPORT_SETTINGS = {
    'format': 'GLB',
    'use_selection': False,
    'use_visible': True,
    'use_renderable': True,
    'use_active_collection': False,
    'export_texcoords': True,
    'export_normals': True,
    'export_draco_mesh_compression_enable': True,
    'export_draco_mesh_compression_level': 6,
    'export_draco_position_quantization': 14,
    'export_draco_normal_quantization': 10,
    'export_draco_texcoord_quantization': 12,
    'export_draco_generic_quantization': 12,
    'export_tangents': True,
    'export_materials': 'EXPORT',
    'export_colors': True,
    'export_cameras': False,
    'export_lights': False,
    'export_animations': True,
    'export_frame_range': True,
    'export_force_sampling': False,
    'export_deformation_bones_only': True,
    'export_def_bones': True,
    'export_skins': True,
    'export_all_influences': False,
    'export_morph': False,
    'export_morph_normal': False,
    'export_morph_tangent': False,
    'export_lights': False,
    'export_yup': True,
    'export_apply': True,
}

def export_character_glb(character_id, lod_level=0, output_dir=None):
    """
    Export character as GLB with OMEGA PROTOCOL settings
    
    Args:
        character_id: Character identifier (e.g., 'JAXON', 'KAISON')
        lod_level: LOD level (0, 1, or 2)
        output_dir: Output directory (defaults to character folder)
    """
    
    # Set output directory
    if output_dir is None:
        script_dir = Path(bpy.data.filepath).parent
        output_dir = script_dir / f"{character_id.lower()}" / f"{character_id}_LOD{lod_level}.glb"
    else:
        output_dir = Path(output_dir) / f"{character_id}_LOD{lod_level}.glb"
    
    # Ensure output directory exists
    output_dir.parent.mkdir(parents=True, exist_ok=True)
    
    # Set export path
    export_path = str(output_dir)
    
    # Apply export settings
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        **EXPORT_SETTINGS
    )
    
    print(f"✅ Exported {character_id} LOD{lod_level} to: {export_path}")
    return export_path

def export_all_lods(character_id, output_dir=None):
    """Export all LOD versions of character"""
    lods = []
    for lod in [0, 1, 2]:
        path = export_character_glb(character_id, lod, output_dir)
        lods.append(path)
    return lods

# Example usage
if __name__ == "__main__":
    # Get character ID from scene name or user input
    character_id = bpy.context.scene.name.upper() or "CHARACTER"
    
    # Export all LODs
    print(f"Exporting {character_id}...")
    export_all_lods(character_id)
    print("✅ Export complete!")
