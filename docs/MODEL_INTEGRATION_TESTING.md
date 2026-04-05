# Model Integration Testing Guide
## Automated Quality Assurance for 3D Character Models

This guide explains how to use the automated testing system to validate character models before integration.

---

## 🧪 Testing System Overview

The `ModelValidator` class provides automated testing for:
- **Geometry Validation** (polycount, topology, UVs)
- **Material Validation** (PBR workflow, textures)
- **Animation Validation** (required animations, bone structure)
- **Performance Testing** (FPS measurement)
- **File Size Validation** (compression checks)

---

## 🚀 Quick Start

### Basic Validation

```typescript
import { validateCharacterModel } from '@legends-of-kai-jax/game/utils/ModelValidator';

// Validate a character model
const result = await validateCharacterModel(
  'JAXON',
  '/assets/models/characters/jaxon/JAXON_LOD0.glb'
);

if (result.success) {
  console.log('✅ Model validated successfully!');
  console.log('Stats:', result.stats);
} else {
  console.error('❌ Validation failed:');
  result.errors.forEach(error => console.error(`  - ${error}`));
}

result.warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
```

---

## 📊 Validation Results

### Result Structure

```typescript
interface ModelValidationResult {
  success: boolean;           // Overall validation status
  characterId: string;        // Character identifier
  errors: string[];           // Critical issues (block integration)
  warnings: string[];         // Non-critical issues (should fix)
  stats: {
    polycount: number;        // Total triangle count
    textureCount: number;     // Number of materials
    animationCount: number;   // Number of animations
    boneCount: number;        // Number of bones in armature
    fileSize: number;         // File size in MB
  };
}
```

---

## ✅ Validation Checks

### Geometry Checks
- ✅ Polycount within limits (LOD0: 30k-50k)
- ✅ No n-gons (quads or tris only)
- ✅ UV coordinates present
- ✅ Normals present (or auto-generated)

### Material Checks
- ✅ PBR materials (Metallic/Roughness)
- ✅ Texture maps present
- ✅ Emissive materials for effects

### Animation Checks
- ✅ Required animations present:
  - Idle
  - Walk
  - Run
  - Jump
- ✅ Animations loop correctly
- ✅ Bone structure valid

### Performance Checks
- ✅ File size < 50MB
- ✅ Average FPS ≥ 60
- ✅ Minimum FPS ≥ 45

---

## 🎯 Usage Examples

### Example 1: Validate Before Integration

```typescript
// In your integration workflow
async function integrateCharacter(characterId: string, modelPath: string) {
  // Validate first
  const validation = await validateCharacterModel(characterId, modelPath);
  
  if (!validation.success) {
    throw new Error(`Model validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Check warnings
  if (validation.warnings.length > 0) {
    console.warn('Model has warnings:', validation.warnings);
  }
  
  // Proceed with integration
  const model = await loadCharacterModel({ id: characterId });
  return model;
}
```

### Example 2: Performance Testing

```typescript
import { ModelValidator } from '@legends-of-kai-jax/game/utils/ModelValidator';

const validator = new ModelValidator();

const perfResult = await validator.performanceTest(
  'JAXON',
  '/models/jaxon_lod0.glb',
  60 // Target FPS
);

if (perfResult.success) {
  console.log(`✅ Performance OK: ${perfResult.averageFPS.toFixed(1)} FPS avg`);
} else {
  console.warn(`⚠️  Performance below target: ${perfResult.averageFPS.toFixed(1)} FPS`);
  console.warn(`   Minimum FPS: ${perfResult.minFPS.toFixed(1)}`);
}
```

### Example 3: Batch Validation

```typescript
// Validate all characters
const characters = ['JAXON', 'KAISON', 'KAIJAX', 'SILVER', 'LUNARA'];

