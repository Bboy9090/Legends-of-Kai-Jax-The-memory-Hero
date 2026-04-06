# Schemas Directory

This directory contains JSON schemas that enforce canonical rules for the Legends of Kai-Jax franchise.

## Files

### `character.schema.json`
JSON Schema (draft-07) for validating character definition files.

**Enforces:**
- Required fields (character_id, display_name, anatomy, evolution)
- Evolution system constraints (IMMUTABLE):
  - `starting_tail_count`: Must be exactly 3
  - `final_tail_count`: Must be exactly 9
  - `unlock_rule`: Must be "sequential_only"
  - `skip_unlocks_disallowed`: Must be true
  - `tails_are_permanent`: Must be true
- Tail count consistency across anatomy and rigging

## Usage

### Command Line (ajv-cli)
```bash
# Validate a character file
ajv validate -s schemas/character.schema.json -d kai_jax.character.json
```

### In Code (Node.js)
```javascript
import Ajv from 'ajv';
import { readFileSync } from 'fs';

const ajv = new Ajv();
const schema = JSON.parse(readFileSync('schemas/character.schema.json', 'utf-8'));
const character = JSON.parse(readFileSync('kai_jax.character.json', 'utf-8'));

const validate = ajv.compile(schema);
const valid = validate(character);

if (!valid) {
  console.error('Validation errors:', validate.errors);
}
```

### Build Integration
```bash
# Run validation as part of build process
npm run validate:canon
```

## Schema Philosophy

These schemas are **governance mechanisms**, not documentation:

1. **IMMUTABLE values use `const`** - Cannot be changed without schema update
2. **Restricted values use `enum`** - Only specific values allowed
3. **Build failures on violations** - No runtime surprises
4. **Lockfile enforcement** - Data-driven architecture, not hardcoded values

## Validation Workflow

```
Character JSON → Schema Validation → Build Success/Failure
     ↓                    ↓
     └──────> If invalid: Build fails with clear error message
```

## Adding New Schemas

When adding new schemas:
1. Use JSON Schema draft-07 or later
2. Include clear descriptions for all fields
3. Use `const` for immutable values
4. Use `enum` for restricted choices
5. Document enforcement rules in comments
6. Add validation to `validate-canon.mjs`
7. Update this README

## References

- [JSON Schema Specification](https://json-schema.org/)
- [README_CANON.md](../README_CANON.md) - Franchise governance document
- [validate-canon.mjs](../validate-canon.mjs) - Validation script
