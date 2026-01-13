"""
Script Verification Tool
Checks all blockout scripts exist and are valid Python

Usage:
1. Run from command line: python verify_scripts.py
2. Or run in Blender: Text Editor → Run Script
"""

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

def verify_script(character_name, script_name):
    """Verify a script exists and is valid Python"""
    script_path = os.path.join(
        characters_dir,
        character_name,
        "blender_scripts",
        script_name
    )
    
    result = {
        "character": character_name.upper(),
        "script": script_name,
        "exists": False,
        "valid": False,
        "error": None
    }
    
    # Check if file exists
    if not os.path.exists(script_path):
        result["error"] = f"File not found: {script_path}"
        return result
    
    result["exists"] = True
    
    # Try to compile Python syntax
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            code = f.read()
        compile(code, script_path, 'exec')
        result["valid"] = True
    except SyntaxError as e:
        result["error"] = f"Syntax error: {str(e)}"
    except Exception as e:
        result["error"] = f"Error: {str(e)}"
    
    return result

def main():
    """Run verification for all scripts"""
    print("\n" + "="*60)
    print("BEAST-KIN SCRIPT VERIFICATION")
    print("="*60)
    print("\nChecking all blockout scripts...\n")
    
    results = []
    for character_name, script_name in characters:
        result = verify_script(character_name, script_name)
        results.append(result)
        
        if result["exists"] and result["valid"]:
            print(f"✅ {result['character']:15} - {script_name:30} - VALID")
        elif result["exists"]:
            print(f"❌ {result['character']:15} - {script_name:30} - ERROR: {result['error']}")
        else:
            print(f"❌ {result['character']:15} - {script_name:30} - NOT FOUND")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in results if r["exists"] and r["valid"])
    total = len(results)
    
    print(f"\nTotal Scripts: {total}")
    print(f"Valid Scripts: {passed}")
    print(f"Invalid/Missing: {total - passed}")
    
    if passed == total:
        print("\n🎉 ALL SCRIPTS VERIFIED!")
        print("All scripts exist and have valid Python syntax.")
        print("\nReady to test in Blender!")
    else:
        print(f"\n⚠️  {total - passed} script(s) need attention")
        print("Check errors above for details")
    
    print("="*60)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
