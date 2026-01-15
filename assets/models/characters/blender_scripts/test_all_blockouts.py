"""
Test All Blockout Scripts
Runs all character blockout generators and verifies results

Usage:
1. Open Blender 4.0+
2. Text Editor → New
3. Paste this script
4. Run Script (Alt+P)
5. Check console for results
"""

import bpy
import os
import sys

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
characters_dir = os.path.join(script_dir, "..")

# Character list
characters = [
    ("jaxon", "generate_jaxon_blockout.py"),
    ("kaison", "generate_kaison_blockout.py"),
    ("kai-jax", "generate_kai_jax_blockout.py"),
    ("silver", "generate_silver_blockout.py"),
    ("lunara-solis", "generate_lunara_blockout.py"),
    ("boryx-zenith", "generate_boryx_blockout.py"),
    ("umbra-flux", "generate_umbra_flux_blockout.py"),
    ("sentinel-vox", "generate_sentinel_vox_blockout.py"),
    ("kiro-kong", "generate_kiro_kong_blockout.py"),
]

def test_script(character_name, script_name):
    """Test a single blockout script"""
    print(f"\n{'='*50}")
    print(f"Testing: {character_name.upper()}")
    print(f"{'='*50}")
    
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
        with open(script_path, 'r') as f:
            script_content = f.read()
        
        # Execute script
        exec(script_content, {"__name__": "__main__"})
        
        # Check results
        objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
        
        if objects:
            main_obj = objects[0]
            print(f"✅ Model created: {main_obj.name}")
            print(f"   Dimensions: {main_obj.dimensions}")
            print(f"   Materials: {len(main_obj.data.materials)}")
            print(f"   Modifiers: {len(main_obj.modifiers)}")
            return True
        else:
            print("❌ No mesh objects created")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def run_all_tests():
    """Run tests for all characters"""
    print("\n" + "="*50)
    print("BEAST-KIN BLOCKOUT TEST SUITE")
    print("="*50)
    print("\nTesting all 9 character blockout scripts...")
    
    results = {}
    
    for character_name, script_name in characters:
        success = test_script(character_name, script_name)
        results[character_name] = success
        
        # Small delay between tests
        import time
        time.sleep(0.5)
    
    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for character_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {character_name.upper()}")
    
    print(f"\nTotal: {passed}/{total} passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("All blockout scripts are working correctly!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("Check console output above for details")
    
    print("="*50)

# Run tests
if __name__ == "__main__":
    run_all_tests()
