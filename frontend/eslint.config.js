import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  // Ignore generated and third-party files
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.git/**",
      "**/*.min.js",
    ],
  },

  // Apply recommended JavaScript rules only to src
  {
    ...js.configs.recommended,
    files: ["src/**/*.{js,jsx}"],
  },

  {
    files: ["src/**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react: pluginReact,
    },

    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Recognize React components used inside JSX
      "react/jsx-uses-vars": "error",

      "no-unused-vars": "warn",
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
];