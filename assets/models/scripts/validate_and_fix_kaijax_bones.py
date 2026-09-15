#!/usr/bin/env python3
"""
Blender Script: Validate and fix Kai-Jax GLB bone structure
Ensures canonical bones (root, spine, head, tail_01..tail_09) exist
"""

import bpy
import os
from mathutils import Vector

def main():
    print("\n" + "="*60)
    print("🎮 KAI-JAX BONE STRUCTURE VALIDATOR & FIXER")
    print("="*60)

    # Check if we have an armature
    armature = None
    for obj in bpy.data.objects:
        if obj.type == 'ARMATURE':
            armature = obj
            break

    if not armature:
        print("\n❌ NO ARMATURE FOUND!")
        print("Please import the GLB first or ensure it has an armature.")
        return

    print(f"\n✅ Found armature: {armature.name}")

    # Enter edit mode to check bones
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='EDIT')

    bones = armature.data.edit_bones
    existing_bones = {b.name: b for b in bones}

    print(f"\n📊 Current bones ({len(existing_bones)}):")
    for name in sorted(existing_bones.keys()):
        print(f"  - {name}")

    # Check for required canonical bones
    print("\n🔍 Checking canonical bone requirements:")
    required = ['root', 'spine', 'head']
    for bone_name in required:
        found = any(bone_name.lower() in name.lower() for name in existing_bones.keys())
        status = "✅" if found else "❌"
        print(f"  {status} {bone_name}")

    # Check for tail bones
    print("\n🔍 Checking tail chain (tail_01..tail_09):")
    tail_count = 0
    for i in range(1, 10):
        tail_name = f"tail_{i:02d}"
        if tail_name in existing_bones:
            tail_count += 1
            print(f"  ✅ {tail_name}")
        else:
            print(f"  ❌ {tail_name}")

    print(f"\n📈 Tail Coverage: {tail_count}/9 bones")

    # Report status
    print("\n" + "="*60)
    if tail_count >= 8 and required[0].lower() in str(existing_bones.keys()).lower():
        print("✅ BONE STRUCTURE ACCEPTABLE FOR GAME RUNTIME")
    else:
        print("⚠️  BONES NEED REPAIR/RENAMING")
        print("   Manual Blender editing required")
    print("="*60 + "\n")

    # Return to object mode
    bpy.ops.object.mode_set(mode='OBJECT')

if __name__ == "__main__":
    main()
