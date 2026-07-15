/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Native-module mocks live here; loaded after the test framework. Added in
  // Phase 2 — Tier 1 pure tests need no native mocks.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // First match wins. svg/css rules MUST precede BOTH `@/assets` and `@/`,
    // else `@/assets/icon.svg` resolves to the real (untransformable) asset and
    // `@/global.css` resolves to the real CSS file jest can't parse.
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Mirrors jest-expo's default (bare prefixes, no trailing slash) so the broad
  // `react-native` / `@react-native` prefixes still cover reanimated, worklets,
  // gesture-handler, vision-camera, keyboard-controller, and @react-native-firebase.
  // Only extra needed is @notifee (its own scope). Keep the reanimated/plugin entry.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community' +
      '|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation' +
      '|@sentry/react-native|native-base|@notifee))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
