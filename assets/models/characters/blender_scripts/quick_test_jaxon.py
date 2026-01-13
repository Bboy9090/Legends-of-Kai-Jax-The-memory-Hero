"""
Quick Test - JAXON Only
Fastest way to test one character

Usage:
1. Open Blender
2. Text Editor → Open this file
3. Alt+P (Run Script)
4. See Jaxon appear!
"""

import bpy
import os

# Get script path
script_dir = os.path.dirname(os.path.abspath(__file__))
jaxon_script = os.path.join(script_dir, "..", "jaxon", "blender_scripts", "generate_jaxon_blockout.py")

print("\n" + "="*50)
print("QUICK TEST - JAXON")
print("="*50)
print("\nRunning Jaxon blockout script...\n")

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Read and execute script
try:
    with open(jaxon_script, 'r', encoding='utf-8') as f:
        script_content = f.read()
    
    exec(script_content, {"__name__": "__main__", "bpy": bpy, "os": os})
    
    # Check result
    objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    if objects:
        obj = objects[0]
        print("\n" + "="*50)
        print("✅ JAXON TEST SUCCESSFUL!")
        print("="*50)
        print(f"\nModel: {obj.name}")
        print(f"Dimensions: {obj.dimensions}")
        print(f"Materials: {len(obj.data.materials)}")
        print(f"Modifiers: {len(obj.modifiers)}")
        print("\nYou should see:")
        print("  ✓ Electric Blue body")
        print("  ✓ 7 blue quills on back")
        print("  ✓ 2 bright green eyes")
        print("\nPress Home to frame the model!")
        print("Rotate view (Middle Mouse) to check from all angles")
        print("="*50)
    else:
        print("\n❌ No model created - check console for errors")
        
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
