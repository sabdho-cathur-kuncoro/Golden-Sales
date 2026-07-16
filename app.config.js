import "dotenv/config";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
// Notifee ships its `core` AAR as a bundled local maven repo, not on any
// public registry. Its own gradle self-injection of this repo doesn't reach
// the :app classpath under Expo CNG, so declare it explicitly. Path resolved
// at prebuild time = portable across machines/CI (no hardcoded absolute path).
const notifeeAndroidLibs = path.join(
  path.dirname(require.resolve("@notifee/react-native/package.json")),
  "android/libs"
);

// Writes res/drawable/ic_notification.xml on every prebuild (survives --clean).
const withNotificationIcon = require("./plugins/withNotificationIcon");
const withAndroidSigning = require("./plugins/withAndroidSigning");

export default {
  expo: {
    name: "Sales - Belanja Yuk!",
    slug: "golden-sales",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "goldensales",
    userInterfaceStyle: "automatic",
    ios: {
      entitlements: {
        "aps-environment": "production",
      },
      infoPlist: {
        NSCameraUsageDescription:
          "Kamera digunakan untuk scan QR atau Barcode produk",
        // Wake app for FCM background/killed data messages (push req #1)
        UIBackgroundModes: ["remote-notification"],
      },
      icon: "./assets/icon.png",
      bundleIdentifier: "com.modoto.goldensales",
      // Drop GoogleService-Info.plist in ./config (from Firebase console) before iOS build
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST ??
        "./config/GoogleService-Info.plist",
    },
    android: {
      permissions: ["CAMERA", "ACCESS_FINE_LOCATION", "POST_NOTIFICATIONS"],
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        backgroundImage: "./assets/icon.png",
      },
      predictiveBackGestureEnabled: false,
      package: "com.modoto.goldensales",
      // Drop google-services.json in ./config (from Firebase console) before Android build
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./config/google-services.json",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      withNotificationIcon,
      withAndroidSigning,
      "expo-router",
      [
        "react-native-permissions/app.plugin.js",
        {
          iosPermissions: ["Notifications"],
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#E6F4FE",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 1,
          },
        },
      ],
      [
        "react-native-vision-camera",
        {
          enableCodeScanner: true,
          cameraPermissionText: "Allow $(PRODUCT_NAME) to access your camera.",
          enableMicrophonePermission: false,
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#1C0867",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 1,
          },
        },
      ],
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access your photos to attach a review image.",
          colors: {
            cropToolbarColor: "#000000",
          },
          dark: {
            colors: {
              cropToolbarColor: "#000000",
            },
          },
        },
      ],
      [
        "expo-sqlite",
        {
          enableFTS: true,
          useSQLCipher: false,
          android: {
            enableFTS: false,
            useSQLCipher: false,
          },
          ios: {
            customBuildFlags: [
              "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1",
            ],
          },
        },
      ],
      // Push: FCM transport (@react-native-firebase) + notifee display layer.
      // expo-notifications intentionally removed — token-only, no FCM topic API.
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      [
        "expo-build-properties",
        {
          // RN Firebase iOS requires static frameworks to compile. Under RN
          // 0.83's prebuilt React core, each RNFB pod must ALSO be force-linked
          // static — else its Obj-C files import React headers as clang modules,
          // hiding the RCT_EXPORT_METHOD macros (implicit-int / "must be imported
          // from module" build errors). List every @react-native-firebase pod used.
          ios: {
            useFrameworks: "static",
            forceStaticLinking: ["RNFBApp", "RNFBMessaging"],
          },
          // Notifee `core` AAR lives in a bundled local maven repo (see above).
          android: { extraMavenRepos: [notifeeAndroidLibs] },
        },
      ],
      "expo-sharing",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    // Tempat menampung seluruh variabel .env kustom Anda
    extra: {
      BEARER: process.env.PUBLIC_BEARER,
    },
  },
};
