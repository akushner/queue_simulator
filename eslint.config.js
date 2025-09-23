import globals from "globals";
import tseslintPlugin from "@typescript-eslint/eslint-plugin"; // Import the plugin
import tseslintParser from "@typescript-eslint/parser"; // Import the parser
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["dist", ".eslintrc.cjs"],
    languageOptions: {
      parser: tseslintParser, // Use the imported parser module
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./tsconfig.node.json"],
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin, // Use the imported plugin
      react: pluginReact,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules, // Use the plugin's recommended rules
      ...pluginReact.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "off", // Disable for react-three-fiber properties
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    // No specific parser for JS files, ESLint's default parser will be used
  },
];