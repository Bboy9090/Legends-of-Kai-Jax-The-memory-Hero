/**
 * Model Validator Tests
 * Automated testing for model validation system
 */

import { ModelValidator, validateCharacterModel } from '../ModelValidator';

describe('ModelValidator', () => {
  let validator: ModelValidator;

  beforeEach(() => {
    validator = new ModelValidator();
  });

  describe('validateModel', () => {
    it('should validate model structure', async () => {
      // Mock model path (would be actual path in real test)
      const result = await validator.validateModel(
        'JAXON',
        '/models/jaxon_lod0.glb'
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('characterId', 'JAXON');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('stats');
    });

    it('should check file size limits', async () => {
      const result = await validator.validateModel(
        'TEST',
        '/models/test.glb'
      );

      if (result.stats.fileSize > 50) {
        expect(result.errors).toContain(
          expect.stringContaining('File size')
        );
        expect(result.success).toBe(false);
      }
    });

    it('should check polycount limits', async () => {
      const result = await validator.validateModel(
        'TEST',
        '/models/test.glb'
      );

      if (result.stats.polycount > 50000) {
        expect(result.warnings).toContain(
          expect.stringContaining('Polycount')
        );
      }
    });
  });

  describe('performanceTest', () => {
    it('should measure FPS performance', async () => {
      const result = await validator.performanceTest(
        'JAXON',
        '/models/jaxon_lod0.glb',
        60
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('averageFPS');
      expect(result).toHaveProperty('minFPS');
    });
  });
});

describe('validateCharacterModel', () => {
  it('should be a convenience function', async () => {
    const result = await validateCharacterModel(
      'KAISON',
      '/models/kaison_lod0.glb'
    );

    expect(result).toHaveProperty('characterId', 'KAISON');
  });
});
