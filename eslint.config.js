// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Test files legitimately reference hook names outside components (renderHook,
    // mock capture) and must place `jest.mock(...)` above imports (it hoists).
    files: ["**/*.test.{ts,tsx}", "**/__mocks__/**", "jest.setup.js"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "import/first": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
