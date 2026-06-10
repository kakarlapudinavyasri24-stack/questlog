const js = require("@eslint/js");
const globals = require("globals");
const react = require("eslint-plugin-react");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "dist/**",
      "**/dist/**",
      "coverage/**",
      ".git/**",
      ".specify/**",
      ".gemini/**",
      "frontend/src/assets/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024
      }
    },
    plugins: {
      react
    },
    rules: {
      "no-console": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: ["**/*.test.{js,cjs,mjs}"],
    languageOptions: {
      globals: {
        describe: "readonly",
        expect: "readonly",
        it: "readonly"
      }
    }
  }
];
