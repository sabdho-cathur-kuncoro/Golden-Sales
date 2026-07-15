const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  config.transformer.babelTransformerPath = require.resolve(
    "react-native-svg-transformer"
  );

  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  );
  config.resolver.sourceExts.push("svg");

  // Test/spec files are colocated under `src/app`, which is Expo Router's route
  // root. Router bundles every file there via `require.context`, so a colocated
  // `*.test.tsx` drags @testing-library/react-native (which imports Node's
  // `console`) into the app bundle and fails resolution. Block test/spec files
  // from Metro so they stay out of routing. Jest uses jest-expo (not Metro), so
  // it still discovers and runs them.
  const existingBlockList = Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : [];
  config.resolver.blockList = [
    ...existingBlockList,
    /.*\.(test|spec)\.[jt]sx?$/,
  ];

  return config;
})();
