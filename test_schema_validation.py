#!/usr/bin/env python3
"""
Test script to validate that the unlock_requirement schema fix works correctly.
Tests that configurations with missing type or value fields are rejected.
"""

import json
import sys

try:
    import jsonschema
except ImportError:
    print("Installing jsonschema...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "jsonschema", "-q"])
    import jsonschema

def load_schema():
    """Load the story_mode schema."""
    with open('schemas/story_mode.schema.json', 'r') as f:
        return json.load(f)

def test_valid_config():
    """Test that a valid configuration passes validation."""
    schema = load_schema()
    
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
        jsonschema.validate(instance=valid_config, schema=schema)
        print("✓ Valid configuration passed validation")
        return True
    except jsonschema.ValidationError as e:
        print(f"✗ Valid configuration failed validation: {e.message}")
        return False

def test_missing_type():
    """Test that a configuration with missing 'type' in unlock_requirement fails validation."""
    schema = load_schema()
    
    invalid_config = {
        "version": "1.0.0",
        "game_world": {
            "name": "Test World",
            "setting": "A test setting"
        },
        "districts": [
            {
                "id": "test_district",
                "name": "Test District",
                "unlock_requirement": {
                    "value": 3  # Missing 'type'
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
        jsonschema.validate(instance=invalid_config, schema=schema)
        print("✗ Configuration with missing 'type' should have failed but passed")
        return False
    except jsonschema.ValidationError as e:
        print("✓ Configuration with missing 'type' correctly rejected")
        return True

def test_missing_value():
    """Test that a configuration with missing 'value' in unlock_requirement fails validation."""
    schema = load_schema()
    
    invalid_config = {
        "version": "1.0.0",
        "game_world": {
            "name": "Test World",
            "setting": "A test setting"
        },
        "districts": [
            {
                "id": "test_district",
                "name": "Test District",
                "unlock_requirement": {
                    "type": "tail_count"  # Missing 'value'
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
        jsonschema.validate(instance=invalid_config, schema=schema)
        print("✗ Configuration with missing 'value' should have failed but passed")
        return False
    except jsonschema.ValidationError as e:
        print("✓ Configuration with missing 'value' correctly rejected")
        return True

def test_additional_properties():
    """Test that unlock_requirement rejects additional properties."""
    schema = load_schema()
    
    invalid_config = {
        "version": "1.0.0",
        "game_world": {
            "name": "Test World",
            "setting": "A test setting"
        },
        "districts": [
            {
                "id": "test_district",
                "name": "Test District",
                "unlock_requirement": {
                    "type": "tail_count",
                    "value": 3,
                    "extra_field": "should not be allowed"  # Additional property
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
        jsonschema.validate(instance=invalid_config, schema=schema)
        print("✗ Configuration with additional properties should have failed but passed")
        return False
    except jsonschema.ValidationError as e:
        print("✓ Configuration with additional properties correctly rejected")
        return True

def main():
    """Run all tests."""
    print("Testing unlock_requirement schema validation...")
    print()
    
    results = []
    results.append(test_valid_config())
    results.append(test_missing_type())
    results.append(test_missing_value())
    results.append(test_additional_properties())
    
    print()
    if all(results):
        print(f"All {len(results)} tests passed! ✓")
        return 0
    else:
        failed = len([r for r in results if not r])
        print(f"{failed} test(s) failed! ✗")
        return 1

if __name__ == "__main__":
    sys.exit(main())
