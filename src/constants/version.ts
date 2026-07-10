import { isIOS } from "../../utils/platform";

// Numeric App Store id for itms-apps deep link. PLACEHOLDER — replace with the
// real id from App Store Connect before an iOS release.
export const APPSTORE_APP_ID = "000000000";

// Android applicationId (app.config.js `android.package`).
export const ANDROID_PACKAGE = "com.modoto.goldensales";

// `Field_key` passed to GET /getVersion. Must match the backend `version_name`
// row for THIS app + platform (confirm exact keys with backend).
export const VERSION_KEY = isIOS ? "sales_ios" : "sales_android";

// Numeric, dot-separated version compare. Pads the shorter side with zeros so
// "2.0" === "2.0.0". Segment compare (not lexical) → "1.10.0" > "1.2.0".
// Returns -1 (a<b), 0 (a==b), 1 (a>b).
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((s) => parseInt(s, 10) || 0);
  const pb = b.split(".").map((s) => parseInt(s, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

// True only when both versions parse and installed < remote. Malformed/missing
// input → false (fail open — never block on a bad check).
export function isUpdateRequired(installed?: string, remote?: string): boolean {
  if (!installed || !remote) return false;
  if (!/^\d+(\.\d+)*$/.test(installed) || !/^\d+(\.\d+)*$/.test(remote)) {
    return false;
  }
  return compareVersions(installed, remote) < 0;
}
