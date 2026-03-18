"""
Run All Blockout Scripts
Generates all 9 Beast-Kin character blockouts

Usage:
1. Open Blender
2. Text Editor → Open this script
3. Run Script (Alt+P)
4. All blockouts generated!
"""

import bpy
import os
import sys

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
characters_dir = os.path.dirname(script_dir)

# Character list with their script paths
characters = [
    ("JAXON", "jaxon", "generate_jaxon_blockout.py"),
    ("KAISON", "kaison", "generate_kaison_blockout.py"),
    ("KAI-JAX", "kai-jax", "generate_kai_jax_blockout.py"),
    ("SILVER", "silver", "generate_silver_blockout.py"),
    ("LUNARA SOLIS", "lunara-solis", "generate_lunara_blockout.py"),
    ("BORYX ZENITH", "boryx-zenith", "generate_boryx_blockout.py"),
    ("UMBRA-FLUX", "umbra-flux", "generate_umbra_flux_blockout.py"),
    ("SENTINEL VOX", "sentinel-vox", "generate_sentinel_vox_blockout.py"),
    ("KIRO KONG", "kiro-kong", "generate_kiro_kong_blockout.py"),
]

print("\n" + "="*60)
print("BEAST-KIN ROSTER - GENERATE ALL BLOCKOUTS")
print("="*60)

# Clear existing mesh objects
print("\nClearing scene...")
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Track results
results = []

# Run each script
for char_name, char_dir, script_name in characters:
    script_path = os.path.join(characters_dir, char_dir, "blender_scripts", script_name)
    
    print(f"\n{'='*60}")
    print(f"Generating {char_name} blockout...")
    print(f"Script: {script_path}")
    print(f"{'='*60}")
    
    if os.path.exists(script_path):
        try:
            # Read and execute the script
            with open(script_path, 'r', encoding='utf-8') as f:
                script_code = f.read()
            
            # Execute the script
            exec(compile(script_code, script_path, 'exec'))
            
            print(f"✅ {char_name} blockout generated successfully!")
            results.append((char_name, "✅ SUCCESS"))
            
        except Exception as e:
            print(f"❌ Error generating {char_name}: {str(e)}")
            results.append((char_name, f"❌ ERROR: {str(e)}"))
    else:
        print(f"❌ Script not found: {script_path}")
        results.append((char_name, "❌ NOT FOUND"))

# Print summary
print("\n" + "="*60)
print("GENERATION SUMMARY")
print("="*60)

for char_name, status in results:
    print(f"{char_name:20} - {status}")

print("\n" + "="*60)
print("ALL BLOCKOUTS GENERATED!")
print("="*60)
print("\nNext steps:")
print("1. Review all blockouts in viewport")
print("2. Save Blender file: beast_kin_blockouts.blend")
print("3. Begin sculpting with JAXON")
print("4. Follow: [character]/SCULPTING_GUIDE.md")
print("="*60)
