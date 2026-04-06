"""
Blender Character Rig Setup Script
Automated rigging with Rigify for character models

Usage:
1. Select character mesh
2. Run Script: Text Editor → Run Script
3. Follow prompts for character type
"""

import bpy
import bmesh

# Character-specific rig configurations
RIG_CONFIGS = {
    'JAXON': {
        'quills': 7,
        'quill_bones_per_quill': 3,
        'base_rig': 'human_meta_rig',
    },
    'KAISON': {
        'tails': 2,
        'tail_bones_per_tail': 10,
        'base_rig': 'human_meta_rig',
    },
    'KAIJAX': {
        'tails': 3,
        'tail_bones_per_tail': 10,
        'base_rig': 'human_meta_rig',
    },
    'SILVER': {
        'quills': 6,
        'quill_bones_per_quill': 3,
        'base_rig': 'human_meta_rig',
    },
    'LUNARA': {
        'tails': 9,
        'tail_bones_per_tail': 12,
        'base_rig': 'human_meta_rig',
    },
}

def create_quill_bones(armature, quill_count, bones_per_quill, base_name="Quill"):
    """Create quill bones for hedgehog characters"""
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='EDIT')
    
    edit_bones = armature.data.edit_bones
    
    for i in range(quill_count):
        for j in range(bones_per_quill):
            bone_name = f"{base_name}_{i+1:02d}_{'base' if j == 0 else 'mid' if j == 1 else 'tip'}"
            bone = edit_bones.new(bone_name)
            
            # Position quill bones (adjust based on character)
            if j == 0:
                # Base bone
                bone.head = (0, 0.5, 0.3 + i * 0.1)
                bone.tail = (0, 0.6, 0.3 + i * 0.1)
            elif j == 1:
                # Mid bone
                bone.head = edit_bones[f"{base_name}_{i+1:02d}_base"].tail
                bone.tail = (0, 0.7, 0.3 + i * 0.1)
            else:
                # Tip bone
                bone.head = edit_bones[f"{base_name}_{i+1:02d}_mid"].tail
                bone.tail = (0, 0.8, 0.3 + i * 0.1)
            
            # Parent chain
            if j > 0:
                parent_name = f"{base_name}_{i+1:02d}_{'base' if j == 1 else 'mid'}"
                bone.parent = edit_bones[parent_name]

def create_tail_bones(armature, tail_count, bones_per_tail, base_name="Tail"):
    """Create tail bones for kitsune/fox characters"""
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='EDIT')
    
    edit_bones = armature.data.edit_bones
    
    for i in range(tail_count):
        for j in range(bones_per_tail):
            bone_name = f"{base_name}_{i+1:02d}_{j:02d}"
            bone = edit_bones.new(bone_name)
            
            # Position tail bones in arc
            angle = (j / bones_per_tail) * 1.5  # 1.5 radian arc
            length = 0.15
            
            if j == 0:
                # Base bone (attach to spine)
                bone.head = (0, 0.3, 0.1 + i * 0.05)
                bone.tail = (
                    bone.head.x + length * 0.5,
                    bone.head.y + length,
                    bone.head.z
                )
            else:
                # Chain bones
                parent = edit_bones[f"{base_name}_{i+1:02d}_{j-1:02d}"]
                bone.head = parent.tail
                bone.tail = (
                    bone.head.x + length * (1 - j * 0.05) * 0.5,
                    bone.head.y + length * (1 - j * 0.05),
                    bone.head.z + length * 0.2 * (j / bones_per_tail)
                )
            
            # Parent chain
            if j > 0:
                parent_name = f"{base_name}_{i+1:02d}_{j-1:02d}"
                bone.parent = edit_bones[parent_name]

def setup_character_rig(character_id):
    """Set up complete rig for character"""
    config = RIG_CONFIGS.get(character_id.upper())
    
    if not config:
        print(f"❌ No rig config found for {character_id}")
        return None
    
    # Create base rigify meta-rig
    bpy.ops.object.armature_add(location=(0, 0, 0))
    armature = bpy.context.active_object
    armature.name = f"RIG_{character_id}"
    
    # Generate base rigify rig
    bpy.ops.pose.rigify_generate()
    
    # Add character-specific bones
    if 'quills' in config:
        create_quill_bones(
            armature,
            config['quills'],
            config['quill_bones_per_quill']
        )
    
    if 'tails' in config:
        create_tail_bones(
            armature,
            config['tails'],
            config['tail_bones_per_tail']
        )
    
    print(f"✅ Rig created for {character_id}")
    return armature

# Example usage
if __name__ == "__main__":
    # Get character ID (you can modify this)
    character_id = "JAXON"  # Change as needed
    
    print(f"Setting up rig for {character_id}...")
    rig = setup_character_rig(character_id)
    
    if rig:
        print("✅ Rig setup complete!")
        print("Next steps:")
        print("1. Parent mesh to armature")
        print("2. Weight paint")
        print("3. Test animations")
