"""
Retopology Helper Script
Assists with retopology workflow for Beast-Kin characters

Usage:
1. Open Blender with high-poly sculpt
2. Text Editor → New
3. Paste this script
4. Run Script (Alt+P)
5. Follow prompts
"""

import bpy

def setup_retopology():
    """Setup retopology workspace"""
    print("\n" + "="*50)
    print("RETOPOLOGY HELPER - Setup")
    print("="*50)
    
    # Check for high-poly sculpt
    high_poly = None
    for obj in bpy.context.scene.objects:
        if "HighPoly" in obj.name or "Sculpt" in obj.name:
            high_poly = obj
            break
    
    if not high_poly:
        print("⚠️  No high-poly sculpt found!")
        print("   Please name your sculpt with 'HighPoly' or 'Sculpt'")
        return
    
    print(f"✓ Found high-poly: {high_poly.name}")
    
    # Create base mesh
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.5,
        location=high_poly.location
    )
    base_mesh = bpy.context.active_object
    base_mesh.name = "Retopo_Base"
    
    # Scale to match high-poly
    base_mesh.scale = high_poly.dimensions
    
    # Add Shrinkwrap modifier
    shrinkwrap = base_mesh.modifiers.new(name="Shrinkwrap", type='SHRINKWRAP')
    shrinkwrap.target = high_poly
    shrinkwrap.wrap_method = 'NEAREST_SURFACE_POINT'
    shrinkwrap.offset = 0.001
    
    print("✓ Base mesh created")
    print("✓ Shrinkwrap modifier added")
    print("\nNext steps:")
    print("  1. Enter Edit Mode (Tab)")
    print("  2. Start building topology")
    print("  3. Use Loop Cut (Ctrl+R) to add loops")
    print("  4. Use Shrinkwrap to match high-poly")
    print("="*50)

def check_topology():
    """Check topology quality"""
    print("\n" + "="*50)
    print("TOPOLOGY CHECK")
    print("="*50)
    
    obj = bpy.context.active_object
    if not obj or obj.type != 'MESH':
        print("⚠️  No mesh selected!")
        return
    
    # Enter Edit Mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select all
    bpy.ops.mesh.select_all(action='SELECT')
    
    # Check for n-gons
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.mesh.select_face_by_sides(number=4, type='GREATER')
    
    n_gons = len([f for f in obj.data.polygons if f.select])
    
    # Get polycount
    polycount = len(obj.data.polygons)
    vertcount = len(obj.data.vertices)
    
    print(f"✓ Polycount: {polycount} faces")
    print(f"✓ Vertices: {vertcount}")
    
    if n_gons > 0:
        print(f"⚠️  N-gons found: {n_gons}")
        print("   Convert to quads/tris")
    else:
        print("✓ No n-gons (good!)")
    
    # Check for triangles
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.mesh.select_face_by_sides(number=3, type='EQUAL')
    tris = len([f for f in obj.data.polygons if f.select])
    
    # Check for quads
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.mesh.select_face_by_sides(number=4, type='EQUAL')
    quads = len([f for f in obj.data.polygons if f.select])
    
    print(f"✓ Quads: {quads}")
    print(f"✓ Triangles: {tris}")
    
    if quads / polycount > 0.8:
        print("✓ Mostly quads (excellent!)")
    else:
        print("⚠️  Consider converting more to quads")
    
    bpy.ops.object.mode_set(mode='OBJECT')
    print("="*50)

def setup_uv_unwrap():
    """Setup UV unwrapping"""
    print("\n" + "="*50)
    print("UV UNWRAPPING SETUP")
    print("="*50)
    
    obj = bpy.context.active_object
    if not obj or obj.type != 'MESH':
        print("⚠️  No mesh selected!")
        return
    
    # Enter Edit Mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Mark seams (suggested locations)
    print("Suggested seam locations:")
    print("  - Under arms (armpits)")
    print("  - Inner legs")
    print("  - Back center")
    print("  - Head/body separation")
    print("\nTo mark seams:")
    print("  1. Select edges")
    print("  2. Ctrl+E → Mark Seam")
    print("\nTo unwrap:")
    print("  1. Select All (A)")
    print("  2. U → Unwrap")
    print("="*50)

def optimize_polycount():
    """Optimize polycount for LOD"""
    print("\n" + "="*50)
    print("POLYCOUNT OPTIMIZATION")
    print("="*50)
    
    obj = bpy.context.active_object
    if not obj or obj.type != 'MESH':
        print("⚠️  No mesh selected!")
        return
    
    polycount = len(obj.data.polygons)
    
    print(f"Current polycount: {polycount} faces")
    print("\nLOD Targets:")
    print("  LOD0: 35,000-45,000 tris (high detail)")
    print("  LOD1: 18,000-25,000 tris (medium detail)")
    print("  LOD2: 8,000-12,000 tris (low detail)")
    
    # Estimate tris (assuming mostly quads = 2 tris per quad)
    estimated_tris = polycount * 2
    
    print(f"\nEstimated tris: {estimated_tris}")
    
    if estimated_tris > 50000:
        print("⚠️  Polycount too high for LOD0")
        print("   Consider reducing loops")
    elif estimated_tris < 35000:
        print("✓ Polycount within LOD0 range")
    else:
        print("✓ Polycount good for LOD0")
    
    print("="*50)

# Main menu
print("\n" + "="*50)
print("BEAST-KIN RETOPOLOGY HELPER")
print("="*50)
print("\nAvailable functions:")
print("  1. setup_retopology() - Setup retopology workspace")
print("  2. check_topology() - Check topology quality")
print("  3. setup_uv_unwrap() - Setup UV unwrapping")
print("  4. optimize_polycount() - Check polycount")
print("\nUsage:")
print("  - Run: setup_retopology()")
print("  - Or call functions individually")
print("="*50)

# Auto-run setup if high-poly found
if any("HighPoly" in obj.name or "Sculpt" in obj.name for obj in bpy.context.scene.objects):
    print("\nAuto-running setup...")
    setup_retopology()
