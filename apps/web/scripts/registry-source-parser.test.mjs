import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRegistrySource } from './registry-source-parser.mjs';

const registry = (body, declarations = '') => `${declarations}\nexport const MODEL_REGISTRY: Record<string, Config> = { ${body} };`;

test('reads literal properties, comments, nested config and quoted keys without swallowing entries', () => {
  const result = parseRegistrySource(registry(`
    // path: '/wrong.glb', fake: { path: '/wrong.glb' }
    'kai-jax': { path: '/models/hero.glb', animationPaths: { run: '/other.glb' }, rotation: [0, Math.PI, 0] },
    jax: { /* ignored } */ path: "/models/jax.glb" },
  `));
  assert.deepEqual({ ...result }, { 'kai-jax': '/models/hero.glb', jax: '/models/jax.glb' });
});

test('resolves constant aliases and uses source/dev branch of PROD ternaries', () => {
  const result = parseRegistrySource(registry('kai_jax: { path: ALIAS }, jax: { path: SOURCE },', `
    const SOURCE = '/models/source.glb';
    const MODEL = import.meta.env.PROD ? '/models/optimized.glb' : SOURCE;
    const ALIAS = MODEL;
  `));
  assert.equal(result.kai_jax, '/models/source.glb');
  assert.equal(result.jax, '/models/source.glb');
});

test('supports inline and parenthesized PROD ternaries', () => {
  const result = parseRegistrySource(registry(`hero: {
    path: (import.meta.env.PROD ? PROD : (DEV)),
  }`, `const PROD = '/models/prod.glb'; const DEV = '/models/dev.glb';`));
  assert.equal(result.hero, '/models/dev.glb');
});

for (const [name, source, message] of [
  ['unknown constant', registry('hero: { path: MISSING }'), /Unresolved/],
  ['unresolved unused production branch', registry("hero: { path: import.meta.env.PROD ? MISSING : '/dev.glb' }"), /Unresolved/],
  ['circular alias', registry('hero: { path: A }', 'const A = B; const B = A;'), /Circular/],
  ['call expression', registry('hero: { path: getPath() }'), /Unresolved|Unsupported/],
  ['unknown condition', registry("hero: { path: process.env.PROD ? '/prod.glb' : '/dev.glb' }"), /Unresolved|Unsupported/],
  ['concatenation', registry("hero: { path: '/models/' + 'hero.glb' }"), /Unsupported/],
  ['template interpolation', registry('hero: { path: `/models/${NAME}.glb` }'), /Unsupported/],
  ['relative path', registry("hero: { path: 'models/hero.glb' }"), /absolute public path/],
  ['missing path', registry('hero: { scale: 2 }'), /exactly one path/],
  ['duplicate path', registry("hero: { path: '/a.glb', path: '/b.glb' }"), /exactly one path/],
  ['duplicate fighter', registry("hero: { path: '/a.glb' }, hero: { path: '/b.glb' }"), /Duplicate registry entry/],
  ['spread entry', registry("...OTHER, hero: { path: '/a.glb' }"), /Unsupported registry property/],
  ['empty registry', registry(''), /Empty/],
  ['missing registry', "const OTHER = '/a.glb';", /not found/],
]) {
  test(`fails closed for ${name}`, () => assert.throws(() => parseRegistrySource(source), message));
}

test('current registry includes every entry and resolves distinct hero SOURCE assets', () => {
  const source = readFileSync(new URL('../src/assets/modelRegistry.ts', import.meta.url), 'utf8');
  const result = parseRegistrySource(source);
  assert.equal(Object.keys(result).length, 51);
  assert.equal(result['kai-jax'], '/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb');
  assert.equal(result.kai_jax, result['kai-jax']);
  assert.equal(result.kaijax, result['kai-jax']);
  assert.equal(result.jax, '/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb');
  assert.equal(result.jaxon, result.jax);
  assert.equal(result.kai, '/models/Meshy_AI_Character_outputSPiDERKAIJAX9TIALS.glb');
  assert.ok(Object.values(result).every((path) => path.startsWith('/models/')));
});
