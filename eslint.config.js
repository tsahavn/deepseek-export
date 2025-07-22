import globals from "globals";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint,
      unicorn,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: "readonly",
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
      "unicorn/prefer-includes": "error",
    },
  },
];
