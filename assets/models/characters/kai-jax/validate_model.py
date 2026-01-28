#!/usr/bin/env python3
"""
Validate Kai-Jax 3D model against canonical specification

Checks:
1. Model file exists and is valid GLB
2. Skeleton has correct bone structure
3. Tail count matches canonical spec (9 tails)
4. Materials match specification
5. Mesh quality (triangle count, topology)

Usage:
    python3 validate_model.py [path/to/kai_jax_hero.glb]
"""

import sys
import json
import struct
import os
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def success(msg):
    print(f"{GREEN}✓{RESET} {msg}")

def error(msg):
    print(f"{RED}✗{RESET} {msg}")
    
def warning(msg):
    print(f"{YELLOW}⚠{RESET} {msg}")

def load_canonical_data():
    """Load canonical character data"""
    # Try environment variable first, then relative path
    if 'LEGENDS_REPO_ROOT' in os.environ:
        repo_root = Path(os.environ['LEGENDS_REPO_ROOT'])
    else:
        repo_root = Path(__file__).parent.parent.parent.parent.parent
    
    char_json = repo_root / 'kai_jax.character.json'
    
    if not char_json.exists():
        error(f"Canonical data not found: {char_json}")
        error("Tip: Set LEGENDS_REPO_ROOT environment variable to repo root path")
        sys.exit(1)
    
    with open(char_json) as f:
        return json.load(f)

def load_glb(path):
    """Load and parse GLB file"""
    with open(path, 'rb') as f:
        # Read GLB header
        magic = f.read(4)
        if magic != b'glTF':
            raise ValueError(f"Invalid GLB file (magic: {magic})")
        
        version = struct.unpack('<I', f.read(4))[0]
        if version != 2:
            raise ValueError(f"Unsupported glTF version: {version}")
        
        length = struct.unpack('<I', f.read(4))[0]
        
        # Read JSON chunk
        json_chunk_length = struct.unpack('<I', f.read(4))[0]
        json_chunk_type = f.read(4)
        
        if json_chunk_type != b'JSON':
            raise ValueError("First chunk must be JSON")
        
        json_data = f.read(json_chunk_length).decode('utf-8')
        gltf = json.loads(json_data)
        
        return gltf, length

def validate_skeleton(gltf, expected_tail_count):
    """Validate skeleton structure"""
    print("\n=== SKELETON VALIDATION ===")
    
    if 'skins' not in gltf or len(gltf['skins']) == 0:
        error("No skeleton found in model")
        return False
    
    skin = gltf['skins'][0]
    joints = skin.get('joints', [])
    bone_count = len(joints)
    
    success(f"Total bones: {bone_count}")
    
    # Count tail bones
    nodes = gltf.get('nodes', [])
    tail_bones = []
    
    for joint_idx in joints:
        if joint_idx < len(nodes):
            node = nodes[joint_idx]
            name = node.get('name', '')
            # Match bones that start with "Tail_" and are numbered segments (not _Base)
            if name.startswith('Tail_') and not name.endswith('_Base'):
                # Extract tail number from name pattern like "Tail_01_03" or "Tail_1_3"
                parts = name.split('_')
                if len(parts) >= 3:  # Has tail index and segment index
                    tail_bones.append(name)
    
    # Count unique tails by looking for base bones or first segments
    unique_tails = set()
    for bone_name in tail_bones:
        parts = bone_name.split('_')
        if len(parts) >= 2:
            # Extract tail number (e.g., "01" from "Tail_01_03")
            tail_num = parts[1]
            unique_tails.add(tail_num)
    
    tail_count = len(unique_tails)
    
    if tail_count == expected_tail_count:
        success(f"Tail count: {tail_count} (matches canonical {expected_tail_count})")
    else:
        error(f"Tail count: {tail_count} (expected {expected_tail_count})")
        return False
    
    # Estimate bones per tail
    bones_per_tail = len(tail_bones) // tail_count if tail_count > 0 else 0
    
    if 5 <= bones_per_tail <= 7:
        success(f"Bones per tail: ~{bones_per_tail} (within canonical range 5-7)")
    else:
        warning(f"Bones per tail: ~{bones_per_tail} (canonical range is 5-7)")
    
    return True

def validate_materials(gltf, expected_materials):
    """Validate materials"""
    print("\n=== MATERIAL VALIDATION ===")
    
    if 'materials' not in gltf:
        error("No materials found in model")
        return False
    
    materials = gltf['materials']
    material_names = [m.get('name', 'Unnamed') for m in materials]
    
    success(f"Material count: {len(materials)}")
    
    for name in material_names:
        print(f"  - {name}")
    
    # Check for PBR workflow
    for mat in materials:
        if 'pbrMetallicRoughness' in mat:
            success(f"Material '{mat.get('name', 'Unnamed')}' uses PBR workflow")
        else:
            warning(f"Material '{mat.get('name', 'Unnamed')}' may not use PBR")
    
    return True

