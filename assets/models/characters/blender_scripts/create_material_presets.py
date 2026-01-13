"""
Blender Material Preset Creator
Creates PBR material presets for character models

Usage:
1. Run Script: Text Editor → Run Script
2. Materials will be created in material library
"""

import bpy

# Character material presets
MATERIAL_PRESETS = {
    'JAXON': {
        'body': {
            'name': 'MAT_Jaxon_Body',
            'base_color': (0.0, 0.4, 1.0, 1.0),  # Electric Blue #0066FF
            'metallic': 0.0,
            'roughness': 0.3,
            'subsurface': 0.0,
        },
        'quills': {
            'name': 'MAT_Jaxon_Quills',
            'base_color': (0.2, 0.6, 1.0, 1.0),  # Electric Blue #3399FF
            'metallic': 0.8,
            'roughness': 0.2,
            'emission_color': (0.0, 0.85, 1.0, 1.0),  # Cyan #00D9FF
            'emission_strength': 2.5,
        },
        'eyes': {
            'name': 'MAT_Jaxon_Eyes',
            'base_color': (0.0, 1.0, 0.0, 1.0),  # Bright Green #00FF00
            'emission_color': (0.0, 1.0, 0.0, 1.0),
            'emission_strength': 3.0,
        },
    },
    'KAISON': {
        'body': {
            'name': 'MAT_Kaison_Body',
            'base_color': (1.0, 0.55, 0.0, 1.0),  # Golden-Orange #FF8C00
            'metallic': 0.0,
            'roughness': 0.4,
            'subsurface': 0.2,
        },
        'tails': {
            'name': 'MAT_Kaison_Tails',
            'base_color': (1.0, 0.84, 0.0, 1.0),  # Gold #FFD700
            'metallic': 0.3,
            'roughness': 0.1,
            'emission_color': (1.0, 0.4, 0.0, 1.0),  # Orange #FF6600
            'emission_strength': 2.5,
            'alpha': 0.8,
        },
        'eyes': {
            'name': 'MAT_Kaison_Eyes',
            'base_color': (1.0, 0.55, 0.0, 1.0),  # Amber #FF8C00
            'emission_color': (1.0, 0.55, 0.0, 1.0),
            'emission_strength': 2.5,
        },
    },
    'KAIJAX': {
        'body': {
            'name': 'MAT_KaiJax_Body',
            'base_color': (0.1, 0.1, 0.1, 1.0),  # Obsidian Charcoal #1A1A1A
            'metallic': 0.0,
            'roughness': 0.6,
            'subsurface': 0.3,
        },
        'nebula': {
            'name': 'MAT_KaiJax_Nebula',
            'type': 'volume',
            'color': (0.55, 0.31, 0.97, 1.0),  # Purple #8B4FF7
            'density': 0.2,
        },
        'quills': {
            'name': 'MAT_KaiJax_Quills',
            'base_color': (0.2, 0.6, 1.0, 1.0),  # Electric Blue #3399FF
            'metallic': 0.8,
            'roughness': 0.2,
            'emission_color': (0.0, 0.85, 1.0, 1.0),  # Cyan #00D9FF
            'emission_strength': 2.5,
        },
        'tail_gold': {
            'name': 'MAT_KaiJax_Tail_Gold',
            'base_color': (1.0, 0.84, 0.0, 1.0),  # Gold #FFD700
            'metallic': 0.4,
            'roughness': 0.1,
            'emission_color': (1.0, 0.84, 0.0, 1.0),
            'emission_strength': 2.0,
            'alpha': 0.8,
        },
        'tail_blue': {
            'name': 'MAT_KaiJax_Tail_Blue',
            'base_color': (0.0, 0.4, 1.0, 1.0),  # Blue #0066FF
            'metallic': 0.3,
            'roughness': 0.4,
            'emission_color': (0.0, 0.4, 1.0, 1.0),
            'emission_strength': 1.5,
        },
        'tail_white': {
            'name': 'MAT_KaiJax_Tail_White',
            'base_color': (1.0, 1.0, 1.0, 1.0),  # White #FFFFFF
            'emission_color': (1.0, 1.0, 1.0, 1.0),
            'emission_strength': 2.0,
            'alpha': 0.6,
        },
        'eyes': {
            'name': 'MAT_KaiJax_Eyes',
            'base_color': (1.0, 0.84, 0.0, 1.0),  # Neon Gold #FFD700
            'emission_color': (1.0, 0.84, 0.0, 1.0),
            'emission_strength': 3.5,
        },
    },
}

def create_material(preset_data, use_nodes=True):
    """Create material from preset data"""
    mat = bpy.data.materials.new(name=preset_data['name'])
    mat.use_nodes = use_nodes
    
    if not use_nodes:
        return mat
    
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # Clear default nodes
    nodes.clear()
    
    # Create Principled BSDF
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    
    # Set base properties
    if 'base_color' in preset_data:
        bsdf.inputs['Base Color'].default_value = preset_data['base_color']
    if 'metallic' in preset_data:
        bsdf.inputs['Metallic'].default_value = preset_data['metallic']
    if 'roughness' in preset_data:
        bsdf.inputs['Roughness'].default_value = preset_data['roughness']
    if 'subsurface' in preset_data:
        bsdf.inputs['Subsurface'].default_value = preset_data['subsurface']
    
    # Handle emission
    if 'emission_color' in preset_data:
        bsdf.inputs['Emission Color'].default_value = preset_data['emission_color']
        bsdf.inputs['Emission Strength'].default_value = preset_data.get('emission_strength', 1.0)
    
    # Handle transparency
    if preset_data.get('alpha', 1.0) < 1.0:
        transparent = nodes.new(type='ShaderNodeBsdfTransparent')
        transparent.location = (-200, -200)
        mix = nodes.new(type='ShaderNodeMixShader')
        mix.location = (200, 0)
        mix.inputs['Fac'].default_value = 1.0 - preset_data['alpha']
        
        links.new(bsdf.outputs['BSDF'], mix.inputs[1])
        links.new(transparent.outputs['BSDF'], mix.inputs[2])
        
        output = nodes.new(type='ShaderNodeOutputMaterial')
        output.location = (400, 0)
        links.new(mix.outputs['Shader'], output.inputs['Surface'])
    else:
        output = nodes.new(type='ShaderNodeOutputMaterial')
        output.location = (400, 0)
        links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_character_materials(character_id):
    """Create all materials for a character"""
    presets = MATERIAL_PRESETS.get(character_id.upper())
    
    if not presets:
        print(f"❌ No material presets found for {character_id}")
        return []
    
    materials = []
    for material_type, preset_data in presets.items():
        mat = create_material(preset_data)
        materials.append(mat)
        print(f"✅ Created {mat.name}")
    
    return materials

# Example usage
if __name__ == "__main__":
    # Create materials for all characters
    for character_id in MATERIAL_PRESETS.keys():
        print(f"\nCreating materials for {character_id}...")
        create_character_materials(character_id)
    
    print("\n✅ All material presets created!")
    print("Materials are now available in the Material Library")
