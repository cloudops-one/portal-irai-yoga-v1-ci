import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect", // Automatically detects the React version
      },
    },
  },
  {
    rules: {
      indent: "off",
      "react/jsx-indent": ["warn", 2], // Enforce 2-space indentation in JSX
      "react/jsx-indent-props": ["warn", 2], // Warn on misaligned props in JSX
      "no-mixed-spaces-and-tabs": "warn", // Warn on mixed spaces and tabs
      "key-spacing": ["warn", { beforeColon: false, afterColon: true }], // Enforce consistent spacing around colons in objects
      "object-curly-spacing": ["warn", "always"], // Enforce spacing inside curly braces
      "comma-spacing": ["warn", { before: false, after: true }], // Enforce space after commas
      "space-in-parens": ["warn", "never"], // No space inside parentheses
      semi: ["warn", "always"], // Warn if missing semicolons
      quotes: ["warn", "double"], // Enforce double quotes
      "arrow-spacing": ["warn", { before: true, after: true }], // Consistent arrow function spacing
      "linebreak-style": ["off"], // Consistent linebreak style
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
]);
