#!/usr/bin/env python3
"""
Character data validation script.
Validates that character implementations match kai_jax.character.json specification.
"""

import json
import sys
import re
from pathlib import Path

def load_canonical_spec():
    """Load the canonical character specification."""
    with open('kai_jax.character.json', 'r') as f:
        return json.load(f)

def hex_color_valid(color_str):
    """Validate hex color format."""
    if not color_str:
        return True  # Empty strings are valid for optional colors
    pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
    return bool(re.match(pattern, color_str))

def validate_character_data(character):
    """Validate a single character against requirements."""
    errors = []
    
    # Required fields
    required = ['id', 'name', 'displayName', 'appearance', 'combat', 'rendering']
    for field in required:
        if field not in character:
            errors.append(f"Missing required field: {field}")
    
    if 'appearance' in character:
        # Validate colors
        appearance = character['appearance']
        for color_field in ['primaryColor', 'accentColor', 'secondaryColor', 'webbingColor']:
            if color_field in appearance:
                if not hex_color_valid(appearance[color_field]):
                    errors.append(f"Invalid hex color in {color_field}: {appearance[color_field]}")
        
        # Validate eye colors array
        if 'eyeColors' in appearance:
            for i, color in enumerate(appearance['eyeColors']):
                if not hex_color_valid(color):
                    errors.append(f"Invalid hex color in eyeColors[{i}]: {color}")
    
    if 'combat' in character:
        # Validate stat ranges
        combat = character['combat']
        if 'baseStats' in combat:
            stats = combat['baseStats']
            stat_ranges = {
                'power': (0, 100),
                'speed': (0, 100),
                'defense': (0, 100),
                'gravity': (0, 20)
            }
            for stat, (min_val, max_val) in stat_ranges.items():
                if stat in stats:
                    value = stats[stat]
                    if not (min_val <= value <= max_val):
                        errors.append(f"Stat {stat} value {value} out of range [{min_val}, {max_val}]")
    
    if 'rendering' in character:
        # Validate LOD levels exist
        rendering = character['rendering']
        if 'lodLevels' not in rendering:
            errors.append("Missing rendering.lodLevels")
        else:
            lod_levels = rendering['lodLevels']
            required_lods = ['close', 'mid', 'far', 'veryFar']
            for lod in required_lods:
                if lod not in lod_levels:
                    errors.append(f"Missing LOD level: {lod}")
    
    return errors

def validate_canonical_spec():
    """Validate the canonical specification itself."""
    print("Validating canonical specification (kai_jax.character.json)...")
    
    try:
        spec = load_canonical_spec()
    except FileNotFoundError:
        print("✗ kai_jax.character.json not found")
        return False
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON in kai_jax.character.json: {e}")
        return False
    
    if 'characters' not in spec:
        print("✗ Missing 'characters' array in specification")
        return False
    
    all_valid = True
    for character in spec['characters']:
        char_id = character.get('id', 'unknown')
        errors = validate_character_data(character)
        
        if errors:
            all_valid = False
            print(f"✗ Character '{char_id}' has validation errors:")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"✓ Character '{char_id}' is valid")
    
    return all_valid

def compare_with_implementation():
    """Compare canonical spec with actual implementation files."""
    print("\nComparing canonical spec with implementation files...")
    
    spec = load_canonical_spec()
    canonical_chars = {c['id']: c for c in spec['characters']}
    
    issues = []
    
    # Check characters.ts
    characters_ts_path = Path('apps/web/src/lib/characters.ts')
    if characters_ts_path.exists():
        with open(characters_ts_path, 'r') as f:
            content = f.read()
            
        # Extract character IDs from FIGHTERS array (simple pattern matching)
        # This is a basic check - full validation would require parsing TypeScript
        for char_id in canonical_chars.keys():
            if f'"{char_id}"' not in content and f"'{char_id}'" not in content:
                issues.append(f"Character '{char_id}' not found in characters.ts")
    
    # Check characterDesigns.ts
    designs_ts_path = Path('apps/web/src/data/characterDesigns.ts')
    if designs_ts_path.exists():
        with open(designs_ts_path, 'r') as f:
            content = f.read()
            
        for char_id in canonical_chars.keys():
            if f'"{char_id}"' not in content and f"'{char_id}'" not in content:
                issues.append(f"Character '{char_id}' not found in characterDesigns.ts")
    
    if issues:
        print("⚠ Implementation issues found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✓ Implementation files appear consistent with canonical spec")
        return True

def validate_design_consistency():
    """Validate that character colors match across all specs."""
    print("\nValidating design consistency across specs...")
    
    spec = load_canonical_spec()
    
    # Load character_art_spec.json
    art_spec_path = Path('specs/primary/character_art_spec.json')
    if not art_spec_path.exists():
        print("⚠ character_art_spec.json not found, skipping cross-validation")
        return True
    
    with open(art_spec_path, 'r') as f:
        art_spec = json.load(f)
    
    art_chars = {c['id']: c for c in art_spec.get('characters', [])}
    
    issues = []
    for char_id, canonical in spec['characters'].items() if isinstance(spec['characters'], dict) else [(c['id'], c) for c in spec['characters']]:
        if char_id in art_chars:
            art_char = art_chars[char_id]
            
            # Compare colors
            for color_field in ['primaryColor', 'accentColor', 'secondaryColor']:
                canonical_color = canonical['appearance'].get(color_field, '').lower()
                art_color = art_char.get(color_field, '').lower()
                
                if canonical_color and art_color and canonical_color != art_color:
                    issues.append(f"Character '{char_id}' {color_field} mismatch: canonical={canonical_color}, art_spec={art_color}")
    
    if issues:
        print("⚠ Color consistency issues found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✓ Character colors are consistent across specs")
        return True

def main():
    """Run all character validation tests."""
    print("=" * 60)
    print("CHARACTER DATA VALIDATION")
    print("=" * 60)
    print()
    
    results = []
    
    # Validate canonical spec
    results.append(validate_canonical_spec())
    
    # Compare with implementation
    results.append(compare_with_implementation())
    
    # Validate design consistency
    results.append(validate_design_consistency())
    
    print()
    print("=" * 60)
    if all(results):
        print(f"All validation checks passed! ✓")
        print("=" * 60)
        return 0
    else:
        failed = len([r for r in results if not r])
        print(f"{failed} validation check(s) failed! ✗")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
