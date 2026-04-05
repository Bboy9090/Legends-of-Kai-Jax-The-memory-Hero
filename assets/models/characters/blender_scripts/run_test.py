"""
Quick Test Runner - Run All Blockout Scripts
Tests all 9 character blockout generators

Usage in Blender:
1. Text Editor → Open this file
2. Alt+P (Run Script)
3. Watch console for results
"""

import bpy
import os

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
characters_dir = os.path.join(script_dir, "..")

# Character list
characters = [
    ("jaxon", "generate_jaxon_blockout.py", "JAXON"),
    ("kaison", "generate_kaison_blockout.py", "KAISON"),
    ("kai-jax", "generate_kai_jax_blockout.py", "KAI-JAX"),
    ("silver", "generate_silver_blockout.py", "SILVER"),
    ("lunara-solis", "generate_lunara_blockout.py", "LUNARA SOLIS"),
    ("boryx-zenith", "generate_boryx_blockout.py", "BORYX ZENITH"),
    ("umbra-flux", "generate_umbra_flux_blockout.py", "UMBRA-FLUX"),
    ("sentinel-vox", "generate_sentinel_vox_blockout.py", "SENTINEL VOX"),
    ("kiro-kong", "generate_kiro_kong_blockout.py", "KIRO KONG"),
]

def test_character(character_name, script_name, display_name):
    """Test a single character blockout script"""
    print(f"\n{'='*60}")
    print(f"Testing: {display_name}")
    print(f"{'='*60}")
    
    script_path = os.path.join(
        characters_dir,
        character_name,
        "blender_scripts",
        script_name
    )
    
    if not os.path.exists(script_path):
        print(f"❌ Script not found: {script_path}")
        return False
    
    try:
        # Clear scene
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        
        # Read and execute script
        with open(script_path, 'r', encoding='utf-8') as f:
            script_content = f.read()
        
        # Execute in clean namespace
        namespace = {
            '__name__': '__main__',
            '__file__': script_path,
            'bpy': bpy,
            'os': os,
        }
        
        exec(script_content, namespace)
        
        # Check results
        objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
        
        if objects:
            main_obj = objects[0]
            dims = main_obj.dimensions
            mats = len(main_obj.data.materials)
            mods = len(main_obj.modifiers)
            
            print(f"✅ Model created: {main_obj.name}")
            print(f"   Dimensions: X={dims.x:.2f}, Y={dims.y:.2f}, Z={dims.z:.2f}")
            print(f"   Materials: {mats}")
            print(f"   Modifiers: {mods}")
            
            # Check for subdivision
            has_subdiv = any(m.type == 'SUBSURF' for m in main_obj.modifiers)
            if has_subdiv:
                print(f"   ✓ Subdivision modifier found")
            else:
                print(f"   ⚠️  No subdivision modifier")
            
            return True
        else:
            print("❌ No mesh objects created")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("BEAST-KIN BLOCKOUT TEST SUITE")
    print("="*60)
    print("\nTesting all 9 character blockout scripts...")
    print("This will create each character in sequence.")
    print("Watch the viewport to see each model appear!\n")
    
    results = {}
    
    for character_name, script_name, display_name in characters:
        success = test_character(character_name, script_name, display_name)
        results[display_name] = success
        
        # Small delay
        import time
        time.sleep(0.3)
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print("\nResults:")
    for display_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status}: {display_name}")
    
    print(f"\nTotal: {passed}/{total} passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("All blockout scripts are working correctly!")
        print("\nYou should see all 9 characters in the viewport.")
        print("Each character was created and then replaced by the next.")
        print("\nTo see a specific character, run its script individually.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("Check console output above for details")
    
    print("="*60)
    print("\n💡 Tip: Run individual character scripts to see them one at a time!")
    print("="*60)

# Run tests
if __name__ == "__main__":
    main()
