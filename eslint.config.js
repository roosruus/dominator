const js = require('@eslint/js');
const stylistic = require('@stylistic/eslint-plugin');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: ['build/']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      sourceType: 'module',
      globals: globals.browser
    },
    settings: {
      react: {
        version: '19.3'
      }
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      // Props are documented by default values; React 19 no longer checks propTypes.
      'react/prop-types': 'off'
    }
  },
  {
    files: ['src/**/*.js'],
    ...reactHooks.configs.flat.recommended
  },
  {
    files: ['*.js', 'scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  },
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/max-len': ['error', 120],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      'no-console': 'off'
    }
  }
];
