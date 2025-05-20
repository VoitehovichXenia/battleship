import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';


export default defineConfig([
  { files: [ 'src/websocket_server/*.{js,mjs,cjs,ts}' ], plugins: { js }, extends: [ 'js/recommended' ] },
  { files: [ 'src/websocket_server/*.{js,mjs,cjs,ts}' ], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'error',
      semi: [ 'error', 'always' ],
      'object-curly-spacing': [ 'error', 'always' ],
      'array-bracket-spacing': [ 'error', 'always' ],
      quotes: [ 'error', 'single' ]
    }
  }
]);