for (const charId of characters) {
  const modelPath = `/assets/models/characters/${charId.toLowerCase()}/${charId}_LOD0.glb`;
  
  console.log(`Validating ${charId}...`);
  const result = await validateCharacterModel(charId, modelPath);
  
  if (result.success) {
    console.log(`✅ ${charId}: PASSED`);
  } else {
    console.error(`❌ ${charId}: FAILED`);
    result.errors.forEach(err => console.error(`   ${err}`));
  }
}
```

---

## 🔧 Custom Configuration

### Custom Validation Rules

```typescript
import { ModelValidator } from '@legends-of-kai-jax/game/utils/ModelValidator';

const validator = new ModelValidator({
  maxPolycount: 60000,        // Higher limit for complex characters
  maxFileSize: 75,            // Larger file size allowed
  requiredAnimations: [        // Custom animation requirements
    'Idle',
    'Walk',
    'Run',
    'Jump',
    'Special_Move',
  ],
  maxBoneCount: 200,          // Higher bone count for multi-tail characters
});
```

---

## 📋 Pre-Integration Checklist

Before integrating a model, ensure:

- [ ] Model passes validation (`success: true`)
- [ ] No critical errors
- [ ] Warnings addressed (if possible)
- [ ] Performance test passes (≥60 FPS)
- [ ] File size acceptable (<50MB)
- [ ] All required animations present
- [ ] Materials display correctly
- [ ] Rigging works properly

---

## 🐛 Common Issues & Solutions

### Issue: "File size exceeds maximum"
**Solution:** 
- Enable Draco compression
- Optimize textures (reduce resolution)
- Create LOD versions

### Issue: "Polycount exceeds recommended"
**Solution:**
- Use LOD1 or LOD2 for distant rendering
- Optimize geometry
- Remove unnecessary detail

### Issue: "Required animation not found"
**Solution:**
- Check animation naming (case-insensitive)
- Ensure animations are exported
- Verify animation names match requirements

### Issue: "Performance below target"
**Solution:**
- Reduce polycount
- Optimize materials
- Use LOD system
- Reduce particle effects

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate Models

on:
  pull_request:
    paths:
      - 'assets/models/characters/**/*.glb'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:models
```

### Test Script

```json
{
  "scripts": {
    "test:models": "node scripts/validate-all-models.js"
  }
}
```

---

## 📊 Reporting

### Generate Validation Report

```typescript
function generateReport(results: ModelValidationResult[]): string {
  let report = '# Model Validation Report\n\n';
  
  for (const result of results) {
    report += `## ${result.characterId}\n\n`;
    report += `**Status:** ${result.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    report += `**Stats:**\n`;
    report += `- Polycount: ${result.stats.polycount}\n`;
    report += `- File Size: ${result.stats.fileSize.toFixed(2)}MB\n`;
    report += `- Animations: ${result.stats.animationCount}\n`;
    report += `- Bones: ${result.stats.boneCount}\n\n`;
    
    if (result.errors.length > 0) {
      report += `**Errors:**\n`;
      result.errors.forEach(err => report += `- ${err}\n`);
      report += `\n`;
    }
    
    if (result.warnings.length > 0) {
      report += `**Warnings:**\n`;
      result.warnings.forEach(warn => report += `- ${warn}\n`);
      report += `\n`;
    }
  }
  
  return report;
}
```

---

## 🎯 Best Practices

1. **Validate Early:** Test models as soon as they're exported
2. **Fix Errors First:** Address critical errors before warnings
3. **Performance Test:** Always test performance before integration
4. **Document Issues:** Keep track of validation results
5. **Automate:** Use CI/CD to validate on every change

---

## 📚 Related Documentation

- [3D Model Creation Workflow](./3D_MODEL_CREATION_WORKFLOW.md)
- [Character Model Tracking](./CHARACTER_MODEL_TRACKING.md)
- [Blender Export Scripts](../assets/models/characters/blender_scripts/README.md)

---

**Status:** Production Ready  
**Maintained By:** QA Team  
**Questions?** Check validation results or review model specs

---

*"Validate early. Integrate confidently. Ship legendary."* ✅🎨
