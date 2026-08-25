module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Narrative UI copy contains deliberate punctuation/quotes. This rule is
    // stylistic and does not affect runtime correctness or accessibility.
    'react/no-unescaped-entities': 'off',
    // @react-three/fiber introduces custom JSX props (args, position, intensity,
    // attach, castShadow, etc.) that are valid Three.js element attributes but
    // are not part of the standard HTML/SVG property set.
    'react/no-unknown-property': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist', 'build', 'node_modules', '*.cjs'],
};
