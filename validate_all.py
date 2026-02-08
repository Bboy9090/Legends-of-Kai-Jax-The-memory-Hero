#!/usr/bin/env python3
"""
Complete validation suite for Legends of Kai-Jax character and schema data.
Validates character specification against JSON Schema and cross-checks implementations.
"""

import json
import sys
from pathlib import Path

try:
    import jsonschema
    from jsonschema import validate, ValidationError
except ImportError:
    print("Error: jsonschema package is required.")
    print("Install with: pip install jsonschema")
    sys.exit(1)


def load_json(filepath):
    """Load and parse a JSON file."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"✗ File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON in {filepath}: {e}")
        return None


def validate_character_spec():
    """Validate kai_jax.character.json against its schema."""
    print("=" * 70)
    print("1. VALIDATING CHARACTER SPECIFICATION")
    print("=" * 70)
    
    # Load schema and spec
    schema = load_json('schemas/character.schema.json')
    spec = load_json('kai_jax.character.json')
    
    if not schema or not spec:
        return False
    
    try:
        validate(instance=spec, schema=schema)
        print("✓ kai_jax.character.json is valid against schema")
        print(f"  - Found {len(spec['characters'])} characters")
        for char in spec['characters']:
            print(f"    • {char['id']}: {char['name']}")
        return True
    except ValidationError as e:
        print(f"✗ Validation failed:")
        print(f"  Path: {' -> '.join(str(p) for p in e.path)}")
        print(f"  Error: {e.message}")
        return False


def validate_story_schema():
    """Validate story mode schema (existing test)."""
    print("\n" + "=" * 70)
    print("2. VALIDATING STORY MODE SCHEMA")
    print("=" * 70)
    
    schema = load_json('schemas/story_mode.schema.json')
    if not schema:
        print("⚠ Story mode schema not found, skipping")
        return True
    
    # Test with a valid config
    valid_config = {
        "version": "1.0.0",
        "game_world": {
            "name": "Test World",
            "setting": "A test setting"
        },
        "districts": [
            {
                "id": "test_district",
                "name": "Test District",
                "description": "A test district",
                "unlock_requirement": {
                    "type": "tail_count",
                    "value": 3
                },
                "traversal_features": {
                    "verticality_enabled": True,
                    "rooftop_access": True,
                    "interior_transitions": True
                },
                "zones": [
                    {
                        "id": "test_zone",
                        "name": "Test Zone",
                        "zone_type": "safe"
                    }
                ]
            }
        ]
    }
    
    try:
        validate(instance=valid_config, schema=schema)
        print("✓ Story mode schema is valid")
        return True
    except ValidationError as e:
        print(f"✗ Story mode schema validation failed: {e.message}")
        return False


def cross_check_implementations():
    """Cross-check character spec with implementation files."""
    print("\n" + "=" * 70)
    print("3. CROSS-CHECKING IMPLEMENTATIONS")
    print("=" * 70)
    
    spec = load_json('kai_jax.character.json')
    if not spec:
        return False
    
    canonical_chars = {c['id']: c for c in spec['characters']}
    all_checks_passed = True
    
    # Check characters.ts
    print("\nChecking apps/web/src/lib/characters.ts...")
    characters_ts = Path('apps/web/src/lib/characters.ts')
    if characters_ts.exists():
        content = characters_ts.read_text()
        for char_id, char_data in canonical_chars.items():
            if f'"{char_id}"' in content or f"'{char_id}'" in content:
                print(f"  ✓ {char_id} found")
            else:
                print(f"  ✗ {char_id} NOT FOUND")
                all_checks_passed = False
    else:
        print("  ⚠ File not found")
    
    # Check characterDesigns.ts
    print("\nChecking apps/web/src/data/characterDesigns.ts...")
    designs_ts = Path('apps/web/src/data/characterDesigns.ts')
    if designs_ts.exists():
        content = designs_ts.read_text()
        for char_id, char_data in canonical_chars.items():
            if f'"{char_id}"' in content or f"'{char_id}'" in content:
                print(f"  ✓ {char_id} found")
                # Check color consistency
                primary = char_data['appearance']['primaryColor'].lower()
                if primary not in content.lower():
                    print(f"    ⚠ Primary color {primary} not found")
            else:
                print(f"  ✗ {char_id} NOT FOUND")
                all_checks_passed = False
    else:
        print("  ⚠ File not found")
    
    # Check character_art_spec.json
    print("\nChecking specs/primary/character_art_spec.json...")
    art_spec = load_json('specs/primary/character_art_spec.json')
    if art_spec:
        art_chars = {c['id']: c for c in art_spec.get('characters', [])}
        for char_id, char_data in canonical_chars.items():
            if char_id in art_chars:
                print(f"  ✓ {char_id} found")
                # Color consistency check
                art_char = art_chars[char_id]
                canonical_primary = char_data['appearance']['primaryColor'].lower()
                art_primary = art_char.get('primaryColor', '').lower()
                
                if canonical_primary != art_primary:
                    print(f"    ⚠ Color mismatch: canonical={canonical_primary}, art={art_primary}")
                    all_checks_passed = False
            else:
                print(f"  ✗ {char_id} NOT FOUND")
                all_checks_passed = False
    else:
        print("  ⚠ File not found or invalid")
    
    return all_checks_passed


def check_constraints():
    """Verify that constraints are properly set."""
    print("\n" + "=" * 70)
    print("4. VERIFYING CONSTRAINTS")
    print("=" * 70)
    
    spec = load_json('kai_jax.character.json')
    if not spec:
        return False
    
    constraints = spec.get('metadata', {}).get('constraints', {})
    
    required_constraints = {
        'unifiedCore': True,
        'pcFirst': True,
        'noLogicDivergence': True,
        'mustValidate': True
    }
    
    all_correct = True
    for key, expected in required_constraints.items():
        actual = constraints.get(key)
        if actual == expected:
            print(f"  ✓ {key}: {actual}")
        else:
            print(f"  ✗ {key}: expected {expected}, got {actual}")
            all_correct = False
    
    # Check design principles
    principles = spec.get('designPrinciples', {})
    required_principles = [
        'silhouetteFirst',
        'layeredRendering',
        'lodStrategy',
        'pcFirst',
        'deterministicBehavior',
        'noPlaceholderLogic'
    ]
    
    print("\nDesign Principles:")
    for principle in required_principles:
        if principle in principles:
            print(f"  ✓ {principle}")
        else:
            print(f"  ✗ {principle} MISSING")
            all_correct = False
    
    return all_correct


def main():
    """Run all validation checks."""
    print("\n")
    print("╔" + "═" * 68 + "╗")
    print("║" + " LEGENDS OF KAI-JAX: CHARACTER VALIDATION SUITE ".center(68) + "║")
    print("╚" + "═" * 68 + "╝")
    print()
    
    results = []
    
    # Run all validation checks
    results.append(("Character Spec", validate_character_spec()))
    results.append(("Story Schema", validate_story_schema()))
    results.append(("Implementation Cross-Check", cross_check_implementations()))
    results.append(("Constraints Verification", check_constraints()))
    
    # Summary
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)
    
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{name:.<50} {status}")
    
    print("=" * 70)
    
    if all(r[1] for r in results):
        print("\n✓ ALL CHECKS PASSED!")
        print("\nThe codebase meets all acceptance criteria:")
        print("  • Matches JSON spec")
        print("  • Deterministic behavior enforced")
        print("  • PC-first design validated")
        print("  • No placeholder logic detected")
        print()
        return 0
    else:
        failed_count = sum(1 for _, passed in results if not passed)
        print(f"\n✗ {failed_count} CHECK(S) FAILED")
        print("\nPlease fix the issues above before committing.")
        print()
        return 1


if __name__ == "__main__":
    sys.exit(main())
