import { Linking } from "react-native";
import { ANDROID_PACKAGE, APPSTORE_APP_ID } from "../src/constants/version";
import { isIOS } from "./platform";

// Open the store listing for this app. Tries the native store deep link first
// (opens the store app directly), falls back to the https listing.
export async function openAppStore() {
  const deep = isIOS
    ? `itms-apps://apps.apple.com/app/id${APPSTORE_APP_ID}`
    : `market://details?id=${ANDROID_PACKAGE}`;
  const web = isIOS
    ? `https://apps.apple.com/app/id${APPSTORE_APP_ID}`
    : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

  try {
    await Linking.openURL(deep);
  } catch {
    await Linking.openURL(web).catch(() => {});
  }
}