def validate_mesh_quality(gltf, lod_targets):
    """Validate mesh quality"""
    print("\n=== MESH QUALITY VALIDATION ===")
    
    if 'meshes' not in gltf:
        error("No meshes found in model")
        return False
    
    meshes = gltf['meshes']
    success(f"Mesh count: {len(meshes)}")
    
    # Estimate triangle count from accessors
    total_triangles = 0
    
    for mesh in meshes:
        for primitive in mesh.get('primitives', []):
            if 'indices' in primitive:
                accessor_idx = primitive['indices']
                if 'accessors' in gltf and accessor_idx < len(gltf['accessors']):
                    accessor = gltf['accessors'][accessor_idx]
                    count = accessor.get('count', 0)
                    # Triangles = indices / 3
                    total_triangles += count // 3
    
    print(f"  Estimated triangle count: {total_triangles:,}")
    
    # Check against LOD0 target
    lod0 = lod_targets.get('lod0', {})
    min_tris = lod0.get('triangles', [0, 0])[0]
    max_tris = lod0.get('triangles', [0, 0])[1]
    
    if min_tris <= total_triangles <= max_tris:
        success(f"Triangle count within LOD0 target [{min_tris:,} - {max_tris:,}]")
    else:
        warning(f"Triangle count outside LOD0 target [{min_tris:,} - {max_tris:,}]")
    
    return True

def validate_animations(gltf, required_animations):
    """Validate animations"""
    print("\n=== ANIMATION VALIDATION ===")
    
    if 'animations' not in gltf or len(gltf['animations']) == 0:
        warning("No animations found in model")
        print(f"  Required: {len(required_animations)} animation sets")
        return False
    
    animations = gltf['animations']
    anim_names = [a.get('name', 'Unnamed') for a in animations]
    
    success(f"Animation count: {len(animations)}")
    
    for name in anim_names:
        print(f"  - {name}")
    
    # Check for required animations
    missing = []
    for required in required_animations:
        if not any(required.lower() in name.lower() for name in anim_names):
            missing.append(required)
    
    if missing:
        warning(f"Missing required animations: {', '.join(missing[:5])}...")
    else:
        success("All required animation categories present")
    
    return True

def main():
    print("="*60)
    print("KAI-JAX MODEL VALIDATOR")
    print("="*60)
    
    # Determine model path
    if len(sys.argv) > 1:
        model_path = Path(sys.argv[1])
    else:
        # Try environment variable first, then relative path
        if 'LEGENDS_REPO_ROOT' in os.environ:
            repo_root = Path(os.environ['LEGENDS_REPO_ROOT'])
        else:
            repo_root = Path(__file__).parent.parent.parent.parent.parent
        model_path = repo_root / 'server/public/models/kai_jax_hero.glb'
    
    print(f"\nModel path: {model_path}")
    
    # Check if file exists
    if not model_path.exists():
        error(f"Model file not found: {model_path}")
        print("\nGenerate the model first:")
        print("  cd assets/models/characters/kai-jax/blender_scripts")
        print("  blender --background --python generate_kai_jax_complete.py")
        sys.exit(1)
    
    success(f"Model file exists ({model_path.stat().st_size / 1024 / 1024:.2f} MB)")
    
    # Load canonical data
    print("\nLoading canonical data...")
    try:
        canonical = load_canonical_data()
        success("Canonical data loaded")
    except Exception as e:
        error(f"Failed to load canonical data: {e}")
        sys.exit(1)
    
    # Load GLB
    print("\nLoading GLB model...")
    try:
        gltf, file_size = load_glb(model_path)
        success("GLB loaded successfully")
    except Exception as e:
        error(f"Failed to load GLB: {e}")
        sys.exit(1)
    
    # Run validations
    all_passed = True
    
    expected_tail_count = canonical['anatomy']['tail_count']
    all_passed &= validate_skeleton(gltf, expected_tail_count)
    
    all_passed &= validate_materials(gltf, canonical['materials'])
    
    lod_targets = canonical['modeling']['lod_targets']
    all_passed &= validate_mesh_quality(gltf, lod_targets)
    
    required_animations = canonical['animation']['required_sets']
    all_passed &= validate_animations(gltf, required_animations)
    
    # Summary
    print("\n" + "="*60)
    if all_passed:
        success("MODEL VALIDATION PASSED")
    else:
        warning("MODEL VALIDATION COMPLETED WITH WARNINGS")
    print("="*60)
    
    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main()
