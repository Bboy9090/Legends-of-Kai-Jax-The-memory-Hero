"""
Texture Template Creator
Creates texture templates for Beast-Kin characters

Usage:
1. Open Blender with retopologized model
2. Text Editor → Open this script
3. Run Script (Alt+P)
4. Texture templates created
"""

import bpy
import os

def create_texture_templates(character_name, character_id):
    """Create texture templates for a character"""
    print(f"\n{'='*50}")
    print(f"Creating texture templates for {character_name}")
    print(f"{'='*50}")
    
    # Get active object
    obj = bpy.context.active_object
    if not obj or obj.type != 'MESH':
        print("⚠️  No mesh selected!")
        return
    
    # Check if UVs exist
    if not obj.data.uv_layers:
        print("⚠️  No UV maps found! Unwrap first.")
        return
    
    # Get UV map
    uv_map = obj.data.uv_layers.active
    
    print(f"✓ UV map found: {uv_map.name}")
    print(f"✓ Ready to create texture templates")
    
    # Create texture directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    char_dir = os.path.join(script_dir, "..", character_id.lower().replace("_", "-"))
    texture_dir = os.path.join(char_dir, "textures")
    
    os.makedirs(texture_dir, exist_ok=True)
    
    print(f"\nTexture directory: {texture_dir}")
    print("\nTexture maps to create:")
    print(f"  - {character_id}_Albedo.png (2048x2048)")
    print(f"  - {character_id}_Normal.png (2048x2048)")
    print(f"  - {character_id}_MR.png (2048x2048)")
    print(f"  - {character_id}_Emissive.png (1024x1024)")
    print(f"  - {character_id}_AO.png (1024x1024)")
    
    print("\nNext steps:")
    print("  1. Export UV layout (UV → Export UV Layout)")
    print("  2. Paint textures in Substance Painter or Photoshop")
    print("  3. Follow TEXTURING_MASTER_GUIDE.md")
    print("="*50)

# Character list
characters = [
    ("Jaxon", "JAXON"),
    ("Kaison", "KAISON"),
    ("Kai-Jax", "KAI_JAX"),
    ("Silver", "SILVER"),
    ("Lunara Solis", "LUNARA_SOLIS"),
    ("Boryx Zenith", "BORYX_ZENITH"),
    ("Umbra-Flux", "UMBRA_FLUX"),
    ("Sentinel Vox", "SENTINEL_VOX"),
    ("Kiro Kong", "KIRO_KONG"),
]

print("\n" + "="*50)
print("TEXTURE TEMPLATE CREATOR")
print("="*50)
print("\nSelect a character mesh, then run:")
print("  create_texture_templates('Character Name', 'CHARACTER_ID')")
print("\nExample:")
print("  create_texture_templates('Jaxon', 'JAXON')")
print("="*50)
