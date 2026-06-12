import js from '@eslint/js'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      js,
      react: pluginReact,
      'react-hooks': reactHooks,
    },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
