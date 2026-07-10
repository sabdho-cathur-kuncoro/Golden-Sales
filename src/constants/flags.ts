/**
 * Build-time feature flags.
 *
 * `ENABLE_DEV_TOOLS` — gates developer-only tooling (e.g. the in-app network
 * logger). True during Metro/dev (`__DEV__`) and in QA release builds that set
 * `EXPO_PUBLIC_ENABLE_DEV_TOOLS=true`; false in production builds where the var
 * is unset/`false` (the value is inlined at bundle time).
 */
export const ENABLE_DEV_TOOLS =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_DEV_TOOLS === "true";
