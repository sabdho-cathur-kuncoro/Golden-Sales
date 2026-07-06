const {
  withAppBuildGradle,
  CodeGenerator: { mergeContents },
} = require("@expo/config-plugins");

/**
 * Injects Android release-signing config into app/build.gradle.
 *
 * Uses `mergeContents` (tag-anchored, idempotent, hash-tracked) instead of raw
 * string replacement so repeated `expo prebuild` runs do not duplicate config,
 * and template drift fails loudly (mergeContents throws on missing anchor)
 * instead of silently producing an unsigned/mis-signed build.
 *
 * Keystore is read from the repo-local config/keystore.properties (storeFile /
 * storePassword / keyAlias / keyPassword), resolved at build time relative to
 * the generated android/ dir so no per-machine ~/config setup is needed.
 */
module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error(
        `withAndroidSigning: expected a Groovy build.gradle, found "${config.modResults.language}"`
      );
    }

    let gradle = config.modResults.contents;

    // 1. Groovy imports at the very top (before the first `apply plugin`).
    gradle = mergeContents({
      tag: "android-signing-imports",
      src: gradle,
      newSrc: [
        "import java.util.Properties",
        "import java.io.FileInputStream",
      ].join("\n"),
      anchor: /^apply plugin/m,
      offset: 0,
      comment: "//",
    }).contents;

    // 2. keystoreProperties definition, just above the `android { }` block.
    gradle = mergeContents({
      tag: "android-signing-keystore-props",
      src: gradle,
      newSrc: [
        "def keystoreProperties = new Properties()",
        'def keystorePropertiesFile = new File(rootProject.projectDir, "../config/keystore.properties")',
        "if (keystorePropertiesFile.exists()) {",
        "    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))",
        "}",
      ].join("\n"),
      anchor: /^android\s*\{/m,
      offset: 0,
      comment: "//",
    }).contents;

    // 3. `release` entry inside the existing `signingConfigs { }` block.
    gradle = mergeContents({
      tag: "android-signing-release-config",
      src: gradle,
      newSrc: [
        "        release {",
        "            if (keystorePropertiesFile.exists()) {",
        '                storeFile file(keystoreProperties["storeFile"])',
        '                storePassword keystoreProperties["storePassword"]',
        '                keyAlias keystoreProperties["keyAlias"]',
        '                keyPassword keystoreProperties["keyPassword"]',
        "            }",
        "        }",
      ].join("\n"),
      anchor: /signingConfigs\s*\{/,
      offset: 1,
      comment: "        //",
    }).contents;

    // 4. Point the release buildType at signingConfigs.release. mergeContents
    // inserts blocks, so it cannot rewrite this in-place token — a scoped regex
    // does it. Naturally idempotent: the `buildTypes {` anchor skips the
    // signingConfigs block above, and after the swap no `.debug` remains forward
    // of the buildTypes `release {`, so re-running is a no-op.
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.)debug/,
      "$1release"
    );

    config.modResults.contents = gradle;
    return config;
  });
};
