import servicenowPlugin from "eslint-plugin-servicenow";
import recommendedConfig from "eslint-plugin-servicenow/configs/recommended";
import eslintRecommended from "eslint/conf/eslint-recommended";

export default [
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        // Add other global variables here
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
    plugins: {
      servicenow: servicenowPlugin,
    },
    rules: {
      // Add any custom rules or overrides here
    },
  },
  eslintRecommended,
  recommendedConfig,
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
  },
];